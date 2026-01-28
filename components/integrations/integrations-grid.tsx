"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, ExternalLink, CheckCircle2 } from "lucide-react"

const categories = [
  { id: "all", labelKey: "categories.all" },
  { id: "productivity", labelKey: "categories.productivity" },
  { id: "analytics", labelKey: "categories.analytics" },
  { id: "advertising", labelKey: "categories.advertising" },
  { id: "crm", labelKey: "categories.crm" },
  { id: "data", labelKey: "categories.data" },
]

const integrations = [
  {
    id: "google-docs",
    name: "Google Docs",
    description: "Export reports and briefs directly to Google Docs",
    icon: "/google-docs-logo.png",
    category: "productivity",
    popular: true,
    connected: false,
  },
  {
    id: "google-slides",
    name: "Google Slides",
    description: "Generate presentations in Google Slides format",
    icon: "/google-slides-logo.jpg",
    category: "productivity",
    popular: true,
    connected: true,
  },
  {
    id: "powerpoint",
    name: "Microsoft PowerPoint",
    description: "Export presentations to PowerPoint format",
    icon: "/powerpoint-logo.jpg",
    category: "productivity",
    popular: true,
    connected: false,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Sync insights and reports to Notion workspaces",
    icon: "/notion-logo.png",
    category: "productivity",
    popular: true,
    connected: false,
  },
  {
    id: "tableau",
    name: "Tableau",
    description: "Publish dashboards and visualizations to Tableau",
    icon: "/tableau-logo.png",
    category: "analytics",
    popular: true,
    connected: true,
  },
  {
    id: "power-bi",
    name: "Power BI",
    description: "Connect data sources to Microsoft Power BI",
    icon: "/power-bi-logo.png",
    category: "analytics",
    popular: false,
    connected: false,
  },
  {
    id: "looker",
    name: "Looker",
    description: "Integrate with Google Looker for advanced analytics",
    icon: "/looker-logo.png",
    category: "analytics",
    popular: false,
    connected: false,
  },
  {
    id: "meta-ads",
    name: "Meta Ads Manager",
    description: "Push audience segments directly to Meta campaigns",
    icon: "/meta-logo-abstract.png",
    category: "advertising",
    popular: true,
    connected: false,
  },
  {
    id: "dv360",
    name: "Display & Video 360",
    description: "Export segments to Google DV360 for programmatic",
    icon: "/dv360-logo.jpg",
    category: "advertising",
    popular: true,
    connected: false,
  },
  {
    id: "trade-desk",
    name: "The Trade Desk",
    description: "Activate audiences on The Trade Desk DSP",
    icon: "/trade-desk-logo.jpg",
    category: "advertising",
    popular: false,
    connected: false,
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Sync insights with Salesforce CRM records",
    icon: "/salesforce-logo.png",
    category: "crm",
    popular: true,
    connected: false,
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Connect with HubSpot for marketing automation",
    icon: "/hubspot-logo.png",
    category: "crm",
    popular: true,
    connected: false,
  },
  {
    id: "snowflake",
    name: "Snowflake",
    description: "Export data directly to Snowflake data warehouse",
    icon: "/abstract-geometric-snowflake.png",
    category: "data",
    popular: true,
    connected: false,
  },
  {
    id: "bigquery",
    name: "Google BigQuery",
    description: "Stream data to BigQuery for advanced analysis",
    icon: "/bigquery-logo.png",
    category: "data",
    popular: true,
    connected: false,
  },
  {
    id: "aws-s3",
    name: "Amazon S3",
    description: "Store exports and backups in AWS S3 buckets",
    icon: "/aws-s3-logo.jpg",
    category: "data",
    popular: false,
    connected: false,
  },
]

