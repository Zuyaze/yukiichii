import { recordClick } from '@/lib/db/queries'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const referrer = request.headers.get('referer')
  const userAgent = request.headers.get('user-agent')

  try {
    await recordClick(parseInt(id), referrer, userAgent)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Track click error:', error)
    return Response.json({ error: 'Gagal mencatat klik' }, { status: 500 })
  }
}