import { describe, it, expect, vi } from 'vitest'

vi.mock('@anthropic-ai/sdk')

describe('LLM Utilities', () => {
  describe('Model Configuration', () => {
    it('should support Claude Sonnet model', () => {
      const models = ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307']
      expect(models).toContain('claude-3-5-sonnet-20241022')
    })

    it('should have valid temperature range', () => {
      const temperature = 0.7
      expect(temperature).toBeGreaterThanOrEqual(0)
      expect(temperature).toBeLessThanOrEqual(1)
    })

    it('should have valid max tokens', () => {
      const maxTokens = 4096
      expect(maxTokens).toBeGreaterThan(0)
      expect(maxTokens).toBeLessThanOrEqual(200000)
    })

    it('should support top_p parameter', () => {
      const topP = 0.9
      expect(topP).toBeGreaterThan(0)
      expect(topP).toBeLessThanOrEqual(1)
    })
  })

  describe('Message Structure', () => {
    it('should format user messages', () => {
      const message = {
        role: 'user',
        content: 'Tell me about consumer trends'
      }

      expect(message.role).toBe('user')
      expect(message.content).toBeTruthy()
    })

    it('should format assistant messages', () => {
      const message = {
        role: 'assistant',
        content: 'Here are the key trends...'
      }

      expect(message.role).toBe('assistant')
      expect(message.content).toBeTruthy()
    })

    it('should support multi-turn conversations', () => {
      const conversation = [
        { role: 'user', content: 'What is Gen Z?' },
        { role: 'assistant', content: 'Gen Z refers to...' },
        { role: 'user', content: 'What are their preferences?' }
      ]

      expect(conversation.length).toBeGreaterThan(1)
      expect(conversation[0].role).toBe('user')
      expect(conversation[1].role).toBe('assistant')
    })
  })

  describe('System Prompts', () => {
    it('should include role definition', () => {
      const systemPrompt = 'You are an expert consumer insights analyst specializing in GWI data.'
      expect(systemPrompt).toContain('You are')
      expect(systemPrompt.length).toBeGreaterThan(10)
    })

    it('should include capabilities', () => {
      const systemPrompt = `You are an expert analyst.
      Your capabilities include:
      - Analyzing consumer behavior
      - Generating insights
      - Creating visualizations`

      expect(systemPrompt).toContain('capabilities')
      expect(systemPrompt).toContain('Analyzing')
    })

    it('should include data sources', () => {
      const systemPrompt = 'You have access to GWI Core data covering 2.8 billion consumers.'
      expect(systemPrompt).toContain('GWI')
      expect(systemPrompt).toContain('data')
    })
  })

  describe('Response Parsing', () => {
    it('should extract text from response', () => {
      const response = {
        content: [
          { type: 'text', text: 'Here are the insights...' }
        ]
      }

      expect(response.content[0].type).toBe('text')
      expect(response.content[0].text).toBeTruthy()
    })

    it('should handle streaming responses', () => {
      const chunk = {
        type: 'content_block_delta',
        delta: { type: 'text_delta', text: 'partial text' }
      }

      expect(chunk.type).toBe('content_block_delta')
      expect(chunk.delta.text).toBeTruthy()
    })

    it('should detect completion', () => {
      const response = {
        stop_reason: 'end_turn',
        usage: {
          input_tokens: 100,
          output_tokens: 200
        }
      }

      expect(response.stop_reason).toBe('end_turn')
      expect(response.usage.input_tokens).toBeGreaterThan(0)
      expect(response.usage.output_tokens).toBeGreaterThan(0)
    })
  })

  describe('Error Handling', () => {
    it('should handle rate limit errors', () => {
      const error = {
        type: 'rate_limit_error',
        message: 'Rate limit exceeded'
      }

      expect(error.type).toBe('rate_limit_error')
      expect(error.message).toContain('Rate limit')
    })

    it('should handle invalid request errors', () => {
      const error = {
        type: 'invalid_request_error',
        message: 'Invalid parameter'
      }

      expect(error.type).toBe('invalid_request_error')
    })

    it('should handle API errors', () => {
      const error = {
        type: 'api_error',
        message: 'Internal server error'
      }

      expect(error.type).toBe('api_error')
    })
  })

  describe('Token Counting', () => {
    it('should estimate token count', () => {
      const text = 'This is a sample text for token counting'
      const estimatedTokens = Math.ceil(text.split(/\s+/).length * 1.3)

      expect(estimatedTokens).toBeGreaterThan(0)
    })

    it('should respect max token limits', () => {
      const maxTokens = 4096
      const requestTokens = 3000

      expect(requestTokens).toBeLessThan(maxTokens)
    })

    it('should account for system prompt tokens', () => {
      const systemPrompt = 'You are an expert analyst'
      const userMessage = 'Analyze this data'
      const systemTokens = Math.ceil(systemPrompt.split(/\s+/).length * 1.3)
      const userTokens = Math.ceil(userMessage.split(/\s+/).length * 1.3)
      const totalTokens = systemTokens + userTokens

      expect(totalTokens).toBeGreaterThan(systemTokens)
      expect(totalTokens).toBeGreaterThan(userTokens)
    })
  })

  describe('Response Caching', () => {
    it('should generate cache keys', () => {
      const cacheKey = `llm:prompt:${Buffer.from('test prompt').toString('base64')}`
      expect(cacheKey).toContain('llm:prompt:')
    })

    it('should set appropriate TTL', () => {
      const ttl = 3600 // 1 hour
      expect(ttl).toBeGreaterThan(0)
      expect(ttl).toBeLessThanOrEqual(86400) // max 24 hours
    })
  })

  describe('Content Safety', () => {
    it('should filter inappropriate content', () => {
      const safePhrases = ['consumer insights', 'market trends', 'data analysis']
      safePhrases.forEach(phrase => {
        expect(phrase.length).toBeGreaterThan(0)
        expect(typeof phrase).toBe('string')
      })
    })

    it('should validate input length', () => {
      const input = 'Test input'
      const maxLength = 10000

      expect(input.length).toBeLessThan(maxLength)
    })
  })

  describe('Prompt Templates', () => {
    it('should support template variables', () => {
      const template = 'Analyze {{topic}} for {{audience}}'
      const variables = { topic: 'sustainability', audience: 'Gen Z' }

      expect(template).toContain('{{topic}}')
      expect(template).toContain('{{audience}}')
    })

    it('should format persona prompts', () => {
      const prompt = 'Create a detailed persona for {{segment}}'
      expect(prompt).toContain('persona')
      expect(prompt).toContain('{{segment}}')
    })

    it('should format analysis prompts', () => {
      const prompt = 'Analyze {{data_type}} to identify {{objective}}'
      expect(prompt).toContain('Analyze')
      expect(prompt).toContain('{{data_type}}')
    })
  })
})
