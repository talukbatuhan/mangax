import Navbar from "@/app/components/Navbar"
import MangaCard from "@/app/components/MangaCard"
import { supabase } from "@/lib/supabase";
import { Manga } from "@/app/types/index";

export const revalidate = 60; // Sayfayı her 60 saniyede bir sunucuda yenile (ISR)

export default async function Home() {
  // Veriyi veritabanından typed (tipli) olarak çekiyoruz
  const { data: mangas, error } = await supabase
    .from("mangas")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Veri çekme hatası:", error);
    return <div className="p-10 text-red-500">Bir hata oluştu.</div>;
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8 border-l-4 border-green-500 pl-4">
          Son Eklenenler
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {mangas?.map((manga) => (
            // TypeScript burada 'manga'nın ne olduğunu biliyor!
            <MangaCard key={manga.id} manga={manga as Manga} />
          ))}
        </div>

        {(!mangas || mangas.length === 0) && (
           <p className="text-gray-500 text-center mt-10">Henüz hiç manga eklenmemiş.</p>
        )}
      </div>
    </main>
  );
}