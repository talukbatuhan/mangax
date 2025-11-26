"use client";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, ArrowRight, Sparkles, Eye, EyeOff } from "lucide-react"; // Göz ikonları eklendi

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Şifre görünürlüğü
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/"; 

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Giriş başarısız: Bilgilerini kontrol et.");
      setLoading(false);
    } else {
      router.push(returnUrl);
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-md relative z-10">
      
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-400 rounded-lg flex items-center justify-center text-black font-black text-2xl shadow-[0_0_20px_rgba(34,197,94,0.5)] group-hover:rotate-12 transition-transform duration-500">
            T
          </div>
          <span className="text-2xl font-black tracking-tight text-white drop-shadow-lg">
            Taluc<span className="text-green-500">Scans</span>
          </span>
        </Link>
      </div>

      {/* Kart */}
      <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
        
        <div className="absolute -inset-1 bg-gradient-to-r from-green-600/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-1000 blur-xl -z-10"></div>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            Tekrar Hoş Geldin <span className="text-2xl">👋</span>
          </h1>
          <p className="text-gray-400 text-sm">Kaldığın bölümden devam etmek için giriş yap.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Email */}
          <div className="group/input">
            <label className="block text-[10px] text-gray-500 mb-1.5 uppercase font-bold tracking-widest group-focus-within/input:text-green-500 transition-colors">Email Adresi</label>
            <div className="relative">
               <input
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 pl-11 text-white placeholder-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 focus:bg-black/60 outline-none transition-all duration-300 text-sm font-medium"
                 placeholder="ornek@mail.com"
                 required
               />
               <Mail className="absolute left-3.5 top-3.5 text-gray-500 w-5 h-5 group-focus-within/input:text-green-400 transition-colors" />
            </div>
          </div>
          
          {/* Şifre */}
          <div className="group/input">
            <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] text-gray-500 uppercase font-bold tracking-widest group-focus-within/input:text-green-500 transition-colors">Şifre</label>
                {/* Şifremi Unuttum Linki */}
                <Link href="/forgot-password" className="text-[10px] text-gray-500 hover:text-white transition font-medium">
                    Şifremi Unuttum?
                </Link>
            </div>
            <div className="relative">
               <input
                 // type dinamik olarak değişiyor
                 type={showPassword ? "text" : "password"}
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 pl-11 pr-10 text-white placeholder-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 focus:bg-black/60 outline-none transition-all duration-300 text-sm font-medium"
                 placeholder="••••••••"
                 required
               />
               <Lock className="absolute left-3.5 top-3.5 text-gray-500 w-5 h-5 group-focus-within/input:text-green-400 transition-colors" />
               
               {/* Göz İkonu Butonu */}
               <button 
                 type="button"
                 onClick={() => setShowPassword(!showPassword)}
                 className="absolute right-3.5 top-3.5 text-gray-500 hover:text-white transition"
               >
                 {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
               </button>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] flex items-center justify-center gap-2 group/btn transform hover:-translate-y-0.5 active:scale-95"
          >
            {loading ? (
                <Loader2 className="animate-spin w-5 h-5" />
            ) : (
                <>
                    Giriş Yap
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-sm text-gray-500 mb-4">Henüz hesabın yok mu?</p>
          <Link 
            href="/register" 
            className="inline-flex items-center gap-2 text-sm font-bold text-white bg-white/5 hover:bg-white/10 px-6 py-2.5 rounded-full transition border border-white/5 hover:border-white/20 group/reg"
          >
            <Sparkles size={16} className="text-yellow-400 group-hover/reg:rotate-12 transition-transform" />
            Ücretsiz Kayıt Ol
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[150px] -z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <Suspense fallback={<div className="text-green-500 animate-pulse">Yükleniyor...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}