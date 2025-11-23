import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

// TİP TANIMI GÜNCELLENDİ: params artık bir Promise
interface PageProps {
  params: Promise<{ 
    slug: string; 
    chapterNum: string; 
  }>;
}

export default async function ChapterReader({ params }: PageProps) {
  // KRİTİK DÜZELTME: params verisini await ile bekleyip açıyoruz
  const { slug, chapterNum } = await params;
  const currentChapterNum = Number(chapterNum);

  // 1. Önce Mangayı bul (ID'sini almak için)
  const { data: manga } = await supabase
    .from("mangas")
    .select("id, title, slug")
    .eq("slug", slug)
    .single();

  if (!manga) return notFound();

  // 2. Şu anki Bölümü bul
  const { data: chapter } = await supabase
    .from("chapters")
    .select("*")
    .eq("manga_id", manga.id)
    .eq("chapter_number", currentChapterNum)
    .single();

  if (!chapter) return notFound();

  // 3. Önceki ve Sonraki Bölüm Var mı Kontrol Et (Navigasyon için)
  const { data: nextChapter } = await supabase
    .from("chapters")
    .select("chapter_number")
    .eq("manga_id", manga.id)
    .eq("chapter_number", currentChapterNum + 1)
    .single();

  const { data: prevChapter } = await supabase
    .from("chapters")
    .select("chapter_number")
    .eq("manga_id", manga.id)
    .eq("chapter_number", currentChapterNum - 1)
    .single();

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center">
      
      {/* ÜST MENÜ (Sticky - Yapışkan) */}
      <div className="sticky top-0 z-50 w-full bg-gray-900/90 backdrop-blur border-b border-gray-800 p-4 flex justify-between items-center shadow-lg">
        <Link href={`/manga/${slug}`} className="text-green-500 font-bold hover:underline">
          &larr; {manga.title}
        </Link>
        <span className="font-semibold text-lg">Bölüm {currentChapterNum}</span>
        
        <div className="flex gap-2">
          {prevChapter ? (
             <Link href={`/manga/${slug}/${prevChapter.chapter_number}`} className="bg-gray-800 px-4 py-2 rounded hover:bg-gray-700 transition text-sm">
               &lt; Önceki
             </Link>
          ) : <div className="w-20"></div>}
          
          {nextChapter ? (
             <Link href={`/manga/${slug}/${nextChapter.chapter_number}`} className="bg-green-600 px-4 py-2 rounded hover:bg-green-500 transition text-sm font-bold text-white">
               Sonraki &gt;
             </Link>
          ) : <div className="w-20"></div>}
        </div>
      </div>

      {/* OKUMA ALANI (Webtoon Style) */}
      <div className="w-full max-w-3xl bg-black shadow-2xl min-h-screen">
        {chapter.images && chapter.images.map((imgUrl: string, index: number) => (
          <div key={index} className="relative w-full">
            {/* Not: Çok sayıda ve uzun resimler olduğu için burada standart <img> etiketi 
                kullanmak bazen Next/Image'den daha sorunsuz çalışır (boyut hesaplama derdi olmaz).
                Lazy loading ekledik.
            */}
            <img 
              src={imgUrl} 
              alt={`Sayfa ${index + 1}`} 
              className="w-full h-auto block" // block: Resimler arası boşluğu kapatır
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* ALT NAVİGASYON (Bölüm bitince görünen) */}
      <div className="w-full max-w-3xl p-10 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-900 mt-10 rounded-t-xl mb-10">
          {prevChapter ? (
             <Link href={`/manga/${slug}/${prevChapter.chapter_number}`} className="w-full md:flex-1 bg-gray-800 text-center py-4 rounded hover:bg-gray-700 transition">
               Önceki Bölüm
             </Link>
          ) : <div className="flex-1"></div>}

          {nextChapter ? (
             <Link href={`/manga/${slug}/${nextChapter.chapter_number}`} className="w-full md:flex-1 bg-green-600 text-center py-4 rounded hover:bg-green-500 transition font-bold text-lg">
               Sıradaki Bölüme Geç
             </Link>
          ) : (
            <div className="flex-1 text-center text-gray-500">Günceldesiniz!</div>
          )}
      </div>

    </div>
  );
}