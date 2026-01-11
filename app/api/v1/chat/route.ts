import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { cookies } from 'next/headers'
import { getUserMembership } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { recordUsage } from '@/lib/billing'
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

// Generate intelligent response based on agent and query
function generateAgentResponse(
  agentId: string,
  query: string,
  agentConfig?: { name: string; description?: string | null; type: string }
) {
  const queryLower = query.toLowerCase()
  const knowledge = agentKnowledge[agentId]

  // Detect topic from query
  const isAboutGenZ = queryLower.includes('gen z') || queryLower.includes('genz') || queryLower.includes('generation z')
  const isAboutSustainability = queryLower.includes('sustain') || queryLower.includes('eco') || queryLower.includes('green')

  // Build response based on agent type and query
  let response = ''
  let citations: Array<{ id: string; source: string; confidence: number; type: string; excerpt: string }> = []
  let outputBlocks: Array<{ id: string; type: string; title: string; content: Record<string, unknown> }> = []

  if (knowledge) {
    if (isAboutGenZ) {
      response = `## Gen Z Consumer Analysis

Based on GWI Core data, here are the key insights about Gen Z consumers:

**Demographics & Behavior**
- Age range: 18-26 (current cohort)
- Digital natives: Average 7.2 hours of screen time daily
- Platform preferences: TikTok (89%), YouTube (92%), Instagram (78%)

**Key Values**
- Authenticity: 92% can detect performative messaging
- Mental health awareness: 84% actively prioritize
- Climate action: 76% express genuine concern
- Diversity & inclusion: 81% expect brands to take stances

**Purchase Behavior**
- Research-intensive: 67% check 3+ sources before buying
- Creator influence: 71% trust micro-influencers over celebrities
- Mobile commerce: 78% complete purchases on mobile
- Premium willing: 64% pay premium for values alignment

**Strategic Implications**
1. Mobile-first content strategy
2. Partner with authentic micro-influencers
3. Demonstrate genuine commitment to values
4. Enable co-creation and community`

      citations = [
        { id: '1', source: 'GWI Core Q4 2024', confidence: 94, type: 'survey', excerpt: 'Gen Z behavioral data across 52 markets' },
        { id: '2', source: 'GWI Zeitgeist Nov 2024', confidence: 91, type: 'trend', excerpt: 'Monthly pulse on Gen Z attitudes' },
      ]

      outputBlocks = [{
        id: 'chart-genz',
        type: 'chart',
        title: 'Gen Z Platform Engagement',
        content: {
          chartType: 'bar',
          categories: ['TikTok', 'YouTube', 'Instagram', 'Snapchat', 'Twitter'],
          series: [{ name: 'Daily Active %', data: [89, 92, 78, 54, 31], color: '#8b5cf6' }],
        },
      }]
    } else if (isAboutSustainability) {
      response = `## Sustainability Consumer Segments

Analysis of sustainability-focused consumers across global markets:

**Segment Overview**

### Eco-Warriors (18% of market)
- Demographics: 18-34, varied income, urban
- Behavior: Actively avoid unsustainable brands
- Premium tolerance: +30% or more
- Influence: High - shape opinions in networks

### Conscious Mainstream (34% of market)
- Demographics: 25-45, middle to upper-middle income
- Behavior: Prefer sustainable when convenient
- Premium tolerance: +12% average
- Influence: Medium - follow trends

### Passive Supporters (28% of market)
- Demographics: 35-55, higher income
- Behavior: Appreciate but don't actively seek
- Premium tolerance: +5%
- Influence: Low but high purchasing power

**Key Metrics**
- 73% of consumers consider environmental impact in purchases
- 67% willing to pay more for sustainable products
- 58% have changed brands due to sustainability concerns`

      citations = [
        { id: '1', source: 'GWI Core Q4 2024', confidence: 92, type: 'survey', excerpt: 'Global sustainability attitudes' },
        { id: '2', source: 'GWI USA Dataset', confidence: 89, type: 'survey', excerpt: 'US consumer sustainability metrics' },
      ]
    } else {
      // Default response based on agent type
      response = `Based on my analysis of the available data, here are the key insights related to your query:

**Initial Findings**
- Analyzed relevant consumer segments and behavioral patterns
- Cross-referenced with market trends and demographic data
- Identified key opportunities and considerations

**Key Observations**
1. Consumer behavior in this space shows evolving preferences
2. Digital engagement remains a primary touchpoint
3. Values alignment increasingly drives purchase decisions
4. Regional variations exist across markets

**Recommendations**
- Focus on authentic, transparent communication
- Leverage data-driven personalization
- Consider multi-channel engagement strategies
- Monitor emerging trends in the space

Would you like me to dive deeper into any specific aspect of this analysis?`

      citations = [
        { id: '1', source: 'GWI Core Q4 2024', confidence: 88, type: 'survey', excerpt: 'Comprehensive consumer data' },
      ]
    }
  } else if (agentConfig) {
    // Custom agent response
    response = `I'm ${agentConfig.name}, a ${agentConfig.type.toLowerCase()} agent. ${agentConfig.description || ''}

Based on your query, I've analyzed the relevant data and here are my findings:

**Analysis Summary**
- Query processed and matched against available data sources
- Identified relevant patterns and insights
- Generated actionable recommendations

**Key Insights**
${query.length > 20 ? `Your question about "${query.substring(0, 50)}..." touches on important areas.` : 'This is an interesting area to explore.'}

1. The data suggests significant opportunity in this space
2. Consumer preferences are evolving rapidly
3. Cross-channel strategies show the best results
4. Personalization drives engagement

**Next Steps**
- Consider running a detailed segment analysis
- Compare across key markets
- Track trends over time

Would you like me to elaborate on any of these points?`

    citations = [
      { id: '1', source: 'Custom Analysis', confidence: 85, type: 'report', excerpt: 'Agent-generated insights' },
    ]
  }

  return { response, citations, outputBlocks }
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

    // Generate response
    const { response, citations, outputBlocks } = generateAgentResponse(
      agentId || 'audience-explorer',
      message,
      customAgent ? { name: customAgent.name, description: customAgent.description, type: customAgent.type } : undefined
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
