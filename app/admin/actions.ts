"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";

// --- 1. YENİ MANGA OLUŞTURMA ---
export async function createMangaAction(formData: FormData) {
  const supabase = supabaseAdmin; // Admin yetkisiyle işlem

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const desc = formData.get("desc") as string;
  const author = formData.get("author") as string;
  const coverFile = formData.get("cover") as File;

  const selectedGenresJson = formData.get("selected_genres") as string;
  const genreIds: number[] = selectedGenresJson ? JSON.parse(selectedGenresJson) : [];

  if (!coverFile || !slug) return { success: false, error: "Eksik bilgi" };

  const cleanFileName = coverFile.name.replace(/[^a-zA-Z0-9.]/g, "_");
  const fileName = `cover-${Date.now()}-${cleanFileName}`;

  const { error: uploadError } = await supabase.storage
    .from("covers")
    .upload(fileName, coverFile, {
      contentType: coverFile.type,
      upsert: true
    });

  if (uploadError) return { success: false, error: "Kapak yüklenemedi: " + uploadError.message };

  const { data: { publicUrl } } = supabase.storage.from("covers").getPublicUrl(fileName);

  const { data: manga, error: dbError } = await supabase
    .from("mangas")
    .insert({
      title,
      slug,
      description: desc,
      author,
      cover_url: publicUrl,
    })
    .select("id")
    .single();

  if (dbError) return { success: false, error: dbError.message };

  if (genreIds.length > 0 && manga) {
    const pivotData = genreIds.map((gId) => ({
      manga_id: manga.id,
      genre_id: gId,
    }));

    const { error: pivotError } = await supabase
      .from("manga_genres")
      .insert(pivotData);

    if (pivotError) console.error("Türler ilişkilendirilemedi:", pivotError);
  }

  revalidatePath("/admin/mangas");
  revalidatePath("/");
  return { success: true };
}

// --- 2. BÖLÜM RESİMLERİNİ KAYDETME (YENİ FONKSİYON BURASI) ---
// Bu fonksiyon artık dosya değil, Client tarafında yüklenmiş resimlerin URL'lerini alır.
export async function saveChapterImagesAction(
  mangaId: string,
  chapterNum: number,
  title: string,
  imageUrls: string[]
) {
  const supabase = supabaseAdmin; // Admin yetkisi

  try {
    // 1. Mevcut bölümü kontrol et
    const { data: existingChapter } = await supabase
      .from("chapters")
      .select("id, images")
      .eq("manga_id", mangaId)
      .eq("chapter_number", chapterNum)
      .single();

    if (existingChapter) {
      // Varsa resimleri listenin sonuna ekle (Append)
      const combinedImages = [
        ...(existingChapter.images || []),
        ...imageUrls,
      ];
      
      const { error } = await supabase
        .from("chapters")
        .update({ 
           images: combinedImages, 
           title: title || undefined,
           updated_at: new Date().toISOString()
        })
        .eq("id", existingChapter.id);
        
      if (error) throw error;

    } else {
      // Yoksa yeni oluştur
      const { error } = await supabase.from("chapters").insert({
        manga_id: mangaId,
        chapter_number: chapterNum,
        title: title,
        images: imageUrls,
      });

      if (error) throw error;
    }

    revalidatePath(`/admin/mangas/${mangaId}`);
    return { success: true };

  } catch (error) {
    console.error("DB Kayıt hatası:", error);
    const errorMessage = error instanceof Error ? error.message : "Veritabanına kaydedilemedi.";
    return { success: false, error: errorMessage };
  }
}

// --- 3. BÖLÜM SİLME ---
export async function deleteChapterAction(chapterId: string) {
  const supabase = await createClient();
  await supabase.from("chapters").delete().eq("id", chapterId);
}

// --- 4. MANGAYI SİLME ---
export async function deleteManga(id: string | number) {
  const supabase = await createClient();
  await supabase.from("mangas").delete().eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/");
}

// --- 5. TÜR GÜNCELLEME ---
export async function updateMangaGenresAction(mangaId: string, newGenreIds: number[]) {
  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("manga_genres")
    .delete()
    .eq("manga_id", mangaId);

  if (deleteError) throw new Error("Eski türler silinemedi");

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

// --- 6. SLIDER YÖNETİMİ ---
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

// --- DİĞERLERİ ---
export async function deleteCommentAction(commentId: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) throw new Error("Yorum silinemedi: " + error.message);
  revalidatePath("/admin/comments");
}

export async function deleteUserAction(userId: string) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) {
    console.error("Silme hatası:", error);
    throw new Error("Kullanıcı silinemedi: " + error.message);
  }
  revalidatePath("/admin/users");
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
  const maintenance_mode = formData.get("maintenance_mode") === "on";
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
    .eq("id", 1); 

  if (error) return { success: false, error: error.message };

  revalidatePath("/"); 
  return { success: true };
}