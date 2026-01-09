import Link from "next/link"
import { ArrowLeft, TrendingUp, Users, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default function CaseStudiesPage() {
  const caseStudies = [
    {
      company: "Nike",
      industry: "Retail & E-commerce",
      title: "How Nike Increased Campaign ROI by 340% with AI-Powered Insights",
      challenge: "Nike needed to understand Gen Z preferences across 12 markets for their sustainability campaign.",
      solution:
        "Used GWI Insights' Audience Explorer and Motivation Decoder agents to analyze 2.8B consumer data points.",
      results: [
        { metric: "340%", label: "Campaign ROI" },
        { metric: "2.5x", label: "Engagement Rate" },
        { metric: "85%", label: "Time Saved" },
      ],
      icon: TrendingUp,
    },
    {
      company: "Unilever",
      industry: "Consumer Goods",
      title: "Unilever Launches 5 Products in 6 Months Using AI Agents",
      challenge: "Traditional research methods were too slow for fast-moving consumer trends.",
      solution: "Implemented automated workflows with Persona Architect and Culture Tracker agents.",
      results: [
        { metric: "5", label: "Products Launched" },
        { metric: "6", label: "Months Timeline" },
        { metric: "92%", label: "Accuracy Rate" },
      ],
      icon: Zap,
    },
    {
      company: "Spotify",
      industry: "Media & Entertainment",
      title: "Spotify Discovers Untapped Audience Segments with AI",
      challenge: "Needed to identify emerging music consumption patterns across generations.",
      solution: "Leveraged Global Perspective Agent and custom workflows for cross-market analysis.",
      results: [
        { metric: "12", label: "New Segments" },
        { metric: "45%", label: "User Growth" },
        { metric: "3.2M", label: "New Subscribers" },
      ],
      icon: Users,
    },
  ]

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
            <h1 className="text-4xl font-bold text-foreground mb-4">Case Studies</h1>
            <p className="text-lg text-muted-foreground">See how leading brands use GWI Insights to drive growth.</p>
          </div>

          <div className="space-y-12">
            {caseStudies.map((study, idx) => (
              <div key={idx} className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                      <study.icon className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">{study.company}</h3>
                      <Badge variant="secondary">{study.industry}</Badge>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-6">{study.title}</h2>
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Challenge</h4>
                      <p className="text-muted-foreground">{study.challenge}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Solution</h4>
                      <p className="text-muted-foreground">{study.solution}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border">
                    {study.results.map((result, ridx) => (
                      <div key={ridx} className="text-center">
                        <div className="text-3xl font-bold text-accent mb-1">{result.metric}</div>
                        <div className="text-sm text-muted-foreground">{result.label}</div>
                      </div>
                    ))}
                  </div>
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
