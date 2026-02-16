import { MetadataRoute } from 'next'
import { getAllCategories, getKOLsByCategory } from '@/lib/queries'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://x-kol.vercel.app'

  // Get all categories
  const categories = await getAllCategories()

  // Get all KOLs
  const allKOLs: { username: string; updated_at: Date }[] = []
  for (const category of categories) {
    const kols = await getKOLsByCategory(category.slug, 1000) // Get all KOLs for this category
    kols.forEach(kol => {
      // Avoid duplicates (some KOLs belong to multiple categories)
      if (!allKOLs.find(k => k.username === kol.username)) {
        allKOLs.push({
          username: kol.username,
          updated_at: kol.updated_at ? new Date(kol.updated_at) : new Date()
        })
      }
    })
  }

  // Homepage
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  // Category pages
  categories.forEach(category => {
    routes.push({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: category.updated_at ? new Date(category.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  })

  // KOL detail pages
  allKOLs.forEach(kol => {
    routes.push({
      url: `${baseUrl}/kol/${kol.username}`,
      lastModified: kol.updated_at,
      changeFrequency: 'weekly',
      priority: 0.6,
    })
  })

  // Search page
  routes.push({
    url: `${baseUrl}/search`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.5,
  })

  return routes
}
