import { getDb } from './index'
import type { App, Category, Tag, Admin, Click } from './index'

export async function getApps(options?: {
  category?: string
  tag?: string
  search?: string
  limit?: number
  offset?: number
}): Promise<App[]> {
  const db = getDb()
  let sql = `
    SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color
    FROM apps a
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE 1=1
  `
  const params: (string | number)[] = []

  if (options?.category) {
    sql += ` AND c.slug = ?`
    params.push(options.category)
  }

  if (options?.tag) {
    sql += ` AND a.id IN (SELECT app_id FROM app_tags WHERE tag_id = (SELECT id FROM tags WHERE slug = ?))`
    params.push(options.tag)
  }

  if (options?.search) {
    sql += ` AND (a.title ILIKE ? OR a.description ILIKE ?)`
    params.push(`%${options.search}%`, `%${options.search}%`)
  }

  sql += ` ORDER BY a.created_at DESC`

  const hasLimit = typeof options?.limit === 'number'
  const hasOffset = typeof options?.offset === 'number'
  if (hasLimit) {
    sql += ` LIMIT ?`
  }
  if (hasOffset) {
    sql += ` OFFSET ?`
  }

  if (hasLimit) params.push(options!.limit!)
  if (hasOffset) params.push(options!.offset!)

  const result = await db.execute({ sql, args: params })
  return result.rows as unknown as App[]
}

export async function getAppBySlug(
  slug: string
): Promise<(App & { category_name: string; category_slug: string; category_color: string; tags: Tag[] }) | null> {
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

  const app = appResult.rows[0] as unknown as App & {
    category_name: string
    category_slug: string
    category_color: string
  }

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
  const result = await getDb().execute({
    sql: 'SELECT * FROM categories ORDER BY sort_order ASC, name ASC',
  })
  return result.rows as unknown as Category[]
}

export async function getTags(): Promise<Tag[]> {
  const result = await getDb().execute({
    sql: 'SELECT * FROM tags ORDER BY name ASC',
  })
  return result.rows as unknown as Tag[]
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const result = await getDb().execute({
    sql: 'SELECT * FROM categories WHERE slug = ?',
    args: [slug],
  })
  return (result.rows[0] as unknown as Category) || null
}

export async function getAdminByEmail(email: string): Promise<Admin | null> {
  const result = await getDb().execute({
    sql: 'SELECT * FROM admins WHERE email = ?',
    args: [email],
  })
  return (result.rows[0] as unknown as Admin) || null
}

export async function createAdmin(email: string, passwordHash: string): Promise<number> {
  const result = await getDb().execute({
    sql: 'INSERT INTO admins (email, password_hash) VALUES (?, ?) RETURNING id',
    args: [email, passwordHash],
  })
  return (result.rows[0] as any).id as number
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
      RETURNING id
    `,
    args: [data.slug, data.title, data.description, data.download_url, data.category_id],
  })
  const appId = (result.rows[0] as any).id as number

  for (const tagId of data.tag_ids) {
    await db.execute({
      sql: 'INSERT INTO app_tags (app_id, tag_id) VALUES (?, ?)',
      args: [appId, tagId],
    })
  }

  return appId
}

export async function updateApp(
  id: number,
  data: {
    slug: string
    title: string
    description: string | null
    download_url: string
    category_id: number | null
    tag_ids: number[]
  }
): Promise<void> {
  const db = getDb()
  await db.execute({
    sql: `
      UPDATE apps SET slug = ?, title = ?, description = ?, download_url = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    args: [data.slug, data.title, data.description, data.download_url, data.category_id, id],
  })

  await db.execute({ sql: 'DELETE FROM app_tags WHERE app_id = ?', args: [id] })

  for (const tagId of data.tag_ids) {
    await db.execute({
      sql: 'INSERT INTO app_tags (app_id, tag_id) VALUES (?, ?)',
      args: [id, tagId],
    })
  }
}

export async function deleteApp(id: number): Promise<void> {
  await getDb().execute({ sql: 'DELETE FROM apps WHERE id = ?', args: [id] })
}

export async function createCategory(data: {
  name: string
  slug: string
  color: string
  icon: string | null
  sort_order: number
}): Promise<number> {
  const result = await getDb().execute({
    sql: 'INSERT INTO categories (name, slug, color, icon, sort_order) VALUES (?, ?, ?, ?, ?) RETURNING id',
    args: [data.name, data.slug, data.color, data.icon, data.sort_order],
  })
  return (result.rows[0] as any).id as number
}

export async function updateCategory(
  id: number,
  data: { name: string; slug: string; color: string; icon: string | null; sort_order: number }
): Promise<void> {
  await getDb().execute({
    sql: 'UPDATE categories SET name = ?, slug = ?, color = ?, icon = ?, sort_order = ? WHERE id = ?',
    args: [data.name, data.slug, data.color, data.icon, data.sort_order, id],
  })
}

export async function deleteCategory(id: number): Promise<void> {
  await getDb().execute({ sql: 'DELETE FROM categories WHERE id = ?', args: [id] })
}

export async function createTag(data: { name: string; slug: string; color: string }): Promise<number> {
  const result = await getDb().execute({
    sql: 'INSERT INTO tags (name, slug, color) VALUES (?, ?, ?) RETURNING id',
    args: [data.name, data.slug, data.color],
  })
  return (result.rows[0] as any).id as number
}

export async function updateTag(id: number, data: { name: string; slug: string; color: string }): Promise<void> {
  await getDb().execute({
    sql: 'UPDATE tags SET name = ?, slug = ?, color = ? WHERE id = ?',
    args: [data.name, data.slug, data.color, id],
  })
}

export async function deleteTag(id: number): Promise<void> {
  await getDb().execute({ sql: 'DELETE FROM tags WHERE id = ?', args: [id] })
}

export async function recordClick(appId: number, referrer: string | null, userAgent: string | null): Promise<void> {
  await getDb().execute({
    sql: 'INSERT INTO clicks (app_id, referrer, user_agent) VALUES (?, ?, ?)',
    args: [appId, referrer, userAgent],
  })
}

export async function getClickStats(appId?: number): Promise<{ app_id: number; count: number }[]> {
  if (appId) {
    const result = await getDb().execute({
      sql: 'SELECT app_id, COUNT(*) as count FROM clicks WHERE app_id = ? GROUP BY app_id ORDER BY count DESC',
      args: [appId],
    })
    return result.rows as unknown as { app_id: number; count: number }[]
  }

  const result = await getDb().execute({
    sql: 'SELECT app_id, COUNT(*) as count FROM clicks GROUP BY app_id ORDER BY count DESC',
  })
  return result.rows as unknown as { app_id: number; count: number }[]
}

export async function getAllAppsWithStats(): Promise<
  (App & { click_count: number; category_name: string })[]
> {
  const result = await getDb().execute({
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

export async function getAppById(
  id: number
): Promise<(App & { category_name: string; category_slug: string; category_color: string; tags: Tag[] }) | null> {
  const db = getDb()

  const appResult = await db.execute({
    sql: `
      SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color
      FROM apps a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.id = ?
    `,
    args: [id],
  })

  if (appResult.rows.length === 0) return null

  const app = appResult.rows[0] as unknown as App & {
    category_name: string
    category_slug: string
    category_color: string
  }

  const tagsResult = await db.execute({
    sql: 'SELECT t.* FROM tags t JOIN app_tags at ON t.id = at.tag_id WHERE at.app_id = ?',
    args: [app.id],
  })

  return { ...app, tags: tagsResult.rows as unknown as Tag[] }
}
