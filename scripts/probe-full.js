const BASE = 'https://yukiichii.netlify.app'

async function login() {
  const csrfRes = await fetch(BASE + '/api/auth/csrf')
  const cookies = (csrfRes.headers.getSetCookie ? csrfRes.headers.getSetCookie() : []).map(c => c.split(';')[0])
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
  return cookies
}

async function main() {
  const cookies = await login()
  console.log('Logged in\n')

  const pages = [
    '/',
    '/apps',
    '/categories',
    '/login',
    '/dashboard',
    '/dashboard/apps',
    '/dashboard/apps/new',
    '/dashboard/categories',
    '/dashboard/tags',
  ]

  // Get a real slug for detail page
  const list = await fetch(BASE + '/api/apps').then(r => r.json())
  const firstApp = (list.apps || [])[0]
  if (firstApp) pages.push('/apps/' + firstApp.slug)
  if (firstApp) pages.push('/dashboard/apps/' + firstApp.id)

  console.log('=== FULL PAGE LOADS ===')
  for (const p of pages) {
    try {
      const r = await fetch(BASE + p, { headers: { Cookie: cookies.join('; ') } })
      console.log(r.status, p)
    } catch (e) {
      console.log('FETCH ERR', p, e.message)
    }
  }

  console.log('\n=== CLIENT NAVIGATION (RSC payloads) ===')
  for (const p of pages) {
    try {
      const r = await fetch(BASE + p, {
        headers: { Cookie: cookies.join('; '), RSC: '1' },
      })
      const t = await r.text()
      const isError = r.status >= 500 || t.includes('"digest"')
      console.log(r.status, isError ? '❌ BROKEN' : '✓', p)
      if (isError && r.status >= 500) {
        console.log('   body:', t.substring(0, 150))
      }
    } catch (e) {
      console.log('FETCH ERR', p, e.message)
    }
  }

  console.log('\n=== APIs ===')
  for (const p of ['/api/test-db', '/api/apps', '/api/categories', '/api/tags']) {
    const r = await fetch(BASE + p, { headers: { Cookie: cookies.join('; ') } })
    console.log(r.status, p)
  }
}

main().catch(e => console.error('ERR:', e.message))