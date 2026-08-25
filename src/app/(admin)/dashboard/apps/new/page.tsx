export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { getCategories, getTags } from '@/lib/db/queries'
import { AppForm } from '@/components/admin-form'

export const metadata: Metadata = {
  title: 'Tambah Aplikasi Baru',
}

export default async function NewAppPage() {
  const [categories, tags] = await Promise.all([getCategories(), getTags()])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Tambah Aplikasi Baru</h1>
        <p className="text-muted-foreground mt-1">Isi formulir di bawah untuk menambah mod baru</p>
      </div>

      <AppForm
        initialData={null}
        categories={categories.map(c => ({ id: c.id, name: c.name, slug: c.slug }))}
        tags={tags.map(t => ({ id: t.id, name: t.name, slug: t.slug, color: t.color }))}
      />
    </div>
  )
}