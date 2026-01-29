import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUserMembership, getValidatedOrgId } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'

/**
 * POST /api/v1/audiences/parse
 * AI-powered audience parsing from natural language
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'audiences:write')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await request.json()
    const { query, context } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    // TODO: Integrate with actual LLM service (OpenAI, Anthropic, etc.)
    // For now, we'll use a rule-based parser as a fallback
    const parsedCriteria = await parseNaturalLanguageQuery(query, context)

    return NextResponse.json({
      success: true,
      criteria: parsedCriteria.criteria,
      confidence: parsedCriteria.confidence,
      suggestions: parsedCriteria.suggestions,
      estimatedSize: parsedCriteria.estimatedSize,
    })
  } catch (error) {
    console.error('Error parsing audience query:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Parse natural language query into structured audience criteria
 * This is a placeholder implementation - should be replaced with actual LLM integration
 */
async function parseNaturalLanguageQuery(
  query: string,
  context?: { markets?: string[]; existingCriteria?: unknown }
): Promise<{
  criteria: Array<{
    dimension: string
    operator: string
    value: string | number | [number, number]
    confidence: number
  }>
  confidence: number
  suggestions: Array<{ dimension: string; operator: string; value: string; reason: string }>
  estimatedSize: number
}> {
  const lowerQuery = query.toLowerCase()
  const criteria: Array<{
    dimension: string
    operator: string
    value: string | number | [number, number]
    confidence: number
  }> = []
  const suggestions: Array<{ dimension: string; operator: string; value: string; reason: string }> = []

  // Age detection patterns
  const agePatterns = [
    { pattern: /gen\s*z|generation\s*z|gen-z/i, age: [18, 24], confidence: 0.9 },
    { pattern: /millennial/i, age: [25, 40], confidence: 0.9 },
    { pattern: /gen\s*x|generation\s*x/i, age: [41, 56], confidence: 0.9 },
    { pattern: /boomer/i, age: [57, 75], confidence: 0.9 },
    { pattern: /(\d+)\s*-\s*(\d+)\s*(?:years?|yrs?)/i, extract: (m: RegExpMatchArray) => [parseInt(m[1]), parseInt(m[2])], confidence: 0.95 },
    { pattern: /(\d+)\s*(?:years?|yrs?)\s*(?:old|of\s*age)/i, extract: (m: RegExpMatchArray) => {
      const age = parseInt(m[1])
      return [Math.max(0, age - 2), age + 2]
    }, confidence: 0.85 },
  ]

  for (const pattern of agePatterns) {
    const match = lowerQuery.match(pattern.pattern)
    if (match) {
      const ageRange = pattern.extract ? pattern.extract(match) : pattern.age
      criteria.push({
        dimension: 'age',
        operator: 'between',
        value: ageRange as [number, number],
        confidence: pattern.confidence,
      })
      break
    }
  }

  // Income detection
  if (lowerQuery.match(/high\s*income|affluent|wealthy|high\s*earner/i)) {
    criteria.push({
      dimension: 'income',
      operator: 'greater_than',
      value: 100000,
      confidence: 0.8,
    })
  } else if (lowerQuery.match(/low\s*income|budget|price-sensitive/i)) {
    criteria.push({
      dimension: 'income',
      operator: 'less_than',
      value: 50000,
      confidence: 0.8,
    })
  }

  // Location detection
  if (lowerQuery.match(/urban|city|metropolitan/i)) {
    criteria.push({
      dimension: 'location',
      operator: 'equals',
      value: 'urban',
      confidence: 0.85,
    })
  } else if (lowerQuery.match(/rural|countryside/i)) {
    criteria.push({
      dimension: 'location',
      operator: 'equals',
      value: 'rural',
      confidence: 0.85,
    })
  }

  // Interests detection
  const interestKeywords = [
    { keywords: ['tech', 'technology', 'gadget', 'digital'], value: 'technology', confidence: 0.9 },
    { keywords: ['sustainab', 'eco', 'green', 'environment'], value: 'sustainability', confidence: 0.9 },
    { keywords: ['fashion', 'style', 'clothing'], value: 'fashion', confidence: 0.85 },
    { keywords: ['gaming', 'gamer', 'video game'], value: 'gaming', confidence: 0.9 },
    { keywords: ['fitness', 'gym', 'workout', 'exercise'], value: 'fitness', confidence: 0.85 },
    { keywords: ['travel', 'tourism', 'vacation'], value: 'travel', confidence: 0.85 },
  ]

  for (const interest of interestKeywords) {
    if (interest.keywords.some(keyword => lowerQuery.includes(keyword))) {
      criteria.push({
        dimension: 'interests',
        operator: 'contains',
        value: interest.value,
        confidence: interest.confidence,
      })
    }
  }

  // Behavior detection
  if (lowerQuery.match(/online\s*shop|e-commerce|digital\s*purchase/i)) {
    criteria.push({
      dimension: 'shopping_behavior',
      operator: 'contains',
      value: 'online_shopping',
      confidence: 0.85,
    })
  }

  if (lowerQuery.match(/early\s*adopter|innovator/i)) {
    criteria.push({
      dimension: 'adoption_behavior',
      operator: 'equals',
      value: 'early_adopter',
      confidence: 0.8,
    })
  }

  // Generate suggestions based on detected criteria
  if (criteria.length > 0 && criteria.length < 3) {
    suggestions.push({
      dimension: 'values',
      operator: 'contains',
      value: 'quality',
      reason: 'Consider adding value-based filters for deeper segmentation',
    })
  }

  // Calculate overall confidence
  const avgConfidence = criteria.length > 0
    ? criteria.reduce((sum, c) => sum + c.confidence, 0) / criteria.length
    : 0.5

  // Estimate audience size (placeholder - should use actual data)
  const baseSize = 1000000
  const reductionFactor = Math.pow(0.7, criteria.length)
  const estimatedSize = Math.floor(baseSize * reductionFactor * (0.8 + Math.random() * 0.4))

  return {
    criteria,
    confidence: avgConfidence,
    suggestions,
    estimatedSize,
  }
}
