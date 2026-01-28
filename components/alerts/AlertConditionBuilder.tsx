/**
 * @prompt-id forge-v4.1:feature:custom-alerts:007
 * @generated-at 2024-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
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

// Available metrics based on entity type (values only, labels from translations)
const METRICS_BY_ENTITY: Record<string, Array<{ value: string; unit?: string }>> = {
  metric: [
    { value: 'sentiment', unit: '%' },
    { value: 'engagement', unit: '%' },
    { value: 'awareness', unit: '%' },
    { value: 'consideration', unit: '%' },
    { value: 'preference', unit: '%' },
    { value: 'purchase_intent', unit: '%' },
    { value: 'nps', unit: '' },
    { value: 'satisfaction', unit: '%' },
  ],
  audience: [
    { value: 'size', unit: '' },
    { value: 'growth_rate', unit: '%' },
    { value: 'overlap_percentage', unit: '%' },
    { value: 'engagement_score', unit: '' },
  ],
  brand: [
    { value: 'brand_health', unit: '' },
    { value: 'share_of_voice', unit: '%' },
    { value: 'brand_sentiment', unit: '%' },
    { value: 'competitor_gap', unit: '%' },
  ],
  report: [
    { value: 'views', unit: '' },
    { value: 'exports', unit: '' },
    { value: 'data_freshness', unit: 'days' },
  ],
  agent: [
    { value: 'success_rate', unit: '%' },
    { value: 'avg_runtime', unit: 's' },
    { value: 'error_rate', unit: '%' },
    { value: 'runs_count', unit: '' },
  ],
  workflow: [
    { value: 'completion_rate', unit: '%' },
    { value: 'avg_duration', unit: 'min' },
    { value: 'failure_rate', unit: '%' },
    { value: 'executions', unit: '' },
  ],
}

const OPERATOR_VALUES: AlertOperator[] = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'contains', 'not_contains']

export function AlertConditionBuilder({
  value,
  onChange,
  entityType = 'metric',
  className,
}: AlertConditionBuilderProps) {
  const t = useTranslations("alerts")
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
            {t("conditionBuilder.alertWhen")}{' '}
            <span className="font-medium text-foreground">
              {selectedMetric ? t(`conditionBuilder.metrics.${entityType}.${value.metric}`) : t("conditionBuilder.metric")}
            </span>{' '}
            <span className="font-medium text-foreground">
              {t(`conditionBuilder.operators.${value.operator}`)}
            </span>{' '}
            <span className="font-medium text-primary">
              {value.value}{value.unit ? ` ${value.unit}` : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Metric Selection */}
            <div className="space-y-2">
              <Label>{t("conditionBuilder.metricLabel")}</Label>
              <Select
                value={value.metric}
                onValueChange={handleMetricChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("conditionBuilder.selectMetric")} />
                </SelectTrigger>
                <SelectContent>
                  {metrics.map((metric) => (
                    <SelectItem key={metric.value} value={metric.value}>
                      {t(`conditionBuilder.metrics.${entityType}.${metric.value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Operator Selection */}
            <div className="space-y-2">
              <Label>{t("conditionBuilder.conditionLabel")}</Label>
              <Select
                value={value.operator}
                onValueChange={(v) => handleOperatorChange(v as AlertOperator)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("conditionBuilder.selectCondition")} />
                </SelectTrigger>
                <SelectContent>
                  {OPERATOR_VALUES.map((op) => (
                    <SelectItem key={op} value={op}>
                      {t(`conditionBuilder.operators.${op}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Threshold Value */}
            <div className="space-y-2">
              <Label>{t("conditionBuilder.thresholdValue")}</Label>
              <div className="flex items-center gap-2">
                <Input
                  type={typeof value.value === 'number' ? 'number' : 'text'}
                  value={value.value.toString()}
                  onChange={(e) => handleValueChange(e.target.value)}
                  placeholder={t("conditionBuilder.enterValue")}
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
