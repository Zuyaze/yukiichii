export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { getCategories, getTags, getAppById } from '@/lib/db/queries'
import { AppForm } from '@/components/admin-form'
import { notFound } from 'next/navigation'

interface EditAppPageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Edit Aplikasi',
}

export default async function EditAppPage({ params }: EditAppPageProps) {
  const { id } = await params
  const appId = parseInt(id)

  if (isNaN(appId)) notFound()

  const [categories, tags, app] = await Promise.all([
    getCategories(),
    getTags(),
    getAppById(appId),
  ])

  if (!app) notFound()

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
          screenshots: (app as any).screenshots || [],
        }}
        categories={categories.map(c => ({ id: c.id, name: c.name, slug: c.slug }))}
        tags={tags.map(t => ({ id: t.id, name: t.name, slug: t.slug, color: t.color }))}
      />
    </div>
  )
}