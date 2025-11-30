import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ReaderViewer from "@/app/components/ReaderViewer";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{
    slug: string;
    chapterNum: string;
  }>;
}

// --- YENİ: DİNAMİK METADATA (Başlık Ayarı) ---
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, chapterNum } = await params;
  const supabase = await createClient();

  // Manga adını çekiyoruz
  const { data: manga } = await supabase
    .from("mangas")
    .select("title")
    .eq("slug", slug)
    .single();

  if (!manga) {
    return { title: "Bölüm Bulunamadı" };
  }

  // Tarayıcı sekmesinde görünecek yazı
  // Örnek Çıktı: "One Piece 1050. Bölüm Oku | TalucScans"
  // (Not: "| TalucScans" kısmı layout.tsx'ten otomatik gelir)
  return {
    title: `${manga.title} ${chapterNum}. Bölüm Oku`,
    description: `${manga.title} mangasının ${chapterNum}. bölümünü yüksek kalitede, Türkçe ve ücretsiz oku.`,
    openGraph: {
      title: `${manga.title} ${chapterNum}. Bölüm Oku`,
      description: `${manga.title} yeni bölüm yayında!`,
    }
  };
}

export default async function ChapterPage({ params }: PageProps) {
  const { slug, chapterNum } = await params;
  const currentChapterNum = Number(chapterNum);
  const supabase = await createClient();

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

  return (
    <ReaderViewer
      images={chapter.images || []}
      prevChapter={prevChapter}
      nextChapter={nextChapter}
      mangaTitle={manga.title}
      chapterNum={currentChapterNum}
      slug={slug}
      mangaId={manga.id}
      chapterId={chapter.id}
    />
  );
}