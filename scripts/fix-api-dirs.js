const fs = require('fs')
const path = require('path')

const API = path.join(__dirname, '..', 'src', 'app', 'api')

// Fix malformed "[id/]" folders -> "[id]"
const fixes = [
  ['categories', '[id/]'],
  ['tags', '[id/]'],
]

for (const [folder, badName] of fixes) {
  const badDir = path.join(API, folder, badName)
  const goodDir = path.join(API, folder, '[id]')

  if (fs.existsSync(badDir)) {
    fs.mkdirSync(goodDir, { recursive: true })
    for (const f of fs.readdirSync(badDir)) {
      fs.copyFileSync(path.join(badDir, f), path.join(goodDir, f))
      console.log(`moved ${folder}/${badName}/${f} -> ${folder}/[id]/${f}`)
    }
    fs.rmSync(badDir, { recursive: true, force: true })
  } else {
    console.log(`${folder}: no malformed dir`)
  }
}

// Remove duplicate malformed apps/[id/]
const dupApps = path.join(API, 'apps', '[id/]')
if (fs.existsSync(dupApps)) {
  fs.rmSync(dupApps, { recursive: true, force: true })
  console.log('removed duplicate apps/[id/]')
}

console.log('\n=== Final API structure ===')
function walk(d, prefix = '') {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    console.log(prefix + e.name + (e.isDirectory() ? '/' : ''))
    if (e.isDirectory()) walk(path.join(d, e.name), prefix + '  ')
  }
}
walk(API)