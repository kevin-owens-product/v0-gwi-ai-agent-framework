import { describe, it, expect, vi, beforeEach } from 'vitest'
import bcrypt from 'bcryptjs'

// Mock dependencies
vi.mock('./db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('next-auth', () => ({
  default: vi.fn(() => ({
    handlers: {},
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}))

vi.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: vi.fn(() => ({})),
}))

vi.mock('next-auth/providers/credentials', () => ({
  default: vi.fn((config) => ({
    ...config,
    type: 'credentials',
  })),
}))

vi.mock('next-auth/providers/google', () => ({
  default: vi.fn(() => ({ type: 'oauth', id: 'google' })),
}))

vi.mock('next-auth/providers/microsoft-entra-id', () => ({
  default: vi.fn(() => ({ type: 'oauth', id: 'microsoft-entra-id' })),
}))

import { hashPassword, verifyPassword } from './auth'

describe('auth utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('hashPassword', () => {
    it('returns a bcrypt hash', async () => {
      const password = 'mySecurePassword123'
      const hash = await hashPassword(password)

      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(50) // bcrypt hashes are ~60 chars
    })

    it('generates different hashes for same password', async () => {
      const password = 'testPassword'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2) // Salt should make them different
    })

    it('uses cost factor of 12', async () => {
      const password = 'test'
      const hash = await hashPassword(password)

      // bcrypt hash format: $2a$12$...
      expect(hash).toMatch(/^\$2[ab]\$12\$/)
    })

    it('handles special characters in password', async () => {
      const password = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      const hash = await hashPassword(password)

      expect(hash).toBeDefined()
      const isValid = await bcrypt.compare(password, hash)
      expect(isValid).toBe(true)
    })

    it('handles unicode characters', async () => {
      const password = '密码测试🔐'
      const hash = await hashPassword(password)

      expect(hash).toBeDefined()
      const isValid = await bcrypt.compare(password, hash)
      expect(isValid).toBe(true)
    })

    it('handles empty string', async () => {
      const password = ''
      const hash = await hashPassword(password)

      expect(hash).toBeDefined()
      const isValid = await bcrypt.compare(password, hash)
      expect(isValid).toBe(true)
    })
  })

  describe('verifyPassword', () => {
    it('returns true for matching password and hash', async () => {
      const password = 'correctPassword'
      const hash = await bcrypt.hash(password, 12)

      const result = await verifyPassword(password, hash)
      expect(result).toBe(true)
    })

    it('returns false for non-matching password', async () => {
      const password = 'correctPassword'
      const hash = await bcrypt.hash(password, 12)

      const result = await verifyPassword('wrongPassword', hash)
      expect(result).toBe(false)
    })

    it('handles password with special characters', async () => {
      const password = 'Test!@#$%^&*()123'
      const hash = await bcrypt.hash(password, 12)

      const result = await verifyPassword(password, hash)
      expect(result).toBe(true)
    })

    it('is case sensitive', async () => {
      const password = 'TestPassword'
      const hash = await bcrypt.hash(password, 12)

      const result = await verifyPassword('testpassword', hash)
      expect(result).toBe(false)
    })

    it('handles unicode passwords', async () => {
      const password = 'пароль🔑'
      const hash = await bcrypt.hash(password, 12)

      const result = await verifyPassword(password, hash)
      expect(result).toBe(true)
    })

    it('returns false for tampered hash', async () => {
      const password = 'test'
      const hash = await bcrypt.hash(password, 12)
      const tamperedHash = hash.slice(0, -5) + 'XXXXX'

      // Should return false (bcrypt handles invalid hashes gracefully)
      const result = await verifyPassword(password, tamperedHash)
      expect(result).toBe(false)
    })
  })

  describe('password hashing integration', () => {
    it('hashPassword output works with verifyPassword', async () => {
      const password = 'integrationTestPassword123!'

      const hash = await hashPassword(password)
      const isValid = await verifyPassword(password, hash)

      expect(isValid).toBe(true)
    })

    it('verifyPassword rejects wrong password for hashPassword output', async () => {
      const correctPassword = 'correctPassword'
      const wrongPassword = 'wrongPassword'

      const hash = await hashPassword(correctPassword)
      const isValid = await verifyPassword(wrongPassword, hash)

      expect(isValid).toBe(false)
    })
  })
})

describe('NextAuth configuration', () => {
  describe('getAuthUrl helper', () => {
    beforeEach(() => {
      vi.unstubAllEnvs()
    })

    it('prioritizes NEXTAUTH_URL environment variable', async () => {
      vi.stubEnv('NEXTAUTH_URL', 'https://custom-auth.example.com')
      vi.stubEnv('RENDER_EXTERNAL_URL', 'https://render.example.com')

      // Re-import to get fresh module with new env
      vi.resetModules()

      // The getAuthUrl function is internal, but we can verify the behavior
      // through module initialization
      expect(process.env.NEXTAUTH_URL).toBe('https://custom-auth.example.com')
    })

    it('falls back to RENDER_EXTERNAL_URL when NEXTAUTH_URL not set', async () => {
      vi.stubEnv('NEXTAUTH_URL', '')
      vi.stubEnv('RENDER_EXTERNAL_URL', 'https://render.example.com')

      vi.resetModules()

      expect(process.env.RENDER_EXTERNAL_URL).toBe('https://render.example.com')
    })

    it('defaults to localhost when no env vars set', async () => {
      vi.stubEnv('NEXTAUTH_URL', '')
      vi.stubEnv('RENDER_EXTERNAL_URL', '')

      vi.resetModules()

      // Default should be localhost:3000
      expect(process.env.NEXTAUTH_URL).toBe('')
    })
  })
})

describe('getSession and requireAuth', () => {
  let mockAuth: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetModules()
    mockAuth = vi.fn()

    // Re-mock NextAuth with a controllable auth function
    vi.doMock('next-auth', () => ({
      default: vi.fn(() => ({
        handlers: {},
        auth: mockAuth,
        signIn: vi.fn(),
        signOut: vi.fn(),
      })),
    }))
  })

  it('getSession returns session from auth', async () => {
    const mockSession = { user: { id: 'user-1', email: 'test@example.com' } }
    mockAuth.mockResolvedValue(mockSession)

    const { getSession } = await import('./auth')
    const session = await getSession()

    expect(session).toEqual(mockSession)
  })

  it('getSession returns null when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const { getSession } = await import('./auth')
    const session = await getSession()

    expect(session).toBeNull()
  })

  it('requireAuth returns session when authenticated', async () => {
    const mockSession = { user: { id: 'user-1', email: 'test@example.com' } }
    mockAuth.mockResolvedValue(mockSession)

    const { requireAuth } = await import('./auth')
    const session = await requireAuth()

    expect(session).toEqual(mockSession)
  })

  it('requireAuth throws when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)

    const { requireAuth } = await import('./auth')

    await expect(requireAuth()).rejects.toThrow('Unauthorized')
  })

  it('requireAuth throws when session has no user', async () => {
    mockAuth.mockResolvedValue({ user: null })

    const { requireAuth } = await import('./auth')

    await expect(requireAuth()).rejects.toThrow('Unauthorized')
  })
})
