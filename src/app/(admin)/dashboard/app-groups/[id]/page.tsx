'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Loader2, Image as ImageIcon, Search, Check, ChevronLeft, X } from 'lucide-react'
import { useRouter as useNextRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

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

interface App {
  id: number
  slug: string
  title: string
  description: string | null
  download_url: string
  category_id: number | null
  screenshots: string[] | null
  icon_url: string | null
  created_at: string
  updated_at: string
  category_name?: string
  category_color?: string
}

interface GroupApp extends App {
  group_sort_order: number
}

export default function AppGroupDetailPage() {
  const params = useParams<{ id: string }>()
  const groupId = Number(params?.id)
  const router = useNextRouter()

  const [group, setGroup] = useState<AppGroup | null>(null)
  const [groupApps, setGroupApps] = useState<GroupApp[]>([])
  const [availableApps, setAvailableApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedApps, setSelectedApps] = useState<Set<number>>(new Set())
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (!groupId || isNaN(groupId)) return

    async function load() {
      try {
        const [groupRes, appsRes, availableRes] = await Promise.all([
          fetch(`/api/app-groups/${groupId}`).then(r => r.json()),
          fetch(`/api/app-groups/${groupId}/apps?in_group=true`).then(r => r.json()),
        ])

        if (!groupRes.group) {
          setNotFound(true)
          return
        }

        setGroup(groupRes.group)
        setGroupApps(appsRes.apps || [])
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [groupId])

  useEffect(() => {
    if (!addDialogOpen || !group) return

    async function loadAvailable() {
      try {
        const res = await fetch(`/api/app-groups/${group.id}/apps?search=${encodeURIComponent(searchQuery)}&in_group=false`)
        const data = await res.json()
        setAvailableApps(data.apps || [])
      } catch {
        setAvailableApps([])
      }
    }
    loadAvailable()
  }, [addDialogOpen, searchQuery, group])

  const handleRemoveApp = async (appId: number) => {
    if (!confirm('Yakin hapus aplikasi ini dari group?')) return

    try {
      const res = await fetch(`/api/app-groups/${groupId}/apps?app_id=${appId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal hapus')
      router.refresh()
    } catch {
      alert('Gagal menghapus aplikasi dari group')
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const toggleApp = (appId: number) => {
    const newSelected = new Set(selectedApps)
    if (newSelected.has(appId)) {
      newSelected.delete(appId)
    } else {
      newSelected.add(appId)
    }
    setSelectedApps(newSelected)
  }

  const handleAddApps = async () => {
    if (selectedApps.size === 0) return

    setAdding(true)
    try {
      const res = await fetch(`/api/app-groups/${groupId}/apps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_ids: Array.from(selectedApps) }),
      })
      if (!res.ok) throw new Error('Gagal tambah aplikasi')
      setAddDialogOpen(false)
      setSelectedApps(new Set())
      router.refresh()
    } catch (err) {
      alert('Gagal tambah aplikasi: ' + (err as Error).message)
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (notFound || !group) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold text-foreground">Group tidak ditemukan</h1>
        <Button onClick={() => router.push('/dashboard/app-groups')} className="mt-3 gap-2">
          <ChevronLeft className="w-4 h-4" />
          Kembali
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/app-groups')} className="mb-2 sm:mb-0">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{group.title}</h1>
          <p className="text-muted-foreground mt-1">{group.name} • {groupApps.length} aplikasi</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push(`/dashboard/app-groups/${group.id}/edit`)} variant="outline" className="gap-2">
            <Edit className="w-4 h-4" />
            Edit Group
          </Button>
          <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Tambah Aplikasi
          </Button>
        </div>
      </div>

      {/* Group Info Card */}
      <div className="rounded-lg border border-border bg-background p-6 space-y-4">
        <div className="flex items-start gap-6">
          <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border border-border bg-muted">
            {group.logo_url ? (
              <img src={group.logo_url} alt={group.title} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <ImageIcon className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <h2 className="text-xl font-bold text-foreground">{group.title}</h2>
            <p className="text-sm text-muted-foreground font-mono">{group.slug}</p>
            {group.description && <p className="text-sm text-muted-foreground">{group.description}</p>}
            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs text-muted-foreground">Urutan: {group.sort_order}</span>
              <span className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                group.is_active
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
              )}>
                {group.is_active ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Apps Table */}
      <div className="rounded-lg border border-border bg-background">
        <div className="border-b border-border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-foreground">Aplikasi di Group Ini ({groupApps.length})</h3>
        </div>

        {groupApps.length > 0 ? (
          <Table>
            <TableHeader>
              <tr className="border-b border-border">
                <TableHead className="w-16">Icon</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="w-24">Urutan</TableHead>
                <TableHead className="w-48 text-right">Aksi</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {groupApps.map(app => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted border border-border">
                      {app.icon_url ? (
                        <img src={app.icon_url} alt={app.title} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <span className="text-lg font-bold text-primary/60">{app.title.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{app.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{app.category_name || '-'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{app.group_sort_order}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveApp(app.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <p className="mb-2">Belum ada aplikasi di group ini</p>
            <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Tambah Aplikasi Pertama
            </Button>
          </div>
        )}
      </div>

      {/* Add Apps Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Tambah Aplikasi ke "{group.title}"</DialogTitle>
            <DialogDescription>Pilih aplikasi yang ingin ditambahkan ke group ini</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Cari aplikasi..."
                className="w-full h-10 pl-10 pr-4 text-sm bg-background text-foreground border border-input rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </div>

            {availableApps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Tidak ada aplikasi tersedia untuk ditambahkan
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <tr className="border-b border-border">
                    <TableHead className="w-12">Pilih</TableHead>
                    <TableHead className="w-16">Icon</TableHead>
                    <TableHead>Judul</TableHead>
                    <TableHead>Kategori</TableHead>
                  </tr>
                </TableHeader>
                <TableBody>
                  {availableApps.map(app => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedApps.has(app.id)}
                          onChange={() => toggleApp(app.id)}
                          className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted border border-border">
                          {app.icon_url ? (
                            <img src={app.icon_url} alt={app.title} className="absolute inset-0 w-full h-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                              <span className="text-lg font-bold text-primary/60">{app.title.charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{app.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{app.category_name || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {selectedApps.size > 0 && (
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 text-sm text-primary">
                {selectedApps.size} aplikasi dipilih
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { setAddDialogOpen(false); setSelectedApps(new Set()); }}>Batal</Button>
            <Button type="button" onClick={handleAddApps} disabled={adding || selectedApps.size === 0}>
              {adding ? 'Menambah...' : `Tambah (${selectedApps.size})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}