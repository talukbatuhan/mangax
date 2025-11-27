"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setError("Güncelleme başarısız: " + error.message);
    } else {
      setMessage("Şifren başarıyla güncellendi! Anasayfaya yönlendiriliyorsun...");
      setTimeout(() => {
        router.push("/");
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Ambiyans Işıkları */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[20%] w-[50%] h-[50%] bg-purple-600/5 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[150px]"></div>
      </div>

      <div className="bg-gray-900 p-8 rounded-2xl border border-white/10 shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
        
        {/* Üst Çizgi */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>

        <div className="text-center mb-8 mt-2">
          <h1 className="text-2xl font-bold text-white mb-2">Yeni Şifre Belirle 🔐</h1>
          <p className="text-gray-400 text-sm">Hesabın için yeni ve güçlü bir şifre seç.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 text-sm flex items-center gap-2 animate-in fade-in">
            <span>⚠️</span> {error}
          </div>
        )}

        {message && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg mb-6 text-sm flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} /> {message}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-5">
          
          {/* Yeni Şifre */}
          <div className="group/input">
            <label className="block text-[10px] text-gray-500 mb-1.5 uppercase font-bold tracking-widest group-focus-within/input:text-purple-400 transition-colors">Yeni Şifre</label>
            <div className="relative">
               <input
                 type={showPassword ? "text" : "password"}
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 pl-11 pr-10 text-white placeholder-gray-600 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 focus:bg-black/60 outline-none transition-all duration-300 text-sm font-medium"
                 placeholder="••••••••"
                 required
               />
               <Lock className="absolute left-3.5 top-3.5 text-gray-500 w-5 h-5 group-focus-within/input:text-purple-400 transition-colors" />
               <button 
                 type="button"
                 onClick={() => setShowPassword(!showPassword)}
                 className="absolute right-3.5 top-3.5 text-gray-500 hover:text-white transition focus:outline-none"
               >
                 {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
               </button>
            </div>
          </div>

          {/* Şifre Tekrar */}
          <div className="group/input">
            <label className="block text-[10px] text-gray-500 mb-1.5 uppercase font-bold tracking-widest group-focus-within/input:text-purple-400 transition-colors">Şifreyi Onayla</label>
            <div className="relative">
               <input
                 type="password"
                 value={confirmPassword}
                 onChange={(e) => setConfirmPassword(e.target.value)}
                 className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 pl-11 text-white placeholder-gray-600 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 focus:bg-black/60 outline-none transition-all duration-300 text-sm font-medium"
                 placeholder="••••••••"
                 required
               />
               <Lock className="absolute left-3.5 top-3.5 text-gray-500 w-5 h-5 group-focus-within/input:text-purple-400 transition-colors" />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg flex items-center justify-center gap-2 transform active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Şifreyi Güncelle"}
          </button>
        </form>
      </div>
    </div>
  );
}