import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import FooterWrapper from "@/app/components/FooterWrapper";
import { Toaster } from "sonner";
import BottomNav from "./components/BottomNav";
import { createClient } from "@/lib/supabase/server"; // Server Component için güvenli client
import { Megaphone } from "lucide-react";

// Font Ayarları
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-poppins",
});

// Viewport Ayarları
export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const BASE_URL = 'https://talucscans.com';

// --- 1. DİNAMİK METADATA (SEO) ---
export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  
  // Ayarları çek
  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .single();

  const siteName = settings?.site_name || "TalucScans";
  const siteDesc = settings?.site_description || "Türkçe Manga ve Webtoon Oku";

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: `${siteName} - Türkçe Manga Oku`,
      template: `%s | ${siteName}`, // Örn: Solo Leveling | TalucScans
    },
    description: siteDesc,
    keywords: ["manga oku", "türkçe manga", "webtoon oku", "manga indir", "online manga"],
    openGraph: {
      title: siteName,
      description: siteDesc,
      url: BASE_URL,
      siteName: siteName,
      locale: "tr_TR",
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: "/favicon.ico",
    },
  };
}

// --- 2. ROOT LAYOUT ---
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  // Ayarları tekrar çek
  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .single();

  // --- BAKIM MODU EKRANI TAMAMEN SİLİNDİ ---
  // Artık sadece normal site render ediliyor.

  return (
    <html lang="tr">
      <body className={`${poppins.variable} font-sans bg-[#0a0a0a] text-gray-200 antialiased flex flex-col min-h-screen`}>
        
        {/* --- DUYURU BANDI --- */}
        {/* Eğer ayar aktifse ve metin varsa göster */}
        {settings?.announcement_active && settings?.announcement_text && (
           <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-xs md:text-sm font-bold py-2 px-4 text-center shadow-lg relative z-50 flex items-center justify-center gap-2">
              <Megaphone size={16} className="animate-pulse" />
              <span>{settings.announcement_text}</span>
           </div>
        )}

        {/* Ana İçerik */}
        <div className="flex-1">
          {children}
        </div>
        
        <FooterWrapper />
        <BottomNav />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}