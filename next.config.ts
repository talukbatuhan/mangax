import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

// 1. PWA Ayarları
const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development", // Geliştirme modunda kapalı
  workboxOptions: {
    disableDevLogs: true,
  },
  // 'swcMinify' BURADAN SİLİNDİ (Çünkü buraya ait değil)
});

// 2. Next.js Ayarları
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', 
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com', 
      },
    ],
  },
  // 'turbopack' ayarını da sildik çünkü package.json üzerinden hallettik
};

export default withPWA(nextConfig);