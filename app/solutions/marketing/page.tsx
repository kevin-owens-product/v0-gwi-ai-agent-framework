import Link from "next/link"
import { Users, TrendingUp, Target, Sparkles, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LandingHeader } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default function MarketingPage() {
  const agents = [
    {
      name: "Campaign Strategist",
      icon: Target,
      description: "Design data-driven marketing campaigns based on audience insights and trends",
      capabilities: ["Audience targeting", "Channel strategy", "Message positioning", "Budget allocation"],
    },
    {
      name: "Content Creator",
      icon: Sparkles,
      description: "Generate campaign concepts, copy, and creative briefs aligned with audience values",
      capabilities: ["Copy generation", "Creative briefs", "Message testing", "Brand alignment"],
    },
    {
      name: "Trend Forecaster",
      icon: TrendingUp,
      description: "Identify emerging trends and cultural shifts to inform campaign timing",
      capabilities: ["Trend detection", "Cultural analysis", "Timing optimization", "Opportunity scoring"],
    },
    {
      name: "Audience Profiler",
      icon: Users,
      description: "Build detailed audience profiles with demographics, psychographics, and behaviors",
      capabilities: ["Segment analysis", "Persona building", "Journey mapping", "Need identification"],
    },
    {
      name: "Performance Predictor",
      icon: TrendingUp,
      description: "Forecast campaign performance and optimize spend allocation across channels",
      capabilities: ["ROI forecasting", "Channel optimization", "A/B test planning", "KPI modeling"],
    },
    {
      name: "Social Listener",
      icon: MessageSquare,
      description: "Monitor social conversations and sentiment to inform brand positioning",
      capabilities: ["Sentiment analysis", "Topic tracking", "Competitor monitoring", "Crisis detection"],
    },
  ]

  const workflows = [
    {
      name: "Campaign Launch Plan",
      time: "3 hours",
      description: "Research audience, develop strategy, create content brief",
    },
    {
      name: "Seasonal Campaign Ideation",
      time: "2 hours",
      description: "Identify trends, generate concepts, validate with data",
    },
    {
      name: "Influencer Partnership Strategy",
      time: "2 hours",
      description: "Find aligned influencers, analyze audience fit, create brief",
    },
    {
      name: "Competitive Campaign Analysis",
      time: "1 hour",
      description: "Track competitor campaigns, extract insights, recommend actions",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      <main className="pt-24">
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <Badge variant="secondary" className="mb-4">
              Marketing & Brand
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Create Campaigns That <span className="text-primary">Resonate with Real People</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl text-pretty">
              Build marketing strategies grounded in human insights. Understand what your audience truly cares about and
              create campaigns that drive authentic engagement.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="p-6 border-border/40">
                <h3 className="font-semibold mb-2">60% Faster</h3>
                <p className="text-sm text-muted-foreground">Campaign planning with AI-powered audience research</p>
              </Card>
              <Card className="p-6 border-border/40">
                <h3 className="font-semibold mb-2">2.5x Higher</h3>
                <p className="text-sm text-muted-foreground">Engagement rates with insight-driven messaging</p>
              </Card>
              <Card className="p-6 border-border/40">
                <h3 className="font-semibold mb-2">50% Better</h3>
                <p className="text-sm text-muted-foreground">Brand perception scores from authentic positioning</p>
              </Card>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/dashboard">Start Creating Campaigns</Link>
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
                "Generic campaigns that fail to resonate with target audiences",
                "Limited time and resources for deep audience research",
                "Difficulty predicting which messages will perform best",
                "Keeping up with rapidly changing consumer trends and values",
                "Measuring emotional impact and brand perception",
                "Creating authentic campaigns in an oversaturated market",
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
              Intelligent agents that understand your audience and help you create campaigns that connect.
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
              Accelerate your marketing process with ready-to-use workflows for common scenarios.
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Create More Impactful Campaigns?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join innovative brands using human insights to drive authentic engagement.
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
