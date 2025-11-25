import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { formatTimeAgo } from "@/app/utils/formatTime";
import { ArrowRight } from "lucide-react"; // <--- İkonu import etmeyi unutma

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

  const isUpdated = chapters && chapters.length > 0;

  const statusBg = isUpdated ? 'bg-gradient-to-r from-green-600 to-green-400' : 'bg-gradient-to-r from-red-600 to-red-400';

  return (
    <div className="group relative  overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_-5px_rgba(34,197,94,0.4)] hover:-translate-y-1 h-[140px]">
      
      {/* Border Gradient Efekti */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      <div className="absolute inset-0 p-[1px] rounded-xl bg-gradient-to-br from-white/10 to-white/5 group-hover:from-green-400/50 group-hover:to-green-600/50 transition-colors duration-500 pointer-events-none"></div>

      {/* İçerik Katmanı */}
      <div className="flex h-full bg-[#0a0a0a]  relative z-10">
        
        {/* SOL: Kapak Resmi */}
        <Link href={`/manga/${manga.slug}`} className="relative w-[100px] shrink-0 block overflow-hidden">
          {manga.cover_url ? (
            <Image 
              src={manga.cover_url} 
              alt={manga.title} 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
              sizes="100px"
            />
          ) : (
            <div className="w-full h-full bg-gray-900 flex items-center justify-center text-[10px] text-gray-500">Yok</div>
          )}
        
        </Link>

        {/* SAĞ: Bilgiler */}
        <div className="flex-1 p-3 flex flex-col min-w-0 relative">
          
          {/* Hafif Yeşil Arka Plan Işığı */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-green-500/5 blur-2xl -z-10 rounded-full transform translate-x-1/2"></div>

          {/* Başlık */}
          <Link href={`/manga/${manga.slug}`} className="block mb-auto">
              <h3 className="text-sm font-black text-white group-hover:text-green-400 transition truncate leading-tight drop-shadow-sm" title={manga.title}>
                  {manga.title}
              </h3>
          </Link>

          {/* Bölüm Listesi */}
          <div className="space-y-1.5 w-full relative z-10">
            {chapters?.map((chapter) => (
              <div key={chapter.chapter_number} className="flex items-center justify-between text-[11px] group/chapter">
                
                <Link 
                  href={`/manga/${manga.slug}/${chapter.chapter_number}`} 
                  className="flex items-center gap-1.5 text-green-100/80 hover:text-green-400 transition truncate pr-2 font-medium"
                >
                  {/* DÜZELTİLEN SATIR: IsArrowRight hatası giderildi */}
                  <span className="text-green-500/50 group-hover/chapter:text-green-400 transition">
                    <ArrowRight size={10} />
                  </span>
                  <span className="truncate">Bölüm {chapter.chapter_number}</span>
                </Link>
                
                <span className="text-green-200/40 whitespace-nowrap text-[10px] font-mono">
                  {formatTimeAgo(chapter.created_at).replace(" önce", "")}
                </span>
              </div>
            ))}
            
            {/* Durum Çubuğu */}
            <div className="pt-2 flex items-center gap-1.5 mt-1">
               <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </div>
               <span className="text-[10px] text-green-300/70 font-bold tracking-wider">ONGOING</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}