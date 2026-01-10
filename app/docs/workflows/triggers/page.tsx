import Link from "next/link"
import { ArrowLeft, Zap, Clock, Bell, Webhook } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function WorkflowTriggersPage() {
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
            <Zap className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">Workflow Triggers</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Configure how and when your workflows automatically execute.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Trigger Types</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Run at specific times or intervals using cron expressions.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-yellow-500" />
                    Event
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Trigger when specific events occur in the platform.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Webhook className="h-5 w-5 text-green-500" />
                    Webhook
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Trigger from external systems via HTTP webhook.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-500" />
                    Manual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Start workflows manually from the UI or API.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Schedule Triggers</h2>
            <p className="text-muted-foreground mb-4">
              Use cron expressions or simple intervals to schedule workflow execution.
            </p>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto mb-4">
              <pre className="text-foreground">{`// Schedule trigger examples
{
  "trigger": {
    "type": "schedule",
    // Cron expression: Every Monday at 9am EST
    "cron": "0 9 * * 1",
    "timezone": "America/New_York"
  }
}

// Simple interval
{
  "trigger": {
    "type": "schedule",
    "interval": "6h",  // Every 6 hours
    "startTime": "2024-01-01T00:00:00Z"
  }
}

// Multiple schedules
{
  "trigger": {
    "type": "schedule",
    "schedules": [
      { "cron": "0 9 * * 1-5", "label": "Weekday morning" },
      { "cron": "0 6 * * 0", "label": "Sunday early" }
    ]
  }
}`}</pre>
            </div>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground mb-2">Common Cron Patterns</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-semibold text-foreground">Pattern</th>
                        <th className="text-left py-2 font-semibold text-foreground">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b"><td className="py-2 font-mono">0 9 * * 1</td><td className="py-2">Every Monday at 9am</td></tr>
                      <tr className="border-b"><td className="py-2 font-mono">0 */6 * * *</td><td className="py-2">Every 6 hours</td></tr>
                      <tr className="border-b"><td className="py-2 font-mono">0 9 1 * *</td><td className="py-2">First of month at 9am</td></tr>
                      <tr className="border-b"><td className="py-2 font-mono">0 9 * * 1-5</td><td className="py-2">Weekdays at 9am</td></tr>
                      <tr><td className="py-2 font-mono">*/15 * * * *</td><td className="py-2">Every 15 minutes</td></tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Event Triggers</h2>
            <p className="text-muted-foreground mb-4">
              React to events within the platform to automate responses.
            </p>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground">{`// Event trigger examples
{
  "trigger": {
    "type": "event",
    "event": "brand_health.threshold_breach",
    "conditions": {
      "metric": "nps",
      "operator": "lt",
      "value": 40
    }
  }
}

// Data source update event
{
  "trigger": {
    "type": "event",
    "event": "data_source.sync_complete",
    "source": "brand_tracker_q4"
  }
}

// Competitive alert event
{
  "trigger": {
    "type": "event",
    "event": "competitive.significant_change",
    "competitors": ["competitor_a", "competitor_b"],
    "threshold": 10  // 10% change
  }
}`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Webhook Triggers</h2>
            <p className="text-muted-foreground mb-4">
              Allow external systems to trigger workflows via HTTP POST requests.
            </p>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground">{`// Webhook trigger configuration
{
  "trigger": {
    "type": "webhook",
    "authentication": {
      "type": "hmac",
      "secret": "{{env.WEBHOOK_SECRET}}"
    },
    "validation": {
      "required_fields": ["event_type", "payload"],
      "schema": "webhook_payload_v1"
    }
  }
}

// Incoming webhook request
POST /api/v1/workflows/{workflow_id}/trigger
Content-Type: application/json
X-Webhook-Signature: sha256=...

{
  "event_type": "campaign_launched",
  "payload": {
    "campaign_id": "camp_123",
    "brand": "Nike",
    "launch_date": "2024-01-15"
  }
}`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Trigger Conditions</h2>
            <p className="text-muted-foreground mb-4">
              Add conditions to control when triggers actually execute the workflow.
            </p>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground">{`{
  "trigger": {
    "type": "schedule",
    "cron": "0 9 * * 1",
    "conditions": {
      "all": [
        { "check": "data_freshness", "maxAge": "24h" },
        { "check": "business_day", "calendar": "US" },
        { "check": "not_holiday", "calendar": "US" }
      ]
    },
    "skip": {
      "action": "log",
      "notify": false
    }
  }
}`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Trigger Management</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Enable/Disable:</strong> Temporarily pause triggers without deleting them</li>
              <li><strong>Execution History:</strong> View logs of all trigger executions</li>
              <li><strong>Rate Limiting:</strong> Prevent excessive executions with rate limits</li>
              <li><strong>Deduplication:</strong> Skip duplicate trigger events within a time window</li>
              <li><strong>Monitoring:</strong> Alert on failed triggers or missed schedules</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Related Documentation</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/docs/workflows/orchestration">
                <Button variant="outline">Workflow Orchestration</Button>
              </Link>
              <Link href="/docs/workflows/outputs">
                <Button variant="outline">Workflow Outputs</Button>
              </Link>
              <Link href="/docs/api/webhooks">
                <Button variant="outline">Webhooks API</Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
