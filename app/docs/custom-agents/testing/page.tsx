import Link from "next/link"
import { ArrowLeft, FlaskConical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestingPage() {
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
            <FlaskConical className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">Testing & Validation</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Ensure your agents are reliable and accurate before deployment.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Why Test Your Agents?</h2>
            <p className="text-muted-foreground">
              Thorough testing ensures your agents provide consistent, accurate, and useful responses.
              Untested agents may produce unreliable insights, fail to handle edge cases, or behave
              unexpectedly with certain inputs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Testing Stages</h2>
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>1. Prompt Testing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Test your system prompt with a variety of user queries:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Standard use cases the agent was designed for</li>
                    <li>Edge cases and unusual requests</li>
                    <li>Ambiguous or vague queries</li>
                    <li>Out-of-scope questions</li>
                    <li>Adversarial inputs</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>2. Data Accuracy Validation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Verify the agent returns accurate data:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Cross-reference with known benchmarks</li>
                    <li>Check statistical calculations</li>
                    <li>Verify data source citations</li>
                    <li>Confirm sample sizes are reported correctly</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>3. Response Quality Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Evaluate the quality of responses:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Clarity and readability</li>
                    <li>Appropriate level of detail</li>
                    <li>Consistent formatting</li>
                    <li>Actionable insights</li>
                    <li>Professional tone</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>4. User Acceptance Testing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Get feedback from actual users:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Share with a pilot group</li>
                    <li>Collect feedback on usefulness</li>
                    <li>Identify common failure modes</li>
                    <li>Iterate based on real usage patterns</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Test Case Template</h2>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground">{`{
  "testCase": "Standard audience analysis",
  "input": "Analyze Gen Z attitudes toward sustainability in the UK",
  "expectedBehavior": [
    "Returns demographic breakdown",
    "Includes attitude metrics",
    "Cites specific data points",
    "Provides statistical confidence"
  ],
  "validationCriteria": {
    "dataAccuracy": "Cross-reference with GWI platform",
    "responseFormat": "Matches defined structure",
    "sampleSize": "Reports n >= 100",
    "timeframe": "Uses last 12 months data"
  },
  "result": "pass|fail",
  "notes": ""
}`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Common Issues to Check</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Hallucination</strong> - Agent invents data or cites non-existent sources</li>
              <li><strong>Inconsistency</strong> - Same query produces different results</li>
              <li><strong>Scope creep</strong> - Agent answers questions outside its domain</li>
              <li><strong>Format errors</strong> - Response structure doesn&apos;t match specification</li>
              <li><strong>Data staleness</strong> - Using outdated information</li>
              <li><strong>Confidence inflation</strong> - Overstating certainty of findings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Testing Tools</h2>
            <p className="text-muted-foreground mb-4">
              The Agent Builder includes built-in testing tools:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Test Console</strong> - Run queries against your agent in real-time</li>
              <li><strong>Batch Testing</strong> - Run multiple test cases automatically</li>
              <li><strong>Response Comparison</strong> - Compare outputs across agent versions</li>
              <li><strong>Usage Analytics</strong> - Track real-world query patterns and failures</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Related Documentation</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/docs/custom-agents/builder">
                <Button variant="outline">Agent Builder</Button>
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
