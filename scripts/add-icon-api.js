const fs = require('fs')

// POST /api/apps
let p = 'src/app/api/apps/route.ts'
let c = fs.readFileSync(p, 'utf8')
c = c.replace(
  'const { slug, title, description, download_url, category_id, tag_ids, screenshots } = body',
  'const { slug, title, description, download_url, category_id, tag_ids, screenshots, icon_url } = body'
)
c = c.replace(
  'JSON.stringify(screenshots ?? []),\n      ],',
  'JSON.stringify(screenshots ?? []),\n      icon_url ?? null,\n      ],'
)
fs.writeFileSync(p, c)
console.log('POST apps:', c.includes('icon_url ?? null'))

// PUT /api/apps/[id]
p = 'src/app/api/apps/[id]/route.ts'
c = fs.readFileSync(p, 'utf8')
c = c.replace(
  'const { slug, title, description, download_url, category_id, tag_ids, screenshots } = body',
  'const { slug, title, description, download_url, category_id, tag_ids, screenshots, icon_url } = body'
)
c = c.replace(
  'JSON.stringify(screenshots ?? []),\n        appId,\n      ],',
  'JSON.stringify(screenshots ?? []),\n        icon_url ?? null,\n        appId,\n      ],'
)
fs.writeFileSync(p, c)
console.log('PUT apps/[id]:', c.includes('icon_url ?? null'))