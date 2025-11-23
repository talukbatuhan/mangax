"use client"; // Tıklama olayları için Client Component yapıyoruz

import Link from "next/link";
import SearchBar from "./SearchBar";
import { createClient } from "@/lib/supabase/client"; // Browser Client
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Mobil menü açık mı?
  const router = useRouter();
  const supabase = createClient();

  // Kullanıcı verisini çekme (Client Side)
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", user.id)
          .single();
        setAvatarUrl(profile?.avatar_url || null);
      }
    };
    getUser();
  }, [supabase]);

  // Çıkış Yap Fonksiyonu
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
    router.refresh();
    setIsMenuOpen(false); // Menüyü kapat
  };

  return (
    <nav className="w-full fixed top-0 left-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-md transition-all">
      <div className="px-6 h-16 flex items-center justify-between">
        
        {/* --- SOL: LOGO --- */}
        <Link href="/" className="flex items-center gap-2 group z-50">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:rotate-12 transition">
            T
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-green-400 transition">
            Taluc<span className="text-green-500">Scans</span>
          </span>
        </Link>

        {/* --- ORTA: MOBİL HAMBURGER BUTONU --- */}
        <div className="md:hidden flex items-center gap-4">
            {/* Mobilde Arama İkonu (Opsiyonel, yer kazanmak için sadece ikon olabilir) */}
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
            >
              {/* Menü Açık/Kapalı İkon Değişimi */}
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-green-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
        </div>

        {/* --- SAĞ: DESKTOP MENÜ (Mobil'de Gizli: hidden md:flex) --- */}
        <div className="hidden md:flex items-center gap-4">
          <SearchBar />

          {user ? (
            <div className="flex items-center gap-4">
               {user.email === 'senin-mail-adresin@gmail.com' && (
                  <Link href="/admin" className="text-red-400 text-xs font-bold border border-red-400/30 px-2 py-1 rounded hover:bg-red-400/10 transition">
                    ADMIN
                  </Link>
               )}

               <Link href="/favorites" className="text-gray-300 hover:text-white text-sm font-medium transition">
                  Kütüphanem
               </Link>
               
               <Link href="/profile" className="relative w-9 h-9 rounded-md overflow-hidden border border-white/20 hover:border-green-500 transition group bg-gray-800">
                  {avatarUrl ? (
                     <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                     <div className="w-full h-full bg-green-700 flex items-center justify-center font-bold text-white text-sm">
                        {user.email?.charAt(0).toUpperCase()}
                     </div>
                  )}
               </Link>
               
               <button onClick={handleSignOut} className="text-gray-400 hover:text-white text-xs font-medium ml-1 transition">
                 Çıkış
               </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="px-5 py-2 bg-green-600 hover:bg-green-500 rounded-full text-sm font-bold transition text-white shadow-lg">
                Giriş Yap
              </Link>
              <Link href="/register" className="text-gray-400 hover:text-white text-sm font-medium transition">
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* --- MOBİL MENÜ (AÇILIR PENCERE) --- */}
      {/* Sadece isMenuOpen true ise ve mobildeysek görünür */}
      <div className={`md:hidden bg-black border-b border-white/10 overflow-hidden transition-all duration-300 ${isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-6 py-4 space-y-4 flex flex-col items-center">
            
            {/* Mobilde Arama Çubuğu Buraya Gelir */}
            <div className="w-full">
               <SearchBar />
            </div>

            {user ? (
              <>
                {user.email === 'senin-mail-adresin@gmail.com' && (
                    <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="text-red-400 font-bold w-full text-center py-2 border border-red-900 rounded bg-red-900/10">
                      ADMIN PANELİ
                    </Link>
                )}
                
                <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="text-white font-medium w-full text-center py-2 hover:bg-white/5 rounded">
                   Profilim ({user.email?.split('@')[0]})
                </Link>

                <Link href="/favorites" onClick={() => setIsMenuOpen(false)} className="text-gray-300 w-full text-center py-2 hover:bg-white/5 rounded">
                   Kütüphanem
                </Link>

                <button onClick={handleSignOut} className="text-gray-400 text-sm w-full text-center py-2">
                   Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg text-center">
                  Giriş Yap
                </Link>
                <Link href="/register" onClick={() => setIsMenuOpen(false)} className="w-full text-gray-300 py-2 text-center">
                  Kayıt Ol
                </Link>
              </>
            )}
        </div>
      </div>
    </nav>
  );
}