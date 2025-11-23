import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Supabase resimleri için
      },
      // BUNU EKLEMEN GEREKİYOR:
      {
        protocol: 'https',
        hostname: 'api.dicebear.com', // Avatar API'si için
      },
    ],
  },
};

export default nextConfig;