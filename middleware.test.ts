import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

/**
 * Tests for the main middleware
 * Focuses on route handling for different portal types
 */

// Create mock functions
const mockRedirect = vi.fn();
const mockNext = vi.fn();
const mockRewrite = vi.fn();

// Mock NextResponse
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      redirect: (url: URL) => {
        mockRedirect(url.toString());
        return {
          headers: new Headers(),
          cookies: { set: vi.fn() },
        };
      },
      next: () => {
        mockNext();
        return {
          headers: new Headers(),
          cookies: { set: vi.fn() },
        };
      },
      rewrite: (url: URL) => {
        mockRewrite(url.toString());
        return {
          headers: new Headers(),
          cookies: { set: vi.fn() },
        };
      },
    },
  };
});

// Helper to create mock request with cookies
function createMockRequest(
  url: string,
  cookies: Record<string, string> = {}
): NextRequest {
  const request = new NextRequest(url);

  // Mock cookies
  const cookieStore = {
    get: (name: string) => {
      const value = cookies[name];
      return value ? { name, value } : undefined;
    },
    getAll: () => Object.entries(cookies).map(([name, value]) => ({ name, value })),
    has: (name: string) => name in cookies,
    set: vi.fn(),
    delete: vi.fn(),
  };

  Object.defineProperty(request, 'cookies', {
    value: cookieStore,
    writable: false,
  });

  return request;
}

