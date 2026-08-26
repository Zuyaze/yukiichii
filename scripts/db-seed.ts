import 'dotenv/config'
import { getDb } from '../src/lib/db'
import bcrypt from 'bcryptjs'

const db = getDb()

// Credentials from environment variables (never hardcode!)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@yukiichii.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'yukiichii123'

async function main() {
  console.log('Seeding database...')

  // Create default admin
  const existingAdmin = await db.execute({
    sql: `SELECT * FROM admins WHERE email = ?`,
    args: [ADMIN_EMAIL],
  })

  if (existingAdmin.rows.length === 0) {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12)
    await db.execute({
      sql: `INSERT INTO admins (email, password_hash) VALUES (?, ?)`,
      args: [ADMIN_EMAIL, passwordHash],
    })
    console.log(`Created admin: ${ADMIN_EMAIL}`)
  } else {
    console.log('Admin already exists')
  }

  // Create default categories
  const defaultCategories = [
    { name: 'Mod Apk', slug: 'mod-apk', color: '#2563eb', icon: '📱', sort_order: 1 },
    { name: 'Loader', slug: 'loader', color: '#f97316', icon: '🔑', sort_order: 2 },
  ]

  for (const cat of defaultCategories) {
    const existing = await db.execute({
      sql: `SELECT * FROM categories WHERE slug = ?`,
      args: [cat.slug],
    })
    if (existing.rows.length === 0) {
      await db.execute({
        sql: `INSERT INTO categories (name, slug, color, icon, sort_order) VALUES (?, ?, ?, ?, ?)`,
        args: [cat.name, cat.slug, cat.color, cat.icon, cat.sort_order],
      })
      console.log(`Created category: ${cat.name}`)
    }
  }

  // Create default tags
  const defaultTags = [
    { name: 'Gratis', slug: 'gratis', color: '#10b981' },
    { name: 'No Ads', slug: 'no-ads', color: '#06b6d4' },
    { name: 'Premium', slug: 'premium', color: '#8b5cf6' },
    { name: 'Anti Ban', slug: 'anti-ban', color: '#ef4444' },
    { name: 'Unlimited', slug: 'unlimited', color: '#f59e0b' },
    { name: 'Mod Menu', slug: 'mod-menu', color: '#ec4899' },
  ]

  for (const tag of defaultTags) {
    const existing = await db.execute({
      sql: `SELECT * FROM tags WHERE slug = ?`,
      args: [tag.slug],
    })
    if (existing.rows.length === 0) {
      await db.execute({
        sql: `INSERT INTO tags (name, slug, color) VALUES (?, ?, ?)`,
        args: [tag.name, tag.slug, tag.color],
      })
      console.log(`Created tag: ${tag.name}`)
    }
  }

  console.log('Seeding completed!')
}

main().catch(console.error)