import { Header } from "@/components/landing/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Book, Code, Cpu, FileText, Lightbulb, Play, Search, Zap, ChevronRight, ExternalLink } from "lucide-react"
import Link from "next/link"

const categories = [
  {
    title: "Getting Started",
    icon: Play,
    description: "Learn the basics and set up your first agent",
    links: [
      { title: "Quick Start Guide", href: "/docs/quickstart" },
      { title: "Platform Overview", href: "/docs/overview" },
      { title: "Your First Agent", href: "/docs/first-agent" },
      { title: "Understanding Workflows", href: "/docs/workflows-intro" },
    ],
  },
  {
    title: "Pre-built Agents",
    icon: Cpu,
    description: "Explore and configure our pre-built agents",
    links: [
      { title: "Audience Strategist", href: "/docs/agents/audience-strategist" },
      { title: "Creative Brief Builder", href: "/docs/agents/creative-brief" },
      { title: "Competitive Tracker", href: "/docs/agents/competitive-tracker" },
      { title: "Market Trend Spotter", href: "/docs/agents/trend-spotter" },
    ],
  },
  {
    title: "Custom Agents",
    icon: Lightbulb,
    description: "Build and deploy your own agents",
    links: [
      { title: "Agent Builder Guide", href: "/docs/custom-agents/builder" },
      { title: "System Prompts", href: "/docs/custom-agents/prompts" },
      { title: "Data Source Configuration", href: "/docs/custom-agents/data-sources" },
      { title: "Testing & Validation", href: "/docs/custom-agents/testing" },
    ],
  },
  {
    title: "Workflows",
    icon: Zap,
    description: "Automate multi-step research processes",
    links: [
      { title: "Workflow Builder", href: "/docs/workflows/builder" },
      { title: "Triggers & Schedules", href: "/docs/workflows/triggers" },
      { title: "Agent Orchestration", href: "/docs/workflows/orchestration" },
      { title: "Output Templates", href: "/docs/workflows/outputs" },
    ],
  },
  {
    title: "API Reference",
    icon: Code,
    description: "Integrate GWI agents into your systems",
    links: [
      { title: "Authentication", href: "/docs/api/auth" },
      { title: "Agents API", href: "/docs/api/agents" },
      { title: "Workflows API", href: "/docs/api/workflows" },
      { title: "Webhooks", href: "/docs/api/webhooks" },
    ],
  },
  {
    title: "Best Practices",
    icon: Book,
    description: "Tips for getting the most out of GWI",
    links: [
      { title: "Prompt Engineering", href: "/docs/best-practices/prompts" },
      { title: "Data Verification", href: "/docs/best-practices/verification" },
      { title: "Team Collaboration", href: "/docs/best-practices/collaboration" },
      { title: "Security Guidelines", href: "/docs/best-practices/security" },
    ],
  },
]

const popularArticles = [
  { title: "Quick Start Guide", description: "Get up and running in 5 minutes", href: "/docs/quickstart" },
  {
    title: "Building Custom Agents",
    description: "Create agents tailored to your needs",
    href: "/docs/custom-agents/builder",
  },
  { title: "API Authentication", description: "Securely integrate with our APIs", href: "/docs/api/auth" },
  { title: "Workflow Automation", description: "Set up automated research pipelines", href: "/docs/workflows/builder" },
]

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24">
        {/* Hero */}
        <section className="py-16 border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4">Documentation</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Everything you need to build powerful AI-driven consumer insights workflows.
              </p>
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search documentation..." className="pl-10 h-12 text-lg" />
              </div>
            </div>
          </div>
        </section>

        {/* Popular Articles */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-semibold mb-6">Popular Articles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularArticles.map((article) => (
                <Link key={article.title} href={article.href}>
                  <Card className="h-full hover:border-primary transition-colors">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{article.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{article.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {categories.map((category) => (
                <Card key={category.title}>
                  <CardHeader>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                      <category.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.links.map((link) => (
                        <li key={link.title}>
                          <Link
                            href={link.href}
                            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ChevronRight className="h-4 w-4 mr-1" />
                            {link.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Help Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      API Reference
                    </CardTitle>
                    <CardDescription>Complete API documentation with examples</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <Link href="/docs/api">
                        View API Docs
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      Need Help?
                    </CardTitle>
                    <CardDescription>Can't find what you're looking for?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <Link href="/contact">
                        Contact Support
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
