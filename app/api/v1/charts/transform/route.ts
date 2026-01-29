import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUserMembership, getValidatedOrgId } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'

/**
 * POST /api/v1/charts/transform
 * Transform chart data using calculated fields and transformations
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

    if (!hasPermission(membership.role, 'charts:read')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await request.json()
    const { data, transformations, calculatedFields } = body

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({ error: 'Data is required and must be an array' }, { status: 400 })
    }

    // Apply transformations
    let transformedData = [...data]

    // Apply calculated fields
    if (calculatedFields && Array.isArray(calculatedFields)) {
      transformedData = applyCalculatedFields(transformedData, calculatedFields)
    }

    // Apply transformations
    if (transformations && Array.isArray(transformations)) {
      transformedData = applyTransformations(transformedData, transformations)
    }

    return NextResponse.json({
      success: true,
      data: transformedData,
      originalCount: data.length,
      transformedCount: transformedData.length,
    })
  } catch (error) {
    console.error('Error transforming data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Apply calculated fields to data
 */
function applyCalculatedFields(
  data: Array<Record<string, unknown>>,
  fields: Array<{ name: string; formula: string; type: string }>
): Array<Record<string, unknown>> {
  return data.map((row) => {
    const newRow = { ...row }
    fields.forEach((field) => {
      try {
        // Simple formula evaluation (in production, use a proper formula parser)
        let value = evaluateFormula(field.formula, row)
        
        // Apply type-specific formatting
        if (field.type === 'percentage') {
          value = value * 100
        } else if (field.type === 'index') {
          // Index calculation would need a base value
          value = value
        }
        
        newRow[field.name] = value
      } catch (error) {
        console.error(`Error calculating field ${field.name}:`, error)
        newRow[field.name] = null
      }
    })
    return newRow
  })
}

/**
 * Evaluate a simple formula
 * TODO: Replace with proper formula parser library
 */
function evaluateFormula(formula: string, row: Record<string, unknown>): number {
  // Replace [FieldName] with actual values from row
  let evaluated = formula
  const fieldPattern = /\[(\w+)\]/g
  const matches = formula.matchAll(fieldPattern)
  
  for (const match of matches) {
    const fieldName = match[1]
    const value = row[fieldName]
    if (typeof value === 'number') {
      evaluated = evaluated.replace(match[0], String(value))
    } else {
      evaluated = evaluated.replace(match[0], '0')
    }
  }
  
  // Evaluate the formula (simple eval - in production use a safe parser)
  try {
    // eslint-disable-next-line no-eval
    return eval(evaluated) || 0
  } catch {
    return 0
  }
}

/**
 * Apply transformations to data
 */
function applyTransformations(
  data: Array<Record<string, unknown>>,
  transformations: Array<{ type: string; config: unknown }>
): Array<Record<string, unknown>> {
  let result = [...data]
  
  transformations.forEach((transformation) => {
    switch (transformation.type) {
      case 'aggregate':
        result = applyAggregation(result, transformation.config as { type: string; field: string })
        break
      case 'transform':
        result = applyTimeTransformation(result, transformation.config as { type: string; field: string })
        break
      case 'clean':
        result = applyDataCleaning(result, transformation.config as { removeOutliers: boolean; handleMissing: string })
        break
      default:
        break
    }
  })
  
  return result
}

function applyAggregation(
  data: Array<Record<string, unknown>>,
  config: { type: string; field: string }
): Array<Record<string, unknown>> {
  // Group and aggregate logic would go here
  // For now, return as-is
  return data
}

function applyTimeTransformation(
  data: Array<Record<string, unknown>>,
  config: { type: string; field: string }
): Array<Record<string, unknown>> {
  // Time-based transformations (YoY, QoQ, moving average)
  // For now, return as-is
  return data
}

function applyDataCleaning(
  data: Array<Record<string, unknown>>,
  config: { removeOutliers: boolean; handleMissing: string }
): Array<Record<string, unknown>> {
  // Data cleaning logic
  // For now, return as-is
  return data
}
