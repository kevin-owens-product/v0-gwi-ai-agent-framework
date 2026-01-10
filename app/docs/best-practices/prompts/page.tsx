import Link from "next/link"
import { ArrowLeft, MessageSquare, Lightbulb, Zap, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PromptsPage() {
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
            <h1 className="text-4xl font-bold text-foreground">Prompt Engineering</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Best practices for writing effective prompts that get the best results from AI agents.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Prompt Fundamentals</h2>
            <p className="text-muted-foreground mb-4">
              Well-crafted prompts are the key to getting accurate, relevant, and actionable insights
              from your AI agents. Follow these principles for optimal results.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Be Specific
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Clearly define what you want to analyze and the expected output format.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-500" />
                    Add Context
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Provide background information to help the agent understand the business context.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    Set Constraints
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Define boundaries, focus areas, and what to exclude from the analysis.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Prompt Structure</h2>
            <p className="text-muted-foreground mb-4">
              A well-structured prompt includes these key components:
            </p>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto mb-4">
              <pre className="text-foreground">{`// Recommended prompt structure
{
  "role": "Define the agent's persona and expertise",
  "context": "Provide background on the business situation",
  "task": "Clearly state what you want the agent to do",
  "data": "Specify which data sources to use",
  "format": "Define the expected output structure",
  "constraints": "Set boundaries and focus areas"
}`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Examples</h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-500">❌ Poor Prompt</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded bg-muted p-3 font-mono text-sm">
                    <pre className="text-foreground">{`"Analyze our brand"`}</pre>
                  </div>
                  <p className="text-muted-foreground text-sm mt-2">
                    Too vague - no context, timeframe, metrics, or output format specified.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-500">✓ Good Prompt</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded bg-muted p-3 font-mono text-sm overflow-x-auto">
                    <pre className="text-foreground">{`"Analyze Nike's brand health among Gen Z consumers (18-25)
in the US market over the past 6 months. Focus on:
- Brand awareness and consideration trends
- Key purchase drivers for this segment
- Comparison with Adidas and Puma
- Social media sentiment on TikTok and Instagram

Output a summary report with:
- Executive summary (3-5 key insights)
- Trend charts for each metric
- Strategic recommendations (max 5)
- Data quality notes and confidence levels"`}</pre>
                  </div>
                  <p className="text-muted-foreground text-sm mt-2">
                    Specific audience, timeframe, metrics, competitors, platforms, and output format.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Advanced Techniques</h2>
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Chain-of-Thought Prompting</h3>
                  <p className="text-muted-foreground mb-2">
                    Ask the agent to explain its reasoning step-by-step for complex analyses.
                  </p>
                  <div className="rounded bg-muted p-3 font-mono text-sm">
                    <pre className="text-foreground">{`"Walk me through your analysis step by step:
1. First, examine the raw data trends
2. Then, identify significant patterns
3. Compare against benchmarks
4. Draw conclusions
5. Provide recommendations with rationale"`}</pre>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Few-Shot Examples</h3>
                  <p className="text-muted-foreground mb-2">
                    Provide examples of the output format you expect.
                  </p>
                  <div className="rounded bg-muted p-3 font-mono text-sm">
                    <pre className="text-foreground">{`"Format insights like this example:
[INSIGHT] Brand awareness increased 12% among Gen Z
[DRIVER] TikTok campaign featuring athlete partnerships
[IMPACT] Consideration lift of 8 points in target segment
[ACTION] Increase TikTok ad spend by 25% next quarter"`}</pre>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Iterative Refinement</h3>
                  <p className="text-muted-foreground mb-2">
                    Use follow-up prompts to drill deeper into specific findings.
                  </p>
                  <div className="rounded bg-muted p-3 font-mono text-sm">
                    <pre className="text-foreground">{`Initial: "Analyze brand health trends"
Follow-up: "Drill deeper into the NPS decline in Q3"
Follow-up: "What specific events correlate with this drop?"
Follow-up: "Compare with competitor NPS during same period"`}</pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Common Mistakes to Avoid</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Ambiguous requests:</strong> &quot;Tell me about our performance&quot; - specify which metrics</li>
              <li><strong>Missing timeframe:</strong> Always specify the date range for analysis</li>
              <li><strong>No comparison context:</strong> Include benchmarks or competitors for context</li>
              <li><strong>Overloading:</strong> Break complex requests into multiple focused prompts</li>
              <li><strong>Ignoring data sources:</strong> Specify which data to use or exclude</li>
              <li><strong>Vague output format:</strong> Define whether you need charts, tables, or text</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Related Documentation</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/docs/custom-agents/prompts">
                <Button variant="outline">Custom Agent Prompts</Button>
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
