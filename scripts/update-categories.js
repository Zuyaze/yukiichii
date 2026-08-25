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

  // 1. Get current categories
  const listRes = await fetch(BASE + '/api/categories')
  const { categories } = await listRes.json()
  console.log('Existing:', categories.map(c => `${c.name} (${c.id})`).join(', '))

  // 2. Delete ALL existing
  for (const cat of categories) {
    const res = await fetch(`${BASE}/api/categories/${cat.id}`, {
      method: 'DELETE',
      headers: { Cookie: cookies.join('; ') },
    })
    console.log(`Delete "${cat.name}":`, res.status)
  }

  // 3. Create new 2 categories
  const newCats = [
    { name: 'Mod Apk', slug: 'mod-apk', color: '#2563eb', icon: '📱', sort_order: 1 },
    { name: 'Loader', slug: 'loader', color: '#f97316', icon: '🔑', sort_order: 2 },
  ]

  for (const cat of newCats) {
    const res = await fetch(BASE + '/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookies.join('; ') },
      body: JSON.stringify(cat),
    })
    const j = await res.json()
    console.log(`Create "${cat.name}":`, res.status, JSON.stringify(j))
  }

  // 4. Verify
  const verify = await fetch(BASE + '/api/categories').then(r => r.json())
  console.log('\nFinal:', verify.categories.map(c => c.name).join(', '))
}

main().catch(e => console.error('ERR:', e.message))