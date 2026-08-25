import { getDb } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const sql = getDb()
    
    // Create tables using Neon SQL template literals (PostgreSQL syntax)
    await getDb()`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        color TEXT DEFAULT '#3b82f6',
        icon TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    await getDb()`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        color TEXT DEFAULT '#6b7280',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    await getDb()`
      CREATE TABLE IF NOT EXISTS apps (
        id SERIAL PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT,
        download_url TEXT NOT NULL,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    await getDb()`
      CREATE TABLE IF NOT EXISTS app_tags (
        app_id INTEGER NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
        tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (app_id, tag_id)
      )
    `
    
    await getDb()`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    await getDb()`
      CREATE TABLE IF NOT EXISTS clicks (
        id SERIAL PRIMARY KEY,
        app_id INTEGER NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
        referrer TEXT,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    await getDb()`
      CREATE INDEX IF NOT EXISTS idx_apps_category ON apps(category_id)
    `
    
    await getDb()`
      CREATE INDEX IF NOT EXISTS idx_apps_slug ON apps(slug)
    `
    
    await getDb()`
      CREATE INDEX IF NOT EXISTS idx_clicks_app ON clicks(app_id)
    `
    
    await getDb()`
      CREATE INDEX IF NOT EXISTS idx_clicks_created ON clicks(created_at)
    `
    
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
      await getDb()`
        INSERT INTO categories (name, slug, color, icon, sort_order)
        VALUES (${cat.name}, ${cat.slug}, ${cat.color}, ${cat.icon}, ${cat.sort_order})
        ON CONFLICT (slug) DO NOTHING
      `
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
      await getDb()`
        INSERT INTO tags (name, slug, color)
        VALUES (${tag.name}, ${tag.slug}, ${tag.color})
        ON CONFLICT (slug) DO NOTHING
      `
    }
    
    // Create default admin
    const adminEmail = 'admin@yukiichii.com'
    const adminPassword = 'yukiichii123'
    
    const existingAdmin = await getDb()`
      SELECT * FROM admins WHERE email = ${'admin@yukiichii.com'}
    `
    
    if (existingAdmin.length === 0) {
      const passwordHash = await bcrypt.hash('yukiichii123', 12)
      await getDb()`
        INSERT INTO admins (email, password_hash) VALUES (${adminEmail}, ${passwordHash})
      `
    }
    
    return Response.json({ success: true, message: 'Database seeded successfully' })
  } catch (error) {
    console.error('Seed error:', error)
    return Response.json({ success: false, error: String(error) }, { status: 500 })
  }
}