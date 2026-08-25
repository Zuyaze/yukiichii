const fs = require('fs')

const f = 'src/lib/db/queries.ts'
let c = fs.readFileSync(f, 'utf8')

// Truncate at start of corrupted getAppById
const idx = c.indexOf('export async function getAppById')
if (idx > 0) c = c.slice(0, idx)

const clean =
  c +
  `
export async function getAppById(
  id: number
): Promise<(App & { category_name: string; category_slug: string; category_color: string; tags: Tag[] }) | null> {
  const db = getDb()

  const appResult = await db.execute({
    sql: \`
      SELECT a.*, c.name as category_name, c.slug as category_slug, c.color as category_color
      FROM apps a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.id = ?
    \`,
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
`

fs.writeFileSync(f, clean)
console.log('Fixed. Backticks present:', (clean.match(/`/g) || []).length)