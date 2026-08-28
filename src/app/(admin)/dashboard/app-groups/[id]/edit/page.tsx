'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Image as ImageIcon, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

interface AppGroup {
  id: number
  name: string
  slug: string
  title: string
  description: string | null
  logo_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  const maxSize = 5 * 1024 * 1024

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Format tidak didukung. Gunakan JPG, PNG, WebP, atau AVIF.' }
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Ukuran file maksimal 5MB.' }
  }

  return { valid: true }
}

export default function EditGroupPage() {
  const params = useParams<{ id: string }>()
  const groupId = Number(params?.id)
  const router = useRouter()

  const [group, setGroup] = useState<AppGroup | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    title: '',
    description: '',
    logo_url: '',
    sort_order: 0,
    is_active: true,
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!groupId || isNaN(groupId)) return

    async function load() {
      try {
        const res = await fetch(`/api/app-groups/${groupId}`)
        const data = await res.json()
        if (!data.group) {
          setNotFound(true)
          return
        }
        setGroup(data.group)
        setFormData({
          name: data.group.name,
          slug: data.group.slug,
          title: data.group.title,
          description: data.group.description || '',
          logo_url: data.group.logo_url || '',
          sort_order: data.group.sort_order,
          is_active: data.group.is_active,
        })
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [groupId])

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET!)
    fd.append('folder', 'yukiichii/groups')

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: fd }
    )

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error?.message || 'Upload gagal')
    }

    const data = await res.json()
    return data.secure_url
  }

  const handleFileUpload = async (file: File) => {
    const validation = validateImageFile(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    setUploading(true)
    setError('')

    try {
      const url = await uploadToCloudinary(file)
      setFormData(prev => ({ ...prev, logo_url: url }))
    } catch (err) {
      setError('Gagal upload logo: ' + (err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.slug || !formData.title) {
      setError('Nama, slug, dan judul wajib diisi')
      return
    }

    setSaving(true)
    setError('')

    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        title: formData.title,
        description: formData.description || null,
        logo_url: formData.logo_url || null,
        sort_order: formData.sort_order,
        is_active: formData.is_active,
      }

      const res = await fetch(`/api/app-groups/${groupId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Gagal menyimpan')
      }

      router.push('/dashboard/app-groups')
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Yakin hapus group ini? Semua aplikasi di dalamnya akan terlepas.')) return

    try {
      const res = await fetch(`/api/app-groups/${groupId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete gagal')
      router.push('/dashboard/app-groups')
      router.refresh()
    } catch {
      alert('Gagal menghapus group')
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (notFound || !group) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold text-foreground">Group tidak ditemukan</h1>
        <Button onClick={() => router.push('/dashboard/app-groups')} className="mt-3 gap-2">
          Kembali
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Edit Group</h1>
        <p className="text-muted-foreground mt-1">Perbarui informasi group aplikasi</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Group</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-lg text-sm bg-destructive/10 text-destructive border border-destructive/20">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nama Group *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                required
                disabled
              />
              <p className="text-xs text-muted-foreground">Tidak bisa diubah</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Judul Group *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Judul yang ditampilkan"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi group"
                rows={3}
                className="w-full h-24 px-3 py-2 text-sm bg-background text-foreground border border-input rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>

            <div className="space-y-2">
              <Label>Logo Group</Label>
              <div className="flex items-start gap-4">
                <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 border-dashed border-border bg-muted/50">
                  {formData.logo_url ? (
                    <>
                      <img
                        src={formData.logo_url}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, logo_url: '' }))}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/80"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <ImageIcon className="w-8 h-8 mb-1" />
                      <span className="text-[10px]">Logo</span>
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    className="hidden"
                    id="group-logo-upload"
                  />
                  <label htmlFor="group-logo-upload">
                    <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-input rounded-lg cursor-pointer hover:bg-accent transition-colors">
                      <span className="w-4 h-4">📷</span>
                      Pilih Logo
                    </span>
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Format: JPG, PNG, WebP, AVIF · Maks 5MB · Aspect ratio 1:1 (kotak)
                  </p>
                  {formData.logo_url && (
                    <p className="text-xs text-muted-foreground mt-1 font-mono truncate max-w-xs">
                      URL: {formData.logo_url}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sort_order">Urutan</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
                    Tampilkan di website
                  </label>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push('/dashboard/app-groups')}>
          Batal
        </Button>
        <Button type="submit" form="edit-form" disabled={saving || uploading}>
          {saving ? 'Menyimpan...' : uploading ? 'Mengupload...' : 'Simpan'}
        </Button>
      </div>

      <div className="pt-4 border-t">
        <Button variant="destructive" onClick={async () => {
          if (confirm('Yakin hapus group ini? Semua aplikasi di dalamnya akan terlepas.')) {
            const res = await fetch(`/api/app-groups/${group.id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Delete gagal')
            router.push('/dashboard/app-groups')
          }
        }} className="w-full">
          Hapus Group
        </Button>
      </div>
    </div>
  )
}