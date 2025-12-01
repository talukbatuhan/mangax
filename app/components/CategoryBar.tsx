"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const CATEGORIES = [
    "Aksiyon", "Aşırı Güçlü", "Bilim Kurgu", "Büyü", "Canavar", 
    "Dahi MC", "Dedektif", "Doğaüstü", "Dram", "Fantastik", 
    "Gerilim", "Gizem", "Harem", "Isekai", "Komedi", 
    "Korku", "Macera", "Mecha", "Okul", "Psikolojik", 
    "Romantik", "Savaş", "Spor", "Tarihi", "Wuxia"
];

function CategoryBarContent() {
  const searchParams = useSearchParams();
  const currentGenre = searchParams.get("genre");

  return (
    <div className="w-full bg-black/60 backdrop-blur-md border-b border-green-500/20 sticky top-16 z-40 shadow-[0_4px_20px_-5px_rgba(34,197,94,0.2)]">
      
      <div className="container mx-auto">
        <div className="flex items-center overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] py-2 px-2 md:px-0">
          
          {CATEGORIES.map((cat) => {
            const isSelected = currentGenre === cat;

            return (
              <Link 
                key={cat}
                // Seçiliyse filtreyi kaldırmak için anasayfaya (veya search'e) dönebilir
                href={isSelected ? "/search" : `/search?genre=${cat}`}
                className={`
                  relative group
                  px-5 py-3
                  text-sm font-bold 
                  transition-all duration-300
                  flex items-center justify-center
                  ${isSelected 
                    ? "text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.6)]" // Seçili: Parlak Yeşil + Glow
                    : "text-green-100/70 hover:text-white" // Normal
                  }
                `}
              >
                {/* Metin Efekti */}
                <span className={`transition-transform duration-300 ${isSelected ? "-translate-y-0.5" : "group-hover:-translate-y-0.5"}`}>
                    {cat}
                </span>
                
                {/* Alt Çizgi (Seçiliyse sabit, değilse hover ile gelir) */}
                <span className={`
                    absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-green-400 to-green-600 rounded-full 
                    transition-transform duration-300 origin-left shadow-[0_0_10px_rgba(34,197,94,0.7)]
                    ${isSelected ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}
                `}></span>
              </Link>
            );
          })}
          
        </div>
      </div>
    </div>
  );
}

// Suspense, useSearchParams kullanan Client Component'ler için gereklidir (Build hatasını önler)
export default function CategoryBar() {
  return (
    <Suspense fallback={<div className="w-full h-14 bg-black/60 sticky top-16 z-40 border-b border-green-500/20" />}>
      <CategoryBarContent />
    </Suspense>
  );
}