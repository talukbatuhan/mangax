"use client";

import { useState } from "react";
// Hata Buradaydı: 'deleteChapter' yerine 'deleteChapterAction' olmalıydı.
import { getChaptersAction, deleteChapterAction } from "@/app/admin/actions"; 
import { Chapter } from "@/app/types";

export default function ChapterManager({ mangas }: { mangas: { id: string | number, title: string }[] }) {
  const [selectedManga, setSelectedManga] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  const handleSelect = async (mangaId: string) => {
    setSelectedManga(mangaId);
    setExpandedChapter(null);
    if (!mangaId) {
      setChapters([]);
      return;
    }
    setLoading(true);
    // Veri çekerken de Server Action'ı kullanıyoruz
    const data = await getChaptersAction(mangaId); 
    setChapters((data as unknown as Chapter[]) || []); 
    setLoading(false);
  };

  const handleDelete = async (chapterId: string) => {
    if (!confirm("Bölümü silmek istediğine emin misin?")) return;
    try {
      // DÜZELTME: Doğru fonksiyon adını kullanıyoruz
      await deleteChapterAction(chapterId); 
      
      // UI'dan görsel olarak sil
      setChapters(chapters.filter((c) => c.id !== chapterId));
      alert("Bölüm başarıyla silindi.");
    } catch (e) {
      alert("Hata oluştu.");
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl">
      <h2 className="text-xl font-bold mb-4 text-purple-400">Bölüm ve Resim Kontrolü</h2>
      
      <select 
        className="w-full bg-gray-800 p-3 rounded border border-gray-700 mb-6 text-white outline-none focus:border-purple-500 transition"
        onChange={(e) => handleSelect(e.target.value)}
        value={selectedManga}
      >
        <option value="">İncelenecek Mangayı Seç...</option>
        {mangas.map((m) => (
          <option key={m.id} value={m.id}>{m.title}</option>
        ))}
      </select>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {loading && <p className="text-gray-500 text-center animate-pulse">Yükleniyor...</p>}
        
        {!loading && chapters.length === 0 && selectedManga && (
            <div className="p-4 text-center border border-dashed border-gray-700 rounded-lg text-gray-500">Bu mangaya ait bölüm bulunamadı.</div>
        )}

        {chapters.map((chapter) => (
          <div key={chapter.id} className="bg-gray-800 rounded border border-gray-700 overflow-hidden shadow-md">
            {/* Bölüm Başlığı */}
            <div className="p-3 flex justify-between items-center hover:bg-gray-700 transition">
              <div className="flex items-center gap-3">
                <span className="font-bold text-green-400">#{chapter.chapter_number}</span>
                <span className="text-sm text-gray-300">{chapter.title || "İsimsiz"}</span>
                <span className="text-xs text-gray-500">({chapter.images?.length || 0} Sayfa)</span>
              </div>
              
              <div className="flex gap-2">
                {/* DETAY BUTONU */}
                <button 
                  onClick={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
                  className="px-3 py-1 text-xs bg-blue-900/40 text-blue-300 rounded hover:bg-blue-800 transition"
                >
                  {expandedChapter === chapter.id ? "Gizle" : "Resimleri Gör"}
                </button>

                <button 
                  onClick={() => handleDelete(chapter.id)}
                  className="px-3 py-1 text-xs bg-red-900/40 text-red-300 rounded hover:bg-red-800 transition"
                >
                  Sil
                </button>
              </div>
            </div>

            {/* AÇILIR MENÜ: RESİM LİSTESİ */}
            {expandedChapter === chapter.id && (
              <div className="bg-black p-4 text-xs font-mono text-gray-400 border-t border-gray-700">
                <p className="mb-2 text-green-500 font-bold">Yüklü Dosyalar:</p>
                <ul className="list-decimal list-inside space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                  {chapter.images?.map((url, index) => {
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