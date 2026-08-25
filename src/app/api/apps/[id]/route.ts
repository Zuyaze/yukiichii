import { getDb, ensureSchema } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const appId = parseInt(id)

  if (isNaN(appId)) {
    return Response.json({ error: 'ID tidak valid' }, { status: 400 })
  }

  try {
    const db = getDb()

    const appResult = await db.execute({
      sql: `
        SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color
        FROM apps a
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE a.id = ?
      `,
      args: [appId],
    })

    if (appResult.rows.length === 0) {
      return Response.json({ error: 'Aplikasi tidak ditemukan' }, { status: 404 })
    }

    const app = appResult.rows[0]

    const tagsResult = await db.execute({
      sql: `
        SELECT t.* FROM tags t
        JOIN app_tags at ON t.id = at.tag_id
        WHERE at.app_id = ?
      `,
      args: [appId],
    })

    return Response.json({
      app: {
        ...app,
        tags: tagsResult.rows,
      },
    })
  } catch (error) {
    console.error('Get app error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const appId = parseInt(id)

  if (isNaN(appId)) {
    return Response.json({ error: 'ID tidak valid' }, { status: 400 })
  }

  try {
    await ensureSchema()

    const body = await request.json()
    const { slug, title, description, download_url, category_id, tag_ids, screenshots, icon_url } =
      body

    if (!slug || !title || !download_url) {
      return Response.json(
        { error: 'Slug, judul, dan link download wajib diisi' },
        { status: 400 }
      )
    }

    const isHttpsUrl = (u: unknown) => typeof u === 'string' && u.startsWith('https://')
    if (!isHttpsUrl(download_url)) {
      return Response.json({ error: 'Link download harus dimulai dengan https://' }, { status: 400 })
    }
    if ((screenshots ?? []).some((s: string) => !isHttpsUrl(s)) || (icon_url && !isHttpsUrl(icon_url))) {
      return Response.json({ error: 'URL gambar tidak valid' }, { status: 400 })
    }

    const db = getDb()
    await db.execute({
      sql: `
        UPDATE apps SET slug = ?, title = ?, description = ?, download_url = ?, category_id = ?, screenshots = ?::jsonb, icon_url = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        slug,
        title,
        description ?? null,
        download_url,
        category_id ?? null,
        JSON.stringify(screenshots ?? []),
        icon_url ?? null,
        appId,
      ],
    })

    await db.execute({ sql: 'DELETE FROM app_tags WHERE app_id = ?', args: [appId] })

    // Tags are best-effort: main update already succeeded
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

    return Response.json({ success: true })
  } catch (error) {
    console.error('Update app error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return Response.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const appId = parseInt(id)

  if (isNaN(appId)) {
    return Response.json({ error: 'ID tidak valid' }, { status: 400 })
  }

  try {
    await ensureSchema()

    const db = getDb()
    await db.execute({ sql: 'DELETE FROM app_tags WHERE app_id = ?', args: [appId] })
    await db.execute({ sql: 'DELETE FROM clicks WHERE app_id = ?', args: [appId] })
    await db.execute({ sql: 'DELETE FROM apps WHERE id = ?', args: [appId] })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete app error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return Response.json({ error: msg }, { status: 500 })
  }
}