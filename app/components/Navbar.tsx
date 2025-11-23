import Link from "next/link";
import SearchBar from "./SearchBar";
import { createClient } from "@/lib/supabase/server"; // Server Client
import { signOut } from "@/app/actions"; // Çıkış Yapma Fonksiyonu

export default async function Navbar() {
  // 1. Supabase bağlantısını kur
  const supabase = await createClient();
  
  // 2. Kullanıcıyı çek
  const { data: { user } } = await supabase.auth.getUser();

  // 3. Eğer kullanıcı varsa, Profil tablosundan Avatarını da çek
  let avatarUrl = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();
      
    avatarUrl = profile?.avatar_url;
  }

  return (
    <nav className="w-full h-16 fixed top-0 left-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-md flex items-center justify-between px-6 transition-all">
      
      {/* --- SOL TARA: LOGO --- */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:rotate-12 transition">
          T
        </div>
        <span className="text-xl font-bold tracking-tight text-white group-hover:text-green-400 transition">
          Taluc<span className="text-green-500">Scans</span>
        </span>
      </Link>
      
      {/* --- SAĞ TARAF: ARAMA + BUTONLAR --- */}
      <div className="flex items-center gap-4">
        
        {/* 1. Arama Çubuğu */}
        <SearchBar />

        {user ? (
          // --- KULLANICI GİRİŞ YAPMIŞSA ---
          <div className="flex items-center gap-4">
             
             {/* Sadece Admin Görür (Mailini buraya yaz!) */}
             {user.email === process.env.ADMIN_EMAIL && (
                <Link href="/admin" className="text-red-400 text-xs font-bold border border-red-400/30 px-2 py-1 rounded hover:bg-red-400/10 transition">
                  ADMIN
                </Link>
             )}

             {/* Kütüphanem Linki */}
             <Link href="/favorites" className="hidden md:block text-gray-300 hover:text-white text-sm font-medium transition">
                Kütüphanem
             </Link>
             
             {/* Profil Avatarı */}
             <Link 
               href="/profile" 
               className="relative w-9 h-9 rounded-md overflow-hidden border border-white/20 hover:border-green-500 transition group bg-gray-800"
               title="Profil Ayarları"
             >
                {avatarUrl ? (
                   <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                   // Avatar yoksa ismin baş harfi
                   <div className="w-full h-full bg-green-700 flex items-center justify-center font-bold text-white text-sm">
                      {user.email?.charAt(0).toUpperCase()}
                   </div>
                )}
             </Link>
             
             {/* Çıkış Yap Butonu */}
             <form action={signOut}>
               <button className="text-gray-400 hover:text-white text-xs font-medium ml-1 transition">
                 Çıkış
               </button>
             </form>
          </div>
        ) : (
          // --- MİSAFİR KULLANICI İSE ---
          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="px-5 py-2 bg-green-600 hover:bg-green-500 rounded-full text-sm font-bold transition text-white shadow-lg shadow-green-900/20"
            >
              Giriş Yap
            </Link>
            <Link 
              href="/register" 
              className="hidden md:block text-gray-400 hover:text-white text-sm font-medium transition"
            >
              Kayıt Ol
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}