import Link from "next/link"
import { ArrowLeft, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function QuickstartPage() {
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
            <Play className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">Quick Start Guide</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Get up and running with GWI AI agents in minutes.
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Access Your Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Log in to your GWI account and navigate to the AI Agent Framework dashboard. If you don&apos;t
                have access yet, contact your account manager to enable this feature.
              </p>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 2: Choose an Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Browse our library of pre-built agents designed for common research tasks:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li><strong>Audience Strategist</strong> - Deep audience profiling and segmentation</li>
                <li><strong>Creative Brief Builder</strong> - Generate creative briefs from audience insights</li>
                <li><strong>Competitive Tracker</strong> - Monitor and analyze competitor positioning</li>
                <li><strong>Trend Spotter</strong> - Identify emerging market trends</li>
              </ul>
              <Link href="/dashboard/agents">
                <Button variant="outline" size="sm">Browse Agents</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 3: Run Your First Query</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Select an agent and enter a natural language prompt describing what you want to learn.
                For example:
              </p>
              <div className="rounded bg-muted p-4 font-mono text-sm mb-4">
                <pre className="text-foreground whitespace-pre-wrap">{`"Analyze Gen Z attitudes toward sustainable fashion in the UK market,
including key motivations and purchase barriers."`}</pre>
              </div>
              <p className="text-muted-foreground">
                The agent will analyze GWI data and return actionable insights within seconds.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 4: Export & Share</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Export your insights in multiple formats:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>PDF reports with charts and visualizations</li>
                <li>PowerPoint slides ready for presentations</li>
                <li>Raw data in CSV or JSON format</li>
                <li>Share links for team collaboration</li>
              </ul>
            </CardContent>
          </Card>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">What&apos;s Next?</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/docs/first-agent">
                <Button>Create a Custom Agent</Button>
              </Link>
              <Link href="/docs/workflows-intro">
                <Button variant="outline">Learn About Workflows</Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
