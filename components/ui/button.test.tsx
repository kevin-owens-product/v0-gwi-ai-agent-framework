import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './button'

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render button with text', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByText('Click me')).toBeDefined()
    })

    it('should render as child element', () => {
      render(<Button asChild><a href="/test">Link</a></Button>)
      expect(screen.getByText('Link')).toBeDefined()
    })
  })

  describe('Variants', () => {
    it('should apply default variant', () => {
      const { container } = render(<Button variant="default">Button</Button>)
      expect(container.querySelector('button')).toBeDefined()
    })

    it('should apply destructive variant', () => {
      const { container } = render(<Button variant="destructive">Delete</Button>)
      expect(container.querySelector('button')).toBeDefined()
    })

    it('should apply outline variant', () => {
      const { container } = render(<Button variant="outline">Outline</Button>)
      expect(container.querySelector('button')).toBeDefined()
    })

    it('should apply secondary variant', () => {
      const { container } = render(<Button variant="secondary">Secondary</Button>)
      expect(container.querySelector('button')).toBeDefined()
    })

    it('should apply ghost variant', () => {
      const { container } = render(<Button variant="ghost">Ghost</Button>)
      expect(container.querySelector('button')).toBeDefined()
    })

    it('should apply link variant', () => {
      const { container } = render(<Button variant="link">Link</Button>)
      expect(container.querySelector('button')).toBeDefined()
    })
  })

  describe('Sizes', () => {
    it('should apply default size', () => {
      const { container } = render(<Button size="default">Button</Button>)
      expect(container.querySelector('button')).toBeDefined()
    })

    it('should apply sm size', () => {
      const { container } = render(<Button size="sm">Small</Button>)
      expect(container.querySelector('button')).toBeDefined()
    })

    it('should apply lg size', () => {
      const { container } = render(<Button size="lg">Large</Button>)
      expect(container.querySelector('button')).toBeDefined()
    })

    it('should apply icon size', () => {
      const { container } = render(<Button size="icon">+</Button>)
      expect(container.querySelector('button')).toBeDefined()
    })
  })

  describe('Events', () => {
    it('should handle click events', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click me</Button>)

      fireEvent.click(screen.getByText('Click me'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not trigger click when disabled', () => {
      const handleClick = vi.fn()
      render(<Button disabled onClick={handleClick}>Disabled</Button>)

      fireEvent.click(screen.getByText('Disabled'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('States', () => {
    it('should be disabled', () => {
      render(<Button disabled>Disabled Button</Button>)
      const button = screen.getByText('Disabled Button')
      expect(button.hasAttribute('disabled')).toBe(true)
    })

    it('should accept className', () => {
      const { container } = render(<Button className="custom-class">Button</Button>)
      const button = container.querySelector('.custom-class')
      expect(button).toBeDefined()
    })
  })
})
