import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = 'https://talucscans.com'; // Kendi domainini buraya yaz (Sonunda / olmasın)

  // 1. Tüm mangaların slug'larını çek
  const { data: mangas } = await supabase
    .from('mangas')
    .select('slug, updated_at')

  // 2. Manga URL'lerini oluştur
  const mangaUrls = (mangas || []).map((manga) => ({
    url: `${baseUrl}/manga/${manga.slug}`,
    lastModified: new Date(manga.updated_at || new Date()),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // 3. Statik Sayfalar
  const staticRoutes = [
    '',
    '/search',
    '/login',
    '/register',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  }))

  return [...staticRoutes, ...mangaUrls]
}