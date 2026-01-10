import Link from "next/link"
import { ArrowLeft, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AgentBuilderPage() {
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
            <Wrench className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">Agent Builder Guide</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Learn how to build custom AI agents tailored to your research needs.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Getting Started</h2>
            <p className="text-muted-foreground mb-4">
              The Agent Builder provides a visual interface for creating custom agents. You can
              configure every aspect of your agent&apos;s behavior, from data access to output formatting.
            </p>
            <Link href="/dashboard/agents/builder">
              <Button variant="outline">Open Agent Builder</Button>
            </Link>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Builder Components</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>1. Agent Identity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Set your agent&apos;s name, description, icon, and category. This helps users
                    understand what the agent does at a glance.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>2. System Prompt</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Define the agent&apos;s core behavior with a system prompt that sets its role,
                    expertise, and response patterns.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>3. Data Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Select which GWI datasets your agent can access and configure market and
                    time range restrictions.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>4. Output Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Define response structure, available export formats, and visualization
                    options for agent outputs.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Agent Configuration Schema</h2>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground">{`{
  "name": "Custom Research Agent",
  "description": "Specialized agent for market analysis",
  "icon": "chart-bar",
  "category": "research",
  "systemPrompt": "You are a senior market researcher...",
  "dataSources": {
    "datasets": ["gwi_core", "gwi_usa"],
    "markets": ["US", "UK", "DE"],
    "timeRange": "last_12_months"
  },
  "outputConfig": {
    "format": "structured",
    "includeCharts": true,
    "exportFormats": ["pdf", "pptx", "csv"]
  },
  "parameters": {
    "temperature": 0.7,
    "maxTokens": 4000
  }
}`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Best Practices</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Start with a clear, specific use case before building</li>
              <li>Write detailed system prompts with examples</li>
              <li>Limit data source access to only what&apos;s needed</li>
              <li>Test thoroughly with diverse prompts before deployment</li>
              <li>Iterate based on user feedback</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Related Documentation</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/docs/custom-agents/prompts">
                <Button variant="outline">System Prompts</Button>
              </Link>
              <Link href="/docs/custom-agents/data-sources">
                <Button variant="outline">Data Sources</Button>
              </Link>
              <Link href="/docs/custom-agents/testing">
                <Button variant="outline">Testing Guide</Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
