import { describe, it, expect, vi, beforeEach } from 'vitest'

// Original env is stored implicitly by vitest mock system

// Create mock send function that persists across module reloads
const mockSend = vi.fn()

// Mock Resend with a proper class implementation
vi.mock('resend', () => {
  return {
    Resend: class MockResend {
      emails = {
        send: mockSend,
      }
    },
  }
})

describe('email utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe('sendEmail', () => {
    it('logs email when RESEND_API_KEY is not configured', async () => {
      // Reset env to remove RESEND_API_KEY
      vi.stubEnv('RESEND_API_KEY', '')

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      // Re-import to get fresh module
      const { sendEmail } = await import('./email')

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      })

      expect(consoleSpy).toHaveBeenCalledWith('Email service not configured. Would send:')
      expect(result.success).toBe(true)
      expect(result.id).toMatch(/^mock-/)

      consoleSpy.mockRestore()
    })

    it('uses default from address when not provided', async () => {
      vi.stubEnv('RESEND_API_KEY', '')
      vi.stubEnv('EMAIL_DOMAIN', 'test-domain.com')

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const { sendEmail } = await import('./email')

      await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.stringContaining('GWI AI Platform'),
        })
      )

      consoleSpy.mockRestore()
    })

    it('uses custom from address when provided', async () => {
      vi.stubEnv('RESEND_API_KEY', '')

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const { sendEmail } = await import('./email')

      await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
        from: 'custom@example.com',
      })

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'custom@example.com',
        })
      )

      consoleSpy.mockRestore()
    })
  })

  describe('getPasswordResetEmailHtml', () => {
    it('generates password reset email with user name', async () => {
      const { getPasswordResetEmailHtml } = await import('./email')

      const html = getPasswordResetEmailHtml({
        resetUrl: 'https://example.com/reset?token=abc',
        userName: 'John Doe',
      })

      expect(html).toContain('Reset your password')
      expect(html).toContain('Hi John Doe')
      expect(html).toContain('https://example.com/reset?token=abc')
      expect(html).toContain('Reset Password')
    })

    it('generates password reset email without user name', async () => {
      const { getPasswordResetEmailHtml } = await import('./email')

      const html = getPasswordResetEmailHtml({
        resetUrl: 'https://example.com/reset?token=abc',
      })

      expect(html).toContain('Reset your password')
      expect(html).not.toContain('Hi ')
      expect(html).toContain('https://example.com/reset?token=abc')
    })

    it('includes security message about ignoring email', async () => {
      const { getPasswordResetEmailHtml } = await import('./email')

      const html = getPasswordResetEmailHtml({
        resetUrl: 'https://example.com/reset',
      })

      expect(html).toContain("didn't request a password reset")
      expect(html).toContain('safely ignore this email')
    })
  })

  describe('getInvitationEmailHtml', () => {
    it('generates invitation email with all details', async () => {
      const { getInvitationEmailHtml } = await import('./email')

      const html = getInvitationEmailHtml({
        orgName: 'Acme Inc',
        inviterName: 'Jane Smith',
        role: 'Admin',
        inviteUrl: 'https://example.com/invite?token=xyz',
      })

      expect(html).toContain("You've been invited!")
      expect(html).toContain('Acme Inc')
      expect(html).toContain('Jane Smith')
      expect(html).toContain('Admin')
      expect(html).toContain('https://example.com/invite?token=xyz')
      expect(html).toContain('Accept Invitation')
      expect(html).toContain('expires in 7 days')
    })

    it('includes organization name in title', async () => {
      const { getInvitationEmailHtml } = await import('./email')

      const html = getInvitationEmailHtml({
        orgName: 'Test Org',
        inviterName: 'John',
        role: 'Member',
        inviteUrl: 'https://example.com',
      })

      expect(html).toContain("You've been invited to Test Org")
    })
  })

  describe('getWelcomeEmailHtml', () => {
    it('generates welcome email with user name', async () => {
      const { getWelcomeEmailHtml } = await import('./email')

      const html = getWelcomeEmailHtml({
        userName: 'Alice',
        loginUrl: 'https://example.com/login',
      })

      expect(html).toContain('Welcome to GWI!')
      expect(html).toContain('Hi Alice')
      expect(html).toContain('14-day free trial')
      expect(html).toContain('https://example.com/login')
      expect(html).toContain('Go to Dashboard')
    })

    it('includes onboarding steps', async () => {
      const { getWelcomeEmailHtml } = await import('./email')

      const html = getWelcomeEmailHtml({
        userName: 'Bob',
        loginUrl: 'https://example.com',
      })

      expect(html).toContain('Create your first AI agent')
      expect(html).toContain('Connect your data sources')
      expect(html).toContain('Invite your team members')
      expect(html).toContain('Explore insights and analytics')
    })

    it('has proper HTML structure', async () => {
      const { getWelcomeEmailHtml } = await import('./email')

      const html = getWelcomeEmailHtml({
        userName: 'Test',
        loginUrl: 'https://example.com',
      })

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('<html>')
      expect(html).toContain('</html>')
      expect(html).toContain('charset="utf-8"')
      expect(html).toContain('viewport')
    })
  })

  describe('sendEmail with Resend configured', () => {
    beforeEach(() => {
      vi.resetModules()
      mockSend.mockReset()
    })

    it('sends email successfully via Resend', async () => {
      vi.stubEnv('RESEND_API_KEY', 'test_api_key')
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      const { sendEmail } = await import('./email')

      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
      })

      expect(result.success).toBe(true)
      expect(result.id).toBe('email-123')
      expect(mockSend).toHaveBeenCalledWith({
        from: expect.stringContaining('GWI AI Platform'),
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
      })
    })

    it('uses custom from address when provided', async () => {
      vi.stubEnv('RESEND_API_KEY', 'test_api_key')
      mockSend.mockResolvedValue({ data: { id: 'email-456' }, error: null })

      const { sendEmail } = await import('./email')

      await sendEmail({
        to: 'recipient@example.com',
        subject: 'Custom Sender',
        html: '<p>Content</p>',
        from: 'custom@sender.com',
      })

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'custom@sender.com',
        })
      )
    })

    it('throws error when Resend returns an error', async () => {
      vi.stubEnv('RESEND_API_KEY', 'test_api_key')
      mockSend.mockResolvedValue({
        data: null,
        error: { message: 'Invalid API key' },
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { sendEmail } = await import('./email')

      await expect(
        sendEmail({
          to: 'test@example.com',
          subject: 'Test',
          html: '<p>Test</p>',
        })
      ).rejects.toThrow('Invalid API key')

      expect(consoleSpy).toHaveBeenCalledWith('Resend error:', expect.any(Object))
      consoleSpy.mockRestore()
    })

    it('throws and logs error when send throws', async () => {
      vi.stubEnv('RESEND_API_KEY', 'test_api_key')
      mockSend.mockRejectedValue(new Error('Network error'))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { sendEmail } = await import('./email')

      await expect(
        sendEmail({
          to: 'test@example.com',
          subject: 'Test',
          html: '<p>Test</p>',
        })
      ).rejects.toThrow('Network error')

      expect(consoleSpy).toHaveBeenCalledWith('Failed to send email:', expect.any(Error))
      consoleSpy.mockRestore()
    })

    it('uses EMAIL_DOMAIN env variable for default from address', async () => {
      vi.stubEnv('RESEND_API_KEY', 'test_api_key')
      vi.stubEnv('EMAIL_DOMAIN', 'custom-domain.io')
      mockSend.mockResolvedValue({ data: { id: 'email-789' }, error: null })

      const { sendEmail } = await import('./email')

      await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.stringContaining('custom-domain.io'),
        })
      )
    })
  })
})
