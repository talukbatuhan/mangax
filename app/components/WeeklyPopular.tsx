"use client";

import Link from "next/link";
import NextImage from "next/image";
import { Manga } from "@/app/types";
import { Star, Flame, ChevronRight, Image as ImageIcon } from "lucide-react";

export interface MangaWithChapters extends Manga {
  chapters: { chapter_number: number }[] | null;
}

export default function WeeklyPopular({ mangas }: { mangas: MangaWithChapters[] }) {
  
  const getLatestChapter = (manga: MangaWithChapters) => {
    if (!manga.chapters || !Array.isArray(manga.chapters) || manga.chapters.length === 0) {
      return "Yeni";
    }
    const latest = manga.chapters.reduce((max, chapter) => {
      const num = Number(chapter.chapter_number);
      return num > max ? num : max;
    }, 0);
    return `Bölüm ${latest}`;
  };
  
  const renderStars = (rating: number | null) => {
    const score = rating ? Math.round(rating / 2) : 0;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={10} 
            className={star <= score ? "fill-green-500 text-green-500" : "text-gray-700"} 
          />
        ))}
        <span className="text-[10px] font-bold text-gray-500 ml-1">
            {rating ? rating.toFixed(1) : "N/A"}
        </span>
      </div>
    );
  };

  return (
    <div className="mb-10 w-full relative group/container">
      
      {/* BAŞLIK ALANI */}
      <div className="flex items-center justify-between mb-4 pl-4 border-l-4 border-green-600">
           <div className="flex items-center gap-3">
               <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wide">
                   Haftanın Popülerleri
               </h2>
               <Flame className="text-green-500 animate-pulse" size={24} />
           </div>
           
           <div className="hidden md:flex items-center text-xs text-gray-500 font-bold uppercase tracking-wider gap-1">
              Kaydır <ChevronRight size={14} className="animate-bounce-x" />
           </div>
      </div>

      {/* SCROLL ALANI KAPSAYICISI */}
      <div className="relative">
          
          <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-[#0f0f0f] to-transparent z-20 pointer-events-none"></div>

          <div className="flex overflow-x-auto gap-4 pb-4 px-1 scrollbar-hide scroll-smooth snap-x snap-mandatory">
              
              {mangas.map((manga, index) => (
                <Link 
                    key={manga.id} 
                    href={`/manga/${manga.slug}`} 
                    className="shrink-0 w-[160px] md:w-[190px] group flex flex-col gap-2 relative snap-start"
                >
                  
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#1a1a1a] border border-white/5 group-hover:border-green-500 transition-colors duration-300 rounded-sm">
                     {manga.cover_url ? (
                        <NextImage 
                            src={manga.cover_url} 
                            fill
                            /* HATA DÜZELTİLDİ: 
                              'unoptimized' ekleyerek domain yapılandırması olmasa bile
                              resmin yüklenmesini sağlıyoruz. Prodüksiyonda next.config.js
                              ayarlayıp bunu kaldırabilirsiniz.
                            */
                            unoptimized={true}
                            className="object-cover opacity-90 group-hover:opacity-100 transition duration-300" 
                            alt={manga.title || "Manga kapak resmi"}
                            sizes="(max-width: 768px) 160px, 190px"
                            draggable={false}
                        />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <ImageIcon size={32} /> 
                        </div>
                     )}
                     
                     <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent"></div>

                     <div className="absolute top-0 left-0">
                        <div className={`
                            w-7 h-7 flex items-center justify-center font-black text-xs
                            ${index === 0 ? "bg-green-500 text-black" : 
                              index === 1 ? "bg-white text-black" : 
                              index === 2 ? "bg-gray-400 text-black" : 
                              "bg-[#111] text-green-500 border-r border-b border-white/10"} 
                        `}>
                            {index + 1}
                        </div>
                     </div>

                     <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1">
                        {index < 3 && (
                            <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                                HOT
                            </span>
                        )}
                     </div>
                  </div>

                  <div className="flex flex-col gap-1">
                      <h3 className="text-sm font-bold text-white leading-tight group-hover:text-green-500 transition-colors line-clamp-1">
                         {manga.title}
                      </h3>
                      
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-300 transition-colors">
                            {getLatestChapter(manga)}
                         </span>
                         {renderStars(manga.rating_avg)}
                      </div>
                  </div>

                </Link>
              ))}
              
              <div className="shrink-0 w-8"></div>
          </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        @keyframes bounce-x {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(25%); }
        }
        .animate-bounce-x {
            animation: bounce-x 1s infinite;
        }
      `}</style>
    </div>
  );
}