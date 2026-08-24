import { getDb } from './index'
import type { App, Category, Tag, Admin, Click } from './index'

function toNumber(id: bigint | number | undefined): number {
  if (typeof id === 'bigint') return Number(id)
  if (typeof id === 'number') return id
  return 0
}

export async function getApps(options?: {
  category?: string
  tag?: string
  search?: string
  limit?: number
  offset?: number
}): Promise<App[]> {
  const db = getDb()
  let query = `
    SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color
    FROM apps a
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE 1=1
  `
  const params: (string | number)[] = []

  if (options?.category) {
    query += ` AND c.slug = ?`
    params.push(options.category)
  }

  if (options?.tag) {
    query += ` AND a.id IN (SELECT app_id FROM app_tags WHERE tag_id = (SELECT id FROM tags WHERE slug = ?))`
    params.push(options.tag)
  }

  if (options?.search) {
    query += ` AND (a.title LIKE ? OR a.description LIKE ?)`
    params.push(`%${options.search}%`, `%${options.search}%`)
  }

  query += ` ORDER BY a.created_at DESC`

  if (options?.limit) {
    query += ` LIMIT ?`
    params.push(options.limit)
  }

  if (options?.offset) {
    query += ` OFFSET ?`
    params.push(options.offset)
  }

  const result = await db.execute({ sql: query, args: params })
  return result.rows as unknown as App[]
}

export async function getAppBySlug(slug: string): Promise<(App & { category_name: string; category_slug: string; category_color: string; tags: Tag[] }) | null> {
  const db = getDb()
  const appResult = await db.execute({
    sql: `
      SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color
      FROM apps a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.slug = ?
    `,
    args: [slug],
  })

  if (appResult.rows.length === 0) return null

  const app = appResult.rows[0] as unknown as App & { category_name: string; category_slug: string; category_color: string }

  const tagsResult = await db.execute({
    sql: `
      SELECT t.* FROM tags t
      JOIN app_tags at ON t.id = at.tag_id
      WHERE at.app_id = ?
    `,
    args: [app.id],
  })

  return { ...app, tags: tagsResult.rows as unknown as Tag[] }
}

export async function getCategories(): Promise<Category[]> {
  const db = getDb()
  const result = await db.execute({
    sql: `SELECT * FROM categories ORDER BY sort_order ASC, name ASC`,
  })
  return result.rows as unknown as Category[]
}

export async function getTags(): Promise<Tag[]> {
  const db = getDb()
  const result = await db.execute({
    sql: `SELECT * FROM tags ORDER BY name ASC`,
  })
  return result.rows as unknown as Tag[]
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const db = getDb()
  const result = await db.execute({
    sql: `SELECT * FROM categories WHERE slug = ?`,
    args: [slug],
  })
  return (result.rows[0] as unknown as Category) || null
}

export async function getAdminByEmail(email: string): Promise<Admin | null> {
  const db = getDb()
  const result = await db.execute({
    sql: `SELECT * FROM admins WHERE email = ?`,
    args: [email],
  })
  return (result.rows[0] as unknown as Admin) || null
}

export async function createAdmin(email: string, passwordHash: string): Promise<number> {
  const db = getDb()
  const result = await db.execute({
    sql: `INSERT INTO admins (email, password_hash) VALUES (?, ?)`,
    args: [email, passwordHash],
  })
  return toNumber(result.lastInsertRowid)
}

export async function createApp(data: {
  slug: string
  title: string
  description: string | null
  download_url: string
  category_id: number | null
  tag_ids: number[]
}): Promise<number> {
  const db = getDb()
  const result = await db.execute({
    sql: `
      INSERT INTO apps (slug, title, description, download_url, category_id)
      VALUES (?, ?, ?, ?, ?)
    `,
    args: [data.slug, data.title, data.description, data.download_url, data.category_id],
  })
  const appId = toNumber(result.lastInsertRowid)

  if (data.tag_ids.length > 0) {
    const queries = data.tag_ids.map(tagId => ({
      sql: `INSERT INTO app_tags (app_id, tag_id) VALUES (?, ?)`,
      args: [appId, tagId],
    }))
    for (const q of queries) {
      await db.execute(q)
    }
  }

  return appId
}

