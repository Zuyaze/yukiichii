import { getDb } from '@/lib/db'

export async function GET() {
  try {
    const db = getDb()

    const tables = await db.execute({
      sql: "SELECT name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'",
    })

    const categories = await db.execute({ sql: 'SELECT * FROM categories' })
    const tags = await db.execute({ sql: 'SELECT * FROM tags' })
    const apps = await db.execute({ sql: 'SELECT * FROM apps' })

    return Response.json({
      success: true,
      tables: tables.rows,
      categoriesCount: categories.rows.length,
      tagsCount: tags.rows.length,
      appsCount: apps.rows.length,
    })
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}