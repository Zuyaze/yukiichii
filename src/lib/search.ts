import Fuse from 'fuse.js'
import type { App } from './db'

export interface SearchableApp {
  id: number
  slug: string
  title: string
  description: string | null
  category_name: string | null
  category_slug: string | null
  tags: string[]
}

let fuseInstance: Fuse<SearchableApp> | null = null
let appsCache: SearchableApp[] = []

export function buildSearchIndex(apps: SearchableApp[]) {
  appsCache = apps
  fuseInstance = new Fuse(apps, {
    keys: ['title', 'description', 'category_name', 'tags'],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 2,
  })
}

export function searchApps(query: string, limit = 20): SearchableApp[] {
  if (!fuseInstance || !query.trim()) return appsCache.slice(0, limit)
  const results = fuseInstance.search(query, { limit })
  return results.map(r => r.item)
}

export function getAllApps(): SearchableApp[] {
  return appsCache
}