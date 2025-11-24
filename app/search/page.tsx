import Navbar from "@/app/components/Navbar";
import MangaCard from "@/app/components/MangaCard";
import SearchFilters from "@/app/components/SearchFilters"; // <--- Yeni bileşen
import { supabase } from "@/lib/supabase";
import { Manga } from "@/app/types";
import { Search } from "lucide-react";

interface SearchPageProps {
  searchParams: Promise<{ 
    q?: string; 
    genre?: string; 
    sort?: string; 
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, genre, sort } = await searchParams;
  const query = q || "";
  const selectedGenre = genre || "";
  const sortBy = sort || "created_at"; // Varsayılan: En yeni

  // --- SORGULAMA MANTIĞI ---
  let dbQuery = supabase
    .from("mangas")
    .select("*");

  // 1. İsim Araması
  if (query) {
    dbQuery = dbQuery.ilike("title", `%${query}%`);
  }

  // 2. Tür Filtresi (Dizi içinde arama)
  if (selectedGenre) {
    dbQuery = dbQuery.contains("genres", [selectedGenre]);
  }

  // 3. Sıralama (created_at, views, rating_avg)
  dbQuery = dbQuery.order(sortBy, { ascending: false });

  const { data: mangas } = await dbQuery;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <Navbar />
      
      <div className="container mx-auto px-6 py-24">
        
        {/* Üst Başlık */}
        <div className="mb-10 border-b border-white/10 pb-6">
            <h1 className="text-3xl font-bold flex items-center gap-3">
                <Search className="text-green-500" />
                {query ? `"${query}" için sonuçlar` : "Manga Keşfet"}
            </h1>
            <p className="text-gray-400 mt-2">
                Toplam {mangas?.length || 0} seri bulundu.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            
            {/* SOL: FİLTRE MENÜSÜ */}
            <div className="lg:col-span-1">
                <SearchFilters />
            </div>

            {/* SAĞ: SONUÇLAR */}
            <div className="lg:col-span-3">
                {mangas && mangas.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {mangas.map((manga) => (
                            <MangaCard key={manga.id} manga={manga as Manga} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-900/30 border border-dashed border-gray-800 rounded-2xl">
                        <span className="text-4xl mb-4">🤔</span>
                        <h3 className="text-xl font-bold text-white">Sonuç Bulunamadı</h3>
                        <p className="text-gray-500 mt-2">Farklı filtreler denemeyi ya da arama terimini değiştirmeyi dene.</p>
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
}