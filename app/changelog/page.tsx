import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default function ChangelogPage() {
  const updates = [
    {
      version: "3.0.0",
      date: "January 10, 2026",
      type: "Major Release",
      items: [
        "🚀 Real LLM Execution - Multi-provider support with Anthropic Claude, OpenAI GPT, and GWI Spark (no more mock data)",
        "📊 Multi-Format Reports - Export to PDF, PowerPoint, Excel, CSV, and HTML with AI-powered content generation",
        "⏰ Scheduled Workflows - Automated cron-based execution with email notifications on completion/failure",
        "🔐 SSO/SAML 2.0 - Enterprise authentication with Azure AD, Google Workspace, and custom SAML providers",
        "🔌 Integrations Hub - Connect with Slack, Zapier, webhooks, and 5000+ apps via API",
        "⚡ Enterprise Reliability - Circuit breakers, retry logic, and request timeouts ensure 99.9% uptime",
        "📈 Advanced Analytics - Comprehensive dashboards with token tracking, cost estimation, and performance metrics",
        "🧠 Context-Aware Agents - Memory context automatically integrated with all agent executions",
        "✉️ Email Notifications - Team invitations, workflow updates, and password resets fully operational",
        "🛡️ Enhanced Security - 40+ database indexes for performance, audit logs, and RBAC improvements",
        "🏗️ Code Quality - TypeScript type safety improvements, shared utilities, and standardized error handling",
        "📦 Background Jobs - Automated cleanup for expired sessions, tokens, and memory items",
      ],
    },
    {
      version: "2.4.0",
      date: "January 8, 2025",
      type: "Feature",
      items: [
        "Added Inbox Agents for automated request handling",
        "Introduced Command Palette (⌘K) for quick navigation",
        "New Canvas mode in Playground for visual outputs",
        "Enhanced Report Builder with presentation editor",
      ],
    },
    {
      version: "2.3.0",
      date: "December 15, 2024",
      type: "Feature",
      items: [
        "Multi-agent orchestration with sub-agent spawning",
        "Advanced memory management with confidence scoring",
        "Template library for reusable workflows",
        "Real-time collaboration on reports",
      ],
    },
    {
      version: "2.2.1",
      date: "November 28, 2024",
      type: "Fix",
      items: [
        "Fixed citation preview rendering issues",
        "Improved playground performance with large datasets",
        "Resolved workflow export formatting bugs",
      ],
    },
    {
      version: "2.2.0",
      date: "November 10, 2024",
      type: "Feature",
      items: [
        "Launched Agent Store marketplace",
        "Added 12 pre-built human insights agents",
        "Introduced workflow scheduling",
        "Enhanced analytics dashboard with real-time metrics",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Changelog</h1>
            <p className="text-lg text-muted-foreground">Track our latest updates, features, and improvements.</p>
          </div>

          <div className="space-y-12">
            {updates.map((update) => (
              <div key={update.version} className="border-l-2 border-accent pl-6">
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="text-2xl font-semibold text-foreground">v{update.version}</h2>
                  <Badge variant={update.type === "Feature" ? "default" : "secondary"}>{update.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{update.date}</p>
                <ul className="space-y-2">
                  {update.items.map((item, idx) => (
                    <li key={idx} className="text-foreground flex items-start gap-2">
                      <span className="text-accent mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
