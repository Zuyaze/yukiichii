'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Loader2, Image as ImageIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeedbackCTA {
  id: number
  title: string
  link_url: string
  icon_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

interface FeedbackCTAClientProps {
  initialCTAs: FeedbackCTA[]
}

export function FeedbackCTAClient({ initialCTAs }: FeedbackCTAClientProps) {
  const router = useRouter()
  const [ctas, setCtas] = useState<FeedbackCTA[]>(initialCTAs)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<FeedbackCTA | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    link_url: '',
    icon_url: '',
    is_active: true,
    sort_order: 0,
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleOpen = (cta?: FeedbackCTA) => {
    if (cta) {
      setEditing(cta)
      setFormData({
        title: cta.title,
        link_url: cta.link_url,
        icon_url: cta.icon_url || '',
        is_active: cta.is_active,
        sort_order: cta.sort_order,
      })
    } else {
      setEditing(null)
      setFormData({
        title: '',
        link_url: 'https://t.me/',
        icon_url: '',
        is_active: true,
        sort_order: ctas.length,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title) {
      setError('Judul wajib diisi')
      return
    }
    if (!formData.link_url) {
      setError('Link wajib diisi')
      return
    }

    const isHttpsUrl = (u: string) => u.startsWith('https://')
    const isBlobUrl = (u: string) => u.startsWith('blob:')
    if (!formData.link_url.startsWith('https://')) {
      setError('Link harus dimulai dengan https://')
      return
    }
    if (formData.icon_url && !isHttpsUrl(formData.icon_url) && !isBlobUrl(formData.icon_url)) {
      setError('URL icon harus dimulai dengan https:// atau upload file')
      return
    }

    setSaving(true)
    setError('')

    try {
      const url = editing
        ? `/api/feedback-cta/${editing.id}`
        : '/api/feedback-cta'
      const method = editing ? 'POST' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          link_url: formData.link_url,
          icon_url: formData.icon_url || null,
          is_active: formData.is_active,
          sort_order: formData.sort_order,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Gagal menyimpan CTA')
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
    if (!confirm('Yakin hapus CTA ini?')) return

    try {
      const res = await fetch(`/api/feedback-cta/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete gagal')
      router.refresh()
    } catch (error) {
      alert('Gagal menghapus CTA')
    }
  }

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
      alert('Format tidak didukung. Gunakan JPG, PNG, WebP, atau AVIF.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB.')
      return
    }

    setUploading(true)
    try {
      // For now, we'll just use a placeholder URL since we don't have upload endpoint
      // In production, you'd upload to Cloudinary or similar
      const url = URL.createObjectURL(file)
      setFormData(prev => ({ ...prev, icon_url: url }))
    } catch (err) {
      alert('Gagal upload icon: ' + (err as Error).message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleRemoveIcon = () => {
    setFormData(prev => ({ ...prev, icon_url: '' }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Kelola Feedback CTA</h1>
          <p className="text-muted-foreground mt-1">
            Atur tombol feedback yang muncul di halaman aplikasi
          </p>
        </div>
        <Button onClick={() => handleOpen()} className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Tambah CTA
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-background overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader>
            <tr>
              <TableHead>Judul</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Urutan</TableHead>
              <TableHead className="w-48 text-right">Aksi</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {ctas.map((cta) => (
              <TableRow key={cta.id}>
                <TableCell className="font-medium">{cta.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground font-mono truncate max-w-xs">
                  {cta.link_url}
                </TableCell>
                <TableCell className="text-center">
                  {cta.icon_url ? (
                    <img
                      src={cta.icon_url}
                      alt="Icon"
                      className="w-8 h-8 mx-auto rounded object-cover"
                    />
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    cta.is_active
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                  )}>
                    {cta.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground text-center">{cta.sort_order}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpen(cta)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(cta.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {ctas.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Belum ada CTA. <Button variant="ghost" size="sm" onClick={() => handleOpen()}>Tambah yang pertama</Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit CTA' : 'Tambah CTA'}</DialogTitle>
              <DialogDescription>Isi informasi tombol feedback di bawah</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {error && (
                <div className="p-3 rounded-lg text-sm bg-destructive/10 text-destructive border border-destructive/20">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Judul Tombol *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: No Feedback No Update Mods"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link_url">Link Telegram *</Label>
                <Input
                  id="link_url"
                  name="link_url"
                  type="url"
                  value={formData.link_url}
                  onChange={e => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="https://t.me/..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon_url">Icon (Opsional)</Label>
                <div className="flex items-start gap-4">
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 border-dashed border-border bg-muted/50">
                    {formData.icon_url ? (
                      <>
                        <img
                          src={formData.icon_url}
                          alt="Icon Preview"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveIcon}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/80"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <ImageIcon className="w-8 h-8 mb-1" />
                        <span className="text-[10px]">Icon</span>
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
                      onChange={handleIconUpload}
                      className="hidden"
                      id="icon-upload"
                    />
                    <label htmlFor="icon-upload">
                      <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-input rounded-lg cursor-pointer hover:bg-accent transition-colors">
                        <ImageIcon className="w-4 h-4" />
                        Pilih Icon
                      </span>
                    </label>
                    <p className="text-xs text-muted-foreground mt-2">
                      Format: JPG, PNG, WebP, AVIF &middot; Maks 5MB
                    </p>
                    {formData.icon_url && (
                      <p className="text-xs text-muted-foreground mt-1 font-mono truncate max-w-xs">
                        Preview: {formData.icon_url}
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