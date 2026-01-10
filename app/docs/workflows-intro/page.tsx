import Link from "next/link"
import { ArrowLeft, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function WorkflowsIntroPage() {
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
            <h1 className="text-4xl font-bold text-foreground">Understanding Workflows</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Automate your research by chaining agents into powerful workflows.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">What are Workflows?</h2>
            <p className="text-muted-foreground mb-4">
              Workflows allow you to connect multiple agents together, where the output of one agent
              becomes the input for the next. This enables complex, multi-step research processes
              that run automatically.
            </p>
            <p className="text-muted-foreground">
              For example, you could create a workflow that first identifies trending topics,
              then analyzes audience sentiment for each trend, and finally generates a summary report.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Workflow Components</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Triggers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Define when your workflow runs: on a schedule (daily, weekly, monthly),
                    via API call, or in response to specific events.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Agent Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Each step in a workflow calls an agent with specific inputs. Steps can run
                    sequentially or in parallel.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Data Transformations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Transform and filter data between steps. Extract specific fields, combine
                    results, or apply conditional logic.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Outputs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Configure where results go: email notifications, webhook callbacks,
                    saved reports, or integration with external tools.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Example Workflow</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold">1</div>
                    <div>
                      <p className="font-medium text-foreground">Trend Spotter Agent</p>
                      <p className="text-sm text-muted-foreground">Identifies top 5 emerging trends in target market</p>
                    </div>
                  </div>
                  <div className="ml-4 border-l-2 border-muted h-8" />
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold">2</div>
                    <div>
                      <p className="font-medium text-foreground">Audience Strategist Agent</p>
                      <p className="text-sm text-muted-foreground">Analyzes audience overlap for each trend</p>
                    </div>
                  </div>
                  <div className="ml-4 border-l-2 border-muted h-8" />
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold">3</div>
                    <div>
                      <p className="font-medium text-foreground">Report Generator</p>
                      <p className="text-sm text-muted-foreground">Compiles findings into executive summary</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Next Steps</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/docs/workflows/builder">
                <Button>Workflow Builder</Button>
              </Link>
              <Link href="/dashboard/workflows">
                <Button variant="outline">Create a Workflow</Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
