import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { validateSuperAdminSession } from "@/lib/super-admin"
import { hasGWIPermission } from "@/lib/gwi-permissions"

/**
 * POST /api/gwi/llm/test
 * Test a prompt with an LLM configuration
 *
 * Request body:
 * - configurationId: string (required) - The LLM configuration to use
 * - prompt: string (required) - The prompt to send
 * - parameters: object (optional) - Override parameters (temperature, max_tokens, etc.)
 *
 * Response:
 * - response: string - The generated response
 * - tokensUsed: { prompt: number, completion: number, total: number }
 * - latencyMs: number - Time taken in milliseconds
 * - cost: number - Estimated cost
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("gwiToken")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!hasGWIPermission(session.admin.role, "llm:write")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { configurationId, prompt, parameters } = body

    // Validate required fields
    if (!configurationId) {
      return NextResponse.json(
        { error: "Configuration ID is required" },
        { status: 400 }
      )
    }

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    // Fetch the LLM configuration
    const configuration = await prisma.lLMConfiguration.findUnique({
      where: { id: configurationId },
    })

    if (!configuration) {
      return NextResponse.json(
        { error: "LLM configuration not found" },
        { status: 404 }
      )
    }

    if (!configuration.isActive) {
      return NextResponse.json(
        { error: "LLM configuration is not active" },
        { status: 400 }
      )
    }

    // Merge default params with provided parameters
    const defaultParams = configuration.defaultParams as Record<string, unknown> || {}
    const mergedParams = {
      ...defaultParams,
      ...parameters,
    }

    // Simulate LLM call for testing
    // In production, this would call the actual LLM provider
    const llmResponse = await simulateLLMCall(
      configuration.provider,
      configuration.model,
      prompt,
      mergedParams
    )

    const latencyMs = Date.now() - startTime

    // Calculate cost (simplified - in production use actual pricing)
    const costPerInputToken = getCostPerToken(configuration.provider, configuration.model, "input")
    const costPerOutputToken = getCostPerToken(configuration.provider, configuration.model, "output")
    const totalCost =
      llmResponse.promptTokens * costPerInputToken +
      llmResponse.completionTokens * costPerOutputToken

    // Record usage
    await prisma.lLMUsageRecord.create({
      data: {
        configurationId: configuration.id,
        promptTokens: llmResponse.promptTokens,
        completionTokens: llmResponse.completionTokens,
        totalCost: totalCost,
        latencyMs: latencyMs,
        metadata: {
          testRequest: true,
          adminId: session.admin.id,
          parameters: mergedParams,
        },
      },
    })

    // Log the test action
    await prisma.gWIAuditLog.create({
      data: {
        adminId: session.admin.id,
        action: "TEST_LLM_CONFIG",
        resourceType: "llm_configuration",
        resourceId: configuration.id,
        newState: {
          provider: configuration.provider,
          model: configuration.model,
          promptLength: prompt.length,
          tokensUsed: llmResponse.promptTokens + llmResponse.completionTokens,
          latencyMs,
        },
      },
    })

    return NextResponse.json({
      response: llmResponse.response,
      tokensUsed: {
        prompt: llmResponse.promptTokens,
        completion: llmResponse.completionTokens,
        total: llmResponse.promptTokens + llmResponse.completionTokens,
      },
      latencyMs,
      cost: totalCost,
      configuration: {
        id: configuration.id,
        name: configuration.name,
        provider: configuration.provider,
        model: configuration.model,
      },
    })
  } catch (error) {
    console.error("Failed to test LLM configuration:", error)
    return NextResponse.json(
      { error: "Failed to test LLM configuration" },
      { status: 500 }
    )
  }
}

/**
 * Simulates an LLM call for testing purposes
 * In production, this would integrate with actual LLM providers (OpenAI, Anthropic, etc.)
 */
async function simulateLLMCall(
  provider: string,
  model: string,
  prompt: string,
  params: Record<string, unknown>
): Promise<{
  response: string
  promptTokens: number
  completionTokens: number
}> {
  // Estimate tokens (rough approximation: 1 token ~= 4 characters)
  const promptTokens = Math.ceil(prompt.length / 4)

  // Simulate processing delay based on model
  const baseDelay = provider === "anthropic" ? 500 : 300
  const modelDelay = model.includes("gpt-4") || model.includes("claude-3") ? 200 : 100
  await new Promise((resolve) => setTimeout(resolve, baseDelay + modelDelay))

  // Generate a simulated response
  const maxTokens = (params.max_tokens as number) || 256
  const temperature = (params.temperature as number) || 0.7

  const simulatedResponse = generateSimulatedResponse(prompt, provider, model, temperature)
  const completionTokens = Math.min(Math.ceil(simulatedResponse.length / 4), maxTokens)

  return {
    response: simulatedResponse,
    promptTokens,
    completionTokens,
  }
}

/**
 * Generates a simulated response for testing
 */
function generateSimulatedResponse(
  prompt: string,
  provider: string,
  model: string,
  temperature: number
): string {
  const responses = [
    `[Test Response from ${provider}/${model}] Based on your prompt, here is a simulated response. This is a test environment and actual LLM integration would return real model outputs.`,
    `[Simulated ${model} Output] Your query has been processed in test mode. Temperature: ${temperature}. In production, this would connect to the actual ${provider} API.`,
    `[Test Mode Active] Provider: ${provider}, Model: ${model}. Your prompt contained ${prompt.length} characters. This simulated response demonstrates the API structure.`,
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}

/**
 * Get cost per token for different providers/models (simplified pricing)
 */
function getCostPerToken(provider: string, model: string, type: "input" | "output"): number {
  // Simplified pricing table (per 1000 tokens, converted to per token)
  const pricing: Record<string, Record<string, { input: number; output: number }>> = {
    openai: {
      "gpt-4o": { input: 0.000005, output: 0.000015 },
      "gpt-4o-mini": { input: 0.00000015, output: 0.0000006 },
      "gpt-4-turbo": { input: 0.00001, output: 0.00003 },
      "gpt-3.5-turbo": { input: 0.0000005, output: 0.0000015 },
    },
    anthropic: {
      "claude-3-5-sonnet-latest": { input: 0.000003, output: 0.000015 },
      "claude-3-opus": { input: 0.000015, output: 0.000075 },
      "claude-3-sonnet": { input: 0.000003, output: 0.000015 },
      "claude-3-haiku": { input: 0.00000025, output: 0.00000125 },
    },
    google: {
      "gemini-pro": { input: 0.000001, output: 0.000002 },
      "gemini-1.5-pro": { input: 0.00000125, output: 0.000005 },
    },
  }

  const providerPricing = pricing[provider.toLowerCase()]
  if (!providerPricing) {
    return type === "input" ? 0.000001 : 0.000002 // Default pricing
  }

  const modelPricing = providerPricing[model] || providerPricing[Object.keys(providerPricing)[0]]
  return modelPricing[type]
}
