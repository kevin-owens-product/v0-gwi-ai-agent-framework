"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, TrendingUp, BarChart3, Target, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface StatisticalAnalysisPanelProps {
  data: Array<Record<string, unknown>>
  xField?: string
  yField?: string
  onAnalysisChange?: (analysis: unknown) => void
}

export function StatisticalAnalysisPanel({
  data,
  xField,
  yField,
  onAnalysisChange,
}: StatisticalAnalysisPanelProps) {
  const [analysisType, setAnalysisType] = useState<string>("trend")
  const [showTrendLine, setShowTrendLine] = useState(false)
  const [showConfidenceBands, setShowConfidenceBands] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<unknown>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!data || data.length === 0) {
      setError("No data available for analysis")
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch("/api/v1/charts/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data,
          analysisType,
          options: {
            xField: xField || "x",
            yField: yField || "y",
          },
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "Failed to analyze data")
      }

      const result = await response.json()
      setAnalysisResult(result.result)
      onAnalysisChange?.(result.result)
    } catch (err) {
      console.error("Error analyzing data:", err)
      setError(err instanceof Error ? err.message : "Failed to analyze data")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Statistical Analysis
        </CardTitle>
        <CardDescription>
          Add statistical overlays and analysis to your chart
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={analysisType} onValueChange={setAnalysisType}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trend">Trend</TabsTrigger>
            <TabsTrigger value="correlation">Correlation</TabsTrigger>
            <TabsTrigger value="significance">Significance</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
          </TabsList>

          <TabsContent value="trend" className="space-y-4">
            <div className="space-y-2">
              <Label>Trend Line Options</Label>
              <div className="flex items-center justify-between">
                <span className="text-sm">Show trend line</span>
                <Switch checked={showTrendLine} onCheckedChange={setShowTrendLine} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Show confidence bands</span>
                <Switch checked={showConfidenceBands} onCheckedChange={setShowConfidenceBands} />
              </div>
            </div>
            <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full">
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Calculate Trend
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="correlation" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Calculate correlation between variables
            </div>
            <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full">
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                "Calculate Correlation"
              )}
            </Button>
          </TabsContent>

          <TabsContent value="significance" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Test statistical significance
            </div>
            <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full">
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Significance"
              )}
            </Button>
          </TabsContent>

          <TabsContent value="forecast" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Generate forecast based on trend
            </div>
            <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full">
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Forecasting...
                </>
              ) : (
                "Generate Forecast"
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysisResult && (
          <div className="p-3 border rounded-lg bg-muted/50 space-y-2">
            <div className="text-sm font-medium">Analysis Results</div>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(analysisResult, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
