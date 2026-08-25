import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

// Create Neon HTTP client
const sql = neon(process.env.DATABASE_URL!)

export const getDb = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('Database not initialized. Please set DATABASE_URL environment variable.')
  }
  return neon(process.env.DATABASE_URL!)
}

export const db = neon(process.env.DATABASE_URL!)

export async function initDb() {
  const sql = neon(process.env.DATABASE_URL!)
  
  await sql`
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
  
  await sql`
    CREATE TABLE IF NOT EXISTS tags (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      color TEXT DEFAULT '#6b7280',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `
  
  await sql`
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
  
  await sql`
    CREATE TABLE IF NOT EXISTS app_tags (
      app_id INTEGER NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (app_id, tag_id)
    )
  `
  
  await sql`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `
  
  await sql`
    CREATE TABLE IF NOT EXISTS clicks (
      id SERIAL PRIMARY KEY,
      app_id INTEGER NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
      referrer TEXT,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `
  
  await sql`
    CREATE INDEX IF NOT EXISTS idx_apps_category ON apps(category_id)
  `
  
  await sql`
    CREATE INDEX IF NOT EXISTS idx_apps_slug ON apps(slug)
  `
  
  await sql`
    CREATE INDEX IF NOT EXISTS idx_clicks_app ON clicks(app_id)
  `
  
  await sql`
    CREATE INDEX IF NOT EXISTS idx_clicks_created ON clicks(created_at)
  `
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

export { neon } from '@neondatabase/serverless'