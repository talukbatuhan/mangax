import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Trash2, Layers, Eye, Calendar } from "lucide-react";
import { notFound } from "next/navigation";
import ChapterUploader from "@/app/components/admin/ChapterUploader"// Birazdan yapacağız
import ChapterList from "@/app/components/admin/ChapterList"

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MangaManagePage({ params }: PageProps) {
  const { id } = await params;

  // 1. Manga ve Bölümleri Çek
  const { data: manga } = await supabase
    .from("mangas")
    .select("*")
    .eq("id", id)
    .single();

  if (!manga) return notFound();

  const { data: chapters } = await supabase
    .from("chapters")
    .select("*")
    .eq("manga_id", id)
    .order("chapter_number", { ascending: false });

  return (
    <div className="space-y-8">
      {/* --- ÜST BAŞLIK VE GERİ DÖN --- */}
      <div className="flex items-center gap-4">
        <Link href="/admin/mangas" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{manga.title}</h1>
          <p className="text-gray-500 text-sm">Manga Yönetimi / ID: {manga.id}</p>
        </div>
      </div>

      {/* --- MANGA BİLGİ KARTI --- */}
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-8">
        {/* Kapak */}
        <div className="relative w-32 h-48 bg-black rounded-lg overflow-hidden shrink-0 border border-white/10">
           {manga.cover_url && <Image src={manga.cover_url} alt={manga.title} fill className="object-cover" />}
        </div>
        
        {/* Detaylar */}
        <div className="flex-1 space-y-4">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                 <span className="text-xs text-gray-500 block mb-1">Yazar</span>
                 <span className="text-white font-medium">{manga.author || "-"}</span>
              </div>
              <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                 <span className="text-xs text-gray-500 block mb-1">Görüntülenme</span>
                 <span className="text-green-400 font-mono font-bold flex items-center gap-2">
                    <Eye size={14} /> {manga.views}
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
           
           <div>
              <span className="text-xs text-gray-500 block mb-2">Türler</span>
              <div className="flex gap-2">
                 {manga.genres?.map((g: string) => (
                    <span key={g} className="px-3 py-1 bg-green-900/20 text-green-400 border border-green-900/30 rounded-full text-xs">
                        {g}
                    </span>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* --- İKİ KOLONLU YAPI: YÜKLEME VE LİSTE --- */}
      <div className="grid lg:grid-cols-3 gap-8">
         
         {/* SOL: YENİ BÖLÜM YÜKLEME */}
         <div className="lg:col-span-1">
            <ChapterUploader mangaId={manga.id} mangaTitle={manga.title} />
         </div>

         {/* SAĞ: BÖLÜM LİSTESİ */}
         <div className="lg:col-span-2">
            <ChapterList chapters={chapters || []} />
         </div>

      </div>
    </div>
  );
}