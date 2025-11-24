"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function deleteManga(id: string | number) {
  // 1. Önce veritabanından silelim
  // Supabase'de "Cascade Delete" ayarı genelde varsayılan değildir ama
  // biz kodu yazarken Chapters tablosunda "on delete cascade" dediysek
  // Mangayı silince bölümler de otomatik silinir.

  const { error } = await supabase.from("mangas").delete().eq("id", id);

  if (error) {
    throw new Error("Silme işlemi başarısız: " + error.message);
  }

  // Not: Resim dosyaları Storage'da (Depoda) kalmaya devam eder.
  // Storage'dan klasör silmek biraz daha karmaşık bir işlemdir,
  // şimdilik sadece veritabanı temizliği yapıyoruz.

  // 2. Sayfayı yenile ki liste güncellensin
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function getChapters(mangaId: string) {
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("manga_id", mangaId)
    .order("chapter_number", { ascending: true }); // Bölüm 1, 2, 3 diye sırala

  if (error) return [];
  return data;
}

// 2. Tek Bir Bölümü Sil
export async function deleteChapter(chapterId: string) {
  const { error } = await supabase
    .from("chapters")
    .delete()
    .eq("id", chapterId);

  if (error) throw new Error("Bölüm silinemedi");

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function updateMangaGenres(mangaId: string, newGenres: string[]) {
  const { error } = await supabase
    .from("mangas")
    .update({ genres: newGenres })
    .eq("id", mangaId);

  if (error) throw new Error("Türler güncellenemedi");

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function createMangaAction(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const desc = formData.get("desc") as string;
  const author = formData.get("author") as string;
  const coverFile = formData.get("cover") as File;
  const genresRaw = formData.get("genres") as string;
  const genres = genresRaw ? genresRaw.split(",").map((g) => g.trim()) : [];

  if (!coverFile || !slug) throw new Error("Eksik bilgi");

  // 1. Kapak Yükle
  const cleanFileName = coverFile.name.replace(/[^a-zA-Z0-9.]/g, "_");
  const fileName = `cover-${Date.now()}-${cleanFileName}`;

  const { error: uploadError } = await supabase.storage
    .from("covers")
    .upload(fileName, coverFile);

  if (uploadError) throw new Error("Kapak yüklenemedi: " + uploadError.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from("covers").getPublicUrl(fileName);

  // 2. DB'ye Yaz
  const { error: dbError } = await supabase.from("mangas").insert({
    title,
    slug,
    description: desc,
    author,
    cover_url: publicUrl,
    genres,
  });

  if (dbError) throw new Error("Veritabanı hatası: " + dbError.message);

  // --- ÖNEMLİ DEĞİŞİKLİK BURADA ---
  // İşlemler bittikten sonra sayfaları yenile
  revalidatePath("/admin/mangas");
  revalidatePath("/");

  // Redirect işlemini burada yapmak yerine return ile bitiriyoruz.
  // Yönlendirmeyi Client tarafında (page.tsx içinde) yapacağız.
  return { success: true };
}

export async function uploadChapterAction(formData: FormData) {
  const supabase = await createClient();

  const mangaId = formData.get("mangaId") as string;
  const chapterNum = formData.get("chapterNum") as string;
  const title = formData.get("title") as string;
  const files = formData.getAll("pages") as File[];

  if (!files || files.length === 0)
    return { success: false, error: "Dosya seçilmedi" };

  // 1. Sıralama
  files.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, {
      numeric: true,
      sensitivity: "base",
    })
  );

  // 2. Yükleme
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

    // 3. Veritabanı (Ekle veya Güncelle)
    const { data: existingChapter } = await supabase
      .from("chapters")
      .select("id, images")
      .eq("manga_id", mangaId)
      .eq("chapter_number", Number(chapterNum))
      .single();

    if (existingChapter) {
      // Append (Üzerine Ekle)
      const combinedImages = [
        ...(existingChapter.images || []),
        ...newImageUrls,
      ];
      await supabase
        .from("chapters")
        .update({ images: combinedImages, title: title || undefined })
        .eq("id", existingChapter.id);
    } else {
      // Yeni Kayıt
      await supabase.from("chapters").insert({
        manga_id: mangaId,
        chapter_number: Number(chapterNum),
        title: title,
        images: newImageUrls,
      });
    }

    const { data: fans } = await supabase
      .from("favorites")
      .select("user_id")
      .eq("manga_id", mangaId);

    if (fans && fans.length > 0) {
      // 2. Her fan için bir bildirim objesi oluştur
      const notifications = fans.map((fan) => ({
        user_id: fan.user_id,
        title: "Yeni Bölüm Geldi! 🔥",
        message: `${title || "Yeni Bölüm"} yayınlandı. Hemen oku!`,
        link: `/manga/${mangaId}/${chapterNum}`, // Okuma sayfasına git
      }));

      // 3. Toplu halde bildirimleri kaydet
      await supabase.from("notifications").insert(notifications);
    }
    revalidatePath(`/admin/mangas/${mangaId}`);
    return { success: true };
  } catch (error) {
    // Hatayı güvenli bir şekilde string mesaja çeviriyoruz
    const errorMessage =
      error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu";
    return { success: false, error: errorMessage };
  }
}

// BÖLÜM SİLME
export async function deleteChapterAction(chapterId: string) {
  const supabase = await createClient();
  await supabase.from("chapters").delete().eq("id", chapterId);
  revalidatePath("/admin/mangas/[id]"); // Dinamik path'i tetikle
}
