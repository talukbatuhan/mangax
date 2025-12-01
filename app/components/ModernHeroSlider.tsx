"use client";

import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight, Play } from "lucide-react";
import { Manga } from "@/app/types";

interface PropType {
  slides: Manga[];
}

export default function ModernHeroSlider({ slides }: PropType) {
  // Embla Carousel Hook'u (Loop: Sonsuz döngü, Autoplay: Otomatik geçiş)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 6000, stopOnInteraction: false }),
  ]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!slides || slides.length === 0) return null;

  return (
    <div className="relative group w-full h-[400px] md:h-[420px] bg-[#0f0f0f] border-b border-white/5 overflow-hidden">
      
      {/* Slider Viewport */}
      <div className="overflow-hidden h-full w-full" ref={emblaRef}>
        <div className="flex h-full touch-pan-y">
          {slides.map((manga, index) => (
            <div className="relative flex-[0_0_100%] min-w-0 h-full" key={manga.id}>
              
              {/* Arkaplan Resmi (Tam Ekran) */}
              <div className="absolute inset-0 w-full h-full">
                {manga.cover_url ? (
                  <Image
                    src={manga.cover_url}
                    alt={manga.title}
                    fill
                    className="object-cover opacity-50 blur-sm scale-105"
                    priority={index === 0}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-900" />
                )}
                {/* Karartma Gradyanları */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f] via-[#0f0f0f]/40 to-transparent" />
              </div>

              {/* İçerik Alanı */}
              <div className="relative container mx-auto px-6 h-full flex items-end pb-12 md:pb-16 z-10">
                <div className="flex flex-col md:flex-row gap-8 items-end w-full">
                  
                  {/* Sol: Kapak Resmi (Poster) */}
                  <div className="hidden md:block shrink-0 relative w-[200px] h-[280px] rounded-lg overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] border-2 border-white/10 group-hover:border-green-500 transition-colors duration-500">
                     {manga.cover_url && (
                        <Image src={manga.cover_url} fill className="object-cover" alt={manga.title} />
                     )}
                  </div>

                  {/* Sağ: Metin ve Butonlar */}
                  <div className="flex-1 space-y-4 mb-4 md:mb-0">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-green-600 text-black text-[10px] font-black uppercase tracking-widest rounded shadow-lg shadow-green-500/20">
                            Editörün Seçimi
                        </span>
                        <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                            ⭐ {manga.rating_avg ? manga.rating_avg.toFixed(1) : "Yeni"}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-2xl line-clamp-2">
                      {manga.title}
                    </h1>

                    <p className="text-gray-300 text-sm md:text-base line-clamp-3 max-w-2xl drop-shadow-md">
                      {manga.description || "Bu seri için açıklama bulunmuyor. Hemen okumaya başlayın!"}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Link
                        href={`/manga/${manga.slug}`}
                        className="px-8 py-3 bg-white text-black hover:bg-green-500 hover:text-white font-bold text-sm transition-all rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] group/btn"
                      >
                        <Play size={18} fill="currentColor" /> HEMEN OKU
                      </Link>
                      
                      <Link 
                        href={`/manga/${manga.slug}`}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-sm rounded-full border border-white/10 backdrop-blur-md transition flex items-center gap-2"
                      >
                        Detaylar <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Navigasyon Butonları (Sağ Alt Köşe) */}
      <div className="absolute bottom-8 right-6 z-20 hidden md:flex gap-2">
        <button
          onClick={scrollPrev}
          className="w-12 h-12 rounded-full bg-white/5 hover:bg-green-600 border border-white/10 text-white flex items-center justify-center transition backdrop-blur-sm"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={scrollNext}
          className="w-12 h-12 rounded-full bg-white/5 hover:bg-green-600 border border-white/10 text-white flex items-center justify-center transition backdrop-blur-sm"
        >
          <ChevronRight size={24} />
        </button>
      </div>
      
      {/* Mobil İçin Alt Çizgi İndikatörleri */}
      <div className="absolute bottom-0 left-0 w-full flex h-1 md:hidden">
         {slides.map((_, i) => (
             <div key={i} className="flex-1 bg-white/20">
                 {/* Buraya aktif slide için doluluk animasyonu eklenebilir, şimdilik basit tuttum */}
             </div>
         ))}
      </div>

    </div>
  );
}