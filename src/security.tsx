import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { jsxRenderer } from 'hono/jsx-renderer'
import { products, categories, getProductsByCategory, getProductById, getFeaturedProducts } from './data/products'

const app = new Hono()

// ===================== SECURITY MIDDLEWARE =====================

// 1. Force HTTPS — redirect any plain HTTP request to HTTPS
app.use('*', async (c, next) => {
  const proto = c.req.header('x-forwarded-proto') || c.req.header('cf-visitor')
  if (proto && proto.includes('http:')) {
    const httpsUrl = c.req.url.replace(/^http:\/\//, 'https://')
    return c.redirect(httpsUrl, 301)
  }
  await next()
})

// 2. Security Headers — industry-standard HTTP security headers
app.use('*', secureHeaders({
  strictTransportSecurity: 'max-age=31536000; includeSubDomains; preload',
  xContentTypeOptions: 'nosniff',
  xFrameOptions: 'DENY',
  referrerPolicy: 'strict-origin-when-cross-origin',
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: [],
    paymentRequest: [],
  },
}))

// 3. Custom Security Headers (CSP, additional headers)
app.use('*', async (c, next) => {
  await next()
  // Content Security Policy — only allow trusted sources
  c.res.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://fonts.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://fonts.googleapis.com https://fonts.gstatic.com",
      "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net data:",
      "img-src 'self' data: blob: https://sspark.genspark.ai https://*.genspark.ai https://*.cloudflare.com",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://kp-stores.printify.me",
      "upgrade-insecure-requests",
    ].join('; ')
  )
  // Extra hardening headers
  c.res.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
  c.res.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none')
  c.res.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
  c.res.headers.set('Cross-Origin-Resource-Policy', 'same-origin')
  c.res.headers.set('X-DNS-Prefetch-Control', 'off')
  c.res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  c.res.headers.set('Pragma', 'no-cache')
})

// 4. CORS — only allow same-origin API calls
app.use('/api/*', cors({
  origin: [
    'https://kp-stores.krishpatel1843.workers.dev',
    'https://kp-stores.printify.me',
  ],
  allowMethods: ['GET'],
  allowHeaders: ['Content-Type'],
  maxAge: 86400,
}))

// 5. Rate limiting (simple in-memory per-IP counter)
const rateLimitMap = new Map<string, { count: number; ts: number }>()
app.use('*', async (c, next) => {
  const ip =
    c.req.header('cf-connecting-ip') ||
    c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
    'unknown'
  const now = Date.now()
  const window = 60_000 // 1 minute
  const limit = 120     // 120 requests per minute per IP

  const entry = rateLimitMap.get(ip)
  if (entry && now - entry.ts < window) {
    entry.count++
    if (entry.count > limit) {
      return c.text('Too Many Requests', 429)
    }
  } else {
    rateLimitMap.set(ip, { count: 1, ts: now })
  }
  // Clean up old entries periodically
  if (rateLimitMap.size > 5000) {
    for (const [k, v] of rateLimitMap) {
      if (now - v.ts > window) rateLimitMap.delete(k)
    }
  }
  await next()
})

// 6. Block suspicious requests (common attack patterns)
app.use('*', async (c, next) => {
  const url = c.req.url.toLowerCase()
  const badPatterns = [
    '../', '.env', 'wp-admin', 'phpinfo', '/.git',
    '/etc/passwd', 'select%20', 'union%20', '<script',
    'javascript:', 'vbscript:', 'onload=', 'onerror=',
  ]
  if (badPatterns.some(p => url.includes(p))) {
    return c.text('Forbidden', 403)
  }
  await next()
})

