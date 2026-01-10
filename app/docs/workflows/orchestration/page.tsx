import Link from "next/link"
import { ArrowLeft, GitBranch, Workflow, ArrowRightLeft, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function WorkflowOrchestrationPage() {
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
            <h1 className="text-4xl font-bold text-foreground">Workflow Orchestration</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Design and manage complex multi-step workflows that chain agents together.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Orchestration Concepts</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-blue-500" />
                    Sequential
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Execute steps one after another, passing data between stages.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-green-500" />
                    Parallel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Run multiple agents simultaneously for faster execution.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-purple-500" />
                    Conditional
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Branch based on data conditions or previous step results.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Workflow Definition</h2>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground">{`// Complex workflow with multiple orchestration patterns
{
  "name": "Weekly Brand Intelligence",
  "version": "1.0",
  "steps": [
    {
      "id": "data_collection",
      "type": "parallel",
      "agents": [
        { "id": "social_listener", "config": { "platforms": ["twitter", "tiktok"] } },
        { "id": "survey_analyzer", "config": { "dataset": "brand_tracker" } },
        { "id": "competitive_scanner", "config": { "competitors": 5 } }
      ],
      "timeout": "30m",
      "onFailure": "continue"
    },
    {
      "id": "data_synthesis",
      "type": "sequential",
      "dependsOn": ["data_collection"],
      "agent": "insight_synthesizer",
      "input": {
        "social": "{{steps.data_collection.social_listener.output}}",
        "survey": "{{steps.data_collection.survey_analyzer.output}}",
        "competitive": "{{steps.data_collection.competitive_scanner.output}}"
      }
    },
    {
      "id": "alert_check",
      "type": "conditional",
      "dependsOn": ["data_synthesis"],
      "condition": "{{steps.data_synthesis.output.alerts.length > 0}}",
      "branches": {
        "true": { "agent": "alert_dispatcher", "priority": "high" },
        "false": { "action": "continue" }
      }
    },
    {
      "id": "report_generation",
      "type": "sequential",
      "dependsOn": ["data_synthesis"],
      "agent": "report_builder",
      "config": {
        "template": "executive_summary",
        "format": "pdf"
      }
    }
  ]
}`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Step Types</h2>
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Agent Step</h3>
                  <p className="text-muted-foreground mb-2">
                    Execute a single AI agent with specific configuration.
                  </p>
                  <div className="rounded bg-muted p-3 font-mono text-sm">
                    <pre className="text-foreground">{`{
  "id": "analyze",
  "type": "agent",
  "agent": "trend_analyzer",
  "config": { "depth": "detailed" },
  "timeout": "10m"
}`}</pre>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Transform Step</h3>
                  <p className="text-muted-foreground mb-2">
                    Transform data between steps using built-in functions.
                  </p>
                  <div className="rounded bg-muted p-3 font-mono text-sm">
                    <pre className="text-foreground">{`{
  "id": "transform",
  "type": "transform",
  "operations": [
    { "filter": "value > 100" },
    { "sort": "date desc" },
    { "limit": 10 }
  ]
}`}</pre>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Approval Step</h3>
                  <p className="text-muted-foreground mb-2">
                    Pause workflow for human review and approval.
                  </p>
                  <div className="rounded bg-muted p-3 font-mono text-sm">
                    <pre className="text-foreground">{`{
  "id": "review",
  "type": "approval",
  "assignees": ["analyst@company.com"],
  "timeout": "24h",
  "onTimeout": "auto_approve"
}`}</pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Error Handling</h2>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground">{`// Error handling configuration
{
  "errorHandling": {
    "strategy": "retry_then_fail",
    "retries": 3,
    "backoff": "exponential",
    "maxBackoff": "5m",
    "fallback": {
      "type": "agent",
      "agent": "fallback_analyzer",
      "notify": ["ops@company.com"]
    },
    "alerting": {
      "onFailure": true,
      "channels": ["slack", "email"]
    }
  }
}`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Data Flow</h2>
            <p className="text-muted-foreground mb-4">
              Pass data between workflow steps using template expressions.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><code className="bg-muted px-1 rounded">{"{{steps.stepId.output}}"}</code> - Full output from a step</li>
              <li><code className="bg-muted px-1 rounded">{"{{steps.stepId.output.field}}"}</code> - Specific field from output</li>
              <li><code className="bg-muted px-1 rounded">{"{{trigger.data}}"}</code> - Data from workflow trigger</li>
              <li><code className="bg-muted px-1 rounded">{"{{env.VARIABLE}}"}</code> - Environment variables</li>
              <li><code className="bg-muted px-1 rounded">{"{{now}}"}</code> - Current timestamp</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Monitoring & Debugging</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Execution Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    View detailed logs for each step including inputs, outputs, timing, and errors.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Visual Debugger</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Interactive workflow visualization showing execution state and data flow.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Related Documentation</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/docs/workflows/triggers">
                <Button variant="outline">Workflow Triggers</Button>
              </Link>
              <Link href="/docs/workflows/outputs">
                <Button variant="outline">Workflow Outputs</Button>
              </Link>
              <Link href="/docs/workflows/builder">
                <Button variant="outline">Workflow Builder</Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
