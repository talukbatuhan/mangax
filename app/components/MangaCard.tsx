import Image from "next/image";
import Link from "next/link";
import { Manga } from "@/app/types";

export default function MangaCard({ manga }: { manga: Manga }) {
  return (
    <Link href={`/manga/${manga.slug}`} className="group relative block w-full">
      {/* Resim Alanı */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-gray-900 shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-green-500/20">
        {manga.cover_url ? (
          <Image 
            src={manga.cover_url} 
            alt={manga.title} 
            fill 
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-600">
            Resim Yok
          </div>
        )}
        
        {/* Hover'da çıkan karanlık perde ve Oku butonu */}
        <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
            <span className="px-4 py-2 bg-green-500 text-black font-bold rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                Oku ➔
            </span>
        </div>
        
        {/* Bölüm Sayısı Rozeti (Örnek) */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur text-xs font-bold text-green-400 rounded">
            Manga
        </div>
      </div>
      
      {/* Başlık Alanı */}
      <div className="mt-3">
        <h3 className="text-base font-bold text-white transition-colors group-hover:text-green-400 line-clamp-1">
          {manga.title}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {manga.author || "Yazar Bilinmiyor"}
        </p>
      </div>
    </Link>
  );
}