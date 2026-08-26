import { Metadata } from 'next'
import Link from 'next/link'
import { getApps, getCategories } from '@/lib/db/queries'
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
  let dbError: Error | null = null

  try {
    const [catsData, appsData] = await Promise.all([
      getCategories(),
      getApps({ limit: 10 }),
    ])
    categories = catsData
    recentApps = appsData
  } catch (error) {
    console.error('Database error:', error)
    dbError = error as Error
    categories = []
    recentApps = []
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

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="text-primary">Yukii</span>Chii
              <span className="mx-2 text-lg font-light text-muted-foreground/60 align-middle">×</span>
              <span className="text-emerald-500">Zuyaze</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl max-w-3xl mx-auto">
              Kumpulan Mod Apk & Loader gratis terbaru.
              Game dan aplikasi mod premium, langsung download tanpa ribet.
            </p>
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
        </div>
      </section>

      {/* ===== Aplikasi Terbaru ===== */}
      <section className="py-8 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Aplikasi Terbaru</h2>

          {recentCards.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {/* App tiles */}
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
                    {/* FREE pill */}
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[8px] font-black rounded bg-green-500 text-white">FREE</span>
                  </div>
                  <p className="mt-1.5 text-xs font-medium text-foreground line-clamp-1 leading-snug group-hover:text-primary transition-colors">
                    {app.title}
                  </p>
                  {app.category_name && (
                    <p className="text-[10px] text-muted-foreground">{app.category_name}</p>
                  )}
                </Link>
              ))}

              {/* Lihat Semua tile */}
              <Link
                href="/apps"
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
            <p className="text-sm text-muted-foreground py-4">Belum ada aplikasi terbaru.</p>
          )}
        </div>
      </section>

      {/* ===== Per-Category Sections ===== */}
      {categorySections.map(section => (
        <section key={section.id} className="py-8 border-t border-border first:border-t-0">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2 mb-4">
              {section.icon && <span>{section.icon}</span>}
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
                      {/* FREE pill */}
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[8px] font-black rounded bg-green-500 text-white">FREE</span>
                    </div>
                    <p className="mt-1.5 text-xs font-medium text-foreground line-clamp-1 leading-snug group-hover:text-primary transition-colors">
                      {app.title}
                    </p>
                    <p className="text-[10px] text-green-600 dark:text-green-400 font-semibold mt-0.5">GRATIS</p>
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