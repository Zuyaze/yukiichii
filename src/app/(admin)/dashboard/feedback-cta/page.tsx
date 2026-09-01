export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { getAllFeedbackCTA } from '@/lib/db/queries'
import { FeedbackCTAClient } from './FeedbackCTAClient'

export const metadata: Metadata = {
  title: 'Kelola Feedback CTA',
}

export default async function FeedbackCTAPage() {
  const ctas = await getAllFeedbackCTA()

  return <FeedbackCTAClient initialCTAs={ctas} />
}