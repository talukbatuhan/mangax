import Navbar from "@/app/components/Navbar";
import LatestUpdateCard from "@/app/components/LatestUpdateCard";
import CategoryBar from "@/app/components/CategoryBar";
import ContinueReading from "@/app/components/ContinueReading";
import Sidebar from "@/app/components/Sidebar";
import { supabase } from "@/lib/supabase";
import { Manga } from "@/app/types";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import WeeklyPopular, { MangaWithChapters } from "@/app/components/WeeklyPopular";
// YENİ: Modern Slider bileşenini ekledik
import ModernHeroSlider from "@/app/components/ModernHeroSlider";

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
      .select(`mangas (id, title, slug, description, cover_url, rating_avg)`),

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

  // --- 3. SLIDER VERİSİNİ HAZIRLAMA ---
  // Slider tablosundan gelen veriyi düz bir Manga listesine çeviriyoruz
  const sliderMangas: Manga[] = [];
  
  sliderItems.forEach(item => {
      if (Array.isArray(item.mangas)) {
          item.mangas.forEach(m => sliderMangas.push(m));
      } else if (item.mangas) {
          sliderMangas.push(item.mangas);
      }
  });

  // Eğer vitrinde hiç eleman yoksa, boş kalmasın diye son eklenenlerden birini ekle
  if (sliderMangas.length === 0 && latestMangas.length > 0) {
      sliderMangas.push(latestMangas[0]);
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white font-sans selection:bg-green-500 selection:text-black relative overflow-hidden">
      
      {/* Ambiyans Işıkları */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[150px] -z-10 pointer-events-none"></div>

      <Navbar />
      
      {/* --- YENİ HERO SLIDER ALANI --- */}
      {/* Manuel kod yerine yeni bileşeni kullanıyoruz */}
      <div className="pt-16">
        <ModernHeroSlider slides={sliderMangas} />
      </div>

      {/* --- KATEGORİLER --- */}
      <CategoryBar />

      {/* --- ANA İÇERİK --- */}
      <div className="container mx-auto px-4 py-10 relative z-10">
        
        {/* Haftalık Popüler en üstte tam genişlik kalmaya devam ediyor */}
        <WeeklyPopular mangas={weeklyMangas} />

        {/* IZGARA YAPISI BURADA BAŞLIYOR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           
           {/* SOL TARA: OKUMAYA DEVAM ET + SON YÜKLENENLER (9/12) */}
           <div className="lg:col-span-9 space-y-12">
               
               {/* 1. Okumaya Devam Et Kısmı */}
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
           <div className="lg:col-span-3">
               <Sidebar popularMangas={popularMangas} />
           </div>

        </div>
      </div>
    </main>
  );
}