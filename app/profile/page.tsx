import Navbar from "@/app/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AvatarSelector from "@/app/components/AvatarSelector";

export default async function ProfilePage() {
  const supabase = await createClient();

  // 1. Giriş Kontrolü
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Mevcut Profili Çek
  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Profil Ayarları</h1>
        <p className="text-gray-400 mb-10">Karakterini seç ve topluluğa katıl.</p>

        {/* Avatar Seçici */}
        <AvatarSelector 
          userId={user.id} 
          currentAvatar={profile?.avatar_url || null} 
        />

        {/* Buraya ilerde "Şifre Değiştir", "Email Değiştir" vb. ekleyebilirsin */}
      </div>
    </div>
  );
}