import Link from "next/link"
import { Search, BarChart3, Users, Globe, TrendingUp, FileText, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LandingHeader } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default function MarketResearchPage() {
  const agents = [
    {
      name: "Market Mapper",
      icon: Globe,
      description: "Analyze market size, segmentation, and competitive dynamics across regions",
      capabilities: ["Market sizing", "Segment analysis", "Regional mapping", "Growth forecasting"],
    },
    {
      name: "Survey Analyzer",
      icon: BarChart3,
      description: "Process and synthesize survey data into actionable insights and narratives",
      capabilities: ["Data processing", "Pattern detection", "Insight extraction", "Report generation"],
    },
    {
      name: "Trend Tracker",
      icon: TrendingUp,
      description: "Monitor behavioral shifts, cultural movements, and emerging patterns",
      capabilities: ["Trend identification", "Momentum tracking", "Early signal detection", "Impact assessment"],
    },
    {
      name: "Competitive Intelligence",
      icon: Search,
      description: "Track competitor strategies, positioning, and market movements",
      capabilities: ["Competitor monitoring", "Strategy analysis", "Share tracking", "Threat assessment"],
    },
    {
      name: "Report Writer",
      icon: FileText,
      description: "Generate comprehensive research reports with charts, narratives, and recommendations",
      capabilities: ["Report structuring", "Data visualization", "Narrative generation", "Executive summaries"],
    },
    {
      name: "Segment Profiler",
      icon: Users,
      description: "Build detailed profiles of consumer segments with needs, behaviors, and attitudes",
      capabilities: ["Demographic analysis", "Psychographic profiling", "Need identification", "Persona creation"],
    },
  ]

  const workflows = [
    {
      name: "Market Sizing Study",
      time: "3 hours",
      description: "Define market, analyze segments, calculate TAM/SAM/SOM",
    },
    {
      name: "Competitive Landscape Analysis",
      time: "4 hours",
      description: "Map competitors, analyze positioning, identify opportunities",
    },
    {
      name: "Consumer Segmentation Study",
      time: "5 hours",
      description: "Cluster analysis, profile segments, recommend targeting",
    },
    {
      name: "Quarterly Trend Report",
      time: "2 hours",
      description: "Identify trends, assess momentum, predict impact",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      <main className="pt-24">
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <Badge variant="secondary" className="mb-4">
              Market Research
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Transform Data Into <span className="text-primary">Strategic Intelligence</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl text-pretty">
              Conduct comprehensive market research in hours, not weeks. Analyze consumer behavior, track trends, and
              deliver insights that drive strategic decisions.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="p-6 border-border/40">
                <h3 className="font-semibold mb-2">75% Faster</h3>
                <p className="text-sm text-muted-foreground">Research project completion with AI automation</p>
              </Card>
              <Card className="p-6 border-border/40">
                <h3 className="font-semibold mb-2">5x More</h3>
                <p className="text-sm text-muted-foreground">Studies delivered per researcher per quarter</p>
              </Card>
              <Card className="p-6 border-border/40">
                <h3 className="font-semibold mb-2">90% Lower</h3>
                <p className="text-sm text-muted-foreground">Cost per research project vs traditional methods</p>
              </Card>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/dashboard">Start Researching</Link>
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
                "Traditional research methods are too slow and expensive",
                "Difficulty synthesizing large volumes of data into insights",
                "Limited capacity to track trends and competitors continuously",
                "Creating compelling narratives from raw research data",
                "Maintaining consistency across multiple research projects",
                "Scaling research capabilities without scaling headcount",
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
              Specialized agents designed to accelerate every phase of the research process.
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
              Complete research projects faster with automated workflows for common study types.
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Accelerate Your Research?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join leading research teams using AI to deliver faster, deeper insights.
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
