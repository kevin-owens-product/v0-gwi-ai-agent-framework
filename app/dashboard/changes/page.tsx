"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  History,
  ArrowLeftRight,
  Sparkles,
  Activity,
  Bell,
  RefreshCw,
} from "lucide-react"
import {
  ChangeTimeline,
  WhatsNewWidget,
  ComparisonView,
  EvolutionChart,
} from "@/components/change-tracking"

export default function ChangesPage() {
  const [selectedTab, setSelectedTab] = useState("timeline")
  const [compareDialog, setCompareDialog] = useState<{
    entityType: string
    entityId: string
    entityName?: string
  } | null>(null)
  const [evolutionDialog, setEvolutionDialog] = useState<{
    analysisType: string
    referenceId: string
    title?: string
  } | null>(null)

  const handleViewDetails = (entityType: string, entityId: string) => {
    setCompareDialog({ entityType, entityId })
  }

  return (
    <div className="container max-w-7xl py-8 space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Changes</h1>
          <p className="text-muted-foreground mt-1">
            Track what&apos;s changed, what&apos;s new, and how your analyses have evolved
          </p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* What's New Widget */}
      <WhatsNewWidget
        variant="expanded"
        onViewAll={() => setSelectedTab("timeline")}
        onViewItem={(entityType, entityId) =>
          setCompareDialog({ entityType, entityId })
        }
      />

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="timeline" className="gap-2">
            <History className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="compare" className="gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            Compare
          </TabsTrigger>
          <TabsTrigger value="evolution" className="gap-2">
            <Activity className="h-4 w-4" />
            Evolution
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="h-4 w-4" />
            Alerts
          </TabsTrigger>
        </TabsList>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="mt-6">
          <ChangeTimeline
            limit={100}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>

        {/* Compare Tab */}
        <TabsContent value="compare" className="mt-6">
          <div className="grid gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <ArrowLeftRight className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold">Compare Versions</h2>
                  <p className="text-sm text-muted-foreground">
                    Select an entity to compare its versions
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { type: "audience", label: "Audiences", icon: "👥" },
                  { type: "crosstab", label: "Crosstabs", icon: "📊" },
                  { type: "insight", label: "Insights", icon: "💡" },
                  { type: "chart", label: "Charts", icon: "📈" },
                  { type: "report", label: "Reports", icon: "📄" },
                  { type: "dashboard", label: "Dashboards", icon: "🎛️" },
                ].map((item) => (
                  <Card
                    key={item.type}
                    className="p-4 cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() =>
                      setCompareDialog({
                        entityType: item.type,
                        entityId: "",
                        entityName: undefined,
                      })
                    }
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <h3 className="font-medium">{item.label}</h3>
                        <p className="text-xs text-muted-foreground">
                          Compare versions
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {compareDialog && compareDialog.entityId && (
              <ComparisonView
                entityType={compareDialog.entityType}
                entityId={compareDialog.entityId}
                entityName={compareDialog.entityName}
              />
            )}
          </div>
        </TabsContent>

        {/* Evolution Tab */}
        <TabsContent value="evolution" className="mt-6">
          <div className="grid gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold">Analysis Evolution</h2>
                  <p className="text-sm text-muted-foreground">
                    Track how your AI-generated analyses have evolved over time
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { type: "brand_health", label: "Brand Health", icon: "🏥" },
                  { type: "audience_insight", label: "Audience Insights", icon: "👥" },
                  { type: "market_analysis", label: "Market Analysis", icon: "📊" },
                  { type: "competitor_analysis", label: "Competitor Analysis", icon: "⚔️" },
                  { type: "trend_analysis", label: "Trend Analysis", icon: "📈" },
                  { type: "crosstab", label: "Crosstab Analysis", icon: "🔢" },
                ].map((item) => (
                  <Card
                    key={item.type}
                    className="p-4 cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() =>
                      setEvolutionDialog({
                        analysisType: item.type,
                        referenceId: "",
                        title: item.label,
                      })
                    }
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <h3 className="font-medium">{item.label}</h3>
                        <p className="text-xs text-muted-foreground">
                          View evolution
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {evolutionDialog && evolutionDialog.referenceId && (
              <EvolutionChart
                analysisType={evolutionDialog.analysisType}
                referenceId={evolutionDialog.referenceId}
                title={evolutionDialog.title}
              />
            )}
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="mt-6">
          <AlertsSection />
        </TabsContent>
      </Tabs>

      {/* Compare Dialog */}
      <Dialog
        open={!!compareDialog && !compareDialog.entityId}
        onOpenChange={() => setCompareDialog(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Select{" "}
              {compareDialog?.entityType
                ? compareDialog.entityType.charAt(0).toUpperCase() +
                  compareDialog.entityType.slice(1)
                : "Entity"}{" "}
              to Compare
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Enter the ID of the {compareDialog?.entityType} you want to compare
              versions of:
            </p>
            <input
              type="text"
              placeholder={`Enter ${compareDialog?.entityType} ID...`}
              className="w-full px-3 py-2 border rounded-md"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value) {
                  setCompareDialog({
                    entityType: compareDialog!.entityType,
                    entityId: e.currentTarget.value,
                  })
                }
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Evolution Dialog */}
      <Dialog
        open={!!evolutionDialog && !evolutionDialog.referenceId}
        onOpenChange={() => setEvolutionDialog(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Select Analysis to View Evolution
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Enter the reference ID of the {evolutionDialog?.analysisType?.replace(/_/g, " ")} analysis:
            </p>
            <input
              type="text"
              placeholder="Enter reference ID..."
              className="w-full px-3 py-2 border rounded-md"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value) {
                  setEvolutionDialog({
                    analysisType: evolutionDialog!.analysisType,
                    referenceId: e.currentTarget.value,
                    title: evolutionDialog?.title,
                  })
                }
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Alerts Section Component
function AlertsSection() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useState(() => {
    fetchAlerts()
  })

  async function fetchAlerts() {
    setLoading(true)
    try {
      const response = await fetch("/api/v1/changes/alerts?limit=50")
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts)
      }
    } catch (error) {
      console.error("Failed to fetch alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(alertId: string) {
    try {
      await fetch("/api/v1/changes/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markRead", alertId }),
      })
      fetchAlerts()
    } catch (error) {
      console.error("Failed to mark alert as read:", error)
    }
  }

  async function dismissAlert(alertId: string) {
    try {
      await fetch("/api/v1/changes/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dismiss", alertId }),
      })
      fetchAlerts()
    } catch (error) {
      console.error("Failed to dismiss alert:", error)
    }
  }

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <RefreshCw className="h-8 w-8 mx-auto text-muted-foreground animate-spin mb-4" />
        <p>Loading alerts...</p>
      </Card>
    )
  }

  if (alerts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-medium mb-2">No Alerts</h3>
        <p className="text-sm text-muted-foreground">
          You have no unread change alerts.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Change Alerts
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await fetch("/api/v1/changes/alerts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "markAllRead" }),
            })
            fetchAlerts()
          }}
        >
          Mark All as Read
        </Button>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <Card
            key={alert.id}
            className={`p-4 ${
              alert.severity === "CRITICAL"
                ? "border-l-4 border-l-red-500"
                : alert.severity === "WARNING"
                ? "border-l-4 border-l-amber-500"
                : "border-l-4 border-l-blue-500"
            } ${alert.isRead ? "opacity-60" : ""}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{alert.title}</h4>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      alert.severity === "CRITICAL"
                        ? "bg-red-100 text-red-700"
                        : alert.severity === "WARNING"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {alert.message}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(alert.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!alert.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(alert.id)}
                  >
                    Mark Read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissAlert(alert.id)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
