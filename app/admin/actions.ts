"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function deleteManga(id: string | number) {
  // 1. Önce veritabanından silelim
  // Supabase'de "Cascade Delete" ayarı genelde varsayılan değildir ama
  // biz kodu yazarken Chapters tablosunda "on delete cascade" dediysek
  // Mangayı silince bölümler de otomatik silinir.
  
  const { error } = await supabase
    .from("mangas")
    .delete()
    .eq("id", id);

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