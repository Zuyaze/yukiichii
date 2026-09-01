import { getDb, ensureSchema } from '@/lib/db'
import { auth } from '@/lib/auth'
import { getAllFeedbackCTA, createFeedbackCTA } from '@/lib/db/queries'

export async function GET() {
  try {
    const ctas = await getAllFeedbackCTA()
    return Response.json({ ctas })
  } catch (error) {
    console.error('Get feedback CTA error:', error)
    return Response.json({ ctas: [] })
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
    const { title, link_url, icon_url, is_active } = body

    if (!title || !link_url) {
      return Response.json({ error: 'Judul dan link wajib diisi' }, { status: 400 })
    }

    const isHttpsUrl = (u: unknown) => typeof u === 'string' && u.startsWith('https://')
    if (!isHttpsUrl(link_url)) {
      return Response.json({ error: 'Link harus dimulai dengan https://' }, { status: 400 })
    }
    if (icon_url && !isHttpsUrl(icon_url)) {
      return Response.json({ error: 'URL icon harus dimulai dengan https://' }, { status: 400 })
    }

    const id = await createFeedbackCTA({
      title,
      link_url,
      icon_url: icon_url ?? null,
      is_active: is_active ?? true,
    })

    return Response.json({ success: true, id })
  } catch (error) {
    console.error('Create feedback CTA error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return Response.json({ error: msg }, { status: 500 })
  }
}