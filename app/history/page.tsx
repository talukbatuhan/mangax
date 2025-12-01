import Navbar from "@/app/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { History, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import HistoryItem from "@/app/components/HistoryItem";
import { clearHistory } from "@/app/actions";

export const revalidate = 0;

// 1. Supabase'den dönen verinin tipini tanımlıyoruz
type HistoryEntry = {
  manga_id: string;
  last_read_at: string;
  // Supabase join işlemlerinde veriyi varsayılan olarak dizi içinde döndürür
  mangas: { title: string; slug: string; cover_url: string | null }[] | null;
  chapters: { chapter_number: number }[] | null;
};

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data } = await supabase
    .from("reading_history")
    .select(`
      manga_id,
      last_read_at,
      mangas (title, slug, cover_url),
      chapters (chapter_number)
    `)
    .eq("user_id", user.id)
    .order("last_read_at", { ascending: false });

  // 2. Gelen veriyi oluşturduğumuz tipe dönüştürüyoruz (Type Assertion)
  // Bu sayede 'any' kullanmadan TypeScript'e verinin yapısını öğretiyoruz.
  const history = data as unknown as HistoryEntry[] | null;

  async function clearAll() {
    "use server";
    await clearHistory();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <Navbar />

      <div className="container mx-auto px-4 py-24 max-w-3xl">
        
        {/* Başlık Alanı */}
        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
                <Link href="/profile" className="p-2 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold flex items-center gap-3">
                    <History className="text-green-500" /> Okuma Geçmişi
                </h1>
            </div>

            {history && history.length > 0 && (
                <form action={clearAll}>
                    <button className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-2 bg-red-500/10 px-4 py-2 rounded-full hover:bg-red-500/20 transition">
                        <Trash2 size={14} /> Tümünü Temizle
                    </button>
                </form>
            )}
        </div>

        {/* Liste */}
        <div className="space-y-3">
            {history && history.length > 0 ? (
                history.map((item) => {
                    // 3. Veri Dönüşümü
                    // 'item' artık HistoryEntry tipinde olduğu için any kullanmaya gerek yok.
                    // Dizi içinden ilk elemanı güvenli bir şekilde alıyoruz (?.[0])
                    // Eğer dizi boşsa veya null ise 'null' döndürürüz.
                    const formattedItem = {
                        ...item,
                        mangas: item.mangas?.[0] ?? null,
                        chapters: item.chapters?.[0] ?? null
                    };

                    return <HistoryItem key={item.manga_id} item={formattedItem} />;
                })
            ) : (
                <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/50">
                    <div className="text-6xl mb-4 opacity-20">🕸️</div>
                    <h3 className="text-xl font-bold text-gray-400">Geçmişin Tertemiz</h3>
                    <p className="text-gray-600 mt-2 mb-6">Henüz hiçbir manga okumadın veya geçmişini temizledin.</p>
                    <Link href="/search" className="px-6 py-3 bg-green-600 hover:bg-green-500 text-black font-bold rounded-full transition">
                        Okumaya Başla
                    </Link>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}