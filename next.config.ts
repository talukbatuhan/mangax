/** @type {import('next').NextConfig} */
const nextConfig = {
  // --- BURAYI EKLE ---
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb', // Varsayılan limiti 50MB yapıyoruz
    },
  },
  // -------------------
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_SUPABASE_URL 
          ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname 
          : '**.supabase.co', // Hata almamak için genel bir yapı
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;