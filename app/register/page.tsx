"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User, 
  Mail, 
  Lock, 
  Loader2, 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Sparkles 
} from "lucide-react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Şifre görünürlüğü için yeni state
  const [showPassword, setShowPassword] = useState(false);

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
      // 1. Kullanıcı adı kontrolü
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .single();

      if (existingUser) {
        throw new Error("Bu kullanıcı adı zaten alınmış.");
      }

      // 2. Kayıt İşlemi
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: username },
        },
      });

      if (error) throw error;

      setMessage("Kayıt başarılı! Giriş yapılıyor...");
      
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
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Ambiyans Işıkları */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-green-600/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      {/* --- LOGO --- */}
      <div className="absolute top-8 left-8 hidden md:block">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-400 rounded flex items-center justify-center text-black font-black text-lg shadow-[0_0_15px_rgba(34,197,94,0.4)] group-hover:rotate-6 transition-transform">
            T
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Taluc<span className="text-green-500">Scans</span>
          </span>
        </Link>
      </div>

      {/* --- KAYIT KARTI --- */}
      <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl w-full max-w-md relative overflow-hidden group">
        
        {/* Kartın üzerinde gezinen hafif parlama */}
        <div className="absolute -inset-1 bg-gradient-to-br from-green-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition duration-1000 blur-xl -z-10"></div>
        
        {/* Üst Çizgi Efekti */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>

        <div className="text-center mb-8 mt-2">
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            Aramıza Katıl <span className="text-2xl">🚀</span>
          </h1>
          <p className="text-gray-400 text-sm">Kendi kütüphaneni oluştur, yorum yap ve topluluğun parçası ol.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl mb-6 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <Sparkles size={16} />
            {message}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          
          {/* Kullanıcı Adı */}
          <div className="group/input">
            <label className="block text-[10px] text-gray-500 mb-1.5 uppercase font-bold tracking-widest group-focus-within/input:text-green-500 transition-colors">Kullanıcı Adı</label>
            <div className="relative">
                <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 pl-11 text-white placeholder-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 focus:bg-black/60 outline-none transition-all duration-300 text-sm font-medium"
                placeholder="Nickin ne olsun?"
                required
                minLength={3}
                />
                <User className="absolute left-3.5 top-3.5 text-gray-500 w-5 h-5 group-focus-within/input:text-green-400 transition-colors" />
            </div>
          </div>

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
          
          {/* Şifre Alanı (Güncellendi) */}
          <div className="group/input">
            <label className="block text-[10px] text-gray-500 mb-1.5 uppercase font-bold tracking-widest group-focus-within/input:text-green-500 transition-colors">Şifre</label>
            <div className="relative">
                <input
                type={showPassword ? "text" : "password"} // Dinamik tip
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                // Sağ tarafa buton geleceği için pr-10 yetmezse pr-12 yapılabilir, şu an standart bıraktım.
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 pl-11 pr-12 text-white placeholder-gray-600 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 focus:bg-black/60 outline-none transition-all duration-300 text-sm font-medium"
                placeholder="Güçlü bir şifre seç"
                required
                minLength={6}
                />
                <Lock className="absolute left-3.5 top-3.5 text-gray-500 w-5 h-5 group-focus-within/input:text-green-400 transition-colors" />
                
                {/* Göz İkonu Butonu */}
                <button 
                  type="button" // Form submit'i engellemek için önemli
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-500 hover:text-white transition cursor-pointer z-10"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] flex items-center justify-center gap-2 group/btn transform hover:-translate-y-0.5 active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                <>
                    Kayıt Ol <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-sm text-gray-500 mb-4">Zaten hesabın var mı?</p>
          <Link 
             href="/login" 
             className="inline-flex items-center gap-2 text-sm font-bold text-white bg-white/5 hover:bg-white/10 px-6 py-2.5 rounded-full transition border border-white/5 hover:border-white/20 group/login"
          >
             Giriş Yap
          </Link>
        </div>
      </div>
    </div>
  );
}