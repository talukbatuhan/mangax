"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client"; // Client-side Supabase
import { saveChapterImagesAction } from "@/app/admin/actions"; 
import { UploadCloud, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ChapterUploader({ mangaId, mangaTitle }: { mangaId: string, mangaTitle: string }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(""); 
  const router = useRouter();
  
  // İstemci tarafı Supabase
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setProgress("Hazırlanıyor...");

    const formData = new FormData(e.currentTarget);
    const chapterNum = formData.get("chapterNum") as string;
    const title = formData.get("title") as string;
    const files = formData.getAll("pages") as File[];

    if (!files.length) {
      toast.error("Lütfen dosya seçin.");
      setLoading(false);
      return;
    }

    // Dosyaları isme göre sırala (Örn: 1.webp, 2.webp... doğru sıra için)
    files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    const uploadedUrls: string[] = [];
    let errorCount = 0;

    // --- A. İSTEMCİ TARAFI YÜKLEME (Client-Side Upload) ---
    // Her dosyayı tek tek bucket'a atıyoruz.
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Kullanıcıya ilerleme durumu göster
      setProgress(`Yükleniyor: ${i + 1} / ${files.length}`);

      // Dosya ismini temizle ve benzersiz yap
      const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const path = `${mangaId}/${chapterNum}/${Date.now()}-${i}-${cleanName}`;

      const { error } = await supabase.storage
        .from("chapters")
        .upload(path, file);

      if (error) {
        console.error("Yükleme hatası:", file.name, error);
        errorCount++;
      } else {
        // Yüklenen dosyanın Public URL'ini al
        const { data: { publicUrl } } = supabase.storage
          .from("chapters")
          .getPublicUrl(path);
        uploadedUrls.push(publicUrl);
      }
    }

    if (uploadedUrls.length === 0) {
      toast.error("Hiçbir dosya yüklenemedi. Supabase Storage Policies (RLS) ayarlarını kontrol et.");
      setLoading(false);
      return;
    }

    // --- B. VERİTABANI KAYDI (Server Action) ---
    setProgress("Veritabanına kaydediliyor...");
    
    // URL listesini Server Action'a gönderiyoruz
    const res = await saveChapterImagesAction(
      mangaId, 
      Number(chapterNum), 
      title, 
      uploadedUrls
    );

    if (res.success) {
      toast.success(`Bölüm yüklendi! (${uploadedUrls.length} sayfa)`);
      if (errorCount > 0) toast.warning(`${errorCount} dosya yüklenemedi.`);
      
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      toast.error("Hata: " + res.error);
    }

    setLoading(false);
    setProgress("");
  };

  return (
    <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 sticky top-6">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <UploadCloud className="text-green-500" /> Bölüm Yükle (Hızlı)
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label className="text-xs text-gray-400 block mb-1">Bölüm Numarası</label>
            <input type="number" name="chapterNum" placeholder="Örn: 10" className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-green-500 outline-none" required />
        </div>
        <div>
            <label className="text-xs text-gray-400 block mb-1">Bölüm Başlığı (Opsiyonel)</label>
            <input type="text" name="title" placeholder="Örn: Savaş Başlıyor" className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-green-500 outline-none" />
        </div>
        
        <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-green-500/50 transition bg-black/20 cursor-pointer relative">
            {/* 'multiple' özelliği sayesinde çoklu seçim yapılabilir */}
            <input type="file" name="pages" multiple accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
            <div className="pointer-events-none">
                <span className="text-2xl block mb-2">📂</span>
                <span className="text-xs text-gray-400 font-bold">Resimleri Seç (WebP, JPG)</span>
                <span className="text-[10px] text-gray-600 block mt-1">Sınır yok, doğrudan yükleme.</span>
            </div>
        </div>

        <button 
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
        >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span className="text-xs">{progress}</span>
              </>
            ) : (
              "Yüklemeyi Başlat"
            )}
        </button>
      </form>
    </div>
  );
}