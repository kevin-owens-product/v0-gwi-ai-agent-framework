import Link from "next/link"
import { ArrowLeft, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SystemPromptsPage() {
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
            <MessageSquare className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">System Prompts</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Master the art of writing effective system prompts for your agents.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">What is a System Prompt?</h2>
            <p className="text-muted-foreground">
              A system prompt is the foundational instruction that defines your agent&apos;s behavior,
              personality, and capabilities. It&apos;s the first thing the AI sees and shapes how it
              responds to all user queries.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Prompt Structure</h2>
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>1. Role Definition</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Clearly define what the agent is and its area of expertise.
                  </p>
                  <div className="rounded bg-muted p-4 font-mono text-sm">
                    <pre className="text-foreground whitespace-pre-wrap">{`You are a senior consumer insights analyst specializing
in demographic analysis and audience segmentation.`}</pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>2. Capabilities & Constraints</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Specify what the agent can and cannot do.
                  </p>
                  <div className="rounded bg-muted p-4 font-mono text-sm">
                    <pre className="text-foreground whitespace-pre-wrap">{`You have access to GWI consumer survey data covering
50+ markets. You can analyze demographics, attitudes,
behaviors, and media consumption. You cannot access
personally identifiable information or make predictions
about individual consumers.`}</pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>3. Response Format</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Define how the agent should structure its responses.
                  </p>
                  <div className="rounded bg-muted p-4 font-mono text-sm">
                    <pre className="text-foreground whitespace-pre-wrap">{`When responding to queries, always:
1. Restate the research question
2. Identify relevant data points
3. Provide key findings with statistics
4. Include confidence levels
5. Suggest follow-up questions`}</pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>4. Tone & Style</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Set the communication style.
                  </p>
                  <div className="rounded bg-muted p-4 font-mono text-sm">
                    <pre className="text-foreground whitespace-pre-wrap">{`Communicate in a professional but approachable tone.
Use clear, jargon-free language when possible.
When using technical terms, provide brief explanations.`}</pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Example Complete Prompt</h2>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground whitespace-pre-wrap">{`You are the GWI Audience Analyst, a senior consumer insights
specialist with deep expertise in demographic analysis and
audience segmentation.

CAPABILITIES:
- Access to GWI Core, USA, and Zeitgeist datasets
- Coverage of 50+ global markets
- Analysis of demographics, attitudes, behaviors, and media

RESPONSE GUIDELINES:
1. Begin with a brief summary of the key insight
2. Support findings with specific data points and percentages
3. Include sample sizes and confidence intervals where relevant
4. Compare to benchmarks when useful
5. End with actionable recommendations

CONSTRAINTS:
- Only cite data from the last 12 months unless asked otherwise
- Flag when sample sizes are below 100 as low confidence
- Do not make predictions beyond what the data supports
- Always distinguish between correlation and causation

TONE:
Professional, data-driven, and actionable. Avoid marketing speak.
When uncertain, acknowledge limitations.`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Tips for Effective Prompts</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Be specific rather than general - vague instructions lead to inconsistent results</li>
              <li>Include examples of ideal responses where possible</li>
              <li>Test with edge cases and refine based on failures</li>
              <li>Keep prompts focused - split complex behaviors into multiple agents</li>
              <li>Iterate based on user feedback and common failure modes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Related Documentation</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/docs/custom-agents/builder">
                <Button variant="outline">Agent Builder</Button>
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
