"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";

// --- 1. YENİ MANGA OLUŞTURMA ---
export async function createMangaAction(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const desc = formData.get("desc") as string;
  const author = formData.get("author") as string;
  const coverFile = formData.get("cover") as File;

  // Frontend'den gelen JSON string (örn: "[1, 5, 8]")
  const selectedGenresJson = formData.get("selected_genres") as string;
  const genreIds: number[] = selectedGenresJson ? JSON.parse(selectedGenresJson) : [];

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

  // ADIM 1: Mangayı oluştur
  const { data: manga, error: dbError } = await supabase
    .from("mangas")
    .insert({
      title,
      slug,
      description: desc,
      author,
      cover_url: publicUrl,
    })
    .select("id") // ID'yi alıyoruz
    .single();

  if (dbError) return { success: false, error: dbError.message };

  // ADIM 2: Türleri Ara Tabloya (manga_genres) Ekle
  if (genreIds.length > 0 && manga) {
    const pivotData = genreIds.map((gId) => ({
      manga_id: manga.id, // UUID
      genre_id: gId,      // BigInt
    }));

    const { error: pivotError } = await supabase
      .from("manga_genres")
      .insert(pivotData);

    if (pivotError) {
        console.error("Türler ilişkilendirilemedi:", pivotError);
    }
  }

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

// --- 5. TÜR GÜNCELLEME (TEK VE TEMİZ FONKSİYON) ---
// GenreEditor.tsx bu fonksiyonu kullanacak
export async function updateMangaGenresAction(mangaId: string, newGenreIds: number[]) {
  const supabase = await createClient();

  // 1. Eski ilişkileri sil
  const { error: deleteError } = await supabase
    .from("manga_genres")
    .delete()
    .eq("manga_id", mangaId);

  if (deleteError) throw new Error("Eski türler silinemedi");

  // 2. Yeni ilişkileri ekle
  if (newGenreIds.length > 0) {
    const insertData = newGenreIds.map((gId) => ({
      manga_id: mangaId,
      genre_id: gId,
    }));

    const { error: insertError } = await supabase
      .from("manga_genres")
      .insert(insertData);

    if (insertError) throw new Error("Yeni türler eklenemedi");
  }

  revalidatePath(`/admin/mangas/${mangaId}`);
  revalidatePath("/admin/mangas");
}

// --- 6. SLIDER (VİTRİN) YÖNETİMİ ---
export async function toggleSlider(mangaId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("slider_items")
    .select("*")
    .eq("manga_id", mangaId)
    .single();

  if (data) {
    await supabase.from("slider_items").delete().eq("manga_id", mangaId);
    revalidatePath("/admin/appearance");
    return { status: "removed" };
  } else {
    await supabase.from("slider_items").insert({ manga_id: mangaId });
    revalidatePath("/admin/appearance");
    return { status: "added" };
  }
}

// --- YORUM SİLME ---
export async function deleteCommentAction(commentId: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("comments").delete().eq("id", commentId);

  if (error) throw new Error("Yorum silinemedi: " + error.message);
  revalidatePath("/admin/comments");
}

// --- KULLANICI SİLME ---
export async function deleteUserAction(userId: string) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) {
    console.error("Silme hatası:", error);
    throw new Error("Kullanıcı silinemedi: " + error.message);
  }
  revalidatePath("/admin/users");
}

// --- BÖLÜMLERİ GETİRME ---
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

// --- TÜR (GENRE) YÖNETİMİ ---
export async function addGenreAction(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;

  if (!name.trim()) return;

  const { error } = await supabase.from("genres").insert({ name: name.trim() });
  if (error) throw new Error("Tür eklenemedi: " + error.message);
  revalidatePath("/admin/genres");
}

export async function deleteGenreAction(id: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("genres").delete().eq("id", id);
  if (error) throw new Error("Tür silinemedi");
  revalidatePath("/admin/genres");
}

export async function updateSettingsAction(formData: FormData) {
  const supabase = await createClient();

  const site_name = formData.get("site_name") as string;
  const site_description = formData.get("site_description") as string;
  const maintenance_mode = formData.get("maintenance_mode") === "on"; // Checkbox kontrolü
  const announcement_text = formData.get("announcement_text") as string;
  const announcement_active = formData.get("announcement_active") === "on";

  const { error } = await supabase
    .from("site_settings")
    .update({
      site_name,
      site_description,
      maintenance_mode,
      announcement_text,
      announcement_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1); // Sadece 1 numaralı satırı güncelliyoruz

  if (error) {
     return { success: false, error: error.message };
  }

  revalidatePath("/"); // Tüm siteyi yenile ki başlık değişsin
  return { success: true };
}