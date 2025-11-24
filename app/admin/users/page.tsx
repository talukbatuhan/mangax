import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { Search, User, Calendar, ShieldAlert } from "lucide-react";
import DeleteUserButton from "@/app/components/admin/DeleteUserButton";

export const revalidate = 0;

// Tip Tanımı
interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  updated_at: string;
}

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q: string }> }) {
  const { q } = await searchParams;
  const query = q || "";

  // 1. Kullanıcıları (Profilleri) Çek
  let dbQuery = supabase
    .from("profiles")
    .select("*")
    .order("updated_at", { ascending: false });

  // Arama varsa filtrele
  if (query) {
    dbQuery = dbQuery.ilike("username", `%${query}%`);
  }

  const { data: profiles } = await dbQuery;
  const users = (profiles as unknown as Profile[]) || [];

  return (
    <div className="space-y-8">
      
      {/* Başlık ve Arama */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-white/10 pb-6">
        <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <User className="text-blue-500" /> Üyeler
            </h1>
            <p className="text-gray-500 text-sm mt-1">Toplam {users.length} kayıtlı kullanıcı.</p>
        </div>

        <form className="relative w-full md:w-64">
            <input 
              name="q" 
              defaultValue={query}
              placeholder="Kullanıcı ara..." 
              className="w-full bg-gray-900 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-blue-500 outline-none text-white"
            />
            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
        </form>
      </div>

      {/* Kullanıcı Tablosu */}
      <div className="bg-gray-900 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-black/20 text-gray-400 text-xs uppercase font-bold border-b border-white/5">
            <tr>
              <th className="p-4">Kullanıcı</th>
              <th className="p-4">Kayıt / Güncelleme</th>
              <th className="p-4">Rol</th>
              <th className="p-4 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/5 transition">
                
                {/* Kullanıcı Bilgisi */}
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-white/10 relative">
                        {user.avatar_url ? (
                            <Image src={user.avatar_url} alt="" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                                {user.username?.charAt(0).toUpperCase() || "?"}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="font-bold text-white">{user.username || "İsimsiz Kullanıcı"}</div>
                        <div className="text-xs text-gray-500 font-mono">{user.id.slice(0, 8)}...</div>
                    </div>
                  </div>
                </td>

                {/* Tarih */}
                <td className="p-4 text-gray-400 font-mono text-xs">
                   <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      {new Date(user.updated_at).toLocaleDateString("tr-TR")}
                   </div>
                </td>

                {/* Rol (Şimdilik manuel kontrol, ileride DB'ye eklenebilir) */}
                <td className="p-4">
                   {/* Kendi ID'ni veya Admin ID'lerini buraya yazabilirsin kontrol için */}
                   {/* Şimdilik herkese "Üye" diyoruz */}
                   <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs border border-blue-500/20">
                      Üye
                   </span>
                </td>

                {/* İşlemler */}
                <td className="p-4 text-right">
                   <DeleteUserButton id={user.id} />
                </td>
              </tr>
            ))}

            {users.length === 0 && (
                <tr>
                    <td colSpan={4} className="p-12 text-center text-gray-500 italic">
                        Kullanıcı bulunamadı.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}