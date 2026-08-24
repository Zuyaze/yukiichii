import { getCategories } from '@/lib/db/queries'

export async function GET() {
  try {
    const categories = await getCategories()
    return Response.json({ categories })
  } catch (error) {
    console.error('Get categories error:', error)
    return Response.json({ categories: [] })
  }
}