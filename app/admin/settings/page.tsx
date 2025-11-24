import { Settings, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8 border-b border-white/10 pb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="text-gray-400" /> Genel Ayarlar
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Site başlığı, açıklaması ve bakım modu ayarları.
        </p>
      </div>

      <div className="bg-gray-900 p-8 rounded-xl border border-white/10 text-center py-20">
        <div className="inline-flex p-4 rounded-full bg-white/5 mb-4">
            <Settings size={48} className="text-gray-600" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Bu Sayfa Hazırlanıyor</h3>
        <p className="text-gray-500 max-w-md mx-auto">
            SEO ayarları, Site Başlığı ve Bakım Modu gibi özellikleri çok yakında buradan yönetebileceksiniz.
        </p>
      </div>
    </div>
  );
}