"use client"; 

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative group">
      <input
        type="text"
        placeholder="Manga ara..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        // AŞAĞIDAKİ SINIFLARI DEĞİŞTİRDİK:
        // w-32: Başlangıç genişliği (mobil için küçük)
        // md:w-48: PC başlangıç genişliği
        // focus:w-64: Tıklanınca mobildeki genişliği
        // md:focus:w-96: Tıklanınca PC'deki genişliği (Büyüyor!)
        // transition-all duration-300: Animasyon süresi
        className="bg-white/10 text-sm text-white rounded-full px-4 py-2 pl-10 pr-4 
                   w-32 md:w-48 
                   focus:w-48 md:focus:w-80 
                   focus:bg-black focus:ring-2 focus:ring-green-500 
                   focus:outline-none 
                   transition-all duration-300 ease-in-out border border-white/5"
      />
      
      {/* İkonu inputun içine, sola aldım daha şık durur */}
      <button 
        type="submit" 
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
}