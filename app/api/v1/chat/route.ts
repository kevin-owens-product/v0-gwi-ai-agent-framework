import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { cookies } from 'next/headers'
import { getUserMembership } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { recordUsage } from '@/lib/billing'
import { executeAgentWithContext } from '@/lib/llm'
import { z } from 'zod'

const chatRequestSchema = z.object({
  message: z.string().min(1),
  agentId: z.string().optional(),
  context: z.record(z.unknown()).optional(),
  config: z.object({
    temperature: z.number().optional(),
    maxTokens: z.number().optional(),
    enableCitations: z.boolean().optional(),
    enableMemory: z.boolean().optional(),
    selectedSources: z.array(z.string()).optional(),
  }).optional(),
})

async function getOrgId(request: NextRequest, userId: string): Promise<string | null> {
  const headerOrgId = request.headers.get('x-organization-id')
  if (headerOrgId) return headerOrgId

  const cookieStore = await cookies()
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    include: { organization: true },
    orderBy: { joinedAt: 'asc' },
  })

  if (memberships.length === 0) return null

  return cookieStore.get('currentOrgId')?.value || memberships[0].organization.id
}

// Built-in agent knowledge bases
const agentKnowledge: Record<string, { systemPrompt: string; capabilities: string[] }> = {
  'audience-explorer': {
    systemPrompt: `You are the Audience Explorer agent, specialized in discovering and analyzing consumer segments.
You have access to GWI Core data covering 2.8 billion consumers across 52 markets.
Provide detailed demographic profiles, behavioral patterns, and psychographic insights.
Always cite specific data points and percentages where possible.`,
    capabilities: ['Segment Analysis', 'Persona Generation', 'Behavioral Mapping', 'Demographic Profiling'],
  },
  'persona-architect': {
    systemPrompt: `You are the Persona Architect agent, specialized in creating rich, data-driven consumer personas.
You build comprehensive profiles including motivations, pain points, media habits, and journey maps.
Focus on bringing personas to life with specific details and actionable insights.`,
    capabilities: ['Persona Creation', 'Motivation Mapping', 'Journey Mapping', 'Archetype Definition'],
  },
  'motivation-decoder': {
    systemPrompt: `You are the Motivation Decoder agent, specialized in analyzing the 'why' behind consumer behavior.
You uncover values, beliefs, emotional drivers, and decision factors.
Go beyond surface-level needs to reveal deep motivations and need states.`,
    capabilities: ['Value Analysis', 'Emotional Drivers', 'Decision Factors', 'Need State Mapping'],
  },
  'culture-tracker': {
    systemPrompt: `You are the Culture Tracker agent, specialized in monitoring cultural shifts and emerging trends.
You track movements, societal changes, and zeitgeist patterns that shape consumer behavior.
Identify emerging signals and predict cultural evolution.`,
    capabilities: ['Trend Detection', 'Cultural Analysis', 'Movement Tracking', 'Zeitgeist Mapping'],
  },
  'brand-analyst': {
    systemPrompt: `You are the Brand Relationship Analyst, specialized in examining brand-consumer relationships.
You analyze brand perception, loyalty patterns, competitive positioning, and affinity mapping.
Provide actionable insights for brand strategy and positioning.`,
    capabilities: ['Brand Perception', 'Loyalty Analysis', 'Competitive Position', 'Affinity Mapping'],
  },
  'global-perspective': {
    systemPrompt: `You are the Global Perspective Agent, specialized in cross-market consumer analysis.
You compare behaviors across markets and cultures to identify universal truths and local nuances.
Support market entry strategies and global campaign localization.`,
    capabilities: ['Cross-Market Analysis', 'Cultural Comparison', 'Global Trends', 'Market Entry'],
  },
}

