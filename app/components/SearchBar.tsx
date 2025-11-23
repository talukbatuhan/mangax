"use client"; // Bu bir Client Component (Etkileşim var)

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // Sayfanın yenilenmesini engelle
    if (!query.trim()) return; // Boşsa işlem yapma

    // Kullanıcıyı arama sayfasına yönlendir
    // Örn: /search?q=naruto
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <input
        type="text"
        placeholder="Manga ara..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-gray-800 text-sm text-white rounded-full px-4 py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 w-40 md:w-64 transition-all"
      />
      <button 
        type="submit" 
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
      >
        🔍
      </button>
    </form>
  );
}