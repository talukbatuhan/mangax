import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";

// 1. Veri Tipini Tanımlıyoruz (ESLint Mutlu Olsun Diye)
interface HistoryItem {
  manga_id: string;
  last_read_at: string;
  mangas: {
    title: string;
    slug: string;
    cover_url: string;
  };
  chapters: {
    chapter_number: number;
  };
}

export default async function ContinueReading() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("reading_history")
    .select(`
      manga_id,
      last_read_at,
      mangas (title, slug, cover_url),
      chapters (chapter_number)
    `)
    .eq("user_id", user.id)
    .order("last_read_at", { ascending: false })
    .limit(4);

  if (!data || data.length === 0) return null;

  // 2. Gelen veriyi "HistoryItem" kalıbına sokuyoruz (Type Casting)
  const history = data as unknown as HistoryItem[];

  return (
    <div className="mb-12">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
        <span className="text-xl">📖</span> Okumaya Devam Et
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {history.map((item) => {
          // Artık 'item' değişkeninin tipi belli, 'any' hatası vermez.
          const manga = item.mangas;
          const chapter = item.chapters;
          
          // Eğer manga silinmişse ama geçmişte kalmışsa hata vermesin diye kontrol:
          if (!manga || !chapter) return null;

          return (
            <Link 
              key={item.manga_id} 
              href={`/manga/${manga.slug}/${chapter.chapter_number}`}
              
              className="flex items-center gap-4 bg-gray-900/80 p-3 rounded-xl border border-white/5 hover:border-green-500 hover:bg-gray-800 transition group"
            >
              {/* Küçük Resim */}
              <div className="relative w-12 h-16 shrink-0 rounded overflow-hidden shadow-md bg-gray-800">
                 {manga.cover_url && <Image src={manga.cover_url} fill className="w-full h-full object-cover group-hover:scale-110 transition" alt={manga.title} />}
              </div>
              
              {/* Bilgi */}
              <div className="overflow-hidden">
                <h4 className="font-bold text-gray-200 text-sm truncate group-hover:text-green-400 transition">
                    {manga.title}
                </h4>
                <p className="text-xs text-green-500 font-mono mt-1">
                    Bölüm {chapter.chapter_number}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                    Devam Et →
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}