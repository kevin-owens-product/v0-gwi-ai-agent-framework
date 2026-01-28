"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Settings, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"

const connectedIntegrations = [
  {
    id: "google-workspace",
    name: "Google Workspace",
    description: "Connected to your organization's Google account",
    icon: "/google-logo.png",
    status: "healthy",
    lastSync: "2 minutes ago",
    features: ["Docs", "Sheets", "Slides", "Drive"],
    enabled: true,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Notifications to #insights-team channel",
    icon: "/slack-logo.png",
    status: "healthy",
    lastSync: "5 minutes ago",
    features: ["Notifications", "Commands"],
    enabled: true,
  },
  {
    id: "tableau",
    name: "Tableau",
    description: "Publishing dashboards to Tableau Server",
    icon: "/tableau-logo.png",
    status: "warning",
    lastSync: "1 hour ago",
    features: ["Publish", "Embed"],
    enabled: true,
  },
]

export function ConnectedIntegrations() {
  const t = useTranslations("dashboard.integrations.connected")
  const tIntegrations = useTranslations("dashboard.integrations.connectedIntegrations")

  // Map integration IDs to translation keys
  const integrationKeyMap: Record<string, string> = {
    "google-workspace": "googleWorkspace",
    "slack": "slack",
    "tableau": "tableau",
  }

  // Helper function to get integration name
  const getIntegrationName = (id: string): string => {
    const key = integrationKeyMap[id] || id
    try {
      const translated = (tIntegrations as any)(`${key}.name`)
      return translated && translated !== `${key}.name` ? translated : connectedIntegrations.find(i => i.id === id)?.name || id
    } catch {
      return connectedIntegrations.find(i => i.id === id)?.name || id
    }
  }

  // Helper function to get integration description
  const getIntegrationDescription = (id: string): string => {
    const key = integrationKeyMap[id] || id
    try {
      const translated = (tIntegrations as any)(`${key}.description`)
      return translated && translated !== `${key}.description` ? translated : connectedIntegrations.find(i => i.id === id)?.description || ""
    } catch {
      return connectedIntegrations.find(i => i.id === id)?.description || ""
    }
  }

  // Helper function to get feature name
  const getFeatureName = (integrationId: string, feature: string): string => {
    const key = integrationKeyMap[integrationId] || integrationId
    const featureKey = feature.toLowerCase()
    try {
      const translated = (tIntegrations as any)(`${key}.features.${featureKey}`)
      return translated && translated !== `${key}.features.${featureKey}` ? translated : feature
    } catch {
      return feature
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <span className="text-sm text-muted-foreground">{t("activeCount", { count: connectedIntegrations.length })}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {connectedIntegrations.map((integration) => (
          <Card key={integration.id} className="relative">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    <img
                      src={integration.icon || "/placeholder.svg"}
                      alt={getIntegrationName(integration.id)}
                      className="h-8 w-8 object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {getIntegrationName(integration.id)}
                      {integration.status === "healthy" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground">{t("lastSync", { time: integration.lastSync })}</p>
                  </div>
                </div>
                <Switch checked={integration.enabled} />
              </div>

              <p className="text-sm text-muted-foreground mb-4">{getIntegrationDescription(integration.id)}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {integration.features.map((feature) => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {getFeatureName(integration.id, feature)}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Settings className="mr-2 h-3 w-3" />
                  {t("configure")}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
