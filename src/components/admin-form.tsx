'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Image } from 'next/image'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!

interface AppFormProps {
  initialData?: {
    id: number
    slug: string
    title: string
    description: string
    download_url: string
    category_id: number | null
    tag_ids: number[]
    screenshots: string[]
  } | null
  categories: { id: number; name: string; slug: string }[]
  tags: { id: number; name: string; slug: string; color: string }[]
  onSubmit: (data: FormData) => Promise<void>
  onCancel: () => void
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

export function AppForm({ initialData, categories, tags, onSubmit, onCancel }: AppFormProps) {
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
  })

  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    formData.append('folder', 'yukiichii')

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error?.message || 'Upload gagal')
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
        const file = validFiles[i]
        const url = await uploadToCloudinary(file)
        setFormData(prev => ({
          ...prev,
          screenshots: [...prev.screenshots, url],
        }))
        setUploadProgress(((i + 1) / validFiles.length) * 100)
      }
    } catch (error) {
      alert('Gagal upload screenshot: ' + (error as Error).message)
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
      alert('Slug, judul, dan link download wajib diisi')
      return
    }

    const submitData = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => submitData.append(key, v))
      } else {
        submitData.append(key, value)
      }
    })

    await onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Aplikasi' : 'Tambah Aplikasi Baru'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="contoh: video-editor-pro"
                required
                disabled={isEditing}
              />
              <p className="text-xs text-gray-500">Hanya huruf kecil, angka, dan tanda hubung. Tidak bisa diubah setelah dibuat.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Judul *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Nama aplikasi"
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
              placeholder="Deskripsi singkat tentang aplikasi..."
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category_id">Kategori</Label>
              <Select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onValueChange={value => setFormData(prev => ({ ...prev, category_id: value }))}
              >
                <option value="">Pilih kategori (opsional)</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tag</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <label
                    key={tag.id}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs cursor-pointer transition-colors border',
                      formData.tag_ids.includes(tag.id.toString())
                        ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700'
                        : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                    )}
                    style={formData.tag_ids.includes(tag.id.toString()) ? { backgroundColor: `${tag.color}20`, color: tag.color, borderColor: `${tag.color}40` } : {}}
                  >
                    <input
                      type="checkbox"
                      name="tag_ids"
                      value={tag.id.toString()}
                      checked={formData.tag_ids.includes(tag.id.toString())}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Screenshot (16:9 landscape, maks 5MB per file)</Label>
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
                uploading ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 hover:border-blue-400 dark:border-gray-600'
              )}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleScreenshotUpload(e.dataTransfer.files) }}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                onChange={e => e.target.files && handleScreenshotUpload(e.target.files)}
                className="hidden"
                id="screenshot-upload"
              />
              <label htmlFor="screenshot-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Klik atau drag & drop untuk upload screenshot</p>
                <p className="text-xs text-gray-400 mt-1">Format: JPG, PNG, WebP, AVIF | Maks 5MB per file</p>
              </label>

              {uploading && (
                <div className="mt-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Mengupload... {Math.round(uploadProgress)}%</p>
                </div>
              )}

              {formData.screenshots.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {formData.screenshots.map((url, index) => (
                    <div key={index} className="relative aspect-video rounded overflow-hidden border">
                      <Image
                        src={url}
                        alt={`Screenshot ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                      <button
                        type="button"
                        onClick={() => removeScreenshot(url)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
        <Button type="submit" disabled={uploading}>{isEditing ? 'Update' : 'Simpan'}</Button>
      </div>
    </form>
  )
}