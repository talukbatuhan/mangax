// app/admin/mangas/[id]/page.tsx

import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Layers, Eye, Calendar, BookOpen } from "lucide-react";
import { notFound } from "next/navigation";
import { Chapter } from "@/app/types";

// --- BİLEŞENLER ---
import ChapterUploader from "@/app/components/admin/ChapterUploader";
import GenreEditor from "@/app/components/ui/GenreEditor";
import EditMangaForm from "@/app/components/admin/EditMangaForm"; // Kapak güncelleyen form
import ChapterPageEditor from "@/app/components/admin/ChapterPageEditor"; // YENİ: Sayfa yönetimi

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

type MangaDetail = {
  id: string;
  title: string;
  slug: string;
  author: string | null;
  description: string | null;
  cover_url: string | null;
  views: number;
  created_at: string;
  manga_genres: {
    genre_id: number;
    genres: {
      name: string;
    } | null;
  }[];
};

export default async function MangaManagePage({ params }: PageProps) {
  const { id } = await params;

  const { data } = await supabase
    .from("mangas")
    .select(`
      *,
      manga_genres (
        genre_id,
        genres (
          name
        )
      )
    `)
    .eq("id", id)
    .single();

  if (!data) return notFound();

  const manga = data as unknown as MangaDetail;

  // Bölümleri Çek
  const { data: chaptersData } = await supabase
    .from("chapters")
    .select("*")
    .eq("manga_id", id)
    .order("chapter_number", { ascending: false });
    
  const chapters = (chaptersData as unknown as Chapter[]) || [];

  const { data: allGenres } = await supabase
    .from("genres")
    .select("*")
    .order("name", { ascending: true });

  const currentGenreIds = manga.manga_genres.map((item) => item.genre_id);

  return (
    <div className="space-y-8 pb-20">
      
      {/* Üst Başlık */}
      <div className="flex items-center gap-4">
        <Link href="/admin/mangas" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition text-white">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{manga.title}</h1>
          <p className="text-gray-500 text-sm">Manga Yönetimi / ID: {manga.id}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* SOL: Sadece Görsel ve İstatistikler */}
        <div className="lg:col-span-1 space-y-6">
            <div className="relative aspect-[2/3] w-full bg-black rounded-lg overflow-hidden border border-white/10 shadow-lg">
                {manga.cover_url ? (
                    <Image src={manga.cover_url} alt={manga.title} fill className="object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700">Resim Yok</div>
                )}
            </div>
            
            {/* İstatistikler */}
            <div className="bg-gray-900 border border-white/10 rounded-xl p-4 space-y-3">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Görüntülenme</span>
                    <span className="text-green-400 font-mono font-bold flex items-center gap-2">
                        <Eye size={14} /> {manga.views?.toLocaleString()}
                    </span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Yıl</span>
                    <span className="text-white font-medium flex items-center gap-2">
                        <Calendar size={14} /> {new Date(manga.created_at).getFullYear()}
                    </span>
                 </div>
            </div>
        </div>

        {/* ORTA: Düzenleme Formları */}
        <div className="lg:col-span-2 space-y-8">
            {/* 1. GÜNCELLENMİŞ EDİT FORMU (Kapak değiştirme burada) */}
            <EditMangaForm manga={{
                id: manga.id,
                title: manga.title,
                slug: manga.slug,
                author: manga.author,
                description: manga.description,
                cover_url: manga.cover_url // Kapak bilgisini de gönderiyoruz
            }} />

            {/* 2. Türler */}
            <GenreEditor 
                mangaId={manga.id} 
                allGenres={allGenres || []} 
                existingGenreIds={currentGenreIds} 
            />

            {/* 3. Bölüm Yükleme */}
            <ChapterUploader mangaId={manga.id} mangaTitle={manga.title} />
        </div>
      </div>

      {/* --- ALT: GELİŞMİŞ BÖLÜM VE SAYFA YÖNETİMİ --- */}
      <div className="mt-12">
         <h2 className="text-xl font-bold text-white mb-4">Bölüm Listesi & Sayfa Yönetimi</h2>
         {/* Eski ChapterList yerine yeni bileşen */}
         <ChapterPageEditor chapters={chapters} mangaId={manga.id} />
      </div>
    </div>
  );
}