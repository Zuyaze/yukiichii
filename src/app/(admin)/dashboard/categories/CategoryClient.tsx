'use client'

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface CategoryClientProps {
  categories: any[]
}

export function CategoryClient({ categories }: CategoryClientProps) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [formData, setFormData] = useState({ name: '', slug: '', color: '#3b82f6', sort_order: 0 })
  const [saving, setSaving] = useState(false)

  const handleOpen = (category?: any) => {
    if (category) {
      setEditing(category)
      setFormData({
        name: category.name,
        slug: category.slug,
        color: category.color,
        sort_order: category.sort_order,
      })
    } else {
      setEditing(null)
      setFormData({ name: '', slug: '', color: '#3b82f6', sort_order: categories.length })
    }
    setOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        const res = await fetch(`/api/categories/${editing.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        if (!res.ok) throw new Error('Update gagal')
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        if (!res.ok) throw new Error('Create gagal')
      }
      setOpen(false)
      window.location.reload()
    } catch (error) {
      alert('Gagal menyimpan kategori')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin hapus kategori ini?')) return
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete gagal')
      window.location.reload()
    } catch (error) {
      alert('Gagal menghapus kategori')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Kelola Kategori</h1>
          <p className="text-muted-foreground mt-1">Tambah, edit, dan hapus kategori aplikasi</p>
        </div>
        <Button onClick={() => handleOpen()} className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Tambah Kategori
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-background overflow-x-auto">
        <Table>
          <TableHeader>
            <tr>
              <TableHead className="w-12">Warna</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Urutan</TableHead>
              <TableHead className="w-48 text-right">Aksi</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {categories.map(category => (
              <TableRow key={category.id}>
                <TableCell>
                  <div className="w-6 h-6 rounded border" style={{ backgroundColor: category.color }} />
                </TableCell>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground font-mono">{category.slug}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{category.sort_order}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleOpen(category)} className="text-muted-foreground hover:text-foreground">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Belum ada kategori.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Kategori' : 'Tambah Kategori'}</DialogTitle>
              <DialogDescription>Isi informasi kategori di bawah</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama *</Label>
                <Input id="name" name="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input id="slug" name="slug" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Warna *</Label>
                <div className="flex items-center gap-3">
                  <input type="color" id="color" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className="w-10 h-10 rounded border cursor-pointer" />
                  <Input id="color-hex" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className="flex-1 font-mono" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort_order">Urutan</Label>
                <Input id="sort_order" type="number" value={formData.sort_order} onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) })} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : editing ? 'Update' : 'Simpan'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}