export function IntegrationsGrid() {
  const t = useTranslations("dashboard.integrations.available")
  const tIntegrations = useTranslations("dashboard.integrations.integrations")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Map integration IDs to translation keys
  const integrationKeyMap: Record<string, string> = {
    "google-docs": "googleDocs",
    "google-slides": "googleSlides",
    "powerpoint": "powerpoint",
    "notion": "notion",
    "tableau": "tableau",
    "power-bi": "powerBi",
    "looker": "looker",
    "meta-ads": "metaAds",
    "dv360": "dv360",
    "trade-desk": "tradeDesk",
    "salesforce": "salesforce",
    "hubspot": "hubspot",
    "snowflake": "snowflake",
    "bigquery": "bigquery",
    "aws-s3": "awsS3",
  }

  // Helper function to get integration name
  const getIntegrationName = (id: string): string => {
    const key = integrationKeyMap[id] || id
    try {
      const translated = (tIntegrations as any)(`${key}.name`)
      return translated && translated !== `${key}.name` ? translated : integrations.find(i => i.id === id)?.name || id
    } catch {
      return integrations.find(i => i.id === id)?.name || id
    }
  }

  // Helper function to get integration description
  const getIntegrationDescription = (id: string): string => {
    const key = integrationKeyMap[id] || id
    try {
      const translated = (tIntegrations as any)(`${key}.description`)
      return translated && translated !== `${key}.description` ? translated : integrations.find(i => i.id === id)?.description || ""
    } catch {
      return integrations.find(i => i.id === id)?.description || ""
    }
  }

  const filteredIntegrations =
    selectedCategory === "all" ? integrations : integrations.filter((i) => i.category === selectedCategory)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <span className="text-sm text-muted-foreground">{t("count", { count: integrations.length })}</span>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
        <TabsList>
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {t(category.labelKey)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredIntegrations.map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function IntegrationCard({
  integration,
}: {
  integration: (typeof integrations)[0]
}) {
  const t = useTranslations("dashboard.integrations.available")
  const tIntegrations = useTranslations("dashboard.integrations.integrations")
  const [isOpen, setIsOpen] = useState(false)

  // Map integration IDs to translation keys
  const integrationKeyMap: Record<string, string> = {
    "google-docs": "googleDocs",
    "google-slides": "googleSlides",
    "powerpoint": "powerpoint",
    "notion": "notion",
    "tableau": "tableau",
    "power-bi": "powerBi",
    "looker": "looker",
    "meta-ads": "metaAds",
    "dv360": "dv360",
    "trade-desk": "tradeDesk",
    "salesforce": "salesforce",
    "hubspot": "hubspot",
    "snowflake": "snowflake",
    "bigquery": "bigquery",
    "aws-s3": "awsS3",
  }

  // Helper function to get integration name
  const getIntegrationName = (id: string): string => {
    const key = integrationKeyMap[id] || id
    try {
      const translated = (tIntegrations as any)(`${key}.name`)
      return translated && translated !== `${key}.name` ? translated : integration.name
    } catch {
      return integration.name
    }
  }

  // Helper function to get integration description
  const getIntegrationDescription = (id: string): string => {
    const key = integrationKeyMap[id] || id
    try {
      const translated = (tIntegrations as any)(`${key}.description`)
      return translated && translated !== `${key}.description` ? translated : integration.description
    } catch {
      return integration.description
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Card className="group hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
              <img
                src={integration.icon || "/placeholder.svg"}
                alt={getIntegrationName(integration.id)}
                className="h-10 w-10 object-contain"
              />
            </div>
            {integration.connected && (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                {t("connected")}
              </Badge>
            )}
            {integration.popular && !integration.connected && <Badge variant="secondary">{t("popular")}</Badge>}
          </div>

          <h3 className="font-semibold mb-1">{getIntegrationName(integration.id)}</h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{getIntegrationDescription(integration.id)}</p>

          <DialogTrigger asChild>
            <Button variant={integration.connected ? "outline" : "default"} size="sm" className="w-full">
              {integration.connected ? (
                <>{t("manage")}</>
              ) : (
                <>
                  <Plus className="mr-2 h-3 w-3" />
                  {t("connect")}
                </>
              )}
            </Button>
          </DialogTrigger>
        </CardContent>
      </Card>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
              <img
                src={integration.icon || "/placeholder.svg"}
                alt={getIntegrationName(integration.id)}
                className="h-10 w-10 object-contain"
              />
            </div>
            <div>
              <DialogTitle>{getIntegrationName(integration.id)}</DialogTitle>
              <DialogDescription>{getIntegrationDescription(integration.id)}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t("features.title")}</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {t("features.autoSync")}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {t("features.realTimeExport")}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {t("features.secureOAuth")}
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-2">
            <Button className="flex-1">{integration.connected ? t("reconnect") : t("connect")}</Button>
            <Button variant="outline" size="icon">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
