import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import DeleteButton from "@/app/components/DeleteButton"; // Silme Butonu
import ChapterManager from "@/app/components/ChapterManager"; // Bölüm Yöneticisi
import GenreEditor from "@/app/components/GenreEditor"; // YENİ: Tür Düzenleyici

export default async function AdminPage() {
  
  // --- VERİ ÇEKME (genres EKLENDİ) ---
  // Türleri (genres) de çekiyoruz ki düzenleyiciye gönderebilelim.
  let mangas: { id: string | number; title: string; genres: string[] | null }[] = [];
  let fetchError = null;

  try {
    const { data, error } = await supabase
      .from("mangas")
      .select("id, title, genres") // <-- KRİTİK: 'genres' sütununu buraya ekledik
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    mangas = data || [];
  } catch (err) {
    console.error("Supabase Bağlantı Hatası:", err);
    fetchError = "Veritabanı bağlantısı başarısız.";
  }

  // --- ACTION 1: YENİ MANGA OLUŞTUR ---
  async function createManga(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const desc = formData.get("desc") as string;
    const author = formData.get("author") as string;
    const coverFile = formData.get("cover") as File;
    
    // Formdan gelen virgüllü türleri diziye çeviriyoruz
    const genresRaw = formData.get("genres") as string;
    const genres = genresRaw ? genresRaw.split(",").map(g => g.trim()) : [];

    if (!coverFile || !slug) return;

    // 1. Kapak Yükle
    const fileName = `cover-${Date.now()}-${coverFile.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const { error: uploadError } = await supabase.storage
      .from("covers").upload(fileName, coverFile);

    if (uploadError) {
        console.error("Kapak yüklenemedi", uploadError);
        return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("covers").getPublicUrl(fileName);

    // 2. Veritabanına Yaz (genres dahil)
    await supabase.from("mangas").insert({
      title, 
      slug, 
      description: desc, 
      author, 
      cover_url: publicUrl,
      genres: genres 
    });

    revalidatePath("/admin");
    revalidatePath("/"); 
  }

  // --- ACTION 2: AKILLI BÖLÜM YÜKLEME ---
  async function uploadChapter(formData: FormData) {
    "use server";
    const mangaId = formData.get("mangaId") as string;
    const chapterNum = formData.get("chapterNum") as string;
    const title = formData.get("title") as string;
    
    const files = formData.getAll("pages") as File[]; 

    if (!files || files.length === 0) return;

    // Sıralama
    files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    console.log(`Toplam ${files.length} sayfa yükleniyor...`);

    // Yükleme
    const uploadPromises = files.map(async (file, index) => {
      const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const path = `${mangaId}/${chapterNum}/${Date.now()}-${index}-${cleanName}`;
      
      const { error } = await supabase.storage.from("chapters").upload(path, file); 
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from("chapters").getPublicUrl(path);
      return publicUrl;
    });

    try {
      const newImageUrls = await Promise.all(uploadPromises);

      // Var olan bölümü kontrol et
      const { data: existingChapter } = await supabase
        .from("chapters")
        .select("id, images")
        .eq("manga_id", mangaId)
        .eq("chapter_number", Number(chapterNum))
        .single();

      if (existingChapter) {
        // GÜNCELLE (Append)
        const combinedImages = [...(existingChapter.images || []), ...newImageUrls];
        await supabase
          .from("chapters")
          .update({ images: combinedImages, title: title || undefined })
          .eq("id", existingChapter.id);
      } else {
        // YENİ EKLE
        await supabase.from("chapters").insert({
          manga_id: mangaId,
          chapter_number: Number(chapterNum),
          title: title,
          images: newImageUrls
        });
      }

      revalidatePath(`/manga/${mangaId}`);
      revalidatePath("/admin");
      
    } catch (error) {
      console.error("Yükleme hatası:", error);
    }
  }

  // --- GÖRÜNÜM ---
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-10 max-w-6xl mx-auto font-sans">
      <h1 className="text-3xl font-bold text-green-500 mb-10 border-b border-gray-800 pb-4">Stüdyo Paneli</h1>
      
      {fetchError && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded mb-6">
          ⚠️ {fetchError}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-10 mb-12">
        
        {/* SOL: YENİ MANGA EKLE */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 h-fit shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-green-400 border-b border-gray-700 pb-2">1. Yeni Seri Oluştur</h2>
          <form action={createManga} className="flex flex-col gap-4">
            <input name="title" placeholder="Manga Adı" className="bg-gray-800 p-3 rounded border border-gray-700 focus:border-green-500 outline-none transition" required />
            <input name="slug" placeholder="URL Kısa Adı (orn: one-piece)" className="bg-gray-800 p-3 rounded border border-gray-700 focus:border-green-500 outline-none transition" required />
            <input name="genres" placeholder="Türler (Virgül ile: Aksiyon, Dram)" className="bg-gray-800 p-3 rounded border border-gray-700 focus:border-green-500 outline-none transition" />
            <input name="author" placeholder="Yazar" className="bg-gray-800 p-3 rounded border border-gray-700 outline-none" />
            <textarea name="desc" placeholder="Özet..." className="bg-gray-800 p-3 rounded border border-gray-700 outline-none" rows={3}/>
            <div className="bg-gray-800 p-3 rounded border border-gray-700">
                <label className="text-sm text-gray-400 block mb-2">Kapak Resmi</label>
                <input type="file" name="cover" accept="image/*" className="text-sm text-gray-300 w-full" required />
            </div>
            <button className="bg-green-600 p-3 rounded font-bold hover:bg-green-500 transition shadow-lg shadow-green-900/20">
                Mangayı Oluştur
            </button>
          </form>
        </div>

        {/* SAĞ: BÖLÜM YÜKLE */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 h-fit shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-blue-400 border-b border-gray-700 pb-2">2. Bölüm ve Sayfalar</h2>
          <form action={uploadChapter} className="flex flex-col gap-4">
            <select name="mangaId" className="bg-gray-800 p-3 rounded border border-gray-700 text-white outline-none focus:border-blue-500" required>
              <option value="">Hangi Manga?</option>
              {mangas.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input type="number" name="chapterNum" placeholder="No (Örn: 1)" className="bg-gray-800 p-3 rounded border border-gray-700 w-1/3 outline-none focus:border-blue-500" required />
              <input type="text" name="title" placeholder="Bölüm Adı (Opsiyonel)" className="bg-gray-800 p-3 rounded border border-gray-700 w-2/3 outline-none focus:border-blue-500" />
            </div>
            <div className="p-6 border-2 border-dashed border-gray-700 rounded-lg text-center hover:border-blue-500 transition group cursor-pointer relative bg-gray-800/50">
                <input type="file" name="pages" multiple accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required /> 
                <div className="pointer-events-none">
                    <span className="text-blue-400 font-bold block mb-2 text-3xl group-hover:scale-110 transition">+</span>
                    <span className="text-sm text-gray-300 font-bold">Resimleri Sürükle</span>
                </div>
            </div>
            <button className="bg-blue-600 p-3 rounded font-bold hover:bg-blue-500 transition shadow-lg shadow-blue-900/20 mt-2">
              Bölümü Yükle / Güncelle 🚀
            </button>
          </form>
        </div>
      </div>

      {/* --- BÖLÜM YÖNETİCİSİ (CHAPTER MANAGER) --- */}
      <div className="mb-12">
         <ChapterManager mangas={mangas} />
      </div>

      {/* --- MANGA YÖNETİMİ VE TÜR DÜZENLEME --- */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg">
        <h2 className="text-xl font-bold mb-6 text-red-400 border-b border-gray-700 pb-2">Manga Yönetimi</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400 text-sm uppercase tracking-wider">
                <th className="p-4 w-20">ID</th>
                <th className="p-4">Manga ve Türler</th>
                <th className="p-4 text-right w-32">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {mangas.map((m) => (
                <tr key={m.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                  <td className="p-4 font-mono text-xs text-gray-500 align-top">{m.id}</td>
                  <td className="p-4">
                    <div className="font-medium text-lg text-white mb-2">{m.title}</div>
                    
                    {/* YENİ: Tür Düzenleyici (Açılır Kapanır Detay) */}
                    <details className="group">
                        <summary className="text-xs text-green-400 cursor-pointer hover:text-green-300 list-none select-none flex items-center gap-2">
                           <span>🏷️ Türleri Düzenle ({m.genres?.length || 0})</span>
                           <span className="group-open:rotate-90 transition-transform">▶</span>
                        </summary>
                        <div className="mt-3 ml-2 border-l-2 border-gray-700 pl-4">
                           {/* GenreEditor'e string ID gönderiyoruz */}
                           <GenreEditor mangaId={String(m.id)} initialGenres={m.genres || []} />
                        </div>
                    </details>
                  </td>
                  <td className="p-4 text-right align-top">
                    <DeleteButton id={m.id} />
                  </td>
                </tr>
              ))}
              {mangas.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-500 italic">Hiç manga bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}