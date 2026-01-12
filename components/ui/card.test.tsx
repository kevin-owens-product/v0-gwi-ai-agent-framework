import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card'

describe('Card Components', () => {
  describe('Card', () => {
    it('should render card', () => {
      const { container } = render(<Card>Card content</Card>)
      expect(container.querySelector('div')).toBeDefined()
    })

    it('should accept className', () => {
      const { container } = render(<Card className="custom-card">Content</Card>)
      expect(container.querySelector('.custom-card')).toBeDefined()
    })
  })

  describe('CardHeader', () => {
    it('should render card header', () => {
      render(<CardHeader>Header content</CardHeader>)
      expect(screen.getByText('Header content')).toBeDefined()
    })

    it('should accept className', () => {
      const { container } = render(<CardHeader className="custom-header">Header</CardHeader>)
      expect(container.querySelector('.custom-header')).toBeDefined()
    })
  })

  describe('CardTitle', () => {
    it('should render card title', () => {
      render(<CardTitle>Card Title</CardTitle>)
      expect(screen.getByText('Card Title')).toBeDefined()
    })

    it('should render as h3 by default', () => {
      const { container } = render(<CardTitle>Title</CardTitle>)
      expect(container.querySelector('h3')).toBeDefined()
    })
  })

  describe('CardDescription', () => {
    it('should render card description', () => {
      render(<CardDescription>This is a description</CardDescription>)
      expect(screen.getByText('This is a description')).toBeDefined()
    })

    it('should render as p element', () => {
      const { container } = render(<CardDescription>Description</CardDescription>)
      expect(container.querySelector('p')).toBeDefined()
    })
  })

  describe('CardContent', () => {
    it('should render card content', () => {
      render(<CardContent>Main content</CardContent>)
      expect(screen.getByText('Main content')).toBeDefined()
    })

    it('should accept className', () => {
      const { container } = render(<CardContent className="custom-content">Content</CardContent>)
      expect(container.querySelector('.custom-content')).toBeDefined()
    })
  })

  describe('CardFooter', () => {
    it('should render card footer', () => {
      render(<CardFooter>Footer content</CardFooter>)
      expect(screen.getByText('Footer content')).toBeDefined()
    })

    it('should accept className', () => {
      const { container } = render(<CardFooter className="custom-footer">Footer</CardFooter>)
      expect(container.querySelector('.custom-footer')).toBeDefined()
    })
  })

  describe('Complete Card', () => {
    it('should render complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
            <CardDescription>Test description</CardDescription>
          </CardHeader>
          <CardContent>Card body</CardContent>
          <CardFooter>Card footer</CardFooter>
        </Card>
      )

      expect(screen.getByText('Test Card')).toBeDefined()
      expect(screen.getByText('Test description')).toBeDefined()
      expect(screen.getByText('Card body')).toBeDefined()
      expect(screen.getByText('Card footer')).toBeDefined()
    })
  })
})
