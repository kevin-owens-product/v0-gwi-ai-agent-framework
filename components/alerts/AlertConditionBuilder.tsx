/**
 * @prompt-id forge-v4.1:feature:custom-alerts:007
 * @generated-at 2024-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import type { AlertCondition, AlertOperator } from "@/hooks/use-alerts"
import { cn } from "@/lib/utils"

interface AlertConditionBuilderProps {
  value: AlertCondition
  onChange: (condition: AlertCondition) => void
  entityType?: string
  className?: string
}

// Available metrics based on entity type
const METRICS_BY_ENTITY: Record<string, Array<{ value: string; label: string; unit?: string }>> = {
  metric: [
    { value: 'sentiment', label: 'Sentiment Score', unit: '%' },
    { value: 'engagement', label: 'Engagement Rate', unit: '%' },
    { value: 'awareness', label: 'Brand Awareness', unit: '%' },
    { value: 'consideration', label: 'Consideration', unit: '%' },
    { value: 'preference', label: 'Preference', unit: '%' },
    { value: 'purchase_intent', label: 'Purchase Intent', unit: '%' },
    { value: 'nps', label: 'NPS Score', unit: '' },
    { value: 'satisfaction', label: 'Customer Satisfaction', unit: '%' },
  ],
  audience: [
    { value: 'size', label: 'Audience Size', unit: '' },
    { value: 'growth_rate', label: 'Growth Rate', unit: '%' },
    { value: 'overlap_percentage', label: 'Overlap Percentage', unit: '%' },
    { value: 'engagement_score', label: 'Engagement Score', unit: '' },
  ],
  brand: [
    { value: 'brand_health', label: 'Brand Health Score', unit: '' },
    { value: 'share_of_voice', label: 'Share of Voice', unit: '%' },
    { value: 'brand_sentiment', label: 'Brand Sentiment', unit: '%' },
    { value: 'competitor_gap', label: 'Competitor Gap', unit: '%' },
  ],
  report: [
    { value: 'views', label: 'Report Views', unit: '' },
    { value: 'exports', label: 'Export Count', unit: '' },
    { value: 'data_freshness', label: 'Data Freshness', unit: 'days' },
  ],
  agent: [
    { value: 'success_rate', label: 'Success Rate', unit: '%' },
    { value: 'avg_runtime', label: 'Average Runtime', unit: 's' },
    { value: 'error_rate', label: 'Error Rate', unit: '%' },
    { value: 'runs_count', label: 'Run Count', unit: '' },
  ],
  workflow: [
    { value: 'completion_rate', label: 'Completion Rate', unit: '%' },
    { value: 'avg_duration', label: 'Average Duration', unit: 'min' },
    { value: 'failure_rate', label: 'Failure Rate', unit: '%' },
    { value: 'executions', label: 'Execution Count', unit: '' },
  ],
}

const OPERATORS: Array<{ value: AlertOperator; label: string; description: string }> = [
  { value: 'eq', label: 'equals', description: 'Exactly matches' },
  { value: 'neq', label: 'not equals', description: 'Does not match' },
  { value: 'gt', label: 'greater than', description: 'Is greater than' },
  { value: 'gte', label: 'greater than or equal', description: 'Is at least' },
  { value: 'lt', label: 'less than', description: 'Is less than' },
  { value: 'lte', label: 'less than or equal', description: 'Is at most' },
  { value: 'contains', label: 'contains', description: 'Contains value' },
  { value: 'not_contains', label: 'does not contain', description: 'Does not contain value' },
]

export function AlertConditionBuilder({
  value,
  onChange,
  entityType = 'metric',
  className,
}: AlertConditionBuilderProps) {
  const [metrics, setMetrics] = useState(METRICS_BY_ENTITY[entityType] || METRICS_BY_ENTITY.metric)

  useEffect(() => {
    setMetrics(METRICS_BY_ENTITY[entityType] || METRICS_BY_ENTITY.metric)
  }, [entityType])

  const selectedMetric = metrics.find(m => m.value === value.metric)

  const handleMetricChange = (metric: string) => {
    const metricConfig = metrics.find(m => m.value === metric)
    onChange({
      ...value,
      metric,
      unit: metricConfig?.unit,
    })
  }

  const handleOperatorChange = (operator: AlertOperator) => {
    onChange({
      ...value,
      operator,
    })
  }

  const handleValueChange = (newValue: string) => {
    // Parse as number if possible
    const numericValue = parseFloat(newValue)
    const parsedValue = !isNaN(numericValue) ? numericValue : newValue

    onChange({
      ...value,
      value: parsedValue,
    })
  }

  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Condition Summary */}
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            Alert when{' '}
            <span className="font-medium text-foreground">
              {selectedMetric?.label || 'metric'}
            </span>{' '}
            <span className="font-medium text-foreground">
              {OPERATORS.find(o => o.value === value.operator)?.label || 'is'}
            </span>{' '}
            <span className="font-medium text-primary">
              {value.value}{value.unit ? ` ${value.unit}` : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Metric Selection */}
            <div className="space-y-2">
              <Label>Metric</Label>
              <Select
                value={value.metric}
                onValueChange={handleMetricChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent>
                  {metrics.map((metric) => (
                    <SelectItem key={metric.value} value={metric.value}>
                      {metric.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Operator Selection */}
            <div className="space-y-2">
              <Label>Condition</Label>
              <Select
                value={value.operator}
                onValueChange={(v) => handleOperatorChange(v as AlertOperator)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {OPERATORS.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Threshold Value */}
            <div className="space-y-2">
              <Label>Threshold Value</Label>
              <div className="flex items-center gap-2">
                <Input
                  type={typeof value.value === 'number' ? 'number' : 'text'}
                  value={value.value.toString()}
                  onChange={(e) => handleValueChange(e.target.value)}
                  placeholder="Enter value"
                />
                {selectedMetric?.unit && (
                  <span className="text-sm text-muted-foreground min-w-8">
                    {selectedMetric.unit}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AlertConditionBuilder
