"use server";

import { createClient } from "@/lib/supabase/server"; // Yeni oluşturduğumuz dosya
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  // Çıkış yapınca anasayfaya at
  redirect("/login");
}

export async function updateProfile(userId: string, avatarUrl: string) {
  const supabase = await createClient();
  
  // upsert: Varsa güncelle, yoksa yeni oluştur demektir.
  const { error } = await supabase
    .from("profiles")
    .upsert({ 
      id: userId, 
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString()
    });

  if (error) throw new Error("Profil güncellenemedi");
  
  revalidatePath("/"); // Navbar'daki resim güncellensin
}

// ... diğer importlar ...

// OKUMA GEÇMİŞİNİ KAYDET / GÜNCELLE
export async function updateReadingProgress(mangaId: string, chapterId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return; // Giriş yapmamışsa kaydetme

  // Upsert: Varsa güncelle (tarihi ve bölümü değiştir), yoksa yeni ekle
  await supabase
    .from("reading_history")
    .upsert({
      user_id: user.id,
      manga_id: mangaId,
      chapter_id: chapterId,
      last_read_at: new Date().toISOString()
    }, { onConflict: 'user_id, manga_id' });
}