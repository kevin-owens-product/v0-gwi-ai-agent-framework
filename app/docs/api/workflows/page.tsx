import Link from "next/link"
import { ArrowLeft, Workflow, Play, Pause, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function WorkflowsAPIPage() {
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
            <Workflow className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">Workflows API</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Programmatically create, manage, and execute workflows.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Endpoints Overview</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-semibold text-foreground">Method</th>
                        <th className="text-left py-2 font-semibold text-foreground">Endpoint</th>
                        <th className="text-left py-2 font-semibold text-foreground">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b"><td className="py-2 font-mono">GET</td><td className="py-2 font-mono">/api/v1/workflows</td><td className="py-2">List all workflows</td></tr>
                      <tr className="border-b"><td className="py-2 font-mono">POST</td><td className="py-2 font-mono">/api/v1/workflows</td><td className="py-2">Create a workflow</td></tr>
                      <tr className="border-b"><td className="py-2 font-mono">GET</td><td className="py-2 font-mono">/api/v1/workflows/:id</td><td className="py-2">Get workflow details</td></tr>
                      <tr className="border-b"><td className="py-2 font-mono">PUT</td><td className="py-2 font-mono">/api/v1/workflows/:id</td><td className="py-2">Update a workflow</td></tr>
                      <tr className="border-b"><td className="py-2 font-mono">DELETE</td><td className="py-2 font-mono">/api/v1/workflows/:id</td><td className="py-2">Delete a workflow</td></tr>
                      <tr className="border-b"><td className="py-2 font-mono">POST</td><td className="py-2 font-mono">/api/v1/workflows/:id/run</td><td className="py-2">Execute a workflow</td></tr>
                      <tr><td className="py-2 font-mono">GET</td><td className="py-2 font-mono">/api/v1/workflows/:id/runs</td><td className="py-2">List workflow runs</td></tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Create Workflow</h2>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground">{`POST /api/v1/workflows
Authorization: Bearer sk_live_...
Content-Type: application/json

{
  "name": "Weekly Brand Analysis",
  "description": "Automated weekly brand health analysis",
  "trigger": {
    "type": "schedule",
    "cron": "0 9 * * 1",
    "timezone": "America/New_York"
  },
  "steps": [
    {
      "id": "collect_data",
      "type": "agent",
      "agent": "data_collector",
      "config": { "sources": ["brand_tracker", "social_listening"] }
    },
    {
      "id": "analyze",
      "type": "agent",
      "agent": "brand_analyzer",
      "dependsOn": ["collect_data"]
    },
    {
      "id": "report",
      "type": "agent",
      "agent": "report_generator",
      "dependsOn": ["analyze"],
      "config": { "format": "pdf", "template": "executive" }
    }
  ],
  "outputs": [
    { "type": "email", "recipients": ["team@company.com"] },
    { "type": "slack", "channel": "#insights" }
  ]
}

// Response
{
  "id": "wf_abc123",
  "name": "Weekly Brand Analysis",
  "status": "active",
  "created_at": "2024-01-10T12:00:00Z",
  "next_run": "2024-01-15T09:00:00Z"
}`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Execute Workflow</h2>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground">{`POST /api/v1/workflows/wf_abc123/run
Authorization: Bearer sk_live_...
Content-Type: application/json

{
  "input": {
    "brand": "Nike",
    "period": "last_30_days",
    "markets": ["US", "UK", "DE"]
  },
  "options": {
    "priority": "high",
    "notify_on_complete": true
  }
}

// Response
{
  "run_id": "run_xyz789",
  "workflow_id": "wf_abc123",
  "status": "running",
  "started_at": "2024-01-10T12:00:00Z",
  "estimated_completion": "2024-01-10T12:15:00Z"
}`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Get Workflow Run Status</h2>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground">{`GET /api/v1/workflows/wf_abc123/runs/run_xyz789
Authorization: Bearer sk_live_...

// Response
{
  "run_id": "run_xyz789",
  "workflow_id": "wf_abc123",
  "status": "completed",
  "started_at": "2024-01-10T12:00:00Z",
  "completed_at": "2024-01-10T12:12:35Z",
  "duration_ms": 755000,
  "steps": [
    {
      "id": "collect_data",
      "status": "completed",
      "duration_ms": 180000,
      "output": { "records": 15420 }
    },
    {
      "id": "analyze",
      "status": "completed",
      "duration_ms": 420000,
      "output": { "insights": 8 }
    },
    {
      "id": "report",
      "status": "completed",
      "duration_ms": 155000,
      "output": { "report_url": "https://..." }
    }
  ],
  "output": {
    "report_url": "https://app.gwi.ai/reports/rpt_123",
    "insights_count": 8,
    "delivered_to": ["email", "slack"]
  }
}`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Workflow Management</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-green-500" />
                    Enable
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded bg-muted p-2 font-mono text-xs">
                    <pre>POST /workflows/:id/enable</pre>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pause className="h-5 w-5 text-yellow-500" />
                    Disable
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded bg-muted p-2 font-mono text-xs">
                    <pre>POST /workflows/:id/disable</pre>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <List className="h-5 w-5 text-blue-500" />
                    List Runs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded bg-muted p-2 font-mono text-xs">
                    <pre>GET /workflows/:id/runs</pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Error Handling</h2>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground">{`// Workflow execution error
{
  "error": {
    "code": "workflow_step_failed",
    "message": "Step 'analyze' failed: Agent timeout",
    "status": 500,
    "details": {
      "step_id": "analyze",
      "step_status": "failed",
      "error_type": "timeout",
      "retries_attempted": 3
    }
  }
}

// Validation error
{
  "error": {
    "code": "validation_error",
    "message": "Invalid workflow configuration",
    "status": 400,
    "details": {
      "field": "steps[1].dependsOn",
      "issue": "Referenced step 'unknown_step' does not exist"
    }
  }
}`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Related Documentation</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/docs/api">
                <Button variant="outline">API Overview</Button>
              </Link>
              <Link href="/docs/workflows/orchestration">
                <Button variant="outline">Workflow Orchestration</Button>
              </Link>
              <Link href="/docs/api/agents">
                <Button variant="outline">Agents API</Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
