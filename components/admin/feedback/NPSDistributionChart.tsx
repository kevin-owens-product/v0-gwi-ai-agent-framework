/**
 * @prompt-id forge-v4.1:feature:feedback-nps:014
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface NPSDistributionChartProps {
  scoreDistribution: Record<number, number>
  className?: string
}

export function NPSDistributionChart({
  scoreDistribution,
  className,
}: NPSDistributionChartProps) {
  const t = useTranslations("admin.analytics.npsDistribution")

  const { maxCount, scores, totalResponses } = useMemo(() => {
    const allScores = Array.from({ length: 11 }, (_, i) => ({
      score: i,
      count: scoreDistribution[i] || 0,
    }))

    const max = Math.max(...allScores.map((s) => s.count), 1)
    const total = allScores.reduce((sum, s) => sum + s.count, 0)

    return {
      maxCount: max,
      scores: allScores,
      totalResponses: total,
    }
  }, [scoreDistribution])

  const getBarColor = (score: number) => {
    if (score <= 6) return "bg-red-500"
    if (score <= 8) return "bg-amber-500"
    return "bg-green-500"
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>
          {t("totalResponses", { count: totalResponses })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Bar chart */}
          <div className="flex items-end gap-1 h-40">
            {scores.map(({ score, count }) => {
              const heightPercent = (count / maxCount) * 100
              return (
                <div
                  key={score}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-xs text-muted-foreground">
                    {count > 0 ? count : ""}
                  </span>
                  <div
                    className={cn(
                      "w-full rounded-t transition-all duration-300",
                      getBarColor(score),
                      count === 0 && "opacity-20"
                    )}
                    style={{ height: `${Math.max(heightPercent, count > 0 ? 5 : 2)}%` }}
                  />
                  <span className="text-xs font-medium">{score}</span>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs text-muted-foreground">{t("legend.detractors")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-xs text-muted-foreground">{t("legend.passives")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">{t("legend.promoters")}</span>
            </div>
          </div>

          {/* Details table */}
          <div className="space-y-2 pt-4">
            <div className="grid grid-cols-11 gap-1 text-xs text-center">
              {scores.map(({ score, count }) => (
                <div key={score} className="space-y-1">
                  <div
                    className={cn(
                      "px-1.5 py-0.5 rounded text-white font-medium",
                      getBarColor(score)
                    )}
                  >
                    {count}
                  </div>
                  <div className="text-muted-foreground truncate">
                    {totalResponses > 0
                      ? `${Math.round((count / totalResponses) * 100)}%`
                      : "0%"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
