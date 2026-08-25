'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

export interface AppFormData {
  slug: string
  title: string
  description: string
  download_url: string
  category_id: number | null
  tag_ids: number[]
  screenshots: string[]
  icon_url?: string | null
}

interface AppFormProps {
  initialData?: (AppFormData & { id: number }) | null
  categories: { id: number; name: string; slug: string }[]
  tags: { id: number; name: string; slug: string; color: string }[]
}

function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Format tidak didukung. Gunakan JPG, PNG, WebP, atau AVIF.' }
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Ukuran file maksimal 5MB.' }
  }

  return { valid: true }
}

export function AppForm({ initialData, categories, tags }: AppFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const [formData, setFormData] = useState({
    slug: initialData?.slug || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    download_url: initialData?.download_url || '',
    category_id: initialData?.category_id?.toString() || '',
    tag_ids: initialData?.tag_ids?.map(String) || [],
    screenshots: initialData?.screenshots || [],
    icon_url: initialData?.icon_url || '',
  })

  const [uploading, setUploading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        tag_ids: checked
          ? [...prev.tag_ids, value]
          : prev.tag_ids.filter(id => id !== value),
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET!)
    fd.append('folder', 'yukiichii')

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

  const handleScreenshotUpload = async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      const validation = validateImageFile(file)
      if (!validation.valid) {
        alert(validation.error)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < validFiles.length; i++) {
        const url = await uploadToCloudinary(validFiles[i])
        setFormData(prev => ({ ...prev, screenshots: [...prev.screenshots, url] }))
        setUploadProgress(((i + 1) / validFiles.length) * 100)
      }
    } catch (err) {
      alert('Gagal upload screenshot: ' + (err as Error).message)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const removeScreenshot = (url: string) => {
    setFormData(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter(s => s !== url),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.slug || !formData.title || !formData.download_url) {
      setError('Slug, judul, dan link download wajib diisi')
      return
    }

    setSaving(true)
    setError('')

    try {
      const payload = {
        slug: formData.slug,
        title: formData.title,
        description: formData.description || null,
        download_url: formData.download_url,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        tag_ids: formData.tag_ids.map(Number),
        screenshots: formData.screenshots,
        icon_url: formData.icon_url || null,
      }

      const res = await fetch(
        isEditing ? `/api/apps/${initialData!.id}` : '/api/apps',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Gagal menyimpan aplikasi')
      }

      router.push('/dashboard/apps')
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg text-sm bg-destructive/10 text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Aplikasi' : 'Tambah Aplikasi Baru'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="contoh: ml-mod-v18"
                required
                disabled={isEditing}
              />
              <p className="text-xs text-muted-foreground">
                Huruf kecil, angka, dan tanda hubung. Tidak bisa diubah setelah dibuat.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Judul *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Nama mod / versi"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Fitur mod, cara install, catatan versi..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="download_url">Link Download *</Label>
            <Input
              id="download_url"
              name="download_url"
              type="url"
              value={formData.download_url}
              onChange={handleChange}
              placeholder="https://example.com/download.apk"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id">Kategori</Label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full h-10 px-3 py-2 text-sm bg-background text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            >
              <option value="">Pilih kategori (opsional)</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {tags.length > 0 && (
            <div className="space-y-2">
              <Label>Tag</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => {
                  const active = formData.tag_ids.includes(tag.id.toString())
                  return (
                    <label
                      key={tag.id}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs cursor-pointer transition-colors border',
                        active
                          ? 'font-medium border-transparent'
                          : 'bg-muted text-muted-foreground border-border hover:bg-accent'
                      )}
                      style={
                        active
                          ? {
                              backgroundColor: `${tag.color}25`,
                              color: tag.color,
                              borderColor: `${tag.color}60`,
                            }
                          : {}
                      }
                    >
                      <input
                        type="checkbox"
                        value={tag.id.toString()}
                        checked={active}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      {tag.name}
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Logo Aplikasi *</Label>
            <div className="flex items-start gap-4">
              {/* Preview / placeholder */}
              <div className="relative w-28 h-28 flex-shrink-0 rounded-2xl overflow-hidden border-2 border-dashed border-border bg-muted/50">
                {formData.icon_url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.icon_url}
                      alt="Logo aplikasi"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon_url: '' }))}
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
                {uploadingLogo && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}
              </div>

              {/* Upload button */}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={async e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const validation = validateImageFile(file)
                    if (!validation.valid) {
                      alert(validation.error)
                      return
                    }
                    setUploadingLogo(true)
                    try {
                      const url = await uploadToCloudinary(file)
                      setFormData(prev => ({ ...prev, icon_url: url }))
                    } catch (err) {
                      alert('Gagal upload logo: ' + (err as Error).message)
                    } finally {
                      setUploadingLogo(false)
                      e.target.value = ''
                    }
                  }}
                  className="hidden"
                  id="logo-upload"
                />
                <label htmlFor="logo-upload">
                  <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-input rounded-lg cursor-pointer hover:bg-accent transition-colors">
                    <Upload className="w-4 h-4" />
                    Pilih Logo
                  </span>
                </label>
                <p className="text-xs text-muted-foreground mt-2">
                  Ikon aplikasi asli (kotak). Tampil sebagai thumbnail di grid. Maks 5MB.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Screenshot (16:9 landscape, maks 5MB per file)</Label>
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
                uploading
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault()
                handleScreenshotUpload(e.dataTransfer.files)
              }}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                onChange={e => e.target.files && handleScreenshotUpload(e.target.files)}
                className="hidden"
                id="screenshot-upload"
              />
              <label htmlFor="screenshot-upload" className="cursor-pointer block">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-foreground">Klik atau drag & drop untuk upload screenshot</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP, AVIF · Maks 5MB</p>
              </label>

              {uploading && (
                <div className="mt-4 max-w-xs mx-auto">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Mengupload... {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}
            </div>

            {formData.screenshots.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {formData.screenshots.map((url, index) => (
                  <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Screenshot ${index + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeScreenshot(url)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push('/dashboard/apps')}>
          Batal
        </Button>
        <Button type="submit" disabled={saving || uploading}>
          {saving ? 'Menyimpan...' : isEditing ? 'Update' : 'Simpan'}
        </Button>
      </div>
    </form>
  )
}