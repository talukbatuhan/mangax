    "use client";

import { useState } from "react";
import { updateMangaGenres } from "@/app/admin/actions";

interface GenreEditorProps {
  mangaId: string;
  initialGenres: string[];
}

export default function GenreEditor({ mangaId, initialGenres }: GenreEditorProps) {
  const [genres, setGenres] = useState<string[]>(initialGenres || []);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  // Yeni Tür Ekle (Enter'a basınca)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = inputValue.trim();
      if (val && !genres.includes(val)) {
        setGenres([...genres, val]);
        setInputValue("");
      }
    }
  };

  // Tür Sil
  const removeGenre = (genreToRemove: string) => {
    setGenres(genres.filter((g) => g !== genreToRemove));
  };

  // Kaydet Butonu
  const handleSave = async () => {
    setLoading(true);
    try {
      await updateMangaGenres(mangaId, genres);
      alert("Türler güncellendi!");
    } catch (error) {
      alert("Hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded border border-gray-700 mt-2">
      <div className="flex flex-wrap gap-2 mb-3">
        {genres.map((genre) => (
          <span key={genre} className="bg-green-900 text-green-200 text-xs px-2 py-1 rounded flex items-center gap-1">
            {genre}
            <button onClick={() => removeGenre(genre)} className="hover:text-white font-bold">×</button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tür ekle (Enter bas)..."
          className="bg-gray-900 text-sm text-white p-2 rounded border border-gray-600 flex-1 outline-none focus:border-green-500"
        />
        <button 
          onClick={handleSave} 
          disabled={loading}
          className="bg-green-600 hover:bg-green-500 text-white text-xs px-4 py-2 rounded font-bold transition disabled:opacity-50"
        >
          {loading ? "..." : "Kaydet"}
        </button>
      </div>
    </div>
  );
}