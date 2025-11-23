"use client";

import { useState } from "react";
import { deleteManga } from "@/app/admin/actions"; // Birazdan oluşturacağız

export default function DeleteButton({ id }: { id: string | number }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    // 1. Kullanıcıya sor
    const confirmed = window.confirm("Bu mangayı ve tüm bölümlerini silmek istediğine emin misin? Bu işlem geri alınamaz!");
    if (!confirmed) return;

    setLoading(true);
    
    // 2. Server Action'ı çağır
    try {
      await deleteManga(id);
      alert("Manga başarıyla silindi.");
    } catch (error) {
      alert("Silinirken hata oluştu.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={loading}
      className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-xs font-bold transition disabled:opacity-50"
    >
      {loading ? "Siliniyor..." : "Sil 🗑️"}
    </button>
  );
}