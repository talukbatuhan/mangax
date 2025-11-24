import { createClient } from "@/lib/supabase/server";
import { Users, BookOpen, Eye, MessageSquare, TrendingUp, Star } from "lucide-react";

export const revalidate = 0; // Veriler her zaman güncel olsun

export default async function AdminDashboard() {
  const supabase = await createClient();

  // --- 1. TÜM VERİLERİ PARALEL ÇEKELİM (Performans İçin) ---
  const [
    { count: totalMangas },
    { count: totalUsers },
    { count: totalComments },
    { data: allViews }, // Toplam okunma sayısını hesaplamak için
    { data: topViewed }, // Grafik için en çok okunan 5 manga
    { data: topRated }   // Sağ panel için en yüksek puanlı 5 manga
  ] = await Promise.all([
    supabase.from("mangas").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("comments").select("*", { count: "exact", head: true }),
    supabase.from("mangas").select("views"),
    supabase.from("mangas").select("title, views").order("views", { ascending: false }).limit(5),
    supabase.from("mangas").select("title, rating_avg").order("rating_avg", { ascending: false }).limit(5)
  ]);

  // Toplam Görüntülenme Sayısını Hesapla
  // (views sütunundaki tüm sayıları topluyoruz)
  const totalViewsCount = allViews?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0;

  // İstatistik Kartları Verisi
  const stats = [
    { 
      title: "Toplam Okunma", 
      value: totalViewsCount.toLocaleString(), 
      icon: Eye, 
      color: "text-blue-400", 
      bg: "bg-blue-400/10" 
    },
    { 
      title: "Kayıtlı Üyeler", 
      value: totalUsers || 0, 
      icon: Users, 
      color: "text-green-400", 
      bg: "bg-green-400/10" 
    },
    { 
      title: "Toplam Seri", 
      value: totalMangas || 0, 
      icon: BookOpen, 
      color: "text-purple-400", 
      bg: "bg-purple-400/10" 
    },
    { 
      title: "Toplam Yorum", 
      value: totalComments || 0, 
      icon: MessageSquare, 
      color: "text-yellow-400", 
      bg: "bg-yellow-400/10" 
    },
  ];

  // Grafik İçin En Yüksek Değeri Bul (Yüzde hesabı için)
  const maxView = topViewed?.[0]?.views || 1;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold mb-8 text-white flex items-center gap-2">
        <TrendingUp className="text-green-500" /> Panel Özeti
      </h1>

      {/* --- 1. İSTATİSTİK KARTLARI --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-gray-900 p-6 rounded-2xl border border-white/5 flex items-center gap-4 hover:border-white/20 transition shadow-lg">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{stat.title}</p>
                <h4 className="text-2xl font-black text-white">{stat.value}</h4>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- 2. GRAFİK VE LİSTELER --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SOL: En Çok Okunanlar (Bar Chart) */}
        <div className="lg:col-span-2 bg-gray-900 rounded-2xl border border-white/5 p-6 shadow-lg">
            <h3 className="font-bold mb-6 text-white flex items-center gap-2">
                <Eye size={18} className="text-blue-400" /> En Çok Okunan 5 Seri
            </h3>
            
            <div className="space-y-5">
                {topViewed?.map((manga, index) => {
                    // Genişlik yüzdesini hesapla
                    const percentage = Math.round((manga.views / maxView) * 100);
                    
                    return (
                        <div key={index}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-300 font-medium">{manga.title}</span>
                                <span className="text-blue-400 font-mono">{manga.views.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden border border-white/5">
                                <div 
                                    className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full transition-all duration-1000" 
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
                
                {(!topViewed || topViewed.length === 0) && (
                    <div className="text-center text-gray-500 py-10">Veri yok.</div>
                )}
            </div>
        </div>

        {/* SAĞ: En Yüksek Puanlılar (Liste) */}
        <div className="bg-gray-900 rounded-2xl border border-white/5 p-6 shadow-lg">
            <h3 className="font-bold mb-6 text-white flex items-center gap-2">
                <Star size={18} className="text-yellow-400" /> En Yüksek Puanlılar
            </h3>
            
            <div className="space-y-4">
                {topRated?.map((manga, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`
                                w-6 h-6 rounded flex items-center justify-center text-xs font-bold shrink-0
                                ${index === 0 ? 'bg-yellow-500 text-black' : 
                                  index === 1 ? 'bg-gray-400 text-black' : 
                                  index === 2 ? 'bg-orange-700 text-white' : 'bg-gray-800 text-gray-400'}
                            `}>
                                {index + 1}
                            </div>
                            <span className="text-gray-300 text-sm truncate">{manga.title}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                            <span>{manga.rating_avg || "0.0"}</span>
                            <Star size={12} fill="currentColor" />
                        </div>
                    </div>
                ))}

                {(!topRated || topRated.length === 0) && (
                    <div className="text-center text-gray-500 py-10">Henüz puan verilmemiş.</div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}