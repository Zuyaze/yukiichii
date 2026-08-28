'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Loader2, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

interface HeroImage {
  id: number
  image_url: string
  alt_text: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface HeroGalleryClientProps {
  initialImages: HeroImage[]
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

export function HeroGalleryClient({ initialImages }: HeroGalleryClientProps) {
  const [images, setImages] = useState<HeroImage[]>(initialImages)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<HeroImage | null>(null)
  const [formData, setFormData] = useState({
    image_url: '',
    alt_text: '',
    sort_order: 0,
    is_active: true,
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const currentImage = images[0] || null

  const handleOpen = (image?: HeroImage) => {
    if (image) {
      setEditing(image)
      setFormData({
        image_url: image.image_url,
        alt_text: image.alt_text || '',
        sort_order: image.sort_order,
        is_active: image.is_active,
      })
    } else if (currentImage) {
      setEditing(currentImage)
      setFormData({
        image_url: currentImage.image_url,
        alt_text: currentImage.alt_text || '',
        sort_order: currentImage.sort_order,
        is_active: currentImage.is_active,
      })
    } else {
      setEditing(null)
      setFormData({
        image_url: '',
        alt_text: '',
        sort_order: 0,
        is_active: true,
      })
    }
    setOpen(true)
    setError('')
  }

  const handleClose = () => {
    setOpen(false)
    setEditing(null)
    setError('')
  }

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET!)
    fd.append('folder', 'yukiichii/hero')

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
      setFormData(prev => ({ ...prev, image_url: url }))
    } catch (err) {
      setError('Gagal upload gambar: ' + (err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.image_url) {
      setError('Gambar wajib diisi')
      return
    }

    setSaving(true)
    setError('')

    try {
      const payload = {
        image_url: formData.image_url,
        alt_text: formData.alt_text || null,
        sort_order: formData.sort_order,
        is_active: formData.is_active,
      }

      const url = editing
        ? `/api/hero-images/${editing.id}`
        : '/api/hero-images'
      const method = editing ? 'POST' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Gagal menyimpan')
      }

      setOpen(false)
      window.location.reload()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!currentImage) return
    if (!confirm('Yakin hapus gambar hero ini?')) return

    try {
      const res = await fetch(`/api/hero-images/${currentImage.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete gagal')
      window.location.reload()
    } catch (error) {
      alert('Gagal menghapus gambar')
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image_url: '' }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Kelola Hero Gallery</h1>
          <p className="text-muted-foreground mt-1">Kelola gambar hero section di homepage (hanya 1 gambar)</p>
        </div>
      </div>

      {/* Current Hero Image Display */}
      <Card>
        <CardHeader>
          <CardTitle>Gambar Hero Saat Ini</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentImage ? (
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="relative w-64 h-36 flex-shrink-0 rounded-xl overflow-hidden bg-muted border border-border">
                <img
                  src={currentImage.image_url}
                  alt={currentImage.alt_text || ''}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div>
                  <Label className="text-sm font-medium">Alt Text</Label>
                  <p className="text-sm text-muted-foreground mt-1">{currentImage.alt_text || '-'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                    currentImage.is_active
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                  )}>
                    {currentImage.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button variant="outline" onClick={() => handleOpen(currentImage)} className="gap-2">
                    <Edit className="w-4 h-4" />
                    Ganti Gambar
                  </Button>
                  <Button variant="destructive" onClick={handleDelete} className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Hapus
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="relative w-64 h-36 mx-auto rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-border flex items-center justify-center">
                <div className="text-center p-4 text-primary/60">
                  <Plus className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">Belum ada gambar hero</p>
                </div>
              </div>
              <Button onClick={() => handleOpen()} className="mt-4 gap-2">
                <Plus className="w-4 h-4" />
                Tambah Gambar Hero
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit/Add Dialog - EXACTLY like Logo Aplikasi in admin-form.tsx */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editing || currentImage ? 'Ganti Gambar Hero' : 'Tambah Gambar Hero'}</DialogTitle>
              <DialogDescription>Upload gambar dan atur informasinya</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {error && (
                <div className="p-3 rounded-lg text-sm bg-destructive/10 text-destructive border border-destructive/20">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label>Gambar *</Label>
                <div className="flex items-start gap-4">
                  {/* Preview / placeholder - EXACTLY like Logo Aplikasi */}
                  <div className="relative w-32 h-18 flex-shrink-0 rounded-lg overflow-hidden border-2 border-dashed border-border bg-muted/50">
                    {formData.image_url ? (
                      <>
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/80"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <ImageIcon className="w-8 h-8 mb-1" />
                        <span className="text-[10px]">Preview</span>
                      </div>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    )}
                  </div>

                  {/* Upload button - EXACTLY like Logo Aplikasi */}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={async e => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const validation = validateImageFile(file)
                        if (!validation.valid) {
                          alert(validation.error)
                          return
                        }
                        setUploading(true)
                        setError('')
                        try {
                          const url = await uploadToCloudinary(file)
                          setFormData(prev => ({ ...prev, image_url: url }))
                        } catch (err) {
                          setError('Gagal upload gambar: ' + (err as Error).message)
                        } finally {
                          setUploading(false)
                          e.target.value = ''
                        }
                      }}
                      className="hidden"
                      id="hero-image-upload"
                    />
                    <label htmlFor="hero-image-upload">
                      <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-input rounded-lg cursor-pointer hover:bg-accent transition-colors">
                        <ImageIcon className="w-4 h-4" />
                        Pilih Gambar
                      </span>
                    </label>
                    <p className="text-xs text-muted-foreground mt-2">
                      Format: JPG, PNG, WebP, AVIF · Maks 5MB · Aspect ratio 16:9 disarankan
                    </p>
                    {formData.image_url && (
                      <p className="text-xs text-muted-foreground mt-1 font-mono truncate max-w-xs">
                        URL: {formData.image_url}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alt_text">Alt Text</Label>
                <Input
                  id="alt_text"
                  name="alt_text"
                  value={formData.alt_text}
                  onChange={e => setFormData({ ...formData, alt_text: e.target.value })}
                  placeholder="Deskripsi gambar untuk aksesibilitas"
                />
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
                      Tampilkan di homepage
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Batal
              </Button>
              <Button type="submit" disabled={saving || uploading}>
                {saving ? 'Menyimpan...' : uploading ? 'Mengupload...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}