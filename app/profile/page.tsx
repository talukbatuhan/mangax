import Navbar from "@/app/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AvatarSelector from "@/app/components/AvatarSelector";
import Link from "next/link";
import { History, Heart, Settings } from "lucide-react"; // İkonlar

export default async function ProfilePage() {
  const supabase = await createClient();

  // 1. Giriş Kontrolü
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Mevcut Profili Çek
  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url, username") // username de lazım olabilir
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        
        {/* Profil Başlığı */}
        <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">
                Selam, {profile?.username || "Okuyucu"} 👋
            </h1>
            <p className="text-gray-400">Profilini düzenle ve kütüphaneni yönet.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* SOL: Avatar Seçici */}
            <div className="md:col-span-2">
                <AvatarSelector 
                  userId={user.id} 
                  currentAvatar={profile?.avatar_url || null} 
                />
            </div>

            {/* SAĞ: Hızlı Menü */}
            <div className="space-y-4">
                <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                    <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest mb-4">
                        Kütüphane & Geçmiş
                    </h3>
                    
                    <div className="space-y-2">
                        <Link 
                            href="/history" 
                            className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition text-gray-200 hover:text-white group"
                        >
                            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition">
                                <History size={20} />
                            </div>
                            <span className="font-medium">Okuma Geçmişi</span>
                        </Link>

                        <Link 
                            href="/favorites" 
                            className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition text-gray-200 hover:text-white group"
                        >
                            <div className="p-2 bg-red-500/10 text-red-400 rounded-lg group-hover:bg-red-500 group-hover:text-white transition">
                                <Heart size={20} />
                            </div>
                            <span className="font-medium">Favorilerim</span>
                        </Link>
                    </div>
                </div>

                {/* Diğer Ayarlar (İlerisi için yer tutucu) */}
                <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 opacity-50 pointer-events-none">
                    <h3 className="font-bold text-gray-500 uppercase text-xs tracking-widest mb-4">
                        Hesap Ayarları (Yakında)
                    </h3>
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl text-gray-400">
                        <Settings size={20} />
                        <span>Şifre Değiştir</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}