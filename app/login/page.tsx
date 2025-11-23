"use client";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/"; 

  // Supabase Client'ı (Tarayıcı versiyonu) başlatıyoruz
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
      setError("Giriş başarısız: " + error.message);
      setLoading(false);
    } else {
      // Başarılı!
      router.push(returnUrl);
      router.refresh(); // Navbar'daki "Giriş Yap" butonu değişsin diye
    }
  };

  return (
    <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-2xl w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Giriş Yap</h1>
        <p className="text-gray-400 text-sm">Devam etmek için hesabına giriş yap.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-green-500 focus:outline-none transition"
            placeholder="ornek@mail.com"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1">Şifre</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-green-500 focus:outline-none transition"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded transition disabled:opacity-50"
        >
          {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
      
      <div className="mt-6 text-center text-sm text-gray-500">
        Hesabın yok mu? <Link href="/register" className="text-green-500 hover:underline">Kayıt Ol</Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <Suspense fallback={<div>Yükleniyor...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}