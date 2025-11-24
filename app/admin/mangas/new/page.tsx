"use client";

import { createMangaAction } from "@/app/admin/actions";
import { useState } from "react";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewMangaPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
        await createMangaAction(formData);
        
        // Hata almazsa başarılı demektir, şimdi yönlendir:
        router.push("/admin/mangas");
        router.refresh(); // Listeyi yenile
        
    } catch (error) {
        // Sadece gerçek hataları göster
        const errorMessage = error instanceof Error ? error.message : "Beklenmedik bir hata oluştu";
        alert("Hata: " + errorMessage);
        setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/mangas" className="p-2 rounded-lg hover:bg-white/10 transition">
            <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-white">Yeni Seri Ekle</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900 p-8 rounded-2xl border border-white/10 shadow-xl">
        
        {/* Temel Bilgiler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm text-gray-400 mb-2">Manga Adı</label>
                <input name="title" placeholder="Örn: One Piece" className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none" required />
            </div>
            <div>
                <label className="block text-sm text-gray-400 mb-2">URL Kısa Adı (Slug)</label>
                <input name="slug" placeholder="örn: one-piece" className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none" required />
            </div>
        </div>

        {/* Yazar ve Türler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm text-gray-400 mb-2">Yazar / Çizer</label>
                <input name="author" placeholder="Örn: Eiichiro Oda" className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none" />
            </div>
            <div>
                <label className="block text-sm text-gray-400 mb-2">Türler (Virgülle ayır)</label>
                <input name="genres" placeholder="Aksiyon, Macera, Komedi" className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none" />
            </div>
        </div>

        {/* Açıklama */}
        <div>
            <label className="block text-sm text-gray-400 mb-2">Özet / Konu</label>
            <textarea name="desc" rows={4} placeholder="Manga hakkında..." className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none" />
        </div>

        {/* Kapak Resmi */}
        <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-gray-500 transition bg-black/20">
            <label className="cursor-pointer">
                <span className="block text-gray-400 text-sm mb-2">Kapak Görseli Seç</span>
                <input type="file" name="cover" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-500" required />
            </label>
        </div>

        {/* Kaydet Butonu */}
        <div className="flex justify-end pt-4 border-t border-white/10">
            <button 
                disabled={loading}
                className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                {loading ? "Kaydediliyor..." : "Kaydet ve Yayınla"}
            </button>
        </div>

      </form>
    </div>
  );
}