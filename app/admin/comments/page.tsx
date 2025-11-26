import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare, Calendar, User, BookOpen, CornerDownRight, Reply } from "lucide-react";
import DeleteCommentButton from "@/app/components/admin/DeleteCommentButton";

export const revalidate = 0; // Her zaman güncel kalsın

// Tip Tanımları
interface CommentData {
  id: number;
  content: string;
  created_at: string;
  parent_id: number | null; // Yanıt olup olmadığını anlamak için
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
  mangas: {
    id: string;
    title: string;
    slug: string;
  } | null;
  chapters: {
    chapter_number: number;
  } | null;
  // Üst yorumun sahibini çekmeye çalışacağız (SQL ilişkisine bağlı)
  // Eğer ilişki adını tam tutturamazsak bu kısım null gelebilir, sorun değil.
  parent?: {
    profiles: {
      username: string;
    } | null;
  } | null;
}

export default async function CommentsPage() {
  // 1. Tüm Yorumları Çek
  // Not: 'parent:comments!parent_id(...)' kısmı, yorumun cevap verdiği üst yorumu çeker.
  // Eğer veritabanında foreign key ismi farklıysa bu kısım çalışmayabilir, 
  // o yüzden şimdilik güvenli modda sadece 'parent_id' kontrolü yapacağız.
  
  const { data } = await supabase
    .from("comments")
    .select(`
      id,
      content,
      created_at,
      parent_id,
      profiles (username, avatar_url),
      mangas (id, title, slug),
      chapters (chapter_number)
    `)
    .order("created_at", { ascending: false })
    .limit(50);

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
        {comments.map((comment) => {
          const isReply = comment.parent_id !== null;

          return (
            <div key={comment.id} className={`relative group transition ${isReply ? 'ml-8' : ''}`}>
              
              {/* Yanıt Çizgisi (Görsel Bağlantı) */}
              {isReply && (
                 <div className="absolute -left-6 top-6 w-4 h-8 border-l-2 border-b-2 border-gray-700 rounded-bl-xl opacity-50"></div>
              )}

              <div className="bg-gray-900 border border-white/5 rounded-xl p-5 flex gap-5 hover:border-white/10">
                
                {/* Sol: Kullanıcı Avatarı */}
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-white/10 relative">
                      {comment.profiles?.avatar_url ? (
                        <Image src={comment.profiles.avatar_url} alt="Avatar" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-xs">
                            {comment.profiles?.username?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                  </div>
                </div>

                {/* Orta: İçerik ve Bilgi */}
                <div className="flex-1 space-y-2 min-w-0">
                  {/* Üst Bilgi Satırı */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      
                      {/* Kullanıcı Adı */}
                      <span className="flex items-center gap-1 text-green-400 font-bold bg-green-400/10 px-2 py-0.5 rounded">
                        <User size={12} /> {comment.profiles?.username || "Anonim"}
                      </span>
                      
                      {/* Yanıt İkonu (Varsa) */}
                      {isReply && (
                        <span className="flex items-center gap-1 text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                           <CornerDownRight size={12} className="text-gray-500" /> 
                           <span>Yanıt</span>
                        </span>
                      )}

                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> 
                        {new Date(comment.created_at).toLocaleDateString("tr-TR", {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>

                      {/* Hangi Manga/Bölüm? */}
                      {comment.mangas && (
                          <Link 
                            href={`/manga/${comment.mangas.slug}/${comment.chapters?.chapter_number || ''}`} 
                            target="_blank"
                            className="flex items-center gap-1 hover:text-white transition ml-auto sm:ml-0 truncate max-w-[150px] sm:max-w-none"
                          >
                            <BookOpen size={12} /> 
                            <span className="truncate font-medium">{comment.mangas.title}</span>
                            {comment.chapters && <span className="text-gray-400 shrink-0"> - Bölüm {comment.chapters.chapter_number}</span>}
                          </Link>
                      )}
                  </div>

                  {/* Yorum Metni */}
                  <p className="text-gray-300 text-sm leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
                      {comment.content}
                  </p>
                </div>

                {/* Sağ: Aksiyonlar */}
                <div className="flex flex-col justify-center pl-2 border-l border-white/5">
                  <DeleteCommentButton id={comment.id} />
                </div>

              </div>
            </div>
          );
        })}

        {comments.length === 0 && (
            <div className="text-center py-20 text-gray-500 border-2 border-dashed border-gray-800 rounded-2xl">
                Henüz hiç yorum yapılmamış.
            </div>
        )}
      </div>
    </div>
  );
}