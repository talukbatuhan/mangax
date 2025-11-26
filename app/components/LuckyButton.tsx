"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getRandomMangaSlug } from "@/app/actions"; 
import { Sparkles, Dice5 } from "lucide-react"; // Dice ikonu ekledik

export default function LuckyButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setLoading(true);
    const slugPath = await getRandomMangaSlug();
    router.push(slugPath);
    // Loading state'i hemen kapatmıyoruz ki sayfa değişene kadar dönmeye devam etsin
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="
        group relative px-4 py-2 rounded-full 
        bg-gradient-to-r from-purple-600/20 to-pink-600/20 
        hover:from-purple-600 hover:to-pink-600
        border border-purple-500/50 hover:border-transparent
        transition-all duration-300 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        overflow-hidden
      "
    >
      {/* Arka plan ışıltısı */}
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"></div>

      <div className="relative flex items-center gap-2 text-xs font-bold text-purple-200 group-hover:text-white transition-colors">
        {loading ? (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        ) : (
          <>
            <Dice5 size={16} className="group-hover:rotate-180 transition-transform duration-500" />
            <span className="uppercase tracking-wider">Şanslı Hissediyorum</span>
            <Sparkles size={14} className="text-yellow-300 animate-pulse" />
          </>
        )}
      </div>
    </button>
  );
}