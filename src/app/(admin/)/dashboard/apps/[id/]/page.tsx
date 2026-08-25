export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { getCategories, getTags, createApp, updateApp, getAppBySlug } from '@/lib/db/queries'
import { AppForm } from '@/components/admin-form'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'

interface AppFormPageProps {
  params: Promise<{ id?: string }>
}

export const metadata: Metadata = {
  title: 'Tambah Aplikasi',
}

export default async function AppFormPage({ params }: AppFormPageProps) {
  const { id } = await params
  const isEditing = !!id

  const [categories, tags] = await Promise.all([
    getCategories(),
    getTags(),
  ])

  let initialData = null
  if (isEditing && id) {
    const app = await getAppBySlug(id)
    if (!app) notFound()
    initialData = {
      id: app.id,
      slug: app.slug,
      title: app.title,
      description: app.description || '',
      download_url: app.download_url,
      category_id: app.category_id,
      tag_ids: app.tags?.map((t: any) => t.id) || [],
      screenshots: (app as any).screenshots || [],
    }
  }

  const handleSubmit = async (formData: FormData) => {
    const slug = formData.get('slug') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const download_url = formData.get('download_url') as string
    const category_id = formData.get('category_id') ? parseInt(formData.get('category_id') as string) : null
    const tag_ids = formData.getAll('tag_ids').map(v => parseInt(v as string))
    const screenshots = formData.getAll('screenshots') as string[]

    if (isEditing && id) {
      const app = await getAppBySlug(id)
      if (app) {
        await updateApp(app.id, { slug, title, description, download_url, category_id, tag_ids })
      }
    } else {
      await createApp({ slug, title, description, download_url, category_id, tag_ids })
    }

    redirect('/dashboard/apps')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{isEditing ? 'Edit Aplikasi' : 'Tambah Aplikasi Baru'}</h1>
        <p className="text-muted-foreground mt-1">{isEditing ? 'Perbarui informasi aplikasi' : 'Isi formulir di bawah untuk menambah aplikasi baru'}</p>
      </div>

      <AppForm
        initialData={initialData}
        categories={categories.map(c => ({ id: c.id, name: c.name, slug: c.slug }))}
        tags={tags.map(t => ({ id: t.id, name: t.name, slug: t.slug, color: t.color }))}
        onSubmit={handleSubmit}
        onCancel={() => redirect('/dashboard/apps')}
      />
    </div>
  )
}
