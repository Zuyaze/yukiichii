import { auth } from '@/lib/auth'
import { createTag } from '@/lib/db/queries'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name, slug, color } = await request.json()
    
    if (!name || !slug) {
      return Response.json({ error: 'Nama dan slug wajib diisi' }, { status: 400 })
    }

    const id = await createTag({ name, slug, color: color || '#6b7280' })
    return Response.json({ id })
  } catch (error) {
    console.error('Create tag error:', error)
    return Response.json({ error: 'Gagal membuat tag' }, { status: 500 })
  }
}