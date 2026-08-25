export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { getCategories, getTags, getAppById, updateApp } from '@/lib/db/queries'
import { AppForm } from '@/components/admin-form'
import { redirect } from 'next/navigation'

interface EditAppPageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Edit Aplikasi',
}

export default async function EditAppPage({ params }: EditAppPageProps) {
  const { id } = await params
  const appId = parseInt(id)

  if (isNaN(appId)) redirect('/dashboard/apps')

  const [categories, tags, app] = await Promise.all([
    getCategories(),
    getTags(),
    getAppById(appId),
  ])

  if (!app) redirect('/dashboard/apps')

  const handleSubmit = async (formData: FormData) => {
    'use server'
    const slug = formData.get('slug') as string
    const title = formData.get('title') as string
    const description = (formData.get('description') as string) || null
    const download_url = formData.get('download_url') as string
    const category_id = formData.get('category_id') ? parseInt(formData.get('category_id') as string) : null
    const tag_ids = formData.getAll('tag_ids').map(v => parseInt(v as string))

    await updateApp(appId, { slug, title, description, download_url, category_id, tag_ids })
    redirect('/dashboard/apps')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Edit Aplikasi</h1>
        <p className="text-muted-foreground mt-1">Perbarui informasi aplikasi</p>
      </div>

      <AppForm
        initialData={{
          id: app.id,
          slug: app.slug,
          title: app.title,
          description: app.description || '',
          download_url: app.download_url,
          category_id: app.category_id,
          tag_ids: app.tags?.map(t => t.id) || [],
          screenshots: [],
        }}
        categories={categories.map(c => ({ id: c.id, name: c.name, slug: c.slug }))}
        tags={tags.map(t => ({ id: t.id, name: t.name, slug: t.slug, color: t.color }))}
        onSubmit={async (data: FormData) => {
          'use server'
          await handleSubmit(data)
        }}
        onCancel={() => redirect('/dashboard/apps')}
      />
    </div>
  )
}