const fs = require('fs')

const validation = `
    const isHttpsUrl = (u) => typeof u === 'string' && u.startsWith('https://')
    if (!isHttpsUrl(download_url)) {
      return Response.json({ error: 'Link download harus dimulai dengan https://' }, { status: 400 })
    }
    if ((screenshots ?? []).some((s) => !isHttpsUrl(s)) || (icon_url && !isHttpsUrl(icon_url))) {
      return Response.json({ error: 'URL gambar tidak valid' }, { status: 400 })
    }`

for (const f of ['src/app/api/apps/route.ts', 'src/app/api/apps/[id]/route.ts']) {
  let c = fs.readFileSync(f, 'utf8')
  if (c.includes('isHttpsUrl')) {
    console.log('Already has validation:', f)
    continue
  }

  const marker = "return Response.json({ error: 'Slug, judul, dan link download wajib diisi' }, { status: 400 })\n    }"
  if (!c.includes(marker)) {
    console.log('MARKER NOT FOUND in', f)
    continue
  }
  c = c.replace(marker, marker + '\n' + validation)
  fs.writeFileSync(f, c)
  console.log('Added URL validation:', f)
}