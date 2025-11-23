import Navbar from "@/app/components/Navbar";
import MangaCard from "@/app/components/MangaCard";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Manga } from "@/app/types";
import Link from "next/link";

// 1. Veri Tipini Tanımlıyoruz (ESLint'i susturmak için)
// "Veritabanından gelen her satırda 'mangas' adında bir Manga objesi olacak" diyoruz.
interface FavoriteRow {
  manga_id: string;
  mangas: Manga; // 'any' yerine gerçek tipimizi kullandık
}

export const revalidate = 0; // Sayfa her açıldığında veriyi taze çeksin (önbelleklemesin)

export default async function FavoritesPage() {
  const supabase = await createClient();

  // 2. Kullanıcı Giriş Yapmış mı?
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?returnUrl=/favorites");
  }

  // 3. Favorileri Çek
  const { data, error } = await supabase
    .from("favorites")
    .select(`
      manga_id,
      mangas (*) 
    `)
    .eq("user_id", user.id);

  if (error) console.error(error);

  // 4. Gelen veriyi tipine zorluyoruz (Type Casting)
  // Bu işlem "any" hatasını çözer.
  // Gelen verinin (data) bizim tanımladığımız 'FavoriteRow' dizisine benzediğini garanti ediyoruz.
  const favorites = (data as unknown as FavoriteRow[]) || [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <span className="text-red-500 text-4xl">❤️</span>
            Favori Mangalarım
        </h1>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {favorites.map((fav) => (
              // Artık 'fav' değişkeninin tipi belli, TypeScript hata vermez.
              // fav.mangas diyerek MangaCard'a veriyi gönderiyoruz.
              <MangaCard key={fav.manga_id} manga={fav.mangas} />
            ))}
          </div>
        ) : (
            <div className="text-center py-20 bg-gray-900 rounded-xl border border-gray-800">
                <p className="text-xl text-gray-400">Henüz hiç favorin yok.</p>
                <Link href="/" className="text-green-500 hover:underline mt-2 inline-block">Manga keşfetmeye başla →</Link>
            </div>
        )}
      </div>
    </div>
  );
}