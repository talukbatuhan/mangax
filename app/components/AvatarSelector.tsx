"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions";
import Image from "next/image";
import { toast } from "sonner"; // Bildirim
import confetti from "canvas-confetti"; // Konfeti
import { useRouter } from "next/navigation"; // Yönlendirme

// Dosya isimlerin neyse buraya onları yaz (Uzantısız)
const AVATAR_SEEDS = [
  "Felix", "Aneka", "Zoe", "Jack", "Callie", "Samantha", 
  "Bandit", "Misty", "Shadow", "Luna", "Bear", "Gizmo"
];

// Yerel klasörden çekiyoruz (public/avatars içinden)
const getAvatarUrl = (seed: string) => `/avatars/${seed}.png`;

export default function AvatarSelector({ userId, currentAvatar }: { userId: string, currentAvatar: string | null }) {
  const [selected, setSelected] = useState(currentAvatar || getAvatarUrl(AVATAR_SEEDS[0]));
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setLoading(true);
    
    try {
      await updateProfile(userId, selected);
      
      // 1. KONFETİ PATLAT! 🎉
      confetti({
        particleCount: 150,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#22c55e', '#ffffff', '#000000'], // Yeşil, Beyaz, Siyah
        zIndex: 9999
      });

      // 2. ŞIK BİLDİRİM GÖSTER (Toast) ✅
      toast.success("Profil resmi güncellendi!", {
        description: "Harika görünüyorsun! Kaldığın yere dönülüyor...",
        duration: 2000, // 2 saniye ekranda kalsın
      });

      // 3. OTOMATİK GERİ DÖNÜŞ 🔙
      // Kullanıcı konfetiyi görsün diye 1.5 saniye bekleyip geri atıyoruz
      setTimeout(() => {
        router.back(); // Kullanıcı nereden geldiyse oraya döner (Anasayfa veya Manga detay)
        router.refresh(); // Gittiği sayfadaki verileri tazele (Yeni avatar görünsün)
      }, 1500);

    } catch (error) {
      toast.error("Bir hata oluştu, tekrar dene.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 relative overflow-hidden">
      
      {/* Üst Başlık ve Geri Dön Butonu */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          🎭 Karakterini Seç
        </h2>
        
        {/* Manuel Geri Dön Butonu */}
        <button 
            onClick={() => router.back()}
            className="text-sm text-gray-400 hover:text-white transition flex items-center gap-1 px-3 py-1 rounded hover:bg-white/10"
        >
            <span>✕</span> İptal
        </button>
      </div>
      
      {/* Grid Yapısı */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-8 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
        {AVATAR_SEEDS.map((seed) => {
          const url = getAvatarUrl(seed);
          const isSelected = selected === url;

          return (
            <button
              key={seed}
              onClick={() => setSelected(url)}
              className={`relative group rounded-xl overflow-hidden transition-all duration-200 ${
                isSelected 
                  ? "ring-4 ring-green-500 scale-95 opacity-100" 
                  : "hover:scale-101 opacity-70 hover:opacity-100"
              }`}
            >
              <div className="aspect-square relative bg-gray-800">
                <Image 
                  src={url} 
                  alt={seed} 
                  fill 
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 16vw" // Performans için boyutlandırma
                />
              </div>
              
              {/* Seçili İkonu */}
              {isSelected && (
                <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center animate-in fade-in zoom-in duration-300">
                  <div className="bg-green-500 text-black rounded-full p-1 shadow-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Alt Kısım: Kaydet Butonu */}
      <div className="border-t border-white/10 pt-6 flex justify-end gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-900/20 flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Güncelleniyor...
            </>
          ) : (
            "Değişiklikleri Kaydet"
          )}
        </button>
      </div>
    </div>
  );
}