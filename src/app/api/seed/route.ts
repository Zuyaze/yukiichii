import { getDb, initDb } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const db = getDb()

    // Create tables
    await initDb()

    // Seed categories
    const defaultCategories = [
      { name: 'Mod Apk', slug: 'mod-apk', color: '#2563eb', icon: '📱', sort_order: 1 },
      { name: 'Loader', slug: 'loader', color: '#f97316', icon: '🔑', sort_order: 2 },
    ]

    for (const cat of defaultCategories) {
      await db.execute({
        sql: `
          INSERT INTO categories (name, slug, color, icon, sort_order)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT (slug) DO NOTHING
        `,
        args: [cat.name, cat.slug, cat.color, cat.icon, cat.sort_order],
      })
    }

    // Seed tags
    const defaultTags = [
      { name: 'Gratis', slug: 'gratis', color: '#10b981' },
      { name: 'Open Source', slug: 'open-source', color: '#3b82f6' },
      { name: 'Offline', slug: 'offline', color: '#f59e0b' },
      { name: 'Ringan', slug: 'ringan', color: '#8b5cf6' },
      { name: 'Portable', slug: 'portable', color: '#ec4899' },
      { name: 'No Ads', slug: 'no-ads', color: '#06b6d4' },
    ]

    for (const tag of defaultTags) {
      await db.execute({
        sql: `
          INSERT INTO tags (name, slug, color)
          VALUES (?, ?, ?)
          ON CONFLICT (slug) DO NOTHING
        `,
        args: [tag.name, tag.slug, tag.color],
      })
    }

    // Create default admin (only if no admin exists)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@yukiichii.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe2026!'

    const existing = await db.execute({
      sql: 'SELECT id FROM admins WHERE email = ?',
      args: [adminEmail],
    })

    if (existing.rows.length === 0) {
      const bcrypt = await import('bcryptjs')
      const passwordHash = await bcrypt.hash(adminPassword, 12)
      await db.execute({
        sql: 'INSERT INTO admins (email, password_hash) VALUES (?, ?)',
        args: [adminEmail, passwordHash],
      })
    }

    return Response.json({ success: true, message: 'Database seeded successfully' })
  } catch (error) {
    console.error('Seed error:', error)
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}