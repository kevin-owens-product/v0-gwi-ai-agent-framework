import Link from "next/link"
import { ArrowLeft, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthPage() {
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
            <Key className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">Authentication</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Secure your API requests with proper authentication.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">API Keys</h2>
            <p className="text-muted-foreground mb-4">
              All API requests require authentication using an API key. Include your key in the
              Authorization header of every request.
            </p>
            <div className="rounded bg-muted p-4 font-mono text-sm">
              <pre className="text-foreground">{`Authorization: Bearer YOUR_API_KEY`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Getting Your API Key</h2>
            <ol className="list-decimal list-inside text-muted-foreground space-y-2 mb-4">
              <li>Log in to your GWI AI Platform dashboard</li>
              <li>Navigate to Settings → API Keys</li>
              <li>Click &quot;Generate New Key&quot;</li>
              <li>Give your key a descriptive name</li>
              <li>Copy and securely store the key (it won&apos;t be shown again)</li>
            </ol>
            <Link href="/dashboard/settings/api-keys">
              <Button variant="outline">Manage API Keys</Button>
            </Link>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Authentication Examples</h2>
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>cURL</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded bg-muted p-4 font-mono text-sm">
                    <pre className="text-foreground">{`curl https://api.gwi.ai/v1/agents \\
  -H "Authorization: Bearer sk_live_abc123..."`}</pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>JavaScript / Node.js</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded bg-muted p-4 font-mono text-sm">
                    <pre className="text-foreground">{`const response = await fetch('https://api.gwi.ai/v1/agents', {
  headers: {
    'Authorization': 'Bearer sk_live_abc123...',
    'Content-Type': 'application/json'
  }
});`}</pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Python</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded bg-muted p-4 font-mono text-sm">
                    <pre className="text-foreground">{`import requests

response = requests.get(
    'https://api.gwi.ai/v1/agents',
    headers={'Authorization': 'Bearer sk_live_abc123...'}
)`}</pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Key Types</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Live Keys (sk_live_...)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Use for production applications. These keys have full access to your data
                    and count against your usage quota.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Test Keys (sk_test_...)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Use for development and testing. These keys return mock data and don&apos;t
                    count against your quota.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Security Best Practices</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Never expose keys in client-side code</strong> - Always make API calls from your server</li>
              <li><strong>Use environment variables</strong> - Don&apos;t hardcode keys in your source code</li>
              <li><strong>Rotate keys regularly</strong> - Generate new keys periodically</li>
              <li><strong>Use separate keys</strong> - Different keys for different environments/applications</li>
              <li><strong>Monitor usage</strong> - Watch for unexpected API activity</li>
              <li><strong>Revoke compromised keys</strong> - Immediately disable any exposed keys</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Error Responses</h2>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground">{`// Missing or invalid API key
{
  "error": {
    "code": "unauthorized",
    "message": "Invalid API key provided",
    "status": 401
  }
}

// Expired API key
{
  "error": {
    "code": "key_expired",
    "message": "API key has expired",
    "status": 401
  }
}

// Rate limit exceeded
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Too many requests",
    "status": 429,
    "retryAfter": 60
  }
}`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Related Documentation</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/docs/api">
                <Button variant="outline">API Reference</Button>
              </Link>
              <Link href="/dashboard/settings/api-keys">
                <Button variant="outline">Manage API Keys</Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
