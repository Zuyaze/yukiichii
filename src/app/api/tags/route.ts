import { getDb, ensureSchema } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const result = await getDb().execute({
      sql: 'SELECT * FROM tags ORDER BY name ASC',
    })
    return Response.json({ tags: result.rows })
  } catch (error) {
    console.error('Get tags error:', error)
    return Response.json({ tags: [] })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await ensureSchema()
    const { name, slug, color } = await request.json()

    if (!name || !slug) {
      return Response.json({ error: 'Nama dan slug wajib diisi' }, { status: 400 })
    }

    const result = await getDb().execute({
      sql: `
        INSERT INTO tags (name, slug, color)
        VALUES (?, ?, ?)
        ON CONFLICT (slug) DO NOTHING
        RETURNING id
      `,
      args: [name, slug, color || '#6b7280'],
    })

    return Response.json({ success: true, id: (result.rows[0] as any)?.id ?? null })
  } catch (error) {
    console.error('Create tag error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return Response.json({ error: msg }, { status: 500 })
  }
}