// types/index.ts

export interface Manga {
  id: string; // UUID olduğu için string
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  author: string | null;
  created_at: string;
  
  // GÜNCELLENEN ALANLAR
  genres: string[] | null;     // Türler listesi (string dizisi veya null)
  views: number | null;        // Okunma sayısı
  rating_avg: number | null;   // Ortalama puan (8.5 gibi)
  rating_count: number | null; // Kaç kişi puan verdi
}

export interface Chapter {
  id: string;
  manga_id: string;
  chapter_number: number;
  title: string | null;
  images: string[];
  created_at: string;
}


export interface Comment {
  id: number;            // Değişti: string -> number
  content: string;
  created_at: string;
  user_id: string;       // Supabase Auth ID'leri her zaman string (UUID) kalır
  manga_id: number;      // Değişti: string -> number
  parent_id: number | null; // Değişti: string -> number
  user: {
    username: string;
    avatar_url: string | null;
  };
  // Frontend'de cevapları gruplamak için kullanacağımız alan
  replies?: Comment[]; 
}