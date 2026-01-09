import Link from "next/link"
import { Target, TrendingUp, Users, Brain, BarChart3, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LandingHeader } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default function AdSalesPage() {
  const agents = [
    {
      name: "Audience Packager",
      icon: Target,
      description: "Create compelling audience packages based on behavioral and demographic insights",
      capabilities: ["Segment analysis", "Package optimization", "Competitive positioning", "Pricing recommendations"],
    },
    {
      name: "Media Planner",
      icon: TrendingUp,
      description: "Optimize media plans with real-time audience data and performance predictions",
      capabilities: ["Reach forecasting", "Budget allocation", "Channel mix optimization", "Performance modeling"],
    },
    {
      name: "Pitch Generator",
      icon: Sparkles,
      description: "Generate data-driven pitch decks with audience insights and market opportunities",
      capabilities: ["Auto-generate presentations", "Insight extraction", "Competitive analysis", "ROI projections"],
    },
    {
      name: "Inventory Optimizer",
      icon: BarChart3,
      description: "Maximize inventory value by matching audience segments to advertiser needs",
      capabilities: ["Inventory analysis", "Yield optimization", "Demand forecasting", "Pricing strategy"],
    },
    {
      name: "Proposal Writer",
      icon: Brain,
      description: "Draft customized proposals with audience data, case studies, and pricing",
      capabilities: ["Template generation", "Data integration", "Case study matching", "Custom recommendations"],
    },
    {
      name: "Market Intelligence",
      icon: Users,
      description: "Track advertiser trends, budget flows, and category opportunities",
      capabilities: ["Advertiser tracking", "Budget analysis", "Category trends", "Opportunity scoring"],
    },
  ]

  const workflows = [
    {
      name: "Advertiser RFP Response",
      time: "2 hours",
      description: "Analyze RFP, match inventory, generate proposal",
    },
    {
      name: "Quarterly Upfront Package",
      time: "4 hours",
      description: "Build audience packages, pricing, and presentation",
    },
    {
      name: "Category Deep Dive",
      time: "3 hours",
      description: "Research category trends, competitor analysis, opportunity report",
    },
    {
      name: "Campaign Performance Review",
      time: "1 hour",
      description: "Analyze results, generate insights, create renewal proposal",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <Badge variant="secondary" className="mb-4">
              Ad Sales & Revenue
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Close More Deals with <span className="text-primary">AI-Powered Audience Intelligence</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl text-pretty">
              Accelerate your ad sales process with AI agents that analyze audiences, optimize inventory, and generate
              compelling proposals in minutes, not days.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="p-6 border-border/40">
                <h3 className="font-semibold mb-2">70% Faster</h3>
                <p className="text-sm text-muted-foreground">RFP response time with automated proposal generation</p>
              </Card>
              <Card className="p-6 border-border/40">
                <h3 className="font-semibold mb-2">3x More</h3>
                <p className="text-sm text-muted-foreground">Audience packages created per sales rep per quarter</p>
              </Card>
              <Card className="p-6 border-border/40">
                <h3 className="font-semibold mb-2">40% Higher</h3>
                <p className="text-sm text-muted-foreground">Win rates with data-driven pitch customization</p>
              </Card>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/dashboard">Start Building Packages</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Request Demo</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Key Challenges */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-8">Key Challenges We Solve</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Manual audience package creation is time-consuming and inconsistent",
                "Difficulty matching inventory to advertiser needs at scale",
                "Creating custom proposals for every RFP requires hours of work",
                "Limited visibility into advertiser trends and budget flows",
                "Inability to quickly respond to market opportunities",
                "Lack of data-driven insights in sales conversations",
              ].map((challenge, i) => (
                <div key={i} className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">{challenge}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recommended Agents */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-4">Recommended AI Agents</h2>
            <p className="text-muted-foreground mb-12 max-w-3xl">
              Purpose-built agents designed to accelerate your ad sales workflow from prospecting to closing.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {agents.map((agent, i) => (
                <Card key={i} className="p-6 border-border/40 hover:border-primary/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <agent.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{agent.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{agent.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {agent.capabilities.map((cap, j) => (
                          <Badge key={j} variant="secondary" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pre-built Workflows */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-4">Pre-built Workflows</h2>
            <p className="text-muted-foreground mb-12 max-w-3xl">
              Start selling faster with proven workflows that orchestrate multiple agents to complete complex tasks.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {workflows.map((workflow, i) => (
                <Card key={i} className="p-6 border-border/40">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold">{workflow.name}</h3>
                    <Badge variant="outline">{workflow.time}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{workflow.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Ad Sales Process?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join leading media companies using AI to close more deals, faster.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Talk to Sales</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
