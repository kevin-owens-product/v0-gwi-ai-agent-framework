"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, TrendingUp, AlertCircle, Lightbulb, Target } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AudienceInsightsPanelProps {
  audienceId: string
}

interface Insight {
  type: "opportunity" | "risk" | "differentiator" | "recommendation"
  title: string
  description: string
  confidence: number
  impact: "high" | "medium" | "low"
}

export function AudienceInsightsPanel({ audienceId }: AudienceInsightsPanelProps) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // TODO: Fetch insights from API endpoint
    // For now, generate mock insights
    setTimeout(() => {
      setInsights([
        {
          type: "differentiator",
          title: "3x more likely to pay premium for sustainable products",
          description: "This audience shows significantly higher willingness to pay premium prices for products aligned with their values.",
          confidence: 0.92,
          impact: "high",
        },
        {
          type: "opportunity",
          title: "High social media engagement potential",
          description: "This audience is highly active on social platforms and responds well to influencer marketing.",
          confidence: 0.85,
          impact: "high",
        },
        {
          type: "risk",
          title: "Audience size may be too small for some research",
          description: "With an estimated size of 1.2M, ensure this meets your minimum sample size requirements.",
          confidence: 0.78,
          impact: "medium",
        },
        {
          type: "recommendation",
          title: "Consider creating lookalike audience",
          description: "Generate a similar audience to expand reach while maintaining core characteristics.",
          confidence: 0.88,
          impact: "medium",
        },
      ])
      setIsLoading(false)
    }, 1000)
  }, [audienceId])

  const getIcon = (type: Insight["type"]) => {
    switch (type) {
      case "opportunity":
        return <TrendingUp className="h-4 w-4" />
      case "risk":
        return <AlertCircle className="h-4 w-4" />
      case "differentiator":
        return <Target className="h-4 w-4" />
      case "recommendation":
        return <Lightbulb className="h-4 w-4" />
    }
  }

  const getVariant = (type: Insight["type"]) => {
    switch (type) {
      case "opportunity":
        return "default"
      case "risk":
        return "destructive"
      case "differentiator":
        return "secondary"
      case "recommendation":
        return "outline"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI-Generated Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI-Generated Insights
        </CardTitle>
        <CardDescription>
          Automated insights about this audience's characteristics and opportunities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {insights.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No insights available yet
          </p>
        ) : (
          insights.map((insight, index) => (
            <div
              key={index}
              className="p-3 border rounded-lg space-y-2 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 flex-1">
                  <div className="mt-0.5">{getIcon(insight.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium">{insight.title}</h4>
                      <Badge variant={getVariant(insight.type)} className="text-xs">
                        {insight.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {Math.round(insight.confidence * 100)}%
                </Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
