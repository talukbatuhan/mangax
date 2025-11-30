import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

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
      // --- EKLENEN KISIM: Placeholder hatasını çözer ---
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
  
  experimental: {
    serverActions: {
      // Manga bölümleri büyük olabileceği için limiti 250MB'a çıkarıyoruz
      bodySizeLimit: '250mb', 
    },
  },
};

export default withPWA(nextConfig);