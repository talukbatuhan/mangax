"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Clock, BookOpen } from "lucide-react";
import { deleteFromHistory } from "@/app/actions";
import { useState } from "react";
import { toast } from "sonner";
import { formatTimeAgo } from "@/app/utils/formatTime"; // Eğer yoksa tarihi normal formatlayabiliriz

interface HistoryItemProps {
  item: {
    manga_id: string;
    last_read_at: string;
    mangas: {
      title: string;
      slug: string;
      cover_url: string | null;
    } | null;
    chapters: {
      chapter_number: number;
    } | null;
  };
}

export default function HistoryItem({ item }: HistoryItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false); // UI'dan gizlemek için

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Link'e tıklamayı engelle
    if (!confirm("Bu mangayı geçmişinden silmek istiyor musun?")) return;

    setIsDeleting(true);
    try {
      await deleteFromHistory(item.manga_id);
      setIsDeleted(true);
      toast.success("Geçmişten silindi.");
    } catch (error) {
      toast.error("Silinirken hata oluştu.");
      setIsDeleting(false);
    }
  };

  if (isDeleted || !item.mangas) return null;

  return (
    <Link 
      href={`/manga/${item.mangas.slug}/${item.chapters?.chapter_number}`}
      className={`group relative flex items-center gap-4 p-4 bg-[#1a1a1a] hover:bg-[#202020] border border-white/5 rounded-xl transition-all duration-300 ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {/* Kapak Resmi */}
      <div className="relative w-16 h-24 shrink-0 rounded-lg overflow-hidden shadow-lg border border-white/10">
        {item.mangas.cover_url ? (
            <Image 
                src={item.mangas.cover_url} 
                fill 
                className="object-cover group-hover:scale-110 transition duration-500" 
                alt={item.mangas.title} 
            />
        ) : (
            <div className="w-full h-full bg-gray-800" />
        )}
      </div>

      {/* Bilgiler */}
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-bold text-sm truncate pr-8 group-hover:text-green-400 transition">
            {item.mangas.title}
        </h4>
        
        <div className="flex flex-col gap-1 mt-2">
            <div className="flex items-center gap-2 text-xs text-gray-400">
                <BookOpen size={12} className="text-green-500" />
                <span className="font-mono">Bölüm {item.chapters?.chapter_number}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-600">
                <Clock size={10} />
                {/* formatTimeAgo yoksa: new Date(item.last_read_at).toLocaleDateString() */}
                <span>{new Date(item.last_read_at).toLocaleDateString("tr-TR")} tarihinde okundu</span>
            </div>
        </div>
      </div>

      {/* Silme Butonu (Sağ Üst veya Sağ Orta) */}
      <button 
        onClick={handleDelete}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-500 rounded-full transition-colors z-20"
        title="Geçmişten Sil"
      >
        {isDeleting ? (
            <span className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin block"></span>
        ) : (
            <Trash2 size={18} />
        )}
      </button>
    </Link>
  );
}