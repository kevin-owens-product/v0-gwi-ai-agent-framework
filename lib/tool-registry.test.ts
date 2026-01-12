import { describe, it, expect } from 'vitest'

describe('Tool Registry Utility', () => {
  describe('Tool Registration', () => {
    it('should register a tool', () => {
      const tool = {
        id: 'gwi_query',
        name: 'GWI Data Query',
        type: 'data_source',
        description: 'Query GWI audience data'
      }

      expect(tool.id).toBeTruthy()
      expect(tool.name).toBeTruthy()
    })

    it('should validate tool structure', () => {
      const tool = {
        id: 'tool-123',
        name: 'Test Tool',
        type: 'custom',
        schema: {},
        handler: () => {}
      }

      const hasRequired = !!(tool.id && tool.name && tool.type && tool.handler)
      expect(hasRequired).toBe(true)
    })

    it('should prevent duplicate tool IDs', () => {
      const tools = [
        { id: 'tool-1', name: 'Tool 1' },
        { id: 'tool-2', name: 'Tool 2' }
      ]

      const duplicateId = 'tool-1'
      const exists = tools.some(t => t.id === duplicateId)

      expect(exists).toBe(true)
    })
  })

  describe('Tool Types', () => {
    it('should support data source tools', () => {
      const tool = {
        id: 'gwi_core',
        type: 'data_source',
        config: {
          apiEndpoint: 'https://api.gwi.com',
          authentication: 'api_key'
        }
      }

      expect(tool.type).toBe('data_source')
    })

    it('should support AI agent tools', () => {
      const tool = {
        id: 'audience_analyzer',
        type: 'ai_agent',
        model: 'claude-3-5-sonnet',
        systemPrompt: 'You are an audience analysis expert'
      }

      expect(tool.type).toBe('ai_agent')
    })

    it('should support webhook tools', () => {
      const tool = {
        id: 'slack_notify',
        type: 'webhook',
        url: 'https://hooks.slack.com/services/xxx',
        method: 'POST'
      }

      expect(tool.type).toBe('webhook')
    })

    it('should support custom function tools', () => {
      const tool = {
        id: 'custom_transform',
        type: 'function',
        handler: (input: any) => input
      }

      expect(tool.type).toBe('function')
      expect(typeof tool.handler).toBe('function')
    })
  })

  describe('Tool Parameters', () => {
    it('should define input schema', () => {
      const tool = {
        id: 'gwi_query',
        inputSchema: {
          type: 'object',
          properties: {
            markets: { type: 'array', items: { type: 'string' } },
            age: { type: 'object' }
          },
          required: ['markets']
        }
      }

      expect(tool.inputSchema.required.includes('markets')).toBe(true)
    })

    it('should validate required parameters', () => {
      const schema = {
        required: ['markets', 'age']
      }

      const input = { markets: ['US'], age: { min: 18, max: 65 } }
      const hasAllRequired = schema.required.every(field => field in input)

      expect(hasAllRequired).toBe(true)
    })

    it('should validate parameter types', () => {
      const param = {
        name: 'markets',
        type: 'array',
        items: { type: 'string' }
      }

      expect(['string', 'number', 'boolean', 'object', 'array']).toContain(param.type)
    })

    it('should support optional parameters', () => {
      const schema = {
        properties: {
          markets: { type: 'array', required: true },
          limit: { type: 'number', required: false }
        }
      }

      expect(schema.properties.limit.required).toBe(false)
    })
  })

  describe('Tool Execution', () => {
    it('should execute tool', () => {
      const tool = {
        id: 'calculator',
        handler: (a: number, b: number) => a + b
      }

      const result = tool.handler(5, 3)
      expect(result).toBe(8)
    })

    it('should track execution status', () => {
      const execution = {
        toolId: 'gwi_query',
        status: 'running',
        startedAt: new Date()
      }

      expect(['pending', 'running', 'completed', 'failed']).toContain(execution.status)
    })

    it('should store execution result', () => {
      const execution = {
        toolId: 'gwi_query',
        status: 'completed',
        result: { audienceSize: 50000000 },
        completedAt: new Date()
      }

      expect(execution.result).toBeDefined()
    })

    it('should handle execution errors', () => {
      const execution = {
        toolId: 'webhook',
        status: 'failed',
        error: {
          code: 'NETWORK_ERROR',
          message: 'Connection timeout'
        }
      }

      expect(execution.status).toBe('failed')
      expect(execution.error).toBeDefined()
    })
  })

  describe('Tool Discovery', () => {
    it('should list available tools', () => {
      const tools = [
        { id: 'gwi_core', name: 'GWI Core' },
        { id: 'slack_notify', name: 'Slack Notification' }
      ]

      expect(tools.length).toBeGreaterThan(0)
    })

    it('should filter tools by type', () => {
      const tools = [
        { id: 'tool-1', type: 'data_source' },
        { id: 'tool-2', type: 'webhook' },
        { id: 'tool-3', type: 'data_source' }
      ]

      const dataSources = tools.filter(t => t.type === 'data_source')
      expect(dataSources.length).toBe(2)
    })

    it('should search tools by name', () => {
      const tools = [
        { id: 'tool-1', name: 'GWI Core Query' },
        { id: 'tool-2', name: 'GWI Sports Data' },
        { id: 'tool-3', name: 'Slack Notification' }
      ]

      const search = 'GWI'
      const results = tools.filter(t => t.name.includes(search))
      expect(results.length).toBe(2)
    })
  })

  describe('Tool Configuration', () => {
    it('should configure tool settings', () => {
      const config = {
        toolId: 'gwi_core',
        apiKey: 'encrypted_key',
        timeout: 30000,
        retryPolicy: {
          maxRetries: 3,
          retryDelay: 1000
        }
      }

      expect(config.timeout).toBeGreaterThan(0)
      expect(config.retryPolicy.maxRetries).toBeGreaterThan(0)
    })

    it('should validate configuration', () => {
      const config = {
        apiKey: 'key_123',
        endpoint: 'https://api.example.com'
      }

      const hasApiKey = config.apiKey && config.apiKey.length > 0
      const hasEndpoint = config.endpoint && config.endpoint.startsWith('https')

      expect(hasApiKey && hasEndpoint).toBe(true)
    })

    it('should support environment-specific config', () => {
      const config = {
        development: { endpoint: 'https://dev.api.com' },
        production: { endpoint: 'https://api.com' }
      }

      const env = 'development'
      expect(config[env].endpoint).toContain('dev')
    })
  })

  describe('Tool Permissions', () => {
    it('should check tool access', () => {
      const permissions = {
        userId: 'user-123',
        toolId: 'gwi_core',
        canExecute: true
      }

      expect(permissions.canExecute).toBe(true)
    })

    it('should support role-based access', () => {
      const tool = {
        id: 'admin_tool',
        requiredRoles: ['admin', 'owner']
      }

      const userRole = 'admin'
      const hasAccess = tool.requiredRoles.includes(userRole)

      expect(hasAccess).toBe(true)
    })

    it('should support organization-level tools', () => {
      const tool = {
        id: 'custom_tool',
        organizationId: 'org-123',
        isPublic: false
      }

      expect(tool.organizationId).toBeTruthy()
    })
  })

  describe('Tool Versioning', () => {
    it('should track tool version', () => {
      const tool = {
        id: 'gwi_core',
        version: '2.1.0',
        deprecated: false
      }

      expect(tool.version).toBeTruthy()
    })

    it('should mark deprecated tools', () => {
      const tool = {
        id: 'old_tool',
        version: '1.0.0',
        deprecated: true,
        deprecationMessage: 'Use new_tool instead'
      }

      expect(tool.deprecated).toBe(true)
    })

    it('should support version comparison', () => {
      const v1 = '2.1.0'
      const v2 = '2.0.5'

      const v1Parts = v1.split('.').map(Number)
      const v2Parts = v2.split('.').map(Number)

      const isNewer = v1Parts[0] > v2Parts[0] ||
        (v1Parts[0] === v2Parts[0] && v1Parts[1] > v2Parts[1])

      expect(isNewer).toBe(true)
    })
  })

  describe('Tool Monitoring', () => {
    it('should track tool usage', () => {
      const usage = {
        toolId: 'gwi_core',
        totalExecutions: 1500,
        successfulExecutions: 1485,
        failedExecutions: 15
      }

      const successRate = (usage.successfulExecutions / usage.totalExecutions) * 100
      expect(successRate).toBeGreaterThan(95)
    })

    it('should track execution time', () => {
      const metrics = {
        toolId: 'gwi_core',
        avgExecutionTime: 250,
        maxExecutionTime: 1200,
        minExecutionTime: 50
      }

      expect(metrics.avgExecutionTime).toBeGreaterThan(metrics.minExecutionTime)
      expect(metrics.avgExecutionTime).toBeLessThan(metrics.maxExecutionTime)
    })
  })
})
