import type { Metadata } from "next";
// 1. Google Font'u çağırıyoruz
import { Poppins } from "next/font/google"; 
import "./globals.css";

// 2. Font ayarlarını yapıyoruz
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"], // İnce, Normal, Kalın
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "TalucScans - Türkçe Manga Oku",
  description: "En sevdiğin mangaları buradan oku.",
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
      </body>
    </html>
  );
}