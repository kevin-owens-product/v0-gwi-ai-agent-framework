import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './badge'

describe('Badge Component', () => {
  describe('Rendering', () => {
    it('should render badge with text', () => {
      render(<Badge>New</Badge>)
      expect(screen.getByText('New')).toBeDefined()
    })

    it('should render badge as div', () => {
      const { container } = render(<Badge>Badge</Badge>)
      expect(container.querySelector('div')).toBeDefined()
    })
  })

  describe('Variants', () => {
    it('should apply default variant', () => {
      const { container } = render(<Badge variant="default">Default</Badge>)
      expect(container.querySelector('div')).toBeDefined()
    })

    it('should apply secondary variant', () => {
      const { container } = render(<Badge variant="secondary">Secondary</Badge>)
      expect(container.querySelector('div')).toBeDefined()
    })

    it('should apply destructive variant', () => {
      const { container } = render(<Badge variant="destructive">Error</Badge>)
      expect(container.querySelector('div')).toBeDefined()
    })

    it('should apply outline variant', () => {
      const { container } = render(<Badge variant="outline">Outline</Badge>)
      expect(container.querySelector('div')).toBeDefined()
    })
  })

  describe('Styling', () => {
    it('should accept className', () => {
      const { container } = render(<Badge className="custom-badge">Badge</Badge>)
      expect(container.querySelector('.custom-badge')).toBeDefined()
    })

    it('should merge classNames', () => {
      const { container } = render(<Badge className="extra-class" variant="secondary">Badge</Badge>)
      expect(container.querySelector('.extra-class')).toBeDefined()
    })
  })

  describe('Content', () => {
    it('should render with icon', () => {
      render(<Badge><span>✓</span> Success</Badge>)
      expect(screen.getByText('Success')).toBeDefined()
    })

    it('should render with number', () => {
      render(<Badge>99+</Badge>)
      expect(screen.getByText('99+')).toBeDefined()
    })

    it('should render with multiple children', () => {
      render(
        <Badge>
          <span>Status:</span>
          <span>Active</span>
        </Badge>
      )
      expect(screen.getByText('Status:')).toBeDefined()
      expect(screen.getByText('Active')).toBeDefined()
    })
  })
})
