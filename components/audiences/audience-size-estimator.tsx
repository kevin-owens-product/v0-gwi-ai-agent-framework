"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

interface AudienceSizeEstimation {
  totalSize: number
  marketBreakdown: Record<string, { size: number; percentage: number }>
  confidence: number
  sampleSize: number
  validation: {
    isValid: boolean
    warnings: string[]
    errors: string[]
  }
}

interface AudienceSizeEstimatorProps {
  criteria: unknown
  markets: string[]
  onEstimationChange?: (estimation: AudienceSizeEstimation) => void
}

export function AudienceSizeEstimator({
  criteria,
  markets,
  onEstimationChange,
}: AudienceSizeEstimatorProps) {
  const [estimation, setEstimation] = useState<AudienceSizeEstimation | null>(null)
  const [isEstimating, setIsEstimating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debouncedCriteria = useDebounce(criteria, 800)

  useEffect(() => {
    if (debouncedCriteria && markets.length > 0) {
      estimateSize()
    }
  }, [debouncedCriteria, markets])

  const estimateSize = useCallback(async () => {
    setIsEstimating(true)
    setError(null)

    try {
      const response = await fetch("/api/v1/audiences/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          criteria: debouncedCriteria,
          markets,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to estimate audience size")
      }

      const result = await response.json()
      setEstimation(result)
      onEstimationChange?.(result)
    } catch (err) {
      console.error("Error estimating size:", err)
      setError(err instanceof Error ? err.message : "Failed to estimate size")
    } finally {
      setIsEstimating(false)
    }
  }, [debouncedCriteria, markets, onEstimationChange])

  if (isEstimating && !estimation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estimated Audience Size</CardTitle>
          <CardDescription>Calculating audience size...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && !estimation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estimated Audience Size</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!estimation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estimated Audience Size</CardTitle>
          <CardDescription>Add criteria to see estimated size</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`
    }
    return num.toLocaleString()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Estimated Audience Size</CardTitle>
            <CardDescription>
              {isEstimating ? "Updating..." : "Based on current criteria"}
            </CardDescription>
          </div>
          {isEstimating && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Size */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold">{formatNumber(estimation.totalSize)}</div>
            <Badge variant="secondary" className="text-xs">
              {Math.round(estimation.confidence * 100)}% confidence
            </Badge>
          </div>
          <Progress value={estimation.confidence * 100} className="h-2" />
        </div>

        {/* Market Breakdown */}
        {Object.keys(estimation.marketBreakdown).length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Market Breakdown</div>
            <div className="space-y-1">
              {Object.entries(estimation.marketBreakdown).map(([market, data]) => (
                <div
                  key={market}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">{market}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{formatNumber(data.size)}</span>
                    <span className="text-xs text-muted-foreground">
                      ({data.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sample Size */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Required Sample Size</span>
            <span className="font-medium">{estimation.sampleSize.toLocaleString()}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            For 95% confidence, 5% margin of error
          </div>
        </div>

        {/* Validation */}
        {estimation.validation && (
          <div className="space-y-2">
            {estimation.validation.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    {estimation.validation.errors.map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
            {estimation.validation.warnings.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    {estimation.validation.warnings.map((warning, index) => (
                      <div key={index}>{warning}</div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
            {estimation.validation.isValid &&
              estimation.validation.errors.length === 0 &&
              estimation.validation.warnings.length === 0 && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Audience size is valid for research purposes
                  </AlertDescription>
                </Alert>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
