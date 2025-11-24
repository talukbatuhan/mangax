"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
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

    try {
      // 1. Bu kullanıcı adı (Nick) daha önce alınmış mı?
      // (Büyük küçük harf duyarsız kontrol için ilike kullanabiliriz ama şimdilik eq yeterli)
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .single();

      if (existingUser) {
        throw new Error("Bu kullanıcı adı zaten alınmış. Başka bir tane seçmelisin.");
      }

      // 2. Kayıt İşlemi (Nick'i metadata olarak gönderiyoruz)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: username, // <--- KRİTİK NOKTA BURASI (SQL bunu okuyacak)
          },
        },
      });

      if (error) throw error;

      setMessage("Kayıt başarılı! Giriş yapılıyor...");
      
      // 3. Yönlendirme
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1500);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 font-sans">
      <div className="bg-gray-900 p-8 rounded-2xl border border-white/10 shadow-2xl w-full max-w-md relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Aramıza Katıl 🚀</h1>
          <p className="text-gray-400 text-sm">Kendi kütüphaneni oluştur ve yorum yap.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {message && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
            <span>✅</span> {message}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 uppercase font-bold tracking-wide">Kullanıcı Adı</label>
            <div className="relative">
                <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-green-500 focus:outline-none transition focus:ring-1 focus:ring-green-500/50"
                placeholder="Nickin ne olsun?"
                required
                minLength={3}
                />
                <User className="absolute left-3 top-3.5 text-gray-500 w-4 h-4" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 uppercase font-bold tracking-wide">Email Adresi</label>
            <div className="relative">
                <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-green-500 focus:outline-none transition focus:ring-1 focus:ring-green-500/50"
                placeholder="ornek@mail.com"
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
                placeholder="Güçlü bir şifre seç"
                required
                minLength={6}
                />
                <Lock className="absolute left-3 top-3.5 text-gray-500 w-4 h-4" />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-black font-bold py-3.5 rounded-lg transition disabled:opacity-50 shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Kayıt Ol"}
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm text-gray-500 border-t border-white/5 pt-6">
          Zaten hesabın var mı? <Link href="/login" className="text-green-400 hover:text-green-300 font-bold transition ml-1">Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
}