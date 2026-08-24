import { Metadata } from 'next'
import { getApps, getCategories, getTags, deleteApp } from '@/lib/db/queries'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Kelola Aplikasi',
}

export default async function AppsListPage() {
  const [apps, categories, tags] = await Promise.all([
    getApps({ limit: 100 }),
    getCategories(),
    getTags(),
  ])

  const categoryMap = new Map(categories.map(c => [c.id, c]))
  const tagMap = new Map(tags.map(t => [t.id, t]))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Kelola Aplikasi</h1>
          <p className="text-muted-foreground mt-1">Tambah, edit, dan hapus aplikasi</p>
        </div>
        <Link href="/dashboard/apps/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Tambah Aplikasi
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border border-border bg-background overflow-hidden">
        <Table>
          <TableHeader>
            <tr>
              <TableHead className="w-12">Thumbnail</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Tag</TableHead>
              <TableHead className="w-32">Download</TableHead>
              <TableHead className="w-32">Dibuat</TableHead>
              <TableHead className="w-48 text-right">Aksi</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {apps.map(app => {
              const category = app.category_id ? categoryMap.get(app.category_id) : null
              const appTags = (app as any).tags || []
              return (
                <TableRow key={app.id}>
                  <TableCell>
                    {(app as any).screenshot_url ? (
                      <img
                        src={(app as any).screenshot_url}
                        alt={app.title}
                        className="w-12 h-8 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-8 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{app.title}</div>
                    <div className="text-sm text-muted-foreground">{app.slug}</div>
                  </TableCell>
                  <TableCell>
                    {category ? (
                      <Badge variant="secondary" style={{ backgroundColor: `${category.color}20`, color: category.color, borderColor: `${category.color}40` }}>
                        {category.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {appTags.slice(0, 3).map((tag: any) => (
                        <Badge key={tag.id} variant="secondary" className="text-xs" style={{ backgroundColor: `${tag.color}20`, color: tag.color, borderColor: `${tag.color}40` }}>
                          {tag.name}
                        </Badge>
                      ))}
                      {appTags.length > 3 && <Badge variant="outline" className="text-xs">+{appTags.length - 3}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <a href={app.download_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">Buka Link</a>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(app.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/dashboard/apps/${app.id}/edit`} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <form action={`/dashboard/apps/${app.id}/delete`} method="POST" onSubmit={e => !confirm('Yakin hapus aplikasi ini?') && e.preventDefault()}>
                        <button type="submit" className="p-2 text-muted-foreground hover:text-destructive hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {apps.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Belum ada aplikasi. <Link href="/dashboard/apps/new" className="text-primary hover:underline">Tambah yang pertama</Link>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}