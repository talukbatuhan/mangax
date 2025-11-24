"use client"; // usePathname kullanacağımız için Client Component şart

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav"; // Mevcut BottomNav bileşenini buradan çağırıyoruz

export default function BottomNavWrapper() {
  const pathname = usePathname();

  // Eğer mevcut yol "/admin" ile başlıyorsa HİÇBİR ŞEY (null) döndür
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Admin panelinde değilsek BottomNav'ı göster
  return <BottomNav />;
}