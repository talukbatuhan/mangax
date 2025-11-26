import Navbar from "@/app/components/Navbar";
import LatestUpdateCard from "@/app/components/LatestUpdateCard";
import CategoryBar from "@/app/components/CategoryBar";
import ContinueReading from "@/app/components/ContinueReading";
import Sidebar from "@/app/components/Sidebar";
import { supabase } from "@/lib/supabase";
import { Manga } from "@/app/types";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
// Mevcut importlarınızın arasına şunu ekleyin:
import WeeklyPopular, { MangaWithChapters } from "@/app/components/WeeklyPopular";
export const revalidate = 60;

// --- TİP TANIMLARI ---
interface SliderItem {
  mangas: Manga | Manga[] | null;
}

export default async function Home() {
  
  // --- 1. VERİLERİ PARALEL ÇEKME ---
  const [latestRes, popularRes, sliderRes, weeklyRes] = await Promise.all([
    // A. Son Eklenenler (Ana liste)
    supabase
      .from("mangas")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(24), 

    // B. Popülerler (Sidebar)
    supabase
      .from("mangas")
      .select("*")
      .order("views", { ascending: false })
      .limit(8),

    // C. Slider (Vitrin)
    supabase
      .from("slider_items")
      .select(`mangas (title, slug, description, cover_url)`),

    // D. Haftalık Popüler
  supabase
      .from("mangas")
      .select(`
        *,
        chapters (
          chapter_number
        )
      `)
      .order("rating_avg", { ascending: false })
      .limit(15)
      
  ]);

  // --- 2. VERİ TEMİZLİĞİ ---
  const latestMangas = (latestRes.data as unknown as Manga[]) || [];
  const popularMangas = (popularRes.data as unknown as Manga[]) || [];
  const sliderItems = (sliderRes.data as unknown as SliderItem[]) || [];
const weeklyMangas = (weeklyRes.data as unknown as MangaWithChapters[]) || [];

  // --- 3. VİTRİN MANGASINI BELİRLEME ---
  let featuredManga: Manga | null = null;

  if (sliderItems.length > 0) {
    const item = sliderItems[0].mangas;
    if (Array.isArray(item)) {
        featuredManga = item[0] || null;
    } else {
        featuredManga = item;
    }
  }
  
  if (!featuredManga && latestMangas.length > 0) {
    featuredManga = latestMangas[0];
  }


  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white font-sans selection:bg-green-500 selection:text-black relative overflow-hidden">
      
      {/* Ambiyans Işıkları */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[150px] -z-10 pointer-events-none"></div>

      <Navbar />
      
      {/* --- HERO / SLIDER ALANI --- */}
      {featuredManga && (
        <div className="pt-16 relative w-full h-[350px] md:h-[500px] group overflow-hidden border-b border-white/5">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] group-hover:scale-110 opacity-40"
            style={{ backgroundImage: `url('${featuredManga.cover_url}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f] via-transparent to-transparent" />
          
          <div className="container mx-auto px-6 h-full flex flex-col justify-end pb-12 relative z-10">
             <span className="px-3 py-1 bg-green-600 text-white text-[10px] font-black uppercase tracking-widest w-fit mb-4 shadow-lg">
                Günün Tavsiyesi
             </span>
             <h1 className="text-3xl md:text-6xl font-black mb-4 leading-none max-w-4xl drop-shadow-2xl text-white">
                {featuredManga.title}
             </h1>
             <p className="text-gray-300 text-sm md:text-lg max-w-xl line-clamp-2 mb-8 drop-shadow-md">
                {featuredManga.description}
             </p>
             <Link href={`/manga/${featuredManga.slug}`} className="px-8 py-3 bg-white text-black hover:bg-green-500 hover:text-white font-bold text-sm transition w-fit shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2 group/btn">
                HEMEN OKU <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
             </Link>
          </div>
        </div>
      )}

      {/* --- KATEGORİLER --- */}
      <CategoryBar />

      {/* --- ANA İÇERİK --- */}
      <div className="container mx-auto px-4 py-10 relative z-10">
        
        {/* Haftalık Popüler en üstte tam genişlik kalmaya devam ediyor */}
        <WeeklyPopular mangas={weeklyMangas} />

        {/* IZGARA YAPISI BURADA BAŞLIYOR */}
        {/* ContinueReading'i grid'in içine aldık ki Sidebar ile hizalansın */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           
           {/* SOL TARA: OKUMAYA DEVAM ET + SON YÜKLENENLER (9/12) */}
           <div className="lg:col-span-9 space-y-12">
               
               {/* 1. Okumaya Devam Et Kısmı - Artık Sol Sütunun En Tepesinde */}
               <div>
                  <ContinueReading />
               </div>

               {/* 2. Son Yüklenenler Kısmı */}
               <div className="space-y-8">
                   <div className="flex items-center justify-between border-b border-white/5 pb-4">
                       <h2 className="text-2xl font-black flex items-center gap-3 text-white uppercase tracking-wide">
                           <Sparkles className="text-green-500" />
                           <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                             Son Yüklenenler
                           </span>
                       </h2>
                       <Link href="/search" className="text-xs font-bold text-green-500/70 hover:text-green-400 transition uppercase tracking-widest flex items-center gap-1 group">
                           Tümünü Gör <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
                       </Link>
                   </div>
                   
                   {/* KART IZGARASI */}
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                     {latestMangas.map((manga) => (
                       <LatestUpdateCard key={manga.id} manga={manga} />
                     ))}
                   </div>

                   <div className="mt-10 flex justify-center">
                       <Link href="/search" className="px-12 py-4 bg-[#1a1a1a] hover:bg-[#252525] border border-white/5 text-gray-400 hover:text-white text-xs font-black tracking-[0.2em] transition uppercase shadow-lg">
                           Arşivin Tamamını Gör
                       </Link>
                   </div>
               </div>
           </div>

           {/* SAĞ TARA: SIDEBAR (3/12) */}
           {/* Artık sol taraftaki 'Okumaya Devam Et' ile aynı dikey hizada başlayacak */}
           <div className="lg:col-span-3">
               <Sidebar popularMangas={popularMangas} />
           </div>

        </div>
      </div>
    </main>
  );
}