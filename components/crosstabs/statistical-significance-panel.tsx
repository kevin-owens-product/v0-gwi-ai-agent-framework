"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calculator, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SignificanceResult {
  pValue: number
  significant: boolean
  confidenceLevel: number
  testType: string
  sampleSize?: number
  marginOfError?: number
}

interface StatisticalSignificancePanelProps {
  data: Array<{ metric: string; values: Record<string, number> }>
  audiences: string[]
  baselineAudience?: string
  onSignificanceCalculated?: (results: Record<string, SignificanceResult>) => void
  className?: string
}

export function StatisticalSignificancePanel({
  data,
  audiences,
  baselineAudience,
  onSignificanceCalculated,
  className,
}: StatisticalSignificancePanelProps) {
  const [testType, setTestType] = useState<"t-test" | "chi-square" | "z-test">("t-test")
  const [confidenceLevel, setConfidenceLevel] = useState<number>(95)
  const [minSampleSize, setMinSampleSize] = useState<number>(30)
  const [showOnlySignificant, setShowOnlySignificant] = useState<boolean>(false)
  const [isCalculating, setIsCalculating] = useState<boolean>(false)
  const [results, setResults] = useState<Record<string, SignificanceResult>>({})
  const [baseline, setBaseline] = useState<string>(baselineAudience || audiences[0] || "")

  const calculateSignificance = async () => {
    setIsCalculating(true)
    try {
      const newResults: Record<string, SignificanceResult> = {}

      for (const row of data) {
        const baselineValue = row.values[baseline] || 0
        const cellKey = `${row.metric}_${baseline}`

        for (const audience of audiences) {
          if (audience === baseline) continue

          const value = row.values[audience] || 0
          const key = `${row.metric}_${audience}`

          // Simplified significance calculation
          // In production, use proper statistical libraries
          const difference = Math.abs(value - baselineValue)
          const pooledStd = Math.sqrt((baselineValue * (1 - baselineValue) + value * (1 - value)) / 2)
          const se = pooledStd * Math.sqrt(2 / minSampleSize)
          const zScore = difference / se
          const pValue = 2 * (1 - normalCDF(Math.abs(zScore)))
          const alpha = (100 - confidenceLevel) / 100
          const significant = pValue < alpha

          newResults[key] = {
            pValue: Math.round(pValue * 10000) / 10000,
            significant,
            confidenceLevel,
            testType,
            sampleSize: minSampleSize,
            marginOfError: Math.round(se * 10000) / 10000,
          }
        }
      }

      setResults(newResults)
      if (onSignificanceCalculated) {
        onSignificanceCalculated(newResults)
      }
    } catch (error) {
      console.error("Error calculating significance:", error)
    } finally {
      setIsCalculating(false)
    }
  }

  // Simplified normal CDF approximation
  const normalCDF = (x: number): number => {
    return 0.5 * (1 + erf(x / Math.sqrt(2)))
  }

  const erf = (x: number): number => {
    const a1 = 0.254829592
    const a2 = -0.284496736
    const a3 = 1.421413741
    const a4 = -1.453152027
    const a5 = 1.061405429
    const p = 0.3275911

    const sign = x < 0 ? -1 : 1
    x = Math.abs(x)

    const t = 1.0 / (1.0 + p * x)
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t) * Math.exp(-x * x)

    return sign * y
  }

  const getSignificanceBadge = (result: SignificanceResult) => {
    if (result.significant) {
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Significant (p &lt; {String(((100 - confidenceLevel) / 100).toFixed(2))})
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-muted text-muted-foreground">
        <XCircle className="h-3 w-3 mr-1" />
        Not Significant
      </Badge>
    )
  }

  const filteredResults = showOnlySignificant
    ? Object.entries(results).filter(([_, result]) => result.significant)
    : Object.entries(results)

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Statistical Significance Testing
        </CardTitle>
        <CardDescription>
          Calculate statistical significance for crosstab cells
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Test Type</Label>
            <Select value={testType} onValueChange={(v) => setTestType(v as typeof testType)}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="t-test">T-Test</SelectItem>
                <SelectItem value="z-test">Z-Test</SelectItem>
                <SelectItem value="chi-square">Chi-Square</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Confidence Level</Label>
            <Select value={String(confidenceLevel)} onValueChange={(v) => setConfidenceLevel(Number(v))}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">90%</SelectItem>
                <SelectItem value="95">95%</SelectItem>
                <SelectItem value="99">99%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Baseline Audience</Label>
            <Select value={baseline} onValueChange={setBaseline}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {audiences.map((aud) => (
                  <SelectItem key={aud} value={aud}>
                    {aud}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Min Sample Size</Label>
            <Input
              type="number"
              className="h-8"
              value={minSampleSize}
              onChange={(e) => setMinSampleSize(Number(e.target.value))}
              min={10}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={showOnlySignificant}
            onCheckedChange={setShowOnlySignificant}
          />
          <Label className="text-xs">Show only significant results</Label>
        </div>

        <Button
          onClick={calculateSignificance}
          disabled={isCalculating}
          className="w-full"
        >
          {isCalculating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Calculator className="h-4 w-4 mr-2" />
              Calculate Significance
            </>
          )}
        </Button>

        {/* Results */}
        {filteredResults.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <Label className="text-xs font-medium">Results</Label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredResults.map(([key, result]) => {
                const [metric, audience] = key.split("_")
                return (
                  <div key={key} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{metric}</div>
                        <div className="text-xs text-muted-foreground">vs {audience}</div>
                      </div>
                      {getSignificanceBadge(result)}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">p-value: </span>
                        <span className="font-medium">{result.pValue.toFixed(4)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Margin: </span>
                        <span className="font-medium">±{result.marginOfError?.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {filteredResults.length === 0 && Object.keys(results).length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              No significant results found at {confidenceLevel}% confidence level.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
