import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { PlayCircle } from "lucide-react";

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("reading_history")
    .select(
      `
      manga_id,
      last_read_at,
      mangas (title, slug, cover_url),
      chapters (chapter_number)
    `
    )
    .eq("user_id", user.id)
    .order("last_read_at", { ascending: false })
    .limit(4);

  if (!data || data.length === 0) return null;

  const history = data as unknown as HistoryItem[];

  return (
    <div>
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-l-4 border-green-600 pl-3 uppercase tracking-wide">
        OKUMAYA DEVAM ET
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {history.map((item) => {
          const manga = item.mangas;
          const chapter = item.chapters;

          if (!manga || !chapter) return null;

          return (
            <Link
              key={item.manga_id}
              href={`/manga/${manga.slug}/${chapter.chapter_number}`}
              className="flex group bg-[#151515] border border-white/5 hover:border-green-600/50 transition h-20 overflow-hidden relative"
            >
              {/* SOL: Resim (Köşesiz, tam boy) */}
              <div className="relative w-16 h-full shrink-0 bg-black">
                {manga.cover_url && (
                  <Image
                    src={manga.cover_url}
                    fill
                    className="object-cover group-hover:scale-110 transition duration-500 opacity-80 group-hover:opacity-100"
                    alt={manga.title}
                    sizes="64px"
                  />
                )}
                {/* Play İkonu Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-transparent transition">
                  <PlayCircle
                    size={20}
                    className="text-white opacity-70 group-hover:text-green-400 group-hover:scale-125 transition"
                  />
                </div>
              </div>

              {/* SAĞ: Bilgi */}
              <div className="flex-1 p-3 flex flex-col justify-center min-w-0">
                <h4 className="font-bold text-gray-200 text-xs truncate group-hover:text-green-400 transition uppercase tracking-wide">
                  {manga.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold bg-green-900/30 text-green-400 px-1.5 py-0.5 border border-green-900/50">
                    BÖLÜM {chapter.chapter_number}
                  </span>
                  <span className="text-[9px] text-gray-500">Kaldığın Yer</span>
                </div>
              </div>

              {/* Hover Çizgisi */}
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-green-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
