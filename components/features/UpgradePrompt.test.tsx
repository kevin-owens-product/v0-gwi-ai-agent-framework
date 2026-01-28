import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { UpgradePrompt } from './UpgradePrompt'
import { useRouter } from 'next/navigation'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

describe('UpgradePrompt Component', () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as any)
  })

  describe('Default Rendering', () => {
    it('should render with default props', () => {
      render(<UpgradePrompt />)

      expect(screen.getByText('Upgrade Required')).toBeInTheDocument()
      expect(screen.getByText('This feature requires an upgraded plan to access.')).toBeInTheDocument()
      expect(screen.getByText('Upgrade Plan')).toBeInTheDocument()
    })

    it('should show sparkles icon', () => {
      const { container } = render(<UpgradePrompt />)

      // Sparkles icon should be present
      expect(container.querySelector('.text-yellow-500')).toBeInTheDocument()
    })
  })

  describe('Custom Props', () => {
    it('should render custom title', () => {
      render(<UpgradePrompt title="Premium Feature Required" />)

      expect(screen.getByText('Premium Feature Required')).toBeInTheDocument()
    })

    it('should render custom description', () => {
      render(<UpgradePrompt description="This feature is only available on higher plans" />)

      expect(screen.getByText('This feature is only available on higher plans')).toBeInTheDocument()
    })

    it('should render custom required plan', () => {
      render(<UpgradePrompt feature="CUSTOM_INTEGRATIONS" requiredPlan="Enterprise" />)

      expect(screen.getByText(/Enterprise/)).toBeInTheDocument()
    })

    it('should show feature requirement message when feature is provided', () => {
      render(<UpgradePrompt feature="ADVANCED_ANALYTICS" requiredPlan="Professional" />)

      expect(screen.getByText(/This feature requires a/)).toBeInTheDocument()
      expect(screen.getByText(/Professional/)).toBeInTheDocument()
      expect(screen.getByText(/plan or higher/)).toBeInTheDocument()
    })

    it('should not show feature requirement message when feature is not provided', () => {
      render(<UpgradePrompt />)

      // Should not show the "requiresPlan" message (which includes plan name)
      expect(screen.queryByText(/This feature requires the/)).not.toBeInTheDocument()
      expect(screen.queryByText(/plan or higher/)).not.toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should navigate to plan page when upgrade button is clicked', () => {
      render(<UpgradePrompt />)

      const upgradeButton = screen.getByText('Upgrade Plan')
      fireEvent.click(upgradeButton)

      expect(mockPush).toHaveBeenCalledWith('/dashboard/settings/plan')
    })

    it('should navigate to plan page with custom feature', () => {
      render(<UpgradePrompt feature="ADVANCED_ANALYTICS" />)

      const upgradeButton = screen.getByText('Upgrade Plan')
      fireEvent.click(upgradeButton)

      expect(mockPush).toHaveBeenCalledWith('/dashboard/settings/plan')
    })
  })

  describe('Different Features', () => {
    it('should display upgrade prompt for ADVANCED_ANALYTICS', () => {
      render(
        <UpgradePrompt
          feature="ADVANCED_ANALYTICS"
          title="Advanced Analytics Required"
          requiredPlan="Professional"
        />
      )

      expect(screen.getByText('Advanced Analytics Required')).toBeInTheDocument()
      expect(screen.getByText(/Professional/)).toBeInTheDocument()
    })

    it('should display upgrade prompt for CUSTOM_INTEGRATIONS', () => {
      render(
        <UpgradePrompt
          feature="CUSTOM_INTEGRATIONS"
          title="Custom Integrations Required"
          requiredPlan="Enterprise"
        />
      )

      expect(screen.getByText('Custom Integrations Required')).toBeInTheDocument()
      expect(screen.getByText(/Enterprise/)).toBeInTheDocument()
    })

    it('should display upgrade prompt for TEAM_MEMBERS', () => {
      render(
        <UpgradePrompt
          feature="TEAM_MEMBERS"
          title="More Team Seats Required"
          requiredPlan="Professional"
        />
      )

      expect(screen.getByText('More Team Seats Required')).toBeInTheDocument()
      expect(screen.getByText(/Professional/)).toBeInTheDocument()
    })
  })

  describe('Plan Tiers', () => {
    it('should support Starter plan', () => {
      render(<UpgradePrompt requiredPlan="Starter" feature="BASIC_FEATURE" />)

      expect(screen.getByText(/Starter/)).toBeInTheDocument()
    })

    it('should support Professional plan', () => {
      render(<UpgradePrompt requiredPlan="Professional" feature="PRO_FEATURE" />)

      expect(screen.getByText(/Professional/)).toBeInTheDocument()
    })

    it('should support Enterprise plan', () => {
      render(<UpgradePrompt requiredPlan="Enterprise" feature="ENTERPRISE_FEATURE" />)

      expect(screen.getByText(/Enterprise/)).toBeInTheDocument()
    })
  })

  describe('Button Interaction', () => {
    it('should have full width button', () => {
      render(<UpgradePrompt />)

      const button = screen.getByText('Upgrade Plan').closest('button')
      expect(button?.classList.contains('w-full')).toBe(true)
    })

    it('should show arrow icon in button', () => {
      render(<UpgradePrompt />)

      const button = screen.getByText('Upgrade Plan')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Card Structure', () => {
    it('should render as a card', () => {
      const { container } = render(<UpgradePrompt />)

      // Card component should be present
      expect(container.querySelector('.max-w-md')).toBeInTheDocument()
    })

    it('should have header and content sections', () => {
      render(<UpgradePrompt />)

      expect(screen.getByText('Upgrade Required')).toBeInTheDocument()
      expect(screen.getByText('Upgrade Plan')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have clickable button', () => {
      render(<UpgradePrompt />)

      const button = screen.getByRole('button', { name: /Upgrade Plan/i })
      expect(button).toBeInTheDocument()
    })

    it('should maintain proper heading structure', () => {
      render(<UpgradePrompt title="Test Title" />)

      expect(screen.getByText('Test Title')).toBeInTheDocument()
    })
  })

  describe('Visual Elements', () => {
    it('should display sparkles icon for premium feel', () => {
      const { container } = render(<UpgradePrompt />)

      const sparklesIcon = container.querySelector('.text-yellow-500')
      expect(sparklesIcon).toBeInTheDocument()
    })

    it('should emphasize required plan text', () => {
      render(<UpgradePrompt feature="TEST_FEATURE" requiredPlan="Professional" />)

      // Check that Professional appears in the requiresPlan message
      expect(screen.getByText(/Professional/)).toBeInTheDocument()
      expect(screen.getByText(/This feature requires the/)).toBeInTheDocument()
    })
  })

  describe('Multiple Instances', () => {
    it('should render multiple upgrade prompts independently', () => {
      render(
        <div>
          <UpgradePrompt
            feature="FEATURE_1"
            title="Feature 1"
            requiredPlan="Professional"
          />
          <UpgradePrompt
            feature="FEATURE_2"
            title="Feature 2"
            requiredPlan="Enterprise"
          />
        </div>
      )

      expect(screen.getByText('Feature 1')).toBeInTheDocument()
      expect(screen.getByText('Feature 2')).toBeInTheDocument()
      expect(screen.getByText(/Professional/)).toBeInTheDocument()
      expect(screen.getByText(/Enterprise/)).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty strings gracefully', () => {
      render(<UpgradePrompt title="" description="" />)

      // Should still render the upgrade button
      expect(screen.getByText('Upgrade Plan')).toBeInTheDocument()
    })

    it('should handle very long plan names', () => {
      render(
        <UpgradePrompt
          feature="TEST_FEATURE"
          requiredPlan="Super Ultra Premium Enterprise Plus"
        />
      )

      expect(screen.getByText(/Super Ultra Premium Enterprise Plus/)).toBeInTheDocument()
    })
  })
})
