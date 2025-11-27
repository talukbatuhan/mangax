'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, X, ChevronDown } from 'lucide-react';

type Genre = {
  id: number;
  name: string;
};

export default function GenreMultiSelect({ genres }: { genres: Genre[] }) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklandığında menüyü kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleGenre = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(gId => gId !== id) : [...prev, id]
    );
  };

  const removeGenre = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.filter(gId => gId !== id));
  };

  // Seçili olanların isimlerini bulmak için
  const selectedGenres = genres.filter(g => selectedIds.includes(g.id));

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="text-xs text-gray-400 uppercase font-bold mb-1.5 block">
        Türler (Çoklu Seçim)
      </label>

      {/* 1. Form Gönderimi için Gizli Input */}
      {/* Bu input, seçili ID'leri JSON formatında Server Action'a gönderir */}
      <input 
        type="hidden" 
        name="selected_genres" 
        value={JSON.stringify(selectedIds)} 
      />

      {/* 2. Seçim Kutusu Görünümü */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-black border ${isOpen ? 'border-green-500' : 'border-gray-700'} 
          min-h-[50px] px-3 py-2 rounded-lg cursor-pointer flex flex-wrap gap-2 items-center transition`}
      >
        {selectedIds.length === 0 && (
          <span className="text-gray-500 text-sm">Tür seçmek için tıklayın...</span>
        )}

        {selectedGenres.map(genre => (
          <span 
            key={genre.id} 
            className="bg-purple-500/20 text-purple-300 border border-purple-500/30 
              text-xs px-2 py-1 rounded-md flex items-center gap-1"
          >
            {genre.name}
            <button 
              type="button"
              onClick={(e) => removeGenre(genre.id, e)}
              className="hover:text-white"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        
        <div className="ml-auto">
          <ChevronDown size={16} className={`text-gray-500 transition ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* 3. Açılır Liste */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
          {genres.map(genre => {
            const isSelected = selectedIds.includes(genre.id);
            return (
              <div 
                key={genre.id}
                onClick={() => toggleGenre(genre.id)}
                className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center hover:bg-white/5 
                  ${isSelected ? 'text-green-400 bg-green-500/10' : 'text-gray-300'}`}
              >
                {genre.name}
                {isSelected && <Check size={16} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}