import Link from "next/link"
import { ArrowLeft, CheckCircle, Shield, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerificationPage() {
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
            <CheckCircle className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">Data Verification</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Best practices for verifying and validating AI-generated insights and data quality.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Why Verification Matters</h2>
            <p className="text-muted-foreground mb-4">
              AI agents generate insights from complex data sources. Verification ensures accuracy,
              reliability, and actionability of the results before they inform business decisions.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    Data Integrity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Ensure source data is complete, current, and properly formatted.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    Insight Accuracy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Cross-reference AI outputs against known benchmarks and historical data.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    Anomaly Detection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Identify and flag unusual patterns that may indicate data issues.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Verification Checklist</h2>
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">1. Source Data Validation</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Confirm data sources are connected and syncing properly</li>
                    <li>Check for data freshness and last update timestamps</li>
                    <li>Validate sample sizes meet minimum thresholds</li>
                    <li>Review data coverage across required segments and markets</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">2. Statistical Validation</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Check confidence intervals on key metrics</li>
                    <li>Verify margin of error is within acceptable ranges</li>
                    <li>Confirm statistical significance of reported changes</li>
                    <li>Review trend calculations for methodology consistency</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">3. Cross-Validation</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Compare results with alternative data sources</li>
                    <li>Validate against industry benchmarks</li>
                    <li>Check consistency with historical patterns</li>
                    <li>Run parallel analyses to confirm findings</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Automated Verification</h2>
            <p className="text-muted-foreground mb-4">
              Configure automated verification rules to catch issues before they reach stakeholders.
            </p>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground">{`// Example verification configuration
{
  "verification": {
    "dataFreshness": {
      "maxAgeHours": 24,
      "alertOnStale": true
    },
    "sampleSize": {
      "minimum": 1000,
      "warningThreshold": 2000
    },
    "confidenceLevel": {
      "required": 0.95,
      "minimum": 0.90
    },
    "anomalyDetection": {
      "enabled": true,
      "stdDevThreshold": 3.0
    }
  }
}`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Verification Reports</h2>
            <p className="text-muted-foreground mb-4">
              Every insight includes a verification score and detailed breakdown of data quality metrics.
            </p>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground">{`{
  "verificationReport": {
    "overallScore": 94,
    "status": "verified",
    "checks": {
      "dataFreshness": { "passed": true, "lastUpdated": "2024-01-10T08:00:00Z" },
      "sampleSize": { "passed": true, "count": 15420 },
      "confidence": { "passed": true, "level": 0.95 },
      "anomalies": { "passed": true, "flagged": 0 }
    },
    "recommendations": []
  }
}`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Related Documentation</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/docs/best-practices/security">
                <Button variant="outline">Security Best Practices</Button>
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
