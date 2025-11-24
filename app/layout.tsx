import type { Metadata, Viewport } from "next"; // Viewport'u buraya ekledik
// 1. Google Font'u çağırıyoruz
import { Poppins } from "next/font/google"; 
import "./globals.css";
import FooterWrapper from "@/app/components/FooterWrapper";
import { Toaster } from "sonner";
import BottomNav from "./components/BottomNav";

// 2. Font ayarlarını yapıyoruz
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"], // İnce, Normal, Kalın
  variable: "--font-poppins",
});

// 1. Viewport Ayarları (Mobil uyumluluk ve renkler)
export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Kullanıcının zoom yapmasını engeller (Uygulama hissi için)
  userScalable: false, 
};

// 2. Metadata (SEO ve PWA)
export const metadata: Metadata = {
  title: "TalucScans",
  description: "Türkçe Manga Okuma Platformu",
  manifest: "/manifest.webmanifest", // Manifest dosyasını gösteriyoruz
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TalucScans",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      {/* 3. Fontu body'e uyguluyoruz */}
      <body className={`${poppins.variable} font-sans bg-[#0a0a0a] text-gray-200 antialiased`}>
        {children}
        <FooterWrapper />
        <BottomNav />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}