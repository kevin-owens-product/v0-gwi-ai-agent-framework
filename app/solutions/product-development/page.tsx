import Link from "next/link"
import { Search, ListOrdered, UserCircle, CheckCircle, DollarSign, Rocket, ArrowRight, CheckCircle2, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LandingHeader } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { productAgents } from "@/lib/solution-agents"

export default function ProductDevelopmentPage() {
  const workflows = [
    {
      name: "Product Discovery Sprint",
      time: "4 hours",
      description: "Identify opportunities, validate concepts, prioritize features",
    },
    {
      name: "User Research Synthesis",
      time: "3 hours",
      description: "Build personas, map journeys, identify pain points",
    },
    {
      name: "Pricing Strategy Analysis",
      time: "2 hours",
      description: "Analyze willingness to pay, competitive pricing, positioning",
    },
    {
      name: "Launch Planning Workflow",
      time: "5 hours",
      description: "Define launch strategy, audience targeting, go-to-market plan",
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
              Build Products That <span className="text-primary">Customers Actually Want</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl text-pretty">
              Validate product ideas with real consumer data. Understand user needs, prioritize features,
              and launch products with confidence using AI-powered insights.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="p-6 border-border/40">
                <h3 className="font-semibold mb-2">80% Faster</h3>
                <p className="text-sm text-muted-foreground">Product validation with AI-powered research</p>
              </Card>
              <Card className="p-6 border-border/40">
                <h3 className="font-semibold mb-2">3x Higher</h3>
                <p className="text-sm text-muted-foreground">Feature adoption rates with data-driven decisions</p>
              </Card>
              <Card className="p-6 border-border/40">
                <h3 className="font-semibold mb-2">60% Lower</h3>
                <p className="text-sm text-muted-foreground">Product failure rates with validated concepts</p>
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
                "Building features users don't actually want or need",
                "Difficulty understanding true user pain points and motivations",
                "Slow validation cycles delaying time to market",
                "Pricing products without understanding willingness to pay",
                "Launch failures due to poor market-product fit",
                "Feature prioritization based on opinions, not data",
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
            <h2 className="text-3xl font-bold mb-4">Product Development AI Agents</h2>
            <p className="text-muted-foreground mb-12 max-w-3xl">
              Intelligent agents that help you understand users and build products they love.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {productAgents.map((agent) => {
                const iconMap: Record<string, React.ReactNode> = {
                  Search: <Search className="h-6 w-6 text-primary" />,
                  ListOrdered: <ListOrdered className="h-6 w-6 text-primary" />,
                  UserCircle: <UserCircle className="h-6 w-6 text-primary" />,
                  CheckCircle: <CheckCircle className="h-6 w-6 text-primary" />,
                  DollarSign: <DollarSign className="h-6 w-6 text-primary" />,
                  Rocket: <Rocket className="h-6 w-6 text-primary" />,
                }
                return (
                  <Link key={agent.id} href={`/dashboard/agents/${agent.id}`}>
                    <Card className="p-6 border-border/40 hover:border-primary/50 transition-colors h-full cursor-pointer">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          {iconMap[agent.icon] || <Brain className="h-6 w-6 text-primary" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{agent.name}</h3>
                          <p className="text-sm text-muted-foreground mb-4">{agent.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {agent.capabilities.slice(0, 4).map((cap, j) => (
                              <Badge key={j} variant="secondary" className="text-xs">
                                {cap}
                              </Badge>
                            ))}
                          </div>
                          <div className="mt-4">
                            <span className="text-sm text-primary flex items-center gap-1">
                              Open Agent <ArrowRight className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-4">Pre-built Workflows</h2>
            <p className="text-muted-foreground mb-12 max-w-3xl">
              Accelerate product development with structured workflows for common tasks.
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Build Products Users Love?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join product teams using consumer insights to build successful products.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/dashboard">
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
