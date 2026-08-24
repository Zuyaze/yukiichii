import { MetadataRoute } from 'next'
import { getApps, getCategories } from '@/lib/db/queries'
import { unstable_noStore } from 'next/cache'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  unstable_noStore()
  const baseUrl = 'https://yukiichii.vercel.app'

  const [apps, categories] = await Promise.all([
    getApps({ limit: 10000 }),
    getCategories(),
  ])

  const appUrls = apps.map(app => ({
    url: `${baseUrl}/apps/${app.slug}`,
    lastModified: new Date(app.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const categoryUrls = categories.map(cat => ({
    url: `${baseUrl}/apps?category=${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/apps`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...appUrls,
    ...categoryUrls,
  ]
}