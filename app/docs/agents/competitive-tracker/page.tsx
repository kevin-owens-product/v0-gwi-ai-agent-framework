import Link from "next/link"
import { ArrowLeft, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CompetitiveTrackerPage() {
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
            <Target className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">Competitive Tracker Agent</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Monitor and analyze competitor positioning using consumer perception data.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Overview</h2>
            <p className="text-muted-foreground">
              The Competitive Tracker agent helps you understand how your brand and competitors are
              perceived by consumers. It analyzes brand awareness, consideration, purchase behavior,
              and brand attributes across your competitive set.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Capabilities</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Brand Health Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Monitor awareness, consideration, preference, and usage metrics for your brand
                    and competitors over time.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Perception Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Understand how consumers perceive each brand on key attributes like quality,
                    value, innovation, and trust.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Share of Voice</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Analyze competitive share of consideration across different audience segments
                    and markets.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Opportunity Identification</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Identify gaps in the competitive landscape and potential positioning
                    opportunities.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Metrics Tracked</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Awareness</strong> - Brand recognition and recall</li>
              <li><strong>Consideration</strong> - Intent to purchase or use</li>
              <li><strong>Preference</strong> - First-choice brand selection</li>
              <li><strong>Usage</strong> - Current and past customer base</li>
              <li><strong>NPS</strong> - Net promoter and advocacy metrics</li>
              <li><strong>Attributes</strong> - Brand personality and perception</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Example Prompts</h2>
            <div className="space-y-4">
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground whitespace-pre-wrap">{`"Compare brand perception between Nike, Adidas, and Puma among
US Gen Z consumers, focusing on sustainability and innovation."`}</pre>
              </div>
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground whitespace-pre-wrap">{`"Track quarterly changes in brand awareness for the top 5 streaming
services in the UK market over the past year."`}</pre>
              </div>
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground whitespace-pre-wrap">{`"Identify white space opportunities in the energy drink market
by analyzing unmet consumer needs vs. current brand positioning."`}</pre>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Try It Now</h2>
            <Link href="/dashboard/agents">
              <Button>Launch Competitive Tracker</Button>
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}
