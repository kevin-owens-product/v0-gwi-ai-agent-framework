/**
 * Survey Routing Engine
 * 
 * Handles evaluation of routing rules, skip logic, and conditional question display
 */

export interface RoutingCondition {
  type: "equals" | "contains" | "greater" | "less" | "not_equals" | "in" | "not_in" | "and" | "or"
  field?: string
  value?: unknown
  conditions?: RoutingCondition[] // For AND/OR logic
}

export interface RoutingRule {
  id: string
  sourceQuestionId?: string | null
  condition: RoutingCondition | Record<string, unknown>
  targetQuestionId?: string | null
  action: "skip_to" | "show_if" | "hide_if" | "end_survey"
  priority: number
  isActive: boolean
}

export interface Question {
  id: string
  code: string
  order: number
  displayLogic?: Record<string, unknown> | null
}

/**
 * Evaluate a routing condition against answer data
 */
export function evaluateCondition(
  condition: RoutingCondition | Record<string, unknown>,
  answers: Record<string, unknown>
): boolean {
  if (typeof condition !== "object" || condition === null) {
    return false
  }

  const cond = condition as RoutingCondition

  // Handle AND/OR logic
  if (cond.type === "and" || cond.type === "or") {
    if (!cond.conditions || !Array.isArray(cond.conditions)) {
      return false
    }

    const results = cond.conditions.map((c) => evaluateCondition(c, answers))

    if (cond.type === "and") {
      return results.every((r) => r === true)
    } else {
      return results.some((r) => r === true)
    }
  }

  // Handle field-based conditions
  if (!cond.field) {
    return false
  }

  const fieldValue = answers[cond.field]
  const conditionValue = cond.value

  switch (cond.type) {
    case "equals":
      return fieldValue === conditionValue

    case "not_equals":
      return fieldValue !== conditionValue

    case "contains":
      return String(fieldValue || "").includes(String(conditionValue || ""))

    case "greater":
      return Number(fieldValue) > Number(conditionValue)

    case "less":
      return Number(fieldValue) < Number(conditionValue)

    case "in":
      return Array.isArray(conditionValue) && conditionValue.includes(fieldValue)

    case "not_in":
      return Array.isArray(conditionValue) && !conditionValue.includes(fieldValue)

    default:
      return false
  }
}

/**
 * Get the next question based on routing rules and current answers
 */
export function getNextQuestion(
  currentQuestionId: string,
  questions: Question[],
  routingRules: RoutingRule[],
  answers: Record<string, unknown>
): string | null {
  // Get active routing rules sorted by priority
  const activeRules = routingRules
    .filter((r) => r.isActive)
    .filter((r) => r.sourceQuestionId === currentQuestionId)
    .sort((a, b) => b.priority - a.priority)

  // Evaluate rules in priority order
  for (const rule of activeRules) {
    const conditionMet = evaluateCondition(rule.condition, answers)

    if (conditionMet) {
      switch (rule.action) {
        case "skip_to":
          if (rule.targetQuestionId) {
            return rule.targetQuestionId
          }
          break

        case "end_survey":
          return null // End of survey

        case "show_if":
        case "hide_if":
          // These are handled by display logic, not routing
          break
      }
    }
  }

  // Default: get next question in order
  const currentQuestion = questions.find((q) => q.id === currentQuestionId)
  if (!currentQuestion) {
    return null
  }

  const nextQuestion = questions.find(
    (q) => q.order > currentQuestion.order
  )

  return nextQuestion?.id || null
}

/**
 * Check if a question should be displayed based on display logic
 */
export function shouldDisplayQuestion(
  question: Question,
  answers: Record<string, unknown>,
  routingRules: RoutingRule[]
): boolean {
  // Check display logic
  if (question.displayLogic) {
    const displayCondition = question.displayLogic as RoutingCondition
    const shouldShow = evaluateCondition(displayCondition, answers)

    // Check for hide_if rules
    const hideRules = routingRules.filter(
      (r) =>
        r.isActive &&
        r.targetQuestionId === question.id &&
        r.action === "hide_if"
    )

    for (const rule of hideRules) {
      if (evaluateCondition(rule.condition, answers)) {
        return false
      }
    }

    return shouldShow
  }

  // Check for show_if rules
  const showRules = routingRules.filter(
    (r) =>
      r.isActive &&
      r.targetQuestionId === question.id &&
      r.action === "show_if"
  )

  if (showRules.length > 0) {
    return showRules.some((rule) => evaluateCondition(rule.condition, answers))
  }

  // Default: show question
  return true
}

/**
 * Process question piping - replace placeholders with previous answers
 */
export function processPiping(
  text: string,
  answers: Record<string, unknown>,
  questions: Question[]
): string {
  let processedText = text

  // Replace {Q_CODE} with answer value
  const placeholderRegex = /\{([A-Z0-9_]+)\}/g
  const matches = text.matchAll(placeholderRegex)

  for (const match of matches) {
    const questionCode = match[1]
    const question = questions.find((q) => q.code === questionCode)

    if (question) {
      const answer = answers[questionCode]
      const replacement = answer !== undefined && answer !== null
        ? String(answer)
        : ""
      processedText = processedText.replace(match[0], replacement)
    }
  }

  return processedText
}

/**
 * Validate routing rules for a survey
 */
export function validateRoutingRules(
  routingRules: RoutingRule[],
  questions: Question[]
): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  const questionIds = new Set(questions.map((q) => q.id))

  for (const rule of routingRules) {
    // Check source question exists
    if (rule.sourceQuestionId && !questionIds.has(rule.sourceQuestionId)) {
      errors.push(`Rule ${rule.id}: Source question not found`)
    }

    // Check target question exists
    if (rule.targetQuestionId && !questionIds.has(rule.targetQuestionId)) {
      errors.push(`Rule ${rule.id}: Target question not found`)
    }

    // Check for circular references
    if (rule.sourceQuestionId === rule.targetQuestionId) {
      warnings.push(`Rule ${rule.id}: Source and target are the same`)
    }

    // Validate condition structure
    if (!rule.condition || typeof rule.condition !== "object") {
      errors.push(`Rule ${rule.id}: Invalid condition structure`)
    }

    // Validate action
    const validActions = ["skip_to", "show_if", "hide_if", "end_survey"]
    if (!validActions.includes(rule.action)) {
      errors.push(`Rule ${rule.id}: Invalid action`)
    }

    // Check skip_to requires target
    if (rule.action === "skip_to" && !rule.targetQuestionId) {
      errors.push(`Rule ${rule.id}: skip_to action requires target question`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}
