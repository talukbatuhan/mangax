"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { postComment } from "@/app/actions";
import Link from "next/link";
import { User } from "@supabase/supabase-js"; // Supabase'in kendi User tipini kullanıyoruz

// 1. Tip Tanımlarını Yapıyoruz (Interface)
interface Profile {
  username: string | null;
  avatar_url: string | null;
}

interface CommentWithProfile {
  id: number;
  content: string;
  created_at: string;
  profiles: Profile | null; // Profil verisi gelebilir veya boş olabilir
}

export default function CommentSection({ mangaId, chapterId }: { mangaId: string, chapterId?: string }) {
  // 2. State'lere doğru tipleri veriyoruz
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  
  // 'any' yerine Supabase'in 'User' tipini kullanıyoruz
  const [user, setUser] = useState<User | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      let query = supabase
        .from("comments")
        .select(`
          id, content, created_at,
          profiles (username, avatar_url)
        `)
        .eq("manga_id", mangaId)
        .order("created_at", { ascending: false });

      if (chapterId) {
        query = query.eq("chapter_id", chapterId);
      } else {
        query = query.is("chapter_id", null);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Yorum çekme hatası:", error);
      }

      if (data) {
        // 3. Veritabanından gelen veriyi bizim tipimize zorluyoruz (Type Casting)
        // 'as unknown as ...' kalıbı TypeScript hatalarını susturmanın en güvenli yoludur.
        setComments(data as unknown as CommentWithProfile[]);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [mangaId, chapterId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await postComment(mangaId, newComment, chapterId);
      window.location.reload(); 
    } catch (error) {
      alert("Yorum gönderilemedi.");
    }
  };

  return (
    <div className="bg-gray-900/50 p-6 rounded-2xl border border-white/5 mt-10">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        💬 Yorumlar <span className="text-sm text-gray-500 font-normal">({comments.length})</span>
      </h3>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-8 flex gap-4">
          <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
             {/* Kullanıcı Avatarı Varsa Göster, Yoksa Harf */}
             {/* Not: User metadata içinde avatar varsa onu da kullanabiliriz ama şimdilik harf yeterli */}
             {user.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
             <textarea 
               value={newComment}
               onChange={(e) => setNewComment(e.target.value)}
               placeholder="Bölüm nasıldı? Düşüncelerini yaz..."
               className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none min-h-[80px]"
             />
             <div className="flex justify-end mt-2">
                <button className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-full text-sm transition shadow-lg shadow-green-900/20">
                   Gönder
                </button>
             </div>
          </div>
        </form>
      ) : (
        <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30 text-center mb-8">
           <p className="text-blue-200 text-sm">
             Yorum yapmak için <Link href="/login" className="text-green-400 hover:underline font-bold">Giriş Yap</Link>malısın.
           </p>
        </div>
      )}

      <div className="space-y-6">
        {loading ? (
            <p className="text-gray-500 text-center animate-pulse">Yorumlar yükleniyor...</p>
        ) : comments.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-gray-800 rounded-xl">
                <p className="text-gray-500 italic">Henüz yorum yok. İlk yorumu sen yap! 🚀</p>
            </div>
        ) : (
            comments.map((comment) => (
                <div key={comment.id} className="flex gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 shrink-0 border border-white/10">
                        {comment.profiles?.avatar_url ? (
                            <img src={comment.profiles.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-bold bg-gray-800">
                                {comment.profiles?.username?.charAt(0).toUpperCase() || "?"}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-300 text-sm hover:text-green-400 transition cursor-pointer">
                                {comment.profiles?.username || "Anonim Kullanıcı"}
                            </span>
                            <span className="text-xs text-gray-600">
                                {new Date(comment.created_at).toLocaleDateString("tr-TR")}
                            </span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed bg-white/5 p-3 rounded-tr-xl rounded-bl-xl rounded-br-xl border border-white/5 group-hover:border-white/10 transition">
                            {comment.content}
                        </p>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}