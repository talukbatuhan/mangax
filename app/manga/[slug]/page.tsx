import Navbar from "@/app/components/Navbar";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

// TİP TANIMINI GÜNCELLEDİK: Promise EKLENDİ
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function MangaDetail({ params }: PageProps) {
  // KRİTİK DEĞİŞİKLİK BURADA:
  // params'ı önce 'await' ile bekleyip içindeki slug'ı alıyoruz.
  const { slug } = await params;

  // 1. Artık 'slug' değişkenini kullanabiliriz
  const { data: manga } = await supabase
    .from("mangas")
    .select("*")
    .eq("slug", slug) // params.slug yerine direkt slug yazdık
    .single();

  if (!manga) return notFound();

  // 2. Bu manganın bölümlerini çek
  const { data: chapters } = await supabase
    .from("chapters")
    .select("*")
    .eq("manga_id", manga.id)
    .order("chapter_number", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      
      {/* Üst Banner */}
      <div className="relative h-64 w-full overflow-hidden">
        {manga.cover_url && (
           <Image 
             src={manga.cover_url} 
             alt="banner" 
             fill 
             className="object-cover opacity-20 blur-sm" 
           />
        )}
        <div className="absolute bottom-0 left-0 p-8 w-full bg-gradient-to-t from-gray-950 to-transparent">
          <div className="container mx-auto flex items-end gap-6">
             <div className="relative w-32 h-48 rounded-lg overflow-hidden border-2 border-gray-700 shadow-xl hidden md:block">
               {manga.cover_url && (
                 <Image src={manga.cover_url} fill className="object-cover" alt="cover"/>
               )}
             </div>
             <div>
               <h1 className="text-4xl font-bold">{manga.title}</h1>
               <p className="text-gray-400 mt-2">{manga.author || "Yazar Bilinmiyor"}</p>
             </div>
          </div>
        </div>
      </div>

      {/* İçerik */}
      <div className="container mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-4 text-green-400">Özet</h2>
          <p className="text-gray-300 leading-relaxed mb-8">
            {manga.description || "Açıklama girilmemiş."}
          </p>

          <h2 className="text-xl font-bold mb-4 text-green-400">Bölümler</h2>
          <div className="space-y-2">
            {chapters?.map((chapter) => (
              <Link 
                href={`/manga/${slug}/${chapter.chapter_number}`} 
                key={chapter.id} 
                className="block bg-gray-900 p-4 rounded border border-gray-800 hover:bg-gray-800 hover:border-green-500 transition flex justify-between group"
              >
                <span className="font-semibold group-hover:text-green-400 transition">
                    Bölüm {chapter.chapter_number}
                </span>
                <span className="text-gray-500 text-sm">
                  {new Date(chapter.created_at).toLocaleDateString("tr-TR")}
                </span>
              </Link>
            ))}

            {(!chapters || chapters.length === 0) && (
                <p className="text-gray-500 italic">Henüz bölüm yüklenmemiş.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}