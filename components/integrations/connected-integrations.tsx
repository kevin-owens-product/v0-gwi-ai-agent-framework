"use client"

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
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Connected Integrations</h2>
        <span className="text-sm text-muted-foreground">{connectedIntegrations.length} active</span>
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
                      alt={integration.name}
                      className="h-8 w-8 object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {integration.name}
                      {integration.status === "healthy" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground">Last sync: {integration.lastSync}</p>
                  </div>
                </div>
                <Switch checked={integration.enabled} />
              </div>

              <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {integration.features.map((feature) => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Settings className="mr-2 h-3 w-3" />
                  Configure
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
