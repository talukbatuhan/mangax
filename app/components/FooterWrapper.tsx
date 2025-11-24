"use client"; // İstemci bileşeni (Adres çubuğunu okuyabilmesi için)

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterWrapper() {
  const pathname = usePathname();

  // Eğer adres "/admin" ile başlıyorsa Footer'ı GÖSTERME (null döndür)
  if (pathname.startsWith("/admin")) {
    return null;
  }

  // Değilse Footer'ı göster
  return <Footer />;
}