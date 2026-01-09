import { AnalyticsHeader } from "@/components/analytics/analytics-header"
import { AnalyticsOverview } from "@/components/analytics/analytics-overview"
import { UsageCharts } from "@/components/analytics/usage-charts"
import { AgentPerformance } from "@/components/analytics/agent-performance"
import { TopQueries } from "@/components/analytics/top-queries"
import { TeamActivity } from "@/components/analytics/team-activity"

export default function AnalyticsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <AnalyticsHeader />
      <AnalyticsOverview />
      <div className="grid gap-6 lg:grid-cols-2">
        <UsageCharts />
        <AgentPerformance />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <TopQueries />
        <TeamActivity />
      </div>
    </div>
  )
}
