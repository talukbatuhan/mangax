"use client";

import { useState } from "react";
import { deleteUserAction } from "@/app/admin/actions";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DeleteUserButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Bu kullanıcıyı ve tüm verilerini silmek istediğine emin misin?")) return;

    setLoading(true);
    try {
      await deleteUserAction(id);
      toast.success("Kullanıcı silindi! 🚫");
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
      className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition disabled:opacity-50"
      title="Kullanıcıyı Yasakla/Sil"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
    </button>
  );
}