import Navbar from "@/app/components/Navbar";
import MangaCard from "@/app/components/MangaCard";
import { supabase } from "@/lib/supabase";
import { Manga } from "@/app/types";

export const revalidate = 60;

export default async function Home() {
  // 1. Tüm Mangaları Çek
  const { data: mangas } = await supabase
    .from("mangas")
    .select("*")
    .order("created_at", { ascending: false });

  // 2. Kategorilere Göre Filtrele (JavaScript ile)
  // Gerçek projede bunu veritabanı sorgusuyla yapmak daha performanslıdır ama şimdilik böyle pratik.
  const allMangas = (mangas as unknown as Manga[]) || [];
  
  // Öne Çıkanlar (Rastgele veya elle seçilen)
  const featuredManga = allMangas[0]; // Şimdilik en son ekleneni vitrine koyuyoruz

  // Kategoriler (İsteğe bağlı çoğaltabilirsin)
  const actionMangas = allMangas.filter(m => JSON.stringify(m).toLowerCase().includes('aksiyon')).slice(0, 5);
  const romanceMangas = allMangas.filter(m => JSON.stringify(m).toLowerCase().includes('romantik')).slice(0, 5);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-green-500 selection:text-black">
      <Navbar />
      
      {/* --- HERO ALANI --- */}
      {featuredManga && (
        <div className="relative w-full h-[500px] flex items-end">
          {/* Arka Plan (Bulanık) */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={{ backgroundImage: `url('${featuredManga.cover_url}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
          
          <div className="container mx-auto px-6 pb-20 relative z-10 flex flex-col md:flex-row items-end gap-8">
            {/* Kapak Resmi */}
            <div className="hidden md:block w-48 h-72 rounded-lg overflow-hidden shadow-2xl shadow-green-900/30 border-2 border-white/10 shrink-0 transform hover:scale-105 transition duration-500">
               <img src={featuredManga.cover_url || ""} className="w-full h-full object-cover" />
            </div>
            
            <div className="max-w-2xl mb-4">
              <span className="text-green-400 font-bold tracking-wider text-sm uppercase mb-2 block">Günün Önerisi</span>
              <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">{featuredManga.title}</h1>
              <p className="text-gray-300 mb-6 line-clamp-3 text-lg leading-relaxed">{featuredManga.description}</p>
              <div className="flex gap-4">
                 <a href={`/manga/${featuredManga.slug}`} className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-full transition shadow-lg shadow-green-600/20">
                    Okumaya Başla
                 </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-10 space-y-16">
          
          {/* --- BÖLÜM: SON GÜNCELLEMELER --- */}
          <section>
            <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
               <h2 className="text-2xl font-bold flex items-center gap-3">
                 <span className="w-1.5 h-8 bg-green-500 rounded-full"></span>
                 Son Eklenenler
               </h2>
               <span className="text-sm text-gray-500 hover:text-white cursor-pointer transition">Tümünü Gör →</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {allMangas.slice(0, 10).map((manga) => (
                <MangaCard key={manga.id} manga={manga} />
              ))}
            </div>
          </section>

          {/* --- BÖLÜM: AKSİYON --- */}
          {actionMangas.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-6 text-gray-200">💥 Aksiyon Dolu Seriler</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {actionMangas.map((manga) => (
                  <MangaCard key={manga.id} manga={manga} />
                ))}
              </div>
            </section>
          )}

           {/* --- BÖLÜM: ROMANTİK (Veya istediğin başka tür) --- */}
           {romanceMangas.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-6 text-gray-200">💖 Romantik Seriler</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {romanceMangas.map((manga) => (
                  <MangaCard key={manga.id} manga={manga} />
                ))}
              </div>
            </section>
          )}

      </div>
    </main>
  );
}