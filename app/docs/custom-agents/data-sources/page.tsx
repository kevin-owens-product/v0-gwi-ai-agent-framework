import Link from "next/link"
import { ArrowLeft, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DataSourcesPage() {
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
            <Database className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">Data Source Configuration</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Configure which data your agents can access and how they use it.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Available Data Sources</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>GWI Core</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">
                    Comprehensive global consumer survey covering 50+ markets with 40,000+ data points.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Demographics & lifestyles</li>
                    <li>• Attitudes & opinions</li>
                    <li>• Purchase behaviors</li>
                    <li>• Media consumption</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>GWI USA</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">
                    Deep-dive into American consumers with enhanced sample sizes and US-specific questions.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Regional breakdowns</li>
                    <li>• Political attitudes</li>
                    <li>• US brand tracking</li>
                    <li>• Local media preferences</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>GWI Zeitgeist</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">
                    Monthly pulse surveys tracking emerging trends and timely topics.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Trending topics</li>
                    <li>• Current events impact</li>
                    <li>• Emerging behaviors</li>
                    <li>• Cultural moments</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Custom Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-2">
                    Upload and integrate your own datasets for analysis alongside GWI data.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• First-party customer data</li>
                    <li>• Survey results</li>
                    <li>• CRM exports</li>
                    <li>• Sales data</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Configuration Options</h2>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground">{`{
  "dataSources": {
    // Select which datasets the agent can access
    "datasets": ["gwi_core", "gwi_usa", "gwi_zeitgeist"],

    // Restrict to specific markets
    "markets": ["US", "UK", "DE", "FR", "JP"],

    // Set time range for data
    "timeRange": "last_12_months",

    // Enable/disable data types
    "enabledCategories": [
      "demographics",
      "attitudes",
      "behaviors",
      "media"
    ],

    // Set minimum sample size threshold
    "minSampleSize": 100,

    // Allow custom data uploads
    "allowCustomData": true
  }
}`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Market Coverage</h2>
            <p className="text-muted-foreground mb-4">
              GWI Core covers consumers in the following regions:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-muted-foreground">
              <div>
                <p className="font-medium text-foreground mb-2">Americas</p>
                <ul className="text-sm space-y-1">
                  <li>United States</li>
                  <li>Canada</li>
                  <li>Brazil</li>
                  <li>Mexico</li>
                  <li>Argentina</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground mb-2">Europe</p>
                <ul className="text-sm space-y-1">
                  <li>UK</li>
                  <li>Germany</li>
                  <li>France</li>
                  <li>Spain</li>
                  <li>Italy</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground mb-2">Asia Pacific</p>
                <ul className="text-sm space-y-1">
                  <li>Japan</li>
                  <li>China</li>
                  <li>India</li>
                  <li>Australia</li>
                  <li>South Korea</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground mb-2">MENA</p>
                <ul className="text-sm space-y-1">
                  <li>UAE</li>
                  <li>Saudi Arabia</li>
                  <li>Egypt</li>
                  <li>South Africa</li>
                  <li>Turkey</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Best Practices</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Only enable datasets your agent actually needs</li>
              <li>Set appropriate market restrictions based on your use case</li>
              <li>Use minimum sample size thresholds to ensure statistical reliability</li>
              <li>Consider data freshness when setting time ranges</li>
              <li>Document data source choices in your agent description</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Related Documentation</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/docs/custom-agents/builder">
                <Button variant="outline">Agent Builder</Button>
              </Link>
              <Link href="/docs/api">
                <Button variant="outline">API Reference</Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
