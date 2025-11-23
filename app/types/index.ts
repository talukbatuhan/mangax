export interface Manga {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  author: string | null;
  created_at: string;
  genres: string[] | null; 
  views: number;
}

export interface Chapter {
  id: string;
  manga_id: string;
  chapter_number: number;
  title: string | null;
  images: string[];
  created_at: string;
}