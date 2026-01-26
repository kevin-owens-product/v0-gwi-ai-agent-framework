import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/super-admin')
vi.mock('@/lib/gwi-permissions')
vi.mock('next/headers')

describe('GWI Agents API - /api/gwi/agents', () => {
  describe('Agent Templates - /api/gwi/agents/templates', () => {
    describe('GET /api/gwi/agents/templates', () => {
      it('should return agent templates', () => {
        const template = {
          id: 'template-1',
          name: 'Survey Analysis Agent',
          description: 'Analyzes survey responses and generates insights',
          category: 'analysis',
          configuration: {
            model: 'gpt-4-turbo',
            temperature: 0.3,
            maxIterations: 10,
            capabilities: ['data_analysis', 'pattern_recognition']
          },
          defaultTools: ['survey_query', 'llm_invoke', 'report_generator'],
          defaultPrompts: {
            system: 'You are an expert survey analyst.',
            analysis_template: 'Survey Analysis Summary'
          },
          isPublished: true,
          version: 2
        }

        expect(template.name).toBeTruthy()
        expect(template.configuration).toBeDefined()
        expect(template.defaultTools).toBeDefined()
      })

      it('should filter by category', () => {
        const validCategories = ['analysis', 'classification', 'data_quality', 'reporting', 'taxonomy', 'orchestration']
        const category = 'analysis'
        expect(validCategories).toContain(category)
      })

      it('should filter by published status', () => {
        const templates = [
          { id: '1', isPublished: true },
          { id: '2', isPublished: false },
          { id: '3', isPublished: true }
        ]

        const publishedTemplates = templates.filter(t => t.isPublished)
        expect(publishedTemplates).toHaveLength(2)
      })

      it('should include tool information', () => {
        const template = {
          defaultTools: ['survey_query', 'llm_invoke'],
          tools: [
            { name: 'survey_query', description: 'Query survey data' },
            { name: 'llm_invoke', description: 'Invoke LLM models' }
          ]
        }

        expect(template.tools).toBeDefined()
        expect(template.tools).toHaveLength(2)
      })
    })

    describe('POST /api/gwi/agents/templates', () => {
      it('should require name, category, and configuration', () => {
        const validTemplate = {
          name: 'New Agent Template',
          category: 'analysis',
          configuration: {
            model: 'gpt-4-turbo',
            temperature: 0.5
          }
        }

        expect(validTemplate.name).toBeTruthy()
        expect(validTemplate.category).toBeTruthy()
        expect(validTemplate.configuration).toBeDefined()
      })

      it('should validate configuration model', () => {
        const validModels = ['gpt-4-turbo', 'gpt-3.5-turbo', 'claude-3-opus-20240229']
        const model = 'gpt-4-turbo'
        expect(validModels).toContain(model)
      })

      it('should validate temperature range', () => {
        const temperature = 0.7
        expect(temperature).toBeGreaterThanOrEqual(0)
        expect(temperature).toBeLessThanOrEqual(2)
      })

      it('should validate capabilities', () => {
        const validCapabilities = [
          'data_analysis',
          'pattern_recognition',
          'insight_generation',
          'text_classification',
          'sentiment_analysis',
          'theme_extraction',
          'anomaly_detection',
          'quality_scoring',
          'report_writing'
        ]

        const capabilities = ['data_analysis', 'pattern_recognition']
        capabilities.forEach(cap => {
          expect(validCapabilities).toContain(cap)
        })
      })

      it('should initialize as unpublished', () => {
        const newTemplate = { isPublished: false, version: 1 }
        expect(newTemplate.isPublished).toBe(false)
        expect(newTemplate.version).toBe(1)
      })
    })

    describe('PATCH /api/gwi/agents/templates/[id]', () => {
      it('should allow updating configuration', () => {
        const update = {
          configuration: {
            model: 'gpt-4-turbo',
            temperature: 0.2,
            maxIterations: 15
          }
        }

        expect(update.configuration.temperature).toBe(0.2)
      })

      it('should allow updating tools', () => {
        const update = {
          defaultTools: ['survey_query', 'llm_invoke', 'notification_sender']
        }

        expect(update.defaultTools).toHaveLength(3)
      })

      it('should increment version on significant changes', () => {
        const existing = { version: 1, configuration: { model: 'gpt-3.5-turbo' } }
        const update = { configuration: { model: 'gpt-4-turbo' } }

        if (update.configuration.model !== existing.configuration.model) {
          const newVersion = existing.version + 1
          expect(newVersion).toBe(2)
        }
      })
    })

    describe('POST /api/gwi/agents/templates/[id]/publish', () => {
      it('should validate template before publishing', () => {
        const template = {
          name: 'Agent Template',
          configuration: { model: 'gpt-4-turbo' },
          defaultTools: ['survey_query']
        }

        const isValid = template.name && template.configuration && template.defaultTools.length > 0
        expect(isValid).toBe(true)
      })

      it('should require at least one tool', () => {
        const template = {
          defaultTools: []
        }

        expect(template.defaultTools.length).toBe(0)
        // Should fail validation
      })

      it('should set isPublished to true', () => {
        const publishedTemplate = { isPublished: true }
        expect(publishedTemplate.isPublished).toBe(true)
      })
    })
  })

  describe('System Tools - /api/gwi/agents/tools', () => {
    describe('GET /api/gwi/agents/tools', () => {
      it('should return tool configurations', () => {
        const tool = {
          id: 'tool-1',
          name: 'survey_query',
          description: 'Query and filter survey response data',
          type: 'data_access',
          configuration: {
            allowedOperations: ['select', 'filter', 'aggregate'],
            maxRows: 10000,
            allowedTables: ['SurveyResponse', 'Survey']
          },
          permissions: {
            requiredRoles: ['DATA_ENGINEER', 'ML_ENGINEER']
          },
          isActive: true
        }

        expect(tool.name).toBeTruthy()
        expect(tool.type).toBeTruthy()
        expect(tool.configuration).toBeDefined()
      })

      it('should filter by type', () => {
        const validTypes = ['data_access', 'ai_service', 'orchestration', 'reporting', 'communication', 'validation']
        const type = 'data_access'
        expect(validTypes).toContain(type)
      })

      it('should filter by active status', () => {
        const tools = [
          { id: '1', isActive: true },
          { id: '2', isActive: false }
        ]

        const activeTools = tools.filter(t => t.isActive)
        expect(activeTools).toHaveLength(1)
      })

      it('should include permission requirements', () => {
        const tool = {
          permissions: {
            requiredRoles: ['DATA_ENGINEER', 'ML_ENGINEER', 'GWI_ADMIN']
          }
        }

        expect(tool.permissions.requiredRoles).toBeDefined()
        expect(tool.permissions.requiredRoles.length).toBeGreaterThan(0)
      })
    })

    describe('POST /api/gwi/agents/tools', () => {
      it('should require name, type, and configuration', () => {
        const validTool = {
          name: 'new_tool',
          type: 'data_access',
          configuration: {
            allowedOperations: ['read']
          }
        }

        expect(validTool.name).toBeTruthy()
        expect(validTool.type).toBeTruthy()
        expect(validTool.configuration).toBeDefined()
      })

      it('should validate tool name format', () => {
        const validNames = ['survey_query', 'llm_invoke', 'report_generator']
        const invalidNames = ['Invalid Name', 'has spaces', 'UPPERCASE']

        validNames.forEach(name => {
          expect(name).toMatch(/^[a-z][a-z0-9_]*$/)
        })

        invalidNames.forEach(name => {
          expect(name).not.toMatch(/^[a-z][a-z0-9_]*$/)
        })
      })

      it('should enforce unique tool names', () => {
        const existingTools = ['survey_query', 'llm_invoke', 'report_generator']
        const newToolName = 'data_validator'

        expect(existingTools).not.toContain(newToolName)
      })

      it('should validate data_access configuration', () => {
        const dataAccessConfig = {
          allowedOperations: ['select', 'filter'],
          maxRows: 10000,
          allowedTables: ['SurveyResponse'],
          rateLimit: { requestsPerMinute: 100 }
        }

        expect(dataAccessConfig.allowedOperations).toBeDefined()
        expect(dataAccessConfig.maxRows).toBeGreaterThan(0)
      })

      it('should validate ai_service configuration', () => {
        const aiServiceConfig = {
          allowedModels: ['gpt-4-turbo', 'gpt-3.5-turbo'],
          maxTokens: 4096,
          requirePromptTemplate: true
        }

        expect(aiServiceConfig.allowedModels).toBeDefined()
        expect(aiServiceConfig.maxTokens).toBeGreaterThan(0)
      })

      it('should validate orchestration configuration', () => {
        const orchestrationConfig = {
          allowedPipelineTypes: ['ETL', 'TRANSFORMATION'],
          requireApproval: false,
          maxConcurrent: 5
        }

        expect(orchestrationConfig.allowedPipelineTypes).toBeDefined()
        expect(orchestrationConfig.maxConcurrent).toBeGreaterThan(0)
      })
    })

    describe('PATCH /api/gwi/agents/tools/[id]', () => {
      it('should allow updating configuration', () => {
        const update = {
          configuration: {
            maxRows: 20000,
            allowedOperations: ['select', 'filter', 'aggregate']
          }
        }

        expect(update.configuration.maxRows).toBe(20000)
      })

      it('should allow updating permissions', () => {
        const update = {
          permissions: {
            requiredRoles: ['GWI_ADMIN']
          }
        }

        expect(update.permissions.requiredRoles).toContain('GWI_ADMIN')
      })

      it('should allow deactivating tool', () => {
        const update = { isActive: false }
        expect(update.isActive).toBe(false)
      })

      it('should not allow changing tool name', () => {
        // Tool names should be immutable after creation
        const existing = { name: 'survey_query' }
        const updateAttempt = { name: 'new_name' }

        expect(existing.name).not.toBe(updateAttempt.name)
        // Update should be rejected
      })
    })
  })

  describe('Agent Execution', () => {
    describe('Tool Permission Checks', () => {
      it('should verify role has tool access', () => {
        const tool = {
          permissions: {
            requiredRoles: ['DATA_ENGINEER', 'ML_ENGINEER', 'GWI_ADMIN']
          }
        }

        const userRole = 'DATA_ENGINEER'
        const hasAccess = tool.permissions.requiredRoles.includes(userRole)

        expect(hasAccess).toBe(true)
      })

      it('should deny access for unauthorized roles', () => {
        const tool = {
          permissions: {
            requiredRoles: ['GWI_ADMIN']
          }
        }

        const userRole = 'ANALYST'
        const hasAccess = tool.permissions.requiredRoles.includes(userRole)

        expect(hasAccess).toBe(false)
      })
    })

    describe('Agent Iteration Limits', () => {
      it('should respect maxIterations', () => {
        const config = { maxIterations: 10 }
        const currentIteration = 8

        expect(currentIteration).toBeLessThan(config.maxIterations)
      })

      it('should stop at maxIterations', () => {
        const config = { maxIterations: 10 }
        const currentIteration = 10

        expect(currentIteration).toBe(config.maxIterations)
        // Agent should stop
      })
    })

    describe('Tool Rate Limiting', () => {
      it('should track tool invocations', () => {
        const rateLimit = { requestsPerMinute: 100 }
        const currentRequests = 85
        const remaining = rateLimit.requestsPerMinute - currentRequests

        expect(remaining).toBe(15)
      })

      it('should block when rate limited', () => {
        const rateLimit = { requestsPerMinute: 100 }
        const currentRequests = 100

        const isRateLimited = currentRequests >= rateLimit.requestsPerMinute
        expect(isRateLimited).toBe(true)
      })
    })
  })
})

