/**
 * LLM Execution Service
 *
 * Provides real LLM execution with support for multiple providers:
 * - Anthropic Claude
 * - OpenAI GPT
 * - GWI Spark MCP API
 *
 * Features:
 * - Retry logic with exponential backoff
 * - Request timeout handling
 * - Token usage tracking
 * - Error handling and fallback responses
 */

interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface LLMExecutionOptions {
  messages: LLMMessage[]
  model?: string
  temperature?: number
  maxTokens?: number
  timeout?: number
  provider?: 'anthropic' | 'openai' | 'gwi-spark'
}

interface LLMExecutionResult {
  response: string
  tokensUsed: number
  model: string
  provider: string
  metadata?: Record<string, unknown>
}

interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
}

const DEFAULT_TIMEOUT = 60000 // 60 seconds

/**
 * Execute retry logic with exponential backoff
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt < config.maxRetries) {
        const delay = Math.min(
          config.baseDelay * Math.pow(2, attempt),
          config.maxDelay
        )
        console.log(`Retry attempt ${attempt + 1} after ${delay}ms`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

/**
 * Execute LLM request with timeout
 */
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  let timeoutId: NodeJS.Timeout

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Request timeout after ${timeoutMs}ms`))
    }, timeoutMs)
  })

  try {
    const result = await Promise.race([promise, timeoutPromise])
    clearTimeout(timeoutId!)
    return result
  } catch (error) {
    clearTimeout(timeoutId!)
    throw error
  }
}

/**
 * Execute LLM request via Anthropic Claude API
 */
async function executeWithAnthropic(
  options: LLMExecutionOptions
): Promise<LLMExecutionResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  const model = options.model || 'claude-3-5-sonnet-20241022'
  const systemMessage = options.messages.find(m => m.role === 'system')
  const userMessages = options.messages.filter(m => m.role !== 'system')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      system: systemMessage?.content,
      messages: userMessages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature || 0.7,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Anthropic API error (${response.status}): ${errorText}`)
  }

  const data = await response.json()

  return {
    response: data.content[0].text,
    tokensUsed: data.usage.input_tokens + data.usage.output_tokens,
    model,
    provider: 'anthropic',
    metadata: {
      inputTokens: data.usage.input_tokens,
      outputTokens: data.usage.output_tokens,
      stopReason: data.stop_reason,
    },
  }
}

/**
 * Execute LLM request via OpenAI API
 */
async function executeWithOpenAI(
  options: LLMExecutionOptions
): Promise<LLMExecutionResult> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured')
  }

  const model = options.model || 'gpt-4-turbo-preview'

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: options.messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature || 0.7,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`)
  }

  const data = await response.json()

  return {
    response: data.choices[0].message.content,
    tokensUsed: data.usage.total_tokens,
    model,
    provider: 'openai',
    metadata: {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      finishReason: data.choices[0].finish_reason,
    },
  }
}

/**
 * Execute LLM request via GWI Spark MCP API
 */
async function executeWithGWISpark(
  options: LLMExecutionOptions
): Promise<LLMExecutionResult> {
  const apiUrl = process.env.GWI_API_BASE_URL
  const apiKey = process.env.GWI_SPARK_API_KEY

  if (!apiUrl || !apiKey) {
    throw new Error('GWI Spark API not configured')
  }

  const systemMessage = options.messages.find(m => m.role === 'system')
  const userMessage = options.messages.find(m => m.role === 'user')

  const response = await fetch(`${apiUrl}/spark-mcp/v1/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query: userMessage?.content || '',
      context: {
        systemPrompt: systemMessage?.content,
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 4096,
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`GWI Spark API error (${response.status}): ${errorText}`)
  }

  const data = await response.json()

  return {
    response: data.response || data.result,
    tokensUsed: data.tokensUsed || data.metadata?.tokensUsed || 0,
    model: data.model || 'gwi-spark',
    provider: 'gwi-spark',
    metadata: {
      citations: data.citations || [],
      confidence: data.confidence,
      ...data.metadata,
    },
  }
}

