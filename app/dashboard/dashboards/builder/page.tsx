"use client"

import { useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AdvancedDashboardBuilder } from "@/components/dashboard/advanced-dashboard-builder"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function DashboardBuilderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dashboardId = searchParams.get("id")
  const [_isSaving, setIsSaving] = useState(false)

  // Handle save
  const handleSave = useCallback(async (state: any) => {
    setIsSaving(true)
    try {
      const method = dashboardId ? "PUT" : "POST"
      const url = dashboardId
        ? `/api/v1/dashboards/${dashboardId}`
        : "/api/v1/dashboards"

      const widgetsArray = Array.isArray(state.widgets) ? state.widgets : []
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: state.name,
          description: state.description,
          widgets: widgetsArray.map((w: any) => ({
            id: w.id,
            type: w.type,
            title: w.config?.title,
            x: w.x,
            y: w.y,
            width: w.width,
            height: w.height,
            config: w.config,
          })),
          gridColumns: state.gridColumns,
          gridRows: state.gridRows,
        }),
      })

      if (response.ok) {
        toast.success("Dashboard saved successfully!")
        if (!dashboardId) {
          const data = await response.json()
          router.push(`/dashboard/dashboards/${data.id}`)
        }
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      console.error("Save failed:", error)
      toast.error("Failed to save dashboard")
    } finally {
      setIsSaving(false)
    }
  }, [dashboardId, router])

  // Handle export
  const handleExport = useCallback(async (format: string, state: any) => {
    try {
      // For now, export as JSON
      const exportData = {
        dashboard: {
          id: state.id,
          name: state.name,
          description: state.description,
          gridColumns: state.gridColumns,
          gridRows: state.gridRows,
        },
        widgets: state.widgets,
        exportedAt: new Date().toISOString(),
      }

      const content = JSON.stringify(exportData, null, 2)
      const blob = new Blob([content], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `dashboard-${state.name.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      toast.success(`Dashboard exported as ${format.toUpperCase()}`)
    } catch (error) {
      console.error("Export failed:", error)
      toast.error("Failed to export dashboard")
    }
  }, [])

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/dashboards">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="font-semibold">
            {dashboardId ? "Edit Dashboard" : "Create New Dashboard"}
          </h1>
        </div>
        <div className="text-sm text-muted-foreground">
          Advanced Dashboard Builder with Drag & Drop
        </div>
      </div>

      {/* Builder */}
      <div className="flex-1 overflow-hidden">
        <AdvancedDashboardBuilder
          initialState={
            dashboardId
              ? undefined // TODO: Load from API
              : {
                  name: "New Dashboard",
                  description: "Add widgets by clicking the 'Add Widget' button",
                  widgets: [],
                  gridColumns: 12,
                  gridRows: 8,
                }
          }
          onSave={handleSave}
          onExport={handleExport}
        />
      </div>
    </div>
  )
}
