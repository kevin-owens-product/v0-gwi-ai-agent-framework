/**
 * @prompt-id forge-v4.1:feature:email-template-management:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    emailTemplate: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    emailTemplateVersion: {
      create: vi.fn(),
      findFirst: vi.fn(),
    },
    platformAuditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

vi.mock('@/lib/super-admin', () => ({
  validateSuperAdminSession: vi.fn(),
  logPlatformAudit: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(() => ({ value: 'mock-token' })),
  })),
}))

import { GET, POST } from './route'
import { prisma } from '@/lib/db'
import { validateSuperAdminSession, logPlatformAudit } from '@/lib/super-admin'

describe('GET /api/admin/email-templates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if no token provided', async () => {
    const { cookies } = await import('next/headers')
    vi.mocked(cookies).mockResolvedValueOnce({
      get: vi.fn(() => undefined),
    } as any)

    const request = new NextRequest('http://localhost/api/admin/email-templates')
    const response = await GET(request)

    expect(response.status).toBe(401)
  })

  it('should return 401 if session is invalid', async () => {
    vi.mocked(validateSuperAdminSession).mockResolvedValueOnce(null)

    const request = new NextRequest('http://localhost/api/admin/email-templates')
    const response = await GET(request)

    expect(response.status).toBe(401)
  })

  it('should return templates when authenticated', async () => {
    vi.mocked(validateSuperAdminSession).mockResolvedValueOnce({
      admin: { id: 'admin-1', email: 'admin@test.com' },
    } as any)

    const mockTemplates = [
      {
        id: '1',
        name: 'Welcome Email',
        slug: 'welcome',
        subject: 'Welcome',
        category: 'ONBOARDING',
        isActive: true,
        isSystem: true,
        version: 1,
        _count: { versions: 1 },
      },
    ]

    vi.mocked(prisma.emailTemplate.findMany).mockResolvedValueOnce(mockTemplates as any)

    const request = new NextRequest('http://localhost/api/admin/email-templates')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.templates).toHaveLength(1)
    expect(data.templates[0].name).toBe('Welcome Email')
  })

  it('should filter by category when provided', async () => {
    vi.mocked(validateSuperAdminSession).mockResolvedValueOnce({
      admin: { id: 'admin-1' },
    } as any)

    vi.mocked(prisma.emailTemplate.findMany).mockResolvedValueOnce([])

    const request = new NextRequest(
      'http://localhost/api/admin/email-templates?category=AUTHENTICATION'
    )
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prisma.emailTemplate.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: 'AUTHENTICATION',
        }),
      })
    )
  })

  it('should search templates when search query provided', async () => {
    vi.mocked(validateSuperAdminSession).mockResolvedValueOnce({
      admin: { id: 'admin-1' },
    } as any)

    vi.mocked(prisma.emailTemplate.findMany).mockResolvedValueOnce([])

    const request = new NextRequest(
      'http://localhost/api/admin/email-templates?search=welcome'
    )
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(prisma.emailTemplate.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            { name: { contains: 'welcome', mode: 'insensitive' } },
          ]),
        }),
      })
    )
  })
})

describe('POST /api/admin/email-templates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    vi.mocked(validateSuperAdminSession).mockResolvedValueOnce(null)

    const request = new NextRequest('http://localhost/api/admin/email-templates', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const response = await POST(request)

    expect(response.status).toBe(401)
  })

  it('should return 400 if required fields are missing', async () => {
    vi.mocked(validateSuperAdminSession).mockResolvedValueOnce({
      admin: { id: 'admin-1' },
    } as any)

    const request = new NextRequest('http://localhost/api/admin/email-templates', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toContain('Missing required fields')
  })

  it('should return 409 if slug already exists', async () => {
    vi.mocked(validateSuperAdminSession).mockResolvedValueOnce({
      admin: { id: 'admin-1' },
    } as any)

    vi.mocked(prisma.emailTemplate.findUnique).mockResolvedValueOnce({
      id: 'existing',
    } as any)

    const request = new NextRequest('http://localhost/api/admin/email-templates', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Template',
        slug: 'existing-slug',
        subject: 'Test Subject',
        category: 'NOTIFICATION',
        htmlContent: '<p>Test</p>',
      }),
    })
    const response = await POST(request)

    expect(response.status).toBe(409)
  })

  it('should create template and version when valid', async () => {
    vi.mocked(validateSuperAdminSession).mockResolvedValueOnce({
      admin: { id: 'admin-1' },
    } as any)

    vi.mocked(prisma.emailTemplate.findUnique).mockResolvedValueOnce(null)
    vi.mocked(prisma.emailTemplate.create).mockResolvedValueOnce({
      id: 'new-template',
      name: 'Test Template',
      slug: 'test_template',
      subject: 'Test Subject',
      category: 'NOTIFICATION',
      htmlContent: '<p>Test {{userName}}</p>',
    } as any)

    const request = new NextRequest('http://localhost/api/admin/email-templates', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Template',
        slug: 'test_template',
        subject: 'Test Subject',
        category: 'NOTIFICATION',
        htmlContent: '<p>Test {{userName}}</p>',
      }),
    })
    const response = await POST(request)

    expect(response.status).toBe(201)
    expect(prisma.emailTemplate.create).toHaveBeenCalled()
    expect(prisma.emailTemplateVersion.create).toHaveBeenCalled()
    expect(logPlatformAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'create_email_template',
        resourceType: 'email_template',
      })
    )
  })
})