export async function updateApp(id: number, data: {
  slug: string
  title: string
  description: string | null
  download_url: string
  category_id: number | null
  tag_ids: number[]
}): Promise<void> {
  const db = getDb()
  await db.execute({
    sql: `
      UPDATE apps SET slug = ?, title = ?, description = ?, download_url = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    args: [data.slug, data.title, data.description, data.download_url, data.category_id, id],
  })

  await db.execute({ sql: `DELETE FROM app_tags WHERE app_id = ?`, args: [id] })

  if (data.tag_ids.length > 0) {
    const queries = data.tag_ids.map(tagId => ({
      sql: `INSERT INTO app_tags (app_id, tag_id) VALUES (?, ?)`,
      args: [id, tagId],
    }))
    for (const q of queries) {
      await db.execute(q)
    }
  }
}

export async function deleteApp(id: number): Promise<void> {
  const db = getDb()
  await db.execute({ sql: `DELETE FROM apps WHERE id = ?`, args: [id] })
}

export async function createCategory(data: { name: string; slug: string; color: string; icon: string | null; sort_order: number }): Promise<number> {
  const db = getDb()
  const result = await db.execute({
    sql: `INSERT INTO categories (name, slug, color, icon, sort_order) VALUES (?, ?, ?, ?, ?)`,
    args: [data.name, data.slug, data.color, data.icon, data.sort_order],
  })
  return toNumber(result.lastInsertRowid)
}

export async function updateCategory(id: number, data: { name: string; slug: string; color: string; icon: string | null; sort_order: number }): Promise<void> {
  const db = getDb()
  await db.execute({
    sql: `UPDATE categories SET name = ?, slug = ?, color = ?, icon = ?, sort_order = ? WHERE id = ?`,
    args: [data.name, data.slug, data.color, data.icon, data.sort_order, id],
  })
}

export async function deleteCategory(id: number): Promise<void> {
  const db = getDb()
  await db.execute({ sql: `DELETE FROM categories WHERE id = ?`, args: [id] })
}

export async function createTag(data: { name: string; slug: string; color: string }): Promise<number> {
  const db = getDb()
  const result = await db.execute({
    sql: `INSERT INTO tags (name, slug, color) VALUES (?, ?, ?)`,
    args: [data.name, data.slug, data.color],
  })
  return toNumber(result.lastInsertRowid)
}

export async function updateTag(id: number, data: { name: string; slug: string; color: string }): Promise<void> {
  const db = getDb()
  await db.execute({
    sql: `UPDATE tags SET name = ?, slug = ?, color = ? WHERE id = ?`,
    args: [data.name, data.slug, data.color, id],
  })
}

export async function deleteTag(id: number): Promise<void> {
  const db = getDb()
  await db.execute({ sql: `DELETE FROM tags WHERE id = ?`, args: [id] })
}

export async function recordClick(appId: number, referrer: string | null, userAgent: string | null): Promise<void> {
  const db = getDb()
  await db.execute({
    sql: `INSERT INTO clicks (app_id, referrer, user_agent) VALUES (?, ?, ?)`,
    args: [appId, referrer, userAgent],
  })
}

export async function getClickStats(appId?: number): Promise<{ app_id: number; count: number }[]> {
  const db = getDb()
  let query = `SELECT app_id, COUNT(*) as count FROM clicks`
  const params: (string | number)[] = []

  if (appId) {
    query += ` WHERE app_id = ?`
    params.push(appId)
  }

  query += ` GROUP BY app_id ORDER BY count DESC`

  const result = await db.execute({ sql: query, args: params })
  return result.rows as unknown as { app_id: number; count: number }[]
}

export async function getAllAppsWithStats(): Promise<(App & { click_count: number; category_name: string })[]> {
  const db = getDb()
  const result = await db.execute({
    sql: `
      SELECT a.*, c.name as category_name, COALESCE(cl.click_count, 0) as click_count
      FROM apps a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN (
        SELECT app_id, COUNT(*) as click_count FROM clicks GROUP BY app_id
      ) cl ON a.id = cl.app_id
      ORDER BY a.created_at DESC
    `,
  })
  return result.rows as unknown as (App & { click_count: number; category_name: string })[]
}