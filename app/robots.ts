import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://talucscans.com'; // Kendi domainini buraya yaz

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/', // Admin paneline botlar girmesin
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}