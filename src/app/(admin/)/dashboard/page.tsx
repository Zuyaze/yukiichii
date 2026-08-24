import { getApps, getCategories, getTags, getAllAppsWithStats } from '@/lib/db/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Box, Tag, FolderOpen, TrendingUp, ArrowRight } from 'lucide-react'
import { unstable_noStore } from 'next/cache'

export default async function DashboardPage() {
  unstable_noStore()
  const [apps, categories, tags, appsWithStats] = await Promise.all([
    getApps({ limit: 5 }),
    getCategories(),
    getTags(),
    getAllAppsWithStats(),
  ])

  const totalApps = appsWithStats.length
  const totalCategories = categories.length
  const totalTags = tags.length
  const totalClicks = appsWithStats.reduce((sum, app) => sum + (app.click_count || 0), 0)

  const stats = [
    { name: 'Total Aplikasi', value: totalApps, icon: Box, color: 'bg-blue-500', href: '/dashboard/apps' },
    { name: 'Total Kategori', value: totalCategories, icon: FolderOpen, color: 'bg-green-500', href: '/dashboard/categories' },
    { name: 'Total Tag', value: totalTags, icon: Tag, color: 'bg-purple-500', href: '/dashboard/tags' },
    { name: 'Total Download', value: totalClicks, icon: TrendingUp, color: 'bg-orange-500', href: '/dashboard/apps' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Kelola aplikasi dan kategori YukiiChii</p>
        </div>
        <Link href="/dashboard/apps/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Tambah Aplikasi
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.name}</CardTitle>
              <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.color.replace('bg-', 'text-')}`} />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                <Link href={stat.href} className="text-sm text-primary hover:underline flex items-center gap-1">
                  Detail
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Aplikasi Terbaru</h2>
          <Link href="/dashboard/apps">
            <Button variant="ghost" size="sm">Lihat Semua</Button>
          </Link>
        </div>
        <div className="rounded-lg border border-border bg-background overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Aplikasi</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Kategori</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Download</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Dibuat</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {appsWithStats.slice(0, 5).map(app => (
                <tr key={app.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{app.title}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-xs">{app.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{app.category_name || '-'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{app.click_count || 0}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(app.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/dashboard/apps/${app.id}/edit`} className="text-sm text-primary hover:underline">Edit</Link>
                  </td>
                </tr>
              ))}
              {appsWithStats.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Belum ada aplikasi. <Link href="/dashboard/apps/new" className="text-primary hover:underline">Tambah yang pertama</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}