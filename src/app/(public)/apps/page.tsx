import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export const metadata = {
  title: 'Semua Aplikasi',
}

export default function AppsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Semua Aplikasi</h1>
          <p className="text-muted-foreground mt-2">Temukan aplikasi dan tools yang kamu butuhkan</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <Download className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground">Segera hadir</h2>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Daftar aplikasi sedang dalam pengembangan. Coba jelajahi kategori atau kembali lagi nanti.
        </p>
        <Link href="/categories" className="mt-6 inline-block">
          <Button variant="outline">Lihat Kategori</Button>
        </Link>
      </div>
    </div>
  )
}