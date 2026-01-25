/**
 * @prompt-id forge-v4.1:feature:onboarding-checklist:005
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateSuperAdminSession } from '@/lib/super-admin'
import { cookies } from 'next/headers'
import {
  getTemplateById,
  updateTemplate,
  deleteTemplate,
} from '@/lib/onboarding'
import { z } from 'zod'
import { PlanTier } from '@prisma/client'

const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  targetUserType: z.string().optional(),
  targetPlanTier: z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE']).optional().nullable(),
  steps: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        description: z.string(),
        action: z.string(),
        estimatedTime: z.number().min(0),
        order: z.number().min(0),
      })
    )
    .optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  estimatedTime: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
})

/**
 * GET /api/admin/onboarding/templates/[id]
 * Get a specific onboarding template (admin only)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const template = await getTemplateById(id)

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error('GET /api/admin/onboarding/templates/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/onboarding/templates/[id]
 * Update an onboarding template (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()
    const validation = updateTemplateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.errors },
        { status: 400 }
      )
    }

    // Check if template exists
    const existing = await getTemplateById(id)
    if (!existing) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    const data = validation.data
    const template = await updateTemplate(id, {
      name: data.name,
      description: data.description,
      targetUserType: data.targetUserType,
      targetPlanTier: data.targetPlanTier as PlanTier | undefined,
      steps: data.steps,
      isActive: data.isActive,
      isDefault: data.isDefault,
      estimatedTime: data.estimatedTime,
      metadata: data.metadata,
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error('PATCH /api/admin/onboarding/templates/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/onboarding/templates/[id]
 * Delete an onboarding template (admin only)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Check if template exists
    const existing = await getTemplateById(id)
    if (!existing) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    try {
      await deleteTemplate(id)
      return NextResponse.json({ success: true })
    } catch (err) {
      if (err instanceof Error && err.message.includes('default')) {
        return NextResponse.json(
          { error: 'Cannot delete the default onboarding template' },
          { status: 400 }
        )
      }
      throw err
    }
  } catch (error) {
    console.error('DELETE /api/admin/onboarding/templates/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
