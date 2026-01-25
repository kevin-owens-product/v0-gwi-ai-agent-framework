/**
 * @prompt-id forge-v4.1:feature:onboarding-checklist:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { prisma } from './db'
import { OnboardingStatus, PlanTier, Prisma } from '@prisma/client'

// Default onboarding steps for new users
export const DEFAULT_ONBOARDING_STEPS = [
  {
    id: 'complete-profile',
    title: 'Complete your profile',
    description: 'Add your name and profile picture',
    action: '/dashboard/settings/profile',
    estimatedTime: 2,
    order: 1,
  },
  {
    id: 'create-first-agent',
    title: 'Create your first agent',
    description: 'Set up an AI agent to automate your research',
    action: '/dashboard/agents/new',
    estimatedTime: 5,
    order: 2,
  },
  {
    id: 'run-first-analysis',
    title: 'Run your first analysis',
    description: 'Generate insights using GWI data',
    action: '/dashboard/crosstabs/new',
    estimatedTime: 10,
    order: 3,
  },
  {
    id: 'create-dashboard',
    title: 'Create a dashboard',
    description: 'Build a custom dashboard to track your metrics',
    action: '/dashboard/dashboards/new',
    estimatedTime: 5,
    order: 4,
  },
  {
    id: 'invite-team-member',
    title: 'Invite a team member',
    description: 'Collaborate with your team on insights',
    action: '/dashboard/settings/team',
    estimatedTime: 2,
    order: 5,
  },
  {
    id: 'setup-notifications',
    title: 'Set up notifications',
    description: 'Configure alerts for important updates',
    action: '/dashboard/settings/notifications',
    estimatedTime: 3,
    order: 6,
  },
]

export interface OnboardingStep {
  id: string
  title: string
  description: string
  action: string
  estimatedTime: number
  order: number
}

export interface OnboardingProgressData {
  id: string
  userId: string
  orgId: string
  templateId: string | null
  currentStep: number
  totalSteps: number
  completedSteps: string[]
  skippedSteps: string[]
  status: OnboardingStatus
  startedAt: Date
  completedAt: Date | null
  lastActivityAt: Date
  metadata: Record<string, unknown>
  steps: OnboardingStep[]
}

/**
 * Get or create onboarding progress for a user in an organization.
 * If no template is specified, uses the default onboarding template.
 */
export async function getOrCreateProgress(
  userId: string,
  orgId: string
): Promise<OnboardingProgressData> {
  // Check for existing progress
  const existingProgress = await prisma.onboardingProgress.findUnique({
    where: {
      userId_orgId: { userId, orgId },
    },
  })

  if (existingProgress) {
    // Get template steps if template exists
    const steps = await getTemplateSteps(existingProgress.templateId)
    return {
      ...existingProgress,
      completedSteps: existingProgress.completedSteps as string[],
      skippedSteps: existingProgress.skippedSteps as string[],
      metadata: existingProgress.metadata as Record<string, unknown>,
      steps,
    }
  }

  // Find default template or use default steps
  const defaultTemplate = await prisma.onboardingTemplate.findFirst({
    where: {
      isDefault: true,
      isActive: true,
    },
  })

  const steps = defaultTemplate
    ? (defaultTemplate.steps as unknown as OnboardingStep[])
    : DEFAULT_ONBOARDING_STEPS

  // Create new progress
  const progress = await prisma.onboardingProgress.create({
    data: {
      userId,
      orgId,
      templateId: defaultTemplate?.id || null,
      currentStep: 0,
      totalSteps: steps.length,
      completedSteps: [],
      skippedSteps: [],
      status: 'NOT_STARTED',
    },
  })

  return {
    ...progress,
    completedSteps: [],
    skippedSteps: [],
    metadata: {},
    steps,
  }
}

/**
 * Mark a step as completed
 */
