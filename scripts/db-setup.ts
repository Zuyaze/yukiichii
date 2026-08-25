import 'dotenv/config'
import { initDb, query } from '../src/lib/db/index'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('1. Creating tables...')
  await initDb()
  console.log('   Tables OK')

  console.log('2. Seeding categories...')
  const cats = [
    { name: 'Android', slug: 'android', color: '#10b981', icon: '📱', sort_order: 1 },
    { name: 'Windows', slug: 'windows', color: '#3b82f6', icon: '💻', sort_order: 2 },
    { name: 'Game', slug: 'game', color: '#f59e0b', icon: '🎮', sort_order: 3 },
    { name: 'Developer Tools', slug: 'dev', color: '#8b5cf6', icon: '⚙️', sort_order: 4 },
    { name: 'Multimedia', slug: 'multimedia', color: '#ec4899', icon: '🎬', sort_order: 5 },
    { name: 'Utilitas', slug: 'utilitas', color: '#6b7280', icon: '🔧', sort_order: 6 },
  ]
  for (const c of cats) {
    await query(
      `INSERT INTO categories (name, slug, color, icon, sort_order) VALUES (?, ?, ?, ?, ?) ON CONFLICT (slug) DO NOTHING`,
      [c.name, c.slug, c.color, c.icon, c.sort_order]
    )
  }
  const catCount = await query('SELECT COUNT(*) as n FROM categories')
  console.log('   Categories:', catCount.rows[0].n)

  console.log('3. Seeding tags...')
  const tags = [
    { name: 'Gratis', slug: 'gratis', color: '#10b981' },
    { name: 'Open Source', slug: 'open-source', color: '#3b82f6' },
    { name: 'Offline', slug: 'offline', color: '#f59e0b' },
    { name: 'Ringan', slug: 'ringan', color: '#8b5cf6' },
    { name: 'Portable', slug: 'portable', color: '#ec4899' },
    { name: 'No Ads', slug: 'no-ads', color: '#06b6d4' },
  ]
  for (const t of tags) {
    await query(
      `INSERT INTO tags (name, slug, color) VALUES (?, ?, ?) ON CONFLICT (slug) DO NOTHING`,
      [t.name, t.slug, t.color]
    )
  }
  const tagCount = await query('SELECT COUNT(*) as n FROM tags')
  console.log('   Tags:', tagCount.rows[0].n)

  console.log('4. Creating admin...')
  const existing = await query('SELECT id FROM admins WHERE email = ?', ['admin@yukiichii.com'])
  if ((existing.rows as any[]).length === 0) {
    const hash = await bcrypt.hash('yukiichii123', 12)
    await query('INSERT INTO admins (email, password_hash) VALUES (?, ?)', [
      'admin@yukiichii.com',
      hash,
    ])
    console.log('   Admin created')
  } else {
    console.log('   Admin exists')
  }

  console.log('\nALL DONE!')
}

main().catch(e => {
  console.error('ERROR:', e instanceof Error ? e.message : e)
  process.exit(1)
})