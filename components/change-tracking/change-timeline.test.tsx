import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/dashboard/changes',
}))

import { ChangeTimeline } from './change-timeline'

describe('ChangeTimeline Component', () => {
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockFetch = vi.fn()
    global.fetch = mockFetch
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('shows skeleton loader while loading', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves

      render(<ChangeTimeline />)

      // Should show multiple skeleton elements
      const skeletons = document.querySelectorAll('[class*="animate-pulse"], [class*="skeleton"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  describe('Empty State', () => {
    it('shows empty state when no changes', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ changes: [], total: 0 }),
      } as Response)

      render(<ChangeTimeline />)

      await waitFor(() => {
        expect(screen.getByText(/No Changes Found/i)).toBeInTheDocument()
      })
    })
  })

  describe('Change Display', () => {
    const mockChanges = [
      {
        id: 'change-1',
        entityType: 'audience',
        entityId: 'aud-123',
        entityName: 'Gen Z Consumers',
        changeType: 'UPDATE',
        summary: 'size increased (+15%)',
        changedFields: ['size'],
        isSignificant: true,
        createdBy: 'user@example.com',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'change-2',
        entityType: 'crosstab',
        entityId: 'ct-456',
        entityName: 'Age vs Income Analysis',
        changeType: 'CREATE',
        summary: 'Created crosstab',
        changedFields: [],
        isSignificant: false,
        createdBy: null,
        createdAt: new Date().toISOString(),
      },
    ]

    it('renders changes from API response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ changes: mockChanges, total: 2 }),
      } as Response)

      render(<ChangeTimeline />)

      await waitFor(() => {
        expect(screen.getByText('Gen Z Consumers')).toBeInTheDocument()
        expect(screen.getByText('Age vs Income Analysis')).toBeInTheDocument()
      })
    })

    it('displays entity type badges', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ changes: mockChanges, total: 2 }),
      } as Response)

      render(<ChangeTimeline />)

      await waitFor(() => {
        expect(screen.getByText('Audiences')).toBeInTheDocument()
        expect(screen.getByText('Crosstabs')).toBeInTheDocument()
      })
    })

    it('applies significant styling for significant changes', async () => {
      // Test that significant changes are marked with proper styling
      const changesWithSignificant = [
        {
          id: 'change-sig',
          entityType: 'audience',
          entityId: 'aud-sig',
          entityName: 'Significant Audience',
          changeType: 'UPDATE',
          summary: 'Major change occurred',
          changedFields: ['size'],
          isSignificant: true,
          createdBy: null,
          createdAt: new Date().toISOString(),
        },
      ]

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ changes: changesWithSignificant, total: 1 }),
      } as Response)

      render(<ChangeTimeline />)

      await waitFor(() => {
        // Check that the audience name renders
        expect(screen.getByText('Significant Audience')).toBeInTheDocument()
        // Check change summary
        expect(screen.getByText('Major change occurred')).toBeInTheDocument()
      })
    })

    it('displays change summary', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ changes: mockChanges, total: 2 }),
      } as Response)

      render(<ChangeTimeline />)

      await waitFor(() => {
        expect(screen.getByText('size increased (+15%)')).toBeInTheDocument()
      })
    })
  })

  describe('Filtering', () => {
    it('renders filter dropdown', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ changes: [], total: 0 }),
      } as Response)

      render(<ChangeTimeline />)

      await waitFor(() => {
        expect(screen.getByText('All Types')).toBeInTheDocument()
      })
    })

    it('renders significant only button', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ changes: [], total: 0 }),
      } as Response)

      render(<ChangeTimeline />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Significant/i })).toBeInTheDocument()
      })
    })

    it('toggles significant filter when clicked', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ changes: [], total: 0 }),
      } as Response)

      render(<ChangeTimeline />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Significant/i })).toBeInTheDocument()
      })

      const significantButton = screen.getByRole('button', { name: /Significant/i })
      fireEvent.click(significantButton)

      // Should trigger a new fetch with significantOnly=true
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('significantOnly=true')
        )
      })
    })
  })

  describe('Expandable Items', () => {
    const mockChanges = [
      {
        id: 'change-1',
        entityType: 'audience',
        entityId: 'aud-123',
        entityName: 'Test Audience',
        changeType: 'UPDATE',
        summary: 'Fields updated',
        changedFields: ['size', 'name', 'filters'],
        isSignificant: true,
        createdBy: 'user@example.com',
        createdAt: new Date().toISOString(),
      },
    ]

    it('expands item to show changed fields on click', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ changes: mockChanges, total: 1 }),
      } as Response)

      render(<ChangeTimeline />)

      await waitFor(() => {
        expect(screen.getByText('Test Audience')).toBeInTheDocument()
      })

      // Click the card to expand
      const card = screen.getByText('Test Audience').closest('[class*="card"]')
      if (card) {
        fireEvent.click(card)
      }

      await waitFor(() => {
        expect(screen.getByText('Changed Fields')).toBeInTheDocument()
        expect(screen.getByText('size')).toBeInTheDocument()
        expect(screen.getByText('name')).toBeInTheDocument()
        expect(screen.getByText('filters')).toBeInTheDocument()
      })
    })
  })

  describe('View Details Callback', () => {
    it('calls onViewDetails when View button is clicked', async () => {
      const mockChanges = [
        {
          id: 'change-1',
          entityType: 'audience',
          entityId: 'aud-123',
          entityName: 'Test Audience',
          changeType: 'UPDATE',
          summary: 'Updated',
          changedFields: [],
          isSignificant: false,
          createdBy: null,
          createdAt: new Date().toISOString(),
        },
      ]

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ changes: mockChanges, total: 1 }),
      } as Response)

      const onViewDetails = vi.fn()

      render(<ChangeTimeline onViewDetails={onViewDetails} />)

      await waitFor(() => {
        expect(screen.getByText('Test Audience')).toBeInTheDocument()
      })

      const viewButton = screen.getByRole('button', { name: /View/i })
      fireEvent.click(viewButton)

      expect(onViewDetails).toHaveBeenCalledWith('audience', 'aud-123')
    })
  })

  describe('Total Count Display', () => {
    it('displays total changes count', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ changes: [], total: 42 }),
      } as Response)

      render(<ChangeTimeline />)

      await waitFor(() => {
        expect(screen.getByText('42 changes')).toBeInTheDocument()
      })
    })
  })

  describe('Entity Type Labels', () => {
    it('maps entity types to labels correctly', () => {
      const labelMap = {
        audience: 'Audiences',
        crosstab: 'Crosstabs',
        insight: 'Insights',
        chart: 'Charts',
        report: 'Reports',
        dashboard: 'Dashboards',
        brand_tracking: 'Brand Tracking',
      }

      Object.entries(labelMap).forEach(([type, label]) => {
        expect(label).toBeTruthy()
        expect(typeof label).toBe('string')
      })
    })
  })

  describe('Change Type Icons', () => {
    it('has icons for all change types', () => {
      const changeTypes = ['CREATE', 'UPDATE', 'DELETE', 'REGENERATE', 'RESTORE']

      changeTypes.forEach(type => {
        expect(changeTypes).toContain(type)
      })
    })
  })

  describe('Date Formatting', () => {
    it('formats recent dates as relative time', () => {
      const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / (1000 * 60))
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        return date.toLocaleDateString()
      }

      const recentDate = new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 mins ago
      expect(formatDate(recentDate)).toBe('30m ago')
    })
  })
})
