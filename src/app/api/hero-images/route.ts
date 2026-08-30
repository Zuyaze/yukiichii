import { getDb, ensureSchema } from '@/lib/db'
import { auth } from '@/lib/auth'
import { createHeroImage, getAllHeroImages } from '@/lib/db/queries'

export async function GET() {
  try {
    const heroImages = await getAllHeroImages()
    return Response.json({ heroImages })
  } catch (error) {
    console.error('Get hero images error:', error)
    return Response.json({ heroImages: [] })
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
    const { image_url, alt_text, sort_order, is_active } = body

    if (!image_url) {
      return Response.json({ error: 'URL gambar wajib diisi' }, { status: 400 })
    }

    const isHttpsUrl = (u: unknown) => typeof u === 'string' && u.startsWith('https://')
    if (!isHttpsUrl(image_url)) {
      return Response.json({ error: 'URL gambar harus dimulai dengan https://' }, { status: 400 })
    }

    // Auto-assign sort_order if not provided
    let finalSortOrder = sort_order
    if (finalSortOrder === undefined || finalSortOrder === null || finalSortOrder === '') {
      const maxResult = await getDb().execute({
        sql: 'SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM hero_images',
      })
      finalSortOrder = (maxResult.rows[0] as any)?.next_order ?? 0
    }

    const id = await createHeroImage({
      image_url,
      alt_text: alt_text ?? null,
      sort_order: finalSortOrder,
      is_active: is_active ?? true,
    })

    return Response.json({ success: true, id })
  } catch (error) {
    console.error('Create hero image error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return Response.json({ error: msg }, { status: 500 })
  }
}