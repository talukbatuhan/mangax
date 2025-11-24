import { Users, BookOpen, Eye, MessageSquare } from "lucide-react";

export default function AdminDashboard() {
  // Bu verileri normalde veritabanından çekeceğiz
  const stats = [
    { title: "Toplam Okunma", value: "1.2M", icon: Eye, color: "text-blue-400", bg: "bg-blue-400/10" },
    { title: "Aktif Üyeler", value: "8,540", icon: Users, color: "text-green-400", bg: "bg-green-400/10" },
    { title: "Toplam Manga", value: "142", icon: BookOpen, color: "text-purple-400", bg: "bg-purple-400/10" },
    { title: "Yeni Yorumlar", value: "34", icon: MessageSquare, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8 text-white">Panel Özeti</h1>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-gray-900 p-6 rounded-2xl border border-white/5 flex items-center gap-4 hover:border-white/10 transition">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                <h4 className="text-2xl font-bold text-white">{stat.value}</h4>
              </div>
            </div>
          );
        })}
      </div>

      {/* İkinci Satır: Örnek Tablo veya Grafik Alanı */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Geniş Alan */}
        <div className="lg:col-span-2 bg-gray-900 rounded-2xl border border-white/5 p-6">
            <h3 className="font-bold mb-4 text-white">Son Okunanlar</h3>
            <div className="h-64 flex items-center justify-center text-gray-600 border-2 border-dashed border-gray-800 rounded-xl">
                Grafik Alanı Gelecek
            </div>
        </div>

        {/* Sağ Dar Alan */}
        <div className="bg-gray-900 rounded-2xl border border-white/5 p-6">
            <h3 className="font-bold mb-4 text-white">Sunucu Durumu</h3>
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">CPU Kullanımı</span>
                        <span className="text-green-400">12%</span>
                    </div>
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-green-500 w-[12%] h-full"></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Depolama (S3)</span>
                        <span className="text-blue-400">45%</span>
                    </div>
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 w-[45%] h-full"></div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}