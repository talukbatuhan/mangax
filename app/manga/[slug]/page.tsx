import Navbar from "@/app/components/Navbar";
import MangaCard from "@/app/components/MangaCard";
import CommentSection from "@/app/components/CommentSection";
import FavoriteButton from "@/app/components/FavoriteButton";
import RatingStars from "@/app/components/RatingStars"; // Puanlama Bileşeni
import { createClient } from "@/lib/supabase/server"; // Server Client (Auth için gerekli)
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Manga } from "@/app/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// 1. SEO METADATA (Google için)
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: manga } = await supabase.from("mangas").select("title, description").eq("slug", slug).single();
  
  return {
    title: manga ? `${manga.title} Oku - TalucScans` : "Manga Bulunamadı",
    description: manga?.description || "Türkçe manga okuma platformu.",
  };
}

export default async function MangaDetail({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient(); // Güvenli Server Client

  // 1. Kullanıcı Giriş Yapmış mı? (Kendi puanını göstermek için)
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Şu anki Mangayı Bul
  const { data: manga } = await supabase
    .from("mangas")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!manga) return notFound();

  // 3. Kullanıcının Puanını Bul (Eğer giriş yaptıysa)
  let userRating = 0;
  if (user) {
    const { data: ratingData } = await supabase
      .from("ratings")
      .select("score")
      .eq("manga_id", manga.id)
      .eq("user_id", user.id)
      .single();
    
    // Veritabanı 10 üzerinden, biz 5 yıldız gösteriyoruz
    if (ratingData) userRating = ratingData.score / 2; 
  }

  // 4. Bölümleri Çek
  const { data: chapters } = await supabase
    .from("chapters")
    .select("*")
    .eq("manga_id", manga.id)
    .order("chapter_number", { ascending: false });

  // 5. BENZER MANGALARI BUL
  let similarMangas: Manga[] = [];
  if (manga.genres && manga.genres.length > 0) {
    const { data: similar } = await supabase
      .from("mangas")
      .select("*")
      .overlaps("genres", manga.genres)
      .neq("id", manga.id)
      .limit(5);
      
    similarMangas = (similar as unknown as Manga[]) || [];
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-green-500 selection:text-black">
      <Navbar />
      
      {/* --- ÜST BANNER (HEADER) --- */}
      <div className="relative h-[450px] w-full overflow-hidden">
        {/* Arka Plan Resmi (Blur Efektli) */}
        {manga.cover_url && (
           <Image 
             src={manga.cover_url} 
             alt="banner" 
             fill 
             className="object-cover opacity-20 blur-2xl scale-110" 
           />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
        
        {/* Başlık ve Bilgiler */}
        <div className="absolute bottom-0 left-0 p-6 w-full pb-12">
          <div className="container mx-auto flex flex-col md:flex-row items-end gap-8">
             {/* Kapak Resmi */}
             <div className="relative w-48 h-72 rounded-xl overflow-hidden border-4 border-gray-800/50 shadow-2xl shadow-black shrink-0 hidden md:block">
               {manga.cover_url && (
                 <Image src={manga.cover_url} fill className="object-cover" alt="cover"/>
               )}
             </div>
             
             <div className="flex-1 mb-2">
               {/* Tür Etiketleri */}
               {manga.genres && (
                 <div className="flex flex-wrap gap-2 mb-4">
                   {manga.genres.map((g: string) => (
                     <span key={g} className="text-xs font-bold bg-green-600/20 text-green-400 border border-green-600/30 px-3 py-1 rounded-full uppercase tracking-wide hover:bg-green-600/40 transition cursor-default">
                       {g}
                     </span>
                   ))}
                 </div>
               )}

               {/* Başlık ve Favori */}
               <div className="flex flex-wrap items-center gap-4 mb-2">
                 <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-2xl leading-none">
                    {manga.title}
                 </h1>
                 <FavoriteButton mangaId={manga.id} slug={manga.slug} />
               </div>
               
               {/* Puanlama Bileşeni (YENİ) */}
               <div className="mb-4">
                  <RatingStars 
                    mangaId={manga.id} 
                    initialRating={userRating} 
                    average={manga.rating_avg || 0}
                    count={manga.rating_count || 0}
                    userId={user?.id}
                  />
               </div>
               
               {/* Yazar ve İstatistikler */}
               <div className="flex items-center gap-6 text-gray-300 font-medium text-sm md:text-base">
                  <span className="flex items-center gap-2"><span className="text-green-500">✍️</span> {manga.author || "Yazar Bilinmiyor"}</span>
                  <span className="flex items-center gap-2"><span className="text-green-500">👁️</span> {manga.views?.toLocaleString() || 0} Okunma</span>
                  <span className="flex items-center gap-2"><span className="text-green-500">📅</span> {new Date(manga.created_at).getFullYear()}</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* --- ANA İÇERİK --- */}
      <div className="container mx-auto px-6 py-12 grid lg:grid-cols-3 gap-12">
        
        {/* SOL KOLON: Özet, Bölümler ve Yorumlar (%66) */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Özet */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-green-500 rounded-full"></span> Özet
            </h2>
            <p className="text-gray-300 leading-relaxed text-lg bg-gray-900/30 p-6 rounded-2xl border border-white/5">
                {manga.description || "Bu seri için henüz bir açıklama girilmemiş."}
            </p>
          </section>

          {/* Bölüm Listesi */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-green-500 rounded-full"></span> Bölümler 
                <span className="text-sm text-gray-500 font-normal ml-2">({chapters?.length || 0})</span>
            </h2>
            
            <div className="grid gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {chapters?.map((chapter) => (
                <Link 
                    href={`/manga/${slug}/${chapter.chapter_number}`} 
                    key={chapter.id} 
                    className="flex items-center justify-between bg-gray-900 p-4 rounded-xl border border-gray-800 hover:border-green-500/50 hover:bg-gray-800 transition group"
                >
                    <div className="flex items-center gap-4">
                        <span className="font-bold text-xl text-gray-600 group-hover:text-green-500 transition w-10 text-center">
                            {chapter.chapter_number}
                        </span>
                        <div>
                            <span className="block font-medium text-gray-200 group-hover:text-white">
                                {chapter.title || `Bölüm ${chapter.chapter_number}`}
                            </span>
                            <span className="text-xs text-gray-500">
                                {new Date(chapter.created_at).toLocaleDateString("tr-TR")}
                            </span>
                        </div>
                    </div>
                    <span className="px-4 py-1.5 bg-white/5 text-xs font-bold rounded-full text-gray-400 group-hover:bg-green-600 group-hover:text-white transition">
                        Oku
                    </span>
                </Link>
                ))}
                
                {(!chapters || chapters.length === 0) && (
                    <div className="p-10 text-center border border-dashed border-gray-800 rounded-xl text-gray-500">
                        Henüz bölüm yüklenmemiş.
                    </div>
                )}
            </div>
          </section>

          {/* Yorum Alanı */}
          <section>
             <CommentSection mangaId={manga.id} />
          </section>
        </div>

        {/* SAĞ KOLON: Benzer Mangalar (%33) */}
        <div className="lg:col-span-1">
            <div className="sticky top-24">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span className="text-xl">🔥</span> Benzer Seriler
                </h3>
                
                {similarMangas.length > 0 ? (
                    <div className="grid gap-6">
                        {similarMangas.map((simManga) => (
                            <MangaCard key={simManga.id} manga={simManga} />
                        ))}
                    </div>
                ) : (
                    <div className="p-6 bg-gray-900/50 rounded-xl border border-white/5 text-center">
                        <p className="text-gray-500 text-sm">Henüz benzer seri bulunamadı.</p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}