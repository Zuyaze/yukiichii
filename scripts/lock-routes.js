const fs = require('fs')

const files = [
  'src/app/api/test-db/route.ts',
  'src/app/api/test-tables/route.ts',
  'src/app/api/seed/route.ts',
]

for (const f of files) {
  let c = fs.readFileSync(f, 'utf8')

  if (c.includes('auth()')) {
    console.log('Already locked:', f)
    continue
  }

  // Add import after the last existing import line
  const lines = c.split('\n')
  let lastImport = -1
  lines.forEach((l, i) => {
    if (l.startsWith('import ')) lastImport = i
  })
  lines.splice(lastImport + 1, 0, "import { auth } from '@/lib/auth'")
  c = lines.join('\n')

  // Insert auth check right after "export async function GET() {" opening brace line
  c = c.replace(
    /(export async function GET\(\)[^\{]*\{\n)/,
    '$1  const session = await auth()\n  if (!session?.user) {\n    return Response.json({ error: "Unauthorized" }, { status: 401 })\n  }\n\n'
  )

  fs.writeFileSync(f, c)
  console.log('Locked:', f)
}