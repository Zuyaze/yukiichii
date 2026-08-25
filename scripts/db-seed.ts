import 'dotenv/config'
import { getDb } from '../src/lib/db'
import bcrypt from 'bcryptjs'

const db = getDb()

async function main() {
  console.log('Seeding database...')

  // Create default admin
  const adminEmail = 'admin@yukiichii.com'
  const adminPassword = 'yukiichii123'

  const existingAdmin = await db.execute({
    sql: `SELECT * FROM admins WHERE email = ?`,
    args: [adminEmail],
  })

  if (existingAdmin.rows.length === 0) {
    const passwordHash = await bcrypt.hash(adminPassword, 12)
    await db.execute({
      sql: `INSERT INTO admins (email, password_hash) VALUES (?, ?)`,
      args: [adminEmail, passwordHash],
    })
    console.log(`Created admin: ${adminEmail} / ${adminPassword}`)
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
    { name: 'Open Source', slug: 'open-source', color: '#3b82f6' },
    { name: 'Offline', slug: 'offline', color: '#f59e0b' },
    { name: 'Ringan', slug: 'ringan', color: '#8b5cf6' },
    { name: 'Portable', slug: 'portable', color: '#ec4899' },
    { name: 'No Ads', slug: 'no-ads', color: '#06b6d4' },
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