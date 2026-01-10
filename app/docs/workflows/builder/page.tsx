import Link from "next/link"
import { ArrowLeft, GitBranch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function WorkflowBuilderPage() {
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
            <GitBranch className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">Workflow Builder</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Create automated research pipelines by connecting agents together.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Getting Started</h2>
            <p className="text-muted-foreground mb-4">
              The Workflow Builder provides a visual canvas for designing multi-step research
              automation. Drag and drop agents, configure triggers, and define data flow between steps.
            </p>
            <Link href="/dashboard/workflows/builder">
              <Button variant="outline">Open Workflow Builder</Button>
            </Link>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Workflow Components</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Triggers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">
                    Define when your workflow runs:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Schedule</strong> - Daily, weekly, or monthly</li>
                    <li>• <strong>API</strong> - On-demand via REST endpoint</li>
                    <li>• <strong>Webhook</strong> - External event triggers</li>
                    <li>• <strong>Manual</strong> - User-initiated runs</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Agent Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">
                    Add agents to your workflow:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Select from pre-built or custom agents</li>
                    <li>• Configure input parameters</li>
                    <li>• Map outputs to next steps</li>
                    <li>• Set error handling behavior</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">
                    Add logic to your workflows:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• If/else branching</li>
                    <li>• Data filters</li>
                    <li>• Threshold checks</li>
                    <li>• Loop iterations</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Outputs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">
                    Configure where results go:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Email reports</li>
                    <li>• Slack notifications</li>
                    <li>• Webhook callbacks</li>
                    <li>• Dashboard updates</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Workflow Configuration</h2>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground">{`{
  "name": "Weekly Trend Report",
  "description": "Automated weekly trend analysis",
  "trigger": {
    "type": "schedule",
    "schedule": "0 9 * * MON"
  },
  "steps": [
    {
      "id": "step-1",
      "agent": "trend-spotter",
      "input": {
        "market": "US",
        "timeframe": "last_7_days"
      }
    },
    {
      "id": "step-2",
      "agent": "audience-strategist",
      "input": {
        "trends": "{{step-1.output.trends}}"
      },
      "dependsOn": ["step-1"]
    },
    {
      "id": "step-3",
      "type": "output",
      "format": "email",
      "recipients": ["team@company.com"],
      "dependsOn": ["step-2"]
    }
  ]
}`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Data Flow</h2>
            <p className="text-muted-foreground mb-4">
              Reference outputs from previous steps using template syntax:
            </p>
            <div className="rounded bg-muted p-4 font-mono text-sm">
              <pre className="text-foreground">{`// Reference full output
"input": "{{step-1.output}}"

// Reference specific field
"trends": "{{step-1.output.trends}}"

// Reference array item
"topTrend": "{{step-1.output.trends[0]}}"

// Combine multiple sources
"context": "{{step-1.output.summary}} and {{step-2.output.audience}}"`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Error Handling</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Retry</strong> - Automatically retry failed steps with exponential backoff</li>
              <li><strong>Skip</strong> - Continue to next step if current fails</li>
              <li><strong>Halt</strong> - Stop workflow execution on failure</li>
              <li><strong>Alert</strong> - Send notification and continue</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Related Documentation</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/docs/workflows-intro">
                <Button variant="outline">Workflows Overview</Button>
              </Link>
              <Link href="/docs/api">
                <Button variant="outline">API Reference</Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
