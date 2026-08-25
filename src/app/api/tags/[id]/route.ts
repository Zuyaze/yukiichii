import { auth } from '@/lib/auth'
import { updateTag, deleteTag } from '@/lib/db/queries'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const { name, slug, color } = await request.json()
    
    if (!name || !slug) {
      return Response.json({ error: 'Nama dan slug wajib diisi' }, { status: 400 })
    }

    await updateTag(parseInt(id), { name, slug, color: color || '#6b7280' })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Update tag error:', error)
    return Response.json({ error: 'Gagal mengupdate tag' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    await deleteTag(parseInt(id))
    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete tag error:', error)
    return Response.json({ error: 'Gagal menghapus tag' }, { status: 500 })
  }
}