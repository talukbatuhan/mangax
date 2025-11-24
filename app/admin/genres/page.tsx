import { supabase } from "@/lib/supabase";
import { addGenre, deleteGenre } from "@/app/admin/actions";
import { Trash2, Plus, Tag } from "lucide-react";

export const revalidate = 0;

export default async function GenresPage() {
  const { data: genres } = await supabase.from("genres").select("*").order("name", { ascending: true });

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
        <Tag className="text-purple-500" /> Tür ve Kategori Yönetimi
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* SOL: YENİ EKLE */}
        <div className="bg-gray-900 p-6 rounded-xl border border-white/10 h-fit">
          <h3 className="font-bold text-white mb-4">Yeni Tür Ekle</h3>
          <form action={addGenre} className="flex gap-2">
            <input 
              name="name" 
              placeholder="Örn: Isekai" 
              className="bg-black border border-gray-700 text-white px-4 py-2 rounded-lg w-full focus:border-purple-500 outline-none"
              required
            />
            <button className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-lg transition">
              <Plus />
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-3">
            * Bu türler manga ekleme sayfasında standart olarak görünecektir.
          </p>
        </div>

        {/* SAĞ: LİSTE */}
        <div className="bg-gray-900 rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-black/20">
            <h3 className="font-bold text-gray-300 text-sm">Kayıtlı Türler ({genres?.length || 0})</h3>
          </div>
          <div className="max-h-[500px] overflow-y-auto divide-y divide-white/5">
            {genres?.map((genre) => (
              <div key={genre.id} className="p-3 flex justify-between items-center hover:bg-white/5 group">
                <span className="text-gray-300 font-medium">{genre.name}</span>
                <form action={deleteGenre.bind(null, genre.id)}>
                  <button className="text-gray-600 hover:text-red-400 transition">
                    <Trash2 size={16} />
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}