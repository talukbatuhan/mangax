import Navbar from "@/app/components/Navbar";
import FavoriteButton from "@/app/components/FavoriteButton";
import RatingStars from "@/app/components/RatingStars";
import MangaChapterList from "@/app/components/MangaChapterList"; 
import CommentSection from "@/app/components/CommentSection"; // Unutulan import eklendi
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Manga, Chapter } from "@/app/types"; 
import { Calendar, Eye, Layers, User, Hash, Sparkles, Play, RotateCw } from "lucide-react"; 
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

type MangaWithRelations = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  author: string | null;
  cover_url: string | null;
  views: number;
  rating_avg: number | null;
  rating_count: number | null;
  created_at: string;
  genres: string[] | null; 
  manga_genres: {
    genres: {
      name: string;
    } | null;
  }[];
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  
  const { data: manga } = await supabase
    .from("mangas")
    .select("title, description")
    .eq("slug", slug)
    .single();
  
  return {
    title: manga ? `${manga.title} Oku` : "Manga Bulunamadı",
    description: manga?.description || "Türkçe manga okuma platformu.",
  };
}

export default async function MangaDetail({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: rawData } = await supabase
    .from("mangas")
    .select(`
      *,
      manga_genres (
        genres (
          name
        )
      )
    `)
    .eq("slug", slug)
    .single();

  if (!rawData) return notFound();

  const rawManga = rawData as unknown as MangaWithRelations;

  const genreList = rawManga.manga_genres
    ?.map((item) => item.genres?.name)
    .filter((name): name is string => !!name) || [];
  
  const manga = {
    ...rawManga,
    genres: genreList 
  };

  let userRating = 0;
  let lastReadChapterNum: number | null = null;

  if (user) {
    // 1. Puan verisi
    const { data: ratingData } = await supabase
      .from("ratings")
      .select("score")
      .eq("manga_id", manga.id)
      .eq("user_id", user.id)
      .single();
    
    if (ratingData) userRating = ratingData.score / 2; 

    // 2. OKUMA GEÇMİŞİ VERİSİ (DÜZELTİLDİ)
    const { data: historyData } = await supabase
      .from("reading_history")
      .select(`
        chapter_id,
        chapters (
            chapter_number
        )
      `)
      .eq("user_id", user.id)
      .eq("manga_id", manga.id)
      .single();

    if (historyData && historyData.chapters) {
        const chapterData = Array.isArray(historyData.chapters) 
            ? historyData.chapters[0] 
            : historyData.chapters;
            
        if (chapterData) {
            lastReadChapterNum = chapterData.chapter_number;
        }
    }
  }

  // Bölümleri Çek
  const { data: chaptersData } = await supabase
    .from("chapters")
    .select("*")
    .eq("manga_id", manga.id)
    .order("chapter_number", { ascending: false });

  const chapters = (chaptersData as unknown as Chapter[]) || [];

  // --- BUTON MANTIĞI ---
  // İlk bölüm (Dizi tersten sıralı olduğu için son eleman ilk bölümdür)
  const firstChapterNum = chapters.length > 0 ? chapters[chapters.length - 1].chapter_number : null;
  
  // Link Hedefi: Varsa kaldığı yer, yoksa ilk bölüm
  const actionLink = lastReadChapterNum 
    ? `/manga/${slug}/${lastReadChapterNum}` 
    : (firstChapterNum ? `/manga/${slug}/${firstChapterNum}` : null);

  const actionText = lastReadChapterNum 
    ? `Bölüm ${lastReadChapterNum} - Devam Et` 
    : "Okumaya Başla";
    
  const ActionIcon = lastReadChapterNum ? RotateCw : Play;


  let similarMangas: Manga[] = [];
  if (manga.genres && manga.genres.length > 0) {
    const { data: similar } = await supabase
      .from("mangas")
      .select("*")
      .overlaps("genres", manga.genres)
      .neq("id", manga.id)
      .limit(6);
      
    similarMangas = (similar as unknown as Manga[]) || [];
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans selection:bg-green-500 selection:text-black relative overflow-hidden">
      
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[150px] -z-10 pointer-events-none"></div>

      <Navbar />
      
      {/* Banner ve İçerik */}
      <div className="relative w-full border-b border-white/5 pb-10">
        <div className="absolute inset-0 h-[400px] overflow-hidden -z-10">
             {manga.cover_url && (
                <div 
                   className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl scale-125"
                   style={{ backgroundImage: `url('${manga.cover_url}')` }}
                />
             )}
             <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f]/80 via-[#0f0f0f] to-[#0f0f0f]" />
        </div>

        <div className="container mx-auto px-4 pt-24 md:pt-32">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            <div className="shrink-0 relative group mx-auto md:mx-0">
                <div className="w-[220px] h-[330px] rounded-lg overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10 relative z-10">
                    {manga.cover_url ? (
                        <Image src={manga.cover_url} fill className="object-cover transition-transform duration-700 group-hover:scale-110" alt={manga.title}/>
                    ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">Resim Yok</div>
                    )}
                </div>
                <div className="absolute -inset-2 bg-green-500/20 blur-xl rounded-full -z-0 opacity-0 group-hover:opacity-100 transition duration-500" />
            </div>

            <div className="flex-1 w-full space-y-5 text-center md:text-left">
                <div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                         <span className="px-3 py-1 bg-green-500 text-black text-[10px] font-black uppercase tracking-widest rounded-sm">
                            {chapters && chapters.length > 0 ? "Güncel" : "Yeni"}
                         </span>
                         
                         {manga.genres?.slice(0, 3).map((g) => (
                             <span key={g} className="px-3 py-1 bg-white/5 text-gray-300 border border-white/5 text-[10px] font-bold uppercase tracking-widest rounded-sm">
                                {g}
                             </span>
                         ))}
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-xl mb-4">
                        {manga.title}
                    </h1>

                    <div className="flex flex-wrap justify-center md:justify-start gap-4 items-center">
                        
                        {/* --- DEVAM ET / BAŞLA BUTONU --- */}
                        {actionLink && (
                            <Link 
                                href={actionLink}
                                className="flex items-center gap-2 bg-white text-black hover:bg-green-400 px-6 py-3 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-green-500/40 group"
                            >
                                <ActionIcon size={20} className="fill-current group-hover:rotate-12 transition-transform" />
                                <span className="uppercase tracking-wide text-xs md:text-sm">{actionText}</span>
                            </Link>
                        )}

                        <RatingStars 
                            mangaId={String(manga.id)}
                            initialRating={userRating} 
                            average={manga.rating_avg || 0}
                            count={manga.rating_count || 0}
                            userId={user?.id}
                        />
                        <FavoriteButton mangaId={String(manga.id)} slug={manga.slug} />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-y border-white/5 py-4 bg-white/[0.02] rounded-lg">
                    <div className="flex flex-col items-center justify-center border-r border-white/5 px-4">
                        <User size={18} className="text-green-500 mb-1" />
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Yazar</span>
                        <span className="font-bold text-sm text-white truncate max-w-full">{manga.author || "-"}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center border-r border-white/5 px-4">
                        <Eye size={18} className="text-green-500 mb-1" />
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Okunma</span>
                        <span className="font-bold text-sm text-white">{manga.views?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center border-r border-white/5 px-4">
                        <Layers size={18} className="text-green-500 mb-1" />
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Bölüm</span>
                        <span className="font-bold text-sm text-white">{chapters?.length || 0}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center px-4">
                        <Calendar size={18} className="text-green-500 mb-1" />
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Yıl</span>
                        <span className="font-bold text-sm text-white">{new Date(manga.created_at).getFullYear()}</span>
                    </div>
                </div>

                <p className="text-gray-400 leading-relaxed text-sm md:text-base max-w-4xl mx-auto md:mx-0">
                    {manga.description || "Bu seri için henüz bir açıklama girilmemiş."}
                </p>

            </div>
          </div>
        </div>
      </div>

      {/* Bölümler ve Yan Panel */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            <div className="lg:col-span-8 space-y-10">
                <MangaChapterList chapters={chapters} slug={slug} />

                <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-6 shadow-xl">
                    <h3 className="text-xl font-black uppercase tracking-wide flex items-center gap-2 mb-6">
                        <Hash className="text-green-500" /> Yorumlar
                    </h3>
                    <CommentSection mangaId={String(manga.id)} />
                </div>
            </div>

            <div className="lg:col-span-4">
                <div className="sticky top-24 space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="text-green-500" size={20} />
                        <h3 className="text-lg font-black uppercase tracking-wide text-white">
                            Benzer Seriler
                        </h3>
                    </div>

                    {similarMangas.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {similarMangas.map((simManga) => (
                                <Link href={`/manga/${simManga.slug}`} key={simManga.id} className="group flex gap-4 bg-[#1a1a1a] hover:bg-[#202020] border border-white/5 p-3 rounded-lg transition-colors">
                                    <div className="relative w-16 h-24 shrink-0 rounded overflow-hidden">
                                        {simManga.cover_url && (
                                            <Image src={simManga.cover_url} fill className="object-cover group-hover:scale-110 transition-transform duration-500" alt={simManga.title} />
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <h4 className="font-bold text-sm text-white group-hover:text-green-400 transition-colors line-clamp-2 leading-tight">
                                            {simManga.title}
                                        </h4>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {simManga.genres?.slice(0, 2).map((g) => (
                                                <span key={g} className="text-[9px] px-1.5 py-0.5 bg-white/5 text-gray-400 rounded uppercase">
                                                    {g}
                                                </span>
                                            ))}
                                        </div>
                                        <span className="text-[10px] text-gray-500 mt-1">
                                           👁️ {simManga.views?.toLocaleString()}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 bg-[#1a1a1a] rounded border border-white/5 text-center text-sm text-gray-500">
                            Benzer seri bulunamadı.
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}