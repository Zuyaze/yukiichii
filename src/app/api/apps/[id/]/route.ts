import { auth } from '@/lib/auth'
import { deleteApp } from '@/lib/db/queries'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    await deleteApp(parseInt(id))
    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete app error:', error)
    return Response.json({ error: 'Gagal menghapus aplikasi' }, { status: 500 })
  }
}