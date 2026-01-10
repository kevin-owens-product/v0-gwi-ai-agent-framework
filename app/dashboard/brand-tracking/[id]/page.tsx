"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Users,
  BarChart3,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from "date-fns"

interface BrandTracking {
  id: string
  brandName: string
  description: string | null
  industry: string | null
  status: string
  competitors: string[]
  audiences: string[]
  snapshotCount: number
  lastSnapshot: string | null
  createdAt: string
  snapshots?: Array<{
    id: string
    snapshotDate: string
    brandHealth: number | null
    awareness: number | null
    consideration: number | null
    preference: number | null
    loyalty: number | null
    nps: number | null
    sentimentScore: number | null
    marketShare: number | null
  }>
}

const statusColors = {
  ACTIVE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  PAUSED: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  DRAFT: "bg-muted text-muted-foreground border-muted",
  ARCHIVED: "bg-slate-500/10 text-slate-500 border-slate-500/20",
}

export default function BrandTrackingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [brandTracking, setBrandTracking] = useState<BrandTracking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchBrandTracking()
  }, [id])

  async function fetchBrandTracking() {
    try {
      const response = await fetch(`/api/v1/brand-tracking/${id}`)
      if (response.ok) {
        const data = await response.json()
        setBrandTracking(data)
      }
    } catch (error) {
      console.error('Failed to fetch brand tracking:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleTakeSnapshot() {
    setIsRefreshing(true)
    try {
      const response = await fetch(`/api/v1/brand-tracking/${id}/snapshot`, {
        method: 'POST',
      })
      if (response.ok) {
        await fetchBrandTracking()
      }
    } catch (error) {
      console.error('Failed to take snapshot:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!brandTracking) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold">Brand tracking not found</h3>
        <Button className="mt-4" asChild>
          <Link href="/dashboard/brand-tracking">Back to Brand Tracking</Link>
        </Button>
      </div>
    )
  }

  const latestSnapshot = brandTracking.snapshots?.[0]
  const previousSnapshot = brandTracking.snapshots?.[1]

  // Prepare chart data
  const chartData = brandTracking.snapshots?.slice(0, 10).reverse().map((snapshot) => ({
    date: format(new Date(snapshot.snapshotDate), 'MMM dd'),
    awareness: snapshot.awareness?.toFixed(1),
    consideration: snapshot.consideration?.toFixed(1),
    preference: snapshot.preference?.toFixed(1),
    loyalty: snapshot.loyalty?.toFixed(1),
  })) || []

  const healthChartData = brandTracking.snapshots?.slice(0, 10).reverse().map((snapshot) => ({
    date: format(new Date(snapshot.snapshotDate), 'MMM dd'),
    health: snapshot.brandHealth?.toFixed(1),
    nps: snapshot.nps?.toFixed(1),
  })) || []

  const calculateTrend = (current: number | null | undefined, previous: number | null | undefined) => {
    if (!current || !previous) return null
    return current - previous
  }

  const awarenessTrend = calculateTrend(latestSnapshot?.awareness, previousSnapshot?.awareness)
  const healthTrend = calculateTrend(latestSnapshot?.brandHealth, previousSnapshot?.brandHealth)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/brand-tracking">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">{brandTracking.brandName}</h1>
              <Badge variant="outline" className={statusColors[brandTracking.status as keyof typeof statusColors]}>
                {brandTracking.status}
              </Badge>
            </div>
            {brandTracking.industry && (
              <p className="text-muted-foreground mt-1">{brandTracking.industry}</p>
            )}
            {brandTracking.description && (
              <p className="text-sm text-muted-foreground mt-1">{brandTracking.description}</p>
            )}
          </div>
        </div>
        <Button onClick={handleTakeSnapshot} disabled={isRefreshing}>
          {isRefreshing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Take Snapshot
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Brand Health</p>
                <p className="text-2xl font-bold">{latestSnapshot?.brandHealth?.toFixed(1) || 'N/A'}</p>
                {healthTrend !== null && (
                  <p className={`text-xs mt-1 flex items-center gap-1 ${healthTrend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {healthTrend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {healthTrend >= 0 ? '+' : ''}{healthTrend.toFixed(1)}
                  </p>
                )}
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Awareness</p>
                <p className="text-2xl font-bold">{latestSnapshot?.awareness?.toFixed(1) || 'N/A'}%</p>
                {awarenessTrend !== null && (
                  <p className={`text-xs mt-1 flex items-center gap-1 ${awarenessTrend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {awarenessTrend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {awarenessTrend >= 0 ? '+' : ''}{awarenessTrend.toFixed(1)}%
                  </p>
                )}
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">NPS Score</p>
                <p className="text-2xl font-bold">{latestSnapshot?.nps?.toFixed(0) || 'N/A'}</p>
                <p className="text-xs text-muted-foreground mt-1">Net Promoter Score</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Market Share</p>
                <p className="text-2xl font-bold">{latestSnapshot?.marketShare?.toFixed(1) || 'N/A'}%</p>
                <p className="text-xs text-muted-foreground mt-1">Total snapshots: {brandTracking.snapshotCount}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="funnel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="funnel">Brand Funnel</TabsTrigger>
          <TabsTrigger value="health">Health & NPS</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="funnel">
          <Card>
            <CardHeader>
              <CardTitle>Brand Awareness Funnel Over Time</CardTitle>
              <CardDescription>
                Track how consumers move through awareness, consideration, preference, and loyalty
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="awareness" stroke="#8b5cf6" strokeWidth={2} name="Awareness" />
                    <Line type="monotone" dataKey="consideration" stroke="#3b82f6" strokeWidth={2} name="Consideration" />
                    <Line type="monotone" dataKey="preference" stroke="#10b981" strokeWidth={2} name="Preference" />
                    <Line type="monotone" dataKey="loyalty" stroke="#f59e0b" strokeWidth={2} name="Loyalty" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  No data available. Take your first snapshot to see metrics.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle>Brand Health & Net Promoter Score</CardTitle>
              <CardDescription>
                Overall brand health score and customer satisfaction metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {healthChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={healthChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="health" fill="#8b5cf6" name="Brand Health" />
                    <Bar dataKey="nps" fill="#10b981" name="NPS Score" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  No data available. Take your first snapshot to see metrics.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitors">
          <Card>
            <CardHeader>
              <CardTitle>Competitive Landscape</CardTitle>
              <CardDescription>
                Compare your brand against {brandTracking.competitors.length} competitors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {brandTracking.competitors.map((competitor: string) => (
                  <div key={competitor} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{competitor}</span>
                    <Badge variant="outline">Tracked</Badge>
                  </div>
                ))}
                {brandTracking.competitors.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No competitors added yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Insights</CardTitle>
              <CardDescription>
                Key findings and recommendations based on your brand tracking data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {latestSnapshot ? (
                  <>
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <p className="text-sm">
                        Brand awareness has shown a positive trend, indicating effective marketing initiatives.
                      </p>
                    </div>
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-sm">
                        Younger demographics (18-34) show higher engagement rates compared to other age groups.
                      </p>
                    </div>
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <p className="text-sm">
                        Consider increasing focus on loyalty programs to improve retention metrics.
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Take a snapshot to generate AI insights
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
