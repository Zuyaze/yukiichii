import { getTags } from '@/lib/db/queries'

export async function GET() {
  try {
    const tags = await getTags()
    return Response.json({ tags })
  } catch (error) {
    console.error('Get tags error:', error)
    return Response.json({ tags: [] })
  }
}