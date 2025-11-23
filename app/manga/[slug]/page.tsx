import Navbar from "@/app/components/Navbar";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import FavoriteButton from "@/app/components/FavoriteButton"; // <--- 1. IMPORT ET

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function MangaDetail({ params }: PageProps) {
  const { slug } = await params;

  // 1. Mangayı Bul
  const { data: manga } = await supabase
    .from("mangas")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!manga) return notFound();

  // 2. Bölümleri Çek
  const { data: chapters } = await supabase
    .from("chapters")
    .select("*")
    .eq("manga_id", manga.id)
    .order("chapter_number", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <Navbar />

      {/* Üst Banner */}
      <div className="relative h-80 w-full overflow-hidden">
        {manga.cover_url && (
          <Image
            src={manga.cover_url}
            alt="banner"
            fill
            className="object-cover opacity-20 blur-md"
          />
        )}
        <div className="absolute bottom-0 left-0 p-8 w-full bg-gradient-to-t from-gray-950 to-transparent">
          <div className="container mx-auto flex items-end gap-8">
            {/* Küçük Kapak Resmi */}
            <div className="relative w-40 h-60 rounded-lg overflow-hidden border-4 border-gray-800 shadow-2xl hidden md:block shrink-0">
              {manga.cover_url && (
                <Image
                  src={manga.cover_url}
                  fill
                  className="object-cover"
                  alt="cover"
                />
              )}
            </div>

            <div className="flex-1 mb-4">
              {/* --- BURASI KRİTİK NOKTA --- */}
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
                  {manga.title}
                </h1>

                {/* GÜNCELLEME: slug bilgisini de gönderiyoruz */}
                <FavoriteButton mangaId={manga.id} slug={manga.slug} />
              </div>

              <p className="text-gray-400 text-lg font-medium">
                {manga.author || "Yazar Bilinmiyor"}
              </p>

              {/* Türler (Varsa gösterelim) */}
              {manga.genres && (
                <div className="flex gap-2 mt-3">
                  {manga.genres.map((g: string) => (
                    <span
                      key={g}
                      className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300 border border-white/5"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* İçerik */}
      <div className="container mx-auto px-6 py-10 grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-4 text-green-400 border-l-4 border-green-500 pl-3">
            Özet
          </h2>
          <p className="text-gray-300 leading-relaxed mb-10 text-lg">
            {manga.description || "Açıklama girilmemiş."}
          </p>

          <h2 className="text-2xl font-bold mb-4 text-green-400 border-l-4 border-green-500 pl-3">
            Bölümler
          </h2>
          <div className="space-y-3">
            {chapters?.map((chapter) => (
              <Link
                href={`/manga/${slug}/${chapter.chapter_number}`}
                key={chapter.id}
                className="block bg-gray-900/50 p-4 rounded-xl border border-gray-800 hover:bg-gray-800 hover:border-green-500 transition flex justify-between group items-center"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-green-500 rounded-full group-hover:scale-150 transition"></span>
                  <span className="font-semibold text-lg group-hover:text-green-400 transition">
                    Bölüm {chapter.chapter_number}
                  </span>
                  {chapter.title && (
                    <span className="text-gray-500 text-sm hidden sm:inline">
                      - {chapter.title}
                    </span>
                  )}
                </div>
                <span className="text-gray-500 text-sm font-mono">
                  {new Date(chapter.created_at).toLocaleDateString("tr-TR")}
                </span>
              </Link>
            ))}

            {(!chapters || chapters.length === 0) && (
              <div className="p-8 text-center border border-dashed border-gray-800 rounded-xl text-gray-500">
                Henüz bölüm yüklenmemiş.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
