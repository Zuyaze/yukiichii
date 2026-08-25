'use client'

import { useEffect, useState } from 'react'
import { AppForm } from '@/components/admin-form'
import { Loader2 } from 'lucide-react'

interface Option {
  id: number
  name: string
  slug: string
  color?: string
}

export default function NewAppPage() {
  const [categories, setCategories] = useState<Option[]>([])
  const [tags, setTags] = useState<Option[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [catRes, tagRes] = await Promise.all([
          fetch('/api/categories').then(r => r.json()),
          fetch('/api/tags').then(r => r.json()),
        ])
        setCategories(catRes.categories || [])
        setTags(tagRes.tags || [])
      } catch {
        // leave empty lists on failure
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Tambah Aplikasi Baru</h1>
        <p className="text-muted-foreground mt-1">Isi formulir di bawah untuk menambah mod baru</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <AppForm
          initialData={null}
          categories={categories.map(c => ({ id: c.id, name: c.name, slug: c.slug }))}
          tags={tags.map(t => ({ id: t.id, name: t.name, slug: t.slug, color: t.color || '#6b7280' }))}
        />
      )}
    </div>
  )
}