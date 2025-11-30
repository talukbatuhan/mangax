"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Calendar, PlayCircle, Bookmark } from "lucide-react";
import { Manga } from "@/app/types";

interface HeroSliderProps {
  slides: Manga[];
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  
  const DURATION = 6000; // 6 Saniye
  const UPDATE_FREQ = 100;

  // Slayt değişimi fonksiyonu
  const nextSlide = useCallback(() => {
    if (!slides || slides.length <= 1) return;
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setProgress(0); // Sayaç burada sıfırlanır
  }, [slides]);

  // Manuel nokta/buton ile değiştirme
  const handleManualChange = (index: number) => {
    setCurrentIndex(index);
    setProgress(0); // Sayaç burada sıfırlanır
  };

  // Otomatik Zamanlayıcı
  useEffect(() => {
    if (!slides || slides.length <= 1) return;

    // HATA DÜZELTİLDİ: setProgress(0) buradan kaldırıldı.

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + (100 / (DURATION / UPDATE_FREQ));
      });
    }, UPDATE_FREQ);

    progressInterval.current = interval;

    return () => clearInterval(interval);
  }, [nextSlide, slides.length]); // currentIndex bağımlılığına gerek yok

  if (!slides || slides.length === 0) return null;

  const currentManga = slides[currentIndex];
  if (!currentManga) return null;

  return (
    <div className="relative w-full h-[650px] md:h-[750px] overflow-hidden group bg-[#050505] border-b border-white/5">
      
      {/* --- ARKA PLAN (Bulanık Efekt) --- */}
      <div key={currentManga.id} className="absolute inset-0 z-0 animate-fade-in duration-1000">
         <div className="absolute inset-0 bg-black/70 z-10" />
         <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/60 to-transparent z-10" />
         <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f] via-[#0f0f0f]/80 to-transparent z-10" />
         
         {currentManga.cover_url && (
            <Image 
                src={currentManga.cover_url} 
                alt="Background" 
                fill 
                className="object-cover blur-3xl opacity-40 scale-110"
                unoptimized
                priority
            />
         )}
      </div>

      {/* --- İÇERİK ALANI --- */}
      <div className="container mx-auto px-6 h-full relative z-20 pt-24 pb-12 flex flex-col md:flex-row gap-8 md:gap-16 items-center">
        
        {/* SOL: KAPAK GÖRSELİ */}
        <div key={`cover-${currentIndex}`} className="shrink-0 hidden md:block animate-in slide-in-from-left-10 duration-700 fade-in">
            <div className="w-[320px] lg:w-[380px] aspect-[2/3] relative rounded-xl overflow-hidden shadow-[0_0_40px_-10px_rgba(0,0,0,0.7)] border border-white/10 group-hover:scale-[1.02] transition-transform duration-500">
                {currentManga.cover_url ? (
                    <Image 
                        src={currentManga.cover_url} 
                        alt={currentManga.title} 
                        fill 
                        className="object-cover" 
                        unoptimized 
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">Görsel Yok</div>
                )}
            </div>
        </div>

        {/* SAĞ: METİN VE BİLGİLER */}
        <div key={`info-${currentIndex}`} className="flex-1 flex flex-col justify-center items-center md:items-start space-y-6 animate-in slide-in-from-right-10 duration-700 fade-in text-center md:text-left">
            
            {/* Etiketler */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="px-3 py-1 bg-orange-600 text-black text-[10px] font-black uppercase tracking-widest rounded shadow-lg shadow-orange-900/50">
                    ÖNE ÇIKAN
                </span>
                {currentManga.rating_avg && (
                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[10px] font-bold flex items-center gap-1 rounded">
                        <Star size={12} fill="currentColor" /> {currentManga.rating_avg}
                    </span>
                )}
            </div>

            {/* Başlık */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1] drop-shadow-2xl line-clamp-2 md:line-clamp-3 max-w-4xl">
                {currentManga.title}
            </h1>

            {/* Detaylar (Yıl, Türler) */}
            <div className="flex items-center gap-4 text-sm text-gray-300 font-medium bg-black/30 px-4 py-2 rounded-full border border-white/5 backdrop-blur-sm">
                <span className="flex items-center gap-1.5 text-orange-400">
                    <Calendar size={16} />
                    {new Date(currentManga.created_at).getFullYear()}
                </span>
                <span className="w-1 h-1 bg-gray-600 rounded-full" />
                <span className="truncate max-w-[200px] md:max-w-none text-gray-200">
                    {currentManga.genres ? currentManga.genres.slice(0, 3).join(", ") : "Genel"}
                </span>
            </div>

            {/* Açıklama */}
            <p className="text-gray-400 text-sm md:text-lg leading-relaxed line-clamp-3 md:line-clamp-4 max-w-2xl drop-shadow-md">
                {currentManga.description || "Bu seri hakkında henüz bir açıklama girilmemiş. Hemen okumaya başlayarak keşfet!"}
            </p>

            {/* Butonlar */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
                <Link 
                    href={`/manga/${currentManga.slug}`}
                    className="px-8 py-4 bg-orange-600 text-black hover:bg-orange-500 font-black text-sm rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(234,88,12,0.3)] hover:shadow-[0_0_40px_rgba(234,88,12,0.5)] flex items-center justify-center gap-3 group/btn hover:-translate-y-1"
                >
                    <PlayCircle size={20} className="fill-black text-orange-600 transition-colors" />
                    OKUMAYA BAŞLA
                </Link>
                
                <button className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-bold text-sm rounded-xl backdrop-blur-md border border-white/10 hover:border-orange-500/50 transition-all flex items-center justify-center gap-2 group/list hover:-translate-y-1">
                    <Bookmark size={18} className="group-hover/list:text-orange-500 transition-colors" />
                    LİSTEYE EKLE
                </button>
            </div>
        </div>
      </div>

      {/* --- SAĞ ALT: SLIDER GEÇİŞ NOKTALARI (DOTS) --- */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 right-0 left-0 md:left-auto md:right-10 flex justify-center md:justify-end gap-2 z-30 px-6">
           {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleManualChange(idx)}
                className={`
                  h-1.5 rounded-full transition-all duration-500 ease-out
                  ${currentIndex === idx 
                    ? 'bg-orange-500 w-8 shadow-[0_0_10px_#f97316]' // Aktif nokta
                    : 'bg-white/20 w-1.5 hover:bg-white/50 hover:w-3'} // Pasif nokta
                `}
                aria-label={`Slayt ${idx + 1}`}
              />
           ))}
        </div>
      )}

      {/* --- İLERLEME ÇUBUĞU --- */}
      {slides.length > 1 && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5 z-40">
            <div 
                className="h-full bg-orange-600 shadow-[0_0_10px_#ea580c] transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
            />
        </div>
      )}

    </div>
  );
}