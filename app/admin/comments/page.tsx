import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare, Calendar, User, BookOpen } from "lucide-react";
import DeleteCommentButton from "@/app/components/admin/DeleteCommentButton";

export const revalidate = 0; // Her zaman güncel kalsın

// Tip Tanımları (TypeScript Mutluluğu İçin 🛡️)
interface CommentData {
  id: number;
  content: string;
  created_at: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
    email?: string; // Bazen auth tablosundan çekmek gerekebilir ama şimdilik profil yeterli
  } | null;
  mangas: {
    id: string;
    title: string;
    slug: string;
  } | null;
  chapters: {
    chapter_number: number;
  } | null;
}

export default async function CommentsPage() {
  // 1. Tüm Yorumları Çek (İlişkilerle Beraber)
  const { data } = await supabase
    .from("comments")
    .select(`
      id,
      content,
      created_at,
      profiles (username, avatar_url),
      mangas (id, title, slug),
      chapters (chapter_number)
    `)
    .order("created_at", { ascending: false })
    .limit(50); // Son 50 yorumu getir (Sayfalama ilerde eklenebilir)

  const comments = (data as unknown as CommentData[]) || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="text-yellow-500" /> Yorum Moderasyonu
            </h1>
            <p className="text-gray-500 text-sm mt-1">
            Son yapılan yorumları denetle ve yönet.
            </p>
        </div>
        <div className="bg-gray-900 px-4 py-2 rounded-lg border border-white/10 text-sm text-gray-400">
            Toplam: <span className="text-white font-bold">{comments.length}</span> (Son 50)
        </div>
      </div>

      {/* Yorum Listesi */}
      <div className="grid gap-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-900 border border-white/5 rounded-xl p-5 flex gap-5 hover:border-white/10 transition group">
            
            {/* Sol: Kullanıcı Avatarı */}
            <div className="shrink-0">
               <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden border border-white/10 relative">
                  {comment.profiles?.avatar_url ? (
                     <Image src={comment.profiles.avatar_url} alt="Avatar" fill className="object-cover" />
                  ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                        {comment.profiles?.username?.charAt(0).toUpperCase() || "?"}
                     </div>
                  )}
               </div>
            </div>

            {/* Orta: İçerik ve Bilgi */}
            <div className="flex-1 space-y-2">
               {/* Üst Bilgi Satırı */}
               <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1 text-green-400 font-bold bg-green-400/10 px-2 py-0.5 rounded">
                     <User size={12} /> {comment.profiles?.username || "Anonim"}
                  </span>
                  
                  <span className="flex items-center gap-1">
                     <Calendar size={12} /> 
                     {new Date(comment.created_at).toLocaleDateString("tr-TR", {
                        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                     })}
                  </span>

                  {/* Hangi Manga/Bölüm? */}
                  {comment.mangas && (
                      <Link 
                        href={`/manga/${comment.mangas.slug}/${comment.chapters?.chapter_number || ''}`} 
                        target="_blank"
                        className="flex items-center gap-1 hover:text-white transition ml-auto sm:ml-0"
                      >
                        <BookOpen size={12} /> 
                        <span className="font-medium">{comment.mangas.title}</span>
                        {comment.chapters && <span className="text-gray-400"> - Bölüm {comment.chapters.chapter_number}</span>}
                      </Link>
                  )}
               </div>

               {/* Yorum Metni */}
               <p className="text-gray-300 text-sm leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
                  {comment.content}
               </p>
            </div>

            {/* Sağ: Aksiyonlar */}
            <div className="flex flex-col justify-center">
               <DeleteCommentButton id={comment.id} />
            </div>

          </div>
        ))}

        {comments.length === 0 && (
            <div className="text-center py-20 text-gray-500 border-2 border-dashed border-gray-800 rounded-2xl">
                Henüz hiç yorum yapılmamış.
            </div>
        )}
      </div>
    </div>
  );
}