import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google"; 
import "./globals.css";
import FooterWrapper from "@/app/components/FooterWrapper";
import { Toaster } from "sonner";
// DİKKAT: Artık doğrudan BottomNav'ı değil, oluşturduğumuz Wrapper'ı çağırıyoruz
import BottomNavWrapper from "@/app/components/BottomNavWrapper";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-poppins",
});

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, 
};

export const metadata: Metadata = {
  title: "TalucScans",
  description: "Türkçe Manga Okuma Platformu",
  manifest: "/manifest.webmanifest",
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
      <body className={`${poppins.variable} font-sans bg-[#0a0a0a] text-gray-200 antialiased`}>
        {children}
        
        {/* Footer muhtemelen kendi içinde kontrol yapıyor, o yüzden dokunmadım */}
        <FooterWrapper />
        
        {/* ARTIK BURADA WRAPPER VAR */}
        {/* Admin sayfalarında otomatik olarak gizlenecek */}
        <BottomNavWrapper />
        
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}