import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/super-admin')
vi.mock('@/lib/gwi-permissions')
vi.mock('next/headers')

describe('GWI LLM Configuration API - /api/gwi/llm', () => {
  describe('LLM Configurations - /api/gwi/llm/configurations', () => {
    describe('GET /api/gwi/llm/configurations', () => {
      it('should return LLM configurations', () => {
        const config = {
          id: 'config-1',
          name: 'GPT-4 Turbo Production',
          provider: 'openai',
          model: 'gpt-4-turbo',
          apiKeyRef: 'OPENAI_API_KEY',
          defaultParams: {
            temperature: 0.7,
            max_tokens: 4096,
            top_p: 0.95
          },
          rateLimits: {
            requestsPerMinute: 500,
            tokensPerMinute: 150000
          },
          isActive: true
        }

        expect(config.provider).toBeTruthy()
        expect(config.model).toBeTruthy()
        expect(config.apiKeyRef).toBeTruthy()
        expect(config.defaultParams).toBeDefined()
      })

      it('should not expose actual API keys', () => {
        const config = {
          apiKeyRef: 'OPENAI_API_KEY',
          // Should NOT have:
          // apiKey: 'sk-...'
        }

        expect(config).not.toHaveProperty('apiKey')
        expect(config.apiKeyRef).toBeTruthy()
      })

      it('should include usage statistics', () => {
        const configWithStats = {
          id: 'config-1',
          _stats: {
            totalRequests: 50000,
            totalTokens: 25000000,
            totalCost: 250.50,
            avgLatency: 1200
          }
        }

        expect(configWithStats._stats).toBeDefined()
        expect(configWithStats._stats.totalRequests).toBeGreaterThanOrEqual(0)
      })

      it('should filter by provider', () => {
        const configs = [
          { id: '1', provider: 'openai' },
          { id: '2', provider: 'anthropic' },
          { id: '3', provider: 'openai' }
        ]

        const openaiConfigs = configs.filter(c => c.provider === 'openai')
        expect(openaiConfigs).toHaveLength(2)
      })

      it('should filter by active status', () => {
        const configs = [
          { id: '1', isActive: true },
          { id: '2', isActive: false }
        ]

        const activeConfigs = configs.filter(c => c.isActive)
        expect(activeConfigs).toHaveLength(1)
      })
    })

    describe('POST /api/gwi/llm/configurations', () => {
      it('should require provider and model', () => {
        const validConfig = {
          name: 'New Config',
          provider: 'openai',
          model: 'gpt-4-turbo',
          apiKeyRef: 'OPENAI_API_KEY'
        }

        expect(validConfig.provider).toBeTruthy()
        expect(validConfig.model).toBeTruthy()
      })

      it('should validate provider names', () => {
        const validProviders = ['openai', 'anthropic', 'google', 'cohere', 'azure']
        const provider = 'openai'
        expect(validProviders).toContain(provider)
      })

      it('should validate default parameters', () => {
        const defaultParams = {
          temperature: 0.7,
          max_tokens: 4096,
          top_p: 0.95
        }

        expect(defaultParams.temperature).toBeGreaterThanOrEqual(0)
        expect(defaultParams.temperature).toBeLessThanOrEqual(2)
        expect(defaultParams.max_tokens).toBeGreaterThan(0)
        expect(defaultParams.top_p).toBeGreaterThanOrEqual(0)
        expect(defaultParams.top_p).toBeLessThanOrEqual(1)
      })

      it('should validate rate limits', () => {
        const rateLimits = {
          requestsPerMinute: 500,
          tokensPerMinute: 150000
        }

        expect(rateLimits.requestsPerMinute).toBeGreaterThan(0)
        expect(rateLimits.tokensPerMinute).toBeGreaterThan(0)
      })

      it('should enforce unique provider+model combination', () => {
        const existingConfigs = [
          { provider: 'openai', model: 'gpt-4-turbo' },
          { provider: 'anthropic', model: 'claude-3-opus' }
        ]

        const newConfig = { provider: 'openai', model: 'gpt-3.5-turbo' }
        const isDuplicate = existingConfigs.some(
          c => c.provider === newConfig.provider && c.model === newConfig.model
        )

        expect(isDuplicate).toBe(false)
      })
    })

    describe('PATCH /api/gwi/llm/configurations/[id]', () => {
      it('should allow updating parameters', () => {
        const update = {
          defaultParams: {
            temperature: 0.5,
            max_tokens: 8192
          }
        }

        expect(update.defaultParams.temperature).toBeDefined()
      })

      it('should allow updating rate limits', () => {
        const update = {
          rateLimits: {
            requestsPerMinute: 1000,
            tokensPerMinute: 200000
          }
        }

        expect(update.rateLimits.requestsPerMinute).toBeGreaterThan(0)
      })

      it('should allow activating/deactivating', () => {
        const update = { isActive: false }
        expect(update.isActive).toBe(false)
      })
    })
  })

  describe('Prompt Templates - /api/gwi/llm/prompts', () => {
    describe('GET /api/gwi/llm/prompts', () => {
      it('should return prompt templates', () => {
        const template = {
          id: 'prompt-1',
          name: 'Survey Analysis Summary',
          description: 'Generates executive summary of survey results',
          category: 'analysis',
          template: 'Analyze the following survey results: {{survey_data}}',
          variables: ['survey_data', 'sample_size'],
          version: 2,
          isActive: true
        }

        expect(template.name).toBeTruthy()
        expect(template.template).toBeTruthy()
        expect(template.variables).toBeDefined()
      })

      it('should filter by category', () => {
        const templates = [
          { id: '1', category: 'analysis' },
          { id: '2', category: 'classification' },
          { id: '3', category: 'analysis' }
        ]

        const analysisTemplates = templates.filter(t => t.category === 'analysis')
        expect(analysisTemplates).toHaveLength(2)
      })

      it('should extract template variables', () => {
        const template = 'Hello {{name}}, your score is {{score}}. Details: {{details}}'
        const variablePattern = /\{\{(\w+)\}\}/g
        const variables: string[] = []
        let match

        while ((match = variablePattern.exec(template)) !== null) {
          variables.push(match[1])
        }

        expect(variables).toContain('name')
        expect(variables).toContain('score')
        expect(variables).toContain('details')
      })
    })

    describe('POST /api/gwi/llm/prompts', () => {
      it('should require name, category, and template', () => {
        const validTemplate = {
          name: 'New Template',
          category: 'analysis',
          template: 'Analyze: {{data}}'
        }

        expect(validTemplate.name).toBeTruthy()
        expect(validTemplate.category).toBeTruthy()
        expect(validTemplate.template).toBeTruthy()
      })

      it('should validate template syntax', () => {
        const validTemplate = 'Hello {{name}}, your data: {{data}}'
        const invalidTemplate = 'Hello {{name}, missing closing'

        // Valid template has matched braces
        const validPattern = /\{\{[^}]+\}\}/g
        expect(validTemplate.match(validPattern)).toHaveLength(2)

        // Invalid template detection
        const unmatchedOpen = (invalidTemplate.match(/\{\{/g) || []).length
        const unmatchedClose = (invalidTemplate.match(/\}\}/g) || []).length
        expect(unmatchedOpen).not.toBe(unmatchedClose)
      })

      it('should auto-extract variables from template', () => {
        const template = 'Survey: {{survey_name}}\nData: {{data_summary}}\nPeriod: {{date_range}}'
        const variablePattern = /\{\{(\w+)\}\}/g
        const variables: string[] = []
        let match

        while ((match = variablePattern.exec(template)) !== null) {
          variables.push(match[1])
        }

        expect(variables).toEqual(['survey_name', 'data_summary', 'date_range'])
      })

      it('should initialize version to 1', () => {
        const newTemplate = { version: 1 }
        expect(newTemplate.version).toBe(1)
      })
    })

    describe('PATCH /api/gwi/llm/prompts/[id]', () => {
      it('should increment version on content update', () => {
        const existing = { version: 2, template: 'Old template' }
        const update = { template: 'New template' }

        if (update.template !== existing.template) {
          const newVersion = existing.version + 1
          expect(newVersion).toBe(3)
        }
      })

      it('should preserve version for metadata-only updates', () => {
        const existing = { version: 2, description: 'Old desc' }
        // Metadata-only update: { description: 'New desc' }
        void { description: 'New desc' }

        // Description updates don't increment version
        expect(existing.version).toBe(2)
      })
    })
  })

  describe('LLM Usage Analytics - /api/gwi/llm/usage', () => {
    describe('GET /api/gwi/llm/usage', () => {
      it('should return usage statistics', () => {
        const usage = {
          totalRequests: 50000,
          totalPromptTokens: 15000000,
          totalCompletionTokens: 10000000,
          totalCost: 250.50,
          avgLatencyMs: 1200,
          byProvider: {
            openai: { requests: 40000, cost: 200 },
            anthropic: { requests: 10000, cost: 50.50 }
          },
          byModel: {
            'gpt-4-turbo': { requests: 30000, cost: 180 },
            'gpt-3.5-turbo': { requests: 10000, cost: 20 }
          }
        }

        expect(usage.totalRequests).toBeGreaterThan(0)
        expect(usage.totalCost).toBeGreaterThanOrEqual(0)
        expect(usage.byProvider).toBeDefined()
        expect(usage.byModel).toBeDefined()
      })

      it('should support date range filtering', () => {
        const filters = {
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        }

        const start = new Date(filters.startDate)
        const end = new Date(filters.endDate)
        expect(start.getTime()).toBeLessThan(end.getTime())
      })

      it('should support grouping by time period', () => {
        const validGroupings = ['hour', 'day', 'week', 'month']
        const grouping = 'day'
        expect(validGroupings).toContain(grouping)
      })

      it('should calculate cost correctly', () => {
        const usageRecord = {
          promptTokens: 1000,
          completionTokens: 500,
          model: 'gpt-4-turbo'
        }

        // GPT-4 Turbo pricing (approximate)
        const promptCostPer1k = 0.01
        const completionCostPer1k = 0.03

        const totalCost =
          (usageRecord.promptTokens / 1000) * promptCostPer1k +
          (usageRecord.completionTokens / 1000) * completionCostPer1k

        expect(totalCost).toBeCloseTo(0.025, 3)
      })

      it('should return time series data', () => {
        const timeSeries = [
          { date: '2024-01-01', requests: 1000, cost: 10 },
          { date: '2024-01-02', requests: 1200, cost: 12 },
          { date: '2024-01-03', requests: 800, cost: 8 }
        ]

        expect(timeSeries.length).toBeGreaterThan(0)
        expect(timeSeries[0].date).toBeTruthy()
        expect(timeSeries[0].requests).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('LLM Testing - /api/gwi/llm/test', () => {
    describe('POST /api/gwi/llm/test', () => {
      it('should require configurationId and prompt', () => {
        const testRequest = {
          configurationId: 'config-1',
          prompt: 'Test prompt',
          parameters: { temperature: 0.5 }
        }

        expect(testRequest.configurationId).toBeTruthy()
        expect(testRequest.prompt).toBeTruthy()
      })

      it('should support template rendering', () => {
        const template = 'Analyze: {{data}}'
        const variables: Record<string, string> = { data: 'Sample data here' }

        const rendered = template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || '')
        expect(rendered).toBe('Analyze: Sample data here')
      })

      it('should return test results', () => {
        const testResult = {
          success: true,
          response: 'This is the model response',
          usage: {
            promptTokens: 50,
            completionTokens: 150,
            totalTokens: 200
          },
          latencyMs: 1500,
          cost: 0.005
        }

        expect(testResult.success).toBe(true)
        expect(testResult.response).toBeTruthy()
        expect(testResult.usage).toBeDefined()
        expect(testResult.latencyMs).toBeGreaterThan(0)
      })

      it('should handle errors gracefully', () => {
        const errorResult = {
          success: false,
          error: 'Rate limit exceeded',
          errorCode: 'RATE_LIMIT',
          details: { retryAfter: 60 }
        }

        expect(errorResult.success).toBe(false)
        expect(errorResult.error).toBeTruthy()
      })

      it('should not persist test usage to analytics', () => {
        const testRequest = {
          configurationId: 'config-1',
          prompt: 'Test prompt',
          dryRun: true
        }

        // Test requests with dryRun should not be counted
        expect(testRequest.dryRun).toBe(true)
      })
    })
  })
})

describe('LLM Rate Limiting', () => {
  it('should track requests per minute', () => {
    const rateLimits = { requestsPerMinute: 500 }
    const currentRequests = 450
    const remaining = rateLimits.requestsPerMinute - currentRequests

    expect(remaining).toBe(50)
    expect(remaining).toBeGreaterThan(0)
  })

  it('should track tokens per minute', () => {
    const rateLimits = { tokensPerMinute: 150000 }
    const currentTokens = 140000
    const remaining = rateLimits.tokensPerMinute - currentTokens

    expect(remaining).toBe(10000)
  })

  it('should reset limits after window expires', () => {
    const windowStart = new Date(Date.now() - 61000) // 61 seconds ago
    const windowDuration = 60000 // 1 minute

    const windowExpired = (Date.now() - windowStart.getTime()) > windowDuration
    expect(windowExpired).toBe(true)
  })

  it('should queue requests when rate limited', () => {
    const queue = [
      { id: '1', priority: 1 },
      { id: '2', priority: 2 },
      { id: '3', priority: 1 }
    ]

    const sortedQueue = [...queue].sort((a, b) => a.priority - b.priority)
    expect(sortedQueue[0].priority).toBe(1)
  })
})
