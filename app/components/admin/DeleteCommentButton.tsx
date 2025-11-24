"use client";

import { useState } from "react";
import { deleteCommentAction } from "@/app/admin/actions";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DeleteCommentButton({ id }: { id: number }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    // Doğrulama
    if (!confirm("Bu yorumu kalıcı olarak silmek istediğine emin misin?")) return;

    setLoading(true);
    try {
      await deleteCommentAction(id);
      toast.success("Yorum silindi! 🧹");
    } catch (error) {
      toast.error("Silinirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition disabled:opacity-50"
      title="Yorumu Sil"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
    </button>
  );
}