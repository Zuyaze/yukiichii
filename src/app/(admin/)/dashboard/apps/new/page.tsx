import { Metadata } from 'next'
import { getCategories, getTags, createApp } from '@/lib/db/queries'
import { AppForm } from '@/components/admin-form'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Tambah Aplikasi Baru',
}

export default async function NewAppPage() {
  const [categories, tags] = await Promise.all([
    getCategories(),
    getTags(),
  ])

  const handleSubmit = async (formData: FormData) => {
    const slug = formData.get('slug') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const download_url = formData.get('download_url') as string
    const category_id = formData.get('category_id') ? parseInt(formData.get('category_id') as string) : null
    const tag_ids = formData.getAll('tag_ids').map(v => parseInt(v as string))

    await createApp({ slug, title, description, download_url, category_id, tag_ids })
    redirect('/dashboard/apps')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Tambah Aplikasi Baru</h1>
        <p className="text-muted-foreground mt-1">Isi formulir di bawah untuk menambah aplikasi baru</p>
      </div>

      <AppForm
        initialData={null}
        categories={categories.map(c => ({ id: c.id, name: c.name, slug: c.slug }))}
        tags={tags.map(t => ({ id: t.id, name: t.name, slug: t.slug, color: t.color }))}
        onSubmit={handleSubmit}
        onCancel={() => redirect('/dashboard/apps')}
      />
    </div>
  )
}