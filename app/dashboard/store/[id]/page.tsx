"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Star,
  Download,
  Check,
  Clock,
  Target,
  Shield,
  Zap,
  ChevronRight,
  Verified,
  Play,
  Copy,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"
import Link from "next/link"

const agentDetails = {
  id: "audience-strategist-pro",
  name: "Audience Strategist Pro",
  description:
    "Advanced audience segmentation with predictive modeling and lookalike expansion. Build detailed, data-driven personas that go beyond demographics to understand motivations, behaviors, and media preferences.",
  longDescription: `The Audience Strategist Pro agent leverages GWI's comprehensive consumer database to build rich, actionable audience profiles. 

Using advanced clustering algorithms and predictive modeling, it identifies not just who your audience is, but why they behave the way they do.

Key capabilities include:
- Multi-dimensional audience segmentation
- Predictive lookalike modeling
- Cross-platform behavior analysis
- Real-time persona updates
- Competitive audience benchmarking`,
  author: "GWI Labs",
  verified: true,
  rating: 4.9,
  reviews: 284,
  installs: "12.4k",
  category: "Audience & Targeting",
  price: "Included",
  version: "2.4.1",
  lastUpdated: "2024-01-15",
  dataSources: ["GWI Core", "GWI USA", "GWI Zeitgeist", "Custom Uploads"],
  capabilities: [
    "Build multi-dimensional audience personas",
    "Identify lookalike audiences for expansion",
    "Analyze cross-platform behaviors",
    "Compare audiences against competitors",
    "Generate presentation-ready profiles",
    "Export segments to ad platforms",
  ],
  examplePrompts: [
    "Build a persona for millennial coffee drinkers in the UK",
    "Find lookalike audiences for our current customers",
    "Compare our target audience with Competitor X's audience",
    "What media channels does our audience use most?",
  ],
  ratings: {
    5: 78,
    4: 15,
    3: 5,
    2: 1,
    1: 1,
  },
  reviews: [
    {
      id: 1,
      author: "Sarah M.",
      role: "Senior Researcher",
      company: "Global Brand Co",
      rating: 5,
      date: "2024-01-10",
      content:
        "This agent has completely transformed how we build audience profiles. The depth of insight is incredible, and the time savings are substantial.",
      helpful: 24,
    },
    {
      id: 2,
      author: "James L.",
      role: "Strategy Director",
      company: "MediaCorp",
      rating: 5,
      date: "2024-01-05",
      content:
        "The lookalike modeling feature is a game-changer. We've discovered new audience segments we never would have found manually.",
      helpful: 18,
    },
    {
      id: 3,
      author: "Michelle K.",
      role: "Brand Manager",
      company: "Consumer Goods Inc",
      rating: 4,
      date: "2023-12-28",
      content:
        "Great agent overall. Would love to see more customization options for the output format, but the insights are top-notch.",
      helpful: 12,
    },
  ],
  relatedAgents: [
    { id: "consumer-journey-mapper", name: "Consumer Journey Mapper", rating: 4.7 },
    { id: "creative-intelligence", name: "Creative Intelligence", rating: 4.7 },
    { id: "purchase-intent-analyzer", name: "Purchase Intent Analyzer", rating: 4.3 },
  ],
}

export default function AgentDetailPage() {
  const [isInstalled, setIsInstalled] = useState(false)

  const totalRatings = Object.values(agentDetails.ratings).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/store">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Store
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {agentDetails.name}
                {agentDetails.verified && <Verified className="h-5 w-5 text-primary" />}
              </h1>
              <p className="text-muted-foreground">by {agentDetails.author}</p>
            </div>
          </div>

          <p className="text-muted-foreground mb-6">{agentDetails.description}</p>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{agentDetails.rating}</span>
              <span className="text-muted-foreground">({agentDetails.reviews} reviews)</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Download className="h-5 w-5" />
              <span>{agentDetails.installs} installs</span>
            </div>
            <Badge>{agentDetails.category}</Badge>
            <Badge variant="secondary">{agentDetails.price}</Badge>
          </div>

          <div className="flex gap-3">
            {isInstalled ? (
              <>
                <Button variant="outline" disabled className="gap-2 bg-transparent">
                  <Check className="h-4 w-4" />
                  Installed
                </Button>
                <Button asChild>
                  <Link href="/dashboard/playground">
                    <Play className="mr-2 h-4 w-4" />
                    Try in Playground
                  </Link>
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsInstalled(true)} className="gap-2">
                <Download className="h-4 w-4" />
                Install Agent
              </Button>
            )}
          </div>
        </div>

        {/* Quick Info Card */}
        <Card className="lg:w-80">
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Version</span>
              <span>{agentDetails.version}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last Updated</span>
              <span>{agentDetails.lastUpdated}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Category</span>
              <span>{agentDetails.category}</span>
            </div>
            <hr />
            <div>
              <span className="text-sm text-muted-foreground">Data Sources</span>
              <div className="flex flex-wrap gap-1 mt-2">
                {agentDetails.dataSources.map((source) => (
                  <Badge key={source} variant="outline" className="text-xs">
                    {source}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About this Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                {agentDetails.longDescription}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Fast Results</div>
                  <div className="text-sm text-muted-foreground">Avg. 3s response time</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Verified Data</div>
                  <div className="text-sm text-muted-foreground">100% sourced citations</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Always Updated</div>
                  <div className="text-sm text-muted-foreground">Latest GWI data</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="capabilities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>What this agent can do</CardTitle>
              <CardDescription>Key capabilities and features</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {agentDetails.capabilities.map((capability, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{capability}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Example Prompts</CardTitle>
              <CardDescription>Try these prompts to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {agentDetails.examplePrompts.map((prompt, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 group">
                  <span className="text-sm">{prompt}</span>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <div className="grid md:grid-cols-[300px_1fr] gap-8">
            {/* Rating Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Ratings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-5xl font-bold">{agentDetails.rating}</div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${star <= Math.round(agentDetails.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{totalRatings} reviews</div>
                </div>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-sm w-3">{rating}</span>
                      <Star className="h-4 w-4 text-yellow-400" />
                      <Progress
                        value={(agentDetails.ratings[rating as keyof typeof agentDetails.ratings] / totalRatings) * 100}
                        className="h-2 flex-1"
                      />
                      <span className="text-sm text-muted-foreground w-8">
                        {agentDetails.ratings[rating as keyof typeof agentDetails.ratings]}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews List */}
            <div className="space-y-4">
              {agentDetails.reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{review.author[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{review.author}</div>
                          <div className="text-sm text-muted-foreground">
                            {review.role} at {review.company}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{review.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 gap-1">
                          <ThumbsUp className="h-3.5 w-3.5" />
                          {review.helpful}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8">
                          <ThumbsDown className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Related Agents */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Related Agents</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {agentDetails.relatedAgents.map((agent) => (
            <Link key={agent.id} href={`/dashboard/store/${agent.id}`}>
              <Card className="hover:border-primary/50 transition-colors">
                <CardContent className="pt-6 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{agent.name}</div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {agent.rating}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
