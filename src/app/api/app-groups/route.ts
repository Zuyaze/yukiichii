import { getDb, ensureSchema } from '@/lib/db'
import { auth } from '@/lib/auth'
import { getAllAppGroups, createAppGroup } from '@/lib/db/queries'

export async function GET() {
  try {
    const groups = await getAllAppGroups()
    return Response.json({ groups })
  } catch (error) {
    console.error('Get app groups error:', error)
    return Response.json({ groups: [] })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await ensureSchema()
    const body = await request.json()
    const { name, slug, title, description, logo_url, sort_order, is_active } = body

    if (!name || !slug || !title) {
      return Response.json({ error: 'Nama, slug, dan judul wajib diisi' }, { status: 400 })
    }

    const isHttpsUrl = (u: unknown) => typeof u === 'string' && u.startsWith('https://')
    if (logo_url && !isHttpsUrl(logo_url)) {
      return Response.json({ error: 'URL logo harus dimulai dengan https://' }, { status: 400 })
    }

    // Check max 4 groups
    const existingGroups = await getAllAppGroups()
    if (existingGroups.length >= 4) {
      return Response.json({ error: 'Maksimal 4 group aplikasi' }, { status: 400 })
    }

    const id = await createAppGroup({
      name,
      slug,
      title,
      description: description ?? null,
      logo_url: logo_url ?? null,
      sort_order: sort_order ?? 0,
      is_active: is_active ?? true,
    })

    return Response.json({ success: true, id })
  } catch (error) {
    console.error('Create app group error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return Response.json({ error: msg }, { status: 500 })
  }
}