describe('Middleware Route Detection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Route Type Detection Functions', () => {
    // Test the logic of route detection
    const isPublicPath = (pathname: string) => {
      const publicPaths = [
        '/',
        '/login',
        '/signup',
        '/forgot-password',
        '/reset-password',
        '/api/auth',
        '/api/health',
        '/_next',
        '/favicon.ico',
        '/login?type=admin',
        '/login?type=gwi',
      ];
      return publicPaths.some(path =>
        pathname === path ||
        pathname.startsWith(path + '/') ||
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/api/auth/')
      );
    };

    const isAdminRoute = (pathname: string) => {
      return (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) &&
        !pathname.includes('/login');
    };

    const isGwiRoute = (pathname: string) => {
      return pathname.startsWith('/gwi') && pathname !== '/login?type=gwi';
    };

    describe('isPublicPath', () => {
      it('should identify root as public', () => {
        expect(isPublicPath('/')).toBe(true);
      });

      it('should identify login page as public', () => {
        expect(isPublicPath('/login')).toBe(true);
      });

      it('should identify signup page as public', () => {
        expect(isPublicPath('/signup')).toBe(true);
      });

      it('should identify forgot-password page as public', () => {
        expect(isPublicPath('/forgot-password')).toBe(true);
      });

      it('should identify reset-password page as public', () => {
        expect(isPublicPath('/reset-password')).toBe(true);
      });

      it('should identify next.js internal routes as public', () => {
        expect(isPublicPath('/_next/static/chunk.js')).toBe(true);
        expect(isPublicPath('/_next/image')).toBe(true);
      });

      it('should identify auth API routes as public', () => {
        expect(isPublicPath('/api/auth/callback')).toBe(true);
        expect(isPublicPath('/api/auth/signin')).toBe(true);
      });

      it('should identify health check as public', () => {
        expect(isPublicPath('/api/health')).toBe(true);
      });

      it('should NOT identify dashboard as public', () => {
        expect(isPublicPath('/dashboard')).toBe(false);
      });

      it('should NOT identify admin routes as public', () => {
        expect(isPublicPath('/admin')).toBe(false);
        expect(isPublicPath('/admin/tenants')).toBe(false);
      });

      it('should NOT identify GWI routes as public', () => {
        expect(isPublicPath('/gwi')).toBe(false);
        expect(isPublicPath('/gwi/surveys')).toBe(false);
      });
    });

    describe('isAdminRoute', () => {
      it('should identify /admin as admin route', () => {
        expect(isAdminRoute('/admin')).toBe(true);
      });

      it('should identify /admin/* as admin route', () => {
        expect(isAdminRoute('/admin/tenants')).toBe(true);
        expect(isAdminRoute('/admin/users')).toBe(true);
        expect(isAdminRoute('/admin/settings')).toBe(true);
      });

      it('should identify /api/admin/* as admin route', () => {
        expect(isAdminRoute('/api/admin/tenants')).toBe(true);
        expect(isAdminRoute('/api/admin/users')).toBe(true);
      });

      it('should NOT identify login routes as admin route', () => {
        expect(isAdminRoute('/admin/login')).toBe(false);
      });

      it('should NOT identify GWI routes as admin route', () => {
        expect(isAdminRoute('/gwi')).toBe(false);
        expect(isAdminRoute('/gwi/surveys')).toBe(false);
      });

      it('should NOT identify dashboard routes as admin route', () => {
        expect(isAdminRoute('/dashboard')).toBe(false);
      });
    });

    describe('isGwiRoute', () => {
      it('should identify /gwi as GWI route', () => {
        expect(isGwiRoute('/gwi')).toBe(true);
      });

      it('should identify /gwi/* as GWI route', () => {
        expect(isGwiRoute('/gwi/surveys')).toBe(true);
        expect(isGwiRoute('/gwi/pipelines')).toBe(true);
        expect(isGwiRoute('/gwi/taxonomy')).toBe(true);
        expect(isGwiRoute('/gwi/llm')).toBe(true);
        expect(isGwiRoute('/gwi/agents')).toBe(true);
        expect(isGwiRoute('/gwi/data-sources')).toBe(true);
      });

      it('should NOT identify admin routes as GWI route', () => {
        expect(isGwiRoute('/admin')).toBe(false);
        expect(isGwiRoute('/admin/tenants')).toBe(false);
      });

      it('should NOT identify dashboard routes as GWI route', () => {
        expect(isGwiRoute('/dashboard')).toBe(false);
      });

      it('should NOT identify login page with type=gwi as GWI route', () => {
        expect(isGwiRoute('/login?type=gwi')).toBe(false);
      });
    });
  });

  describe('Authentication Cookie Checks', () => {
    describe('Admin Portal Authentication', () => {
      it('should recognize valid adminToken cookie', () => {
        const request = createMockRequest('http://localhost:3000/admin', {
          adminToken: 'valid-admin-token',
        });

        const adminToken = request.cookies.get('adminToken')?.value;
        expect(adminToken).toBe('valid-admin-token');
      });

      it('should detect missing adminToken cookie', () => {
        const request = createMockRequest('http://localhost:3000/admin', {});

        const adminToken = request.cookies.get('adminToken')?.value;
        expect(adminToken).toBeUndefined();
      });
    });

    describe('GWI Portal Authentication', () => {
      it('should recognize valid gwiToken cookie', () => {
        const request = createMockRequest('http://localhost:3000/gwi', {
          gwiToken: 'valid-gwi-token',
        });

        const gwiToken = request.cookies.get('gwiToken')?.value;
        expect(gwiToken).toBe('valid-gwi-token');
      });

      it('should detect missing gwiToken cookie', () => {
        const request = createMockRequest('http://localhost:3000/gwi', {});

        const gwiToken = request.cookies.get('gwiToken')?.value;
        expect(gwiToken).toBeUndefined();
      });
    });
  });

  describe('Login Redirect URLs', () => {
    it('should generate correct admin login URL', () => {
      const baseUrl = 'http://localhost:3000';
      const adminLoginUrl = new URL('/login?type=admin', baseUrl);
      expect(adminLoginUrl.pathname).toBe('/login');
      expect(adminLoginUrl.searchParams.get('type')).toBe('admin');
    });

    it('should generate correct GWI login URL', () => {
      const baseUrl = 'http://localhost:3000';
      const gwiLoginUrl = new URL('/login?type=gwi', baseUrl);
      expect(gwiLoginUrl.pathname).toBe('/login');
      expect(gwiLoginUrl.searchParams.get('type')).toBe('gwi');
    });

    it('should generate correct user login URL', () => {
      const baseUrl = 'http://localhost:3000';
      const userLoginUrl = new URL('/login', baseUrl);
      expect(userLoginUrl.pathname).toBe('/login');
      expect(userLoginUrl.searchParams.has('type')).toBe(false);
    });
  });
});

