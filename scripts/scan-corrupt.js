const fs = require('fs')
const path = require('path')

function walk(dir) {
  let out = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...walk(full))
    else if (e.name.endsWith('.tsx') || e.name.endsWith('.ts')) out.push(full)
  }
  return out
}

const files = [
  ...walk(path.join(__dirname, '..', 'src', 'app')),
  ...walk(path.join(__dirname, '..', 'src', 'components')),
]

for (const f of files) {
  const lines = fs.readFileSync(f, 'utf8').split('\n').length
  if (lines > 400) {
    console.log(lines, 'lines:', path.relative(process.cwd(), f))
    // Count default exports — more than 1 means concatenated pages
    const defs = (fs.readFileSync(f, 'utf8').match(/export default/g) || []).length
    if (defs > 1) console.log('   ⚠ CONTAINS', defs, 'default exports (corrupted!)')
  }
}
console.log('Scan done.')