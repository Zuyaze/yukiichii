export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { getApps, getCategories } from '@/lib/db/queries'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { DeleteAppButton } from '@/components/delete-app-button'

export const metadata: Metadata = {
  title: 'Kelola Aplikasi',
}

interface AppsListPageProps {
  searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }>
}

export default async function AppsListPage({ searchParams }: AppsListPageProps) {
  const params = await searchParams
  const query = params.q || ''
  const categoryFilter = params.category || ''
  const sortBy = params.sort || 'newest'
  const page = Math.max(1, parseInt(params.page || '1') || 1)
  const perPage = 20

  let allApps: any[] = []
  let categories: any[] = []

  try {
    ;[allApps, categories] = await Promise.all([getApps({ limit: 10000 }), getCategories()])
  } catch (error) {
    console.error('Database error:', error)
    allApps = []
    categories = []
  }

  // Filter
  let filtered = allApps
  if (query) {
    const q = query.toLowerCase()
    filtered = filtered.filter(
      a => a.title?.toLowerCase().includes(q) || a.slug?.toLowerCase().includes(q)
    )
  }
  if (categoryFilter) {
    const catId = parseInt(categoryFilter)
    filtered = filtered.filter(a => a.category_id === catId)
  }

  // Sort
  if (sortBy === 'oldest') {
    filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  } else if (sortBy === 'name') {
    filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
  } else {
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  // Paginate
  const totalItems = filtered.length
  const totalPages = Math.ceil(totalItems / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const categoryMap = new Map(categories.map(c => [c.id, c]))

  // Build URL helper
  const buildUrl = (overrides: Record<string, string>) => {
    const sp = new URLSearchParams()
    const merged = { q: query, category: categoryFilter, sort: sortBy, ...overrides }
    for (const [k, v] of Object.entries(merged)) {
      if (v) sp.set(k, v)
    }
    const s = sp.toString()
    return s ? `/dashboard/apps?${s}` : '/dashboard/apps'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Kelola Aplikasi</h1>
          <p className="text-muted-foreground mt-1">
            {totalItems} aplikasi{totalPages > 1 && ` • Halaman ${page}/${totalPages}`}
          </p>
        </div>
        <Link href="/dashboard/apps/new">
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Tambah Aplikasi
          </Button>
        </Link>
      </div>

      {/* Search + Filter + Sort */}
      <form action="/dashboard/apps" method="GET" className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Cari judul atau slug..."
            className="w-full h-10 pl-10 pr-4 text-sm bg-background text-foreground border border-input rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary"
          />
        </div>

        {/* Category filter */}
        <select
          name="category"
          defaultValue={categoryFilter}
          className="sm:w-48 h-10 px-3 text-sm bg-background text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/40"
        >
          <option value="">Semua Kategori</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          name="sort"
          defaultValue={sortBy}
          className="sm:w-40 h-10 px-3 text-sm bg-background text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/40"
        >
          <option value="newest">Terbaru</option>
          <option value="oldest">Terlama</option>
          <option value="name">Nama A-Z</option>
        </select>

        {/* Apply button */}
        <Button type="submit" variant="outline" size="sm" className="h-10">
          Terapkan
        </Button>
      </form>

      {/* Table */}
      <div className="rounded-lg border border-border bg-background overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <tr>
              <TableHead>Judul</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="w-32 text-right">Aksi</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {paginated.map(app => {
              const category = app.category_id ? categoryMap.get(app.category_id) : null
              return (
                <TableRow key={app.id}>
                  <TableCell>
                    <div className="font-medium">{app.title}</div>
                    <div className="text-sm text-muted-foreground">{app.slug}</div>
                  </TableCell>
                  <TableCell>
                    {category ? (
                      <Badge variant="secondary" style={{ backgroundColor: `${category.color}20`, color: category.color }}>
                        {category.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(app.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/dashboard/apps/${app.id}`}>
                        <Button variant="ghost" size="icon" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <DeleteAppButton id={app.id} title={app.title} />
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  {query || categoryFilter ? (
                    'Tidak ada hasil yang cocok.'
                  ) : (
                    <>Belum ada aplikasi.{' '}
                      <Link href="/dashboard/apps/new" className="text-primary hover:underline">
                        Tambah yang pertama
                      </Link>
                    </>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link href={`${buildUrl({})}&page=${page - 1}`}>
              <Button variant="outline" size="sm">← Sebelumnya</Button>
            </Link>
          )}
          <span className="text-sm text-muted-foreground px-3">
            Halaman {page} dari {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`${buildUrl({})}&page=${page + 1}`}>
              <Button variant="outline" size="sm">Selanjutnya →</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}