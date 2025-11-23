import Image from "next/image";
import Link from "next/link";
import { Manga } from "@/app/types/index";

export default function MangaCard({ manga }: { manga: Manga }) {
  return (
    <Link href={`/manga/${manga.slug}`} className="group relative block bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-green-500 transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-2/3 w-full">
        {manga.cover_url ? (
          <Image 
            src={manga.cover_url} 
            alt={manga.title} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">Kapak Yok</div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent opacity-60" />
      </div>
      
      <div className="p-3 absolute bottom-0 left-0 w-full">
        <h3 className="font-bold text-white text-lg truncate shadow-black drop-shadow-md">{manga.title}</h3>
        <p className="text-xs text-gray-300">{manga.author || "Yazar bilinmiyor"}</p>
      </div>
    </Link>
  );
}