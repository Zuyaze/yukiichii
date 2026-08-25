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

  // 1. Get the full HTML of /dashboard/apps/new
  const res = await fetch(BASE + '/dashboard/apps/new', {
    headers: { Cookie: cookies.join('; ') },
  })
  const html = await res.text()
  console.log('Page status:', res.status)

  // 2. Extract buildId
  const buildMatch = html.match(/"buildId":"([^"]+)"/)
  console.log('BuildId:', buildMatch ? buildMatch[1] : 'NOT FOUND')

  // 3. Extract all static chunk URLs
  const chunkUrls = [...html.matchAll(/\/_next\/static\/[^"'\s\\]+\.js/g)].map(m => m[0])
  const unique = [...new Set(chunkUrls)]
  console.log('Chunks referenced:', unique.length)

  // 4. Check each chunk - report 404s
  let notFound = 0
  for (const u of unique) {
    const r = await fetch(BASE + u, { method: 'HEAD' })
    if (r.status !== 200) {
      console.log('❌', r.status, u)
      notFound++
    }
  }
  if (notFound === 0) console.log('✓ All chunks reachable')

  // 5. Check if page references AppForm-related chunk
  const hasAppFormRef = html.includes('admin-form') || html.includes('AppForm')
  console.log('References admin-form:', hasAppFormRef)

  // 6. Check RSC payload for the page
  const rsc = await fetch(BASE + '/dashboard/apps/new', {
    headers: { Cookie: cookies.join('; '), RSC: '1' },
  })
  const rscText = await rsc.text()
  console.log('\nRSC status:', rsc.status)
  console.log('RSC length:', rscText.length)
  console.log('RSC first 300:', rscText.substring(0, 300).replace(/\n/g, ' '))
}

main().catch(e => console.error('ERR:', e.message))