import Link from "next/link"
import { Package, Users, Lightbulb, TrendingUp, Target, TestTube, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LandingHeader } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default function ProductPage() {
  const agents = [
    {
      name: "Opportunity Scout",
      icon: Lightbulb,
      description: "Identify unmet needs and market gaps through consumer behavior analysis",
      capabilities: ["Need identification", "Gap analysis", "Opportunity scoring", "Market sizing"],
    },
    {
      name: "Feature Prioritizer",
      icon: Target,
      description: "Rank feature requests based on user impact, effort, and market demand",
      capabilities: ["User impact scoring", "Effort estimation", "ROI calculation", "Roadmap optimization"],
    },
    {
      name: "User Persona Builder",
      icon: Users,
      description: "Create detailed user personas with jobs-to-be-done and pain points",
      capabilities: ["Persona generation", "Journey mapping", "Pain point analysis", "Use case documentation"],
    },
    {
      name: "Concept Validator",
      icon: TestTube,
      description: "Test product concepts against real user needs and market demand",
      capabilities: ["Concept testing", "Demand validation", "Competitive analysis", "Risk assessment"],
    },
    {
      name: "Pricing Strategist",
      icon: TrendingUp,
      description: "Optimize pricing based on value perception and competitive landscape",
      capabilities: ["Price sensitivity analysis", "Value mapping", "Competitive benchmarking", "Tier recommendations"],
    },
    {
      name: "Launch Planner",
      icon: Package,
      description: "Create go-to-market strategies informed by audience insights and timing",
      capabilities: ["GTM strategy", "Channel selection", "Message positioning", "Launch timing"],
    },
  ]

  const workflows = [
    {
      name: "Product Discovery Sprint",
      time: "4 hours",
      description: "Identify opportunities, validate demand, prioritize features",
    },
    {
      name: "Feature Impact Analysis",
      time: "1 hour",
      description: "Analyze user impact, estimate effort, recommend priority",
    },
    {
      name: "Competitive Product Analysis",
      time: "2 hours",
      description: "Map competitor features, identify differentiators, recommend positioning",
    },
    {
      name: "Launch Readiness Check",
      time: "2 hours",
      description: "Validate market fit, assess timing, create launch plan",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      <main className="pt-24">
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <Badge variant="secondary" className="mb-4">
              Product Development
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Build Products People <span className="text-primary">Actually Want and Need</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl text-pretty">
              Make confident product decisions backed by real human insights. Understand what problems people are trying
              to solve and build solutions that truly resonate.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="p-6 border-border/40">
                <h3 className="font-semibold mb-2">80% Faster</h3>
                <p className="text-sm text-muted-foreground">Market research and opportunity identification</p>
              </Card>
              <Card className="p-6 border-border/40">
                <h3 className="font-semibold mb-2">3x More</h3>
                <p className="text-sm text-muted-foreground">Product concepts validated per quarter</p>
              </Card>
              <Card className="p-6 border-border/40">
                <h3 className="font-semibold mb-2">45% Higher</h3>
                <p className="text-sm text-muted-foreground">Product-market fit scores at launch</p>
              </Card>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/dashboard">Start Building Products</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Request Demo</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-8">Key Challenges We Solve</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Building features based on assumptions rather than real user needs",
                "Limited resources for comprehensive market research",
                "Difficulty prioritizing features with confidence",
                "Validating concepts before significant investment",
                'Understanding the "why" behind user behavior',
                "Launching products that fail to achieve product-market fit",
              ].map((challenge, i) => (
                <div key={i} className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">{challenge}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-4">Recommended AI Agents</h2>
            <p className="text-muted-foreground mb-12 max-w-3xl">
              Purpose-built agents that help you discover opportunities and validate ideas with confidence.
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

        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-4">Pre-built Workflows</h2>
            <p className="text-muted-foreground mb-12 max-w-3xl">
              Accelerate your product development process with proven workflows.
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

        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Build Better Products?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join leading product teams using human insights to drive innovation.
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
