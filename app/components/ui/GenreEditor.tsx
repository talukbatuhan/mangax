"use client";

import { useState } from "react";
import { updateMangaGenresAction } from "@/app/admin/actions"; // Action yolunu kontrol et
import { Check, Loader2 } from "lucide-react";

type Genre = {
  id: number;
  name: string;
};

type Props = {
  mangaId: string;
  allGenres: Genre[];       // Tüm türler listesi
  existingGenreIds: number[]; // Manganın şu an sahip olduğu türlerin ID'leri
};

export default function GenreEditor({ mangaId, allGenres, existingGenreIds }: Props) {
  const [selectedIds, setSelectedIds] = useState<number[]>(existingGenreIds);
  const [loading, setLoading] = useState(false);
  const [isChanged, setIsChanged] = useState(false); // Değişiklik var mı?

  // Tür seçme/kaldırma mantığı
  const toggleGenre = (id: number) => {
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter((gId) => gId !== id) // Varsa çıkar
      : [...selectedIds, id]; // Yoksa ekle

    setSelectedIds(newSelection);
    setIsChanged(true); // Değişiklik olduğunu işaretle
  };

  // Kaydetme işlemi
  const handleSave = async () => {
    setLoading(true);
    try {
      await updateMangaGenresAction(mangaId, selectedIds);
      setIsChanged(false); // Kaydedildi, buton pasif olsun
      alert("Türler güncellendi! ✅");
    } catch (error) {
      alert("Hata oluştu ❌");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-white/10 p-6 rounded-xl mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          🏷️ Türleri Düzenle
        </h3>
        
        {/* Sadece değişiklik varsa Kaydet butonu aktif olsun */}
        <button
          onClick={handleSave}
          disabled={!isChanged || loading}
          className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition
            ${isChanged 
              ? "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20" 
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
          {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {allGenres.map((genre) => {
          const isSelected = selectedIds.includes(genre.id);
          return (
            <button
              key={genre.id}
              onClick={() => toggleGenre(genre.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition select-none
                ${isSelected 
                  ? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-900/30" 
                  : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                }`}
            >
              {genre.name}
            </button>
          );
        })}
      </div>
      
      <p className="text-xs text-gray-500 mt-4">
        * Türlere tıklayarak ekleyip çıkarabilirsiniz. İşiniz bitince sağ üstteki butona basmayı unutmayın.
      </p>
    </div>
  );
}