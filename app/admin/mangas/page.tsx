// app/admin/mangas/page.tsx

import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import DeleteButton from "@/app/components/DeleteButton";
import { Plus, Search, Edit, Eye, Star } from "lucide-react";

export const revalidate = 0;

// Tip Tanımlaması: Veritabanından gelen verinin şeklini TypeScript'e anlatıyoruz
type MangaWithGenres = {
  id: string; // UUID string
  title: string;
  author: string | null;
  cover_url: string | null;
  views: number;
  rating_avg: number | null;
  created_at: string;
  // İlişkisel tablo yapısı (Manga -> MangaGenres -> Genres)
  manga_genres: {
    genres: {
      name: string;
    } | null;
  }[];
};

export default async function MangasPage({ searchParams }: { searchParams: Promise<{ q: string }> }) {
  const { q } = await searchParams;
  const query = q || "";

  let dbQuery = supabase
    .from("mangas")
    .select(`
      *,
      manga_genres (
        genres (
          name
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (query) {
    dbQuery = dbQuery.ilike("title", `%${query}%`);
  }

  const { data } = await dbQuery;

  // Gelen veriyi yukarıdaki tipimize zorluyoruz (Casting)
  const mangas = data as unknown as MangaWithGenres[] | null;

  return (
    <div>
      {/* Üst Başlık ve Butonlar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          📚 Manga Listesi <span className="text-gray-500 text-sm font-normal">({mangas?.length || 0})</span>
        </h1>
        
        <div className="flex gap-3 w-full md:w-auto">
          {/* Arama Kutusu */}
          <form className="relative flex-1 md:w-64">
            <input 
              name="q" 
              defaultValue={query}
              placeholder="Manga ara..." 
              className="w-full bg-gray-900 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-green-500 outline-none text-white transition-colors focus:bg-gray-800"
            />
            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
          </form>

          {/* Yeni Ekle Butonu */}
          <Link href="/admin/mangas/new" className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition shadow-lg shadow-green-900/20">
            <Plus size={18} /> Yeni Ekle
          </Link>
        </div>
      </div>

      {/* Tablo */}
      <div className="bg-gray-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-black/40 text-gray-400 text-xs uppercase font-bold border-b border-white/5">
            <tr>
              <th className="p-4">Kapak</th>
              <th className="p-4">Başlık & Yazar</th>
              <th className="p-4">Türler</th>
              <th className="p-4">İstatistik</th>
              <th className="p-4 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {mangas?.map((manga) => {
              
              // TİP HATASI DÜZELTİLDİ:
              // item: any yerine yukarıdaki 'MangaWithGenres' tipinden otomatik anlıyor.
              // Yine de güvenli erişim operatörlerini (?.) kullanıyoruz.
              const genreList = manga.manga_genres?.map((item) => item.genres?.name).filter(Boolean) || [];

              return (
                <tr key={manga.id} className="hover:bg-white/5 transition group">
                  
                  {/* 1. Kapak Resmi */}
                  <td className="p-4 w-20">
                    <div className="relative w-12 h-16 rounded bg-gray-800 overflow-hidden border border-white/10 shadow-md group-hover:scale-105 transition-transform">
                      {manga.cover_url ? (
                          <Image src={manga.cover_url} alt={manga.title} fill className="object-cover" sizes="48px" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">Yok</div>
                      )}
                    </div>
                  </td>

                  {/* 2. Başlık */}
                  <td className="p-4">
                    <Link href={`/admin/mangas/${manga.id}`} className="font-bold text-white text-base hover:text-green-400 hover:underline transition block mb-1">
                      {manga.title}
                    </Link>
                    <div className="text-gray-500 text-xs flex items-center gap-1">
                      <span>✍️</span> {manga.author || "Yazar Bilinmiyor"}
                    </div>
                  </td>

                  {/* 3. Türler */}
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {genreList.slice(0, 3).map((gName, index) => (
                        <span key={index} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-xs text-gray-300 whitespace-nowrap">
                          {gName}
                        </span>
                      ))}
                      {genreList.length > 3 && (
                          <span className="text-xs text-gray-500 px-1">+{genreList.length - 3}</span>
                      )}
                      {genreList.length === 0 && (
                        <span className="text-xs text-gray-600 italic">Tür yok</span>
                      )}
                    </div>
                  </td>

                  {/* 4. İstatistikler */}
                  <td className="p-4 text-gray-400 font-mono text-xs space-y-1">
                    <div className="flex items-center gap-1.5" title="Görüntülenme">
                      <Eye size={12} className="text-blue-400" /> 
                      <span>{manga.views?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="Ortalama Puan">
                      <Star size={12} className="text-yellow-400" /> 
                      <span>{manga.rating_avg ? manga.rating_avg : "-"}</span>
                    </div>
                  </td>

                  {/* 5. İşlemler */}
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link 
                          href={`/admin/mangas/${manga.id}`} 
                          className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition border border-blue-500/20"
                          title="Düzenle ve Bölüm Ekle"
                      >
                          <Edit size={16} />
                      </Link>
                      
                      <DeleteButton id={manga.id} />
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* Boş Durum */}
            {(!mangas || mangas.length === 0) && (
                <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-500 italic border-t border-white/5">
                        {query ? `"${query}" için sonuç bulunamadı.` : "Henüz hiç manga eklenmemiş."}
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}