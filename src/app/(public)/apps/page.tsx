import { Metadata } from 'next'
import Link from 'next/link'
import { getApps, getCategories } from '@/lib/db/queries'
import { AppGrid } from '@/components/app-grid'
import { BackButton } from '@/components/back-button'
import { SearchBar } from '@/components/search-bar'
import { unstable_noStore } from 'next/cache'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Semua Aplikasi',
}

export const dynamic = 'force-dynamic'

const PER_PAGE = 20

interface AppsPageProps {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>
}

export default async function AppsPage({ searchParams }: AppsPageProps) {
  unstable_noStore()
  const params = await searchParams
  const activeCategory = params.category || ''
  const search = params.q || ''
  const page = Math.max(1, parseInt(params.page || '1') || 1)
  const offset = (page - 1) * PER_PAGE

  let apps: any[] = []
  let categories: any[] = []
  let totalCount = 0
  let activeCatName = ''

  try {
    ;[apps, categories] = await Promise.all([
      getApps({
        category: activeCategory || undefined,
        search: search || undefined,
        limit: PER_PAGE,
        offset,
      }),
      getCategories(),
    ])

    // Get total count for pagination
    const allForCount = await getApps({
      category: activeCategory || undefined,
      search: search || undefined,
      limit: 10000,
    })
    totalCount = allForCount.length

    if (activeCategory) {
      activeCatName =
        categories.find(c => c.slug === activeCategory)?.name || activeCategory
    }
  } catch (error) {
    console.error('Database error:', error)
  }

  const totalPages = Math.ceil(totalCount / PER_PAGE)

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
  const hrefFor = (
    catSlug?: string,
    q?: string,
    pageNum?: number
  ) => {
    const sp = new URLSearchParams()
    if (catSlug) sp.set('category', catSlug)
    if (q) sp.set('q', q)
    if (pageNum && pageNum > 1) sp.set('page', String(pageNum))
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
        <div className="mb-4">
          <SearchBar placeholder={activeCatName ? `Cari mod ${activeCatName}...` : 'Cari mod...'} />
        </div>

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
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-4">
          {totalCount} mod ditemukan{search && ` untuk "${search}"`}
          {totalPages > 1 && ` • Halaman ${page}/${totalPages}`}
        </p>

        {/* Grid */}
        <AppGrid
          apps={cards}
          emptyMessage={
            search
              ? `Tidak ada hasil untuk "${search}"`
              : 'Belum ada mod di kategori ini'
          }
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
            {page > 1 && (
              <Link href={hrefFor(activeCategory, search, page - 1)}>
                <Button variant="outline" size="sm">← Sebelumnya</Button>
              </Link>
            )}

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center gap-1">
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="text-muted-foreground px-1">...</span>
                    )}
                    <Link
                      href={hrefFor(activeCategory, search, p)}
                      className={cn(
                        'w-9 h-9 flex items-center justify-center text-sm font-medium rounded-lg transition-colors',
                        p === page
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground/70 hover:bg-muted'
                      )}
                    >
                      {p}
                    </Link>
                  </span>
                ))}
            </div>

            {page < totalPages && (
              <Link href={hrefFor(activeCategory, search, page + 1)}>
                <Button variant="outline" size="sm">Selanjutnya →</Button>
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  )
}