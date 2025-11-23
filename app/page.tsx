import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Manga } from "@/app/types";

// --- BİLEŞEN IMPORTLARI ---
import Navbar from "@/app/components/Navbar";
import MangaCard from "@/app/components/MangaCard";
import Sidebar from "@/app/components/Sidebar";
import ContinueReading from "@/app/components/ContinueReading";

// Sayfa yenilenme süresi (ISR)
export const revalidate = 60;

export default async function Home() {
  // 1. Ana Liste (Son Eklenenler)
  const { data: mangas } = await supabase
    .from("mangas")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(12);

  // 2. Popüler Liste (Sidebar İçin)
  const { data: popularMangas } = await supabase
    .from("mangas")
    .select("*")
    .limit(5);

  const featuredManga = mangas?.[0]; // Vitrindeki manga (En son eklenen)

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-green-500 selection:text-black">
      <Navbar />
      
      {/* --- BÖLÜM 1: HERO ALANI (VİTRİN) --- */}
      {featuredManga && (
        <div className="relative w-full h-[400px] md:h-[500px] group overflow-hidden">
          {/* Arka Plan Resmi */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] group-hover:scale-110 opacity-50"
            style={{ backgroundImage: `url('${featuredManga.cover_url}')` }}
          />
          {/* Gradyanlar (Okunabilirlik için) */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-transparent" />
          
          {/* Vitrin İçeriği */}
          <div className="container mx-auto px-6 h-full flex flex-col justify-end pb-16 relative z-10">
             <span className="px-3 py-1 bg-green-500 text-black text-xs font-bold rounded uppercase w-fit mb-4 shadow-[0_0_15px_#22c55e]">
                Günün Önerisi
             </span>
             <h1 className="text-4xl md:text-6xl font-black mb-4 leading-none max-w-3xl drop-shadow-2xl">
                {featuredManga.title}
             </h1>
             <p className="text-gray-200 text-lg max-w-xl line-clamp-2 mb-8 drop-shadow-md">
                {featuredManga.description}
             </p>
             <Link 
                href={`/manga/${featuredManga.slug}`} 
                className="px-8 py-3 bg-white text-black hover:bg-green-500 hover:text-black font-bold rounded-full transition w-fit shadow-xl flex items-center gap-2"
             >
                <span>Hemen Oku</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M16.72 7.72a.75.75 0 011.06 0l3.75 3.75a.75.75 0 010 1.06l-3.75 3.75a.75.75 0 11-1.06-1.06l2.47-2.47H3a.75.75 0 010-1.5h16.19l-2.47-2.47a.75.75 0 010-1.06z" clipRule="evenodd" />
                </svg>
             </Link>
          </div>
        </div>
      )}

      {/* --- ANA İÇERİK KONTEYNERİ --- */}
      <div className="container mx-auto px-6 py-12">
        
        {/* --- BÖLÜM 2: OKUMAYA DEVAM ET (EN İYİ YER BURASI) --- */}
        {/* Vitrinin hemen altında, diğer içeriklerden ayrışmış özel bir alan */}
        <div className="mb-16">
           <ContinueReading />
        </div>

        {/* --- BÖLÜM 3: İÇERİK VE SIDEBAR (GRID) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* SOL TARA: ANA LİSTE (%75 Genişlik) */}
            <div className="lg:col-span-3">
               
               {/* Başlık Alanı */}
               <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]"></span>
                    Son Güncellemeler
                  </h2>
                  <Link href="/search?q=" className="text-sm text-gray-400 hover:text-green-400 transition flex items-center gap-1">
                    Tümünü Gör 
                    <span>→</span>
                  </Link>
               </div>

               {/* Manga Kartları Grid */}
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                 {mangas?.map((manga) => (
                   <MangaCard key={manga.id} manga={manga as Manga} />
                 ))}
               </div>

               {/* Boş Durum Kontrolü */}
               {(!mangas || mangas.length === 0) && (
                 <div className="py-20 text-center border border-dashed border-gray-800 rounded-2xl bg-gray-900/50">
                    <p className="text-gray-500 text-lg">Henüz içerik eklenmemiş.</p>
                 </div>
               )}
            </div>

            {/* SAĞ TARA: SIDEBAR (%25 Genişlik) */}
            <div className="lg:col-span-1">
               <Sidebar popularMangas={(popularMangas as unknown as Manga[]) || []} />
            </div>

        </div>
      </div>
    </main>
  );
}