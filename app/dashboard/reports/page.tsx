"use client"

import { Suspense, useState } from "react"
import { ReportsHeader } from "@/components/reports/reports-header"
import { ReportsFilters } from "@/components/reports/reports-filters"
import { ReportsGrid } from "@/components/reports/reports-grid"
import { ReportStats } from "@/components/reports/report-stats"
import { ReportTemplates } from "@/components/reports/report-templates"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageTracker } from "@/components/tracking/PageTracker"

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("all")

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageTracker pageName="Reports List" metadata={{ activeTab }} />
      <ReportsHeader />
      <ReportStats />
      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="shared">Shared with Me</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <ReportsFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedTypes={selectedTypes}
            onTypesChange={setSelectedTypes}
            selectedStatuses={selectedStatuses}
            onStatusesChange={setSelectedStatuses}
          />
          <Suspense fallback={<ReportsGridSkeleton />}>
            <ReportsGrid
              searchQuery={searchQuery}
              selectedTypes={selectedTypes}
              selectedStatuses={selectedStatuses}
            />
          </Suspense>
        </TabsContent>
        <TabsContent value="templates">
          <ReportTemplates />
        </TabsContent>
        <TabsContent value="scheduled">
          <ScheduledReports />
        </TabsContent>
        <TabsContent value="shared">
          <SharedReports />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ReportsGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-64 rounded-lg" />
      ))}
    </div>
  )
}

function ScheduledReports() {
  return (
    <div className="space-y-4">
      <ScheduledReportCard
        title="Weekly Audience Pulse"
        schedule="Every Monday, 9:00 AM"
        nextRun="Dec 9, 2024"
        recipients={["team@company.com"]}
        type="dashboard"
        status="active"
      />
      <ScheduledReportCard
        title="Monthly Market Overview"
        schedule="1st of every month"
        nextRun="Jan 1, 2025"
        recipients={["executives@company.com", "strategy@company.com"]}
        type="presentation"
        status="active"
      />
      <ScheduledReportCard
        title="Quarterly Trend Report"
        schedule="Every quarter"
        nextRun="Jan 1, 2025"
        recipients={["all-hands@company.com"]}
        type="pdf"
        status="paused"
      />
    </div>
  )
}

function ScheduledReportCard({
  title,
  schedule,
  nextRun,
  recipients,
  type,
  status,
}: {
  title: string
  schedule: string
  nextRun: string
  recipients: string[]
  type: string
  status: "active" | "paused"
}) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-4">
        <div className={`w-2 h-2 rounded-full ${status === "active" ? "bg-emerald-500" : "bg-amber-500"}`} />
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {schedule} - Next: {nextRun}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{recipients.length} recipient(s)</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-1 bg-muted rounded capitalize">{type}</span>
        <span
          className={`text-xs px-2 py-1 rounded capitalize ${status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}
        >
          {status}
        </span>
      </div>
    </div>
  )
}

function SharedReports() {
  return (
    <div className="space-y-4">
      <SharedReportCard
        title="APAC Consumer Trends 2024"
        sharedBy="Alex Johnson"
        sharedAt="Dec 2, 2024"
        permission="view"
      />
      <SharedReportCard
        title="Competitor Benchmark Analysis"
        sharedBy="Maria Garcia"
        sharedAt="Nov 28, 2024"
        permission="edit"
      />
      <SharedReportCard
        title="Gen Z Brand Perception Study"
        sharedBy="Chris Lee"
        sharedAt="Nov 15, 2024"
        permission="comment"
      />
    </div>
  )
}

function SharedReportCard({
  title,
  sharedBy,
  sharedAt,
  permission,
}: {
  title: string
  sharedBy: string
  sharedAt: string
  permission: "view" | "edit" | "comment"
}) {
  const permissionColors = {
    view: "bg-blue-500/10 text-blue-500",
    edit: "bg-emerald-500/10 text-emerald-500",
    comment: "bg-amber-500/10 text-amber-500",
  }
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors cursor-pointer">
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">
          Shared by {sharedBy} on {sharedAt}
        </p>
      </div>
      <span className={`text-xs px-2 py-1 rounded capitalize ${permissionColors[permission]}`}>Can {permission}</span>
    </div>
  )
}
