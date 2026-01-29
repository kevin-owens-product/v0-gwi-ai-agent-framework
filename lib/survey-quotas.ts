/**
 * Survey Quota Management
 * 
 * Handles quota tracking, validation, and completion detection
 */

export interface QuotaCondition {
  [questionCode: string]: unknown
}

export interface Quota {
  id: string
  name: string
  targetCount: number
  currentCount: number
  conditions: QuotaCondition
  isActive: boolean
}

export interface SurveyResponse {
  id: string
  answers: Record<string, unknown>
  completedAt: Date | null
}

/**
 * Check if a response matches quota conditions
 */
export function matchesQuotaConditions(
  response: SurveyResponse,
  conditions: QuotaCondition
): boolean {
  if (!response.completedAt) {
    return false // Only count completed responses
  }

  const answers = response.answers

  for (const [questionCode, expectedValue] of Object.entries(conditions)) {
    const answerValue = answers[questionCode]

    // Handle array matching (for multi-select)
    if (Array.isArray(expectedValue)) {
      if (!Array.isArray(answerValue)) {
        return false
      }
      // Check if answer contains any of the expected values
      const matches = expectedValue.some((val) => answerValue.includes(val))
      if (!matches) {
        return false
      }
    } else {
      // Exact match
      if (answerValue !== expectedValue) {
        return false
      }
    }
  }

  return true
}

/**
 * Check if a quota is complete
 */
export function isQuotaComplete(quota: Quota): boolean {
  return quota.currentCount >= quota.targetCount
}

/**
 * Check if a quota has remaining capacity
 */
export function hasQuotaCapacity(quota: Quota): boolean {
  return quota.currentCount < quota.targetCount
}

/**
 * Calculate quota completion percentage
 */
export function getQuotaPercentage(quota: Quota): number {
  if (quota.targetCount === 0) {
    return 0
  }
  return Math.round((quota.currentCount / quota.targetCount) * 100)
}

/**
 * Get quota status summary
 */
export function getQuotaStatus(quotas: Quota[]): {
  totalQuotas: number
  totalTarget: number
  totalCurrent: number
  totalRemaining: number
  overallPercentage: number
  completedQuotas: number
  activeQuotas: number
} {
  const activeQuotas = quotas.filter((q) => q.isActive)
  const totalTarget = activeQuotas.reduce((sum, q) => sum + q.targetCount, 0)
  const totalCurrent = activeQuotas.reduce((sum, q) => sum + q.currentCount, 0)
  const totalRemaining = Math.max(0, totalTarget - totalCurrent)
  const overallPercentage = totalTarget > 0
    ? Math.round((totalCurrent / totalTarget) * 100)
    : 0
  const completedQuotas = activeQuotas.filter((q) => isQuotaComplete(q)).length

  return {
    totalQuotas: quotas.length,
    totalTarget,
    totalCurrent,
    totalRemaining,
    overallPercentage,
    completedQuotas,
    activeQuotas: activeQuotas.length,
  }
}

/**
 * Check if a response should be accepted based on quotas
 */
export function shouldAcceptResponse(
  response: SurveyResponse,
  quotas: Quota[]
): {
  accepted: boolean
  reason?: string
  matchedQuota?: Quota
} {
  if (!response.completedAt) {
    return { accepted: false, reason: "Response not completed" }
  }

  // Find matching active quotas
  const matchingQuotas = quotas.filter((quota) => {
    if (!quota.isActive) {
      return false
    }

    if (isQuotaComplete(quota)) {
      return false // Quota already full
    }

    return matchesQuotaConditions(response, quota.conditions)
  })

  if (matchingQuotas.length === 0) {
    return { accepted: true, reason: "No matching quotas" }
  }

  // Check if any matching quota has capacity
  const availableQuota = matchingQuotas.find((q) => hasQuotaCapacity(q))

  if (!availableQuota) {
    return {
      accepted: false,
      reason: "All matching quotas are full",
    }
  }

  return {
    accepted: true,
    matchedQuota: availableQuota,
  }
}

/**
 * Increment quota count for a matched response
 */
export async function incrementQuotaCount(
  quotaId: string,
  prisma: {
    surveyQuota: {
      update: (args: {
        where: { id: string }
        data: { currentCount: { increment: number } }
      }) => Promise<{ id: string; currentCount: number }>
    }
  }
): Promise<void> {
  await prisma.surveyQuota.update({
    where: { id: quotaId },
    data: { currentCount: { increment: 1 } },
  })
}
