import { getAppById, recordClick } from '@/lib/db/queries'
import { redirect } from 'next/navigation'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const referrer = request.headers.get('referer')
  const userAgent = request.headers.get('user-agent')

  try {
    const app = await getAppById(parseInt(id))
    if (!app) {
      return Response.json({ error: 'Aplikasi tidak ditemukan' }, { status: 404 })
    }

    await recordClick(parseInt(id), referrer, userAgent)
    redirect(app.download_url)
  } catch (error) {
    console.error('Download tracking error:', error)
    return Response.json({ error: 'Gagal memproses download' }, { status: 500 })
  }
}