"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";

// --- 1. YENİ MANGA OLUŞTURMA ---
export async function createMangaAction(formData: FormData) {
  const supabase = supabaseAdmin;

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

// --- 2. BÖLÜM RESİMLERİNİ KAYDETME ---
export async function saveChapterImagesAction(
  mangaId: string,
  chapterNum: number,
  title: string,
  imageUrls: string[]
) {
  const supabase = supabaseAdmin;

  try {
    const { data: existingChapter } = await supabase
      .from("chapters")
      .select("id, images")
      .eq("manga_id", mangaId)
      .eq("chapter_number", chapterNum)
      .single();

    if (existingChapter) {
      const combinedImages = [
        ...(existingChapter.images || []),
        ...imageUrls,
      ];
      
      const { error } = await supabase
        .from("chapters")
        .update({ 
           images: combinedImages, 
           title: title || undefined,
           // updated_at sütunu DB'de yoksa kapalı kalmalı
        })
        .eq("id", existingChapter.id);
        
      if (error) throw error;

    } else {
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
  revalidatePath("/admin/mangas");
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

// --- 7. MANGA KAPAK & DETAY GÜNCELLEME (İSİM DAHİL) ---
export async function updateMangaDetailsAction(formData: FormData) {
  const supabase = supabaseAdmin;

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const author = formData.get("author") as string;
  const description = formData.get("description") as string;
  const coverFile = formData.get("cover") as File;

  if (!id || !title || !slug) {
    return { success: false, error: "Başlık ve URL zorunludur." };
  }

  // Tip güvenliği için interface tanımı
  type UpdateData = {
    title: string;
    slug: string;
    author: string | null;
    description: string | null;
    cover_url?: string;
  };

  const updateData: UpdateData = {
    title,
    slug,
    author,
    description,
  };

  // Eğer yeni bir kapak resmi seçildiyse yükle ve güncelle
  if (coverFile && coverFile.size > 0) {
    const cleanFileName = coverFile.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const fileName = `cover-${Date.now()}-${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("covers")
      .upload(fileName, coverFile, { upsert: true });
    console.error("Kapak Yükleme Hatası:", uploadError);
    if (uploadError) return { success: false, error: "Kapak yüklenemedi: " + uploadError.message };

    const { data: { publicUrl } } = supabase.storage.from("covers").getPublicUrl(fileName);
    updateData.cover_url = publicUrl;
  }

  const { error } = await supabase
    .from("mangas")
    .update(updateData)
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/mangas/${id}`);
  revalidatePath("/admin/mangas");
  revalidatePath("/");
  
  return { success: true };
}

// --- 8. BÖLÜM SAYFASI SİLME ---
export async function deletePageAction(chapterId: string, pageIndex: number) {
  const supabase = await createClient();

  const { data: chapter } = await supabase
    .from("chapters")
    .select("images")
    .eq("id", chapterId)
    .single();

  if (!chapter || !chapter.images) return { success: false, error: "Bölüm bulunamadı." };

  const newImages = [...chapter.images];
  newImages.splice(pageIndex, 1);

  const { error } = await supabase
    .from("chapters")
    .update({ images: newImages })
    .eq("id", chapterId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/mangas"); 
  return { success: true };
}

// --- 9. BÖLÜM SAYFASI DEĞİŞTİRME ---
export async function replacePageAction(formData: FormData) {
  const supabase = supabaseAdmin;

  const chapterId = formData.get("chapterId") as string;
  const pageIndex = Number(formData.get("pageIndex"));
  const newFile = formData.get("newFile") as File;
  const mangaId = formData.get("mangaId") as string; 

  if (!newFile || !chapterId) return { success: false, error: "Dosya eksik." };

  const { data: chapter } = await supabase
    .from("chapters")
    .select("images, chapter_number")
    .eq("id", chapterId)
    .single();

  if (!chapter) return { success: false, error: "Bölüm bulunamadı." };

  const cleanName = newFile.name.replace(/[^a-zA-Z0-9.]/g, "_");
  const path = `${mangaId}/${chapter.chapter_number}/UPDATE-${Date.now()}-${pageIndex}-${cleanName}`;

  const { error: uploadError } = await supabase.storage
    .from("chapters")
    .upload(path, newFile);

  if (uploadError) return { success: false, error: "Yükleme hatası: " + uploadError.message };

  const { data: { publicUrl } } = supabase.storage.from("chapters").getPublicUrl(path);

  const newImages = [...(chapter.images || [])];
  newImages[pageIndex] = publicUrl; 

  const { error: dbError } = await supabase
    .from("chapters")
    .update({ images: newImages })
    .eq("id", chapterId);

  if (dbError) return { success: false, error: dbError.message };

  revalidatePath(`/admin/mangas/${mangaId}`);
  return { success: true };
}

// --- DİĞER YARDIMCI ACTIONLAR ---

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
    })
    .eq("id", 1); 

  if (error) return { success: false, error: error.message };

  revalidatePath("/"); 
  return { success: true };
}

// --- 10. BÖLÜM BAŞLIĞI GÜNCELLEME ---
export async function updateChapterTitleAction(chapterId: string, title: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("chapters")
    .update({ title })
    .eq("id", chapterId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/mangas");
  return { success: true };
}