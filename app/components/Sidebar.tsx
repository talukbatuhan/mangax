import Link from "next/link";
import { Manga } from "@/app/types";

// Bu bileşene verileri dışarıdan (Page'den) göndereceğiz
export default function Sidebar({ popularMangas }: { popularMangas: Manga[] }) {
  const genres = [
    "Aksiyon",
    "Macera",
    "Komedi",
    "Dram",
    "Fantastik",
    "Korku",
    "Gizem",
    "Romantik",
    "Bilim Kurgu",
    "Spor",
    "Isekai",
  ];

  return (
    <div className="space-y-10 pl-0 lg:pl-8 border-l-0 lg:border-l border-white/10 h-full">
      {/* 1. KUTU: KATEGORİ BULUTU */}
      <div className="bg-gray-900/50 p-6 rounded-2xl border border-white/5">
        <h3 className="text-lg font-bold text-white mb-4 border-l-4 border-green-500 pl-3">
          Türler
        </h3>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <Link
              key={genre}
              href={`/search?q=${genre}`}
              className="text-xs bg-black hover:bg-green-600 text-gray-300 hover:text-white px-3 py-1.5 rounded transition border border-white/10"
            >
              {genre}
            </Link>
          ))}
        </div>
      </div>

      {/* 2. KUTU: HAFTANIN POPÜLERLERİ */}
      <div>
        <h3 className="text-lg font-bold text-white mb-6 border-l-4 border-yellow-500 pl-3">
          Popüler Seriler 🔥
        </h3>
        <div className="space-y-4">
          {popularMangas.map((manga, index) => (
            <Link
              key={manga.id}
              href={`/manga/${manga.slug}`}
              className="flex gap-4 group items-center"
            >
              {/* Sıra Numarası */}
              <span
                className={`text-2xl font-black italic ${
                  index < 3 ? "text-green-500" : "text-gray-700"
                }`}
              >
                {index + 1}
              </span>

              {/* Küçük Resim */}
              <div className="relative w-14 h-20 shrink-0 rounded overflow-hidden shadow-lg border border-white/10">
                {manga.cover_url && (
                  <img
                    src={manga.cover_url}
                    className="w-full h-full object-cover group-hover:scale-110 transition"
                  />
                )}
              </div>

              {/* Bilgi */}
              <div>
                <h4 className="font-bold text-gray-200 group-hover:text-green-400 transition line-clamp-1 text-sm">
                  {manga.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {manga.genres?.[0] || "Manga"}
                </p>

                {/* YENİ: Gerçek Sayaç */}
                {/* toLocaleString() sayıları 1.000 şeklinde noktalar */}
                <div className="text-xs text-green-500 mt-1 font-mono flex items-center gap-1">
                  <span>👁️</span> {manga.views?.toLocaleString() || 0}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. KUTU: DISCORD / REKLAM ALANI */}
      <div className="relative rounded-2xl overflow-hidden h-40 group cursor-pointer">
        <div className="absolute inset-0 bg-blue-900/80 group-hover:bg-blue-800 transition"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <span className="text-2xl mb-1">💬</span>
          <h4 className="font-bold text-white">Discord a Gel!</h4>
          <p className="text-xs text-blue-200 mt-1">
            Sohbet et, istek yap, ekibimize katıl.
          </p>
        </div>
      </div>
    </div>
  );
}
