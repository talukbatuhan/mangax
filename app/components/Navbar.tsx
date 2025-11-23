import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-50">
      <Link href="/" className="text-2xl font-bold text-green-500 hover:text-green-400 transition">
        MangaTR
      </Link>
      
      <div className="flex gap-4">
        <Link href="/search" className="text-gray-300 hover:text-white transition">Ara</Link>
        <Link href="/login" className="px-4 py-2 bg-green-600 rounded hover:bg-green-500 text-sm font-bold transition">
          Giriş Yap
        </Link>
      </div>
    </nav>
  );
}