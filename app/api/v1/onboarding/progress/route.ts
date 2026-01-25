/**
 * @prompt-id forge-v4.1:feature:onboarding-checklist:002
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import {
  getOrCreateProgress,
  completeStep,
  skipStep,
  autoDetectCompletedSteps,
} from '@/lib/onboarding'
import { z } from 'zod'

const updateProgressSchema = z.object({
  action: z.enum(['complete', 'skip']),
  stepId: z.string().min(1),
})

/**
 * GET /api/v1/onboarding/progress
 * Get the current user's onboarding progress
 */
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current organization
    const cookieStore = await cookies()
    const memberships = await prisma.organizationMember.findMany({
      where: { userId: session.user.id },
      include: { organization: true },
      orderBy: { joinedAt: 'asc' },
    })

    if (memberships.length === 0) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const currentOrgId =
      cookieStore.get('currentOrgId')?.value || memberships[0].organization.id

    // Get or create progress
    const progress = await getOrCreateProgress(session.user.id, currentOrgId)

    // Auto-detect completed steps
    const autoDetected = await autoDetectCompletedSteps(
      session.user.id,
      currentOrgId
    )

    // Merge auto-detected with manually completed
    const allCompletedSteps = [
      ...new Set([...progress.completedSteps, ...autoDetected]),
    ]

    // If there are newly detected steps, update the progress
    if (autoDetected.some((step) => !progress.completedSteps.includes(step))) {
      for (const stepId of autoDetected) {
        if (!progress.completedSteps.includes(stepId)) {
          await completeStep(progress.id, stepId)
        }
      }
      // Re-fetch to get updated progress
      const updatedProgress = await getOrCreateProgress(
        session.user.id,
        currentOrgId
      )
      return NextResponse.json({ progress: updatedProgress })
    }

    return NextResponse.json({
      progress: {
        ...progress,
        completedSteps: allCompletedSteps,
      },
    })
  } catch (error) {
    console.error('GET /api/v1/onboarding/progress error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/v1/onboarding/progress
 * Update onboarding progress (complete or skip a step)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = updateProgressSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { action, stepId } = validation.data

    // Get current organization
    const cookieStore = await cookies()
    const memberships = await prisma.organizationMember.findMany({
      where: { userId: session.user.id },
      include: { organization: true },
      orderBy: { joinedAt: 'asc' },
    })

    if (memberships.length === 0) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    const currentOrgId =
      cookieStore.get('currentOrgId')?.value || memberships[0].organization.id

    // Get progress (create if doesn't exist)
    const progress = await getOrCreateProgress(session.user.id, currentOrgId)

    // Update progress based on action
    let updatedProgress
    if (action === 'complete') {
      updatedProgress = await completeStep(progress.id, stepId)
    } else {
      updatedProgress = await skipStep(progress.id, stepId)
    }

    return NextResponse.json({ progress: updatedProgress })
  } catch (error) {
    console.error('PATCH /api/v1/onboarding/progress error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
