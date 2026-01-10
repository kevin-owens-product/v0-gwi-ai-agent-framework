import Link from "next/link"
import { ArrowLeft, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AudienceStrategistPage() {
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
            <Users className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">Audience Strategist Agent</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Deep audience profiling and segmentation powered by GWI consumer data.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Overview</h2>
            <p className="text-muted-foreground">
              The Audience Strategist agent specializes in creating detailed audience profiles and
              identifying key segments based on demographics, psychographics, behaviors, and media consumption
              patterns. It leverages GWI&apos;s global consumer data to provide actionable audience insights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Capabilities</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Audience Profiling</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Create comprehensive profiles of target audiences including demographics, attitudes,
                    interests, and behaviors.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Segment Discovery</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Identify distinct audience segments within your target market based on shared
                    characteristics and behaviors.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Persona Generation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Generate data-driven personas with detailed attributes, motivations, and
                    media touchpoints.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Audience Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Compare multiple audience segments to identify overlaps, differences, and
                    targeting opportunities.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Example Prompts</h2>
            <div className="space-y-4">
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground whitespace-pre-wrap">{`"Create a detailed profile of UK millennials who are interested in
sustainable fashion, including their key motivations and media habits."`}</pre>
              </div>
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground whitespace-pre-wrap">{`"Identify the top 3 audience segments for a new plant-based food
brand targeting health-conscious consumers in the US."`}</pre>
              </div>
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground whitespace-pre-wrap">{`"Compare Gen Z vs Millennial attitudes toward luxury brands in
Europe, highlighting key differences in purchasing behavior."`}</pre>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Data Sources</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>GWI Core - Demographics, attitudes, and behaviors</li>
              <li>GWI USA - US-specific consumer insights</li>
              <li>GWI Zeitgeist - Monthly trend tracking</li>
              <li>Media consumption data - TV, digital, social, print</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Try It Now</h2>
            <Link href="/dashboard/agents">
              <Button>Launch Audience Strategist</Button>
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}
