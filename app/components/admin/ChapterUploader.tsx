"use client";

import { useState } from "react";
import { uploadChapterAction } from "@/app/admin/actions";
import { UploadCloud, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ChapterUploader({ mangaId, mangaTitle }: { mangaId: string, mangaTitle: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    // mangaId'yi gizli olarak forma ekliyoruz
    formData.append("mangaId", mangaId);

    const res = await uploadChapterAction(formData);
    
    if (res.success) {
        alert("Bölüm başarıyla yüklendi! 🚀");
        // Formu temizle (HTMLFormElement reset)
        (e.target as HTMLFormElement).reset();
        router.refresh();
    } else {
        alert("Hata: " + res.error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 sticky top-6">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <UploadCloud className="text-green-500" /> Bölüm Yükle
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label className="text-xs text-gray-400 block mb-1">Bölüm Numarası</label>
            <input type="number" name="chapterNum" placeholder="Örn: 10" className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-green-500 outline-none" required />
        </div>
        <div>
            <label className="text-xs text-gray-400 block mb-1">Bölüm Başlığı (Opsiyonel)</label>
            <input type="text" name="title" placeholder="Örn: Savaş Başlıyor" className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-green-500 outline-none" />
        </div>
        
        {/* Dosya Alanı */}
        <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-green-500/50 transition bg-black/20 cursor-pointer relative">
            <input type="file" name="pages" multiple accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
            <div className="pointer-events-none">
                <span className="text-2xl block mb-2">📂</span>
                <span className="text-xs text-gray-400 font-bold">Resimleri Seç</span>
                <span className="text-[10px] text-gray-600 block mt-1">Toplu seçim yapabilirsin</span>
            </div>
        </div>

        <button 
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
        >
            {loading ? <Loader2 className="animate-spin" /> : "Yükle"}
        </button>
      </form>
    </div>
  );
}