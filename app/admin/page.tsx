import { createClient } from "@/lib/supabase/server";
import { Users, BookOpen, Eye, MessageSquare, TrendingUp, Star } from "lucide-react";

export const revalidate = 0;

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: totalMangas },
    { count: totalUsers },
    { count: totalComments },
    { data: allViews },
    { data: topViewed },
    { data: topRated }
  ] = await Promise.all([
    supabase.from("mangas").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("comments").select("*", { count: "exact", head: true }),
    supabase.from("mangas").select("views"),
    supabase.from("mangas").select("title, views").order("views", { ascending: false }).limit(6),
    supabase.from("mangas").select("title, rating_avg").order("rating_avg", { ascending: false }).limit(5),
  ]);

  const totalViewsCount = allViews?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0;

  const stats = [
    { title: "Total Reads", value: totalViewsCount.toLocaleString(), icon: Eye, color: "text-blue-400", bg: "bg-blue-400/10" },
    { title: "Registered Members", value: totalUsers || 0, icon: Users, color: "text-green-400", bg: "bg-green-400/10" },
    { title: "Total Series", value: totalMangas || 0, icon: BookOpen, color: "text-purple-400", bg: "bg-purple-400/10" },
    { title: "Total Comments", value: totalComments || 0, icon: MessageSquare, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  ];

  const maxView = topViewed?.[0]?.views || 1;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Başlık */}
      <h1 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-white flex items-center gap-2">
        <TrendingUp className="text-green-500 w-6 h-6 md:w-8 md:h-8" /> Dashboard
      </h1>

      {/* --- 1. İSTATİSTİK KARTLARI --- */}
      {/* Grid: Mobilde 1, Tablette 2, Genişte 4 kolon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-gray-900 p-4 md:p-6 rounded-2xl border border-white/5 flex items-center gap-4 hover:border-white/20 transition shadow-lg">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} shrink-0`}>
                <Icon size={20} className="md:w-6 md:h-6" />
              </div>
              <div className="overflow-hidden">
                <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider truncate">{stat.title}</p>
                <h4 className="text-xl md:text-2xl font-black text-white truncate">{stat.value}</h4>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- 2. GRAFİK VE LİSTELER --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* SOL: En Çok Okunanlar */}
        <div className="lg:col-span-2 bg-gray-900 rounded-2xl border border-white/5 p-4 md:p-6 shadow-lg">
            <h3 className="font-bold mb-4 md:mb-6 text-white flex items-center gap-2 text-sm md:text-base">
                <Eye size={20} className="text-pink-400" /> Top 6 Most Read
            </h3>
            
            <div className="space-y-4 md:space-y-5">
                {topViewed?.map((manga, index) => {
                    const percentage = Math.round((manga.views / maxView) * 100);
                    return (
                        <div key={index}>
                            <div className="flex justify-between text-xs md:text-sm mb-1">
                                <span className="text-gray-300 font-medium truncate pr-2">{manga.title}</span>
                                <span className="text-purple-400 font-mono shrink-0">{manga.views.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-black/40 h-2 md:h-3 rounded-full overflow-hidden border border-white/5">
                                <div 
                                    className="bg-gradient-to-r from-purple-600 to-pink-400 h-full rounded-full transition-all duration-1000" 
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
                 {(!topViewed || topViewed.length === 0) && (
                    <div className="text-center text-gray-500 py-10 text-sm">Veri yok.</div>
                )}
            </div>
        </div>

        {/* SAĞ: En Yüksek Puanlılar */}
        <div className="bg-gray-900 rounded-2xl border border-white/5 p-4 md:p-6 shadow-lg">
            <h3 className="font-bold mb-4 md:mb-6 text-white flex items-center gap-2 text-sm md:text-base">
                <Star size={18} className="text-purple-400" /> Highest Rated
            </h3>
            
            <div className="space-y-3 md:space-y-4">
                {topRated?.map((manga, index) => (
                    <div key={index} className="flex items-center justify-between p-2 md:p-3 bg-white/5 rounded-lg hover:bg-white/10 transition">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`
                                w-5 h-5 md:w-6 md:h-6 rounded flex items-center justify-center text-[10px] md:text-xs font-bold shrink-0
                                ${index === 0 ? 'bg-yellow-500 text-black' : 
                                  index === 1 ? 'bg-gray-400 text-black' : 
                                  index === 2 ? 'bg-orange-700 text-white' : 'bg-gray-800 text-gray-400'}
                            `}>
                                {index + 1}
                            </div>
                            <span className="text-gray-300 text-xs md:text-sm truncate">{manga.title}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-yellow-400 font-bold text-xs md:text-sm shrink-0">
                            <span>{manga.rating_avg || "0.0"}</span>
                            <Star size={12} fill="currentColor" />
                        </div>
                    </div>
                ))}
                 {(!topRated || topRated.length === 0) && (
                    <div className="text-center text-gray-500 py-10 text-sm">Henüz puan yok.</div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}