import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import DeleteButton from "@/app/components/DeleteButton";
import ChapterManager from "@/app/components/ChapterManager";

export default async function AdminPage() {
  
  // --- GÜNCELLEME BURADA ---
  // Manga listesini "Try-Catch" içine alıyoruz ki hata olursa sayfa çökmesin.
let mangas: { id: string | number; title: string }[] = [];
  let fetchError = null;

  try {
    const { data, error } = await supabase.from("mangas").select("id, title");
    if (error) throw error;
    mangas = data || [];
  } catch (err) {
    console.error("!!! KRİTİK HATA: Supabase'e bağlanılamadı !!!");
    console.error("Sebep:", err);
    fetchError = "Veritabanı bağlantısı başarısız. Lütfen terminali kontrol edin.";
  }
  // -------------------------

  // --- ACTION 1: YENİ MANGA OLUŞTUR ---
  async function createManga(formData: FormData) {
    "use server";
    // ... (Bu kısım aynı kalsın) ...
    // KODUN GERİ KALANI AYNI...
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const desc = formData.get("desc") as string;
    const author = formData.get("author") as string;
    const coverFile = formData.get("cover") as File;

    if (!coverFile || !slug) return;

    const fileName = `cover-${Date.now()}-${coverFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from("covers").upload(fileName, coverFile);

    if (uploadError) {
        console.error("Kapak yüklenemedi", uploadError);
        return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("covers").getPublicUrl(fileName);

    await supabase.from("mangas").insert({
      title, slug, description: desc, author, cover_url: publicUrl
    });

    revalidatePath("/admin");
  }

  // --- ACTION 2: BÖLÜM VE ÇOKLU RESİM YÜKLE ---
async function uploadChapter(formData: FormData) {
     "use server";
    const mangaId = formData.get("mangaId") as string;
    const chapterNum = formData.get("chapterNum") as string;
    const title = formData.get("title") as string;
    
    // 1. Dosyaları al
    const files = formData.getAll("pages") as File[]; 

    if (!files || files.length === 0) return;

    // 2. Dosyaları isme göre sırala (Bilgisayardaki sıralamayı koru)
    files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    // 3. Dosyaları Supabase Storage'a Yükle
    const uploadPromises = files.map(async (file, index) => {
      // Dosya isminin benzersiz olması için timestamp ekliyoruz
      // Böylece 01.jpg yükleyip sonra tekrar 01.jpg yüklersen çakışmaz
      const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const path = `${mangaId}/${chapterNum}/${Date.now()}-${cleanName}`;
      
      const { error } = await supabase.storage
        .from("chapters")
        .upload(path, file);
        
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("chapters").getPublicUrl(path);
        
      return publicUrl;
    });

    try {
      // Yeni yüklenen resimlerin linkleri
      const newImageUrls = await Promise.all(uploadPromises);

      // --- KRİTİK KISIM: VAR OLANI KONTROL ET ---
      
      // Veritabanına sor: Bu mangada bu bölüm numarası var mı?
      const { data: existingChapter } = await supabase
        .from("chapters")
        .select("id, images")
        .eq("manga_id", mangaId)
        .eq("chapter_number", Number(chapterNum))
        .single();

      if (existingChapter) {
        // DURUM A: BÖLÜM ZATEN VAR -> ÜZERİNE EKLE (APPEND)
        console.log("Bölüm mevcut, yeni resimler sona ekleniyor...");
        
        // Eski resim listesi ile yeni listeyi birleştir
        const combinedImages = [
            ...(existingChapter.images || []), // Eskiler
            ...newImageUrls                    // Yeniler (Sona eklenir)
        ];

        // Veritabanını güncelle
        await supabase
          .from("chapters")
          .update({ 
            images: combinedImages,
            // Eğer yeni bir başlık girdiysen başlığı da güncelle, girmediysen eskisi kalsın
            title: title || undefined 
          })
          .eq("id", existingChapter.id);

      } else {
        // DURUM B: BÖLÜM YOK -> SIFIRDAN OLUŞTUR
        console.log("Yeni bölüm oluşturuluyor...");

        await supabase.from("chapters").insert({
          manga_id: mangaId,
          chapter_number: Number(chapterNum),
          title: title,
          images: newImageUrls
        });
      }

      console.log("İşlem Başarılı!");
      revalidatePath(`/manga/${mangaId}`);
      revalidatePath("/admin");
      
    } catch (error) {
      console.error("Yükleme hatası:", error);
    }
  }

 return (
    <div className="min-h-screen bg-gray-950 text-white p-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-green-500 mb-10 border-b border-gray-800 pb-4">Stüdyo Paneli</h1>
      
      {/* ... Hata mesajı bloğu (varsa) aynı kalsın ... */}

      <div className="grid md:grid-cols-2 gap-10 mb-16">
        {/* SOL: Yeni Manga Ekle (Kodlar aynı) */}
        {/* SAĞ: Bölüm Yükle (Kodlar aynı) */}
        {/* (Buradaki eski kodlarını koru, değiştirme) */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 h-fit">
            {/* ...Manga Ekleme Formun Buradaydı... */}
            {/* Burayı kısaltarak yazıyorum, sen eski kodunu koru */}
            <h2 className="text-xl font-bold mb-4 text-green-400">1. Yeni Seri Oluştur</h2>
             <form action={createManga} className="flex flex-col gap-4">
               {/* ...Inputlar... */}
               <input name="title" placeholder="Manga Adı" className="bg-gray-800 p-3 rounded border border-gray-700 outline-none" required />
               <input name="slug" placeholder="URL Kısa Adı (orn: one-piece)" className="bg-gray-800 p-3 rounded border border-gray-700 outline-none" required />
               <input name="author" placeholder="Yazar" className="bg-gray-800 p-3 rounded border border-gray-700 outline-none" />
               <textarea name="desc" placeholder="Özet..." className="bg-gray-800 p-3 rounded border border-gray-700 outline-none" rows={3}/>
               <input type="file" name="cover" accept="image/*" className="text-sm text-gray-300" required />
               <button className="bg-green-600 p-3 rounded font-bold hover:bg-green-500 transition">Mangayı Oluştur</button>
             </form>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 h-fit">
          {/* ...Bölüm Yükleme Formun Buradaydı... */}
          <h2 className="text-xl font-bold mb-4 text-blue-400">2. Bölüm ve Sayfalar</h2>
          <form action={uploadChapter} className="flex flex-col gap-4">
             {/* ...Select ve Inputlar... */}
             <select name="mangaId" className="bg-gray-800 p-3 rounded border border-gray-700 text-white outline-none" required>
              <option value="">Hangi Manga?</option>
              {mangas.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input type="number" name="chapterNum" placeholder="Bölüm No (Örn: 1)" className="bg-gray-800 p-3 rounded border border-gray-700 w-1/3 outline-none" required />
              <input type="text" name="title" placeholder="Bölüm Adı (Opsiyonel)" className="bg-gray-800 p-3 rounded border border-gray-700 w-2/3 outline-none" />
            </div>
             <div className="p-6 border-2 border-dashed border-gray-700 rounded-lg text-center hover:border-blue-500 transition group cursor-pointer relative">
                <input type="file" name="pages" multiple accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required /> 
                <div className="pointer-events-none">
                    <span className="text-blue-400 font-bold block mb-2 text-2xl group-hover:scale-110 transition">+</span>
                    <span className="text-sm text-gray-300 font-bold">Sayfaları Buraya Sürükle</span>
                </div>
            </div>
            <button className="bg-blue-600 p-3 rounded font-bold hover:bg-blue-500 transition mt-2">Bölümü Yükle 🚀</button>
          </form>
        </div>
      </div>

      {/* --- YENİ BÖLÜM: YÖNETİM LİSTESİ --- */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <h2 className="text-xl font-bold mb-6 text-red-400">Yönetim ve Silme</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400 text-sm">
                <th className="p-3">ID</th>
                <th className="p-3">Manga Adı</th>
                <th className="p-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {mangas.map((m) => (
                <tr key={m.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-3 font-mono text-xs text-gray-500">{m.id}</td>
                  <td className="p-3 font-medium">{m.title}</td>
                  <td className="p-3 text-right">
                    {/* İstemci Bileşenini Burada Kullanıyoruz */}
                    <DeleteButton id={m.id} />
                  </td>
                </tr>
              ))}
              {mangas.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-500">Hiç manga bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-10">
        <ChapterManager mangas={mangas} />
      </div>

    </div>
  );
}