"use server";

import { createClient } from "@/lib/supabase/server"; // Yeni oluşturduğumuz dosya
import { revalidatePath } from "next/cache";

export async function toggleFavorite(mangaId: string, userId: string) {
  // 1. Sunucu tarafı için güvenli Supabase istemcisini oluştur
  const supabase = await createClient();

  // 2. Önce var mı diye bak
  const { data } = await supabase
    .from("favorites")
    .select("*")
    .eq("manga_id", mangaId)
    .eq("user_id", userId)
    .single();

  if (data) {
    // Varsa SİL (Favoriden Çıkar)
    await supabase.from("favorites").delete().eq("id", data.id);
    // Sayfayı yenilemeye gerek yok, client tarafında state güncelliyoruz zaten
    return false; // Artık favori değil
  } else {
    // Yoksa EKLE
    await supabase.from("favorites").insert({ manga_id: mangaId, user_id: userId });
    return true; // Artık favori
  }
}