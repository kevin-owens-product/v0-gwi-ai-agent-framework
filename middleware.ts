import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './lib/auth'

// Public paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/admin/login',
  '/api/auth',
  '/api/admin/auth',
  '/api/webhooks',
  '/api/health',
  '/about',
  '/pricing',
  '/contact',
  '/blog',
  '/docs',
  '/solutions',
  '/careers',
  '/press',
  '/security',
  '/compliance',
  '/terms',
  '/privacy',
  '/cookies',
  '/roadmap',
  '/changelog',
  '/case-studies',
  '/tutorials',
  '/partners',
]

// Check if path is an API route that handles its own authentication
function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/') &&
         !pathname.startsWith('/api/auth') &&
         !pathname.startsWith('/api/webhooks') &&
         !pathname.startsWith('/api/health')
}

// Check if path matches any public path
function isPublicPath(pathname: string): boolean {
  return publicPaths.some(path =>
    pathname === path || pathname.startsWith(`${path}/`)
  )
}

// Static file extensions that should never go through middleware
const STATIC_EXTENSIONS = new Set([
  '.js', '.mjs', '.cjs',
  '.css', '.scss', '.sass', '.less',
  '.map',
  '.json', '.xml',
  '.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.mp3', '.mp4', '.webm', '.ogg', '.wav',
  '.pdf', '.zip', '.tar', '.gz',
  '.txt', '.md', '.html', '.htm',
])

// Check if path is a static asset
function isStaticAsset(pathname: string): boolean {
  // All Next.js internal paths (static, chunks, image optimization, Turbopack, etc.)
  if (pathname.startsWith('/_next')) return true

  // Static folder
  if (pathname.startsWith('/static')) return true

  // Check for known static file extensions
  const lastDotIndex = pathname.lastIndexOf('.')
  if (lastDotIndex !== -1) {
    const extension = pathname.slice(lastDotIndex).toLowerCase()
    if (STATIC_EXTENSIONS.has(extension)) return true
  }

  return false
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // CRITICAL: Immediate pass-through for ALL Next.js internal paths
  // This is the first check to ensure no interference with Turbopack/static files
  if (pathname.startsWith('/_next/') || pathname.startsWith('/_next')) {
    return NextResponse.next()
  }

  // Quick regex check for any file with extension (belt-and-suspenders)
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) {
    return NextResponse.next()
  }

  // Skip static assets (comprehensive check)
  if (isStaticAsset(pathname)) {
    return NextResponse.next()
  }

  // Allow public paths
  if (isPublicPath(pathname)) {
    return addSecurityHeaders(NextResponse.next())
  }

  // API routes handle their own authentication - don't redirect, let them return 401
  if (isApiRoute(pathname)) {
    return addSecurityHeaders(NextResponse.next())
  }

  // Check authentication for protected browser routes
  const session = await auth()

  if (!session) {
    // Redirect to login for protected routes
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Add security headers to all responses
  return addSecurityHeaders(NextResponse.next())
}

// Add security headers to response
function addSecurityHeaders(response: NextResponse): NextResponse {
  // DNS Prefetch Control
  response.headers.set('X-DNS-Prefetch-Control', 'on')

  // Strict Transport Security
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  )

  // Frame Options - prevent clickjacking
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')

  // Content Type Options - prevent MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )

  // XSS Protection (legacy but still useful)
  response.headers.set('X-XSS-Protection', '1; mode=block')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and Next.js internals.
     * This uses a negative lookahead to exclude:
     * - _next (all Next.js files: static, chunks, image, Turbopack runtime, etc.)
     * - Static file extensions (.js, .css, .map, .ico, .png, .jpg, .svg, .woff, etc.)
     * - favicon.ico, public folder, and icon files
     */
    '/((?!_next|static|public|favicon\\.ico|icon-|apple-icon|.*\\.(?:js|css|map|ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot|json|xml|txt|pdf)$).*)',
  ],
}
