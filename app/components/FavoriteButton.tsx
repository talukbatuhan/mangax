"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toggleFavorite } from "@/app/actions";
import { createClient } from "@/lib/supabase/client"; // <--- 1. DOĞRU İMPORT BU

export default function FavoriteButton({ mangaId, slug }: { mangaId: string, slug: string }) {
  const router = useRouter();
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // 2. Client'ı bileşen içinde oluşturuyoruz
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      // Artık doğru çerezleri okuyabilir
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUserId(session.user.id);
        const { data } = await supabase
          .from("favorites")
          .select("*")
          .eq("manga_id", mangaId)
          .eq("user_id", session.user.id)
          .single();
        
        if (data) setIsFav(true);
      }
      setLoading(false);
    };
    
    checkUser();
  }, [mangaId, supabase]);

  const handleClick = async () => {
    // Eğer kullanıcı yoksa login'e at
    if (!userId) {
      router.push(`/login?returnUrl=/manga/${slug}`); 
      return;
    }

    // Varsa işlemi yap
    const newState = !isFav;
    setIsFav(newState); // Hızlı tepki (Optimistic UI)
    
    await toggleFavorite(mangaId, userId);
  };

  if (loading) return <div className="w-10 h-10 bg-gray-800 rounded-full animate-pulse" />;

  return (
    <button 
      onClick={handleClick}
      className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 ${
        isFav 
          ? "bg-red-600 border-red-600 text-white shadow-[0_0_15px_red]" 
          : "bg-gray-900 border-gray-700 text-gray-400 hover:border-red-500 hover:text-red-500"
      }`}
      title={isFav ? "Favorilerden Çıkar" : "Favorilere Ekle"}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill={isFav ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    </button>
  );
}