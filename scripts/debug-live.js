const BASE = 'https://yukiichii.netlify.app'

async function main() {
  // 1. Get CSRF token
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`)
  const setCookieHeaders = []
  csrfRes.headers.forEach((v, k) => {
    if (k.toLowerCase() === 'set-cookie') setCookieHeaders.push(v)
  })
  const csrf = await csrfRes.json()

  // Collect cookies from csrf response
  const rawCookies = []
  // Node fetch exposes set-cookie via headers.getSetCookie()
  const sc = csrfRes.headers.getSetCookie ? csrfRes.headers.getSetCookie() : []
  for (const c of sc) rawCookies.push(c.split(';')[0])

  console.log('CSRF obtained:', !!csrf.csrfToken)
  console.log('Cookies from csrf:', rawCookies.length)

  // 2. Login
  const body = new URLSearchParams({
    csrfToken: csrf.csrfToken,
    email: 'admin@yukiichii.com',
    password: 'yukiichii123',
    callbackUrl: `${BASE}/dashboard`,
    json: 'true',
  })

  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: rawCookies.join('; '),
    },
    body: body.toString(),
    redirect: 'manual',
  })

  const loginSetCookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : []
  for (const c of loginSetCookies) rawCookies.push(c.split(';')[0])

  console.log('Login status:', loginRes.status)
  console.log('Session cookie obtained:', rawCookies.some(c => c.includes('session-token')))

  // 3. Fetch protected pages with session
  for (const path of ['/dashboard/apps/new', '/dashboard/apps', '/dashboard', '/dashboard/categories']) {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Cookie: rawCookies.join('; ') },
      redirect: 'manual',
    })
    console.log(path, '→', res.status)
    if (res.status === 500) {
      const text = await res.text()
      // Extract digest/error info
      const digestMatch = text.match(/digest['"]?\s*[:=]\s*['"]([^'"]+)/)
      const appErr = text.match(/Application error[:\s]*a server-side exception has occurred[^<]*/i)
      console.log('   ERROR BODY snippet:', (appErr?.[0] || digestMatch?.[1] || text.substring(0, 200)).substring(0, 200))
    }
  }

  // 4. Test creating an app via API directly
  const testPayload = {
    slug: 'debug-test-' + Date.now(),
    title: 'Debug Test App',
    description: null,
    download_url: 'https://example.com/test.apk',
    category_id: 1,
    tag_ids: [],
    screenshots: [],
    icon_url: null,
  }
  const createRes = await fetch(`${BASE}/api/apps`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: rawCookies.join('; '),
    },
    body: JSON.stringify(testPayload),
  })
  console.log('\nCREATE APP status:', createRes.status)
  const createBody = await createRes.text()
  console.log('CREATE APP response:', createBody.substring(0, 300))
}

main().catch(e => console.error('SCRIPT ERR:', e.message))