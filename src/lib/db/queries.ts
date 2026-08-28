import { getDb } from './index'
import type { App, Category, Tag, Admin, Click, HeroImage, AppGroup, AppGroupItem } from './index'

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
  screenshots?: string[]
  icon_url?: string | null
}): Promise<number> {
  const db = getDb()
  const result = await db.execute({
    sql: `
      INSERT INTO apps (slug, title, description, download_url, category_id, screenshots, icon_url)
      VALUES (?, ?, ?, ?, ?, ?::jsonb, ?)
      RETURNING id
    `,
    args: [
      data.slug,
      data.title,
      data.description,
      data.download_url,
      data.category_id,
      JSON.stringify(data.screenshots ?? []),
      data.icon_url ?? null,
    ],
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
    screenshots?: string[]
  icon_url?: string | null
  }
): Promise<void> {
  const db = getDb()
  await db.execute({
    sql: `
      UPDATE apps SET slug = ?, title = ?, description = ?, download_url = ?, category_id = ?, screenshots = ?::jsonb, icon_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    args: [
      data.slug,
      data.title,
      data.description,
      data.download_url,
      data.category_id,
      JSON.stringify(data.screenshots ?? []),
      id,
    ],
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

export async function getHeroImages(): Promise<HeroImage[]> {
  const result = await getDb().execute({
    sql: 'SELECT * FROM hero_images WHERE is_active = true ORDER BY sort_order ASC, created_at ASC',
  })
  return result.rows as unknown as HeroImage[]
}

export async function getAllHeroImages(): Promise<HeroImage[]> {
  const result = await getDb().execute({
    sql: 'SELECT * FROM hero_images ORDER BY sort_order ASC, created_at ASC',
  })
  return result.rows as unknown as HeroImage[]
}

export async function getHeroImageById(id: number): Promise<HeroImage | null> {
  const result = await getDb().execute({
    sql: 'SELECT * FROM hero_images WHERE id = ?',
    args: [id],
  })
  return (result.rows[0] as unknown as HeroImage) || null
}

export async function createHeroImage(data: {
  image_url: string
  alt_text: string | null
  sort_order: number
  is_active: boolean
}): Promise<number> {
  const result = await getDb().execute({
    sql: 'INSERT INTO hero_images (image_url, alt_text, sort_order, is_active) VALUES (?, ?, ?, ?) RETURNING id',
    args: [data.image_url, data.alt_text, data.sort_order, data.is_active],
  })
  return (result.rows[0] as any).id as number
}

export async function updateHeroImage(
  id: number,
  data: {
    image_url?: string
    alt_text?: string | null
    sort_order?: number
    is_active?: boolean
  }
): Promise<void> {
  const db = getDb()
  const updates: string[] = []
  const args: any[] = []

  if (data.image_url !== undefined) {
    updates.push('image_url = ?')
    args.push(data.image_url)
  }
  if (data.alt_text !== undefined) {
    updates.push('alt_text = ?')
    args.push(data.alt_text)
  }
  if (data.sort_order !== undefined) {
    updates.push('sort_order = ?')
    args.push(data.sort_order)
  }
  if (data.is_active !== undefined) {
    updates.push('is_active = ?')
    args.push(data.is_active)
  }

  if (updates.length === 0) return

  updates.push('updated_at = CURRENT_TIMESTAMP')
  args.push(id)

  await db.execute({
    sql: `UPDATE hero_images SET ${updates.join(', ')} WHERE id = ?`,
    args,
  })
}

export async function deleteHeroImage(id: number): Promise<void> {
  await getDb().execute({ sql: 'DELETE FROM hero_images WHERE id = ?', args: [id] })
}

// ===== App Groups =====

export async function getAppGroups(): Promise<AppGroup[]> {
  const result = await getDb().execute({
    sql: 'SELECT * FROM app_groups WHERE is_active = true ORDER BY sort_order ASC, created_at ASC',
  })
  return result.rows as unknown as AppGroup[]
}

export async function getAllAppGroups(): Promise<AppGroup[]> {
  const result = await getDb().execute({
    sql: 'SELECT * FROM app_groups ORDER BY sort_order ASC, created_at ASC',
  })
  return result.rows as unknown as AppGroup[]
}

export async function getAppGroupBySlug(slug: string): Promise<(AppGroup & { apps: (App & { group_sort_order: number })[] }) | null> {
  const groupResult = await getDb().execute({
    sql: 'SELECT * FROM app_groups WHERE slug = ?',
    args: [slug],
  })
  if (groupResult.rows.length === 0) return null

  const group = groupResult.rows[0] as unknown as AppGroup

  const appsResult = await getDb().execute({
    sql: `
      SELECT a.*, c.name as category_name, c.color as category_color, agi.sort_order as group_sort_order
      FROM apps a
      LEFT JOIN categories c ON a.category_id = c.id
      JOIN app_group_items agi ON a.id = agi.app_id
      WHERE agi.group_id = ?
      ORDER BY agi.sort_order ASC, a.created_at ASC
    `,
    args: [group.id],
  })

  return { ...group, apps: appsResult.rows as unknown as (App & { group_sort_order: number; category_name: string | null; category_color: string | null })[] }
}

export async function getAppGroupById(id: number): Promise<AppGroup | null> {
  const result = await getDb().execute({
    sql: 'SELECT * FROM app_groups WHERE id = ?',
    args: [id],
  })
  return (result.rows[0] as unknown as AppGroup) || null
}

export async function getAppGroupWithApps(groupId: number): Promise<(AppGroup & { apps: (App & { sort_order: number })[] }) | null> {
  const groupResult = await getDb().execute({
    sql: 'SELECT * FROM app_groups WHERE id = ?',
    args: [groupId],
  })
  if (groupResult.rows.length === 0) return null

  const group = groupResult.rows[0] as unknown as AppGroup

  const appsResult = await getDb().execute({
    sql: `
      SELECT a.*, agi.sort_order as group_sort_order
      FROM apps a
      JOIN app_group_items agi ON a.id = agi.app_id
      WHERE agi.group_id = ?
      ORDER BY agi.sort_order ASC, a.created_at ASC
    `,
    args: [groupId],
  })

  return { ...group, apps: appsResult.rows as unknown as (App & { sort_order: number })[] }
}

export async function createAppGroup(data: {
  name: string
  slug: string
  title: string
  description: string | null
  logo_url: string | null
  sort_order: number
  is_active: boolean
}): Promise<number> {
  const result = await getDb().execute({
    sql: `
      INSERT INTO app_groups (name, slug, title, description, logo_url, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING id
    `,
    args: [data.name, data.slug, data.title, data.description, data.logo_url, data.sort_order, data.is_active],
  })
  return (result.rows[0] as any).id as number
}

export async function updateAppGroup(
  id: number,
  data: {
    name?: string
    slug?: string
    title?: string
    description?: string | null
    logo_url?: string | null
    sort_order?: number
    is_active?: boolean
  }
): Promise<void> {
  const db = getDb()
  const updates: string[] = []
  const args: any[] = []

  if (data.name !== undefined) { updates.push('name = ?'); args.push(data.name) }
  if (data.slug !== undefined) { updates.push('slug = ?'); args.push(data.slug) }
  if (data.title !== undefined) { updates.push('title = ?'); args.push(data.title) }
  if (data.description !== undefined) { updates.push('description = ?'); args.push(data.description) }
  if (data.logo_url !== undefined) { updates.push('logo_url = ?'); args.push(data.logo_url) }
  if (data.sort_order !== undefined) { updates.push('sort_order = ?'); args.push(data.sort_order) }
  if (data.is_active !== undefined) { updates.push('is_active = ?'); args.push(data.is_active) }

  if (updates.length === 0) return

  updates.push('updated_at = CURRENT_TIMESTAMP')
  args.push(id)

  await db.execute({
    sql: `UPDATE app_groups SET ${updates.join(', ')} WHERE id = ?`,
    args,
  })
}

export async function deleteAppGroup(id: number): Promise<void> {
  await getDb().execute({ sql: 'DELETE FROM app_groups WHERE id = ?', args: [id] })
}

// ===== App Group Items =====

export async function getGroupApps(groupId: number): Promise<(App & { group_sort_order: number })[]> {
  const result = await getDb().execute({
    sql: `
      SELECT a.*, c.name as category_name, c.color as category_color, agi.sort_order as group_sort_order
      FROM apps a
      LEFT JOIN categories c ON a.category_id = c.id
      JOIN app_group_items agi ON a.id = agi.app_id
      WHERE agi.group_id = ?
      ORDER BY agi.sort_order ASC, a.created_at ASC
    `,
    args: [groupId],
  })
  return result.rows as unknown as (App & { group_sort_order: number; category_name: string | null; category_color: string | null })[]
}

export async function addAppToGroup(groupId: number, appId: number, sortOrder: number = 0): Promise<number> {
  const result = await getDb().execute({
    sql: 'INSERT INTO app_group_items (group_id, app_id, sort_order) VALUES (?, ?, ?) ON CONFLICT (group_id, app_id) DO NOTHING RETURNING id',
    args: [groupId, appId, sortOrder],
  })
  return (result.rows[0] as any)?.id as number || 0
}

export async function removeAppFromGroup(groupId: number, appId: number): Promise<void> {
  await getDb().execute({ sql: 'DELETE FROM app_group_items WHERE group_id = ? AND app_id = ?', args: [groupId, appId] })
}

export async function updateGroupAppOrder(groupId: number, appId: number, sortOrder: number): Promise<void> {
  await getDb().execute({
    sql: 'UPDATE app_group_items SET sort_order = ? WHERE group_id = ? AND app_id = ?',
    args: [sortOrder, groupId, appId],
  })
}

export async function removeAllAppsFromGroup(groupId: number): Promise<void> {
  await getDb().execute({ sql: 'DELETE FROM app_group_items WHERE group_id = ?', args: [groupId] })
}

export async function getAppGroupsWithApps(): Promise<(AppGroup & { apps: (App & { group_sort_order: number })[] })[]> {
  const groups = await getAllAppGroups()
  const result: (AppGroup & { apps: (App & { group_sort_order: number })[] })[] = []

  for (const group of groups) {
    const apps = await getGroupApps(group.id)
    result.push({ ...group, apps })
  }

  return result
}

export async function getGroupAppCount(groupId: number): Promise<number> {
  const result = await getDb().execute({
    sql: 'SELECT COUNT(*) as count FROM app_group_items WHERE group_id = ?',
    args: [groupId],
  })
  return parseInt((result.rows[0] as any).count) || 0
}

export async function isAppInGroup(groupId: number, appId: number): Promise<boolean> {
  const result = await getDb().execute({
    sql: 'SELECT 1 FROM app_group_items WHERE group_id = ? AND app_id = ?',
    args: [groupId, appId],
  })
  return result.rows.length > 0
}

export async function getAppsNotInGroup(groupId: number, search?: string): Promise<App[]> {
  let sql = `
    SELECT a.* FROM apps a
    WHERE a.id NOT IN (SELECT app_id FROM app_group_items WHERE group_id = ?)
  `
  const args: any[] = [groupId]

  if (search) {
    sql += ` AND (a.title ILIKE ? OR a.slug ILIKE ?)`
    args.push(`%${search}%`, `%${search}%`)
  }

  sql += ` ORDER BY a.created_at DESC`

  const result = await getDb().execute({ sql, args })
  return result.rows as unknown as App[]
}
