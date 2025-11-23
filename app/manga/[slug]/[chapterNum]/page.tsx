import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import ReaderViewer from "@/app/components/ReaderViewer"; // Yeni bileşeni çağırdık

interface PageProps {
  params: Promise<{ 
    slug: string; 
    chapterNum: string; 
  }>;
}

export default async function ChapterPage({ params }: PageProps) {
  const { slug, chapterNum } = await params;
  const currentChapterNum = Number(chapterNum);

  // 1. Mangayı Bul
  const { data: manga } = await supabase
    .from("mangas")
    .select("id, title, slug")
    .eq("slug", slug)
    .single();

  if (!manga) return notFound();

  // 2. Bölümü Bul
  const { data: chapter } = await supabase
    .from("chapters")
    .select("*")
    .eq("manga_id", manga.id)
    .eq("chapter_number", currentChapterNum)
    .single();

  if (!chapter) return notFound();

  // 3. Önceki/Sonraki Bölüm Bilgisi
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

  // --- HTML DÖNDÜRMÜYORUZ, BİLEŞENE VERİ GÖNDERİYORUZ ---
  return (
    <ReaderViewer 
      images={chapter.images || []}
      prevChapter={prevChapter}
      nextChapter={nextChapter}
      mangaTitle={manga.title}
      chapterNum={currentChapterNum}
      slug={slug}
    />
  );
}