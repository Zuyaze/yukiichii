import { Metadata } from 'next'
import Link from 'next/link'
import { getCategories } from '@/lib/db/queries'
import { Smartphone, Monitor, Gamepad2, FileCode, Download } from 'lucide-react'
import { unstable_noStore } from 'next/cache'

export const metadata: Metadata = {
  title: 'Kategori',
  description: 'Jelajahi aplikasi berdasarkan kategori di YukiiChii.',
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  android: Smartphone,
  windows: Monitor,
  game: Gamepad2,
  dev: FileCode,
  default: Download,
}

export default async function CategoriesPage() {
  unstable_noStore()
  const categories = await getCategories()

  return (
    <div className="min-h-screen">
      <div className="bg-muted/30 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Kategori</h1>
          <p className="text-muted-foreground mt-2">Temukan aplikasi berdasarkan kategori favoritmu</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {categories.map(cat => {
            const Icon = categoryIcons[cat.slug] || categoryIcons.default
            return (
              <Link
                key={cat.id}
                href={`/apps?category=${cat.slug}`}
                className="group flex flex-col items-center p-6 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 transition-colors group-hover:bg-primary/10" style={{ backgroundColor: `${cat.color}20` }}>
                  <Icon className="w-8 h-8" style={{ color: cat.color }} />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-center">{cat.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">Lihat aplikasi</p>
              </Link>
            )
          })}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-16">
            <Download className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground">Belum ada kategori</h2>
            <p className="text-muted-foreground mt-2">Kategori akan muncul setelah admin menambahkannya</p>
          </div>
        )}
      </div>
    </div>
  )
}