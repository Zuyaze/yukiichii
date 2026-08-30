import { auth } from '@/lib/auth'
import { updateCategory, deleteCategory } from '@/lib/db/queries'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const { name, slug, color, sort_order } = await request.json()
    
    if (!name || !slug) {
      return Response.json({ error: 'Nama dan slug wajib diisi' }, { status: 400 })
    }

    await updateCategory(parseInt(id), { name, slug, color: color || '#3b82f6', sort_order: sort_order ?? 0 })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Update category error:', error)
    return Response.json({ error: 'Gagal mengupdate kategori' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    await deleteCategory(parseInt(id))
    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete category error:', error)
    return Response.json({ error: 'Gagal menghapus kategori' }, { status: 500 })
  }
}