import { getDb, ensureSchema } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const result = await getDb().execute({
      sql: 'SELECT * FROM categories ORDER BY sort_order ASC, name ASC',
    })
    return Response.json({ categories: result.rows })
  } catch (error) {
    console.error('Get categories error:', error)
    return Response.json({ categories: [] })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await ensureSchema()
    const { name, slug, color, sort_order } = await request.json()

    if (!name || !slug) {
      return Response.json({ error: 'Nama dan slug wajib diisi' }, { status: 400 })
    }

    // Auto-assign sort_order if not provided (max + 1)
    let finalSortOrder = sort_order
    if (finalSortOrder === undefined || finalSortOrder === null || finalSortOrder === '') {
      const maxResult = await getDb().execute({
        sql: 'SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM categories',
      })
      finalSortOrder = (maxResult.rows[0] as any)?.next_order ?? 0
    }

    const result = await getDb().execute({
      sql: `
        INSERT INTO categories (name, slug, color, sort_order)
        VALUES (?, ?, ?, ?)
        ON CONFLICT (slug) DO NOTHING
        RETURNING id
      `,
      args: [name, slug, color || '#3b82f6', finalSortOrder],
    })

    return Response.json({ success: true, id: (result.rows[0] as any)?.id ?? null })
  } catch (error) {
    console.error('Create category error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return Response.json({ error: msg }, { status: 500 })
  }
}