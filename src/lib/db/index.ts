import { Pool } from 'pg'

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined
}

function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'Database not initialized. Please set DATABASE_URL environment variable.'
    )
  }
  // Reuse pool across serverless invocations
  if (!global.__pgPool) {
    global.__pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
    })
  }
  return global.__pgPool
}

function convertPlaceholders(query: string): string {
  let i = 0
  return query.replace(/\?/g, () => `$${++i}`)
}

export interface DbClient {
  execute(args: { sql: string; args?: any[] }): Promise<{ rows: any[] }>
}

export const getDb = (): DbClient => {
  const pool = getPool()

  return {
    async execute({ sql: text, args = [] }: { sql: string; args?: any[] }) {
      const converted = convertPlaceholders(text)
      const result = await pool.query(converted, args)
      return { rows: result.rows }
    },
  }
}

export type QueryResult<T = any> = { rows: T[] }

/** Raw parameterized query helper */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const pool = getPool()
  const converted = convertPlaceholders(text)
  const result = await pool.query(converted, params ?? [])
  return { rows: result.rows as T[] }
}

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#3b82f6',
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#6b7280',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS apps (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    download_url TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    screenshots JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  // Migration for existing databases
  `ALTER TABLE apps ADD COLUMN IF NOT EXISTS screenshots JSONB NOT NULL DEFAULT '[]'::jsonb`,
  `CREATE TABLE IF NOT EXISTS app_tags (
    app_id INTEGER NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (app_id, tag_id)
  )`,
  `CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS clicks (
    id SERIAL PRIMARY KEY,
    app_id INTEGER NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    referrer TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_apps_category ON apps(category_id)`,
  `CREATE INDEX IF NOT EXISTS idx_apps_slug ON apps(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_clicks_app ON clicks(app_id)`,
  `CREATE INDEX IF NOT EXISTS idx_clicks_created ON clicks(created_at)`,
]

export async function initDb() {
  const pool = getPool()
  for (const statement of SCHEMA_STATEMENTS) {
    await pool.query(statement)
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __schemaReady: boolean | undefined
}

/**
 * Idempotent schema migration - runs once per serverless instance.
 * Safe to call before any write operation.
 */
export async function ensureSchema(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'Database not initialized. Please set DATABASE_URL environment variable.'
    )
  }
  if (global.__schemaReady) return

  const pool = getPool()
  for (const statement of SCHEMA_STATEMENTS) {
    await pool.query(statement)
  }
  global.__schemaReady = true
}

export type App = {
  id: number
  slug: string
  title: string
  description: string | null
  download_url: string
  category_id: number | null
  screenshots: string[] | null
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