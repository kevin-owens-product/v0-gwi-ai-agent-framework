import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from './input'

describe('Input Component', () => {
  describe('Rendering', () => {
    it('should render input field', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input).toBeDefined()
    })

    it('should render with placeholder', () => {
      render(<Input placeholder="Enter text" />)
      const input = screen.getByPlaceholderText('Enter text')
      expect(input).toBeDefined()
    })

    it('should render with value', () => {
      render(<Input value="Test value" readOnly />)
      const input = screen.getByDisplayValue('Test value')
      expect(input).toBeDefined()
    })
  })

  describe('Types', () => {
    it('should render text input', () => {
      render(<Input type="text" />)
      const input = screen.getByRole('textbox')
      expect(input.getAttribute('type')).toBe('text')
    })

    it('should render email input', () => {
      const { container } = render(<Input type="email" />)
      const input = container.querySelector('input[type="email"]')
      expect(input).toBeDefined()
    })

    it('should render password input', () => {
      const { container } = render(<Input type="password" />)
      const input = container.querySelector('input[type="password"]')
      expect(input).toBeDefined()
    })

    it('should render number input', () => {
      const { container } = render(<Input type="number" />)
      const input = container.querySelector('input[type="number"]')
      expect(input).toBeDefined()
    })
  })

  describe('States', () => {
    it('should be disabled', () => {
      render(<Input disabled />)
      const input = screen.getByRole('textbox')
      expect(input.hasAttribute('disabled')).toBe(true)
    })

    it('should be readonly', () => {
      render(<Input readOnly value="Read only" />)
      const input = screen.getByDisplayValue('Read only')
      expect(input.hasAttribute('readonly')).toBe(true)
    })

    it('should be required', () => {
      render(<Input required />)
      const input = screen.getByRole('textbox')
      expect(input.hasAttribute('required')).toBe(true)
    })
  })

  describe('Events', () => {
    it('should handle onChange event', () => {
      const handleChange = vi.fn()
      render(<Input onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'New value' } })

      expect(handleChange).toHaveBeenCalled()
    })

    it('should handle onFocus event', () => {
      const handleFocus = vi.fn()
      render(<Input onFocus={handleFocus} />)

      const input = screen.getByRole('textbox')
      fireEvent.focus(input)

      expect(handleFocus).toHaveBeenCalled()
    })

    it('should handle onBlur event', () => {
      const handleBlur = vi.fn()
      render(<Input onBlur={handleBlur} />)

      const input = screen.getByRole('textbox')
      fireEvent.blur(input)

      expect(handleBlur).toHaveBeenCalled()
    })
  })

  describe('Styling', () => {
    it('should accept className', () => {
      const { container } = render(<Input className="custom-input" />)
      expect(container.querySelector('.custom-input')).toBeDefined()
    })

    it('should accept id attribute', () => {
      render(<Input id="test-input" />)
      const input = document.getElementById('test-input')
      expect(input).toBeDefined()
    })
  })

  describe('Attributes', () => {
    it('should accept name attribute', () => {
      render(<Input name="username" />)
      const input = screen.getByRole('textbox')
      expect(input.getAttribute('name')).toBe('username')
    })

    it('should accept maxLength attribute', () => {
      render(<Input maxLength={10} />)
      const input = screen.getByRole('textbox')
      expect(input.getAttribute('maxlength')).toBe('10')
    })

    it('should accept autoComplete attribute', () => {
      render(<Input autoComplete="email" />)
      const input = screen.getByRole('textbox')
      expect(input.getAttribute('autocomplete')).toBe('email')
    })
  })
})