/**
 * Main LLM execution function with retry and timeout
 */
export async function executeLLM(
  options: LLMExecutionOptions
): Promise<LLMExecutionResult> {
  const timeout = options.timeout || DEFAULT_TIMEOUT
  const provider = options.provider || detectProvider()

  const executionFn = async () => {
    switch (provider) {
      case 'anthropic':
        return executeWithAnthropic(options)
      case 'openai':
        return executeWithOpenAI(options)
      case 'gwi-spark':
        return executeWithGWISpark(options)
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }
  }

  try {
    return await withTimeout(
      withRetry(executionFn),
      timeout
    )
  } catch (error) {
    console.error(`LLM execution failed with ${provider}:`, error)
    throw error
  }
}

/**
 * Detect which provider to use based on environment variables
 */
function detectProvider(): 'anthropic' | 'openai' | 'gwi-spark' {
  if (process.env.GWI_SPARK_API_KEY && process.env.GWI_API_BASE_URL) {
    return 'gwi-spark'
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return 'anthropic'
  }
  if (process.env.OPENAI_API_KEY) {
    return 'openai'
  }
  throw new Error('No LLM provider configured. Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or GWI_SPARK_API_KEY')
}

/**
 * Generate agent-specific system prompts
 */
export function getAgentSystemPrompt(agentType: string, customPrompt?: string): string {
  if (customPrompt) {
    return customPrompt
  }

  const prompts: Record<string, string> = {
    RESEARCH: `You are a research agent specialized in consumer insights and market research.
Your task is to analyze the provided data and generate comprehensive research findings with:
- Demographic profiles and audience segmentation
- Behavioral patterns and trends
- Market opportunities and gaps
- Actionable recommendations backed by data

Always structure your response in markdown format with clear sections and bullet points.`,

    ANALYSIS: `You are an analysis agent specialized in data interpretation and pattern recognition.
Your task is to process the provided data and generate detailed analytical reports with:
- Key metrics and statistical insights
- Trend analysis and correlations
- Anomaly detection and outliers
- Predictive insights and forecasts

Present findings with quantitative evidence and visual descriptions where applicable.`,

    REPORTING: `You are a reporting agent specialized in generating executive summaries and business reports.
Your task is to create clear, structured reports with:
- Executive summary highlighting key takeaways
- Detailed findings with supporting data
- Visual representations (describe charts/graphs)
- Strategic recommendations and next steps

Use professional business language appropriate for C-level executives.`,

    MONITORING: `You are a monitoring agent specialized in tracking metrics and detecting anomalies.
Your task is to analyze real-time data and generate:
- Status reports on tracked metrics
- Alert notifications for anomalies or threshold breaches
- Trend monitoring and pattern detection
- Performance comparisons vs. baseline

Focus on actionable insights that require immediate attention.`,

    CUSTOM: `You are a specialized AI agent. Process the provided input according to the task requirements and generate relevant, accurate outputs that directly address the user's needs.`,
  }

  return prompts[agentType] || prompts.CUSTOM
}

/**
 * Execute agent with memory context
 */
export async function executeAgentWithContext(params: {
  agentType: string
  agentName: string
  userInput: string
  systemPrompt?: string
  memoryContext?: Record<string, unknown>[]
  config?: Partial<LLMExecutionOptions>
}): Promise<LLMExecutionResult> {
  const messages: LLMMessage[] = [
    {
      role: 'system',
      content: getAgentSystemPrompt(params.agentType, params.systemPrompt),
    },
  ]

  // Add memory context if available
  if (params.memoryContext && params.memoryContext.length > 0) {
    const contextSummary = params.memoryContext
      .map((item: Record<string, unknown>) => `- ${item.key}: ${JSON.stringify(item.value)}`)
      .join('\n')

    messages.push({
      role: 'system',
      content: `Relevant context from previous interactions:\n${contextSummary}`,
    })
  }

  messages.push({
    role: 'user',
    content: params.userInput,
  })

  return executeLLM({
    ...params.config,
    messages,
  })
}
