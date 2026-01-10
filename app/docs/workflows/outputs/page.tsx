import Link from "next/link"
import { ArrowLeft, FileOutput, Table, BarChart3, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function WorkflowOutputsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <Link href="/docs">
          <Button variant="ghost" size="sm" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Docs
          </Button>
        </Link>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <FileOutput className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">Workflow Outputs</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Configure and customize how your workflows deliver results and insights.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Output Types</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    PDF, PowerPoint, or interactive HTML reports.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-500" />
                    Dashboards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Live dashboards with real-time data updates.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Table className="h-5 w-5 text-yellow-500" />
                    Data Exports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    CSV, Excel, or JSON data files.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileOutput className="h-5 w-5 text-purple-500" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Email, Slack, or webhook notifications.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Output Configuration</h2>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground">{`// Workflow output configuration
{
  "outputs": [
    {
      "type": "report",
      "format": "pdf",
      "template": "executive_summary",
      "sections": ["overview", "trends", "recommendations"],
      "branding": {
        "logo": true,
        "colors": "brand_palette"
      }
    },
    {
      "type": "dashboard",
      "id": "weekly_metrics",
      "refresh": "auto",
      "widgets": ["kpis", "trends", "comparisons"]
    },
    {
      "type": "data_export",
      "format": "csv",
      "fields": ["date", "metric", "value", "segment"],
      "compression": "gzip"
    },
    {
      "type": "notification",
      "channel": "slack",
      "template": "insight_alert",
      "conditions": {
        "trigger": "significant_change",
        "threshold": 10
      }
    }
  ]
}`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Report Templates</h2>
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Executive Summary</h3>
                  <p className="text-muted-foreground mb-2">
                    High-level overview designed for leadership and stakeholders.
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                    <li>Key metrics and KPIs at a glance</li>
                    <li>Trend highlights and significant changes</li>
                    <li>Top 3-5 strategic recommendations</li>
                    <li>Risk alerts and opportunities</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Detailed Analysis</h3>
                  <p className="text-muted-foreground mb-2">
                    Comprehensive report with full data breakdowns.
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                    <li>Complete metric tables and charts</li>
                    <li>Segment-by-segment breakdowns</li>
                    <li>Statistical analysis and confidence intervals</li>
                    <li>Methodology and data source notes</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Competitive Intel</h3>
                  <p className="text-muted-foreground mb-2">
                    Focused on competitive positioning and market share.
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                    <li>Competitor scorecards and rankings</li>
                    <li>Share of voice analysis</li>
                    <li>Comparative trend charts</li>
                    <li>Competitive threats and opportunities</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Delivery Options</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Scheduled Delivery</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-2">
                    Automatically deliver outputs on a recurring schedule.
                  </p>
                  <div className="rounded bg-muted p-3 font-mono text-sm">
                    <pre className="text-foreground">{`"schedule": {
  "frequency": "weekly",
  "day": "monday",
  "time": "09:00",
  "timezone": "America/New_York"
}`}</pre>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Event-Triggered</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-2">
                    Deliver outputs when specific conditions are met.
                  </p>
                  <div className="rounded bg-muted p-3 font-mono text-sm">
                    <pre className="text-foreground">{`"trigger": {
  "type": "threshold",
  "metric": "brand_health",
  "condition": "drops_below",
  "value": 70
}`}</pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Integration Destinations</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Email:</strong> Send reports directly to stakeholder inboxes</li>
              <li><strong>Slack:</strong> Post summaries and alerts to channels</li>
              <li><strong>Microsoft Teams:</strong> Integrate with Teams workflows</li>
              <li><strong>Cloud Storage:</strong> Save to S3, Google Cloud, or Azure Blob</li>
              <li><strong>Data Warehouses:</strong> Push to Snowflake, BigQuery, or Redshift</li>
              <li><strong>Webhooks:</strong> Send to any HTTP endpoint</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Related Documentation</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/docs/workflows/triggers">
                <Button variant="outline">Workflow Triggers</Button>
              </Link>
              <Link href="/docs/workflows/orchestration">
                <Button variant="outline">Workflow Orchestration</Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
