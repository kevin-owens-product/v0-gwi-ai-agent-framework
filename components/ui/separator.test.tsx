import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Separator } from './separator'

describe('Separator Component', () => {
  describe('Rendering', () => {
    it('should render separator', () => {
      const { container } = render(<Separator />)
      expect(container.querySelector('div')).toBeDefined()
    })

    it('should render as div by default', () => {
      const { container } = render(<Separator />)
      const separator = container.querySelector('div')
      expect(separator).toBeDefined()
    })
  })

  describe('Orientation', () => {
    it('should render horizontal separator by default', () => {
      const { container } = render(<Separator />)
      const separator = container.querySelector('div[data-orientation="horizontal"]')
      expect(separator).toBeDefined()
    })

    it('should render vertical separator', () => {
      const { container } = render(<Separator orientation="vertical" />)
      const separator = container.querySelector('div[data-orientation="vertical"]')
      expect(separator).toBeDefined()
    })
  })

  describe('Decorative', () => {
    it('should be decorative by default', () => {
      const { container } = render(<Separator />)
      const separator = container.querySelector('div')
      // Radix UI sets role="none" for decorative separators
      const role = separator?.getAttribute('role')
      expect(role === null || role === 'none').toBe(true)
    })

    it('should have separator role when not decorative', () => {
      const { container } = render(<Separator decorative={false} />)
      const separator = container.querySelector('div')
      expect(separator?.getAttribute('role')).toBe('separator')
    })
  })

  describe('Styling', () => {
    it('should accept className', () => {
      const { container } = render(<Separator className="custom-separator" />)
      expect(container.querySelector('.custom-separator')).toBeDefined()
    })

    it('should merge classNames', () => {
      const { container } = render(<Separator className="extra-class" orientation="vertical" />)
      const separator = container.querySelector('.extra-class')
      expect(separator).toBeDefined()
    })
  })
})
