// app/page.tsx
import Navbar from "@/app/components/Navbar";
import LatestUpdateCard from "@/app/components/LatestUpdateCard";
import CategoryBar from "@/app/components/CategoryBar";
import ContinueReading from "@/app/components/ContinueReading";
import Sidebar from "@/app/components/Sidebar";
import HeroSlider from "@/app/components/HeroSlider"; // <--- YENİ BİLEŞENİ İMPORT ET
import { supabase } from "@/lib/supabase";
import { Manga } from "@/app/types";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export const revalidate = 60;

interface SliderItem {
  mangas: Manga | Manga[] | null;
}

export default async function Home() {
  
  // --- 1. VERİLERİ ÇEKME ---
  const [latestRes, popularRes, sliderRes] = await Promise.all([
    supabase.from("mangas").select("*").order("created_at", { ascending: false }).limit(20),
    supabase.from("mangas").select("*").order("views", { ascending: false }).limit(8),
    // Sadece cover, title vs. çekiyoruz
    supabase.from("slider_items").select(`mangas (id, title, slug, description, cover_url)`)
  ]);

  const latestMangas = (latestRes.data as unknown as Manga[]) || [];
  const popularMangas = (popularRes.data as unknown as Manga[]) || [];
  const sliderItemsRaw = (sliderRes.data as unknown as SliderItem[]) || [];

  // --- 2. VİTRİN VERİSİNİ HAZIRLAMA (ARRAY OLARAK) ---
  let featuredMangas: Manga[] = [];

  if (sliderItemsRaw.length > 0) {
    // Supabase'den gelen iç içe yapıyı düz bir Manga dizisine çeviriyoruz
    sliderItemsRaw.forEach((item) => {
      if (Array.isArray(item.mangas)) {
        featuredMangas.push(...item.mangas);
      } else if (item.mangas) {
        featuredMangas.push(item.mangas);
      }
    });
  }

  // Eğer slider boşsa, son eklenenlerden ilk 3 tanesini koy (Fallback)
  if (featuredMangas.length === 0 && latestMangas.length > 0) {
    featuredMangas = latestMangas.slice(0, 3);
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white font-sans selection:bg-green-500 selection:text-black relative overflow-hidden">
      
      {/* Ambiyans Işıkları */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[150px] -z-10 pointer-events-none"></div>

      <Navbar />
      
      {/* --- HERO / SLIDER ALANI --- */}
      {/* Eski statik kod yerine yeni slider bileşeni */}
      <HeroSlider slides={featuredMangas} />

      {/* --- KATEGORİLER --- */}
      <CategoryBar />

      {/* --- ANA İÇERİK --- */}
      <div className="container mx-auto px-4 py-10 relative z-10">
        
        <div className="mb-12">
           <ContinueReading />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* SOL TARA: SON YÜKLENENLER */}
            <div className="lg:col-span-9 space-y-8">
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* SAĞ TARA: SIDEBAR */}
            <div className="lg:col-span-3">
                <Sidebar popularMangas={popularMangas} />
            </div>

        </div>
      </div>
    </main>
  );
}