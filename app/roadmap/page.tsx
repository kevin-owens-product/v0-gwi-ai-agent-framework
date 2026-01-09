import Link from "next/link"
import { ArrowLeft, CheckCircle2, Circle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default function RoadmapPage() {
  const roadmapItems = [
    {
      quarter: "Q1 2025",
      status: "completed",
      items: [
        { title: "Inbox Agents", description: "AI assistants for automated request handling" },
        { title: "Command Palette", description: "Quick access to all features via ⌘K" },
        { title: "Canvas Mode", description: "Visual playground for building insights" },
      ],
    },
    {
      quarter: "Q2 2025",
      status: "in-progress",
      items: [
        { title: "Mobile Apps", description: "iOS and Android native applications" },
        { title: "Advanced Workflows", description: "Complex multi-step automation builder" },
        { title: "Real-time Collaboration", description: "Live co-editing and commenting" },
      ],
    },
    {
      quarter: "Q3 2025",
      status: "planned",
      items: [
        { title: "Agent Marketplace", description: "Community-built agent store" },
        { title: "API v2", description: "Enhanced REST and GraphQL APIs" },
        { title: "Custom Integrations", description: "Build your own data connectors" },
      ],
    },
    {
      quarter: "Q4 2025",
      status: "planned",
      items: [
        { title: "Enterprise SSO", description: "SAML and OAuth 2.0 support" },
        { title: "Advanced Analytics", description: "Predictive insights and forecasting" },
        { title: "White Label", description: "Fully branded deployments" },
      ],
    },
  ]

  const getStatusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle2 className="h-5 w-5 text-green-500" />
    if (status === "in-progress") return <Clock className="h-5 w-5 text-amber-500" />
    return <Circle className="h-5 w-5 text-muted-foreground" />
  }

  const getStatusBadge = (status: string) => {
    if (status === "completed")
      return (
        <Badge variant="default" className="bg-green-500/10 text-green-500">
          Completed
        </Badge>
      )
    if (status === "in-progress")
      return (
        <Badge variant="default" className="bg-amber-500/10 text-amber-500">
          In Progress
        </Badge>
      )
    return <Badge variant="secondary">Planned</Badge>
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Product Roadmap</h1>
            <p className="text-lg text-muted-foreground">See what we're building next and share your feedback.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {roadmapItems.map((quarter) => (
              <div key={quarter.quarter} className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">{quarter.quarter}</h2>
                  {getStatusBadge(quarter.status)}
                </div>
                <div className="space-y-4">
                  {quarter.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      {getStatusIcon(quarter.status)}
                      <div>
                        <h3 className="font-medium text-foreground">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
