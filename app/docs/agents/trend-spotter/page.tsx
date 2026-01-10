import Link from "next/link"
import { ArrowLeft, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TrendSpotterPage() {
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
            <TrendingUp className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">Market Trend Spotter Agent</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Identify and analyze emerging market trends from consumer behavior data.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Overview</h2>
            <p className="text-muted-foreground">
              The Trend Spotter agent continuously monitors GWI consumer data to identify emerging
              trends, shifting behaviors, and cultural movements. It helps you stay ahead of market
              changes and capitalize on new opportunities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Capabilities</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Trend Detection</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Automatically surface emerging trends based on changes in consumer attitudes,
                    behaviors, and interests over time.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Trend Validation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Validate hypothesized trends with statistical evidence and measure their
                    significance and momentum.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Audience Mapping</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Identify which audience segments are driving each trend and their
                    adoption characteristics.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Trend Forecasting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Project trend trajectories and estimate future impact based on historical
                    patterns and current momentum.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Trend Categories</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Consumer Values</strong> - Shifting priorities and beliefs</li>
              <li><strong>Lifestyle</strong> - Changing behaviors and habits</li>
              <li><strong>Technology</strong> - Adoption of new platforms and tools</li>
              <li><strong>Media</strong> - Evolving content preferences</li>
              <li><strong>Purchase Behavior</strong> - Shopping and spending patterns</li>
              <li><strong>Social</strong> - Cultural movements and conversations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Example Prompts</h2>
            <div className="space-y-4">
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground whitespace-pre-wrap">{`"Identify the top 5 emerging consumer trends in the wellness space
among US millennials over the past 6 months."`}</pre>
              </div>
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground whitespace-pre-wrap">{`"Analyze the growth trajectory of plant-based eating trends in
Europe and predict adoption rates for the next year."`}</pre>
              </div>
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground whitespace-pre-wrap">{`"What are the fastest-growing social media behaviors among Gen Z
in the UK, and which platforms are driving them?"`}</pre>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Try It Now</h2>
            <Link href="/dashboard/agents">
              <Button>Launch Trend Spotter</Button>
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}
