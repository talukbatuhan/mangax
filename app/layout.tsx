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

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, 
};

// Kendi domainini buraya yaz
const BASE_URL = 'https://talucscans.com'; 

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "TalucScans - Türkçe Manga ve Webtoon Oku",
    template: "%s | TalucScans", // Örn: Solo Leveling | TalucScans
  },
  description: "En sevdiğin mangaları, webtoonları ve çizgi romanları yüksek kalitede, ücretsiz ve Türkçe olarak TalucScans'ta oku.",
  keywords: ["manga oku", "türkçe manga", "webtoon oku", "manga indir", "online manga"],
  openGraph: {
    title: "TalucScans - Türkçe Manga Oku",
    description: "En güncel manga ve webtoon arşivi.",
    url: BASE_URL,
    siteName: "TalucScans",
    locale: "tr_TR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico", // Public klasörüne favicon.ico atmayı unutma
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