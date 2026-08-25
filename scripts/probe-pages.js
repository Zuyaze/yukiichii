const BASE = 'https://yukiichii.netlify.app'

async function main() {
  const csrfRes = await fetch(BASE + '/api/auth/csrf')
  const cookies = (csrfRes.headers.getSetCookie ? csrfRes.headers.getSetCookie() : []).map(c =>
    c.split(';')[0]
  )
  const csrf = await csrfRes.json()
  const body = new URLSearchParams({
    csrfToken: csrf.csrfToken,
    email: 'admin@yukiichii.com',
    password: 'yukiichii123',
    callbackUrl: BASE + '/dashboard',
    json: 'true',
  })
  const login = await fetch(BASE + '/api/auth/callback/credentials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: cookies.join('; '),
    },
    body: body.toString(),
    redirect: 'manual',
  })
  for (const c of login.headers.getSetCookie ? login.headers.getSetCookie() : []) {
    cookies.push(c.split(';')[0])
  }

  for (const p of [
    '/dashboard/apps/new',
    '/dashboard/apps',
    '/dashboard/categories',
    '/dashboard/tags',
    '/dashboard',
  ]) {
    const r = await fetch(BASE + p, { headers: { Cookie: cookies.join('; ') } })
    console.log(p, '→', r.status)
    if (r.status >= 500) {
      const t = await r.text()
      const m = t.match(/digest["']?\s*[:=]\s*["']([^"']+)/)
      if (m) console.log('   digest:', m[1])
      const idx = t.indexOf('Application error')
      if (idx > -1) console.log('   has Application error text')
    }
  }
}

main().catch(e => console.error('ERR:', e.message))