export async function completeStep(
  progressId: string,
  stepId: string
): Promise<OnboardingProgressData> {
  const progress = await prisma.onboardingProgress.findUnique({
    where: { id: progressId },
  })

  if (!progress) {
    throw new Error('Onboarding progress not found')
  }

  const completedSteps = progress.completedSteps as string[]
  const skippedSteps = progress.skippedSteps as string[]
  const steps = await getTemplateSteps(progress.templateId)

  // Don't add if already completed
  if (completedSteps.includes(stepId)) {
    return {
      ...progress,
      completedSteps,
      skippedSteps,
      metadata: progress.metadata as Record<string, unknown>,
      steps,
    }
  }

  const newCompletedSteps = [...completedSteps, stepId]

  // Remove from skipped if it was previously skipped
  const newSkippedSteps = skippedSteps.filter((id) => id !== stepId)

  // Determine new status
  const totalNonSkipped = steps.length - newSkippedSteps.length
  const isCompleted = newCompletedSteps.length >= totalNonSkipped
  const newStatus = isCompleted
    ? 'COMPLETED'
    : newCompletedSteps.length > 0
      ? 'IN_PROGRESS'
      : progress.status

  // Find current step index
  const currentStepIndex = Math.max(
    ...steps.map((step, index) =>
      newCompletedSteps.includes(step.id) || newSkippedSteps.includes(step.id)
        ? index + 1
        : 0
    )
  )

  const updated = await prisma.onboardingProgress.update({
    where: { id: progressId },
    data: {
      completedSteps: newCompletedSteps,
      skippedSteps: newSkippedSteps,
      currentStep: currentStepIndex,
      status: newStatus as OnboardingStatus,
      lastActivityAt: new Date(),
      completedAt: isCompleted ? new Date() : null,
    },
  })

  return {
    ...updated,
    completedSteps: newCompletedSteps,
    skippedSteps: newSkippedSteps,
    metadata: updated.metadata as Record<string, unknown>,
    steps,
  }
}

/**
 * Skip a step
 */
export async function skipStep(
  progressId: string,
  stepId: string
): Promise<OnboardingProgressData> {
  const progress = await prisma.onboardingProgress.findUnique({
    where: { id: progressId },
  })

  if (!progress) {
    throw new Error('Onboarding progress not found')
  }

  const completedSteps = progress.completedSteps as string[]
  const skippedSteps = progress.skippedSteps as string[]
  const steps = await getTemplateSteps(progress.templateId)

  // Don't add if already skipped or completed
  if (skippedSteps.includes(stepId) || completedSteps.includes(stepId)) {
    return {
      ...progress,
      completedSteps,
      skippedSteps,
      metadata: progress.metadata as Record<string, unknown>,
      steps,
    }
  }

  const newSkippedSteps = [...skippedSteps, stepId]

  // Determine if all steps are either completed or skipped
  const totalCompleted = completedSteps.length
  const totalSkipped = newSkippedSteps.length
  const isCompleted = totalCompleted + totalSkipped >= steps.length
  const newStatus = isCompleted
    ? 'COMPLETED'
    : totalCompleted > 0 || totalSkipped > 0
      ? 'IN_PROGRESS'
      : progress.status

  // Find current step index
  const currentStepIndex = Math.max(
    ...steps.map((step, index) =>
      completedSteps.includes(step.id) || newSkippedSteps.includes(step.id)
        ? index + 1
        : 0
    )
  )

  const updated = await prisma.onboardingProgress.update({
    where: { id: progressId },
    data: {
      skippedSteps: newSkippedSteps,
      currentStep: currentStepIndex,
      status: newStatus as OnboardingStatus,
      lastActivityAt: new Date(),
      completedAt: isCompleted ? new Date() : null,
    },
  })

  return {
    ...updated,
    completedSteps,
    skippedSteps: newSkippedSteps,
    metadata: updated.metadata as Record<string, unknown>,
    steps,
  }
}

/**
 * Get progress by user and organization
 */
export async function getProgress(
  userId: string,
  orgId: string
): Promise<OnboardingProgressData | null> {
  const progress = await prisma.onboardingProgress.findUnique({
    where: {
      userId_orgId: { userId, orgId },
    },
  })

  if (!progress) {
    return null
  }

  const steps = await getTemplateSteps(progress.templateId)

  return {
    ...progress,
    completedSteps: progress.completedSteps as string[],
    skippedSteps: progress.skippedSteps as string[],
    metadata: progress.metadata as Record<string, unknown>,
    steps,
  }
}

/**
 * Get template steps
 */
async function getTemplateSteps(
  templateId: string | null
): Promise<OnboardingStep[]> {
  if (!templateId) {
    return DEFAULT_ONBOARDING_STEPS
  }

  const template = await prisma.onboardingTemplate.findUnique({
    where: { id: templateId },
  })

  if (!template) {
    return DEFAULT_ONBOARDING_STEPS
  }

  return template.steps as unknown as OnboardingStep[]
}

/**
 * Get all onboarding templates
 */
