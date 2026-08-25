const fs = require('fs')
const path = require('path')

const APP = path.join(__dirname, '..', 'src', 'app')

function listDirs(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name)
  } catch { return [] }
}

function walk(dir, base = '') {
  let out = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    const rel = base ? base + '/' + e.name : e.name
    if (e.isDirectory()) out.push(...walk(full, rel))
    else out.push(rel)
  }
  return out
}

console.log('=== FOLDERS in src/app ===')
for (const d of listDirs(APP)) {
  console.log(JSON.stringify(d))
}

console.log('\n=== FILES in each suspicious folder ===')
for (const d of listDirs(APP)) {
  if (d.includes('(')) {
    console.log(`--- ${JSON.stringify(d)} ---`)
    for (const f of walk(path.join(APP, d))) console.log('   ', f)
  }
}