import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Layers, ExternalLink, Calendar } from "lucide-react";
import DeleteChapterButton from "@/app/components/admin/DeleteChapterButton";

export const revalidate = 0;

// 1. TİP TANIMI (INTERFACE)
// Veritabanından gelen verinin şeklini tanımlıyoruz
interface ChapterData {
  id: string;
  chapter_number: number;
  title: string | null;
  created_at: string;
  mangas: {
    id: string;
    title: string;
    slug: string;
    cover_url: string | null;
  } | null; // Manga ilişkisi (Tekil nesne olarak gelir)
}

export default async function ChaptersPage() {
  const { data } = await supabase
    .from("chapters")
    .select(`
      id,
      chapter_number,
      title,
      created_at,
      mangas (id, title, slug, cover_url)
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  // 2. TİP DÖNÜŞÜMÜ (Type Casting)
  // Gelen 'data'yı bizim tanımladığımız 'ChapterData[]' dizisine çeviriyoruz.
  // Bu sayede aşağıda 'any' kullanmamıza gerek kalmıyor.
  const chapters = (data as unknown as ChapterData[]) || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Layers className="text-blue-500" /> Bölüm Yönetimi
        </h1>
        <p className="text-gray-500 text-sm mt-1">Sisteme yüklenen son bölümler (Son 50)</p>
      </div>

      <div className="bg-gray-900 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-black/40 text-gray-400 text-xs uppercase font-bold border-b border-white/5">
            <tr>
              <th className="p-4">Manga</th>
              <th className="p-4">Bölüm</th>
              <th className="p-4">Yüklenme Tarihi</th>
              <th className="p-4 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {chapters.map((item) => (
              <tr key={item.id} className="hover:bg-white/5 transition">
                
                {/* Manga Adı */}
                <td className="p-4">
                  {item.mangas ? (
                    <Link href={`/admin/mangas/${item.mangas.id}`} className="font-bold text-white hover:text-green-400 transition flex items-center gap-3">
                        {/* Küçük Kapak */}
                        <div className="w-8 h-10 bg-gray-800 rounded overflow-hidden relative shrink-0 border border-white/10">
                            {item.mangas.cover_url && <img src={item.mangas.cover_url} className="w-full h-full object-cover" alt="" />}
                        </div>
                        {item.mangas.title}
                    </Link>
                  ) : (
                    <span className="text-red-400">Manga Silinmiş</span>
                  )}
                </td>

                {/* Bölüm No */}
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="text-green-400 font-bold">Bölüm {item.chapter_number}</span>
                    <span className="text-gray-500 text-xs">{item.title || "Başlıksız"}</span>
                  </div>
                </td>

                {/* Tarih */}
                <td className="p-4 text-gray-400 font-mono text-xs">
                   <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      {new Date(item.created_at).toLocaleDateString("tr-TR", {
                        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                      })}
                   </div>
                </td>

                {/* İşlemler */}
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    {/* Okuyucuya Git */}
                    {item.mangas && (
                        <a 
                            href={`/manga/${item.mangas.slug}/${item.chapter_number}`} 
                            target="_blank"
                            className="p-2 text-blue-400 hover:bg-blue-400/10 rounded transition"
                            title="Sitede Gör"
                        >
                            <ExternalLink size={16} />
                        </a>
                    )}
                    
                    {/* Silme Butonu */}
                    <DeleteChapterButton id={item.id} />
                  </div>
                </td>
              </tr>
            ))}
            
            {chapters.length === 0 && (
                <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">Henüz bölüm yüklenmemiş.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}