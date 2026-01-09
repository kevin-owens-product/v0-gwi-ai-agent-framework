import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { HeroMetrics } from "@/components/dashboard/hero-metrics"
import { LiveActivityFeed } from "@/components/dashboard/live-activity-feed"
import { AgentOrchestrator } from "@/components/dashboard/agent-orchestrator"
import { InsightsPanel } from "@/components/dashboard/insights-panel"
import { PerformanceCharts } from "@/components/dashboard/performance-charts"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader />
      <HeroMetrics />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <PerformanceCharts />
          <LiveActivityFeed />
        </div>
        <div className="space-y-6">
          <AgentOrchestrator />
          <InsightsPanel />
        </div>
      </div>
    </div>
  )
}
