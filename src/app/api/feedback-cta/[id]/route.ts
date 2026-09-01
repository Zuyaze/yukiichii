import { getDb, ensureSchema } from '@/lib/db'
import { auth } from '@/lib/auth'
import { getFeedbackCTAById, updateFeedbackCTA, deleteFeedbackCTA } from '@/lib/db/queries'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const cta = await getFeedbackCTAById(parseInt(id))
    if (!cta) {
      return Response.json({ error: 'CTA tidak ditemukan' }, { status: 404 })
    }
    return Response.json({ cta })
  } catch (error) {
    console.error('Get feedback CTA error:', error)
    return Response.json({ error: 'Gagal mengambil CTA' }, { status: 500 })
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

  try {
    await ensureSchema()
    const body = await request.json()
    const { title, link_url, icon_url, is_active, sort_order } = body

    if (title !== undefined && !title) {
      return Response.json({ error: 'Judul wajib diisi' }, { status: 400 })
    }
    if (link_url !== undefined && !link_url) {
      return Response.json({ error: 'Link wajib diisi' }, { status: 400 })
    }

    const isHttpsUrl = (u: unknown) => typeof u === 'string' && u.startsWith('https://')
    const isBlobUrl = (u: unknown) => typeof u === 'string' && u.startsWith('blob:')
    if (link_url !== undefined && !isHttpsUrl(link_url)) {
      return Response.json({ error: 'Link harus dimulai dengan https://' }, { status: 400 })
    }
    if (icon_url !== undefined && icon_url && !isHttpsUrl(icon_url) && !isBlobUrl(icon_url)) {
      return Response.json({ error: 'URL icon harus dimulai dengan https:// atau upload file' }, { status: 400 })
    }

    await updateFeedbackCTA(parseInt(id), {
      title,
      link_url,
      icon_url,
      is_active,
      sort_order,
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Update feedback CTA error:', error)
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

  try {
    await deleteFeedbackCTA(parseInt(id))
    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete feedback CTA error:', error)
    return Response.json({ error: 'Gagal menghapus CTA' }, { status: 500 })
  }
}