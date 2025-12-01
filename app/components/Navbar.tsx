"use client";

import Link from "next/link";
import Image from "next/image";
import SearchBar from "./SearchBar";
import LuckyButton from "./LuckyButton"; 
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation"; 
import { User } from "@supabase/supabase-js";
import { Menu, X, LogOut, Heart, ShieldCheck } from "lucide-react";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL; 

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const segments = pathname?.split("/").filter(Boolean) || [];
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

  if (isReaderPage) return null;

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${
        isScrolled 
          ? "bg-[#0a0a0a]/95 border-white/10 shadow-lg backdrop-blur-xl" 
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between relative">
        
        {/* SOL: LOGO + ARAMA (Masaüstü) */}
        <div className="flex items-center gap-4 z-50 shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-9 h-9 group-hover:rotate-6 transition-transform duration-300">
              <Image 
                src="/GreenBook.png" 
                alt="TalucScans Logo"
                fill 
                className="object-contain"
                priority 
              />
            </div>
            <span className="text-lg font-black tracking-tighter text-white hidden sm:block">
              Taluci<span className="text-green-500">Scans</span>
            </span>
          </Link>
          
          {/* Masaüstünde Logo Yanında Arama */}
          <div className="hidden md:block w-[240px] lg:w-[280px]">
            <SearchBar />
          </div>
        </div>

        {/* ORTA: ARAMA (Mobilde) */}
        <div className="md:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] sm:w-[240px]">
          <SearchBar />
        </div>

        {/* SAĞ: HAMBURGİ MENÜ BUTONU (Mobil) */}
        <div className="flex items-center md:hidden z-50">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-300 hover:text-white p-2 transition"
          >
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* SAĞ: KULLANICI MENÜSÜ (Masaüstü) */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <LuckyButton />
          
          {user ? (
            <>
              {user.email === ADMIN_EMAIL && (
                <Link href="/admin" className="flex items-center gap-2 text-[10px] font-bold text-red-400 border border-red-500/30 px-3 py-1.5 rounded hover:bg-red-500/10 transition uppercase tracking-widest">
                  <ShieldCheck size={14} /> PANEL
                </Link>
              )}
              
              <Link href="/favorites" className="text-gray-400 hover:text-white transition p-2 hover:bg-white/5 rounded-full" title="Favorilerim">
                <Heart size={20} className="hover:fill-red-500 hover:text-red-500 transition-colors" />
              </Link>
              
              <div className="h-6 w-px bg-white/10 mx-1"></div>

              <div className="flex items-center gap-3">
                <Link href="/profile" className="relative w-9 h-9 rounded-full overflow-hidden border border-white/20 hover:border-green-500 transition group shadow-md ring-2 ring-transparent hover:ring-green-500/20">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-white text-xs font-bold">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
                <button onClick={handleSignOut} className="text-gray-500 hover:text-red-400 transition p-1" title="Çıkış Yap">
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-bold text-gray-300 hover:text-white transition px-2">
                Giriş
              </Link>
              <Link href="/register" className="px-6 py-2 bg-white text-black hover:bg-green-500 hover:text-white rounded-full text-sm font-black transition shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-green-500/40">
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* MOBİL MENÜ (AÇILIR KISIM) */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-[#0a0a0a]/98 border-b border-white/10 overflow-hidden transition-all duration-300 ease-in-out z-40 backdrop-blur-xl ${isMenuOpen ? "max-h-[600px] opacity-100 shadow-2xl" : "max-h-0 opacity-0"}`}>
        <div className="p-6 space-y-6">
          
          <div className="w-full flex justify-center pb-4 border-b border-white/5"> 
            <LuckyButton />
          </div>

          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 pb-4 mb-2 border-b border-white/5">
                <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden border border-white/10 shadow-lg">
                  {avatarUrl ? (
                    <img src={avatarUrl} className="object-cover w-full h-full" alt="Avatar" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-white font-bold text-base">{user.email?.split('@')[0]}</p>
                  <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="text-green-500 text-xs font-medium hover:underline">
                    Profil Ayarlarını Düzenle
                  </Link>
                </div>
              </div>

              <Link href="/favorites" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 text-gray-300 hover:text-white p-3 rounded-xl hover:bg-white/5 transition bg-white/[0.02]">
                <Heart size={20} className="text-red-500" /> 
                <span className="font-medium">Favori Mangalarım</span>
              </Link>

              {user.email === ADMIN_EMAIL && (
                <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 text-red-400 font-bold p-3 rounded-xl hover:bg-red-500/10 transition bg-red-500/5">
                  <ShieldCheck size={20} /> Admin Paneli
                </Link>
              )}

              <button onClick={handleSignOut} className="flex items-center gap-4 text-gray-400 hover:text-white p-3 w-full text-left transition mt-4 hover:bg-white/5 rounded-xl">
                <LogOut size={20} /> Çıkış Yap
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link href="/login" onClick={() => setIsMenuOpen(false)} className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 rounded-xl text-center border border-white/10 transition">
                Giriş Yap
              </Link>
              <Link href="/register" onClick={() => setIsMenuOpen(false)} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 rounded-xl text-center shadow-[0_0_20px_rgba(34,197,94,0.4)] transition">
                Aramıza Katıl
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}