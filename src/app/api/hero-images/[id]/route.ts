import { auth } from '@/lib/auth'
import { updateHeroImage, deleteHeroImage, getHeroImageById } from '@/lib/db/queries'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const imageId = parseInt(id)

  if (isNaN(imageId)) {
    return Response.json({ error: 'ID tidak valid' }, { status: 400 })
  }

  try {
    const heroImage = await getHeroImageById(imageId)

    if (!heroImage) {
      return Response.json({ error: 'Gambar tidak ditemukan' }, { status: 404 })
    }

    return Response.json({ heroImage })
  } catch (error) {
    console.error('Get hero image error:', error)
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
  const imageId = parseInt(id)

  if (isNaN(imageId)) {
    return Response.json({ error: 'ID tidak valid' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { image_url, alt_text, sort_order, is_active } = body

    if (image_url !== undefined) {
      const isHttpsUrl = (u: unknown) => typeof u === 'string' && u.startsWith('https://')
      if (!isHttpsUrl(image_url)) {
        return Response.json({ error: 'URL gambar harus dimulai dengan https://' }, { status: 400 })
      }
    }

    await updateHeroImage(imageId, { image_url, alt_text, sort_order, is_active })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Update hero image error:', error)
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
  const imageId = parseInt(id)

  if (isNaN(imageId)) {
    return Response.json({ error: 'ID tidak valid' }, { status: 400 })
  }

  try {
    await deleteHeroImage(imageId)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete hero image error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return Response.json({ error: msg }, { status: 500 })
  }
}