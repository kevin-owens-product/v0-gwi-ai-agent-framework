"use client"

import { useState, useEffect, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Database, Brain, Variable, Clock, Trash2, Edit2, ChevronRight, Loader2 } from "lucide-react"
import { usePlayground } from "@/app/dashboard/playground/page"
import { cn } from "@/lib/utils"

interface DataSource {
  id: string
  name: string
  status: 'PENDING' | 'CONNECTED' | 'ERROR' | 'DISABLED' | string
  type?: string
  lastSyncAt?: string
}

interface Memory {
  id: string
  type: 'audience' | 'preference' | 'context'
  content: string
  timestamp: string
  confidence: number
}

// Demo memories shown when memory is enabled
const demoMemories: Memory[] = [
  {
    id: "mem-1",
    type: "audience",
    content: "User is researching Gen Z sustainability preferences in US market",
    timestamp: "2 minutes ago",
    confidence: 95,
  },
  {
    id: "mem-2",
    type: "preference",
    content: "Prefers data visualizations over text-heavy outputs",
    timestamp: "5 minutes ago",
    confidence: 88,
  },
  {
    id: "mem-3",
    type: "context",
    content: "Working on Q1 2025 brand strategy project",
    timestamp: "10 minutes ago",
    confidence: 92,
  },
]

// Demo data sources shown when API returns empty or errors
const demoDataSources: DataSource[] = [
  {
    id: "gwi-core",
    name: "GWI Core",
    status: "CONNECTED",
    type: "GWI",
  },
  {
    id: "gwi-zeitgeist",
    name: "GWI Zeitgeist",
    status: "CONNECTED",
    type: "GWI",
  },
  {
    id: "custom-1",
    name: "Brand Tracker Q4",
    status: "PENDING",
    type: "CUSTOM",
  },
]

export function PlaygroundContextPanel() {
  const t = useTranslations("playground.contextPanel")
  const { setContextPanelOpen, activeVariables, setActiveVariables: _setActiveVariables, config, messages } = usePlayground()
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sessionStart] = useState(Date.now())

  // Fetch data sources from API
  useEffect(() => {
    async function fetchDataSources() {
      try {
        const response = await fetch('/api/v1/data-sources')
        if (!response.ok) {
          setDataSources(demoDataSources)
          return
        }
        const data = await response.json()
        const fetchedSources = data.dataSources || data.data || []

        if (fetchedSources.length === 0) {
          setDataSources(demoDataSources)
        } else {
          setDataSources(fetchedSources)
        }
      } catch (err) {
        console.error('Failed to fetch data sources:', err)
        setDataSources(demoDataSources)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDataSources()
  }, [])

  // Calculate session stats
  const sessionStats = useMemo(() => {
    const duration = Math.floor((Date.now() - sessionStart) / 60000)
    const messageCount = messages.length
    // Rough token estimate: ~4 chars per token
    const tokenEstimate = messages.reduce((acc, m) => acc + Math.ceil(m.content.length / 4), 0)

    return {
      duration: duration < 1 ? t("lessThanMinute") : t("minutes", { count: duration }),
      messages: messageCount,
      tokens: tokenEstimate.toLocaleString(),
    }
  }, [messages, sessionStart, t])

  const getStatusDisplay = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === 'connected') return { label: t("status.connected"), className: 'bg-emerald-500/10 text-emerald-500' }
    if (statusLower === 'pending') return { label: t("status.processing"), className: 'bg-amber-500/10 text-amber-500' }
    if (statusLower === 'error') return { label: t("status.error"), className: 'bg-red-500/10 text-red-500' }
    if (statusLower === 'disabled') return { label: t("status.disabled"), className: 'bg-muted text-muted-foreground' }
    return { label: statusLower, className: '' }
  }

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">{t("title")}</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setContextPanelOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Active Variables */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Variable className="h-4 w-4 text-accent" />
              <h4 className="text-sm font-medium text-foreground">{t("activeVariables")}</h4>
            </div>
            <div className="space-y-2">
              {Object.entries(activeVariables).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 group">
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-accent">${key}</code>
                    <span className="text-xs text-muted-foreground">=</span>
                    <span className="text-xs text-foreground truncate max-w-[120px]">{value || "null"}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full text-xs mt-2 bg-transparent">
                <Variable className="h-3 w-3 mr-2" />
                {t("addVariable")}
              </Button>
            </div>
          </div>

          {/* Data Sources */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Database className="h-4 w-4 text-accent" />
              <h4 className="text-sm font-medium text-foreground">{t("dataSources")}</h4>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-2">
                {dataSources.map((source) => {
                  const statusDisplay = getStatusDisplay(source.status)
                  return (
                    <div
                      key={source.id}
                      className={cn(
                        "p-3 rounded-lg border transition-all",
                        config.selectedSources.includes(source.id) ? "border-accent bg-accent/5" : "border-border",
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{source.name}</span>
                        <Badge
                          variant="secondary"
                          className={cn("text-[10px]", statusDisplay.className)}
                        >
                          {statusDisplay.label}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{source.type || t("custom")}</span>
                        <span>{source.lastSyncAt ? new Date(source.lastSyncAt).toLocaleDateString() : t("realTime")}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Active Memories */}
          {config.enableMemory && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-accent" />
                  <h4 className="text-sm font-medium text-foreground">{t("activeMemories")}</h4>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {demoMemories.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {demoMemories.map((memory) => (
                  <div
                    key={memory.id}
                    className="p-3 rounded-lg border border-border hover:border-muted-foreground/30 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px]",
                          memory.type === "audience" && "bg-blue-500/10 text-blue-500",
                          memory.type === "preference" && "bg-purple-500/10 text-purple-500",
                          memory.type === "context" && "bg-emerald-500/10 text-emerald-500",
                        )}
                      >
                        {memory.type}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                    <p className="text-xs text-foreground mb-2 line-clamp-2">{memory.content}</p>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {memory.timestamp}
                      </span>
                      <span>{memory.confidence}% confidence</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Session Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-accent" />
              <h4 className="text-sm font-medium text-foreground">{t("sessionInfo")}</h4>
            </div>
            <Card className="p-3 bg-secondary/30">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("duration")}</span>
                  <span className="text-foreground">{sessionStats.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("messages")}</span>
                  <span className="text-foreground">{sessionStats.messages}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("estTokens")}</span>
                  <span className="text-foreground">{sessionStats.tokens}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border">
        <Button variant="outline" size="sm" className="w-full text-xs bg-transparent">
          <ChevronRight className="h-3 w-3 mr-2" />
          {t("viewFullContext")}
        </Button>
      </div>
    </div>
  )
}
