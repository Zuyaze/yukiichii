import { Metadata } from 'next'
import Link from 'next/link'
import { getApps, getCategories, getHeroImages } from '@/lib/db/queries'
import { Button } from '@/components/ui/button'
import { ArrowRight, Download, AlertCircle } from 'lucide-react'
import { unstable_noStore } from 'next/cache'
import { SearchBar } from '@/components/search-bar'

export const metadata: Metadata = {
  title: 'Kumpulan Mod Apk & Loader Gratis',
  description: 'Kumpulan Mod Apk & Loader gratis terbaru. Download cepat, aman, dan tanpa ribet.',
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  unstable_noStore()

  let categories: any[] = []
  let recentApps: any[] = []
  let heroImages: any[] = []
  let dbError: Error | null = null

  try {
    const [catsData, appsData, heroData] = await Promise.all([
      getCategories(),
      getApps({ limit: 10 }),
      getHeroImages(),
    ])
    categories = catsData
    recentApps = appsData
    heroImages = heroData
  } catch (error) {
    console.error('Database error:', error)
    dbError = error as Error
    categories = []
    recentApps = []
    heroImages = []
  }

  // Fetch apps per category (max 10 each)
  const categorySections = await Promise.all(
    categories.map(async cat => {
      try {
        const apps = await getApps({ category: cat.slug, limit: 10 })
        return {
          ...cat,
          apps: apps.map(app => ({
            slug: app.slug,
            title: app.title,
            screenshot_url: (app as any).screenshots?.[0] ?? null,
            icon_url: (app as any).icon_url ?? null,
            category_name: cat.name,
            category_color: cat.color,
          })),
        }
      } catch {
        return { ...cat, apps: [] }
      }
    })
  )

  // Map recent apps for display
  const recentCards = recentApps.map(app => ({
    slug: app.slug,
    title: app.title,
    screenshot_url: (app as any).screenshots?.[0] ?? null,
    icon_url: (app as any).icon_url ?? null,
    category_name: (app as any).category_name || null,
    category_color: (app as any).category_color || '#3b82f6',
  }))

  return (
    <div className="flex flex-col min-h-screen">
      {dbError && (
        <div className="bg-yellow-50 border-y border-yellow-200 px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2 text-yellow-700 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Database sedang bermasalah.</span>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <section className="border-b border-border bg-muted/30 py-6">
        <div className="mx-auto max-w-2xl px-4">
          <SearchBar placeholder="Cari mod..." />
        </div>
      </section>

      {/* Hero Section - Dynamic Gallery */}
      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="text-primary">Yukii</span>Chii
              <span className="mx-2 text-lg font-light text-muted-foreground/60 align-middle">×</span>
              <span className="text-foreground">Zuyaze</span>
            </h1>
          </div>

          {/* Hero Gallery Grid */}
          {heroImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {heroImages.map((image, index) => (
                <Link
                  key={image.id}
                  href="/apps"
                  className="group block relative aspect-video rounded-2xl overflow-hidden bg-muted ring-1 ring-border hover:ring-primary/50 transition-all"
                >
                  <img
                    src={image.image_url}
                    alt={image.alt_text || `Hero ${index + 1}`}
                    loading={index < 4 ? 'eager' : 'lazy'}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="w-full text-white">
                      {image.alt_text && (
                        <p className="text-sm sm:text-base font-medium mb-1">{image.alt_text}</p>
                      )}
                      <p className="text-xs sm:text-sm text-white/80">Jelajahi aplikasi →</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {/* Fallback placeholder images from public/hero/ */}
              {[1, 2, 3, 4].map(i => (
                <Link
                  key={i}
                  href="/apps"
                  className="group block relative aspect-video rounded-2xl overflow-hidden ring-1 ring-border hover:ring-primary/50 transition-all"
                >
                  <img
                    src={`/hero/hero-${i}.svg`}
                    alt={`Hero Gallery Demo ${i}`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="w-full text-white text-center">
                      <p className="text-xs sm:text-sm text-white/80">Jelajahi aplikasi →</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/apps">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                <Download className="w-5 h-5" />
                Jelajahi Aplikasi
              </Button>
            </Link>
            <Link href="/categories">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Lihat Kategori
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Aplikasi Terbaru ===== */}
      <section className="py-8 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Aplikasi Terbaru</h2>

          {recentCards.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {recentCards.map(app => (
                <Link
                  key={app.slug}
                  href={`/apps/${app.slug}`}
                  className="group block flex-shrink-0 w-28"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                    {(app.icon_url || app.screenshot_url) ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={app.icon_url || app.screenshot_url}
                        alt={app.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/15 to-primary/5">
                        <span className="text-2xl font-bold text-primary/60">{app.title.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    {/* Category badge */}
                    {app.category_name && (
                      <span
                        className="absolute top-1 left-1 px-1.5 py-0.5 text-[8px] font-bold rounded-md"
                        style={{ backgroundColor: `${app.category_color}E6`, color: '#fff' }}
                      >
                        {app.category_name}
                      </span>
                    )}
                    {/* GRATIS pill */}
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[8px] font-black rounded bg-green-500 text-white">GRATIS</span>
                  </div>
                  <p className="mt-1.5 text-xs font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {app.title}
                  </p>
                </Link>
              ))}

              {/* Lihat Semua tile */}
              <Link
                href="/apps"
                className="flex-shrink-0 w-28 flex flex-col"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-primary/5 border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/10 transition-all flex items-center justify-center">
                  <span className="flex flex-col items-center gap-1 text-primary">
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    <span className="text-[10px] font-bold">Lihat Semua</span>
                  </span>
                </div>
              </Link>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">Belum ada aplikasi terbaru.</p>
          )}
        </div>
      </section>

      {/* ===== Per-Category Sections ===== */}
      {categorySections.map(section => (
        <section key={section.id} className="py-8 border-t border-border first:border-t-0">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2 mb-4">
              {section.name}
            </h2>

            {section.apps.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {section.apps.map(app => (
                  <Link
                    key={app.slug}
                    href={`/apps/${app.slug}`}
                    className="group block flex-shrink-0 w-28"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                      {(app.icon_url || app.screenshot_url) ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={app.icon_url || app.screenshot_url}
                          alt={app.title}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/15 to-primary/5">
                          <span className="text-2xl font-bold text-primary/60">{app.title.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      {/* Category badge */}
                      <span
                        className="absolute top-1 left-1 px-1.5 py-0.5 text-[8px] font-bold rounded-md"
                        style={{ backgroundColor: `${section.color}E6`, color: '#fff' }}
                      >
                        {section.name}
                      </span>
                      {/* GRATIS pill */}
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[8px] font-black rounded bg-green-500 text-white">GRATIS</span>
                    </div>
                    <p className="mt-1.5 text-xs font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {app.title}
                    </p>
                  </Link>
                ))}

                {/* Lihat Semua tile at end */}
                <Link
                  href={`/apps?category=${section.slug}`}
                  className="group flex-shrink-0 w-28 flex flex-col"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-primary/5 border-2 border-dashed border-primary/30 group-hover:border-primary group-hover:bg-primary/10 transition-all flex items-center justify-center">
                    <span className="flex flex-col items-center gap-1 text-primary">
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      <span className="text-[10px] font-bold">Lihat Semua</span>
                    </span>
                  </div>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4">Belum ada mod di kategori ini.</p>
            )}
          </div>
        </section>
      ))}
    </div>
  )
}