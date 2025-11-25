import Link from "next/link";
import { Manga } from "@/app/types";
import { ExternalLink, Star, Trophy, MessageCircle } from "lucide-react";
import Image from "next/image";

export default function Sidebar({ popularMangas }: { popularMangas: Manga[] }) {
  
  const renderStars = (rating: number | null) => {
    const score = rating ? Math.round(rating / 2) : 0;
    return (
      <div className="flex items-center gap-0.5 mt-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={10} 
            // Yıldızları altın sarısı yerine neon yeşili/sarı karışımı yaptık
            className={star <= score ? "fill-green-400 text-green-400" : "text-green-900/30"} 
          />
        ))}
        <span className="text-xs font-bold text-green-200/60 ml-1.5">
            {rating ? rating.toFixed(1) : "N/A"}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-8 pl-0 lg:pl-4 h-full border-l border-green-900/20 relative">
      {/* Arka plan için hafif bir parlama */}
      <div className="absolute top-0 right-0 w-full h-1/2 bg-green-500/5 blur-3xl -z-10"></div>

      {/* 1. POPÜLER SERİLER */}
      <div>
        {/* Başlık: Gradyan Yazı */}
        <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 border-b border-green-900/30 pb-3 mb-6">
            <Trophy size={16} className="text-green-500" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-green-400">
              Popüler Seriler
            </span>
        </h3>
        
        <div className="flex flex-col gap-4">
          {popularMangas.map((manga, index) => {
             // İlk 3 sıra için özel parlak stiller
             let rankStyle = "border-green-900/30 text-green-700/50 font-medium";
             let rankGlow = "";
             if (index === 0) { rankStyle = "border-green-400 text-green-400 font-black bg-green-400/10"; rankGlow="shadow-[0_0_15px_rgba(34,197,94,0.5)]"; }
             else if (index === 1) { rankStyle = "border-green-500/70 text-green-500/70 font-bold"; }
             else if (index === 2) { rankStyle = "border-green-600/50 text-green-600/50 font-bold"; }

             return (
            <Link key={manga.id} href={`/manga/${manga.slug}`} className="flex gap-3 group w-full hover:bg-green-900/5 transition p-2 relative overflow-hidden">
              
              {/* Hover'da arkadan geçen ışık efekti */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

              {/* SOL: Sıra Numarası */}
              <div className="shrink-0 pt-1 relative z-10">
                  <div className={`w-7 h-7 flex items-center justify-center border-2 rounded-md text-xs transition-all group-hover:scale-110 ${rankStyle} ${rankGlow}`}>
                    {index + 1}
                  </div>
              </div>
              
              {/* ORTA: Resim */}
              <div className="relative w-14 h-20 shrink-0 rounded-md overflow-hidden shadow-md border border-green-900/20 group-hover:border-green-400/50 transition z-10">
                 {manga.cover_url && (
                    <Image 
                        src={manga.cover_url} 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                        alt={manga.title} 
                        fill
                        sizes="56px"
                    />
                 )}
              </div>

              {/* SAĞ: Bilgiler */}
              <div className="flex-1 min-w-0 flex flex-col justify-center z-10">
                <h4 className="font-bold text-white text-sm group-hover:text-green-400 transition truncate leading-tight mb-1">
                    {manga.title}
                </h4>
                <p className="text-[10px] text-green-200/40 truncate font-medium">
                    {manga.genres ? manga.genres.slice(0, 3).join(", ") : "Genel"}
                </p>
                {renderStars(manga.rating_avg)}
              </div>
            </Link>
          )})}
        </div>
      </div>

      {/* 2. DISCORD (Neon Tabela Tarzı) */}
      <a href="#" target="_blank" className="block relative group rounded-2xl overflow-hidden">
          {/* Arka plan gradyanı */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-blue-900 opacity-80 group-hover:opacity-100 transition duration-300"></div>
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div> {/* Varsa noise texture */}
          
          <div className="relative z-10 p-5 flex items-center justify-between border border-green-400/30 rounded-2xl group-hover:border-green-400/60 transition hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]">
              <div>
                 <h4 className="font-black text-white text-base flex items-center gap-2">
                    <MessageCircle size={20} className="text-green-300 animate-pulse" />
                    Topluluğa Katıl!
                 </h4>
                 <p className="text-xs text-green-100/80 mt-1">Sohbet, istekler ve duyurular için.</p>
              </div>
              <div className="bg-white/10 p-2 rounded-full group-hover:bg-green-400 group-hover:text-black text-white transition duration-300">
                <ExternalLink size={20} />
              </div>
          </div>
      </a>

    </div>
  );
}