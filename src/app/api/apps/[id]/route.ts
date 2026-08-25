import { getDb, ensureSchema } from '@/lib/db'
import { auth } from '@/lib/auth'

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
    const { slug, title, description, download_url, category_id, tag_ids, screenshots, icon_url } = body

    if (!slug || !title || !download_url) {
      return Response.json({ error: 'Slug, judul, dan link download wajib diisi' }, { status: 400 })
    }

    const db = getDb()
    await db.execute({
      sql: `
        UPDATE apps SET slug = ?, title = ?, description = ?, download_url = ?, category_id = ?, screenshots = ?::jsonb, updated_at = CURRENT_TIMESTAMP
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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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