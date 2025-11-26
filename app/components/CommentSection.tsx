"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send, Reply } from "lucide-react";
import Image from "next/image";
import { User } from "@supabase/supabase-js";

// --- TİP TANIMLARI ---
interface Profile {
  username: string | null;
  avatar_url: string | null;
}

interface Comment {
  id: number;
  content: string;
  created_at: string;
  parent_id: number | null;
  user_id: string;
  manga_id: string; // Veya number, veritabanına göre değişir
  user: Profile | null; // İlişkisel veri (profiles tablosundan)
}

interface CommentSectionProps {
  mangaId: string; // ID string ise string, number ise number yapın (Genelde string UUID olur)
}

export default function CommentSection({ mangaId }: CommentSectionProps) {
  const supabase = createClient();

  // --- STATE ---
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Cevaplama State'leri
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // --- 1. KULLANICIYI GETİR ---
  useEffect(() => {
    const getSessionUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getSessionUser();
  }, [supabase]);

  // --- 2. YORUMLARI GETİR (DÖNGÜYÜ ÇÖZEN YÖNTEM) ---
  // Fonksiyonu useEffect içine taşıdık. Böylece useCallback'e gerek kalmadı.
  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          user:profiles(username, avatar_url)
        `)
        .eq("manga_id", mangaId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Yorum hatası:", error);
      } else {
        // Tip dönüşümü (Supabase'den gelen veriyi Comment tipine uyduruyoruz)
        setComments((data as unknown as Comment[]) || []);
      }
    };

    fetchComments();
    
    // Realtime aboneliği buraya eklenebilir (Opsiyonel)
  }, [mangaId, supabase]); // Sadece mangaId değişirse çalışır.

  // --- YORUM GÖNDERME ---
  const handlePostComment = async (parentId: number | null = null) => {
    const content = parentId ? replyContent : newComment;

    if (!user) return alert("Yorum yapmak için giriş yapmalısınız.");
    if (!content.trim()) return;

    setLoading(true);

    const { error } = await supabase.from("comments").insert({
      content: content,
      manga_id: mangaId,
      user_id: user.id,
      parent_id: parentId,
    });

    if (error) {
      console.error(error);
      alert("Yorum gönderilemedi.");
    } else {
      // Başarılı!
      setNewComment("");
      setReplyContent("");
      setReplyingTo(null);
      
      // Listeyi güncellemek için basitçe sayfayı yeniliyoruz veya
      // fetchComments() mantığını tekrar çalıştırabiliriz ama en kolayı:
      window.location.reload(); 
    }
    setLoading(false);
  };

  // --- Render Filtreleri ---
  const rootComments = comments.filter((c) => c.parent_id === null);

  const getReplies = (parentId: number) => {
    return comments.filter((c) => c.parent_id === parentId);
  };

  return (
    <div className="space-y-8">
      {/* --- ANA YORUM YAZMA ALANI --- */}
      <div className="bg-[#0f0f0f] border border-white/10 p-4 rounded-xl flex gap-4">
        <div className="w-10 h-10 bg-green-900/30 rounded-full flex items-center justify-center text-green-500 shrink-0 overflow-hidden">
          {user && user.email ? (
            <span className="font-bold text-lg">{user.email[0].toUpperCase()}</span>
          ) : (
            <UserIcon />
          )}
        </div>
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={user ? "Düşüncelerin neler?" : "Yorum yapmak için giriş yapmalısın..."}
            className="w-full bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none resize-none h-20"
            disabled={!user}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={() => handlePostComment(null)}
              disabled={loading || !user || !newComment.trim()}
              className="bg-green-600 hover:bg-green-500 text-black font-bold text-xs px-6 py-2 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? "..." : (
                <>
                  GÖNDER <Send size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* --- YORUM LİSTESİ --- */}
      <div className="space-y-6">
        {rootComments.map((comment) => (
          <div key={comment.id} className="group">
            {/* Ana Yorum */}
            <CommentItem
              comment={comment}
              onReplyClick={() =>
                setReplyingTo(replyingTo === comment.id ? null : comment.id)
              }
            />

            {/* Cevap Yazma Alanı */}
            {replyingTo === comment.id && (
              <div className="ml-12 mt-3 animate-in fade-in zoom-in-95">
                <div className="flex gap-3 items-start">
                  <div className="flex-1">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={`@${comment.user?.username || "üye"} yanıt ver...`}
                      className="w-full bg-[#151515] border border-green-500/30 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-green-500 transition h-20 resize-none"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => setReplyingTo(null)}
                        className="text-gray-400 hover:text-white text-xs font-bold px-3 py-1"
                      >
                        İptal
                      </button>
                      <button
                        onClick={() => handlePostComment(comment.id)}
                        disabled={loading || !replyContent.trim()}
                        className="bg-green-600 text-black px-4 py-1.5 rounded text-xs font-bold hover:bg-green-500"
                      >
                        Yanıtla
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Alt Yorumlar (Replies) */}
            {getReplies(comment.id).length > 0 && (
              <div className="ml-6 md:ml-12 mt-4 space-y-4 border-l-2 border-white/5 pl-4 md:pl-6">
                {getReplies(comment.id).map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    isReply={true}
                    onReplyClick={() => {
                      setReplyingTo(comment.id);
                      setReplyContent(`@${reply.user?.username || "üye"} `);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        {rootComments.length === 0 && (
          <div className="text-center py-10 text-gray-500 italic">
            Henüz yorum yok.
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// ALT BİLEŞENLER
// ------------------------------------------------------------------

function CommentItem({
  comment,
  isReply = false,
  onReplyClick,
}: {
  comment: Comment;
  isReply?: boolean;
  onReplyClick: () => void;
}) {
  return (
    <div className={`flex gap-4 ${isReply ? "opacity-90" : ""}`}>
      {/* Avatar */}
      <div
        className={`shrink-0 rounded-full overflow-hidden bg-gray-800 border border-white/10 ${
          isReply ? "w-8 h-8" : "w-10 h-10"
        }`}
      >
        {comment.user?.avatar_url ? (
          <Image
            src={comment.user.avatar_url}
            width={40}
            height={40}
            alt="avatar"
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">
            {comment.user?.username?.[0]?.toUpperCase() || "?"}
          </div>
        )}
      </div>

      {/* İçerik */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span
            className={`font-bold text-white ${
              isReply ? "text-xs" : "text-sm"
            }`}
          >
            {comment.user?.username || "Anonim"}
          </span>
          <span className="text-[10px] text-gray-500">
            {new Date(comment.created_at).toLocaleDateString("tr-TR")}
          </span>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </p>
        <div className="pt-1">
          <button
            onClick={onReplyClick}
            className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 hover:text-green-400 transition uppercase tracking-wider"
          >
            <Reply size={12} /> Yanıtla
          </button>
        </div>
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5 opacity-50"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}