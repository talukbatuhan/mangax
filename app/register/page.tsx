"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Kayıt başarılı! Giriş yapabilirsiniz.");
      // Otomatik yönlendirme (İsteğe bağlı)
      // setTimeout(() => router.push("/login"), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 text-white">
      <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Kayıt Ol</h1>
        
        {error && <div className="text-red-500 text-sm mb-4 bg-red-900/20 p-2 rounded">{error}</div>}
        {message && <div className="text-green-500 text-sm mb-4 bg-green-900/20 p-2 rounded">{message}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full bg-black p-3 rounded border border-gray-700" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Şifre</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full bg-black p-3 rounded border border-gray-700" 
              required 
            />
          </div>
          <button disabled={loading} className="w-full bg-green-600 p-3 rounded font-bold hover:bg-green-500">
            {loading ? "..." : "Kayıt Ol"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
           Zaten üye misin? <Link href="/login" className="text-green-500">Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
}