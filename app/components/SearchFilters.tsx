"use client";

import { useRouter, useSearchParams } from "next/navigation";

const GENRES = [
  "Aksiyon", "Macera", "Komedi", "Dram", "Fantastik", 
  "Korku", "Gizem", "Romantik", "Bilim Kurgu", "Spor", "Isekai", "Okul"
];

const SORT_OPTIONS = [
  { label: "En Yeni", value: "created_at" },
  { label: "En Çok Okunan", value: "views" },
  { label: "En Yüksek Puan", value: "rating_avg" },
];

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL'den mevcut değerleri al (State kullanmaya gerek yok, URL tek gerçek kaynak)
  const currentGenre = searchParams.get("genre") || "";
  const currentSort = searchParams.get("sort") || "created_at";

  // Filtreleme Fonksiyonu
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      // Eğer zaten seçiliyse kaldır (Toggle mantığı - Opsiyonel)
      if (key === "genre" && params.get(key) === value) {
         params.delete(key);
      } else {
         params.set(key, value);
      }
    } else {
      params.delete(key);
    }

    // Router push işlemi sadece kullanıcı tıkladığında gerçekleşir
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/search");
  };

  return (
    <div className="bg-gray-900 p-6 rounded-xl border border-white/10 h-fit sticky top-24">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-white">Filtrele</h3>
        {(currentGenre || currentSort !== "created_at") && (
            <button 
                onClick={clearFilters}
                className="text-xs text-red-400 hover:text-red-300 transition"
            >
                Temizle
            </button>
        )}
      </div>

      {/* Sıralama */}
      <div className="mb-8">
        <h4 className="text-sm text-gray-500 font-bold mb-3 uppercase tracking-wider">Sıralama</h4>
        <div className="space-y-2">
          {SORT_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${currentSort === option.value ? "border-green-500" : "border-gray-600"}`}>
                {currentSort === option.value && <div className="w-2 h-2 bg-green-500 rounded-full" />}
              </div>
              <input 
                type="radio" 
                name="sort" 
                value={option.value} 
                checked={currentSort === option.value}
                onChange={() => updateFilter("sort", option.value)}
                className="hidden" 
              />
              <span className={`text-sm transition ${currentSort === option.value ? "text-white font-medium" : "text-gray-400 group-hover:text-gray-300"}`}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Türler */}
      <div>
        <h4 className="text-sm text-gray-500 font-bold mb-3 uppercase tracking-wider">Türler</h4>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => updateFilter("genre", genre)}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                currentGenre === genre 
                  ? "bg-green-600 border-green-600 text-white shadow-[0_0_10px_#22c55e]" 
                  : "bg-black/40 border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}