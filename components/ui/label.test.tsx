import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Label } from './label'

describe('Label Component', () => {
  describe('Rendering', () => {
    it('should render label with text', () => {
      render(<Label>Username</Label>)
      expect(screen.getByText('Username')).toBeDefined()
    })

    it('should render as label element', () => {
      const { container } = render(<Label>Label</Label>)
      expect(container.querySelector('label')).toBeDefined()
    })
  })

  describe('Attributes', () => {
    it('should accept htmlFor attribute', () => {
      render(<Label htmlFor="username">Username</Label>)
      const label = screen.getByText('Username')
      expect(label.getAttribute('for')).toBe('username')
    })

    it('should accept id attribute', () => {
      render(<Label id="username-label">Username</Label>)
      const label = document.getElementById('username-label')
      expect(label).toBeDefined()
    })
  })

  describe('Styling', () => {
    it('should accept className', () => {
      const { container } = render(<Label className="custom-label">Label</Label>)
      expect(container.querySelector('.custom-label')).toBeDefined()
    })
  })

  describe('Association', () => {
    it('should associate with input', () => {
      render(
        <div>
          <Label htmlFor="email">Email</Label>
          <input id="email" type="email" />
        </div>
      )

      const label = screen.getByText('Email')
      expect(label.getAttribute('for')).toBe('email')
    })
  })
})
