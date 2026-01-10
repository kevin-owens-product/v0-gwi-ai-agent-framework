"use client"

import { useState, useEffect, use } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Target,
  Lightbulb,
  Loader2,
  Calendar,
  Bot,
  BarChart3,
  Share2,
  Download,
  Copy,
  Check,
} from "lucide-react"
import Link from "next/link"

interface Insight {
  id: string
  title: string
  type: string
  confidenceScore: number | null
  createdAt: string
  data: any
  agentRun?: {
    id: string
    agent?: {
      id: string
      name: string
      type: string
    }
  }
}

const typeIcons: Record<string, typeof Users> = {
  audience: Users,
  research: Users,
  competitive: Target,
  analysis: Lightbulb,
  trend: TrendingUp,
  reporting: TrendingUp,
  monitoring: Target,
  custom: Lightbulb,
}

export default function InsightDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [insight, setInsight] = useState<Insight | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchInsight() {
      try {
        const response = await fetch(`/api/v1/insights/${id}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError("Insight not found")
          } else {
            setError("Failed to load insight")
          }
          return
        }
        const data = await response.json()
        setInsight(data.data)
      } catch (err) {
        console.error('Failed to fetch insight:', err)
        setError("Failed to load insight")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInsight()
  }, [id])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const handleCopy = () => {
    if (insight) {
      navigator.clipboard.writeText(
        `${insight.title}\n\n${JSON.stringify(insight.data, null, 2)}`
      )
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !insight) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/insights">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Insights
          </Link>
        </Button>
        <Card className="bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{error || "Insight not found"}</h3>
            <p className="text-muted-foreground text-center">
              This insight may have been deleted or you don&apos;t have access to it.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/insights">View All Insights</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const Icon = typeIcons[insight.type.toLowerCase()] || Lightbulb
  const confidence = insight.confidenceScore
    ? Math.round(insight.confidenceScore * 100)
    : null

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/insights">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Insights
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-6 lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <Badge variant="outline" className="capitalize">
              {insight.type.toLowerCase()}
            </Badge>
            {confidence && (
              <Badge variant="secondary" className="text-emerald-500">
                <BarChart3 className="h-3 w-3 mr-1" />
                {confidence}% confidence
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold">{insight.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(insight.createdAt)}
            </div>
            {insight.agentRun?.agent && (
              <div className="flex items-center gap-1">
                <Bot className="h-4 w-4" />
                via {insight.agentRun.agent.name}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Insight Details</CardTitle>
          <CardDescription>
            Raw data and findings from this insight
          </CardDescription>
        </CardHeader>
        <CardContent>
          {typeof insight.data === "object" ? (
            <div className="space-y-4">
              {Object.entries(insight.data).map(([key, value]) => (
                <div key={key} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <h4 className="text-sm font-medium text-muted-foreground capitalize mb-2">
                    {key.replace(/_/g, " ")}
                  </h4>
                  {typeof value === "string" ? (
                    <p className="text-foreground">{value}</p>
                  ) : Array.isArray(value) ? (
                    <ul className="list-disc list-inside space-y-1">
                      {value.map((item, index) => (
                        <li key={index} className="text-foreground">
                          {typeof item === "string" ? item : JSON.stringify(item)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <pre className="text-sm bg-muted p-3 rounded-lg overflow-x-auto">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-foreground">{String(insight.data)}</p>
          )}
        </CardContent>
      </Card>

      {/* Related Actions */}
      <Card className="bg-muted/30">
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="p-3 rounded-full bg-primary/10">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Want to explore more?</h3>
              <p className="text-sm text-muted-foreground">
                Run more queries in the playground to generate additional insights.
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/playground">Open Playground</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
