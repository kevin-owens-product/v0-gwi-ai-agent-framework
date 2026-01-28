"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
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
  const t = useTranslations("dashboard.changes")
  const tCommon = useTranslations("common")
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
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("description")}
          </p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {tCommon("refresh")}
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
            {t("tabs.timeline")}
          </TabsTrigger>
          <TabsTrigger value="compare" className="gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            {t("tabs.compare")}
          </TabsTrigger>
          <TabsTrigger value="evolution" className="gap-2">
            <Activity className="h-4 w-4" />
            {t("tabs.evolution")}
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="h-4 w-4" />
            {t("tabs.alerts")}
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
                  <h2 className="text-xl font-semibold">{t("compare.title")}</h2>
                  <p className="text-sm text-muted-foreground">
                    {t("compare.description")}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { type: "audience", labelKey: "compare.entities.audiences", icon: "👥" },
                  { type: "crosstab", labelKey: "compare.entities.crosstabs", icon: "📊" },
                  { type: "insight", labelKey: "compare.entities.insights", icon: "💡" },
                  { type: "chart", labelKey: "compare.entities.charts", icon: "📈" },
                  { type: "report", labelKey: "compare.entities.reports", icon: "📄" },
                  { type: "dashboard", labelKey: "compare.entities.dashboards", icon: "🎛️" },
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
                        <h3 className="font-medium">{t(item.labelKey)}</h3>
                        <p className="text-xs text-muted-foreground">
                          {t("compare.compareVersions")}
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
                  <h2 className="text-xl font-semibold">{t("evolution.title")}</h2>
                  <p className="text-sm text-muted-foreground">
                    {t("evolution.description")}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { type: "brand_health", labelKey: "evolution.types.brandHealth", icon: "🏥" },
                  { type: "audience_insight", labelKey: "evolution.types.audienceInsights", icon: "👥" },
                  { type: "market_analysis", labelKey: "evolution.types.marketAnalysis", icon: "📊" },
                  { type: "competitor_analysis", labelKey: "evolution.types.competitorAnalysis", icon: "⚔️" },
                  { type: "trend_analysis", labelKey: "evolution.types.trendAnalysis", icon: "📈" },
                  { type: "crosstab", labelKey: "evolution.types.crosstabAnalysis", icon: "🔢" },
                ].map((item) => (
                  <Card
                    key={item.type}
                    className="p-4 cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() =>
                      setEvolutionDialog({
                        analysisType: item.type,
                        referenceId: "",
                        title: t(item.labelKey),
                      })
                    }
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <h3 className="font-medium">{t(item.labelKey)}</h3>
                        <p className="text-xs text-muted-foreground">
                          {t("evolution.viewEvolution")}
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
              {t("compareDialog.selectTitle", {
                entity: compareDialog?.entityType
                  ? compareDialog.entityType.charAt(0).toUpperCase() + compareDialog.entityType.slice(1)
                  : t("compareDialog.entity")
              })}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              {t("compareDialog.enterIdDescription", { entityType: compareDialog?.entityType ?? "" })}
            </p>
            <input
              type="text"
              placeholder={t("compareDialog.enterIdPlaceholder", { entityType: compareDialog?.entityType ?? "" })}
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
              {t("evolutionDialog.selectTitle")}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              {t("evolutionDialog.enterIdDescription", { analysisType: evolutionDialog?.analysisType?.replace(/_/g, " ") ?? "" })}
            </p>
            <input
              type="text"
              placeholder={t("evolutionDialog.enterIdPlaceholder")}
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
interface Alert {
  id: string
  type: string
  severity: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  metadata?: Record<string, string | number>
}

function AlertsSection() {
  const t = useTranslations("dashboard.changes")
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useState(() => {
    fetchAlerts()
  })

  async function fetchAlerts() {
    setLoading(true)
    try {
      const response = await fetch("/api/v1/changes/alerts?limit=50", {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
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
        credentials: 'include',
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
        credentials: 'include',
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
        <p>{t("alerts.loading")}</p>
      </Card>
    )
  }

  if (alerts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-medium mb-2">{t("alerts.noAlerts")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("alerts.noAlertsDescription")}
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5" />
          {t("alerts.title")}
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
          {t("alerts.markAllRead")}
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
                    {t("alerts.markRead")}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissAlert(alert.id)}
                >
                  {t("alerts.dismiss")}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
