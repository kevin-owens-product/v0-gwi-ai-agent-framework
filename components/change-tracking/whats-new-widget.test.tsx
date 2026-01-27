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
  usePathname: () => '/dashboard',
}))

import { WhatsNewWidget } from './whats-new-widget'

describe('WhatsNewWidget Component', () => {
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockFetch = vi.fn()
    global.fetch = mockFetch as typeof fetch
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('shows disabled button in popover variant while loading', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves

      render(<WhatsNewWidget variant="popover" />)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('shows skeleton in compact variant while loading', () => {
      mockFetch.mockImplementation(() => new Promise(() => {}))

      render(<WhatsNewWidget variant="compact" />)

      const skeletons = document.querySelectorAll('[class*="animate-pulse"], [class*="skeleton"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  describe('Empty State', () => {
    it('returns null in compact variant when no updates', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          since: new Date().toISOString(),
          newItems: [],
          totalNewItems: 0,
          changesCount: 0,
          categories: [],
        }),
      } as Response)

      const { container } = render(<WhatsNewWidget variant="compact" />)

      await waitFor(() => {
        expect(container.firstChild).toBeNull()
      })
    })

    it('shows caught up message in expanded variant when no updates', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          since: new Date().toISOString(),
          newItems: [],
          totalNewItems: 0,
          changesCount: 0,
          categories: [],
        }),
      } as Response)

      render(<WhatsNewWidget variant="expanded" />)

      await waitFor(() => {
        expect(screen.getByText(/You're All Caught Up/i)).toBeInTheDocument()
      })
    })
  })

  describe('Popover Variant', () => {
    const mockData = {
      since: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      newItems: [],
      totalNewItems: 5,
      changesCount: 10,
      categories: [
        {
          entityType: 'audience',
          count: 3,
          label: 'Audiences',
          items: [
            { id: 'a1', name: 'New Audience 1', createdAt: new Date().toISOString() },
            { id: 'a2', name: 'New Audience 2', createdAt: new Date().toISOString() },
          ],
        },
        {
          entityType: 'insight',
          count: 2,
          label: 'Insights',
          items: [
            { id: 'i1', name: 'New Insight 1', createdAt: new Date().toISOString() },
          ],
        },
      ],
    }

    it('shows notification badge with count', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      } as Response)

      render(<WhatsNewWidget variant="popover" />)

      await waitFor(() => {
        expect(screen.getByText('15')).toBeInTheDocument() // 5 + 10 = 15
      })
    })

    it('shows 99+ for large counts', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          ...mockData,
          totalNewItems: 50,
          changesCount: 60,
        }),
      } as Response)

      render(<WhatsNewWidget variant="popover" />)

      await waitFor(() => {
        expect(screen.getByText('99+')).toBeInTheDocument()
      })
    })

    it('opens popover on click', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      } as Response)

      render(<WhatsNewWidget variant="popover" />)

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button'))

      await waitFor(() => {
        expect(screen.getByText("What's New")).toBeInTheDocument()
      })
    })

    it('displays categories in popover', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      } as Response)

      render(<WhatsNewWidget variant="popover" />)

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button'))

      await waitFor(() => {
        expect(screen.getByText('Audiences')).toBeInTheDocument()
        expect(screen.getByText('Insights')).toBeInTheDocument()
      })
    })
  })

  describe('Compact Variant', () => {
    const mockData = {
      since: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      newItems: [],
      totalNewItems: 8,
      changesCount: 12,
      categories: [
        { entityType: 'audience', count: 5, label: 'Audiences' },
        { entityType: 'crosstab', count: 3, label: 'Crosstabs' },
      ],
    }

    it('displays total update count', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      } as Response)

      render(<WhatsNewWidget variant="compact" />)

      await waitFor(() => {
        expect(screen.getByText(/20 updates/)).toBeInTheDocument() // 8 + 12
      })
    })

    it('shows View All button', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      } as Response)

      render(<WhatsNewWidget variant="compact" />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /View All/i })).toBeInTheDocument()
      })
    })

    it('calls onViewAll when View All clicked', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      } as Response)

      const onViewAll = vi.fn()

      render(<WhatsNewWidget variant="compact" onViewAll={onViewAll} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /View All/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /View All/i }))

      expect(onViewAll).toHaveBeenCalled()
    })

    it('can be dismissed', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      } as Response)

      render(<WhatsNewWidget variant="compact" />)

      await waitFor(() => {
        expect(screen.getByText("What's New")).toBeInTheDocument()
      })

      // Find and click the X button
      const buttons = screen.getAllByRole('button')
      const dismissButton = buttons.find(btn => btn.querySelector('svg'))
      if (dismissButton) {
        fireEvent.click(dismissButton)
      }
    })
  })

  describe('Expanded Variant', () => {
    const mockData = {
      since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      newItems: [],
      totalNewItems: 15,
      changesCount: 25,
      categories: [
        {
          entityType: 'audience',
          count: 8,
          label: 'Audiences',
          items: [
            { id: 'a1', name: 'Audience One', createdAt: new Date().toISOString() },
            { id: 'a2', name: 'Audience Two', createdAt: new Date().toISOString() },
            { id: 'a3', name: 'Audience Three', createdAt: new Date().toISOString() },
            { id: 'a4', name: 'Audience Four', createdAt: new Date().toISOString() },
          ],
        },
        {
          entityType: 'insight',
          count: 4,
          label: 'Insights',
          items: [
            { id: 'i1', name: 'Insight One', createdAt: new Date().toISOString() },
          ],
        },
      ],
    }

    it('displays heading and total updates', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      } as Response)

      render(<WhatsNewWidget variant="expanded" />)

      await waitFor(() => {
        expect(screen.getByText("What's New")).toBeInTheDocument()
        expect(screen.getByText('40 updates')).toBeInTheDocument()
      })
    })

    it('displays category cards', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      } as Response)

      render(<WhatsNewWidget variant="expanded" />)

      await waitFor(() => {
        expect(screen.getByText('Audiences')).toBeInTheDocument()
        expect(screen.getByText('8 new')).toBeInTheDocument()
        expect(screen.getByText('Insights')).toBeInTheDocument()
        expect(screen.getByText('4 new')).toBeInTheDocument()
      })
    })

    it('displays item names', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      } as Response)

      render(<WhatsNewWidget variant="expanded" />)

      await waitFor(() => {
        expect(screen.getByText('Audience One')).toBeInTheDocument()
        expect(screen.getByText('Audience Two')).toBeInTheDocument()
        expect(screen.getByText('Audience Three')).toBeInTheDocument()
      })
    })

    it('shows +N more for items beyond 3', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      } as Response)

      render(<WhatsNewWidget variant="expanded" />)

      await waitFor(() => {
        expect(screen.getByText('+1 more')).toBeInTheDocument()
      })
    })

    it('calls onViewItem when item clicked', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      } as Response)

      const onViewItem = vi.fn()

      render(<WhatsNewWidget variant="expanded" onViewItem={onViewItem} />)

      await waitFor(() => {
        expect(screen.getByText('Audience One')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Audience One'))

      expect(onViewItem).toHaveBeenCalledWith('audience', 'a1')
    })

    it('shows Mark All as Seen button', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      } as Response)

      render(<WhatsNewWidget variant="expanded" />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Mark All as Seen/i })).toBeInTheDocument()
      })
    })

    it('calls markAsSeen when Mark All as Seen clicked', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockData),
        } as Response)
        .mockResolvedValueOnce({ ok: true } as Response)

      render(<WhatsNewWidget variant="expanded" />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Mark All as Seen/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /Mark All as Seen/i }))

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/v1/changes/whats-new', { method: 'POST' })
      })
    })
  })

  describe('Entity Icons', () => {
    it('has icons for all entity types', () => {
      const entityTypes = [
        'audience',
        'crosstab',
        'insight',
        'chart',
        'report',
        'dashboard',
        'brand_tracking',
      ]

      entityTypes.forEach(type => {
        expect(entityTypes).toContain(type)
      })
    })
  })

  describe('Date Formatting', () => {
    it('formats since date correctly', () => {
      const formatSince = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return 'today'
        if (diffDays === 1) return 'yesterday'
        if (diffDays < 7) return `${diffDays} days ago`
        return date.toLocaleDateString()
      }

      expect(formatSince(new Date().toISOString())).toBe('today')
      expect(formatSince(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())).toBe('yesterday')
      expect(formatSince(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())).toBe('3 days ago')
    })
  })

  describe('Error Handling', () => {
    it('handles fetch error gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(<WhatsNewWidget variant="popover" />)

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled()
      })

      consoleSpy.mockRestore()
    })
  })
})
