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

// Check if path is a static asset
function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Has file extension
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static assets
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
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|icon-.*|apple-icon.*).*)',
  ],
}
