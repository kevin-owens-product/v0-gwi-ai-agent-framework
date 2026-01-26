import { Suspense } from "react"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  FileCode,
  BarChart3,
  TestTube,
  Plus,
  DollarSign,
  Zap,
  Clock,
  TrendingUp,
} from "lucide-react"

async function getLLMStats() {
  const [
    configurations,
    promptTemplates,
    usageRecords,
    recentUsage,
  ] = await Promise.all([
    prisma.lLMConfiguration.findMany({
      include: {
        _count: { select: { usageRecords: true } },
      },
    }),
    prisma.promptTemplate.count(),
    prisma.lLMUsageRecord.aggregate({
      _sum: {
        promptTokens: true,
        completionTokens: true,
        totalCost: true,
      },
      _avg: {
        latencyMs: true,
      },
    }),
    prisma.lLMUsageRecord.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        configuration: { select: { name: true, provider: true, model: true } },
      },
    }),
  ])

  const totalTokens =
    (usageRecords._sum.promptTokens || 0) +
    (usageRecords._sum.completionTokens || 0)
  const totalCost = Number(usageRecords._sum.totalCost || 0)
  const avgLatency = Math.round(usageRecords._avg.latencyMs || 0)

  return {
    configurations,
    promptTemplates,
    totalTokens,
    totalCost,
    avgLatency,
    recentUsage,
  }
}

async function LLMContent() {
  const stats = await getLLMStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">LLM Configuration</h1>
          <p className="text-muted-foreground">
            Manage language models, prompts, and usage
          </p>
        </div>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/gwi/llm/configurations/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Model
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.configurations.length}</p>
                <p className="text-sm text-muted-foreground">Active Models</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileCode className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.promptTemplates}</p>
                <p className="text-sm text-muted-foreground">Prompt Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {(stats.totalTokens / 1000000).toFixed(2)}M
                </p>
                <p className="text-sm text-muted-foreground">Total Tokens</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Total Cost</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" asChild>
          <Link href="/gwi/llm/configurations/new">
            <Brain className="mr-2 h-4 w-4" />
            Add Model
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/gwi/llm/prompts">
            <FileCode className="mr-2 h-4 w-4" />
            Prompt Templates
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/gwi/llm/usage">
            <BarChart3 className="mr-2 h-4 w-4" />
            Usage Analytics
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/gwi/llm/testing">
            <TestTube className="mr-2 h-4 w-4" />
            Prompt Playground
          </Link>
        </Button>
      </div>

      {/* Model Configurations */}
      <Card>
        <CardHeader>
          <CardTitle>Model Configurations</CardTitle>
          <CardDescription>Active LLM model configurations</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.configurations.length > 0 ? (
            <div className="space-y-4">
              {stats.configurations.map((config) => (
                <Link
                  key={config.id}
                  href={`/gwi/llm/configurations/${config.id}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium">{config.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {config.provider} / {config.model}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {config._count.usageRecords.toLocaleString()} requests
                      </p>
                    </div>
                    <Badge
                      variant={config.isActive ? "default" : "secondary"}
                      className={config.isActive ? "bg-green-100 text-green-700" : ""}
                    >
                      {config.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No model configurations yet</p>
              <Button asChild className="mt-4">
                <Link href="/gwi/llm/configurations/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Model
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Usage</CardTitle>
          <CardDescription>Latest LLM API calls</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentUsage.length > 0 ? (
            <div className="space-y-3">
              {stats.recentUsage.map((usage) => (
                <div
                  key={usage.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {usage.configuration.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(usage.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      {(usage.promptTokens + usage.completionTokens).toLocaleString()} tokens
                    </span>
                    <span className="text-muted-foreground">
                      {usage.latencyMs}ms
                    </span>
                    <span className="font-medium">
                      ${Number(usage.totalCost).toFixed(4)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No usage records yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function LLMPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">LLM Configuration</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <LLMContent />
    </Suspense>
  )
}
