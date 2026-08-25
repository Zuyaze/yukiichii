import { getCategories, getTags } from '../src/lib/db/queries'

async function main() {
  const categories = await getCategories()
  const tags = await getTags()
  console.log('Categories:', categories.length)
  console.log('Tags:', tags.length)
  categories.forEach(c => console.log(' - ', c.name, c.slug))
  tags.forEach(t => console.log(' - ', t.name, t.slug))
}

main().catch(console.error)