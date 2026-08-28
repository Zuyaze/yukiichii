import { auth } from '@/lib/auth'
import { getAppGroupById, updateAppGroup, deleteAppGroup } from '@/lib/db/queries'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const groupId = parseInt(id)

  if (isNaN(groupId)) {
    return Response.json({ error: 'ID tidak valid' }, { status: 400 })
  }

  try {
    const group = await getAppGroupById(groupId)

    if (!group) {
      return Response.json({ error: 'Group tidak ditemukan' }, { status: 404 })
    }

    return Response.json({ group })
  } catch (error) {
    console.error('Get app group error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const groupId = parseInt(id)

  if (isNaN(groupId)) {
    return Response.json({ error: 'ID tidak valid' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { name, slug, title, description, logo_url, sort_order, is_active } = body

    if (!name || !slug || !title) {
      return Response.json({ error: 'Nama, slug, dan judul wajib diisi' }, { status: 400 })
    }

    const isHttpsUrl = (u: unknown) => typeof u === 'string' && u.startsWith('https://')
    if (logo_url !== undefined && logo_url && !isHttpsUrl(logo_url)) {
      return Response.json({ error: 'URL logo harus dimulai dengan https://' }, { status: 400 })
    }

    await updateAppGroup(groupId, { name, slug, title, description, logo_url, sort_order, is_active })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Update app group error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return Response.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const groupId = parseInt(id)

  if (isNaN(groupId)) {
    return Response.json({ error: 'ID tidak valid' }, { status: 400 })
  }

  try {
    await deleteAppGroup(groupId)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete app group error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return Response.json({ error: msg }, { status: 500 })
  }
}