/**
 * @prompt-id forge-v4.1:feature:onboarding-checklist:003
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getTemplates } from '@/lib/onboarding'
import { PlanTier } from '@prisma/client'

/**
 * GET /api/v1/onboarding/templates
 * Get available onboarding templates for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const targetUserType = searchParams.get('targetUserType') || undefined
    const targetPlanTier = searchParams.get('targetPlanTier') as PlanTier | undefined

    // Get active templates
    const templates = await getTemplates({
      targetUserType,
      targetPlanTier,
      isActive: true,
    })

    return NextResponse.json({
      templates: templates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        targetUserType: t.targetUserType,
        targetPlanTier: t.targetPlanTier,
        steps: t.steps,
        estimatedTime: t.estimatedTime,
        isDefault: t.isDefault,
      })),
    })
  } catch (error) {
    console.error('GET /api/v1/onboarding/templates error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
