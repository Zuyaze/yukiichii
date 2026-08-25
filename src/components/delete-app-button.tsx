'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DeleteAppButtonProps {
  id: number
  title: string
}

export function DeleteAppButton({ id, title }: DeleteAppButtonProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Yakin hapus "${title}"? Tindakan ini tidak bisa dibatalkan.`)) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/apps/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal menghapus')
      window.location.reload()
    } catch (err) {
      alert((err as Error).message)
      setDeleting(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={deleting}
      title="Hapus"
      className="text-muted-foreground hover:text-destructive"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}