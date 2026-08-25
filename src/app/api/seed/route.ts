import { getDb } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const db = getDb()
    
    // Create tables if not exist
    await db.batch([
      `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        color TEXT DEFAULT '#3b82f6',
        icon TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        color TEXT DEFAULT '#6b7280',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS apps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT,
        download_url TEXT NOT NULL,
        category_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )`,
      `CREATE TABLE IF NOT EXISTS app_tags (
        app_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (app_id, tag_id),
        FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS clicks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        app_id INTEGER NOT NULL,
        referrer TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE
      )`,
      `CREATE INDEX IF NOT EXISTS idx_apps_category ON apps(category_id)`,
      `CREATE INDEX IF NOT EXISTS idx_apps_slug ON apps(slug)`,
      `CREATE INDEX IF NOT EXISTS idx_clicks_app ON clicks(app_id)`,
      `CREATE INDEX IF NOT EXISTS idx_clicks_created ON clicks(created_at)`,
    ])

    // Seed categories
    const defaultCategories = [
      { name: 'Android', slug: 'android', color: '#10b981', icon: '📱', sort_order: 1 },
      { name: 'Windows', slug: 'windows', color: '#3b82f6', icon: '💻', sort_order: 2 },
      { name: 'Game', slug: 'game', color: '#f59e0b', icon: '🎮', sort_order: 3 },
      { name: 'Developer Tools', slug: 'dev', color: '#8b5cf6', icon: '⚙️', sort_order: 4 },
      { name: 'Multimedia', slug: 'multimedia', color: '#ec4899', icon: '🎬', sort_order: 5 },
      { name: 'Utilitas', slug: 'utilitas', color: '#6b7280', icon: '🔧', sort_order: 6 },
    ]

    for (const cat of defaultCategories) {
      try {
        await getDb().execute({
          sql: `INSERT OR IGNORE INTO categories (name, slug, color, icon, sort_order) VALUES (?, ?, ?, ?, ?)`,
          args: [cat.name, cat.slug, cat.color, cat.icon, cat.sort_order]
        })
      } catch (e) {
        console.log('Category error:', e)
      }
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
      try {
        await getDb().execute({
          sql: `INSERT OR IGNORE INTO tags (name, slug, color) VALUES (?, ?, ?)`,
          args: [tag.name, tag.slug, tag.color]
        })
      } catch (e) {
        console.log('Tag error:', e)
      }
    }

    // Create default admin
    const adminEmail = 'admin@yukiichii.com'
    const adminPassword = 'yukiichii123'
    
    const existingAdmin = await getDb().execute({
      sql: `SELECT * FROM admins WHERE email = ?`,
      args: [adminEmail]
    })

    if (existingAdmin.rows.length === 0) {
      const passwordHash = await require('bcryptjs').hash('yukiichii123', 12)
      await getDb().execute({
        sql: `INSERT INTO admins (email, password_hash) VALUES (?, ?)`,
        args: [adminEmail, passwordHash]
      })
    }

    return Response.json({ success: true, message: 'Database seeded successfully' })
  } catch (error) {
    console.error('Seed error:', error)
    return Response.json({ success: false, error: String(error) }, { status: 500 })
  }
}