const fs = require('fs')
const f = 'src/app/api/apps/[id]/route.ts'
let c = fs.readFileSync(f, 'utf8')

if (c.includes('ensureSchema')) {
  console.log('Already present')
  process.exit(0)
}

c = c.replace(
  "import { getDb } from '@/lib/db'",
  "import { getDb, ensureSchema } from '@/lib/db'"
)

let count = 0
c = c.replace(
  /(export async function (?:PUT|DELETE)[\s\S]*?try \{)/g,
  m => {
    count++
    return m + '\n    await ensureSchema()'
  }
)

fs.writeFileSync(f, c)
console.log('Added ensureSchema to', count, 'handlers')