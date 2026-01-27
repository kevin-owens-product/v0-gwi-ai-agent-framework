import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UsageMeter } from './UsageMeter'
import { useFeatureAccess } from '@/hooks/useFeatureAccess'

vi.mock('@/hooks/useFeatureAccess')

describe('UsageMeter Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('should show loading animation while loading', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: undefined,
        limit: undefined,
        usage: undefined,
        percentage: 0,
        isNearLimit: false,
        isAtLimit: false,
        isLoading: true,
        error: null,
        refresh: vi.fn(),
      })

      const { container } = render(<UsageMeter feature="API_REQUESTS" />)

      expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    })
  })

  describe('No Limit Features', () => {
    it('should render nothing when limit is null', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        limit: null,
        usage: undefined,
        percentage: 0,
        isNearLimit: false,
        isAtLimit: false,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      const { container } = render(<UsageMeter feature="UNLIMITED_FEATURE" />)

      expect(container.textContent).toBe('')
    })

    it('should render nothing when limit is undefined', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        limit: undefined,
        usage: undefined,
        percentage: 0,
        isNearLimit: false,
        isAtLimit: false,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      const { container } = render(<UsageMeter feature="UNLIMITED_FEATURE" />)

      expect(container.textContent).toBe('')
    })
  })

  describe('Normal Usage', () => {
    it('should display usage and limit', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        limit: 1000,
        usage: 500,
        percentage: 50,
        isNearLimit: false,
        isAtLimit: false,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(<UsageMeter feature="API_REQUESTS" label="API Requests" />)

      expect(screen.getByText('API Requests')).toBeInTheDocument()
      expect(screen.getByText(/500 \/ 1000/)).toBeInTheDocument()
    })

    it('should show percentage when showPercentage is true', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        limit: 1000,
        usage: 500,
        percentage: 50,
        isNearLimit: false,
        isAtLimit: false,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(<UsageMeter feature="API_REQUESTS" label="Test" showPercentage={true} />)

      expect(screen.getByText(/\(50%\)/)).toBeInTheDocument()
    })

    it('should hide percentage when showPercentage is false', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        limit: 1000,
        usage: 500,
        percentage: 50,
        isNearLimit: false,
        isAtLimit: false,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(<UsageMeter feature="API_REQUESTS" label="Test" showPercentage={false} />)

      expect(screen.queryByText(/\(50%\)/)).not.toBeInTheDocument()
      expect(screen.getByText(/500 \/ 1000/)).toBeInTheDocument()
    })

    it('should handle zero usage', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        limit: 1000,
        usage: 0,
        percentage: 0,
        isNearLimit: false,
        isAtLimit: false,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(<UsageMeter feature="API_REQUESTS" label="Test" />)

      expect(screen.getByText(/0 \/ 1000/)).toBeInTheDocument()
    })

    it('should handle undefined usage as 0', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        limit: 1000,
        usage: undefined,
        percentage: 0,
        isNearLimit: false,
        isAtLimit: false,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(<UsageMeter feature="API_REQUESTS" label="Test" />)

      expect(screen.getByText(/0 \/ 1000/)).toBeInTheDocument()
    })
  })

  describe('Near Limit Warning', () => {
    it('should show warning when near limit (80%)', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        limit: 100,
        usage: 85,
        percentage: 85,
        isNearLimit: true,
        isAtLimit: false,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(<UsageMeter feature="API_REQUESTS" />)

      expect(screen.getByText("You're approaching your limit.")).toBeInTheDocument()
    })

    it('should apply warning styles when near limit', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        limit: 100,
        usage: 85,
        percentage: 85,
        isNearLimit: true,
        isAtLimit: false,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      const { container } = render(<UsageMeter feature="API_REQUESTS" label="Test" />)

      expect(container.querySelector('.text-yellow-600')).toBeInTheDocument()
    })
  })

  describe('At Limit State', () => {
    it('should show error message when at limit', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        limit: 100,
        usage: 100,
        percentage: 100,
        isNearLimit: true,
        isAtLimit: true,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(<UsageMeter feature="API_REQUESTS" />)

      expect(
        screen.getByText("You've reached your limit. Upgrade your plan to continue.")
      ).toBeInTheDocument()
    })

    it('should apply destructive styles when at limit', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        limit: 100,
        usage: 100,
        percentage: 100,
        isNearLimit: true,
        isAtLimit: true,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      const { container } = render(<UsageMeter feature="API_REQUESTS" label="Test" />)

      expect(container.querySelector('.text-destructive')).toBeInTheDocument()
    })

    it('should not show near limit warning when at limit', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        limit: 100,
        usage: 100,
        percentage: 100,
        isNearLimit: true,
        isAtLimit: true,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(<UsageMeter feature="API_REQUESTS" />)

      expect(screen.queryByText("You're approaching your limit.")).not.toBeInTheDocument()
      expect(
        screen.getByText("You've reached your limit. Upgrade your plan to continue.")
      ).toBeInTheDocument()
    })

    it('should handle usage over limit', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        limit: 100,
        usage: 105,
        percentage: 105,
        isNearLimit: true,
        isAtLimit: true,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(<UsageMeter feature="API_REQUESTS" label="Test" />)

      expect(screen.getByText(/105 \/ 100/)).toBeInTheDocument()
    })
  })

  describe('Different Features', () => {
    it('should track API_REQUESTS usage', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        limit: 1000,
        usage: 500,
        percentage: 50,
        isNearLimit: false,
        isAtLimit: false,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(<UsageMeter feature="API_REQUESTS" label="API Requests" />)

      expect(useFeatureAccess).toHaveBeenCalledWith('API_REQUESTS')
      expect(screen.getByText('API Requests')).toBeInTheDocument()
    })

    it('should track TEAM_MEMBERS usage', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: 10,
        limit: 10,
        usage: 7,
        percentage: 70,
        isNearLimit: false,
        isAtLimit: false,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(<UsageMeter feature="TEAM_MEMBERS" label="Team Members" />)

      expect(useFeatureAccess).toHaveBeenCalledWith('TEAM_MEMBERS')
      expect(screen.getByText(/7 \/ 10/)).toBeInTheDocument()
    })

    it('should track WORKFLOW_RUNS usage', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        limit: 100,
        usage: 42,
        percentage: 42,
        isNearLimit: false,
        isAtLimit: false,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(<UsageMeter feature="WORKFLOW_RUNS" label="Workflow Runs" />)

      expect(useFeatureAccess).toHaveBeenCalledWith('WORKFLOW_RUNS')
      expect(screen.getByText(/42 \/ 100/)).toBeInTheDocument()
    })
  })

  describe('Custom Labels', () => {
    it('should display custom label', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        limit: 1000,
        usage: 500,
        percentage: 50,
        isNearLimit: false,
        isAtLimit: false,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(<UsageMeter feature="API_REQUESTS" label="Monthly API Calls" />)

      expect(screen.getByText('Monthly API Calls')).toBeInTheDocument()
    })

    it('should work without label', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        limit: 1000,
        usage: 500,
        percentage: 50,
        isNearLimit: false,
        isAtLimit: false,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      const { container } = render(<UsageMeter feature="API_REQUESTS" />)

      // Should still render the progress bar
      expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument()
    })
  })

  describe('Percentage Rounding', () => {
    it('should round percentage to nearest integer', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        limit: 1000,
        usage: 335,
        percentage: 33.5,
        isNearLimit: false,
        isAtLimit: false,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(<UsageMeter feature="API_REQUESTS" label="Test" showPercentage={true} />)

      expect(screen.getByText(/\(34%\)/)).toBeInTheDocument()
    })

    it('should handle 0 percentage', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        limit: 1000,
        usage: 0,
        percentage: 0,
        isNearLimit: false,
        isAtLimit: false,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(<UsageMeter feature="API_REQUESTS" label="Test" showPercentage={true} />)

      expect(screen.getByText(/\(0%\)/)).toBeInTheDocument()
    })

    it('should handle 100 percentage', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        limit: 1000,
        usage: 1000,
        percentage: 100,
        isNearLimit: true,
        isAtLimit: true,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(<UsageMeter feature="API_REQUESTS" label="Test" showPercentage={true} />)

      expect(screen.getByText(/\(100%\)/)).toBeInTheDocument()
    })
  })

  describe('Visual Indicators', () => {
    it('should show check icon for normal usage', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        limit: 1000,
        usage: 500,
        percentage: 50,
        isNearLimit: false,
        isAtLimit: false,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      const { container } = render(<UsageMeter feature="API_REQUESTS" />)

      // CheckCircle icon should be present
      expect(container.querySelector('.text-green-600')).toBeInTheDocument()
    })

    it('should show alert icon when near limit', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        limit: 100,
        usage: 85,
        percentage: 85,
        isNearLimit: true,
        isAtLimit: false,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      const { container } = render(<UsageMeter feature="API_REQUESTS" />)

      // AlertCircle icon should be present with yellow color
      const icons = container.querySelectorAll('.text-yellow-600')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('should show alert icon when at limit', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        limit: 100,
        usage: 100,
        percentage: 100,
        isNearLimit: true,
        isAtLimit: true,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      const { container } = render(<UsageMeter feature="API_REQUESTS" />)

      // AlertCircle icon should be present with destructive color
      const icons = container.querySelectorAll('.text-destructive')
      expect(icons.length).toBeGreaterThan(0)
    })
  })
})
