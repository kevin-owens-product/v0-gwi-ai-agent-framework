import Link from "next/link"
import { ArrowLeft, Code2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function APIReferencePage() {
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
            <Code2 className="h-8 w-8 text-accent" />
            <h1 className="text-4xl font-bold text-foreground">API Reference</h1>
          </div>
          <p className="text-lg text-muted-foreground">Complete reference for the GWI Insights REST API.</p>
        </div>

        <Tabs defaultValue="agents" className="space-y-8">
          <TabsList>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="auth">Authentication</TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">GET /api/agents</h2>
              <p className="text-muted-foreground mb-4">List all available agents.</p>
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground">{`curl https://api.gwi.ai/v1/agents \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</pre>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">POST /api/agents/run</h2>
              <p className="text-muted-foreground mb-4">Execute an agent with a prompt.</p>
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground">{`curl https://api.gwi.ai/v1/agents/run \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent_id": "audience-explorer",
    "prompt": "Analyze Gen Z sustainability values",
    "data_sources": ["gwi_core", "social_media"]
  }'`}</pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">GET /api/workflows</h2>
              <p className="text-muted-foreground mb-4">List all workflows.</p>
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground">{`curl https://api.gwi.ai/v1/workflows \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">GET /api/reports</h2>
              <p className="text-muted-foreground mb-4">List all reports.</p>
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground">{`curl https://api.gwi.ai/v1/reports \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="auth" className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">Authentication</h2>
              <p className="text-muted-foreground mb-4">
                All API requests require authentication using an API key in the Authorization header.
              </p>
              <div className="rounded bg-muted p-4 font-mono text-sm">
                <pre className="text-foreground">{`Authorization: Bearer YOUR_API_KEY`}</pre>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Get your API key from the{" "}
                <Link href="/dashboard/settings/api-keys" className="text-accent hover:underline">
                  Settings
                </Link>{" "}
                page.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
