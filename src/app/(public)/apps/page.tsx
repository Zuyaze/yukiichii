import { Metadata } from 'next'
import { getApps, getCategories, getTags } from '@/lib/db/queries'
import { AppGrid } from '@/components/app-grid'
import { cn } from '@/lib/utils'
import { unstable_noStore } from 'next/cache'
import { AlertCircle } from 'lucide-react'
import dynamic from 'next/dynamic'

const SearchFilter = dynamic(() => import('@/components/search-filter').then(m => ({ SearchFilter: m.SearchFilter })), {
  ssr: false,
  loading: () => (
    <div className="space-y-4">
      <div className="relative">
        <input type="text" placeholder="Cari aplikasi..." className="pl-10 pr-10 w-full h-10 px-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50" disabled />
      </div>
      <div className="space-y-2">
        <select disabled className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50">
          <option value="">Semua Kategori</option>
        </select>
        <button type="button" disabled className="w-full h-10 px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-gray-50 justify-between">
          <span className="flex items-center gap-2">Tag (0)</span>
        </button>
      </div>
    </div>
  )
})

export const metadata: Metadata = {
  title: 'Semua Aplikasi',
  description: 'Jelajahi semua aplikasi dan tools yang tersedia di YukiiChii.',
}

export const dynamic = 'force-dynamic'

interface AppsPageProps {
  searchParams: Promise<{ search?: string; category?: string; tag?: string; page?: string }>
}

export default async function AppsPage({ searchParams }: AppsPageProps) {
  unstable_noStore()
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const limit = 20
  const offset = (page - 1) * limit

  let apps: any[] = []
  let categories: any[] = []
  let tags: any[] = []
  let dbError: Error | null = null

  try {
    const [appsData, categoriesData, tagsData] = await Promise.all([
      getApps({
        search: params.search,
        category: params.category,
        tag: params.tag,
        limit,
        offset,
      }),
      getCategories(),
      getTags(),
    ])
    apps = appsData
    categories = categoriesData
    tags = tagsData
  } catch (error) {
    console.error('Database error:', error)
    dbError = error as Error
    apps = []
    categories = []
    tags = []
  }

  const appsWithImages = apps.map(app => ({
    ...app,
    screenshot_url: null,
    category_name: (app as any).category_name || null,
    category_color: (app as any).category_color || '#3b82f6',
    category_slug: (app as any).category_slug || null,
    tags: [],
  }));

  const totalApps = apps.length + offset;
  const totalPages = Math.ceil(totalApps / limit);

  return (
    <div className="min-h-screen">
      {dbError && (
        <div className="bg-yellow-50 border-y border-yellow-200 px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2 text-yellow-700 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Database sedang bermasalah, menampilkan tampilan default.</span>
          </div>
        </div>
      )}

      <div className="bg-muted/30 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Semua Aplikasi</h1>
          <p className="text-muted-foreground mt-2">Temukan aplikasi dan tools yang kamu butuhkan</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <SearchFilter
                categories={categories.map(c => ({ name: c.name, slug: c.slug, color: c.color }))}
                tags={tags.map(t => ({ name: t.name, slug: t.slug, color: t.color }))}
                initialSearch={params.search}
                initialCategory={params.category}
                initialTags={params.tag ? [params.tag] : []}
                onSearch={(searchParams) => {
                  const searchParamsObj = new URLSearchParams()
                  if (searchParams.search) searchParamsObj.set('search', searchParams.search)
                  if (searchParams.category) searchParamsObj.set('category', searchParams.category)
                  if (searchParams.tags.length > 0) searchParamsObj.set('tag', searchParams.tags[0])
                  if (typeof window !== 'undefined') {
                    window.location.href = `/apps?${searchParamsObj.toString()}`
                  }
                }}
              />
            </div>
          </aside>

          <main className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Menampilkan {appsWithImages.length} aplikasi
              </p>
            </div>

            <AppGrid apps={appsWithImages} emptyMessage="Tidak ada aplikasi yang cocok dengan pencarianmu" />

            {totalPages > 1 && (
              <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
                {page > 1 && (
                  <a
                    href={`/apps?${new URLSearchParams({ ...params, page: (page - 1).toString() }).toString()}`}
                    className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground border border-border rounded-lg transition-colors"
                  >
                    Sebelumnya
                  </a>
                )}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum = i + 1
                    if (totalPages > 5) {
                      if (page > 3 && page < totalPages - 2) {
                        pageNum = page - 2 + i
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      }
                    }
                    return (
                      <a
                        key={pageNum}
                        href={`/apps?${new URLSearchParams({ ...params, page: pageNum.toString() }).toString()}`}
                        className={cn(
                          'w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors',
                          page === pageNum
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground/70 hover:bg-muted'
                        )}
                      >
                        {pageNum}
                      </a>
                    )
                  })}
                </div>
                {page < totalPages && (
                  <a
                    href={`/apps?${new URLSearchParams({ ...params, page: (page + 1).toString() }).toString()}`}
                    className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground border border-border rounded-lg transition-colors"
                  >
                    Selanjutnya
                  </a>
                )}
              </nav>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}