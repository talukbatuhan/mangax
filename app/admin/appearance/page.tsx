import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { toggleSlider } from "@/app/admin/actions";
import { Trash2, PlusCircle } from "lucide-react";
import { revalidatePath } from "next/cache";
import AddSliderButton from "@/app/components/admin/AddSliderButton";

export const revalidate = 0;

// 1. TİP TANIMI (INTERFACE)
interface SliderItem {
  id: number;
  manga_id: string;
  mangas: {
    id: string;
    title: string;
    cover_url: string | null;
    author: string | null;
  };
}

interface MangaItem {
  id: string;
  title: string;
  cover_url: string | null;
}

export default async function AppearancePage() {
  
  // 2. VERİ ÇEKME
  const { data: sliderData } = await supabase
    .from("slider_items")
    .select(`
      id,
      manga_id,
      mangas (id, title, cover_url, author)
    `)
    .order("created_at", { ascending: false });

  // 3. TİP DÖNÜŞÜMÜ (CASTING)
  // Gelen veriyi 'SliderItem[]' olarak işaretliyoruz
  const sliderItems = (sliderData as unknown as SliderItem[]) || [];

  const { data: mangasData } = await supabase
    .from("mangas")
    .select("*")
    .limit(20)
    .order("created_at", { ascending: false });

  const availableMangas = (mangasData as unknown as MangaItem[]) || [];

  // Vitrinden Kaldırma Action'ı
  async function removeFromSlider(formData: FormData) {
    "use server";
    const id = formData.get("mangaId") as string;
    await toggleSlider(id);
    revalidatePath("/admin/appearance");
  }

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold text-white border-b border-white/10 pb-4">
        Slider / Vitrin Yönetimi
      </h1>

      {/* --- AKTİF SLIDER LİSTESİ --- */}
      <div>
        <h2 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
           <span>🖼️</span> Aktif Vitrin ({sliderItems.length})
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sliderItems.map((item) => (
            <div key={item.id} className="bg-gray-900 border border-green-500/30 rounded-xl p-4 flex gap-4 items-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition" />
               
               <div className="relative w-16 h-24 shrink-0 rounded overflow-hidden shadow-lg bg-black">
                  {item.mangas.cover_url && <Image src={item.mangas.cover_url} alt="" fill className="object-cover" />}
               </div>
               <div className="z-10 flex-1">
                  <h4 className="font-bold text-white line-clamp-1">{item.mangas.title}</h4>
                  <p className="text-xs text-gray-500">{item.mangas.author || "Yazar Yok"}</p>
               </div>
               
               <form action={removeFromSlider} className="z-10">
                  <input type="hidden" name="mangaId" value={item.manga_id} />
                  <button className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition">
                    <Trash2 size={18} />
                  </button>
               </form>
            </div>
          ))}
          
          {sliderItems.length === 0 && (
             <div className="col-span-full p-8 text-center border-2 border-dashed border-gray-800 rounded-xl text-gray-500">
                Vitrinde hiç manga yok. Aşağıdan ekle! 👇
             </div>
          )}
        </div>
      </div>

      {/* --- EKLEME ALANI --- */}
      <div>
         <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
           <PlusCircle className="text-blue-400" /> Vitrine Ekle
         </h2>
         
         <div className="bg-gray-900 rounded-xl border border-white/10 overflow-hidden">
            <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
               {availableMangas.map((manga) => {
                  const isAdded = sliderItems.some((s) => s.manga_id === manga.id);
                  
                  return (
                    <div key={manga.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-gray-800 overflow-hidden relative border border-white/10">
                             {manga.cover_url && <Image src={manga.cover_url} alt="" fill className="object-cover" />}
                          </div>
                          <span className={isAdded ? "text-green-500 font-bold" : "text-gray-300"}>
                             {manga.title}
                          </span>
                       </div>
                       
                       <AddSliderButton mangaId={manga.id} isAdded={isAdded} />
                    </div>
                  );
               })}
            </div>
         </div>
      </div>
    </div>
  );
}