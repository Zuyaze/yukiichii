import { Metadata } from 'next'
import { getCategories } from '@/lib/db/queries'
import { CategoryClient } from './CategoryClient'

export const metadata: Metadata = {
  title: 'Kelola Kategori',
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return <CategoryClient categories={categories} />
}