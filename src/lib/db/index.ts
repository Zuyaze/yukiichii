import { createClient } from '@libsql/client'

let db: ReturnType<typeof createClient> | null = null

function getEnv() {
  return {
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  }
}

function getClient() {
  if (db) return db
  
  const { url, authToken } = getEnv()
  
  if (!url || !authToken) {
    throw new Error('Database not initialized. Please set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables.')
  }
  
  db = createClient({ url, authToken })
  return db
}

export const getDb = () => getClient()

export async function initDb() {
  const database = getClient()
  await database.batch([
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
}

export type App = {
  id: number
  slug: string
  title: string
  description: string | null
  download_url: string
  category_id: number | null
  created_at: string
  updated_at: string
}

export type Category = {
  id: number
  name: string
  slug: string
  color: string
  icon: string | null
  sort_order: number
  created_at: string
}

export type Tag = {
  id: number
  name: string
  slug: string
  color: string
  created_at: string
}

export type Admin = {
  id: number
  email: string
  password_hash: string
  role: string
  created_at: string
}

export type Click = {
  id: number
  app_id: number
  referrer: string | null
  user_agent: string | null
  created_at: string
}

// Export db for backwards compatibility (will throw if accessed at build time)
export { db }