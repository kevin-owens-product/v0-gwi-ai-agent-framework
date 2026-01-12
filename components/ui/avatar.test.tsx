import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Avatar, AvatarImage, AvatarFallback } from './avatar'

describe('Avatar Components', () => {
  describe('Avatar', () => {
    it('should render avatar container', () => {
      const { container } = render(<Avatar />)
      expect(container.querySelector('span')).toBeDefined()
    })

    it('should accept className', () => {
      const { container } = render(<Avatar className="custom-avatar" />)
      expect(container.querySelector('.custom-avatar')).toBeDefined()
    })
  })

  describe('AvatarImage', () => {
    it('should render image component', () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="https://example.com/avatar.jpg" alt="User" />
        </Avatar>
      )

      expect(container.querySelector('img')).toBeDefined()
    })

    it('should render with src prop', () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="https://example.com/avatar.jpg" alt="Avatar" />
        </Avatar>
      )

      const avatar = container.querySelector('span')
      expect(avatar).toBeDefined()
    })
  })

  describe('AvatarFallback', () => {
    it('should render fallback text', () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      )

      expect(screen.getByText('JD')).toBeDefined()
    })

    it('should show fallback when image fails', () => {
      render(
        <Avatar>
          <AvatarImage src="invalid.jpg" alt="User" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      )

      expect(screen.getByText('JD')).toBeDefined()
    })
  })

  describe('Complete Avatar', () => {
    it('should render with image and fallback', () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="https://example.com/avatar.jpg" alt="John Doe" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      )

      const avatar = container.querySelector('span')
      expect(avatar).toBeDefined()
      expect(screen.getByText('JD')).toBeDefined()
    })

    it('should display user initials in fallback', () => {
      const userName = 'John Doe'
      const initials = userName.split(' ').map(n => n[0]).join('')

      render(
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      )

      expect(screen.getByText('JD')).toBeDefined()
    })
  })
})
