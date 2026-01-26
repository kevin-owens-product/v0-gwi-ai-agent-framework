/**
 * @prompt-id forge-v4.1:feature:data-export:012
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4.5
 *
 * Data Export Service Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Prisma client - use vi.hoisted to ensure it's available when vi.mock runs
const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    user: {
      findUnique: vi.fn(),
    },
    userPreferences: {
      findUnique: vi.fn(),
    },
    organizationMember: {
      findMany: vi.fn(),
    },
    agent: {
      findMany: vi.fn(),
    },
    report: {
      findMany: vi.fn(),
    },
    dashboard: {
      findMany: vi.fn(),
    },
    auditLog: {
      findMany: vi.fn(),
    },
    apiKey: {
      findMany: vi.fn(),
    },
    comment: {
      findMany: vi.fn(),
    },
    savedView: {
      findMany: vi.fn(),
    },
    dataExport: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}))

vi.mock('./db', () => ({
  prisma: mockPrisma,
}))

// Import after mocking
import {
  collectUserData,
  createExportRequest,
  getExportStatus,
  getUserExports,
  canDownloadExport,
} from './data-export'

describe('Data Export Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('collectUserData', () => {
    it('should collect all user data', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        avatarUrl: null,
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockPreferences = {
        theme: 'LIGHT',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MMM dd, yyyy',
        timeFormat: 'HH:mm',
        keyboardShortcuts: true,
        emailNotifications: true,
        pushNotifications: true,
        inAppNotifications: true,
        weeklyDigest: true,
        compactMode: false,
        sidebarCollapsed: false,
        defaultDashboard: null,
        tourCompleted: false,
        metadata: {},
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.userPreferences.findUnique.mockResolvedValue(mockPreferences)
      mockPrisma.organizationMember.findMany.mockResolvedValue([
        {
          orgId: 'org-1',
          role: 'MEMBER',
          joinedAt: new Date(),
          organization: { name: 'Test Org' },
        },
      ])
      mockPrisma.agent.findMany.mockResolvedValue([])
      mockPrisma.report.findMany.mockResolvedValue([])
      mockPrisma.dashboard.findMany.mockResolvedValue([])
      mockPrisma.auditLog.findMany.mockResolvedValue([])
      mockPrisma.apiKey.findMany.mockResolvedValue([])
      mockPrisma.comment.findMany.mockResolvedValue([])
      mockPrisma.savedView.findMany.mockResolvedValue([])

      const result = await collectUserData('user-1')

      expect(result.exportMetadata.gdprCompliant).toBe(true)
      expect(result.profile.id).toBe('user-1')
      expect(result.profile.email).toBe('test@example.com')
      expect(result.preferences).toBeDefined()
      expect(result.organizationMemberships).toHaveLength(1)
    })

    it('should throw error if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      await expect(collectUserData('nonexistent')).rejects.toThrow('User not found')
    })

    it('should handle user with no preferences', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        avatarUrl: null,
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser)
      mockPrisma.userPreferences.findUnique.mockResolvedValue(null)
      mockPrisma.organizationMember.findMany.mockResolvedValue([])
      mockPrisma.agent.findMany.mockResolvedValue([])
      mockPrisma.report.findMany.mockResolvedValue([])
      mockPrisma.dashboard.findMany.mockResolvedValue([])
      mockPrisma.auditLog.findMany.mockResolvedValue([])
      mockPrisma.apiKey.findMany.mockResolvedValue([])
      mockPrisma.comment.findMany.mockResolvedValue([])
      mockPrisma.savedView.findMany.mockResolvedValue([])

      const result = await collectUserData('user-1')

      expect(result.preferences).toBeNull()
    })
  })

  describe('createExportRequest', () => {
    it('should create a new export request', async () => {
      mockPrisma.dataExport.findFirst.mockResolvedValue(null)
      mockPrisma.dataExport.create.mockResolvedValue({
        id: 'export-1',
        type: 'GDPR_REQUEST',
        status: 'PENDING',
        userId: 'user-1',
        requestedBy: 'user-1',
        format: 'json',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      })

      const result = await createExportRequest('user-1')

      expect(result.id).toBe('export-1')
      expect(result.status).toBe('PENDING')
      expect(mockPrisma.dataExport.create).toHaveBeenCalled()
    })

    it('should throw error if export already in progress', async () => {
      mockPrisma.dataExport.findFirst.mockResolvedValue({
        id: 'existing-export',
        status: 'PROCESSING',
      })

      await expect(createExportRequest('user-1')).rejects.toThrow(
        'An export request is already in progress'
      )
    })

    it('should create USER_DATA_REQUEST type when specified', async () => {
      mockPrisma.dataExport.findFirst.mockResolvedValue(null)
      mockPrisma.dataExport.create.mockResolvedValue({
        id: 'export-1',
        type: 'USER_DATA_REQUEST',
        status: 'PENDING',
        userId: 'user-1',
        requestedBy: 'user-1',
        format: 'json',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      })

      const result = await createExportRequest('user-1', 'USER_DATA_REQUEST')

      expect(result.type).toBe('USER_DATA_REQUEST')
    })
  })

  describe('getExportStatus', () => {
    it('should return export status for valid user', async () => {
      mockPrisma.dataExport.findUnique.mockResolvedValue({
        id: 'export-1',
        userId: 'user-1',
        status: 'COMPLETED',
        type: 'GDPR_REQUEST',
        format: 'json',
        fileSize: BigInt(1000),
        createdAt: new Date(),
        startedAt: new Date(),
        completedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        error: null,
      })

      const result = await getExportStatus('export-1', 'user-1')

      expect(result).not.toBeNull()
      expect(result?.status).toBe('COMPLETED')
      expect(result?.fileSize).toBe(1000)
    })

    it('should return null for unauthorized user', async () => {
      mockPrisma.dataExport.findUnique.mockResolvedValue({
        id: 'export-1',
        userId: 'user-1',
      })

      const result = await getExportStatus('export-1', 'different-user')

      expect(result).toBeNull()
    })

    it('should return null for non-existent export', async () => {
      mockPrisma.dataExport.findUnique.mockResolvedValue(null)

      const result = await getExportStatus('nonexistent', 'user-1')

      expect(result).toBeNull()
    })
  })

  describe('getUserExports', () => {
    it('should return all exports for user', async () => {
      mockPrisma.dataExport.findMany.mockResolvedValue([
        {
          id: 'export-1',
          type: 'GDPR_REQUEST',
          status: 'COMPLETED',
          format: 'json',
          fileSize: BigInt(1000),
          createdAt: new Date(),
          startedAt: new Date(),
          completedAt: new Date(),
          expiresAt: new Date(),
          error: null,
        },
        {
          id: 'export-2',
          type: 'USER_DATA_REQUEST',
          status: 'PENDING',
          format: 'json',
          fileSize: null,
          createdAt: new Date(),
          startedAt: null,
          completedAt: null,
          expiresAt: new Date(),
          error: null,
        },
      ])

      const result = await getUserExports('user-1')

      expect(result).toHaveLength(2)
      expect(result[0].fileSize).toBe(1000)
      expect(result[1].fileSize).toBeNull()
    })

    it('should return empty array for user with no exports', async () => {
      mockPrisma.dataExport.findMany.mockResolvedValue([])

      const result = await getUserExports('user-1')

      expect(result).toHaveLength(0)
    })
  })

  describe('canDownloadExport', () => {
    it('should allow download for completed export', async () => {
      mockPrisma.dataExport.findUnique.mockResolvedValue({
        id: 'export-1',
        userId: 'user-1',
        status: 'COMPLETED',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      })

      const result = await canDownloadExport('export-1', 'user-1')

      expect(result.canDownload).toBe(true)
    })

    it('should not allow download for expired export', async () => {
      mockPrisma.dataExport.findUnique.mockResolvedValue({
        id: 'export-1',
        userId: 'user-1',
        status: 'COMPLETED',
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      })
      mockPrisma.dataExport.update.mockResolvedValue({})

      const result = await canDownloadExport('export-1', 'user-1')

      expect(result.canDownload).toBe(false)
      expect(result.reason).toBe('Export has expired')
    })

    it('should not allow download for unauthorized user', async () => {
      mockPrisma.dataExport.findUnique.mockResolvedValue({
        id: 'export-1',
        userId: 'user-1',
        status: 'COMPLETED',
      })

      const result = await canDownloadExport('export-1', 'different-user')

      expect(result.canDownload).toBe(false)
      expect(result.reason).toBe('Unauthorized')
    })

    it('should not allow download for non-completed export', async () => {
      mockPrisma.dataExport.findUnique.mockResolvedValue({
        id: 'export-1',
        userId: 'user-1',
        status: 'PROCESSING',
      })

      const result = await canDownloadExport('export-1', 'user-1')

      expect(result.canDownload).toBe(false)
      expect(result.reason).toBe('Export status is PROCESSING')
    })

    it('should not allow download for non-existent export', async () => {
      mockPrisma.dataExport.findUnique.mockResolvedValue(null)

      const result = await canDownloadExport('nonexistent', 'user-1')

      expect(result.canDownload).toBe(false)
      expect(result.reason).toBe('Export not found')
    })
  })
})
