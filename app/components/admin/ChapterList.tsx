"use client";

import { deleteChapterAction } from "@/app/admin/actions";
import { Trash2, FileImage } from "lucide-react";
import { useState } from "react";
import { Chapter } from "@/app/types"; // <--- 1. TİPİMİZİ İMPORT ETTİK

// 2. 'any[]' YERİNE 'Chapter[]' KULLANIYORUZ
export default function ChapterList({ chapters }: { chapters: Chapter[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu bölümü silmek istediğine emin misin?")) return;
    setDeletingId(id);
    await deleteChapterAction(id);
    setDeletingId(null);
  };

  return (
    <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/10 bg-black/20">
        <h3 className="font-bold text-white">Bölümler ({chapters.length})</h3>
      </div>
      
      <div className="divide-y divide-white/5">
        {chapters.map((chapter) => (
            <div key={chapter.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition group">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-green-500 font-bold border border-white/5">
                        {chapter.chapter_number}
                    </div>
                    <div>
                        <h4 className="text-white font-medium text-sm">
                            {chapter.title || `Bölüm ${chapter.chapter_number}`}
                        </h4>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            <FileImage size={10} /> {chapter.images?.length || 0} Sayfa
                        </span>
                    </div>
                </div>

                <button 
                    onClick={() => handleDelete(chapter.id)}
                    disabled={deletingId === chapter.id}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded transition"
                    title="Sil"
                >
                    {deletingId === chapter.id ? "..." : <Trash2 size={16} />}
                </button>
            </div>
        ))}
        {chapters.length === 0 && (
            <div className="p-8 text-center text-gray-500">Henüz bölüm eklenmemiş.</div>
        )}
      </div>
    </div>
  );
}