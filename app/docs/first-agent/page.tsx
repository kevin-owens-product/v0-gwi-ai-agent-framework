import Link from "next/link"
import { ArrowLeft, Cpu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function FirstAgentPage() {
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
            <Cpu className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">Your First Agent</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Learn how to create and configure your first custom AI agent.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Understanding Agents</h2>
            <p className="text-muted-foreground">
              An agent is an AI-powered assistant configured with specific capabilities, data access, and
              behavior patterns. Each agent is designed to excel at particular types of research tasks.
            </p>
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Step 1: Define Your Agent&apos;s Purpose</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Start by clearly defining what your agent should do. Consider:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>What research questions will this agent answer?</li>
                <li>What type of output do you need (reports, data tables, summaries)?</li>
                <li>Who will be using this agent and what&apos;s their expertise level?</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 2: Configure Data Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Select which GWI data sources your agent can access:
              </p>
              <div className="rounded bg-muted p-4 font-mono text-sm mb-4">
                <pre className="text-foreground">{`{
  "data_sources": [
    "gwi_core",
    "gwi_usa",
    "gwi_zeitgeist"
  ],
  "markets": ["US", "UK", "DE", "FR"],
  "time_range": "last_12_months"
}`}</pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 3: Write Your System Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                The system prompt defines your agent&apos;s personality and behavior. Be specific about:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li>The agent&apos;s role and expertise</li>
                <li>How it should structure responses</li>
                <li>Any specific guidelines or constraints</li>
              </ul>
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground whitespace-pre-wrap">{`You are a senior market research analyst specializing in
consumer behavior analysis. When given a research question:

1. Identify relevant data points from GWI surveys
2. Analyze trends and patterns
3. Provide actionable insights
4. Include statistical confidence levels

Always cite specific data sources and time periods.`}</pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 4: Test & Iterate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Before deploying your agent, test it with various prompts:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Test edge cases and unusual queries</li>
                <li>Verify data accuracy against known benchmarks</li>
                <li>Check response formatting and clarity</li>
                <li>Gather feedback from potential users</li>
              </ul>
            </CardContent>
          </Card>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Next Steps</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/docs/custom-agents/builder">
                <Button>Agent Builder Guide</Button>
              </Link>
              <Link href="/docs/custom-agents/prompts">
                <Button variant="outline">System Prompts</Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
