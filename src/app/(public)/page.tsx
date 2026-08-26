import { Metadata } from 'next'
import Link from 'next/link'
import { getApps, getCategories } from '@/lib/db/queries'
import { AppGrid } from '@/components/app-grid'
import { Button } from '@/components/ui/button'
import { ArrowRight, Download, Smartphone, Monitor, Gamepad2, FileCode, Database, AlertCircle } from 'lucide-react'
import { unstable_noStore } from 'next/cache'
import { SearchBar } from '@/components/search-bar'

export const metadata: Metadata = {
  title: 'Kumpulan Aplikasi & Tools Gratis',
  description: 'Kumpulan Mod Apk & Loader gratis terbaru. Download cepat, aman, dan tanpa ribet.',
}

export const dynamic = 'force-dynamic'

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  android: Smartphone,
  windows: Monitor,
  game: Gamepad2,
  dev: FileCode,
  default: Download,
}

export default async function HomePage() {
  unstable_noStore()
  
  let apps: any[] = []
  let categories: any[] = []
  let dbError: Error | null = null

  try {
    const [appsData, categoriesData] = await Promise.all([
      getApps({ limit: 12 }),
      getCategories(),
    ])
    apps = appsData
    categories = categoriesData
  } catch (error) {
    console.error('Database error:', error)
    dbError = error as Error
    apps = []
    categories = []
  }

  const appsWithImages = apps.map(app => ({
    ...app,
    screenshot_url: (app as any).screenshots?.[0] ?? null,
    icon_url: (app as any).icon_url ?? null,
    category_name: (app as any).category_name || null,
    category_color: (app as any).category_color || '#3b82f6',
    category_slug: (app as any).category_slug || null,
    tags: [],
  }))

  const featuredCategories = categories.slice(0, 4)

  return (
    <div className="flex flex-col min-h-screen">
      {dbError && (
        <div className="bg-yellow-50 border-y border-yellow-200 px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2 text-yellow-700 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Database sedang bermasalah, menampilkan tampilan default. Beberapa fitur mungkin tidak tersedia.</span>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <section className="border-b border-border bg-muted/30 py-6">
        <div className="mx-auto max-w-2xl px-4">
          <SearchBar placeholder="Cari mod..." />
        </div>
      </section>

      <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="text-primary">Yukii</span>Chii
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl max-w-3xl mx-auto">
              Kumpulan Mod Apk & Loader gratis terbaru.
              Game dan aplikasi mod premium, langsung download tanpa ribet.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/apps">
                <Button size="lg" className="w-full sm:w-auto gap-2" size="lg">
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

          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {featuredCategories.map((cat, index) => {
              const Icon = categoryIcons[cat.slug] || categoryIcons.default
              return (
                <Link
                  key={cat.id}
                  href={`/apps?category=${cat.slug}`}
                  className="group flex flex-col items-center p-6 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors group-hover:bg-primary/10" style={{ backgroundColor: `${cat.color}20` }}>
                    <Icon className="w-7 h-7" style={{ color: cat.color }} />
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Lihat aplikasi</p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Aplikasi Terbaru</h2>
              <p className="text-muted-foreground mt-1">Update terbaru dari koleksi kami</p>
            </div>
            <Link href="/apps">
              <Button variant="ghost" size="lg" className="gap-2">
                Lihat Semua
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <AppGrid apps={appsWithImages} emptyMessage="Belum ada aplikasi tersedia" />
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground">Semua Kategori</h2>
          <p className="text-muted-foreground mt-1 max-w-2xl mx-auto">Temukan mod sesuai kebutuhanmu</p>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {categories.map(cat => {
              const Icon = categoryIcons[cat.slug] || categoryIcons.default
              return (
                <Link
                  key={cat.id}
                  href={`/apps?category=${cat.slug}`}
                  className="group flex flex-col items-center p-6 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-colors group-hover:bg-primary/10" style={{ backgroundColor: `${cat.color}20` }}>
                    <Icon className="w-6 h-6" style={{ color: cat.color }} />
                  </div>
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors text-center">{cat.name}</h3>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}