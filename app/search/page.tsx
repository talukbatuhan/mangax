import MangaCard from "@/app/components/MangaCard";
import Navbar from "@/app/components/Navbar";
import { supabase } from "@/lib/supabase";
import { Manga } from "@/app/types"
import Link from "next/link";

interface SearchPageProps {
  searchParams: Promise<{ q: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // 1. URL'den aranan kelimeyi al (await ile!)
  const { q } = await searchParams;
  const query = q || "";

  // 2. Veritabanında Arama Yap (SQL'deki LIKE komutu)
  // ilike: Büyük/Küçük harf duyarlılığı olmadan ara demektir.
  // '%query%' : İçinde bu kelime geçen her şeyi getir.
  const { data: mangas } = await supabase
    .from("mangas")
    .select("*")
    .ilike("title", `%${query}%`) 
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
            <Link href="/" className="text-gray-400 hover:text-white text-sm mb-4 block">&larr; Anasayfaya Dön</Link>
            <h1 className="text-2xl font-bold">
                <span className="text-green-400">{query}</span>
            </h1>
        </div>

        {/* Sonuç Varsa Listele */}
        {mangas && mangas.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {mangas.map((manga) => (
              <MangaCard key={manga.id} manga={manga as Manga} />
            ))}
          </div>
        ) : (
          // Sonuç Yoksa
          <div className="text-center py-20 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-xl text-gray-400">Üzgünüz, aradığınız manga bulunamadı.</p>
            <p className="text-sm text-gray-600 mt-2">İsimde hata yapmış olabilir misin?</p>
          </div>
        )}
      </div>
    </div>
  );
}