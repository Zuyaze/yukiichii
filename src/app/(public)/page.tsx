import { Metadata } from 'next'
import Link from 'next/link'
import { getApps, getCategories, getAppGroups } from '@/lib/db/queries'
import { Button } from '@/components/ui/button'
import { ArrowRight, Download, AlertCircle } from 'lucide-react'
import { unstable_noStore } from 'next/cache'
import { SearchBar } from '@/components/search-bar'
import { AppCard } from '@/components/app-card'

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
  let appGroups: any[] = []
  let dbError: Error | null = null

  try {
    const [catsData, appsData, groupsData] = await Promise.all([
      getCategories(),
      getApps({ limit: 10 }),
      getAppGroups(),
    ])
    categories = catsData
    recentApps = appsData
    appGroups = groupsData
  } catch (error) {
    console.error('Database error:', error)
    dbError = error as Error
    categories = []
    recentApps = []
    appGroups = []
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

{/* Hero Section - Clean Text */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="text-primary">Yukii</span>Chii
            <span className="mx-2 text-lg font-light text-muted-foreground/60 align-middle">×</span>
            <span className="text-foreground">Zuyaze</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Kumpulan mod apk & loader gratis terbaru. Setiap aplikasi berbeda—bagian aman & cepat, sebagian mungkin ada iklan. Silakan pilih yang cocok.
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
      </section>

      {/* ===== Group Aplikasi (Populer) ===== */}
      {appGroups.length > 0 && (
        <section className="py-8 border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-8">Populer</h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {appGroups.map(group => {
                const id = typeof group.id === 'number' ? group.id : 0
                const title = typeof group.title === 'string' ? group.title : ''
                const description = typeof group.description === 'string' ? group.description : ''
                const slug = typeof group.slug === 'string' ? group.slug : ''
                const logoUrl = typeof group.logo_url === 'string' ? group.logo_url : ''
                return (
                  <Link
                    key={String(id)}
                    href={`/groups/${slug}`}
                    className="group flex flex-col items-center p-4 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden mb-3 bg-muted transition-transform group-hover:scale-105">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-primary/5">
                          <span className="text-2xl font-bold text-primary/60">{title.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors text-center mb-1">{title}</h3>
                    {description && (
                      <p className="text-xs text-muted-foreground text-center mb-2 line-clamp-2">{description}</p>
                    )}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      Lihat selengkapnya
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== Aplikasi Terbaru ===== */}
      <section className="py-8 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Aplikasi Terbaru</h2>

          {recentCards.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {recentCards.map(app => (
                <AppCard
                  key={app.slug}
                  slug={app.slug}
                  title={app.title}
                  icon_url={app.icon_url}
                  screenshot_url={app.screenshot_url}
                  category_name={app.category_name}
                  category_color={app.category_color}
                  variant="horizontal"
                />
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
                  <AppCard
                    key={app.slug}
                    slug={app.slug}
                    title={app.title}
                    icon_url={app.icon_url}
                    screenshot_url={app.screenshot_url}
                    category_name={section.name}
                    category_color={section.color}
                    variant="horizontal"
                  />
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