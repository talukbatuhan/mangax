"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/update-password`, // Şifre değiştirme sayfasına yönlendir
    });

    if (error) {
      setError("İşlem başarısız: " + error.message);
    } else {
      setMessage("Sıfırlama bağlantısı e-posta adresine gönderildi! Lütfen spam kutunu da kontrol et.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[150px]"></div>
      </div>

      <div className="bg-gray-900 p-8 rounded-2xl border border-white/10 shadow-2xl w-full max-w-md relative z-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

        <Link href="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-6 transition">
            <ArrowLeft size={16} /> Giriş e Dön
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Şifremi Unuttum 🔒</h1>
          <p className="text-gray-400 text-sm">E-posta adresini gir, sana sıfırlama linki gönderelim.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
            <span>🚫</span> {error}
          </div>
        )}

        {message && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
            <CheckCircle2 size={16} /> {message}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-5">
          <div className="group/input">
            <label className="block text-[10px] text-gray-500 mb-1.5 uppercase font-bold tracking-widest">Email Adresi</label>
            <div className="relative">
                <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 pl-11 text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 focus:bg-black/60 outline-none transition-all duration-300 text-sm font-medium"
                placeholder="ornek@mail.com"
                required
                />
                <Mail className="absolute left-3.5 top-3.5 text-gray-500 w-5 h-5 group-focus-within/input:text-blue-400 transition-colors" />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Sıfırlama Linki Gönder"}
          </button>
        </form>
      </div>
    </div>
  );
}