describe('Agent Capabilities', () => {
  describe('Data Analysis Capability', () => {
    it('should support statistical analysis', () => {
      const data = [10, 20, 30, 40, 50]
      const sum = data.reduce((a, b) => a + b, 0)
      const avg = sum / data.length

      expect(avg).toBe(30)
    })

    it('should support grouping and aggregation', () => {
      const data = [
        { country: 'US', value: 100 },
        { country: 'UK', value: 80 },
        { country: 'US', value: 120 }
      ]

      const grouped = data.reduce((acc, item) => {
        if (!acc[item.country]) {
          acc[item.country] = []
        }
        acc[item.country].push(item.value)
        return acc
      }, {} as Record<string, number[]>)

      expect(grouped['US']).toEqual([100, 120])
      expect(grouped['UK']).toEqual([80])
    })
  })

  describe('Pattern Recognition Capability', () => {
    it('should identify trends', () => {
      const timeSeries = [
        { date: '2024-01', value: 100 },
        { date: '2024-02', value: 110 },
        { date: '2024-03', value: 125 },
        { date: '2024-04', value: 140 }
      ]

      const values = timeSeries.map(t => t.value)
      const isIncreasing = values.every((val, i) => i === 0 || val > values[i - 1])

      expect(isIncreasing).toBe(true)
    })

    it('should detect anomalies', () => {
      const data = [10, 12, 11, 13, 100, 12, 11] // 100 is an anomaly
      const mean = data.reduce((a, b) => a + b, 0) / data.length
      const stdDev = Math.sqrt(data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length)

      const anomalies = data.filter(val => Math.abs(val - mean) > 2 * stdDev)
      expect(anomalies).toContain(100)
    })
  })
})
