"use client";

import Link from "next/link";
import SearchBar from "./SearchBar";
import LuckyButton from "./LuckyButton"; 
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation"; 
import { User } from "@supabase/supabase-js";
import { Menu, X, User as UserIcon, LogOut, Heart, ShieldCheck } from "lucide-react";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL; 

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  // --- SAYFA KONTROLÜ (GÜNCELLENDİ) ---
  const segments = pathname?.split("/").filter(Boolean) || [];
  
  // Eğer okuma sayfasındaysak (3 parça: manga/isim/bölüm), Navbar'ı GİZLE.
  const isReaderPage = segments[0] === "manga" && segments.length === 3;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
    router.refresh();
    setIsMenuOpen(false);
  };

  // Okuma sayfasındaysak hiç render etme (null dön)
  if (isReaderPage) return null;

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${
        isScrolled 
          ? "bg-[#0a0a0a]/95 border-white/10 shadow-lg backdrop-blur-xl" 
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* SOL: LOGO */}
        <Link href="/" className="flex items-center gap-2 group z-50 shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-400 rounded flex items-center justify-center text-black font-black text-xl shadow-[0_0_15px_rgba(34,197,94,0.4)] group-hover:rotate-6 transition-transform">
            T
          </div>
          <span className="text-lg font-bold tracking-tight text-white hidden sm:block">
            Taluc<span className="text-green-500">Scans</span>
          </span>
        </Link>

        {/* ORTA: ARAMA + LUCKY BUTTON (Masaüstü) */}
        <div className="hidden md:flex flex-1 items-center justify-end gap-4 mr-6">
           <div className="shrink-0">
              <LuckyButton />
           </div>
           <div className="relative">
              <SearchBar />
           </div>
        </div>

        {/* MOBİL MENÜ BUTONU */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-gray-300 hover:text-white p-2 transition z-50"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* SAĞ: KULLANICI MENÜSÜ */}
        <div className="hidden md:flex items-center gap-6 border-l border-white/10 pl-6">
          {user ? (
            <>
               {user.email === ADMIN_EMAIL && (
                  <Link href="/admin" className="flex items-center gap-2 text-xs font-bold text-red-400 border border-red-500/30 px-3 py-1.5 rounded hover:bg-red-500/10 transition uppercase tracking-wider">
                    <ShieldCheck size={14} /> PANEL
                  </Link>
               )}
               <Link href="/favorites" className="text-gray-400 hover:text-white transition" title="Favorilerim">
                  <Heart size={20} className="hover:fill-red-500 hover:text-red-500 transition-colors" />
               </Link>
               <div className="flex items-center gap-3">
                 <Link href="/profile" className="relative w-9 h-9 rounded-full overflow-hidden border border-white/20 hover:border-green-500 transition group shadow-md">
                    {avatarUrl ? (
                       <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                       <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-white text-xs font-bold">
                          {user.email?.charAt(0).toUpperCase()}
                       </div>
                    )}
                 </Link>
                 <button onClick={handleSignOut} className="text-gray-500 hover:text-red-400 transition" title="Çıkış Yap">
                   <LogOut size={18} />
                 </button>
               </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-bold text-gray-300 hover:text-white transition">
                Giriş
              </Link>
              <Link href="/register" className="px-5 py-2 bg-white text-black hover:bg-green-500 hover:text-white rounded-full text-sm font-bold transition shadow-lg hover:shadow-green-500/20">
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* MOBİL MENÜ */}
      <div className={`md:hidden absolute top-0 left-0 w-full bg-[#0f0f0f] border-b border-white/10 overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-[600px]  opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="p-6 space-y-6">
            <div className="w-full space-y-4"> 
               <div className="flex justify-center w-full">
                  <SearchBar />
               </div>
               <div className="flex justify-center w-full">
                  <LuckyButton />
               </div>
            </div>

            {user ? (
              <div className="space-y-4 border-t border-white/5 pt-4">
                <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                    <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-white/10">
                        {avatarUrl ? <img src={avatarUrl} className="object-cover w-full h-full" alt="Avatar" /> : <div className="w-full h-full flex items-center justify-center text-white">{user.email?.charAt(0).toUpperCase()}</div>}
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm">{user.email?.split('@')[0]}</p>
                        <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="text-green-500 text-xs hover:underline">Profil Ayarları</Link>
                    </div>
                </div>

                <Link href="/favorites" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-gray-300 hover:text-white p-2 rounded hover:bg-white/5 transition">
                   <Heart size={18} /> Kütüphanem
                </Link>

                {user.email === ADMIN_EMAIL && (
                    <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-red-400 font-bold p-2 rounded hover:bg-red-500/10 transition">
                      <ShieldCheck size={18} /> Admin Paneli
                    </Link>
                )}

                <button onClick={handleSignOut} className="flex items-center gap-3 text-gray-500 hover:text-red-400 p-2 w-full text-left transition">
                   <LogOut size={18} /> Çıkış Yap
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 border-t border-white/5 pt-4">
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="w-full bg-white/5 text-white font-bold py-3 rounded-full text-center border border-white/10">
                  Giriş Yap
                </Link>
                <Link href="/register" onClick={() => setIsMenuOpen(false)} className="w-full bg-green-600 text-white font-bold py-3 rounded-full text-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                  Aramıza Katıl
                </Link>
              </div>
            )}
        </div>
      </div>
    </nav>
  );
}