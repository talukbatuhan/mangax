// app/components/HeroSlider.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Manga } from "@/app/types"; // Tip tanımın neredeyse oradan çek

interface HeroSliderProps {
  slides: Manga[];
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);

  // Otomatik geçiş (5 saniyede bir)
  useEffect(() => {
    if (slides.length <= 1) return; // Tek slayt varsa döndürme
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides || slides.length === 0) return null;

  return (
    <div className="pt-16 relative w-full h-[350px] md:h-[500px] group overflow-hidden border-b border-white/5">
      {slides.map((manga, index) => (
        <div
          key={manga.id || index} // id yoksa index kullan
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Arkaplan Resmi */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] scale-100 group-hover:scale-110 opacity-40"
            style={{ backgroundImage: `url('${manga.cover_url}')` }}
          />
          
          {/* Gradientler (Senin orijinal kodun) */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f] via-transparent to-transparent" />

          {/* İçerik */}
          <div className="container mx-auto px-6 h-full flex flex-col justify-end pb-12 relative z-20">
            <span className="px-3 py-1 bg-green-600 text-white text-[10px] font-black uppercase tracking-widest w-fit mb-4 shadow-lg animate-fade-in-up">
              Günün Tavsiyesi #{index + 1}
            </span>
            
            <h1 className="text-3xl md:text-6xl font-black mb-4 leading-none max-w-4xl drop-shadow-2xl text-white">
              {manga.title}
            </h1>
            
            <p className="text-gray-300 text-sm md:text-lg max-w-xl line-clamp-2 mb-8 drop-shadow-md">
              {manga.description}
            </p>
            
            <Link
              href={`/manga/${manga.slug}`}
              className="px-8 py-3 bg-white text-black hover:bg-green-500 hover:text-white font-bold text-sm transition w-fit shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2 group/btn"
            >
              HEMEN OKU{" "}
              <ArrowRight
                size={18}
                className="group-hover/btn:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </div>
      ))}

      {/* Navigasyon Noktaları (Görseldeki gibi sağ altta) */}
      {slides.length > 1 && (
        <div className="absolute bottom-10 right-10 z-30 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                current === idx
                  ? "bg-green-500 w-8" // Aktif olan uzar
                  : "bg-white/50 hover:bg-white"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}