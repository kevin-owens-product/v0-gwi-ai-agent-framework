/**
 * @prompt-id forge-v4.1:feature:feedback-nps:013
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface NPSScoreGaugeProps {
  score: number | null
  totalResponses: number
  promoters: number
  passives: number
  detractors: number
  showBreakdown?: boolean
  className?: string
}

export function NPSScoreGauge({
  score,
  totalResponses,
  promoters,
  passives,
  detractors,
  showBreakdown = true,
  className,
}: NPSScoreGaugeProps) {
  const { scoreColor, scoreLabel, gaugeRotation } = useMemo(() => {
    if (score === null) {
      return {
        scoreColor: "text-muted-foreground",
        scoreLabel: "No data",
        gaugeRotation: 0,
      }
    }

    // NPS ranges from -100 to 100
    // Map to 0-180 degrees for the gauge
    const rotation = ((score + 100) / 200) * 180

    let color = "text-red-500"
    let label = "Needs Improvement"

    if (score >= 70) {
      color = "text-green-500"
      label = "Excellent"
    } else if (score >= 50) {
      color = "text-emerald-500"
      label = "Great"
    } else if (score >= 30) {
      color = "text-amber-500"
      label = "Good"
    } else if (score >= 0) {
      color = "text-orange-500"
      label = "Okay"
    }

    return {
      scoreColor: color,
      scoreLabel: label,
      gaugeRotation: rotation,
    }
  }, [score])

  const percentages = useMemo(() => {
    if (totalResponses === 0) {
      return { promoters: 0, passives: 0, detractors: 0 }
    }
    return {
      promoters: Math.round((promoters / totalResponses) * 100),
      passives: Math.round((passives / totalResponses) * 100),
      detractors: Math.round((detractors / totalResponses) * 100),
    }
  }, [totalResponses, promoters, passives, detractors])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>NPS Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {/* Gauge */}
          <div className="relative w-48 h-24 overflow-hidden">
            {/* Gauge background */}
            <div className="absolute inset-0 rounded-t-full bg-gradient-to-r from-red-500 via-amber-500 to-green-500 opacity-20" />

            {/* Gauge segments */}
            <svg
              viewBox="0 0 200 100"
              className="absolute inset-0 w-full h-full"
            >
              {/* Background arc */}
              <path
                d="M 10 100 A 90 90 0 0 1 190 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/30"
              />
              {/* Colored segments */}
              <path
                d="M 10 100 A 90 90 0 0 1 50 25"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-red-500"
              />
              <path
                d="M 50 25 A 90 90 0 0 1 100 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-orange-500"
              />
              <path
                d="M 100 10 A 90 90 0 0 1 150 25"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-amber-500"
              />
              <path
                d="M 150 25 A 90 90 0 0 1 190 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-green-500"
              />
            </svg>

            {/* Needle */}
            <div
              className="absolute bottom-0 left-1/2 w-1 h-20 bg-foreground origin-bottom transition-transform duration-700 ease-out rounded-full"
              style={{
                transform: `translateX(-50%) rotate(${gaugeRotation - 90}deg)`,
              }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-foreground" />
            </div>

            {/* Center circle */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-background border-2 border-foreground" />
          </div>

          {/* Score display */}
          <div className="text-center mt-4">
            <div className={cn("text-4xl font-bold", scoreColor)}>
              {score !== null ? Math.round(score) : "-"}
            </div>
            <div className={cn("text-sm font-medium", scoreColor)}>
              {scoreLabel}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Based on {totalResponses} responses
            </div>
          </div>

          {/* Breakdown */}
          {showBreakdown && (
            <div className="w-full mt-6 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm">Promoters (9-10)</span>
                </div>
                <span className="text-sm font-medium">
                  {promoters} ({percentages.promoters}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-sm">Passives (7-8)</span>
                </div>
                <span className="text-sm font-medium">
                  {passives} ({percentages.passives}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm">Detractors (0-6)</span>
                </div>
                <span className="text-sm font-medium">
                  {detractors} ({percentages.detractors}%)
                </span>
              </div>

              {/* Visual bar */}
              <div className="h-3 rounded-full overflow-hidden flex mt-2">
                {percentages.detractors > 0 && (
                  <div
                    className="bg-red-500 h-full"
                    style={{ width: `${percentages.detractors}%` }}
                  />
                )}
                {percentages.passives > 0 && (
                  <div
                    className="bg-amber-500 h-full"
                    style={{ width: `${percentages.passives}%` }}
                  />
                )}
                {percentages.promoters > 0 && (
                  <div
                    className="bg-green-500 h-full"
                    style={{ width: `${percentages.promoters}%` }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
