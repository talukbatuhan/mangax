"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions";
import Image from "next/image";

// Hazır Avatar Listesi (Seed isimlerini değiştirerek farklı karakterler üretebilirsin)
const AVATAR_SEEDS = [
  "Felix", "Aneka", "Zoe", "Jack", "Callie", "Samantha", 
  "Bandit", "Misty", "Shadow", "Luna", "Bear", "Gizmo"
];

// Anime tarzı avatar API'si
const getAvatarUrl = (seed: string) => `/avatars/${seed}.png`;

export default function AvatarSelector({ userId, currentAvatar }: { userId: string, currentAvatar: string | null }) {
  const [selected, setSelected] = useState(currentAvatar || getAvatarUrl(AVATAR_SEEDS[0]));
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(userId, selected);
      alert("Profil resmi güncellendi! 😎");
    } catch (error) {
      alert("Hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
      <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
        👤 Bir Avatar Seç
      </h2>
      
      {/* Grid Yapısı (Netflix Tarzı) */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-8">
        {AVATAR_SEEDS.map((seed) => {
          const url = getAvatarUrl(seed);
          const isSelected = selected === url;

          return (
            <button
              key={seed}
              onClick={() => setSelected(url)}
              className={`relative group rounded-xl overflow-hidden transition-all duration-300 ${
                isSelected 
                  ? "ring-4 ring-green-500 scale-105" 
                  : "hover:scale-105 hover:ring-2 hover:ring-gray-500"
              }`}
            >
              <div className="aspect-square relative bg-gray-800">
                <Image 
                  src={url} 
                  alt={seed} 
                  fill 
                  className="object-cover"
                />
              </div>
              
              {/* Seçili İkonu */}
              {isSelected && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="bg-green-500 text-black rounded-full p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Kaydet Butonu */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full transition disabled:opacity-50 shadow-lg shadow-green-900/20"
        >
          {loading ? "Kaydediliyor..." : "Profil Resmini Güncelle"}
        </button>
      </div>
    </div>
  );
}