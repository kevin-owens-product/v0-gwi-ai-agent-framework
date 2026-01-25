/**
 * @prompt-id forge-v4.1:feature:email-template-management:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  renderTemplate,
  extractVariables,
  validateVariables,
  DEFAULT_SYSTEM_TEMPLATES,
} from './email-templates'

describe('email-templates', () => {
  describe('renderTemplate', () => {
    it('should replace variables with provided data', () => {
      const template = {
        subject: 'Hello {{userName}}',
        htmlContent: '<p>Welcome {{userName}} to {{platformName}}</p>',
        textContent: 'Welcome {{userName}} to {{platformName}}',
      }
      const data = {
        userName: 'John Doe',
        platformName: 'GWI Platform',
      }

      const result = renderTemplate(template, data)

      expect(result.subject).toBe('Hello John Doe')
      expect(result.html).toBe('<p>Welcome John Doe to GWI Platform</p>')
      expect(result.text).toBe('Welcome John Doe to GWI Platform')
    })

    it('should preserve unmatched variables', () => {
      const template = {
        subject: 'Hello {{userName}}',
        htmlContent: '<p>Welcome {{unknownVar}}</p>',
        textContent: null,
      }
      const data = {
        userName: 'John',
      }

      const result = renderTemplate(template, data)

      expect(result.subject).toBe('Hello John')
      expect(result.html).toBe('<p>Welcome {{unknownVar}}</p>')
      expect(result.text).toBeUndefined()
    })

    it('should handle empty data', () => {
      const template = {
        subject: 'Hello {{userName}}',
        htmlContent: '<p>Welcome</p>',
        textContent: null,
      }

      const result = renderTemplate(template, {})

      expect(result.subject).toBe('Hello {{userName}}')
      expect(result.html).toBe('<p>Welcome</p>')
    })

    it('should handle multiple occurrences of same variable', () => {
      const template = {
        subject: '{{name}} - Welcome {{name}}',
        htmlContent: '<p>{{name}}, {{name}}, {{name}}</p>',
        textContent: null,
      }
      const data = { name: 'Alice' }

      const result = renderTemplate(template, data)

      expect(result.subject).toBe('Alice - Welcome Alice')
      expect(result.html).toBe('<p>Alice, Alice, Alice</p>')
    })
  })

  describe('extractVariables', () => {
    it('should extract all unique variables from content', () => {
      const content = 'Hello {{userName}}, welcome to {{platformName}}. Contact {{supportEmail}}.'
      const variables = extractVariables(content)

      expect(variables).toHaveLength(3)
      expect(variables).toContain('userName')
      expect(variables).toContain('platformName')
      expect(variables).toContain('supportEmail')
    })

    it('should return unique variables only', () => {
      const content = '{{name}} {{name}} {{name}}'
      const variables = extractVariables(content)

      expect(variables).toHaveLength(1)
      expect(variables).toContain('name')
    })

    it('should return empty array for content without variables', () => {
      const content = 'Hello world, no variables here!'
      const variables = extractVariables(content)

      expect(variables).toHaveLength(0)
    })

    it('should handle empty content', () => {
      const variables = extractVariables('')
      expect(variables).toHaveLength(0)
    })

    it('should only match valid variable names (alphanumeric and underscore)', () => {
      const content = '{{valid_name}} {{valid123}} {{invalid-name}} {{invalid.name}}'
      const variables = extractVariables(content)

      expect(variables).toContain('valid_name')
      expect(variables).toContain('valid123')
      expect(variables).not.toContain('invalid-name')
      expect(variables).not.toContain('invalid.name')
    })
  })

  describe('validateVariables', () => {
    it('should return valid when all required variables are provided', () => {
      const template = {
        variables: [
          { name: 'userName', description: 'User name', required: true },
          { name: 'email', description: 'Email', required: true },
          { name: 'optional', description: 'Optional', required: false },
        ],
      } as any

      const data = {
        userName: 'John',
        email: 'john@example.com',
      }

      const result = validateVariables(template, data)

      expect(result.valid).toBe(true)
      expect(result.missing).toHaveLength(0)
    })

    it('should return invalid when required variables are missing', () => {
      const template = {
        variables: [
          { name: 'userName', description: 'User name', required: true },
          { name: 'email', description: 'Email', required: true },
        ],
      } as any

      const data = {
        userName: 'John',
      }

      const result = validateVariables(template, data)

      expect(result.valid).toBe(false)
      expect(result.missing).toContain('email')
    })

    it('should consider default values for required validation', () => {
      const template = {
        variables: [
          { name: 'userName', description: 'User name', required: true },
          { name: 'platformName', description: 'Platform', required: true, defaultValue: 'GWI' },
        ],
      } as any

      const data = {
        userName: 'John',
      }

      const result = validateVariables(template, data)

      expect(result.valid).toBe(true)
      expect(result.missing).toHaveLength(0)
    })

    it('should handle templates with no variables', () => {
      const template = {
        variables: [],
      } as any

      const result = validateVariables(template, {})

      expect(result.valid).toBe(true)
      expect(result.missing).toHaveLength(0)
    })
  })

  describe('DEFAULT_SYSTEM_TEMPLATES', () => {
    it('should include welcome template', () => {
      const welcome = DEFAULT_SYSTEM_TEMPLATES.find(t => t.slug === 'welcome')

      expect(welcome).toBeDefined()
      expect(welcome?.name).toBe('Welcome Email')
      expect(welcome?.category).toBe('ONBOARDING')
      expect(welcome?.variables.length).toBeGreaterThan(0)
    })

    it('should include password_reset template', () => {
      const passwordReset = DEFAULT_SYSTEM_TEMPLATES.find(t => t.slug === 'password_reset')

      expect(passwordReset).toBeDefined()
      expect(passwordReset?.name).toBe('Password Reset')
      expect(passwordReset?.category).toBe('AUTHENTICATION')
    })

    it('should include invitation template', () => {
      const invitation = DEFAULT_SYSTEM_TEMPLATES.find(t => t.slug === 'invitation')

      expect(invitation).toBeDefined()
      expect(invitation?.name).toBe('Team Invitation')
      expect(invitation?.category).toBe('ONBOARDING')
    })

    it('all templates should have required fields', () => {
      DEFAULT_SYSTEM_TEMPLATES.forEach(template => {
        expect(template.name).toBeTruthy()
        expect(template.slug).toBeTruthy()
        expect(template.subject).toBeTruthy()
        expect(template.category).toBeTruthy()
        expect(template.htmlContent).toBeTruthy()
        expect(Array.isArray(template.variables)).toBe(true)
        expect(typeof template.previewData).toBe('object')
      })
    })

    it('all template variables should be found in content', () => {
      DEFAULT_SYSTEM_TEMPLATES.forEach(template => {
        const contentVariables = extractVariables(
          `${template.subject} ${template.htmlContent} ${template.textContent}`
        )

        template.variables.forEach(v => {
          expect(contentVariables).toContain(v.name)
        })
      })
    })

    it('all preview data keys should match defined variables', () => {
      DEFAULT_SYSTEM_TEMPLATES.forEach(template => {
        const variableNames = template.variables.map(v => v.name)

        Object.keys(template.previewData).forEach(key => {
          expect(variableNames).toContain(key)
        })
      })
    })
  })
})
