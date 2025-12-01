import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { ChevronRight, Hash } from "lucide-react";

interface LatestUpdateCardProps {
  manga: {
    id: string;
    title: string;
    slug: string;
    cover_url: string | null;
  };
}

export default async function LatestUpdateCard({ manga }: LatestUpdateCardProps) {
  const { data: chapters } = await supabase
    .from("chapters")
    .select("chapter_number, title, created_at")
    .eq("manga_id", manga.id)
    .order("chapter_number", { ascending: false })
    .limit(3);

  return (
    <div className="group relative h-[155px] bg-[#111] border border-white/5 overflow-hidden hover:border-green-500/30 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_-5px_rgba(34,197,94,0.15)]">
      
      <div className="flex h-full">
        
        {/* SOL: Kapak Resmi */}
        <Link href={`/manga/${manga.slug}`} className="relative w-[105px] shrink-0 h-full overflow-hidden cursor-pointer z-20">
           {manga.cover_url ? (
            <Image 
              src={manga.cover_url} 
              alt={manga.title} 
              fill 
              className="object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
              sizes="105px"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs text-gray-500">N/A</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#111]/20 to-[#111]"></div>
        </Link>

        {/* SAĞ: İçerik */}
        <div className="flex-1 py-3 pr-3 pl-2 flex flex-col min-w-0 relative z-10">

          {/* Başlık - GÜNCELLENDİ: Tek satırda kalması için 'truncate' eklendi */}
          <Link href={`/manga/${manga.slug}`} className="mb-auto block">
              <h3 className="text-sm font-black text-white leading-tight group-hover:text-green-400 transition-colors truncate" title={manga.title}>
                  {manga.title}
              </h3>
          </Link>

          {/* Bölüm Listesi */}
          <div className="flex flex-col gap-1.5 w-full mt-2">
            {chapters?.map((chapter) => (
              <Link 
                key={chapter.chapter_number}
                href={`/manga/${manga.slug}/${chapter.chapter_number}`} 
                className="
                    flex items-center justify-between 
                    w-full px-2.5 py-1.5
                    bg-white/[0.03] hover:bg-white/10 
                    border border-white/5 hover:border-green-500/30
                    /* GÜNCELLENDİ: 'rounded' kaldırıldı, keskin köşeler */
                    transition-all group/btn
                "
              >
                <div className="flex items-center gap-2 min-w-0">
                    <Hash size={11} className="text-green-600 group-hover/btn:text-green-400 transition-colors shrink-0" />
                    
                    <span className="text-xs font-bold text-gray-300 group-hover/btn:text-white whitespace-nowrap">
                        Bölüm {chapter.chapter_number}
                    </span>
                </div>
                
                <ChevronRight size={12} className="text-gray-600 group-hover/btn:text-green-400 transition-transform group-hover/btn:translate-x-0.5 shrink-0" />
              </Link>
            ))}
            
            {(!chapters || chapters.length === 0) && (
                <div className="text-xs text-gray-600 italic py-2">Henüz bölüm yok.</div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}