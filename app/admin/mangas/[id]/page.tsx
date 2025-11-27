import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Layers, Eye, Calendar, BookOpen } from "lucide-react";
import { notFound } from "next/navigation";

// --- BİLEŞENLER ---
import ChapterUploader from "@/app/components/admin/ChapterUploader";
import ChapterList from "@/app/components/admin/ChapterList";
import GenreEditor from "@/app/components/ui/GenreEditor";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

// 1. TİP TANIMLAMASI (Type Definition)
// Veritabanından gelen verinin şeklini burada tanımlıyoruz.
type MangaDetail = {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  cover_url: string | null;
  views: number;
  created_at: string;
  // İlişkisel tablo yapısı:
  manga_genres: {
    genre_id: number;
    genres: {
      name: string;
    } | null;
  }[];
};

export default async function MangaManagePage({ params }: PageProps) {
  const { id } = await params;

  // 2. Manga Detaylarını Çek
  const { data } = await supabase
    .from("mangas")
    .select(`
      *,
      manga_genres (
        genre_id,
        genres (
          name
        )
      )
    `)
    .eq("id", id)
    .single();

  if (!data) return notFound();

  // 3. Gelen veriyi yukarıdaki Tipe zorluyoruz (Casting)
  // Bu işlem 'any' hatasını ortadan kaldırır.
  const manga = data as unknown as MangaDetail;

  // 4. Bölümleri Çek
  const { data: chapters } = await supabase
    .from("chapters")
    .select("*")
    .eq("manga_id", id)
    .order("chapter_number", { ascending: false });

  // 5. Tüm Türleri Çek (Editör için)
  const { data: allGenres } = await supabase
    .from("genres")
    .select("*")
    .order("name", { ascending: true });

  // --- VERİ DÜZENLEME ---
  // Artık 'item'ın tipi belli olduğu için ':any' yazmamıza gerek yok.
  
  // Editör için ID listesi: [1, 5]
  const currentGenreIds = manga.manga_genres.map((item) => item.genre_id);
  
  // Görüntüleme için İsim listesi: ["Aksiyon", "Macera"]
  const genreNames = manga.manga_genres
    .map((item) => item.genres?.name)
    .filter((name): name is string => !!name); // null olanları filtrele

  return (
    <div className="space-y-8 pb-20">
      
      {/* --- ÜST BAŞLIK --- */}
      <div className="flex items-center gap-4">
        <Link href="/admin/mangas" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition text-white">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{manga.title}</h1>
          <p className="text-gray-500 text-sm">Manga Yönetimi / ID: {manga.id}</p>
        </div>
      </div>

      {/* --- MANGA BİLGİ KARTI --- */}
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-8 shadow-xl">
        <div className="relative w-32 h-48 bg-black rounded-lg overflow-hidden shrink-0 border border-white/10 shadow-lg">
           {manga.cover_url ? (
             <Image src={manga.cover_url} alt={manga.title} fill className="object-cover" />
           ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-700">Resim Yok</div>
           )}
        </div>
        
        <div className="flex-1 space-y-6">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                 <span className="text-xs text-gray-500 block mb-1">Yazar</span>
                 <span className="text-white font-medium">{manga.author || "-"}</span>
              </div>
              <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                 <span className="text-xs text-gray-500 block mb-1">Görüntülenme</span>
                 <span className="text-green-400 font-mono font-bold flex items-center gap-2">
                    <Eye size={14} /> {manga.views?.toLocaleString()}
                 </span>
              </div>
              <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                 <span className="text-xs text-gray-500 block mb-1">Bölüm Sayısı</span>
                 <span className="text-white font-medium flex items-center gap-2">
                    <Layers size={14} /> {chapters?.length || 0}
                 </span>
              </div>
              <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                 <span className="text-xs text-gray-500 block mb-1">Oluşturulma</span>
                 <span className="text-white font-medium flex items-center gap-2">
                    <Calendar size={14} /> {new Date(manga.created_at).getFullYear()}
                 </span>
              </div>
           </div>
           
           {/* Görüntülenen Türler */}
           <div>
              <span className="text-xs text-gray-500 block mb-2 flex items-center gap-2">
                <BookOpen size={14} /> Kayıtlı Türler
              </span>
              <div className="flex flex-wrap gap-2">
                 {genreNames.length > 0 ? genreNames.map((name, index) => (
                    <span key={index} className="px-3 py-1 bg-green-900/20 text-green-400 border border-green-900/30 rounded-full text-xs font-medium">
                       {name}
                    </span>
                 )) : (
                    <span className="text-gray-600 text-xs italic">Tür belirtilmemiş</span>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* --- TÜR EDİTÖRÜ --- */}
      <GenreEditor 
        mangaId={manga.id} 
        allGenres={allGenres || []} 
        existingGenreIds={currentGenreIds} 
      />

      {/* --- BÖLÜM YÜKLEME VE LİSTE --- */}
      <div className="grid lg:grid-cols-3 gap-8 mt-8">
         <div className="lg:col-span-1">
            <ChapterUploader mangaId={manga.id} mangaTitle={manga.title} />
         </div>
         <div className="lg:col-span-2">
            <ChapterList chapters={chapters || []} />
         </div>
      </div>
    </div>
  );
}