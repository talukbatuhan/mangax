"use client";

import { useFormStatus } from "react-dom";
import { updateSettingsAction } from "@/app/admin/actions";
import { Save, Globe, Megaphone, Loader2 } from "lucide-react";

// 'any' yerine kullanacağımız tip tanımı
interface SettingsType {
  site_name: string;
  site_description: string;
  announcement_active: boolean;
  announcement_text: string;
  // maintenance_mode kaldırıldı
}

// Kaydet butonunu ayrı bir bileşen yapıyoruz ki loading durumunu yakalayabilelim
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:opacity-70 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition shadow-lg shadow-purple-900/20"
    >
      {pending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
      {pending ? "Kaydediliyor..." : "Ayarları Kaydet"}
    </button>
  );
}

export default function SettingsForm({ settings }: { settings?: SettingsType | null }) {
  
  const initialSettings = {
    site_name: settings?.site_name ?? "",
    site_description: settings?.site_description ?? "",
    announcement_active: settings?.announcement_active ?? false,
    announcement_text: settings?.announcement_text ?? "",
    // maintenance_mode initial değerlerden kaldırıldı
  };

  const handleFormAction = async (formData: FormData) => {
    await updateSettingsAction(formData);
  };

  return (
    <form action={handleFormAction} className="space-y-8">
      {/* 1. SEO ve Genel Bilgiler */}
      <div className="bg-gray-900 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Globe size={18} className="text-blue-400" /> Site Kimliği (SEO)
        </h3>
        <div className="grid gap-4">
          <div>
            <label className="text-xs text-gray-400 uppercase font-bold mb-1.5 block">
              Site Başlığı
            </label>
            <input
              name="site_name"
              defaultValue={initialSettings.site_name}
              className="w-full bg-black border border-gray-700 text-white px-4 py-3 rounded-lg focus:border-purple-500 outline-none"
              placeholder="Örn: TalucScans"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase font-bold mb-1.5 block">
              Site Açıklaması (Meta Description)
            </label>
            <textarea
              name="site_description"
              defaultValue={initialSettings.site_description}
              rows={3}
              className="w-full bg-black border border-gray-700 text-white px-4 py-3 rounded-lg focus:border-purple-500 outline-none"
              placeholder="Sitenin Google'da görünecek açıklaması..."
            />
          </div>
        </div>
      </div>

      {/* 2. Duyuru Bandı */}
      <div className="bg-gray-900 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Megaphone size={18} className="text-yellow-400" /> Duyuru Bandı
        </h3>

        <div className="flex items-center gap-3 mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <input
            type="checkbox"
            name="announcement_active"
            id="announcement_active"
            defaultChecked={initialSettings.announcement_active}
            className="w-5 h-5 accent-yellow-500 cursor-pointer"
          />
          <label
            htmlFor="announcement_active"
            className="text-sm text-yellow-100 cursor-pointer select-none"
          >
            Duyuru bandını sitenin en tepesinde göster
          </label>
        </div>

        <div>
          <label className="text-xs text-gray-400 uppercase font-bold mb-1.5 block">
            Duyuru Metni
          </label>
          <input
            name="announcement_text"
            defaultValue={initialSettings.announcement_text}
            className="w-full bg-black border border-gray-700 text-white px-4 py-3 rounded-lg focus:border-yellow-500 outline-none"
            placeholder="Örn: Discord sunucumuz açıldı! Hemen katılın."
          />
        </div>
      </div>

      {/* 3. Tehlikeli Bölge (SİLİNDİ) */}

      {/* Kaydet Butonu */}
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}