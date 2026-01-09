"use client"

import { useState, use } from "react"
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
  TrendingUp,
  Palette,
  Sparkles,
  Megaphone,
  Users,
  Globe,
  BarChart3,
  FileText,
  ShoppingCart,
  Brain,
} from "lucide-react"
import Link from "next/link"

// Store agent data for all agents
const storeAgents: Record<string, {
  id: string
  name: string
  description: string
  longDescription: string
  author: string
  verified: boolean
  rating: number
  reviewCount: number
  installs: string
  category: string
  price: string
  version: string
  lastUpdated: string
  dataSources: string[]
  capabilities: string[]
  examplePrompts: string[]
  ratings: Record<number, number>
  reviews: Array<{
    id: number
    author: string
    role: string
    company: string
    rating: number
    date: string
    content: string
    helpful: number
  }>
  relatedAgents: Array<{ id: string; name: string; rating: number }>
  icon: "target" | "trending" | "palette" | "sparkles" | "megaphone" | "users" | "globe" | "chart" | "file" | "cart" | "brain"
}> = {
  "audience-strategist-pro": {
    id: "audience-strategist-pro",
    name: "Audience Strategist Pro",
    description: "Advanced audience segmentation with predictive modeling and lookalike expansion. Build detailed, data-driven personas that go beyond demographics to understand motivations, behaviors, and media preferences.",
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
    reviewCount: 284,
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
    ratings: { 5: 78, 4: 15, 3: 5, 2: 1, 1: 1 },
    reviews: [
      { id: 1, author: "Sarah M.", role: "Senior Researcher", company: "Global Brand Co", rating: 5, date: "2024-01-10", content: "This agent has completely transformed how we build audience profiles. The depth of insight is incredible, and the time savings are substantial.", helpful: 24 },
      { id: 2, author: "James L.", role: "Strategy Director", company: "MediaCorp", rating: 5, date: "2024-01-05", content: "The lookalike modeling feature is a game-changer. We've discovered new audience segments we never would have found manually.", helpful: 18 },
      { id: 3, author: "Michelle K.", role: "Brand Manager", company: "Consumer Goods Inc", rating: 4, date: "2023-12-28", content: "Great agent overall. Would love to see more customization options for the output format, but the insights are top-notch.", helpful: 12 },
    ],
    relatedAgents: [
      { id: "consumer-journey-mapper", name: "Consumer Journey Mapper", rating: 4.7 },
      { id: "creative-intelligence", name: "Creative Intelligence", rating: 4.7 },
      { id: "purchase-intent-analyzer", name: "Purchase Intent Analyzer", rating: 4.3 },
    ],
    icon: "target",
  },
  "brand-tracker-360": {
    id: "brand-tracker-360",
    name: "Brand Tracker 360",
    description: "Comprehensive brand health monitoring with sentiment analysis and share of voice tracking across all major markets.",
    longDescription: `Brand Tracker 360 provides real-time monitoring of your brand's health across global markets.

Monitor key metrics including:
- Brand awareness (aided and unaided)
- Brand consideration and preference
- Net Promoter Score (NPS) trends
- Share of voice vs competitors
- Sentiment analysis across channels

Get instant alerts when significant changes occur and track performance over time.`,
    author: "GWI Labs",
    verified: true,
    rating: 4.8,
    reviewCount: 156,
    installs: "8.2k",
    category: "Competitive Intel",
    price: "Included",
    version: "3.1.0",
    lastUpdated: "2024-01-12",
    dataSources: ["GWI Core", "GWI Brand Tracker", "Social Listening"],
    capabilities: [
      "Track brand awareness over time",
      "Monitor share of voice vs competitors",
      "Analyze brand sentiment by segment",
      "Set up automated alerts for changes",
      "Generate executive dashboards",
      "Compare performance across markets",
    ],
    examplePrompts: [
      "How has our brand awareness changed this quarter?",
      "Compare our NPS to our top 3 competitors",
      "What's driving negative sentiment about our brand?",
      "Which demographics have the highest brand affinity?",
    ],
    ratings: { 5: 72, 4: 18, 3: 7, 2: 2, 1: 1 },
    reviews: [
      { id: 1, author: "David R.", role: "Brand Director", company: "Tech Corp", rating: 5, date: "2024-01-08", content: "Essential for any brand team. The competitive benchmarking alone is worth it.", helpful: 31 },
      { id: 2, author: "Emily S.", role: "Marketing VP", company: "Retail Giants", rating: 5, date: "2024-01-02", content: "Finally, real-time brand tracking without the manual work. Love the automated alerts.", helpful: 22 },
    ],
    relatedAgents: [
      { id: "competitive-radar", name: "Competitive Radar", rating: 4.6 },
      { id: "audience-strategist-pro", name: "Audience Strategist Pro", rating: 4.9 },
      { id: "insight-summarizer", name: "Insight Summarizer", rating: 4.8 },
    ],
    icon: "trending",
  },
  "creative-intelligence": {
    id: "creative-intelligence",
    name: "Creative Intelligence",
    description: "AI-powered creative brief generation with audience-matched messaging strategies and creative direction.",
    longDescription: `Creative Intelligence transforms consumer insights into actionable creative direction.

This agent helps creative teams by:
- Generating data-backed creative briefs
- Identifying resonant messaging for target audiences
- Recommending visual and tonal directions
- Testing creative concepts against audience data
- Benchmarking against successful campaigns

Bridge the gap between research and creative execution.`,
    author: "GWI Labs",
    verified: true,
    rating: 4.7,
    reviewCount: 203,
    installs: "9.8k",
    category: "Creative & Content",
    price: "Included",
    version: "2.2.0",
    lastUpdated: "2024-01-10",
    dataSources: ["GWI Core", "GWI Zeitgeist", "Campaign Benchmarks"],
    capabilities: [
      "Generate audience-informed creative briefs",
      "Develop messaging strategies by segment",
      "Recommend visual direction and tone",
      "Test concepts against target audience data",
      "Benchmark against successful campaigns",
      "Export to creative tools",
    ],
    examplePrompts: [
      "Create a creative brief for Gen Z sustainability campaign",
      "What messaging resonates with health-conscious millennials?",
      "Recommend visual direction for luxury automotive audience",
      "How should we position our product for price-sensitive consumers?",
    ],
    ratings: { 5: 68, 4: 22, 3: 8, 2: 1, 1: 1 },
    reviews: [
      { id: 1, author: "Alex T.", role: "Creative Director", company: "Agency One", rating: 5, date: "2024-01-06", content: "This has revolutionized how we brief our creative teams. Data-driven creativity is finally accessible.", helpful: 28 },
      { id: 2, author: "Rachel M.", role: "Content Strategist", company: "Brand Co", rating: 4, date: "2023-12-30", content: "Great for getting started on briefs. Sometimes needs human refinement but saves hours of work.", helpful: 15 },
    ],
    relatedAgents: [
      { id: "audience-strategist-pro", name: "Audience Strategist Pro", rating: 4.9 },
      { id: "trend-forecaster", name: "Trend Forecaster", rating: 4.6 },
      { id: "insight-summarizer", name: "Insight Summarizer", rating: 4.8 },
    ],
    icon: "palette",
  },
  "trend-forecaster": {
    id: "trend-forecaster",
    name: "Trend Forecaster",
    description: "Predict emerging consumer trends before they hit mainstream using advanced pattern recognition and cultural analysis.",
    longDescription: `Trend Forecaster uses advanced analytics to identify emerging consumer behaviors and cultural shifts before they become mainstream.

Capabilities include:
- Early trend identification across categories
- Cultural movement tracking
- Adoption curve prediction
- Geographic trend mapping
- Industry-specific trend alerts

Stay ahead of the curve with predictive trend intelligence.`,
    author: "GWI Labs",
    verified: true,
    rating: 4.6,
    reviewCount: 98,
    installs: "5.4k",
    category: "Trends & Insights",
    price: "Included",
    version: "1.8.0",
    lastUpdated: "2024-01-08",
    dataSources: ["GWI Zeitgeist", "GWI Core", "Cultural Pulse"],
    capabilities: [
      "Identify emerging trends early",
      "Track cultural movements and shifts",
      "Predict adoption curves",
      "Map trends by geography",
      "Set up trend alerts",
      "Generate trend reports",
    ],
    examplePrompts: [
      "What consumer trends are emerging in sustainable fashion?",
      "Predict the next big wellness trend for 2025",
      "Which Gen Z behaviors will become mainstream?",
      "Track the adoption of plant-based diets across markets",
    ],
    ratings: { 5: 62, 4: 25, 3: 10, 2: 2, 1: 1 },
    reviews: [
      { id: 1, author: "Mark J.", role: "Innovation Lead", company: "Future Labs", rating: 5, date: "2024-01-04", content: "Invaluable for our innovation pipeline. We've spotted trends 12-18 months before competitors.", helpful: 19 },
    ],
    relatedAgents: [
      { id: "creative-intelligence", name: "Creative Intelligence", rating: 4.7 },
      { id: "global-market-scanner", name: "Global Market Scanner", rating: 4.4 },
      { id: "audience-strategist-pro", name: "Audience Strategist Pro", rating: 4.9 },
    ],
    icon: "sparkles",
  },
  "media-mix-optimizer": {
    id: "media-mix-optimizer",
    name: "Media Mix Optimizer",
    description: "Data-driven media planning and channel allocation recommendations based on audience behavior.",
    longDescription: `Media Mix Optimizer helps you allocate media budgets more effectively based on real consumer behavior data.

Features include:
- Audience-based channel recommendations
- Budget allocation optimization
- Cross-channel synergy analysis
- Daypart and placement recommendations
- Competitive media benchmarking

Make every media dollar work harder.`,
    author: "GWI Labs",
    verified: true,
    rating: 4.5,
    reviewCount: 67,
    installs: "3.2k",
    category: "Media & Advertising",
    price: "Included",
    version: "2.0.0",
    lastUpdated: "2024-01-05",
    dataSources: ["GWI Core", "GWI Media", "Ad Benchmarks"],
    capabilities: [
      "Recommend optimal channel mix",
      "Analyze audience media behaviors",
      "Optimize budget allocation",
      "Identify cross-channel synergies",
      "Benchmark against competitors",
      "Generate media plans",
    ],
    examplePrompts: [
      "What's the optimal media mix for reaching Gen Z gamers?",
      "How should we allocate our $5M budget across channels?",
      "Which platforms have the best reach for our target?",
      "Compare our media strategy to competitor X",
    ],
    ratings: { 5: 55, 4: 30, 3: 12, 2: 2, 1: 1 },
    reviews: [
      { id: 1, author: "Lisa P.", role: "Media Director", company: "Media Agency", rating: 5, date: "2024-01-02", content: "Finally, data-driven media planning. Our clients love the audience-first approach.", helpful: 14 },
    ],
    relatedAgents: [
      { id: "audience-strategist-pro", name: "Audience Strategist Pro", rating: 4.9 },
      { id: "competitive-radar", name: "Competitive Radar", rating: 4.6 },
      { id: "insight-summarizer", name: "Insight Summarizer", rating: 4.8 },
    ],
    icon: "megaphone",
  },
  "consumer-journey-mapper": {
    id: "consumer-journey-mapper",
    name: "Consumer Journey Mapper",
    description: "Map complete customer journeys with touchpoint analysis and conversion optimization insights.",
    longDescription: `Consumer Journey Mapper helps you understand the complete path consumers take from awareness to purchase and beyond.

Analyze:
- Awareness and discovery touchpoints
- Consideration and research behaviors
- Purchase triggers and barriers
- Post-purchase engagement
- Loyalty and advocacy drivers

Optimize every step of the customer journey.`,
    author: "GWI Labs",
    verified: true,
    rating: 4.7,
    reviewCount: 112,
    installs: "6.1k",
    category: "Audience & Targeting",
    price: "Included",
    version: "2.1.0",
    lastUpdated: "2024-01-06",
    dataSources: ["GWI Core", "GWI Commerce", "Journey Data"],
    capabilities: [
      "Map complete customer journeys",
      "Analyze touchpoint effectiveness",
      "Identify conversion barriers",
      "Track post-purchase behavior",
      "Compare journeys by segment",
      "Generate journey visualizations",
    ],
    examplePrompts: [
      "Map the purchase journey for luxury car buyers",
      "What touchpoints matter most for B2B software?",
      "Where do customers drop off in the funnel?",
      "How does Gen Z discover new brands?",
    ],
    ratings: { 5: 65, 4: 24, 3: 8, 2: 2, 1: 1 },
    reviews: [
      { id: 1, author: "Tom H.", role: "Customer Experience Lead", company: "E-Commerce Co", rating: 5, date: "2024-01-03", content: "Game-changer for understanding our customers. The visualizations are presentation-ready.", helpful: 21 },
    ],
    relatedAgents: [
      { id: "audience-strategist-pro", name: "Audience Strategist Pro", rating: 4.9 },
      { id: "purchase-intent-analyzer", name: "Purchase Intent Analyzer", rating: 4.3 },
      { id: "brand-tracker-360", name: "Brand Tracker 360", rating: 4.8 },
    ],
    icon: "users",
  },
  "global-market-scanner": {
    id: "global-market-scanner",
    name: "Global Market Scanner",
    description: "Cross-market analysis and international expansion insights for global brand strategy.",
    longDescription: `Global Market Scanner provides deep cross-market analysis to support international expansion and global strategy.

Features include:
- Market sizing and opportunity analysis
- Consumer behavior comparison across markets
- Cultural nuance identification
- Competitive landscape by market
- Entry strategy recommendations

Go global with confidence.`,
    author: "GWI Labs",
    verified: true,
    rating: 4.4,
    reviewCount: 45,
    installs: "2.8k",
    category: "Trends & Insights",
    price: "Pro",
    version: "1.5.0",
    lastUpdated: "2024-01-01",
    dataSources: ["GWI Core", "GWI Global", "Market Intelligence"],
    capabilities: [
      "Analyze market opportunities",
      "Compare consumer behavior across markets",
      "Identify cultural nuances",
      "Map competitive landscapes",
      "Recommend market entry strategies",
      "Generate market reports",
    ],
    examplePrompts: [
      "Compare e-commerce behavior across APAC markets",
      "What are the cultural nuances for marketing in Brazil?",
      "Which European markets are best for our product?",
      "How does Gen Z differ across US, UK, and Germany?",
    ],
    ratings: { 5: 52, 4: 28, 3: 15, 2: 3, 1: 2 },
    reviews: [
      { id: 1, author: "Nina C.", role: "Global Strategy", company: "Multinational Corp", rating: 5, date: "2023-12-28", content: "Essential for our international expansion. Saved months of research.", helpful: 17 },
    ],
    relatedAgents: [
      { id: "trend-forecaster", name: "Trend Forecaster", rating: 4.6 },
      { id: "audience-strategist-pro", name: "Audience Strategist Pro", rating: 4.9 },
      { id: "competitive-radar", name: "Competitive Radar", rating: 4.6 },
    ],
    icon: "globe",
  },
  "competitive-radar": {
    id: "competitive-radar",
    name: "Competitive Radar",
    description: "Real-time competitive monitoring with automated alerts and intelligence reports.",
    longDescription: `Competitive Radar keeps you informed about your competitors' positioning, audience overlap, and strategic moves.

Monitor:
- Competitor audience profiles
- Share of voice changes
- Positioning shifts
- New market entries
- Campaign activities

Never be surprised by a competitor again.`,
    author: "GWI Labs",
    verified: true,
    rating: 4.6,
    reviewCount: 89,
    installs: "4.7k",
    category: "Competitive Intel",
    price: "Included",
    version: "2.3.0",
    lastUpdated: "2024-01-07",
    dataSources: ["GWI Core", "GWI Brand Tracker", "Competitive Intel"],
    capabilities: [
      "Monitor competitor audiences",
      "Track share of voice changes",
      "Set up automated alerts",
      "Analyze competitive positioning",
      "Compare audience overlap",
      "Generate intel reports",
    ],
    examplePrompts: [
      "Who is our biggest competitor targeting?",
      "How much audience overlap do we have with competitor X?",
      "Alert me when a competitor enters a new market",
      "What's our share of voice in the sustainability space?",
    ],
    ratings: { 5: 60, 4: 28, 3: 9, 2: 2, 1: 1 },
    reviews: [
      { id: 1, author: "Steve B.", role: "Competitive Intel", company: "Strategy Firm", rating: 5, date: "2024-01-05", content: "The automated alerts have caught several competitor moves early. Invaluable.", helpful: 23 },
    ],
    relatedAgents: [
      { id: "brand-tracker-360", name: "Brand Tracker 360", rating: 4.8 },
      { id: "audience-strategist-pro", name: "Audience Strategist Pro", rating: 4.9 },
      { id: "trend-forecaster", name: "Trend Forecaster", rating: 4.6 },
    ],
    icon: "chart",
  },
  "insight-summarizer": {
    id: "insight-summarizer",
    name: "Insight Summarizer",
    description: "Automatically summarize complex research into executive-ready insights and reports.",
    longDescription: `Insight Summarizer transforms complex research findings into clear, actionable executive summaries.

Features:
- Automatic insight extraction
- Executive summary generation
- Key finding prioritization
- Recommendation synthesis
- Multiple output formats

Turn hours of analysis into minutes.`,
    author: "GWI Labs",
    verified: true,
    rating: 4.8,
    reviewCount: 178,
    installs: "7.9k",
    category: "Reporting & Analytics",
    price: "Included",
    version: "3.0.0",
    lastUpdated: "2024-01-09",
    dataSources: ["All GWI Data", "Custom Reports"],
    capabilities: [
      "Summarize complex research",
      "Generate executive summaries",
      "Extract key insights",
      "Prioritize findings",
      "Create presentation decks",
      "Export in multiple formats",
    ],
    examplePrompts: [
      "Summarize our Q4 brand tracking results",
      "Create an executive summary of the Gen Z study",
      "What are the top 5 insights from this research?",
      "Generate a presentation on key findings",
    ],
    ratings: { 5: 75, 4: 18, 3: 5, 2: 1, 1: 1 },
    reviews: [
      { id: 1, author: "Jennifer K.", role: "Research Director", company: "Insights Co", rating: 5, date: "2024-01-08", content: "Saves me hours every week. The summaries are actually good enough to share with clients.", helpful: 32 },
    ],
    relatedAgents: [
      { id: "audience-strategist-pro", name: "Audience Strategist Pro", rating: 4.9 },
      { id: "creative-intelligence", name: "Creative Intelligence", rating: 4.7 },
      { id: "brand-tracker-360", name: "Brand Tracker 360", rating: 4.8 },
    ],
    icon: "file",
  },
  "purchase-intent-analyzer": {
    id: "purchase-intent-analyzer",
    name: "Purchase Intent Analyzer",
    description: "Predict purchase likelihood and identify high-value segments for conversion optimization.",
    longDescription: `Purchase Intent Analyzer uses behavioral data to predict which consumers are most likely to convert.

Analyze:
- Purchase intent signals
- Conversion probability scoring
- High-value segment identification
- Purchase barrier analysis
- Category-specific triggers

Focus your efforts on the highest potential customers.`,
    author: "DataMinds Inc",
    verified: true,
    rating: 4.3,
    reviewCount: 34,
    installs: "1.9k",
    category: "Audience & Targeting",
    price: "Pro",
    version: "1.2.0",
    lastUpdated: "2023-12-20",
    dataSources: ["GWI Core", "GWI Commerce", "Purchase Data"],
    capabilities: [
      "Score purchase intent",
      "Identify high-value segments",
      "Analyze purchase barriers",
      "Predict conversion probability",
      "Track intent over time",
      "Recommend targeting strategies",
    ],
    examplePrompts: [
      "Which segments have the highest purchase intent?",
      "What barriers prevent conversion in our category?",
      "Score our audience's likelihood to purchase",
      "Identify high-value prospects for targeting",
    ],
    ratings: { 5: 48, 4: 32, 3: 14, 2: 4, 1: 2 },
    reviews: [
      { id: 1, author: "Chris D.", role: "Performance Marketing", company: "D2C Brand", rating: 4, date: "2023-12-15", content: "Good for identifying high-intent audiences. Could use more granular scoring options.", helpful: 11 },
    ],
    relatedAgents: [
      { id: "audience-strategist-pro", name: "Audience Strategist Pro", rating: 4.9 },
      { id: "consumer-journey-mapper", name: "Consumer Journey Mapper", rating: 4.7 },
      { id: "media-mix-optimizer", name: "Media Mix Optimizer", rating: 4.5 },
    ],
    icon: "cart",
  },
  "neural-persona-builder": {
    id: "neural-persona-builder",
    name: "Neural Persona Builder",
    description: "AI-generated personas with deep psychological profiling and behavioral prediction.",
    longDescription: `Neural Persona Builder uses advanced AI to create detailed consumer personas that go beyond demographics into psychology and behavior prediction.

Features:
- Deep psychological profiling
- Behavioral prediction modeling
- Persona evolution tracking
- Emotional driver mapping
- Decision-making pattern analysis

Build personas that truly understand consumer psychology.`,
    author: "Cognitive AI",
    verified: false,
    rating: 4.1,
    reviewCount: 23,
    installs: "890",
    category: "Audience & Targeting",
    price: "Enterprise",
    version: "0.9.0",
    lastUpdated: "2023-12-01",
    dataSources: ["GWI Core", "Psychological Data", "Behavioral Signals"],
    capabilities: [
      "Create psychological profiles",
      "Predict consumer behaviors",
      "Map emotional drivers",
      "Analyze decision patterns",
      "Track persona evolution",
      "Generate narrative personas",
    ],
    examplePrompts: [
      "Build a psychological profile for luxury buyers",
      "What emotionally drives our target audience?",
      "Predict how this persona will respond to our messaging",
      "What decision-making patterns define our audience?",
    ],
    ratings: { 5: 42, 4: 30, 3: 18, 2: 6, 1: 4 },
    reviews: [
      { id: 1, author: "Dr. Anna W.", role: "Consumer Psychologist", company: "Research Institute", rating: 4, date: "2023-11-28", content: "Interesting approach to persona building. The psychological dimensions are unique, though still in early stages.", helpful: 8 },
    ],
    relatedAgents: [
      { id: "audience-strategist-pro", name: "Audience Strategist Pro", rating: 4.9 },
      { id: "creative-intelligence", name: "Creative Intelligence", rating: 4.7 },
      { id: "consumer-journey-mapper", name: "Consumer Journey Mapper", rating: 4.7 },
    ],
    icon: "brain",
  },
}

const iconMap = {
  target: Target,
  trending: TrendingUp,
  palette: Palette,
  sparkles: Sparkles,
  megaphone: Megaphone,
  users: Users,
  globe: Globe,
  chart: BarChart3,
  file: FileText,
  cart: ShoppingCart,
  brain: Brain,
}

export default function StoreAgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [isInstalled, setIsInstalled] = useState(false)

  const agentDetails = storeAgents[id]

  if (!agentDetails) {
    return (
      <div className="space-y-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/store">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Store
          </Link>
        </Button>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">Agent Not Found</h1>
          <p className="text-muted-foreground">The agent you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  const totalRatings = Object.values(agentDetails.ratings).reduce((a, b) => a + b, 0)
  const IconComponent = iconMap[agentDetails.icon]

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
              <IconComponent className="h-8 w-8 text-primary" />
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
              <span className="text-muted-foreground">({agentDetails.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Download className="h-5 w-5" />
              <span>{agentDetails.installs} installs</span>
            </div>
            <Badge>{agentDetails.category}</Badge>
            <Badge variant={agentDetails.price === "Included" ? "secondary" : "outline"}>{agentDetails.price}</Badge>
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
