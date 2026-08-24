import { getApps, getCategories } from '@/lib/db/queries'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  try {
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const apps = await getApps({ search, category, tag, limit, offset })
    
    return Response.json({ apps })
  } catch (error) {
    console.error('Get apps error:', error)
    return Response.json({ apps: [] })
  }
}