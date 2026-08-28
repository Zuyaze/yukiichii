export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { getAllHeroImages } from '@/lib/db/queries'
import { HeroGalleryClient } from './HeroGalleryClient'

export const metadata: Metadata = {
  title: 'Kelola Hero Gallery',
}

export default async function HeroGalleryPage() {
  const heroImages = await getAllHeroImages()

  return <HeroGalleryClient initialImages={heroImages} />
}