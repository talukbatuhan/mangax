"use client";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2 } from "lucide-react"; // İkonlar

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="bg-gray-900 p-8 rounded-2xl border border-white/10 shadow-2xl w-full max-w-md relative overflow-hidden">
      {/* Üst Çizgi Efekti */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Tekrar Hoş Geldin 👋</h1>
        <p className="text-gray-400 text-sm">Kaldığın yerden devam et.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
          <span>🚫</span> {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-xs text-gray-400 mb-1.5 uppercase font-bold tracking-wide">Email</label>
          <div className="relative">
             <input
               type="email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               className="w-full bg-black/50 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-green-500 focus:outline-none transition focus:ring-1 focus:ring-green-500/50"
               required
             />
             <Mail className="absolute left-3 top-3.5 text-gray-500 w-4 h-4" />
          </div>
        </div>
        
        <div>
          <label className="block text-xs text-gray-400 mb-1.5 uppercase font-bold tracking-wide">Şifre</label>
          <div className="relative">
             <input
               type="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               className="w-full bg-black/50 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-green-500 focus:outline-none transition focus:ring-1 focus:ring-green-500/50"
               required
             />
             <Lock className="absolute left-3 top-3.5 text-gray-500 w-4 h-4" />
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-black font-bold py-3.5 rounded-lg transition disabled:opacity-50 shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Giriş Yap"}
        </button>
      </form>
      
      <div className="mt-8 text-center text-sm text-gray-500 border-t border-white/5 pt-6">
        Hesabın yok mu? <Link href="/register" className="text-green-400 hover:text-green-300 font-bold transition ml-1">Kayıt Ol</Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans">
      <Suspense fallback={<div>Yükleniyor...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}