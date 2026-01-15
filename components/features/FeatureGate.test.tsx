import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FeatureGate } from './FeatureGate'
import { useFeatureAccess } from '@/hooks/useFeatureAccess'

vi.mock('@/hooks/useFeatureAccess')

describe('FeatureGate Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('should show skeleton loader while loading', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: false,
        isLoading: true,
        error: null,
        refresh: vi.fn(),
      })

      render(
        <FeatureGate feature="ADVANCED_ANALYTICS">
          <div>Protected Content</div>
        </FeatureGate>
      )

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('should show custom loading fallback when provided', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: false,
        isLoading: true,
        error: null,
        refresh: vi.fn(),
      })

      render(
        <FeatureGate
          feature="ADVANCED_ANALYTICS"
          loadingFallback={<div>Loading feature...</div>}
        >
          <div>Protected Content</div>
        </FeatureGate>
      )

      expect(screen.getByText('Loading feature...')).toBeInTheDocument()
    })
  })

  describe('Access Granted', () => {
    it('should render children when user has access', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(
        <FeatureGate feature="ADVANCED_ANALYTICS">
          <div>Protected Content</div>
        </FeatureGate>
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('should render multiple children when user has access', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(
        <FeatureGate feature="ADVANCED_ANALYTICS">
          <div>Content 1</div>
          <div>Content 2</div>
        </FeatureGate>
      )

      expect(screen.getByText('Content 1')).toBeInTheDocument()
      expect(screen.getByText('Content 2')).toBeInTheDocument()
    })
  })

  describe('Hard Mode - Access Denied', () => {
    it('should render nothing in hard mode without fallback', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: false,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      const { container } = render(
        <FeatureGate feature="ENTERPRISE_FEATURE" mode="hard">
          <div>Protected Content</div>
        </FeatureGate>
      )

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
      expect(container.textContent).toBe('')
    })

    it('should render custom fallback in hard mode', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: false,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(
        <FeatureGate
          feature="ENTERPRISE_FEATURE"
          mode="hard"
          fallback={<div>Feature not available</div>}
        >
          <div>Protected Content</div>
        </FeatureGate>
      )

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
      expect(screen.getByText('Feature not available')).toBeInTheDocument()
    })
  })

  describe('Soft Mode - Access Denied', () => {
    it('should show blurred content and upgrade prompt in soft mode', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: false,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(
        <FeatureGate feature="CUSTOM_INTEGRATIONS" mode="soft">
          <div>Protected Content</div>
        </FeatureGate>
      )

      // Content should still be rendered but blurred
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('should render custom fallback in soft mode', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: false,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(
        <FeatureGate
          feature="CUSTOM_INTEGRATIONS"
          mode="soft"
          fallback={<div>Custom upgrade message</div>}
        >
          <div>Protected Content</div>
        </FeatureGate>
      )

      expect(screen.getByText('Custom upgrade message')).toBeInTheDocument()
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('should default to soft mode when mode not specified', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: false,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      const { container } = render(
        <FeatureGate feature="CUSTOM_INTEGRATIONS">
          <div>Protected Content</div>
        </FeatureGate>
      )

      // Should render with blur and overlay (soft mode)
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
      expect(container.querySelector('.blur-sm')).toBeInTheDocument()
    })
  })

  describe('Different Features', () => {
    it('should check ADVANCED_ANALYTICS feature', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(
        <FeatureGate feature="ADVANCED_ANALYTICS">
          <div>Analytics Content</div>
        </FeatureGate>
      )

      expect(useFeatureAccess).toHaveBeenCalledWith('ADVANCED_ANALYTICS')
    })

    it('should check CUSTOM_INTEGRATIONS feature', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: false,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(
        <FeatureGate feature="CUSTOM_INTEGRATIONS">
          <div>Integrations Content</div>
        </FeatureGate>
      )

      expect(useFeatureAccess).toHaveBeenCalledWith('CUSTOM_INTEGRATIONS')
    })

    it('should check TEAM_MEMBERS feature', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: 10,
        limit: 10,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(
        <FeatureGate feature="TEAM_MEMBERS">
          <div>Team Content</div>
        </FeatureGate>
      )

      expect(useFeatureAccess).toHaveBeenCalledWith('TEAM_MEMBERS')
    })
  })

  describe('Component Composition', () => {
    it('should work with nested components', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(
        <FeatureGate feature="ADVANCED_ANALYTICS">
          <div>
            <h1>Title</h1>
            <p>Description</p>
            <button>Action</button>
          </div>
        </FeatureGate>
      )

      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText('Action')).toBeInTheDocument()
    })

    it('should work with React fragments', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(
        <FeatureGate feature="ADVANCED_ANALYTICS">
          <>
            <div>Item 1</div>
            <div>Item 2</div>
          </>
        </FeatureGate>
      )

      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      const { container } = render(
        <FeatureGate feature="ADVANCED_ANALYTICS">
          {null}
        </FeatureGate>
      )

      expect(container.textContent).toBe('')
    })

    it('should handle feature with null value', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: false,
        value: null,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      render(
        <FeatureGate feature="UNKNOWN_FEATURE" mode="hard">
          <div>Content</div>
        </FeatureGate>
      )

      expect(screen.queryByText('Content')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should maintain DOM structure for screen readers', () => {
      vi.mocked(useFeatureAccess).mockReturnValue({
        hasAccess: true,
        value: true,
        isLoading: false,
        error: null,
        refresh: vi.fn(),
      })

      const { container } = render(
        <FeatureGate feature="ADVANCED_ANALYTICS">
          <button aria-label="Test button">Click me</button>
        </FeatureGate>
      )

      const button = screen.getByLabelText('Test button')
      expect(button).toBeInTheDocument()
    })
  })
})
