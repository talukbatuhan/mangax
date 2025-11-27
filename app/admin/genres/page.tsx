import { supabase } from "@/lib/supabase";
import { addGenreAction, deleteGenreAction } from "@/app/admin/actions";
import { Trash2, Plus, Tag, Layers } from "lucide-react";


export const revalidate = 0;

export default async function GenresPage() {
  // Türleri alfabetik çek
  const { data: genres } = await supabase
    .from("genres")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 border-b border-white/10 pb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Layers className="text-purple-500" /> Tür ve Kategori Yönetimi
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Manga eklerken kullanılacak standart türleri buradan yönetebilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* SOL: YENİ TÜR EKLEME FORMU */}
        <div className="md:col-span-1">
            <div className="bg-gray-900 p-6 rounded-xl border border-white/10 sticky top-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Plus size={18} className="text-green-500" /> Yeni Tür Ekle
                </h3>
                <form action={addGenreAction} className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold mb-1.5 block">Tür Adı</label>
                        <input 
                        name="name" 
                        placeholder="Örn: Cyberpunk" 
                        className="w-full bg-black border border-gray-700 text-white px-4 py-3 rounded-lg focus:border-green-500 outline-none transition"
                        required
                        />
                    </div>
                    <button className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2">
                        <Plus size={18} /> Ekle
                    </button>
                </form>
                
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-xs text-blue-200 leading-relaxed">
                        ℹ️ Buraya eklediğiniz türler Yeni Manga Ekle sayfasındaki seçim listesinde otomatik olarak görünecektir.
                    </p>
                </div>
            </div>
        </div>

        {/* SAĞ: TÜR LİSTESİ */}
        <div className="md:col-span-2">
            <div className="bg-gray-900 rounded-xl border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
                    <h3 className="font-bold text-gray-200 text-sm">Kayıtlı Türler</h3>
                    <span className="bg-white/10 text-white text-xs px-2 py-1 rounded font-mono">
                        {genres?.length || 0}
                    </span>
                </div>
                
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar p-2">
                    {genres && genres.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {genres.map((genre) => (
                                <div key={genre.id} className="group flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] border border-white/5 hover:border-white/20 px-3 py-2 rounded-lg transition">
                                    <Tag size={14} className="text-gray-500 group-hover:text-purple-400 transition" />
                                    <span className="text-sm text-gray-300 font-medium">{genre.name}</span>
                                    
                                    {/* Silme Butonu (Form içinde) */}
                                    <form action={deleteGenreAction.bind(null, genre.id)}>
                                        <button 
                                            className="ml-2 p-1 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded transition"
                                            title="Sil"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </form>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-10 text-center text-gray-500">Henüz tür eklenmemiş.</div>
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}