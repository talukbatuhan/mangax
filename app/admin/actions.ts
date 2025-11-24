"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";

// --- 1. YENİ MANGA OLUŞTURMA ---
export async function createMangaAction(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const desc = formData.get("desc") as string;
  const author = formData.get("author") as string;
  const coverFile = formData.get("cover") as File;
  const genresRaw = formData.get("genres") as string;
  const genres = genresRaw ? genresRaw.split(",").map((g) => g.trim()) : [];

  if (!coverFile || !slug) return { success: false, error: "Eksik bilgi" };

  const cleanFileName = coverFile.name.replace(/[^a-zA-Z0-9.]/g, "_");
  const fileName = `cover-${Date.now()}-${cleanFileName}`;

  const { error: uploadError } = await supabase.storage
    .from("covers")
    .upload(fileName, coverFile);

  if (uploadError) return { success: false, error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("covers").getPublicUrl(fileName);

  const { error: dbError } = await supabase.from("mangas").insert({
    title,
    slug,
    description: desc,
    author,
    cover_url: publicUrl,
    genres,
  });

  if (dbError) return { success: false, error: dbError.message };

  revalidatePath("/admin/mangas");
  revalidatePath("/");
  return { success: true };
}

// --- 2. BÖLÜM YÜKLEME ---
export async function uploadChapterAction(formData: FormData) {
  const supabase = await createClient();

  const mangaId = formData.get("mangaId") as string;
  const chapterNum = formData.get("chapterNum") as string;
  const title = formData.get("title") as string;
  const files = formData.getAll("pages") as File[];

  if (!files || files.length === 0)
    return { success: false, error: "Dosya seçilmedi" };

  files.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, {
      numeric: true,
      sensitivity: "base",
    })
  );

  const uploadPromises = files.map(async (file, index) => {
    const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const path = `${mangaId}/${chapterNum}/${Date.now()}-${index}-${cleanName}`;

    const { error } = await supabase.storage
      .from("chapters")
      .upload(path, file);
    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("chapters").getPublicUrl(path);
    return publicUrl;
  });

  try {
    const newImageUrls = await Promise.all(uploadPromises);

    const { data: existingChapter } = await supabase
      .from("chapters")
      .select("id, images")
      .eq("manga_id", mangaId)
      .eq("chapter_number", Number(chapterNum))
      .single();

    if (existingChapter) {
      const combinedImages = [
        ...(existingChapter.images || []),
        ...newImageUrls,
      ];
      await supabase
        .from("chapters")
        .update({ images: combinedImages, title: title || undefined })
        .eq("id", existingChapter.id);
    } else {
      await supabase.from("chapters").insert({
        manga_id: mangaId,
        chapter_number: Number(chapterNum),
        title: title,
        images: newImageUrls,
      });
    }

    revalidatePath(`/admin/mangas/${mangaId}`);
    return { success: true };
  } catch (error) {
    // DÜZELTME: Güvenli hata kontrolü
    const errorMessage =
      error instanceof Error ? error.message : "Bir hata oluştu";
    return { success: false, error: errorMessage };
  }
}

// --- 3. BÖLÜM SİLME ---
export async function deleteChapterAction(chapterId: string) {
  const supabase = await createClient();
  await supabase.from("chapters").delete().eq("id", chapterId);
  revalidatePath("/admin/mangas/[id]");
}

// --- 4. MANGAYI SİLME ---
export async function deleteManga(id: string | number) {
  const supabase = await createClient();
  await supabase.from("mangas").delete().eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/");
}

// --- 5. TÜR GÜNCELLEME ---
export async function updateMangaGenres(mangaId: string, newGenres: string[]) {
  const supabase = await createClient();
  await supabase.from("mangas").update({ genres: newGenres }).eq("id", mangaId);
  revalidatePath("/admin");
  revalidatePath("/");
}

// --- 6. SLIDER (VİTRİN) YÖNETİMİ [EKSİK OLAN BUYDU] ---
export async function toggleSlider(mangaId: string) {
  const supabase = await createClient();

  // Önce var mı diye bak
  const { data } = await supabase
    .from("slider_items")
    .select("*")
    .eq("manga_id", mangaId)
    .single();

  if (data) {
    // Varsa Sil
    await supabase.from("slider_items").delete().eq("manga_id", mangaId);
    revalidatePath("/admin/appearance");
    return { status: "removed" };
  } else {
    // Yoksa Ekle
    await supabase.from("slider_items").insert({ manga_id: mangaId });
    revalidatePath("/admin/appearance");
    return { status: "added" };
  }
}

export async function deleteCommentAction(commentId: number) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) throw new Error("Yorum silinemedi: " + error.message);

  revalidatePath("/admin/comments"); // Listeyi yenile
  // Ayrıca manga detay sayfasındaki yorumları da yenilememiz iyi olur ama dinamik olduğu için zor.
  // Admin panelini yenilemek yeterli.
}

export async function deleteUserAction(userId: string) {
  // Not: 'createClient' yerine 'supabaseAdmin' kullanıyoruz.
  
  // 1. auth.users tablosundan sil
  // (Bu işlem 'Cascade' sayesinde profiles, comments, favorites her şeyi otomatik siler)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    console.error("Silme hatası:", error);
    throw new Error("Kullanıcı silinemedi: " + error.message);
  }

  revalidatePath("/admin/users");
}

export async function addGenre(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  
  if (!name) return;

  await supabase.from("genres").insert({ name });
  revalidatePath("/admin/genres");
}

// TÜR SİL
export async function deleteGenre(id: number) {
  const supabase = await createClient();
  await supabase.from("genres").delete().eq("id", id);
  revalidatePath("/admin/genres");
}

export async function getChaptersAction(mangaId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("manga_id", mangaId)
    .order("chapter_number", { ascending: true }); 

  if (error) {
    console.error("Bölüm çekme hatası:", error);
    return [];
  }
  return data;
}
