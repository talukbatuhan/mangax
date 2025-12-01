"use client";

import { useState } from "react";
import Link from "next/link";
import { Chapter } from "@/app/types";
import { ArrowDownUp, BookOpen } from "lucide-react";

interface MangaChapterListProps {
  chapters: Chapter[];
  slug: string;
}

export default function MangaChapterList({ chapters, slug }: MangaChapterListProps) {
  // Varsayılan olarak 'desc' (Yeniden Eskiye) - Genelde en çok istenen budur
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Sıralama Mantığı
  const sortedChapters = [...chapters].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.chapter_number - b.chapter_number; // Eskiden Yeniye (1, 2, 3...)
    } else {
      return b.chapter_number - a.chapter_number; // Yeniden Eskiye (100, 99, 98...)
    }
  });

  return (
    <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-6 shadow-xl">
        {/* Üst Başlık ve Sıralama Butonu */}
        <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
            <h3 className="text-xl font-black uppercase tracking-wide flex items-center gap-2">
                    <BookOpen className="text-green-500" /> Bölümler
            </h3>
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-2 transition bg-white/5 px-3 py-2 rounded-lg border border-white/5 hover:bg-white/10 hover:border-green-500/30 group"
                >
                    <ArrowDownUp size={14} className="text-green-500 group-hover:rotate-180 transition-transform duration-300" />
                    {sortOrder === 'desc' ? "Yeniden Eskiye" : "Eskiden Yeniye"}
                </button>
                <div className="text-xs text-gray-500 font-mono hidden sm:block">
                    Toplam {chapters.length}
                </div>
            </div>
        </div>

        {/* Liste */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {sortedChapters.map((chapter) => (
                <Link 
                    href={`/manga/${slug}/${chapter.chapter_number}`} 
                    key={chapter.id}
                    className="group flex items-center justify-between bg-[#0f0f0f] border border-white/5 p-4 rounded-lg hover:border-green-500/50 hover:bg-[#151515] transition-all duration-300"
                >
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-xs uppercase tracking-widest group-hover:text-green-500 transition-colors">
                                Bölüm {chapter.chapter_number}
                        </span>
                        <span className="text-white font-bold text-sm mt-0.5 truncate max-w-[200px]">
                                {chapter.title || "İsimsiz Bölüm"}
                        </span>
                    </div>
                    <span className="text-[10px] text-gray-600 font-medium bg-white/5 px-2 py-1 rounded group-hover:bg-green-600 group-hover:text-white transition-colors">
                        OKU
                    </span>
                </Link>
            ))}
            
            {chapters.length === 0 && (
                <div className="col-span-full py-10 text-center text-gray-500 border border-dashed border-white/10 rounded-lg">
                    Henüz bölüm yüklenmedi.
                </div>
            )}
        </div>
    </div>
  );
}