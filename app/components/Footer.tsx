import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-8 mt-20 text-gray-400 text-sm font-sans">
      <div className="container mx-auto px-6">
        
        {/* Üst Kısım: 4 Kolonlu Linkler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* 1. Kolon: Marka */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group w-fit">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">T</div>
                <span className="text-xl font-bold text-white">Taluc<span className="text-green-500">Scans</span></span>
            </Link>
            <p className="leading-relaxed mb-4">
              En sevdiğin mangaları yüksek kalitede, hızlı ve Türkçe olarak oku. Topluluğumuzun bir parçası ol.
            </p>
          </div>

          {/* 2. Kolon: Keşfet */}
          <div>
            <h3 className="text-white font-bold mb-4">Keşfet</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-green-500 transition">Son Eklenenler</Link></li>
              <li><Link href="/search?q=aksiyon" className="hover:text-green-500 transition">Aksiyon Mangaları</Link></li>
              <li><Link href="/search?q=romantik" className="hover:text-green-500 transition">Romantik Seriler</Link></li>
              <li><Link href="/favorites" className="hover:text-green-500 transition">Kütüphanem</Link></li>
            </ul>
          </div>

          {/* 3. Kolon: Topluluk */}
          <div>
            <h3 className="text-white font-bold mb-4">Topluluk</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-green-500 transition">Discord Sunucusu</a></li>
              <li><a href="#" className="hover:text-green-500 transition">Bağış Yap</a></li>
              <li><Link href="/register" className="hover:text-green-500 transition">Kayıt Ol</Link></li>
            </ul>
          </div>

          {/* 4. Kolon: Yasal */}
          <div>
            <h3 className="text-white font-bold mb-4">Yasal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-green-500 transition">Gizlilik Politikası</a></li>
              <li><a href="#" className="hover:text-green-500 transition">Kullanım Şartları</a></li>
              <li><a href="#" className="hover:text-green-500 transition">DMCA / Telif Hakkı</a></li>
            </ul>
          </div>
        </div>

        {/* Alt Kısım: Telif */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {currentYear} TalucScans. Tüm hakları saklıdır.</p>
          <div className="flex gap-4 opacity-50">
             <span>Made with ❤️ next.js</span>
          </div>
        </div>
      </div>
    </footer>
  );
}