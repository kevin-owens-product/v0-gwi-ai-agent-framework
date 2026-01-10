import Link from "next/link"
import { ArrowLeft, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CreativeBriefPage() {
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
            <FileText className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">Creative Brief Builder Agent</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Generate data-driven creative briefs from audience insights.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Overview</h2>
            <p className="text-muted-foreground">
              The Creative Brief Builder transforms audience insights into actionable creative briefs
              for marketing and advertising teams. It combines consumer data with creative strategy
              frameworks to produce briefs that resonate with target audiences.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Capabilities</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Brief Generation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Create comprehensive creative briefs with objectives, target audience, key messages,
                    and tone of voice recommendations.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Message Testing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Evaluate potential messaging angles against audience data to identify the most
                    effective approaches.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Channel Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Suggest optimal media channels based on target audience media consumption
                    patterns and behaviors.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Competitive Context</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Include competitive landscape analysis and differentiation opportunities
                    in the brief.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Brief Structure</h2>
            <p className="text-muted-foreground mb-4">
              Generated briefs include the following sections:
            </p>
            <ol className="list-decimal list-inside text-muted-foreground space-y-2">
              <li><strong>Background</strong> - Business context and market situation</li>
              <li><strong>Objective</strong> - Clear campaign goals and KPIs</li>
              <li><strong>Target Audience</strong> - Detailed audience profile with data</li>
              <li><strong>Key Insight</strong> - Core consumer truth to build on</li>
              <li><strong>Proposition</strong> - Main message or value proposition</li>
              <li><strong>Tone & Manner</strong> - Communication style guidelines</li>
              <li><strong>Mandatories</strong> - Required elements and constraints</li>
              <li><strong>Media Considerations</strong> - Channel recommendations</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Example Prompts</h2>
            <div className="space-y-4">
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground whitespace-pre-wrap">{`"Create a creative brief for a new sustainable sneaker brand
targeting eco-conscious Gen Z consumers in the US market."`}</pre>
              </div>
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground whitespace-pre-wrap">{`"Generate a brief for a financial services app campaign aimed
at millennial first-time investors, focusing on trust and simplicity."`}</pre>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Try It Now</h2>
            <Link href="/dashboard/agents">
              <Button>Launch Creative Brief Builder</Button>
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}