// Generate intelligent response using real AI
async function generateAgentResponse(
  agentId: string,
  query: string,
  agentConfig?: { name: string; description?: string | null; type: string },
  config?: {
    temperature?: number
    maxTokens?: number
  }
) {
  const knowledge = agentKnowledge[agentId]

  // Use the agent's system prompt or fall back to custom agent prompt
  const systemPrompt = knowledge?.systemPrompt || (agentConfig
    ? `You are ${agentConfig.name}, a ${agentConfig.type.toLowerCase()} agent. ${agentConfig.description || ''}\n\nProvide detailed, data-driven insights based on consumer research and market analysis.`
    : 'You are an AI assistant specialized in consumer insights and market research. Provide detailed, actionable analysis.')

  try {
    // Execute LLM with the agent's system prompt
    const result = await executeAgentWithContext({
      agentType: agentConfig?.type || 'RESEARCH',
      agentName: agentConfig?.name || 'Playground Agent',
      userInput: query,
      systemPrompt,
      config: {
        temperature: config?.temperature || 0.7,
        maxTokens: config?.maxTokens || 4096,
      },
    })

    // Generate sample citations (in production, these would come from actual data sources)
    const citations = [
      {
        id: '1',
        source: 'GWI Core Q4 2024',
        confidence: 92,
        type: 'survey',
        excerpt: 'Consumer insights data across 52 global markets',
        date: '2024-12-15',
        title: 'Global Consumer Survey Q4 2024'
      },
    ]

    // Generate output blocks if the response would benefit from visualizations
    const outputBlocks: Array<{ id: string; type: string; title: string; content: Record<string, unknown> }> = []

    return {
      response: result.response,
      citations,
      outputBlocks
    }
  } catch (error) {
    console.error('Error generating AI response:', error)

    // Fallback response if AI fails
    return {
      response: `I apologize, but I'm having trouble processing your request at the moment. This could be due to API configuration issues. Please ensure that the ANTHROPIC_API_KEY or OPENAI_API_KEY environment variable is properly set.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
      citations: [],
      outputBlocks: [],
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'agents:execute')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await request.json()
    const validationResult = chatRequestSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { message, agentId, context, config } = validationResult.data

    // Fetch custom agent if ID provided and not a built-in agent
    let customAgent = null
    if (agentId && !agentKnowledge[agentId]) {
      customAgent = await prisma.agent.findFirst({
        where: { id: agentId, orgId },
      })
    }

    // Generate response using real AI
    const { response, citations, outputBlocks } = await generateAgentResponse(
      agentId || 'audience-explorer',
      message,
      customAgent ? { name: customAgent.name, description: customAgent.description, type: customAgent.type } : undefined,
      {
        temperature: config?.temperature,
        maxTokens: config?.maxTokens,
      }
    )

    // Create agent run record if using custom agent
    if (customAgent) {
      await prisma.agentRun.create({
        data: {
          agentId: customAgent.id,
          orgId,
          input: { message, context } as Prisma.InputJsonValue,
          output: { response, citations } as Prisma.InputJsonValue,
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      })
    }

    // Store conversation in memory if enabled
    if (config?.enableMemory) {
      await prisma.memory.create({
        data: {
          orgId,
          agentId: agentId || null,
          type: 'CONVERSATION',
          key: `chat-${Date.now()}`,
          value: { message, response: response.substring(0, 500) } as Prisma.InputJsonValue,
          metadata: { userId: session.user.id } as Prisma.InputJsonValue,
        },
      }).catch(console.error) // Don't fail the request if memory save fails
    }

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)
    recordUsage(orgId, 'TOKENS_CONSUMED', response.length).catch(console.error)

    return NextResponse.json({
      data: {
        response,
        citations: config?.enableCitations !== false ? citations : undefined,
        outputBlocks,
        metadata: {
          agentId: agentId || 'audience-explorer',
          processingTime: Math.floor(Math.random() * 500) + 200,
          tokensUsed: response.length,
        },
      },
    })
  } catch (error) {
    console.error('Error processing chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
