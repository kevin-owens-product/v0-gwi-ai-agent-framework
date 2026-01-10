import Link from "next/link"
import { ArrowLeft, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function OverviewPage() {
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
            <Layers className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">Platform Overview</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Understand the GWI AI Agent Framework architecture and capabilities.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">What is GWI AI Agent Framework?</h2>
            <p className="text-muted-foreground mb-4">
              The GWI AI Agent Framework is a powerful platform that enables market researchers and insights professionals
              to leverage AI agents for analyzing consumer data, generating insights, and automating research workflows.
            </p>
            <p className="text-muted-foreground">
              Built on top of GWI&apos;s comprehensive consumer research data, our AI agents can help you uncover
              audience insights, track brand performance, identify market trends, and create actionable research reports.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Core Components</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Pre-built Agents</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Ready-to-use AI agents designed for specific research tasks like audience analysis,
                    competitive tracking, and trend identification.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Custom Agents</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Build your own specialized agents with custom prompts, data sources, and output formats
                    tailored to your research needs.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Workflows</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Chain multiple agents together to create automated research pipelines that run on
                    schedules or respond to triggers.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>API & Integrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Connect the platform to your existing tools and systems via our REST API and webhooks
                    for seamless data flow.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Data Sources</h2>
            <p className="text-muted-foreground mb-4">
              GWI AI agents have access to a wide range of data sources to power their insights:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>GWI Core - Comprehensive consumer survey data across 50+ markets</li>
              <li>GWI USA - Deep dive into American consumer behavior</li>
              <li>GWI Zeitgeist - Monthly tracking of emerging trends</li>
              <li>Social Media Analytics - Real-time social listening data</li>
              <li>Custom Data - Upload and analyze your own datasets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Next Steps</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/docs/quickstart">
                <Button>Quick Start Guide</Button>
              </Link>
              <Link href="/docs/first-agent">
                <Button variant="outline">Create Your First Agent</Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
