import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

// 1. PWA Ayarları
const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
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
  
  // --- DÜZELTME BURADA: Limiti 50MB yapıyoruz ---
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb', 
    },
  },
};

export default withPWA(nextConfig);