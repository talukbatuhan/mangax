"use client";

import { useState } from "react";
import { deleteChapterAction } from "@/app/admin/actions";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DeleteChapterButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Bu bölümü silmek istediğine emin misin?")) return;
    setLoading(true);
    try {
      await deleteChapterAction(id);
      toast.success("Bölüm silindi.");
    } catch (error) {
      toast.error("Hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded transition"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
    </button>
  );
}