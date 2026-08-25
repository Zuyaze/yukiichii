const fs = require('fs')
const path = require('path')

const APP = path.join(__dirname, '..', 'src', 'app')

function walk(dir) {
  let out = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

function ensureCopy(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
  console.log('  moved ->', path.relative(APP, dest))
}

console.log('=== Migrating (admin ===')
const adminSrc = path.join(APP, '(admin')
for (const f of walk(adminSrc)) {
  let rel = path.relative(adminSrc, f).split(path.sep).join('/')
  // ")\/dashboard/..." -> "dashboard/..."
  rel = rel.replace(/^\)\//, '')
  // "[id/]/" -> "[id]/"
  rel = rel.replace('[id/]/', '[id]/')
  const dest = path.join(APP, '(admin)', rel)
  ensureCopy(f, dest)
}

console.log('=== Migrating (public ===')
const publicSrc = path.join(APP, '(public')
for (const f of walk(publicSrc)) {
  let rel = path.relative(publicSrc, f).split(path.sep).join('/')
  rel = rel.replace(/^\)\//, '')
  // "(...slug/)/page.tsx" -> "[slug]/page.tsx"
  if (rel.includes('(...slug/)')) {
    rel = rel.replace(/\(\.\.\.slug\/\)\//, '[slug]/')
  }
  const dest = path.join(APP, '(public)', rel)
  // Only move detail page & anything missing in destination
  if (!fs.existsSync(dest)) {
    ensureCopy(f, dest)
  } else {
    console.log('  SKIP (already exists):', rel)
  }
}

console.log('\n=== Deleting malformed folders ===')
fs.rmSync(path.join(APP, '(admin'), { recursive: true, force: true })
fs.rmSync(path.join(APP, '(public'), { recursive: true, force: true })
console.log('Deleted (admin and (public')

console.log('\n=== Final structure check ===')
for (const d of listDirs(APP)) console.log(JSON.stringify(d))

function listDirs(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name)
  } catch { return [] }
}