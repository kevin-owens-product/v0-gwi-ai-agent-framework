import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, Brain, Users, Globe, Globe2, UserCircle, BookOpen, CheckCircle2, Eye } from "lucide-react"
import { LandingHeader } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { insightsAgents } from "@/lib/solution-agents"

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>

          <div className="mb-16 text-center">
            <Badge className="mb-4" variant="outline">
              For Insights Teams
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance mb-6">
              Uncover <span className="text-accent">Deep Human Truths</span>
            </h1>
            <p className="text-xl text-muted-foreground text-balance max-w-3xl mx-auto mb-8">
              Transform raw data into compelling narratives. Discover what motivates people, predict emerging trends,
              and deliver insights that drive strategy.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">
                  Book a Demo
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-8 mb-16">
            <Card className="p-8 border-accent/20">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Eye className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Key Challenges We Solve</h2>
                  <p className="text-muted-foreground">Common pain points for insights professionals</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Data Overload</h3>
                  <p className="text-sm text-muted-foreground">
                    Too much data, not enough time to synthesize meaningful insights
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Surface-Level Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Reports show what happened, but not why people behave the way they do
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Storytelling Gap</h3>
                  <p className="text-sm text-muted-foreground">
                    Struggle to turn data into compelling narratives that drive action
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Insights AI Agents</h2>
              <p className="text-muted-foreground">AI agents designed to accelerate insights discovery</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {insightsAgents.map((agent) => {
                const iconMap: Record<string, React.ReactNode> = {
                  Users: <Users className="h-5 w-5 text-blue-500" />,
                  Brain: <Brain className="h-5 w-5 text-purple-500" />,
                  Globe: <Globe className="h-5 w-5 text-green-500" />,
                  Globe2: <Globe2 className="h-5 w-5 text-orange-500" />,
                  UserCircle: <UserCircle className="h-5 w-5 text-pink-500" />,
                  BookOpen: <BookOpen className="h-5 w-5 text-cyan-500" />,
                }
                const colorMap: Record<string, string> = {
                  Users: "bg-blue-500/10",
                  Brain: "bg-purple-500/10",
                  Globe: "bg-green-500/10",
                  Globe2: "bg-orange-500/10",
                  UserCircle: "bg-pink-500/10",
                  BookOpen: "bg-cyan-500/10",
                }
                return (
                  <Link key={agent.id} href={`/dashboard/agents/${agent.id}`}>
                    <Card className="p-6 hover:border-accent/50 transition-colors h-full cursor-pointer">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-lg ${colorMap[agent.icon] || 'bg-blue-500/10'}`}>
                          {iconMap[agent.icon] || <Brain className="h-5 w-5 text-blue-500" />}
                        </div>
                        <h3 className="font-semibold">{agent.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {agent.description}
                      </p>
                      <ul className="space-y-2 text-sm">
                        {agent.capabilities.slice(0, 3).map((cap, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{cap}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 pt-4 border-t">
                        <span className="text-sm text-accent flex items-center gap-1">
                          Open Agent <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Pre-Built Workflows</h2>
              <p className="text-muted-foreground">Ready-to-use automation for common insights tasks</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-3">Audience Deep Dive Workflow</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Comprehensive analysis of target audience including behaviors, attitudes, media consumption, and
                  purchase drivers
                </p>
                <div className="flex gap-2">
                  <Badge variant="secondary">Audience Explorer</Badge>
                  <Badge variant="secondary">Motivation Decoder</Badge>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-3">Trend Analysis Workflow</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Identifies emerging trends, maps cultural shifts, and predicts future behaviors
                </p>
                <div className="flex gap-2">
                  <Badge variant="secondary">Culture Tracker</Badge>
                  <Badge variant="secondary">Global Perspective</Badge>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-3">Persona Development Workflow</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Creates rich personas with demographic, psychographic, and behavioral data
                </p>
                <div className="flex gap-2">
                  <Badge variant="secondary">Persona Architect</Badge>
                  <Badge variant="secondary">Audience Explorer</Badge>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-3">Executive Report Workflow</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Generates presentation-ready reports with key insights and recommendations
                </p>
                <div className="flex gap-2">
                  <Badge variant="secondary">Storytelling Agent</Badge>
                  <Badge variant="secondary">Global Perspective</Badge>
                </div>
              </Card>
            </div>
          </div>

          <div className="bg-accent/5 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Deliver Deeper Insights?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join leading insights teams using GWI Insights to uncover human truths that drive business strategy
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">
                  Talk to Our Team
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
