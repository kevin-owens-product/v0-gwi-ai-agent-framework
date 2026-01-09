"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, CartesianGrid } from "recharts"
import { Loader2 } from "lucide-react"

interface PerformanceChartsProps {
  orgId?: string
}

interface ChartData {
  time: string
  runs: number
  insights: number
}

interface AgentUsageData {
  name: string
  usage: number
}

export function PerformanceCharts({ orgId }: PerformanceChartsProps) {
  const [activeTab, setActiveTab] = useState("queries")
  const [queryData, setQueryData] = useState<ChartData[]>([])
  const [agentUsageData, setAgentUsageData] = useState<AgentUsageData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totals, setTotals] = useState({ runs: 0, insights: 0 })

  useEffect(() => {
    async function fetchPerformanceData() {
      try {
        // Fetch performance data from API
        const response = await fetch('/api/v1/analytics/performance')
        if (response.ok) {
          const data = await response.json()
          setQueryData(data.timeSeriesData || [])
          setAgentUsageData(data.agentUsage || [])
          setTotals(data.totals || { runs: 0, insights: 0 })
        } else {
          // Use sample data if API not available
          setQueryData(generateSampleTimeData())
          setAgentUsageData([])
          setTotals({ runs: 0, insights: 0 })
        }
      } catch (error) {
        console.error('Failed to fetch performance data:', error)
        setQueryData(generateSampleTimeData())
        setAgentUsageData([])
        setTotals({ runs: 0, insights: 0 })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPerformanceData()
  }, [orgId])

  if (isLoading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="flex items-center justify-center h-[320px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Performance</CardTitle>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-8 bg-muted/50">
            <TabsTrigger value="queries" className="text-xs h-6 px-3">
              Activity
            </TabsTrigger>
            <TabsTrigger value="agents" className="text-xs h-6 px-3">
              Agents
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {activeTab === "queries" ? (
          <div className="space-y-4">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">Runs</span>
                <span className="font-medium text-foreground">{totals.runs.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Insights</span>
                <span className="font-medium text-foreground">{totals.insights.toLocaleString()}</span>
              </div>
            </div>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={queryData}>
                  <defs>
                    <linearGradient id="queryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="insightGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="time"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Area type="monotone" dataKey="runs" stroke="#3b82f6" strokeWidth={2} fill="url(#queryGradient)" />
                  <Area
                    type="monotone"
                    dataKey="insights"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#insightGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="h-[280px]">
            {agentUsageData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <p className="text-sm">No agent usage data yet</p>
                <p className="text-xs">Create and run agents to see usage</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentUsageData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Bar dataKey="usage" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function generateSampleTimeData(): ChartData[] {
  const now = new Date()
  const data: ChartData[] = []

  for (let i = 6; i >= 0; i--) {
    const time = new Date(now)
    time.setHours(time.getHours() - i * 4)
    data.push({
      time: time.getHours() === now.getHours() ? "Now" : `${time.getHours()}:00`,
      runs: 0,
      insights: 0,
    })
  }

  return data
}
