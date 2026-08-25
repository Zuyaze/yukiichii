import { getDb } from './index'
import type { App, Category, Tag, Admin, Click } from './index'

export async function getApps(options?: {
  category?: string
  tag?: string
  search?: string
  limit?: number
  offset?: number
}): Promise<App[]> {
  const sql = getDb()
  let query = `
    SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color
    FROM apps a
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE 1=1
  `
  const params: (string | number)[] = []

  if (options?.category) {
    query += ` AND c.slug = $${params.length + 1}`
    params.push(options.category)
  }

  if (options?.tag) {
    query += ` AND a.id IN (SELECT app_id FROM app_tags WHERE tag_id = (SELECT id FROM tags WHERE slug = $${params.length + 1}))`
    params.push(options.tag)
  }

  if (options?.search) {
    query += ` AND (a.title LIKE $${params.length + 1} OR a.description LIKE $${params.length + 2})`
    params.push(`%${options.search}%`, `%${options.search}%`)
  }

  query += ` ORDER BY a.created_at DESC`

  if (options?.limit) {
    query += ` LIMIT $${params.length + 1}`
    params.push(options.limit)
  }

  if (options?.offset) {
    query += ` OFFSET $${params.length + 1}`
    params.push(options.offset)
  }

  const result = await getDb()(query, params)
  return result.rows as unknown as App[]
}

export async function getAppBySlug(slug: string): Promise<(App & { category_name: string; category_slug: string; category_color: string; tags: Tag[] }) | null> {
  const sql = getDb()
  const appResult = await sql`
    SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color
    FROM apps a
    LEFT JOIN categories c ON a.category_id = c.id
    WHERE a.slug = ${slug}
  `

  if (appResult.length === 0) return null

  const app = appResult[0] as unknown as App & { category_name: string; category_slug: string; category_color: string }

  const tagsResult = await sql`
    SELECT t.* FROM tags t
    JOIN app_tags at ON t.id = at.tag_id
    WHERE at.app_id = ${app.id}
  `

  return { ...app, tags: tagsResult as unknown as Tag[] }
}

export async function getCategories(): Promise<Category[]> {
  const result = await getDb()`
    SELECT * FROM categories ORDER BY sort_order ASC, name ASC
  `
  return result as unknown as Category[]
}

export async function getTags(): Promise<Tag[]> {
  const result = await getDb()`
    SELECT * FROM tags ORDER BY name ASC
  `
  return result as unknown as Tag[]
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const result = await getDb()`
    SELECT * FROM categories WHERE slug = ${slug}
  `
  return (result[0] as unknown as Category) || null
}

export async function getAdminByEmail(email: string): Promise<Admin | null> {
  const result = await getDb()`
    SELECT * FROM admins WHERE email = ${email}
  `
  return (result[0] as unknown as Admin) || null
}

export async function createAdmin(email: string, passwordHash: string): Promise<number> {
  const result = await getDb()`
    INSERT INTO admins (email, password_hash) VALUES (${email}, ${passwordHash})
    RETURNING id
  `
  return result[0].id as number
}

export async function createApp(data: {
  slug: string
  title: string
  description: string | null
  download_url: string
  category_id: number | null
  tag_ids: number[]
}): Promise<number> {
  const sql = getDb()
  const result = await sql`
    INSERT INTO apps (slug, title, description, download_url, category_id)
    VALUES (${data.slug}, ${data.title}, ${data.description}, ${data.download_url}, ${data.category_id})
    RETURNING id
  `
  const appId = result[0].id as number

  if (data.tag_ids.length > 0) {
    for (const tagId of data.tag_ids) {
      await sql`INSERT INTO app_tags (app_id, tag_id) VALUES (${appId}, ${tagId})`
    }
  }

  return result[0].id as number
}

export async function updateApp(id: number, data: {
  slug: string
  title: string
  description: string | null
  download_url: string
  category_id: number | null
  tag_ids: number[]
}): Promise<void> {
  const sql = getDb()
  await sql`
    UPDATE apps SET slug = ${data.slug}, title = ${data.title}, description = ${data.description}, download_url = ${data.download_url}, category_id = ${data.category_id}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
  `

  await sql`DELETE FROM app_tags WHERE app_id = ${id}`

  if (data.tag_ids.length > 0) {
    for (const tagId of data.tag_ids) {
      await sql`INSERT INTO app_tags (app_id, tag_id) VALUES (${id}, ${tagId})`
    }
  }
}

export async function deleteApp(id: number): Promise<void> {
  await getDb()`
    DELETE FROM apps WHERE id = ${id}
  `
}

export async function createCategory(data: { name: string; slug: string; color: string; icon: string | null; sort_order: number }): Promise<number> {
  const result = await getDb()`
    INSERT INTO categories (name, slug, color, icon, sort_order) VALUES (${data.name}, ${data.slug}, ${data.color}, ${data.icon}, ${data.sort_order})
    RETURNING id
  `
  return result[0].id as number
}

export async function updateCategory(id: number, data: { name: string; slug: string; color: string; icon: string | null; sort_order: number }): Promise<void> {
  await getDb()`
    UPDATE categories SET name = ${data.name}, slug = ${data.slug}, color = ${data.color}, icon = ${data.icon}, sort_order = ${data.sort_order} WHERE id = ${id}
  `
}

export async function deleteCategory(id: number): Promise<void> {
  await getDb()`
    DELETE FROM categories WHERE id = ${id}
  `
}

export async function createTag(data: { name: string; slug: string; color: string }): Promise<number> {
  const result = await getDb()`
    INSERT INTO tags (name, slug, color) VALUES (${data.name}, ${data.slug}, ${data.color})
    RETURNING id
  `
  return result[0].id as number
}

export async function updateTag(id: number, data: { name: string; slug: string; color: string }): Promise<void> {
  await getDb()`
    UPDATE tags SET name = ${data.name}, slug = ${data.slug}, color = ${data.color} WHERE id = ${id}
  `
}

export async function deleteTag(id: number): Promise<void> {
  await getDb()`
    DELETE FROM tags WHERE id = ${id}
  `
}

export async function recordClick(appId: number, referrer: string | null, userAgent: string | null): Promise<void> {
  await getDb()`
    INSERT INTO clicks (app_id, referrer, user_agent) VALUES (${appId}, ${referrer}, ${userAgent})
  `
}

export async function getClickStats(appId?: number): Promise<{ app_id: number; count: number }[]> {
  let query = `SELECT app_id, COUNT(*) as count FROM clicks`
  const params: (string | number)[] = []

  if (appId) {
    params.push(appId)
  }

  // Use parameterized query for conditional
  const sql = getDb()
  if (appId) {
    const result = await sql`SELECT app_id, COUNT(*) as count FROM clicks WHERE app_id = ${appId} GROUP BY app_id ORDER BY count DESC`
    return result as unknown as { app_id: number; count: number }[]
  } else {
    const result = await sql`SELECT app_id, COUNT(*) as count FROM clicks GROUP BY app_id ORDER BY count DESC`
    return result as unknown as { app_id: number; count: number }[]
  }
}

export async function getAllAppsWithStats(): Promise<(App & { click_count: number; category_name: string })[]> {
  const result = await getDb()`
    SELECT a.*, c.name as category_name, COALESCE(cl.click_count, 0) as click_count
    FROM apps a
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN (
      SELECT app_id, COUNT(*) as click_count FROM clicks GROUP BY app_id
    ) cl ON a.id = cl.app_id
    ORDER BY a.created_at DESC
  `
  return result as unknown as (App & { click_count: number; category_name: string })[]
}