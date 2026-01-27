import { BrandTrackingHeader } from "@/components/brand-tracking/brand-tracking-header"
import { BrandTrackingStats } from "@/components/brand-tracking/brand-tracking-stats"
import { BrandTrackingGrid } from "@/components/brand-tracking/brand-tracking-grid"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BrandTrackingPageTracker } from "./page-client"
import { getTranslations } from "@/lib/i18n/server"

export default async function BrandTrackingPage() {
  const t = await getTranslations("dashboard.brandTracking")
  return (
    <div className="space-y-6">
      <BrandTrackingPageTracker pageName={t("pageTracker")} />
      <BrandTrackingHeader />
      <BrandTrackingStats />

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">{t("tabs.allBrands")}</TabsTrigger>
          <TabsTrigger value="active">{t("tabs.active")}</TabsTrigger>
          <TabsTrigger value="paused">{t("tabs.paused")}</TabsTrigger>
          <TabsTrigger value="draft">{t("tabs.draft")}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <BrandTrackingGrid />
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <BrandTrackingGrid />
        </TabsContent>

        <TabsContent value="paused" className="space-y-4">
          <BrandTrackingGrid />
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          <BrandTrackingGrid />
        </TabsContent>
      </Tabs>
    </div>
  )
}
