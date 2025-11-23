"use client";

import { useState } from "react";
import { getChapters, deleteChapter } from "@/app/admin/actions";
import { Chapter } from "@/app/types";

export default function ChapterManager({ mangas }: { mangas: { id: string | number, title: string }[] }) {
  const [selectedManga, setSelectedManga] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Hangi bölümün detayının açık olduğunu tutar
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  const handleSelect = async (mangaId: string) => {
    setSelectedManga(mangaId);
    setExpandedChapter(null); // Manga değişince detayı kapat
    if (!mangaId) {
      setChapters([]);
      return;
    }
    setLoading(true);
    const data = await getChapters(mangaId);
    setChapters((data as unknown as Chapter[]) || []); 
    setLoading(false);
  };

  const handleDelete = async (chapterId: string) => {
    if (!confirm("Bölümü silmek istediğine emin misin?")) return;
    try {
      await deleteChapter(chapterId);
      setChapters(chapters.filter((c) => c.id !== chapterId));
    } catch (e) {
      alert("Hata oluştu.");
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
      <h2 className="text-xl font-bold mb-4 text-purple-400">Bölüm ve Resim Kontrolü</h2>
      
      <select 
        className="w-full bg-gray-800 p-3 rounded border border-gray-700 mb-6 text-white outline-none"
        onChange={(e) => handleSelect(e.target.value)}
        value={selectedManga}
      >
        <option value="">İncelenecek Mangayı Seç...</option>
        {mangas.map((m) => (
          <option key={m.id} value={m.id}>{m.title}</option>
        ))}
      </select>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {loading && <p className="text-gray-500 text-center">Yükleniyor...</p>}
        
        {chapters.map((chapter) => (
          <div key={chapter.id} className="bg-gray-800 rounded border border-gray-700 overflow-hidden">
            {/* Bölüm Başlığı */}
            <div className="p-3 flex justify-between items-center bg-gray-800 hover:bg-gray-700 transition">
              <div className="flex items-center gap-3">
                <span className="font-bold text-green-400">#{chapter.chapter_number}</span>
                <span className="text-sm text-gray-300">{chapter.title || "İsimsiz"}</span>
                <span className="text-xs text-gray-500">({chapter.images?.length || 0} Sayfa)</span>
              </div>
              
              <div className="flex gap-2">
                {/* DETAY BUTONU */}
                <button 
                  onClick={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
                  className="px-3 py-1 text-xs bg-blue-900 text-blue-200 rounded hover:bg-blue-800 transition"
                >
                  {expandedChapter === chapter.id ? "Gizle" : "Resimleri Gör"}
                </button>

                <button 
                  onClick={() => handleDelete(chapter.id)}
                  className="px-3 py-1 text-xs bg-red-900 text-red-200 rounded hover:bg-red-800 transition"
                >
                  Sil
                </button>
              </div>
            </div>

            {/* AÇILIR MENÜ: RESİM LİSTESİ */}
            {expandedChapter === chapter.id && (
              <div className="bg-black p-4 text-xs font-mono text-gray-400 border-t border-gray-700">
                <p className="mb-2 text-green-500 font-bold">Yüklü Dosyalar:</p>
                <ul className="list-decimal list-inside space-y-1 max-h-40 overflow-y-auto">
                  {chapter.images?.map((url, index) => {
                    // URL'den dosya adını temizleyip gösterelim
                    const fileName = url.split('/').pop(); 
                    return (
                      <li key={index} className="truncate hover:text-white cursor-help" title={url}>
                        {fileName}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}