export async function getTemplates(filters?: {
  targetUserType?: string
  targetPlanTier?: PlanTier
  isActive?: boolean
}) {
  const where: Record<string, unknown> = {}

  if (filters?.targetUserType) {
    where.targetUserType = filters.targetUserType
  }
  if (filters?.targetPlanTier) {
    where.targetPlanTier = filters.targetPlanTier
  }
  if (filters?.isActive !== undefined) {
    where.isActive = filters.isActive
  }

  return prisma.onboardingTemplate.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Get template by ID
 */
export async function getTemplateById(id: string) {
  return prisma.onboardingTemplate.findUnique({
    where: { id },
  })
}

/**
 * Create a new onboarding template
 */
export async function createTemplate(data: {
  name: string
  description?: string
  targetUserType?: string
  targetPlanTier?: PlanTier
  steps: OnboardingStep[]
  isDefault?: boolean
  estimatedTime?: number
  metadata?: Record<string, unknown>
}) {
  // If setting as default, unset other defaults
  if (data.isDefault) {
    await prisma.onboardingTemplate.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    })
  }

  return prisma.onboardingTemplate.create({
    data: {
      name: data.name,
      description: data.description,
      targetUserType: data.targetUserType,
      targetPlanTier: data.targetPlanTier,
      steps: data.steps as unknown as Prisma.InputJsonValue,
      isDefault: data.isDefault || false,
      estimatedTime: data.estimatedTime,
      metadata: (data.metadata || {}) as Prisma.InputJsonValue,
    },
  })
}

/**
 * Update an onboarding template
 */
export async function updateTemplate(
  id: string,
  data: {
    name?: string
    description?: string
    targetUserType?: string
    targetPlanTier?: PlanTier
    steps?: OnboardingStep[]
    isActive?: boolean
    isDefault?: boolean
    estimatedTime?: number
    metadata?: Record<string, unknown>
  }
) {
  // If setting as default, unset other defaults
  if (data.isDefault) {
    await prisma.onboardingTemplate.updateMany({
      where: { isDefault: true, id: { not: id } },
      data: { isDefault: false },
    })
  }

  const updateData: Prisma.OnboardingTemplateUpdateInput = {
    ...data,
    steps: data.steps ? (data.steps as unknown as Prisma.InputJsonValue) : undefined,
    metadata: data.metadata ? (data.metadata as Prisma.InputJsonValue) : undefined,
  }

  return prisma.onboardingTemplate.update({
    where: { id },
    data: updateData,
  })
}

/**
 * Delete an onboarding template
 */
export async function deleteTemplate(id: string) {
  // Don't delete default template
  const template = await prisma.onboardingTemplate.findUnique({
    where: { id },
  })

  if (template?.isDefault) {
    throw new Error('Cannot delete the default onboarding template')
  }

  return prisma.onboardingTemplate.delete({
    where: { id },
  })
}

/**
 * Get completion rates for all templates
 */
export async function getCompletionRates() {
  const templates = await prisma.onboardingTemplate.findMany({
    where: { isActive: true },
  })

  const rates = await Promise.all(
    templates.map(async (template) => {
      const [total, completed] = await Promise.all([
        prisma.onboardingProgress.count({
          where: { templateId: template.id },
        }),
        prisma.onboardingProgress.count({
          where: { templateId: template.id, status: 'COMPLETED' },
        }),
      ])

      return {
        templateId: template.id,
        templateName: template.name,
        total,
        completed,
        rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      }
    })
  )

  // Also get stats for users without templates (using default steps)
  const [totalNoTemplate, completedNoTemplate] = await Promise.all([
    prisma.onboardingProgress.count({
      where: { templateId: null },
    }),
    prisma.onboardingProgress.count({
      where: { templateId: null, status: 'COMPLETED' },
    }),
  ])

  rates.push({
    templateId: 'default',
    templateName: 'Default Steps',
    total: totalNoTemplate,
    completed: completedNoTemplate,
    rate:
      totalNoTemplate > 0
        ? Math.round((completedNoTemplate / totalNoTemplate) * 100)
        : 0,
  })

  return rates
}

/**
 * Auto-detect completed steps based on user activity
 */
export async function autoDetectCompletedSteps(
  userId: string,
  orgId: string
): Promise<string[]> {
  const completedSteps: string[] = []

  // Check profile completion
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  })

  if (user?.name && user.name.trim() !== '') {
    completedSteps.push('complete-profile')
  }

  // Check if user has created an agent
  const agentCount = await prisma.agent.count({
    where: { orgId, createdBy: userId },
  })

  if (agentCount > 0) {
    completedSteps.push('create-first-agent')
  }

  // Check if user has run any analysis
  const runCount = await prisma.agentRun.count({
    where: { orgId },
  })

  if (runCount > 0) {
    completedSteps.push('run-first-analysis')
  }

  // Check if org has a custom dashboard
  const dashboardCount = await prisma.dashboard.count({
    where: { orgId },
  })

  if (dashboardCount > 0) {
    completedSteps.push('create-dashboard')
  }

  // Check if user has invited team members
  const memberCount = await prisma.organizationMember.count({
    where: { orgId },
  })

  if (memberCount > 1) {
    completedSteps.push('invite-team-member')
  }

  return completedSteps
}
