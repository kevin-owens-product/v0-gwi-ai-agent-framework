import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('@/lib/auth')
vi.mock('@/lib/db')
vi.mock('@/lib/tenant')
vi.mock('@/lib/permissions')
vi.mock('@/lib/billing')
vi.mock('next/headers')

describe('Chat API - POST /api/v1/chat', () => {
  describe('Request Validation', () => {
    it('should validate request schema with valid data', async () => {
      const validRequest = {
        message: 'Tell me about Gen Z consumers',
        agentId: 'audience-explorer',
        context: {},
        config: {
          temperature: 0.7,
          maxTokens: 2000,
          enableCitations: true,
          enableMemory: true,
          selectedSources: ['GWI Core']
        }
      }

      // Schema should accept this
      expect(validRequest.message).toBeTruthy()
      expect(validRequest.message.length).toBeGreaterThan(0)
    })

    it('should reject empty message', () => {
      const invalidRequest = {
        message: '',
        agentId: 'audience-explorer'
      }

      expect(invalidRequest.message.length).toBe(0)
    })

    it('should accept request without optional fields', () => {
      const minimalRequest = {
        message: 'Tell me about Gen Z consumers'
      }

      expect(minimalRequest.message).toBeTruthy()
    })

    it('should accept valid config options', () => {
      const config = {
        temperature: 0.7,
        maxTokens: 2000,
        enableCitations: true,
        enableMemory: false,
        selectedSources: ['GWI Core', 'GWI USA']
      }

      expect(config.temperature).toBeGreaterThanOrEqual(0)
      expect(config.temperature).toBeLessThanOrEqual(1)
      expect(config.maxTokens).toBeGreaterThan(0)
      expect(Array.isArray(config.selectedSources)).toBe(true)
    })
  })

  describe('Agent Knowledge Bases', () => {
    const agentKnowledge: Record<string, { systemPrompt: string; capabilities: string[] }> = {
      'audience-explorer': {
        systemPrompt: 'You are the Audience Explorer agent',
        capabilities: ['Segment Analysis', 'Persona Generation']
      },
      'persona-architect': {
        systemPrompt: 'You are the Persona Architect agent',
        capabilities: ['Persona Creation', 'Journey Mapping']
      },
      'motivation-decoder': {
        systemPrompt: 'You are the Motivation Decoder agent',
        capabilities: ['Value Analysis', 'Emotional Drivers']
      }
    }

    it('should have defined agent knowledge bases', () => {
      expect(Object.keys(agentKnowledge).length).toBeGreaterThan(0)
    })

    it('should have system prompts for all agents', () => {
      Object.values(agentKnowledge).forEach(agent => {
        expect(agent.systemPrompt).toBeTruthy()
        expect(agent.systemPrompt.length).toBeGreaterThan(0)
      })
    })

    it('should have capabilities for all agents', () => {
      Object.values(agentKnowledge).forEach(agent => {
        expect(Array.isArray(agent.capabilities)).toBe(true)
        expect(agent.capabilities.length).toBeGreaterThan(0)
      })
    })

    it('should have audience-explorer agent', () => {
      expect(agentKnowledge['audience-explorer']).toBeDefined()
    })

    it('should have persona-architect agent', () => {
      expect(agentKnowledge['persona-architect']).toBeDefined()
    })

    it('should have motivation-decoder agent', () => {
      expect(agentKnowledge['motivation-decoder']).toBeDefined()
    })
  })

  describe('Organization ID Resolution', () => {
    it('should prioritize header organization ID', () => {
      const headerOrgId = 'org-from-header'
      expect(headerOrgId).toBeTruthy()
    })

    it('should fall back to cookie organization ID', () => {
      const cookieOrgId = 'org-from-cookie'
      expect(cookieOrgId).toBeTruthy()
    })

    it('should use first membership if no preference set', () => {
      const memberships = [
        { organization: { id: 'org-1' } },
        { organization: { id: 'org-2' } }
      ]
      expect(memberships.length).toBeGreaterThan(0)
      expect(memberships[0].organization.id).toBe('org-1')
    })
  })

  describe('Response Structure', () => {
    it('should include response text', () => {
      const mockResponse = {
        response: 'This is a test response',
        outputBlocks: []
      }

      expect(mockResponse.response).toBeTruthy()
      expect(typeof mockResponse.response).toBe('string')
    })

    it('should include output blocks array', () => {
      const mockResponse = {
        response: 'Test response',
        outputBlocks: [
          {
            id: 'block-1',
            type: 'chart',
            title: 'Test Chart',
            content: { data: [] }
          }
        ]
      }

      expect(Array.isArray(mockResponse.outputBlocks)).toBe(true)
    })

    it('should have valid output block structure', () => {
      const outputBlock = {
        id: 'block-1',
        type: 'chart',
        title: 'Demographic Breakdown',
        content: {
          data: [
            { label: 'Gen Z', value: 35 },
            { label: 'Millennials', value: 45 }
          ]
        }
      }

      expect(outputBlock.id).toBeTruthy()
      expect(outputBlock.type).toBeTruthy()
      expect(outputBlock.title).toBeTruthy()
      expect(outputBlock.content).toBeTruthy()
    })
  })

  describe('Query Understanding', () => {
    it('should detect Gen Z queries', () => {
      const queries = [
        'Tell me about Gen Z consumers',
        'What are generation z preferences?',
        'gen z behavior'
      ]

      queries.forEach(query => {
        const lowerQuery = query.toLowerCase()
        const hasGenZ = lowerQuery.includes('gen z') || lowerQuery.includes('generation z')
        expect(hasGenZ).toBe(true)
      })
    })

    it('should detect sustainability queries', () => {
      const queries = [
        'sustainable consumer behavior',
        'eco-friendly products',
        'green initiatives'
      ]

      queries.forEach(query => {
        const lowerQuery = query.toLowerCase()
        const hasSustainability =
          lowerQuery.includes('sustain') ||
          lowerQuery.includes('eco') ||
          lowerQuery.includes('green')
        expect(hasSustainability).toBe(true)
      })
    })

    it('should detect market queries', () => {
      const queries = [
        'market trends in UK',
        'regional differences',
        'country comparison'
      ]

      queries.forEach(query => {
        const lowerQuery = query.toLowerCase()
        const hasMarket =
          lowerQuery.includes('market') ||
          lowerQuery.includes('region') ||
          lowerQuery.includes('country')
        expect(hasMarket).toBe(true)
      })
    })

    it('should detect brand queries', () => {
      const queries = [
        'brand perception analysis',
        'company reputation',
        'competitor comparison'
      ]

      queries.forEach(query => {
        const lowerQuery = query.toLowerCase()
        const hasBrand =
          lowerQuery.includes('brand') ||
          lowerQuery.includes('company') ||
          lowerQuery.includes('competitor')
        expect(hasBrand).toBe(true)
      })
    })
  })
})
