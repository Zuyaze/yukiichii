'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
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

interface AppGroupsClientProps {
  initialGroups: AppGroup[]
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

export function AppGroupsClient({ initialGroups }: AppGroupsClientProps) {
  const router = useRouter()
  const [groups, setGroups] = useState<AppGroup[]>(initialGroups)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AppGroup | null>(null)
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

  const handleOpen = (group?: AppGroup) => {
    if (group) {
      setEditing(group)
      setFormData({
        name: group.name,
        slug: group.slug,
        title: group.title,
        description: group.description || '',
        logo_url: group.logo_url || '',
        sort_order: group.sort_order,
        is_active: group.is_active,
      })
    } else {
      setEditing(null)
      setFormData({
        name: '',
        slug: '',
        title: '',
        description: '',
        logo_url: '',
        sort_order: groups.length,
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

    // Check max 4 groups when creating new
    if (!editing && groups.length >= 4) {
      setError('Maksimal 4 group aplikasi')
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

      const url = editing
        ? `/api/app-groups/${editing.id}`
        : '/api/app-groups'
      const method = editing ? 'POST' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Gagal menyimpan group')
      }

      setOpen(false)
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin hapus group ini? Semua aplikasi di dalamnya akan terlepas.')) return

    try {
      const res = await fetch(`/api/app-groups/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete gagal')
      router.refresh()
    } catch (error) {
      alert('Gagal menghapus group')
    }
  }

  const canAddGroup = groups.length < 4

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Kelola Group Aplikasi</h1>
          <p className="text-muted-foreground mt-1">Maksimal 4 group • Kelola logo, judul, dan aplikasi di dalamnya</p>
        </div>
        <Button onClick={() => handleOpen()} className="gap-2 w-full sm:w-auto" disabled={!canAddGroup}>
          <Plus className="w-4 h-4" />
          Tambah Group
        </Button>
      </div>

      {!canAddGroup && (
        <div className="p-3 rounded-lg text-sm bg-yellow-50 text-yellow-700 border border-yellow-200">
          Sudah mencapai batas maksimal 4 group. Hapus group yang tidak digunakan untuk menambah yang baru.
        </div>
      )}

      <div className="rounded-lg border border-border bg-background overflow-x-auto">
        <Table>
          <TableHeader>
            <tr>
              <TableHead className="w-16">Logo</TableHead>
              <TableHead>Nama Group</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead className="w-24">Urutan</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-48 text-right">Aksi</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {groups.map(group => (
              <TableRow key={group.id}>
                <TableCell>
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted border border-border">
                    {group.logo_url ? (
                      <img src={group.logo_url} alt={group.title} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{group.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground font-mono">{group.slug}</TableCell>
                <TableCell>{group.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{group.sort_order}</TableCell>
                <TableCell>
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                    group.is_active
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                  )}>
                    {group.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpen(group)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(group.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {groups.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Belum ada group aplikasi.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Group' : 'Tambah Group Baru'}</DialogTitle>
              <DialogDescription>Isi informasi group aplikasi</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {error && (
                <div className="p-3 rounded-lg text-sm bg-destructive/10 text-destructive border border-destructive/20">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nama Group *</Label>
                <Input id="name" name="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="contoh: game-mod" />
                <p className="text-xs text-muted-foreground">Slug akan dibuat otomatis dari nama (hanya huruf kecil, angka, dan tanda hubung)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input id="slug" name="slug" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} required placeholder="game-mod" disabled={editing} />
                <p className="text-xs text-muted-foreground">Tidak bisa diubah setelah dibuat</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Judul Group *</Label>
                <Input id="title" name="title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required placeholder="Game Mod" />
                <p className="text-xs text-muted-foreground">Judul yang ditampilkan di bawah logo group</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Input id="description" name="description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Kumpulan game mod terbaik..." />
              </div>

              <div className="space-y-2">
                <Label>Logo Group *</Label>
                <div className="flex items-start gap-4">
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 border-dashed border-border bg-muted/50">
                    {formData.logo_url ? (
                      <>
                        <img src={formData.logo_url} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, logo_url: '' }))}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/80"
                        >
                          <Trash2 className="w-3 h-3" />
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
                        <ImageIcon className="w-4 h-4" />
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
                  <Input id="sort_order" type="number" value={formData.sort_order} onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} min="0" />
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
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>Batal</Button>
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