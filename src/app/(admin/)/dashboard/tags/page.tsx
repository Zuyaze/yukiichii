import { Metadata } from 'next'
import { getTags } from '@/lib/db/queries'
import { TagClient } from './TagClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Kelola Tag',
}

export default async function TagsPage() {
  const tags = await getTags()

  return <TagClient tags={tags} />
}