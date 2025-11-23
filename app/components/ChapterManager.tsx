"use client";

import { useState } from "react";
import { getChapters, deleteChapter } from "@/app/admin/actions"; // Az önce yazdıklarımız
import { Chapter } from "@/app/types"; // Tip tanımımız

// Bu bileşene manga listesini dışarıdan vereceğiz
export default function ChapterManager({ mangas }: { mangas: { id: string | number, title: string }[] }) {
  const [selectedManga, setSelectedManga] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);

  // Manga seçilince bölümleri çek
  const handleSelect = async (mangaId: string) => {
    setSelectedManga(mangaId);
    if (!mangaId) {
      setChapters([]);
      return;
    }
    
    setLoading(true);
    const data = await getChapters(mangaId);
    // TypeScript hatası almamak için data'yı 'unknown' üzerinden 'Chapter[]'a zorluyoruz
    setChapters((data as unknown as Chapter[]) || []); 
    setLoading(false);
  };

  // Bölüm Silme Fonksiyonu
  const handleDelete = async (chapterId: string) => {
    if (!confirm("Sadece bu bölümü silmek istediğine emin misin?")) return;

    try {
      await deleteChapter(chapterId);
      // Listeden de görsel olarak kaldıralım
      setChapters(chapters.filter((c) => c.id !== chapterId));
      alert("Bölüm silindi.");
    } catch (e) {
      alert("Hata oluştu.");
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
      <h2 className="text-xl font-bold mb-4 text-purple-400">Bölüm Yönetimi</h2>
      
      {/* 1. Manga Seçimi */}
      <select 
        className="w-full bg-gray-800 p-3 rounded border border-gray-700 mb-6 text-white"
        onChange={(e) => handleSelect(e.target.value)}
        value={selectedManga}
      >
        <option value="">Bölümlerini görmek için Manga seç...</option>
        {mangas.map((m) => (
          <option key={m.id} value={m.id}>{m.title}</option>
        ))}
      </select>

      {/* 2. Bölüm Listesi */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {loading && <p className="text-gray-500 text-center">Yükleniyor...</p>}
        
        {!loading && chapters.length === 0 && selectedManga && (
            <p className="text-gray-500 text-center">Bu mangaya ait bölüm bulunamadı.</p>
        )}

        {chapters.map((chapter) => (
          <div key={chapter.id} className="flex justify-between items-center bg-gray-800 p-3 rounded hover:bg-gray-700 transition">
            <div>
              <span className="font-bold text-green-400 mr-2">#{chapter.chapter_number}</span>
              <span className="text-sm text-gray-300">{chapter.title || "İsimsiz Bölüm"}</span>
              <div className="text-xs text-gray-500 mt-1">ID: {chapter.id}</div>
            </div>
            
            <button 
              onClick={() => handleDelete(chapter.id)}
              className="bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-3 py-1 rounded text-xs transition border border-red-900"
            >
              Sil
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}