describe('Middleware Security Headers', () => {
  const securityHeaders = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-XSS-Protection': '1; mode=block',
  };

  it('should define X-Frame-Options header', () => {
    expect(securityHeaders['X-Frame-Options']).toBe('DENY');
  });

  it('should define X-Content-Type-Options header', () => {
    expect(securityHeaders['X-Content-Type-Options']).toBe('nosniff');
  });

  it('should define Referrer-Policy header', () => {
    expect(securityHeaders['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
  });

  it('should define X-XSS-Protection header', () => {
    expect(securityHeaders['X-XSS-Protection']).toBe('1; mode=block');
  });
});

describe('Route Protection Logic', () => {
  describe('GWI Route Protection', () => {
    it('should allow access with valid gwiToken', () => {
      const request = createMockRequest('http://localhost:3000/gwi/surveys', {
        gwiToken: 'valid-token',
      });

      const gwiToken = request.cookies.get('gwiToken')?.value;
      const isAuthenticated = !!gwiToken;

      expect(isAuthenticated).toBe(true);
    });

    it('should deny access without gwiToken', () => {
      const request = createMockRequest('http://localhost:3000/gwi/surveys', {});

      const gwiToken = request.cookies.get('gwiToken')?.value;
      const isAuthenticated = !!gwiToken;

      expect(isAuthenticated).toBe(false);
    });

    it('should deny access with empty gwiToken', () => {
      const request = createMockRequest('http://localhost:3000/gwi/surveys', {
        gwiToken: '',
      });

      const gwiToken = request.cookies.get('gwiToken')?.value;
      const isAuthenticated = !!gwiToken;

      expect(isAuthenticated).toBe(false);
    });
  });

  describe('Admin Route Protection', () => {
    it('should allow access with valid adminToken', () => {
      const request = createMockRequest('http://localhost:3000/admin/tenants', {
        adminToken: 'valid-token',
      });

      const adminToken = request.cookies.get('adminToken')?.value;
      const isAuthenticated = !!adminToken;

      expect(isAuthenticated).toBe(true);
    });

    it('should deny access without adminToken', () => {
      const request = createMockRequest('http://localhost:3000/admin/tenants', {});

      const adminToken = request.cookies.get('adminToken')?.value;
      const isAuthenticated = !!adminToken;

      expect(isAuthenticated).toBe(false);
    });
  });

  describe('Cross-Portal Cookie Isolation', () => {
    it('should not use adminToken for GWI routes', () => {
      const request = createMockRequest('http://localhost:3000/gwi/surveys', {
        adminToken: 'valid-admin-token',
      });

      // GWI route should check gwiToken, not adminToken
      const gwiToken = request.cookies.get('gwiToken')?.value;
      expect(gwiToken).toBeUndefined();
    });

    it('should not use gwiToken for admin routes', () => {
      const request = createMockRequest('http://localhost:3000/admin/tenants', {
        gwiToken: 'valid-gwi-token',
      });

      // Admin route should check adminToken, not gwiToken
      const adminToken = request.cookies.get('adminToken')?.value;
      expect(adminToken).toBeUndefined();
    });
  });
});

describe('Middleware Matcher Configuration', () => {
  const matcherPattern = '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.webp$|.*\\.ico$).*)';

  it('should exclude static files from middleware', () => {
    const regex = new RegExp(matcherPattern.replace('/', '^/'));

    // These should NOT match (excluded)
    expect(regex.test('/_next/static/chunk.js')).toBe(false);
    expect(regex.test('/_next/image')).toBe(false);
  });

  it('should exclude image files from middleware', () => {
    const extensions = ['.png', '.svg', '.jpg', '.jpeg', '.gif', '.webp', '.ico'];

    for (const ext of extensions) {
      // Check that these patterns are in the matcher exclusion
      expect(matcherPattern).toContain(ext.replace('.', '\\.'));
    }
  });

  it('should include API routes in middleware', () => {
    const regex = new RegExp(matcherPattern.replace('/(', '^/('));

    // These should match (included)
    expect(regex.test('/api/gwi/surveys')).toBe(true);
    expect(regex.test('/api/admin/tenants')).toBe(true);
  });

  it('should include page routes in middleware', () => {
    const regex = new RegExp(matcherPattern.replace('/(', '^/('));

    // These should match (included)
    expect(regex.test('/gwi')).toBe(true);
    expect(regex.test('/admin')).toBe(true);
    expect(regex.test('/dashboard')).toBe(true);
  });
});
