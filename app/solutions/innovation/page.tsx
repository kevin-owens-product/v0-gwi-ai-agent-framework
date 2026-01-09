import Link from "next/link"
import { Lightbulb, Rocket, Zap, Users, TrendingUp, Brain, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LandingHeader } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default function InnovationPage() {
  const agents = [
    {
      name: "Opportunity Finder",
      icon: Lightbulb,
      description: "Identify white space opportunities and unmet needs in the market",
      capabilities: ["Gap analysis", "Need identification", "Trend intersection", "Opportunity scoring"],
    },
    {
      name: "Ideation Engine",
      icon: Zap,
      description: "Generate innovative concepts by combining insights from multiple sources",
      capabilities: ["Concept generation", "Lateral thinking", "Constraint solving", "Idea refinement"],
    },
    {
      name: "Trend Synthesizer",
      icon: TrendingUp,
      description: "Connect emerging trends to identify future opportunities",
      capabilities: ["Cross-trend analysis", "Future forecasting", "Signal detection", "Impact modeling"],
    },
    {
      name: "Innovation Validator",
      icon: Brain,
      description: "Test innovation concepts against market needs and viability",
      capabilities: ["Concept testing", "Feasibility analysis", "Market readiness", "Risk assessment"],
    },
    {
      name: "Consumer Co-creator",
      icon: Users,
      description: "Design solutions with deep understanding of user needs and behaviors",
      capabilities: ["User research", "Empathy mapping", "Jobs-to-be-done", "Solution design"],
    },
    {
      name: "Launch Accelerator",
      icon: Rocket,
      description: "Develop go-to-market strategies for breakthrough innovations",
      capabilities: ["GTM planning", "Early adopter targeting", "Narrative building", "Launch optimization"],
    },
  ]

  const workflows = [
    {
      name: "Innovation Sprint",
      time: "6 hours",
      description: "Identify opportunities, generate concepts, validate ideas, plan MVP",
    },
    {
      name: "Trend-to-Innovation",
      time: "4 hours",
      description: "Analyze trends, find intersections, generate concepts, assess viability",
    },
    {
      name: "Consumer Problem Solving",
      time: "3 hours",
      description: "Research pain points, ideate solutions, validate with users",
    },
    {
      name: "Future Scenario Planning",
      time: "5 hours",
      description: "Build scenarios, identify implications, recommend strategies",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      <main className="pt-24">
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <Badge variant="secondary" className="mb-4">
              Innovation & Strategy
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Turn Consumer Insights Into <span className="text-primary">Breakthrough Innovation</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl text-pretty">
              Discover opportunities, generate breakthrough ideas, and validate innovations grounded in real human
              needs. Move from insight to impact faster than ever.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="p-6 border-border/40">
                <h3 className="font-semibold mb-2">10x More</h3>
                <p className="text-sm text-muted-foreground">Innovation concepts explored per quarter</p>
              </Card>
              <Card className="p-6 border-border/40">
                <h3 className="font-semibold mb-2">65% Faster</h3>
                <p className="text-sm text-muted-foreground">Time from idea to validated concept</p>
              </Card>
              <Card className="p-6 border-border/40">
                <h3 className="font-semibold mb-2">2x Higher</h3>
                <p className="text-sm text-muted-foreground">Success rate for launched innovations</p>
              </Card>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/dashboard">Start Innovating</Link>
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
                "Innovation efforts disconnected from real consumer needs",
                "Difficulty generating truly breakthrough ideas consistently",
                "Limited resources for extensive trend analysis and synthesis",
                "High failure rate of innovations due to poor market fit",
                "Slow time-to-market for innovative concepts",
                "Inability to predict which innovations will succeed",
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
              Intelligent agents that help you discover opportunities and create breakthrough solutions.
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
              Accelerate innovation with structured workflows that guide you from insight to launch.
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Unlock Breakthrough Innovation?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join forward-thinking organizations using human insights to drive innovation.
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
