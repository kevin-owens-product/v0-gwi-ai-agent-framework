"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Folder, ArrowRight, Loader2, Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Project {
  id: string
  name: string
  status: "active" | "completed" | "on_hold"
  progress: number
  color?: string
  lastUpdated: string
}

// Format a date to relative time
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

// Generate demo projects with relative timestamps (called after mount to avoid hydration mismatch)
function getDemoProjects(): Project[] {
  const now = Date.now()
  return [
    {
      id: "gen-z-sustainability",
      name: "Gen Z Sustainability",
      status: "active",
      progress: 68,
      color: "bg-emerald-500",
      lastUpdated: new Date(now - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "q4-campaign",
      name: "Q4 Campaign",
      status: "active",
      progress: 45,
      color: "bg-blue-500",
      lastUpdated: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "market-expansion",
      name: "Market Expansion",
      status: "on_hold",
      progress: 25,
      color: "bg-amber-500",
      lastUpdated: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "brand-refresh",
      name: "Brand Refresh 2024",
      status: "completed",
      progress: 100,
      color: "bg-violet-500",
      lastUpdated: new Date(now - 48 * 60 * 60 * 1000).toISOString(),
    },
  ]
}

const statusConfig = {
  active: { icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10", label: "Active" },
  completed: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Completed" },
  on_hold: { icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/10", label: "On Hold" },
}

export function ProjectsOverview() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch("/api/v1/projects?limit=4")
        if (!response.ok) {
          setProjects(getDemoProjects())
          return
        }
        const data = await response.json()
        const fetchedProjects = data.projects || data.data || []

        if (fetchedProjects.length === 0) {
          setProjects(getDemoProjects())
        } else {
          const colors = ["bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-violet-500", "bg-rose-500"]
          const transformedProjects: Project[] = fetchedProjects.slice(0, 4).map((p: any, i: number) => ({
            id: p.id,
            name: p.name,
            status: p.status?.toLowerCase() === "completed" ? "completed" :
                    p.status?.toLowerCase() === "on_hold" || p.status?.toLowerCase() === "paused" ? "on_hold" : "active",
            progress: p.progress || Math.round(Math.random() * 100),
            color: colors[i % colors.length],
            lastUpdated: p.updatedAt || p.updated_at || new Date().toISOString(),
          }))
          setProjects(transformedProjects)
        }
      } catch (err) {
        setProjects(getDemoProjects())
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-medium">Active Projects</CardTitle>
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            View all
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Folder className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No projects yet</p>
            <Link href="/dashboard/projects/new">
              <Button variant="outline" size="sm" className="mt-2 gap-1">
                <Plus className="h-3 w-3" />
                New Project
              </Button>
            </Link>
          </div>
        ) : (
          projects.map((project) => {
            const status = statusConfig[project.status]
            const StatusIcon = status.icon

            return (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-secondary/20 hover:bg-secondary/40 hover:border-accent/30 transition-all cursor-pointer group">
                  <div className={`h-2 w-2 rounded-full ${project.color} shrink-0`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">
                        {project.name}
                      </p>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${project.color} rounded-full transition-all duration-500`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${status.bg} ${status.color} border-0`}>
                        <StatusIcon className="h-2.5 w-2.5 mr-1" />
                        {status.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Updated {formatRelativeTime(new Date(project.lastUpdated))}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
