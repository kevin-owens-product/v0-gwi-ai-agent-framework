import { BrandTrackingHeader } from "@/components/brand-tracking/brand-tracking-header"
import { BrandTrackingStats } from "@/components/brand-tracking/brand-tracking-stats"
import { BrandTrackingGrid } from "@/components/brand-tracking/brand-tracking-grid"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BrandTrackingPageTracker } from "./page-client"

export default function BrandTrackingPage() {
  return (
    <div className="space-y-6">
      <BrandTrackingPageTracker />
      <BrandTrackingHeader />
      <BrandTrackingStats />

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Brands</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
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
