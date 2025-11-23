import Link from "next/link";
import SearchBar from "./SearchBar";

export default function Navbar() {
  return (
    <nav className="w-full h-16 fixed top-0 left-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-md flex items-center justify-between px-6 transition-all">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:rotate-12 transition">
          T
        </div>
        <span className="text-xl font-bold tracking-tight text-white group-hover:text-green-400 transition">
          Taluc<span className="text-green-500">Scans</span>
        </span>
      </Link>

      <div className="flex items-center gap-4">
        <SearchBar />

        {/* Kullanıcı Girişi Butonu */}
        <Link
          href="/login" // Henüz yapmadık ama yeri hazır olsun
          className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm font-medium transition text-gray-200 border border-white/10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
          </svg>
          Giriş Yap
        </Link>

        <Link
          href="/favorites"
          className="text-gray-300 hover:text-white transition text-sm font-medium"
        >
          Kütüphanem
        </Link>
      </div>
    </nav>
  );
}
