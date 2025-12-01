"use client";

import { useState } from "react";
import { updateMangaDetailsAction } from "@/app/admin/actions";
import { Loader2, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
// YENİ: Import
import { compressImage } from "@/app/utils/compressImage";

// ... (Tip tanımları aynı)
type MangaDetails = {
  id: string;
  title: string;
  slug: string;
  author: string | null;
  description: string | null;
  cover_url: string | null;
};

export default function EditMangaForm({ manga }: { manga: MangaDetails }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(manga.cover_url);
  const router = useRouter();

  // Dosya seçilince önizleme + boyut kontrolü (Değişiklik yok)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // --- YENİ: KAPAK SIKIŞTIRMA ---
      const coverFile = formData.get("cover") as File;
      
      if (coverFile && coverFile.size > 0) {
         try {
            // Kapakları biraz daha kaliteli tutabiliriz (0.9) ama genişliği 800px yeterlidir
            const compressedCover = await compressImage(coverFile, 0.9, 800);
            
            // Orijinal dosyanın yerine sıkıştırılmış olanı koy
            formData.set("cover", compressedCover);
            
         } catch (error) {
            console.error("Kapak sıkıştırılamadı:", error);
            // Hata olsa bile devam et, orijinal dosya yüklenir
         }
      }
      // -----------------------------
      
      const res = await updateMangaDetailsAction(formData);

      if (res.success) {
        toast.success("Manga bilgileri ve kapak güncellendi! ✅");
        router.refresh();
      } else {
        toast.error("Hata: " + res.error);
      }
    } catch (error) {
      console.error("Form gönderim hatası:", error);
      toast.error("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... (JSX aynı kalıyor)
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
      <input type="hidden" name="id" value={manga.id} />

      <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-700 rounded-xl bg-black/20 group">
        <div className="relative w-32 h-48 mb-4 shadow-lg rounded-lg overflow-hidden">
           {preview ? (
             <Image src={preview} alt="Kapak" fill className="object-cover" />
           ) : (
             <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">Resim Yok</div>
           )}
        </div>
        <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition">
            <Upload size={14} />
            Kapağı Değiştir
            <input type="file" name="cover" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
      </div>

      {/* ... (Diğer input alanları aynı) ... */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1 font-bold">Manga Adı</label>
          <input name="title" defaultValue={manga.title} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none" required />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1 font-bold">URL (Slug)</label>
          <input name="slug" defaultValue={manga.slug} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none" required />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1 font-bold">Yazar</label>
        <input name="author" defaultValue={manga.author || ""} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none" />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1 font-bold">Özet</label>
        <textarea name="description" defaultValue={manga.description || ""} rows={4} className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none" />
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition disabled:opacity-50">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {loading ? "Kaydediliyor..." : "Tümünü Güncelle"}
        </button>
      </div>
    </form>
  );
}