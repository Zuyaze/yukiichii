import { getDb, ensureSchema } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  try {
    const db = getDb()
    const apps = await db.execute({
      sql: `
        SELECT a.*, c.name as category_name, c.slug as category_slug
        FROM apps a
        LEFT JOIN categories c ON a.category_id = c.id
        ORDER BY a.created_at DESC
      `,
      args: [],
    })

    let filtered = apps.rows as any[]

    const search = searchParams.get('search')
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(
        a =>
          a.title?.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q)
      )
    }

    return Response.json({ apps: filtered })
  } catch (error) {
    console.error('Get apps error:', error)
    return Response.json({ apps: [] })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await ensureSchema()
    const body = await request.json()
    const { slug, title, description, download_url, category_id, tag_ids, screenshots, icon_url } = body

    if (!slug || !title || !download_url) {
      return Response.json({ error: 'Slug, judul, dan link download wajib diisi' }, { status: 400 })
    }

    const db = getDb()
    const result = await db.execute({
      sql: `
        INSERT INTO apps (slug, title, description, download_url, category_id, screenshots)
        VALUES (?, ?, ?, ?, ?, ?::jsonb)
        RETURNING id
      `,
      args: [
        slug,
        title,
        description ?? null,
        download_url,
        category_id ?? null,
        JSON.stringify(screenshots ?? []),
      icon_url ?? null,
      ],
    })
    const appId = (result.rows[0] as any).id as number

    // Tags are best-effort: don't fail the whole save if tag linking errors
    for (const tagId of (tag_ids ?? []) as number[]) {
      try {
        await db.execute({
          sql: 'INSERT INTO app_tags (app_id, tag_id) VALUES (?, ?)',
          args: [appId, tagId],
        })
      } catch (tagErr) {
        console.error(`Tag link failed (app ${appId}, tag ${tagId}):`, tagErr)
      }
    }

    return Response.json({ success: true, id: appId })
  } catch (error) {
    console.error('Create app error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return Response.json({ error: msg }, { status: 500 })
  }
}