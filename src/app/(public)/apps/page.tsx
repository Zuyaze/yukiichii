import { Metadata } from 'next'
import Link from 'next/link'
import { getApps, getCategories } from '@/lib/db/queries'
import { AppGrid } from '@/components/app-grid'
import { BackButton } from '@/components/back-button'
import { unstable_noStore } from 'next/cache'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Semua Aplikasi',
}

export const dynamic = 'force-dynamic'

interface AppsPageProps {
  searchParams: Promise<{ category?: string; q?: string }>
}

export default async function AppsPage({ searchParams }: AppsPageProps) {
  unstable_noStore()
  const params = await searchParams
  const activeCategory = params.category || ''
  const search = params.q || ''

  let apps: any[] = []
  let categories: any[] = []
  let activeCatName = ''

  try {
    ;[apps, categories] = await Promise.all([
      getApps({ category: activeCategory || undefined, search: search || undefined, limit: 60 }),
      getCategories(),
    ])
    if (activeCategory) {
      activeCatName = categories.find(c => c.slug === activeCategory)?.name || activeCategory
    }
  } catch (error) {
    console.error('Database error:', error)
  }

  const cards = apps.map(app => ({
    slug: app.slug,
    title: app.title,
    description: app.description,
    download_url: app.download_url,
    screenshot_url: (app as any).screenshots?.[0] ?? null,
    icon_url: (app as any).icon_url ?? null,
    category_name: (app as any).category_name || null,
    category_color: (app as any).category_color || '#3b82f6',
    category_slug: (app as any).category_slug || null,
    tags: [],
  }))

  // Build query string helper
  const hrefFor = (catSlug?: string, q?: string) => {
    const sp = new URLSearchParams()
    if (catSlug) sp.set('category', catSlug)
    if (q) sp.set('q', q)
    const s = sp.toString()
    return s ? `/apps?${s}` : '/apps'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-muted/30 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-3">
            <BackButton label="Kembali" />
          </div>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            {activeCatName || 'Semua Aplikasi'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {activeCatName
              ? `Kumpulan mod ${activeCatName}`
              : 'Temukan mod aplikasi dan game favoritmu'}
          </p>
          <p className="text-sm text-primary mt-2 font-medium">100% Gratis</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Search */}
        <form action="/apps" method="GET" className="relative mb-4">
          {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            name="q"
            defaultValue={search}
            placeholder="Cari mod..."
            className="w-full h-11 pl-10 pr-10 text-sm bg-background text-foreground border border-input rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {search && (
            <Link
              href={hrefFor(activeCategory)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Hapus pencarian"
            >
              <X className="w-4 h-4" />
            </Link>
          )}
        </form>

        {/* Category chips */}
        <div className="flex flex-wrap justify-center gap-2 pb-3 mb-6">
          <Link
            href={hrefFor(undefined, search)}
            className={cn(
              'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors',
              !activeCategory
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
            )}
          >
            Semua
          </Link>
          {categories.map(cat => (
            <Link
              key={cat.id}
              href={hrefFor(cat.slug, search)}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap',
                activeCategory === cat.slug
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
              )}
            >
              {cat.icon && <span className="mr-1">{cat.icon}</span>}
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-4">
          {cards.length} mod ditemukan{search && ` untuk "${search}"`}
        </p>

        {/* Grid */}
        <AppGrid apps={cards} emptyMessage={search ? `Tidak ada hasil untuk "${search}"` : 'Belum ada mod di kategori ini'} />
      </div>
    </div>
  )
}