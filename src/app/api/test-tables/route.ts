import { getDb } from '@/lib/db'

export async function GET() {
  try {
    const db = getDb()
    
    const tables = await db.execute({
      sql: `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
    })
    
    const categories = await db.execute({
      sql: `SELECT * FROM categories`
    })
    
    const tags = await db.execute({
      sql: `SELECT * FROM tags`
    })
    
    const apps = await db.execute({
      sql: `SELECT * FROM apps`
    })
    
    return Response.json({ 
      success: true, 
      tables: tables.rows,
      categories: categories.rows,
      tags: tags.rows,
      apps: apps.rows
    })
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 })
  }
}