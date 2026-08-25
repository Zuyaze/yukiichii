export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { getApps, getCategories } from '@/lib/db/queries'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { DeleteAppButton } from '@/components/delete-app-button'

export const metadata: Metadata = {
  title: 'Kelola Aplikasi',
}

export default async function AppsListPage() {
  const [apps, categories] = await Promise.all([getApps({ limit: 100 }), getCategories()])

  const categoryMap = new Map(categories.map(c => [c.id, c]))

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
              <TableHead>Judul</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="w-32 text-right">Aksi</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {apps.map(app => {
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
            {apps.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Belum ada aplikasi.{' '}
                  <Link href="/dashboard/apps/new" className="text-primary hover:underline">
                    Tambah yang pertama
                  </Link>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}