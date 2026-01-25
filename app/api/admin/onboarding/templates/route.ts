/**
 * @prompt-id forge-v4.1:feature:onboarding-checklist:004
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateSuperAdminSession } from '@/lib/super-admin'
import { cookies } from 'next/headers'
import { getTemplates, createTemplate, getCompletionRates } from '@/lib/onboarding'
import { z } from 'zod'
import { PlanTier } from '@prisma/client'

const createTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  targetUserType: z.string().optional(),
  targetPlanTier: z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE']).optional(),
  steps: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      description: z.string(),
      action: z.string(),
      estimatedTime: z.number().min(0),
      order: z.number().min(0),
    })
  ),
  isDefault: z.boolean().optional(),
  estimatedTime: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
})

/**
 * GET /api/admin/onboarding/templates
 * List all onboarding templates (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('adminToken')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeRates = searchParams.get('includeRates') === 'true'

    // Get all templates (not just active ones for admin)
    const templates = await getTemplates()

    // Get completion rates if requested
    let completionRates: Awaited<ReturnType<typeof getCompletionRates>> = []
    if (includeRates) {
      completionRates = await getCompletionRates()
    }

    return NextResponse.json({
      templates: templates.map((t) => {
        const rate = completionRates.find((r) => r.templateId === t.id)
        return {
          ...t,
          steps: t.steps,
          metadata: t.metadata,
          completionRate: rate?.rate || 0,
          totalUsers: rate?.total || 0,
          completedUsers: rate?.completed || 0,
        }
      }),
      ...(includeRates && { completionRates }),
    })
  } catch (error) {
    console.error('GET /api/admin/onboarding/templates error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/onboarding/templates
 * Create a new onboarding template (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('adminToken')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await validateSuperAdminSession(token)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = createTemplateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data
    const template = await createTemplate({
      name: data.name,
      description: data.description,
      targetUserType: data.targetUserType,
      targetPlanTier: data.targetPlanTier as PlanTier | undefined,
      steps: data.steps,
      isDefault: data.isDefault,
      estimatedTime: data.estimatedTime,
      metadata: data.metadata,
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error('POST /api/admin/onboarding/templates error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
