const fs = require('fs')
const path = require('path')

const SRC = path.join(__dirname, '..', 'src', 'app')

function listDirs(dir) {
  let out = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      const full = path.join(dir, e.name)
      out.push(full)
      out.push(...listDirs(full))
    }
  }
  return out
}

// 1. Fix track/[id/]/]/route.ts -> track/[id]/route.ts
const brokenTrack = path.join(SRC, 'api', 'track', '[id/')
if (fs.existsSync(brokenTrack)) {
  const files = []
  function collect(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name)
      if (e.isDirectory()) collect(full)
      else files.push(full)
    }
  }
  collect(brokenTrack)
  const goodDir = path.join(SRC, 'api', 'track', '[id]')
  fs.mkdirSync(goodDir, { recursive: true })
  for (const f of files) {
    const dest = path.join(goodDir, 'route.ts')
    if (!fs.existsSync(dest)) fs.copyFileSync(f, dest)
    console.log('moved:', path.relative(SRC, f))
  }
}

// 2. Remove ALL directories whose name contains '/' character
let removed = 0
for (const d of listDirs(SRC)) {
  const name = path.basename(d)
  if (name.includes('/') || name === ']') {
    fs.rmSync(d, { recursive: true, force: true })
    console.log('removed dir:', JSON.stringify(path.relative(SRC, d)))
    removed++
  }
}

// 3. Final check - any remaining bad names?
const bad = listDirs(SRC).filter(d => path.basename(d).includes('/') || /\s/.test(path.basename(d).replace(/[\[\]()]/g, '')) === false && /[\u0000-\u001f]/.test(path.basename(d)))
console.log('\nRemaining suspicious dirs:', bad.length)
for (const d of listDirs(SRC)) {
  console.log(JSON.stringify(path.relative(SRC, d)))
}