import Link from "next/link"
import { ArrowLeft, Webhook, Shield, Send, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function WebhooksAPIPage() {
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
            <Webhook className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">Webhooks API</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Receive real-time notifications when events occur in the GWI AI Platform.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Overview</h2>
            <p className="text-muted-foreground mb-4">
              Webhooks allow you to receive HTTP POST requests to your server when specific events
              occur. This enables real-time integrations with your existing systems.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-blue-500" />
                    Real-time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Receive notifications within seconds of events occurring.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    Secure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    HMAC signatures verify webhook authenticity.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-yellow-500" />
                    Reliable
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Automatic retries with exponential backoff.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Creating a Webhook</h2>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground">{`POST /api/v1/webhooks
Authorization: Bearer sk_live_...
Content-Type: application/json

{
  "url": "https://your-server.com/webhook",
  "events": [
    "agent.run.completed",
    "agent.run.failed",
    "insight.generated",
    "brand_health.alert"
  ],
  "secret": "your_webhook_secret",
  "enabled": true,
  "metadata": {
    "environment": "production"
  }
}

// Response
{
  "id": "wh_abc123",
  "url": "https://your-server.com/webhook",
  "events": ["agent.run.completed", "agent.run.failed", ...],
  "enabled": true,
  "created_at": "2024-01-10T12:00:00Z"
}`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Available Events</h2>
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Agent Events</h3>
                  <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                    <li><code className="bg-muted px-1 rounded">agent.run.started</code> - Agent run has begun</li>
                    <li><code className="bg-muted px-1 rounded">agent.run.completed</code> - Agent run finished successfully</li>
                    <li><code className="bg-muted px-1 rounded">agent.run.failed</code> - Agent run encountered an error</li>
                    <li><code className="bg-muted px-1 rounded">agent.created</code> - New agent was created</li>
                    <li><code className="bg-muted px-1 rounded">agent.updated</code> - Agent configuration changed</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Insight Events</h3>
                  <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                    <li><code className="bg-muted px-1 rounded">insight.generated</code> - New insight was generated</li>
                    <li><code className="bg-muted px-1 rounded">insight.verified</code> - Insight passed verification</li>
                    <li><code className="bg-muted px-1 rounded">insight.flagged</code> - Insight requires review</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Brand Tracking Events</h3>
                  <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                    <li><code className="bg-muted px-1 rounded">brand_health.alert</code> - Metric crossed threshold</li>
                    <li><code className="bg-muted px-1 rounded">brand_health.snapshot</code> - New snapshot available</li>
                    <li><code className="bg-muted px-1 rounded">competitive.change</code> - Significant competitive movement</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Webhook Payload</h2>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground">{`// Example webhook payload
POST https://your-server.com/webhook
Content-Type: application/json
X-Webhook-ID: wh_abc123
X-Webhook-Signature: sha256=d7a8fbb...
X-Webhook-Timestamp: 1704888000

{
  "id": "evt_xyz789",
  "type": "agent.run.completed",
  "created_at": "2024-01-10T12:00:00Z",
  "data": {
    "agent_id": "agent_123",
    "agent_name": "Brand Health Analyzer",
    "run_id": "run_456",
    "status": "completed",
    "duration_ms": 45230,
    "output": {
      "insights_count": 5,
      "metrics_analyzed": 12,
      "report_url": "https://app.gwi.ai/reports/..."
    }
  },
  "metadata": {
    "org_id": "org_abc",
    "triggered_by": "schedule"
  }
}`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Verifying Signatures</h2>
            <p className="text-muted-foreground mb-4">
              Always verify webhook signatures to ensure requests are authentic.
            </p>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground">{`// Node.js signature verification
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret, timestamp) {
  const signedPayload = \`\${timestamp}.\${JSON.stringify(payload)}\`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature.replace('sha256=', '')),
    Buffer.from(expectedSignature)
  );
}

// Python signature verification
import hmac
import hashlib

def verify_webhook(payload, signature, secret, timestamp):
    signed_payload = f"{timestamp}.{json.dumps(payload)}"
    expected = hmac.new(
        secret.encode(),
        signed_payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature.replace('sha256=', ''), expected)`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Retry Policy</h2>
            <p className="text-muted-foreground mb-4">
              Failed webhook deliveries are automatically retried with exponential backoff.
            </p>
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-semibold text-foreground">Attempt</th>
                        <th className="text-left py-2 font-semibold text-foreground">Delay</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b"><td className="py-2">1</td><td className="py-2">Immediate</td></tr>
                      <tr className="border-b"><td className="py-2">2</td><td className="py-2">1 minute</td></tr>
                      <tr className="border-b"><td className="py-2">3</td><td className="py-2">5 minutes</td></tr>
                      <tr className="border-b"><td className="py-2">4</td><td className="py-2">30 minutes</td></tr>
                      <tr><td className="py-2">5</td><td className="py-2">2 hours</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-muted-foreground text-sm mt-4">
                  After 5 failed attempts, the webhook is marked as failed and you&apos;ll be notified.
                </p>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Related Documentation</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/docs/api">
                <Button variant="outline">API Overview</Button>
              </Link>
              <Link href="/docs/workflows/triggers">
                <Button variant="outline">Workflow Triggers</Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
