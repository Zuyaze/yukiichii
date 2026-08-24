import { auth } from '@/lib/auth'
import { createCategory } from '@/lib/db/queries'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name, slug, color, icon, sort_order } = await request.json()
    
    if (!name || !slug) {
      return Response.json({ error: 'Nama dan slug wajib diisi' }, { status: 400 })
    }

    const id = await createCategory({ name, slug, color: color || '#3b82f6', icon: icon || null, sort_order: sort_order || 0 })
    return Response.json({ id })
  } catch (error) {
    console.error('Create category error:', error)
    return Response.json({ error: 'Gagal membuat kategori' }, { status: 500 })
  }
}