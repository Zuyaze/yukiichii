'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AppForm } from '@/components/admin-form'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

interface LoadedApp {
  id: number
  slug: string
  title: string
  description: string | null
  download_url: string
  category_id: number | null
  screenshots: string[] | null
  icon_url: string | null
  tags: { id: number; name: string; slug: string; color: string }[]
}

export default function EditAppPage() {
  const params = useParams<{ id: string }>()
  const appId = Number(params?.id)

  const [app, setApp] = useState<LoadedApp | null>(null)
  const [categories, setCategories] = useState<{ id: number; name: string; slug: string }[]>([])
  const [tags, setTags] = useState<{ id: number; name: string; slug: string; color: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!appId || isNaN(appId)) return

    async function load() {
      try {
        const [catRes, tagRes, appRes] = await Promise.all([
          fetch('/api/categories').then(r => r.json()),
          fetch('/api/tags').then(r => r.json()),
          fetch(`/api/apps/${appId}`).then(async r => {
            if (!r.ok) throw new Error('not_found')
            return r.json()
          }),
        ])
        setCategories(catRes.categories || [])
        setTags(tagRes.tags || [])
        if (appRes.app) setApp(appRes.app)
        else setNotFound(true)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [appId])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (notFound || !app) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold text-foreground">Aplikasi tidak ditemukan</h1>
        <Link href="/dashboard/apps" className="text-primary hover:underline mt-3 inline-block">
          ← Kembali ke Aplikasi
        </Link>
      </div>
    )
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
          screenshots: app.screenshots || [],
          icon_url: app.icon_url || null,
        }}
        categories={categories.map(c => ({ id: c.id, name: c.name, slug: c.slug }))}
        tags={tags.map(t => ({ id: t.id, name: t.name, slug: t.slug, color: t.color || '#6b7280' }))}
      />
    </div>
  )
}