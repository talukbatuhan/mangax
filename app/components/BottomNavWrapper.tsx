"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

export default function BottomNavWrapper() {
  const pathname = usePathname();

  if (!pathname) return <BottomNav />;

  // URL parçalarına ayır. Örn: ["manga", "slug-adi", "14"]
  const segments = pathname.split("/").filter(Boolean);

  // 1. Admin ise GİZLE
  if (segments[0] === "admin") return null;

  // 2. Okuma Sayfası ise GİZLE
  // "manga" ile başlıyorsa VE 3 parça ise (slug + chapter) -> Bu bir okuma sayfasıdır.
  const isReaderPage = segments[0] === "manga" && segments.length >= 3;
  
  if (isReaderPage) {
    return null; // Global menüyü yok et!
  }

  return <BottomNav />;
}