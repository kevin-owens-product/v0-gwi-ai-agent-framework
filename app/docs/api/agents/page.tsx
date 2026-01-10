import Link from "next/link"
import { ArrowLeft, Bot, Play, Settings, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AgentsAPIPage() {
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
            <Bot className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">Agents API</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Programmatically manage and execute AI agents.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Endpoints Overview</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-semibold text-foreground">Method</th>
                        <th className="text-left py-2 font-semibold text-foreground">Endpoint</th>
                        <th className="text-left py-2 font-semibold text-foreground">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b"><td className="py-2 font-mono">GET</td><td className="py-2 font-mono">/api/v1/agents</td><td className="py-2">List all agents</td></tr>
                      <tr className="border-b"><td className="py-2 font-mono">POST</td><td className="py-2 font-mono">/api/v1/agents</td><td className="py-2">Create an agent</td></tr>
                      <tr className="border-b"><td className="py-2 font-mono">GET</td><td className="py-2 font-mono">/api/v1/agents/:id</td><td className="py-2">Get agent details</td></tr>
                      <tr className="border-b"><td className="py-2 font-mono">PUT</td><td className="py-2 font-mono">/api/v1/agents/:id</td><td className="py-2">Update an agent</td></tr>
                      <tr className="border-b"><td className="py-2 font-mono">DELETE</td><td className="py-2 font-mono">/api/v1/agents/:id</td><td className="py-2">Delete an agent</td></tr>
                      <tr className="border-b"><td className="py-2 font-mono">POST</td><td className="py-2 font-mono">/api/v1/agents/:id/run</td><td className="py-2">Execute an agent</td></tr>
                      <tr><td className="py-2 font-mono">GET</td><td className="py-2 font-mono">/api/v1/agents/:id/runs</td><td className="py-2">List agent runs</td></tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">List Agents</h2>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground">{`GET /api/v1/agents?status=active&type=research
Authorization: Bearer sk_live_...

// Response
{
  "data": [
    {
      "id": "agent_abc123",
      "name": "Brand Health Analyzer",
      "description": "Analyzes brand health metrics across segments",
      "type": "ANALYSIS",
      "status": "ACTIVE",
      "configuration": {
        "model": "gpt-4",
        "dataSources": ["brand_tracker", "social_listening"],
        "outputFormat": "structured-report"
      },
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-10T12:00:00Z",
      "run_count": 156,
      "last_run": "2024-01-10T09:00:00Z"
    },
    // ... more agents
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 45,
    "total_pages": 3
  }
}`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Create Agent</h2>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground">{`POST /api/v1/agents
Authorization: Bearer sk_live_...
Content-Type: application/json

{
  "name": "Competitive Intelligence Agent",
  "description": "Monitors competitor brand performance and market positioning",
  "type": "RESEARCH",
  "configuration": {
    "model": "gpt-4",
    "temperature": 0.7,
    "maxTokens": 4000,
    "dataSources": ["competitor_tracking", "market_data"],
    "competitors": ["competitor_a", "competitor_b", "competitor_c"],
    "metrics": ["awareness", "consideration", "market_share"],
    "outputFormat": "structured-report"
  },
  "prompt": "Analyze the competitive landscape for {brand} focusing on...",
  "schedule": {
    "enabled": true,
    "cron": "0 9 * * 1"
  }
}

// Response
{
  "id": "agent_xyz789",
  "name": "Competitive Intelligence Agent",
  "status": "ACTIVE",
  "created_at": "2024-01-10T12:00:00Z"
}`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Execute Agent</h2>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground">{`POST /api/v1/agents/agent_abc123/run
Authorization: Bearer sk_live_...
Content-Type: application/json

{
  "input": {
    "brand": "Nike",
    "segment": "Gen Z",
    "period": "last_30_days",
    "markets": ["US", "UK"]
  },
  "options": {
    "priority": "normal",
    "callback_url": "https://your-server.com/webhook"
  }
}

// Response
{
  "run_id": "run_123abc",
  "agent_id": "agent_abc123",
  "status": "running",
  "started_at": "2024-01-10T12:00:00Z",
  "estimated_duration": "5m"
}`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Get Agent Run Result</h2>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground">{`GET /api/v1/agents/agent_abc123/runs/run_123abc
Authorization: Bearer sk_live_...

// Response
{
  "run_id": "run_123abc",
  "agent_id": "agent_abc123",
  "status": "completed",
  "started_at": "2024-01-10T12:00:00Z",
  "completed_at": "2024-01-10T12:04:32Z",
  "duration_ms": 272000,
  "input": {
    "brand": "Nike",
    "segment": "Gen Z",
    "period": "last_30_days"
  },
  "output": {
    "summary": "Nike shows strong brand health among Gen Z...",
    "insights": [
      {
        "type": "trend",
        "title": "Rising brand awareness",
        "description": "Brand awareness increased 12% among Gen Z",
        "confidence": 0.95,
        "data": { "current": 78.5, "previous": 70.1, "change": 12.0 }
      }
    ],
    "metrics": {
      "awareness": 78.5,
      "consideration": 62.3,
      "preference": 45.8,
      "nps": 58
    },
    "recommendations": [
      "Increase TikTok presence to maintain momentum",
      "Leverage sustainability messaging for premium positioning"
    ]
  },
  "usage": {
    "tokens": 4520,
    "api_calls": 3,
    "data_points_analyzed": 15420
  }
}`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Agent Types</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>RESEARCH</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Gathers and synthesizes information from multiple sources.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>ANALYSIS</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Performs deep analysis on specific datasets and metrics.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>REPORTING</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Generates formatted reports and presentations.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>MONITORING</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Continuously monitors for changes and anomalies.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Error Handling</h2>
            <div className="rounded bg-muted p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-foreground">{`// Agent not found
{
  "error": {
    "code": "not_found",
    "message": "Agent not found",
    "status": 404
  }
}

// Agent execution failed
{
  "error": {
    "code": "agent_execution_failed",
    "message": "Agent failed to complete execution",
    "status": 500,
    "details": {
      "run_id": "run_123abc",
      "failure_reason": "Data source unavailable",
      "failed_at_step": "data_collection"
    }
  }
}

// Rate limit exceeded
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Agent run limit exceeded",
    "status": 429,
    "details": {
      "limit": 100,
      "period": "hour",
      "reset_at": "2024-01-10T13:00:00Z"
    }
  }
}`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Related Documentation</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/docs/api">
                <Button variant="outline">API Overview</Button>
              </Link>
              <Link href="/docs/first-agent">
                <Button variant="outline">Create Your First Agent</Button>
              </Link>
              <Link href="/docs/custom-agents/builder">
                <Button variant="outline">Agent Builder</Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
