'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit, Trash2, Loader2, Image as ImageIcon, Check } from 'lucide-react'
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
  const [previewKey, setPreviewKey] = useState(0)

  const handleOpen = (image?: HeroImage) => {
    if (image) {
      setEditing(image)
      setFormData({
        image_url: image.image_url,
        alt_text: image.alt_text || '',
        sort_order: image.sort_order,
        is_active: image.is_active,
      })
    } else {
      setEditing(null)
      setFormData({
        image_url: '',
        alt_text: '',
        sort_order: images.length,
        is_active: true,
      })
    }
    setPreviewKey(k => k + 1)
    setOpen(true)
    setError('')
  }

  const handleClose = () => {
    if (formData.image_url.startsWith('blob:')) {
      URL.revokeObjectURL(formData.image_url)
    }
    setOpen(false)
    setEditing(null)
    setError('')
    setPreviewKey(k => k + 1)
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

    if (formData.image_url.startsWith('blob:')) {
      URL.revokeObjectURL(formData.image_url)
    }

    const localUrl = URL.createObjectURL(file)
    setFormData(prev => ({ ...prev, image_url: localUrl }))
    setPreviewKey(k => k + 1)

    setUploading(true)
    setError('')

    try {
      const url = await uploadToCloudinary(file)
      setFormData(prev => ({ ...prev, image_url: url }))
      setPreviewKey(k => k + 1)
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

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin hapus gambar ini?')) return

    try {
      const res = await fetch(`/api/hero-images/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete gagal')
      window.location.reload()
    } catch (error) {
      alert('Gagal menghapus gambar')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Kelola Hero Gallery</h1>
          <p className="text-muted-foreground mt-1">Kelola gambar hero section di homepage</p>
        </div>
        <Button onClick={() => handleOpen()} className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Tambah Gambar
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-background overflow-x-auto">
        <Table>
          <TableHeader>
            <tr>
              <TableHead className="w-24">Preview</TableHead>
              <TableHead>Alt Text</TableHead>
              <TableHead className="w-24">Urutan</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-48 text-right">Aksi</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {images.map(image => (
              <TableRow key={image.id}>
                <TableCell>
                  <div className="relative w-20 h-11 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={image.image_url}
                      alt={image.alt_text || ''}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                  {image.alt_text || '-'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{image.sort_order}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                      image.is_active
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    )}
                  >
                    {image.is_active ? (
                      <>
                        <Check className="w-3 h-3" />
                        Aktif
                      </>
                    ) : (
                      'Nonaktif'
                    )}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpen(image)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(image.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {images.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Belum ada gambar hero gallery.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Gambar' : 'Tambah Gambar Baru'}</DialogTitle>
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
                  <div className="relative w-32 h-18 flex-shrink-0 rounded-lg overflow-hidden border-2 border-dashed border-border bg-muted/50">
                    {formData.image_url ? (
                      <>
                        <img
                          key={previewKey}
                          src={formData.image_url}
                          alt="Preview"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (formData.image_url.startsWith('blob:')) {
                              URL.revokeObjectURL(formData.image_url)
                            }
                            setFormData(prev => ({ ...prev, image_url: '' }))
                            setPreviewKey(k => k + 1)
                          }}
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

                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
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
                {saving ? 'Menyimpan...' : uploading ? 'Mengupload...' : editing ? 'Update' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}