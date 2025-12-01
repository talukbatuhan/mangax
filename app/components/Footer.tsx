import Link from "next/link";
import { Github, Twitter, Disc as Discord } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#050505] border-t border-white/5 pt-16 pb-8 mt-auto overflow-hidden">
      
      {/* Arkaplan Deseni (Grid) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      {/* Not: 'bg-linear-to-b' yerine doğrusu 'bg-gradient-to-b' olmalı, onu düzelttim */}
      <div className="absolute top-0 left-0 w-full h-24 bg-linear-to-b from-[#0a0a0a] to-transparent pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        {/* DÜZENLEME: md:grid-cols-4 yerine md:grid-cols-3 yaptık (3 parça olduğu için) */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-12 gap-x-8 mb-12">
          
          {/* 1. Marka Kısımı */}
          <div className="col-span-2 md:col-span-1 text-center md:text-left flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center gap-2 mb-4 group w-fit">
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-black font-black text-xl">T</div>
                <span className="text-xl font-bold text-white">Taluci<span className="text-green-500">Scans</span></span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-sm">
              Yüksek kalitede, hızlı ve güncel manga okuma platformu. Topluluğun gücüyle büyüyoruz.
            </p>
            {/* Sosyal Medya */}
            <div className="flex gap-4">
                <a href="#" className="text-gray-500 hover:text-white transition"><Discord size={20} /></a>
                <a href="#" className="text-gray-500 hover:text-white transition"><Twitter size={20} /></a>
                <a href="#" className="text-gray-500 hover:text-white transition"><Github size={20} /></a>
            </div>
          </div>

          {/* 2. Keşfet (ORTALANDI) */}
          {/* flex flex-col items-center ekleyerek hem mobilde hem pc'de ortaladık */}
          <div className="flex flex-col items-center w-full">
            <div className="text-center"> {/* İçerik metnini de ortalamak için */}
                <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Keşfet</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-green-400 transition">Son Güncellemeler</Link></li>
                <li><Link href="/search?sort=views" className="hover:text-green-400 transition">Popüler Seriler</Link></li>
                <li><Link href="/search?genre=Aksiyon" className="hover:text-green-400 transition">Aksiyon Mangaları</Link></li>
                <li><Link href="/search?sort=rating_avg" className="hover:text-green-400 transition">En Çok Beğenilenler</Link></li>
                </ul>
            </div>
          </div>

          {/* 3. Üyelik (ORTALANDI) */}
          {/* flex flex-col items-center ekleyerek hem mobilde hem pc'de ortaladık */}
          <div className="flex flex-col items-center w-full">
            <div className="text-center">
                <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Hesap</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/login" className="hover:text-green-400 transition">Giriş Yap</Link></li>
                <li><Link href="/register" className="hover:text-green-400 transition">Kayıt Ol</Link></li>
                <li><Link href="/favorites" className="hover:text-green-400 transition">Kütüphanem</Link></li>
                <li><Link href="/profile" className="hover:text-green-400 transition">Profil Ayarları</Link></li>
                </ul>
            </div>
          </div>
          
        </div>
      </div>
    </footer>
  );
}