"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Activity,
  ShoppingCart,
  Heart,
  Smartphone,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Target,
  Zap,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronRight,
  Sparkles,
  Users,
  DollarSign,
  Award,
  Leaf,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Habit and behavior types
export interface HabitCategory {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  habits: Habit[]
}

export interface Habit {
  id: string
  name: string
  frequency: "daily" | "weekly" | "monthly" | "occasionally" | "rarely"
  strength: number // 0-100
  trend: "increasing" | "stable" | "decreasing"
  indexVsPopulation: number // 100 = average, >100 = over-indexes
  details?: string
}

export interface ShoppingBehavior {
  category: string
  preferredChannels: { channel: string; percentage: number }[]
  avgSpend: string
  frequency: string
  topFactors: string[]
  brandLoyalty: number
}

export interface DigitalBehavior {
  category: string
  dailyTime: number // minutes
  platforms: { name: string; usage: number }[]
  peakTimes: string[]
  contentPreferences: string[]
}

export interface LifestyleHabit {
  category: string
  behaviors: { name: string; adoption: number; trend: string }[]
}

interface HabitsBehaviorsProps {
  audienceId: string
  audienceName: string
  audienceCriteria?: Record<string, unknown>
  className?: string
}

const frequencyLabels: Record<string, { label: string; color: string }> = {
  daily: { label: "Daily", color: "bg-emerald-100 text-emerald-700" },
  weekly: { label: "Weekly", color: "bg-blue-100 text-blue-700" },
  monthly: { label: "Monthly", color: "bg-purple-100 text-purple-700" },
  occasionally: { label: "Occasionally", color: "bg-amber-100 text-amber-700" },
  rarely: { label: "Rarely", color: "bg-slate-100 text-slate-700" },
}

const trendIcons: Record<string, React.ReactNode> = {
  increasing: <TrendingUp className="h-3 w-3 text-emerald-500" />,
  stable: <Minus className="h-3 w-3 text-slate-500" />,
  decreasing: <TrendingDown className="h-3 w-3 text-red-500" />,
}

// Generate habits based on audience
function generateHabitData(audienceId: string, _criteria?: Record<string, unknown>) {
  const seed = audienceId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const random = (index: number) => ((seed * (index + 1)) % 100) / 100

  const habitCategories: HabitCategory[] = [
    {
      id: "shopping",
      name: "Shopping & Spending",
      icon: <ShoppingCart className="h-5 w-5" />,
      description: "Purchase behaviors and spending patterns",
      habits: [
        {
          id: "online-shopping",
          name: "Shop online",
          frequency: random(1) > 0.3 ? "weekly" : "daily",
          strength: Math.floor(70 + random(2) * 25),
          trend: random(3) > 0.4 ? "increasing" : "stable",
          indexVsPopulation: Math.floor(105 + random(4) * 30),
          details: "Prefer mobile apps for convenience",
        },
        {
          id: "comparison-shop",
          name: "Compare prices before buying",
          frequency: "daily",
          strength: Math.floor(75 + random(5) * 20),
          trend: "stable",
          indexVsPopulation: Math.floor(110 + random(6) * 25),
          details: "Use price comparison tools and browser extensions",
        },
        {
          id: "read-reviews",
          name: "Read product reviews",
          frequency: "daily",
          strength: Math.floor(80 + random(7) * 15),
          trend: "stable",
          indexVsPopulation: Math.floor(115 + random(8) * 20),
          details: "Trust verified purchase reviews most",
        },
        {
          id: "impulse-buy",
          name: "Make impulse purchases",
          frequency: random(9) > 0.6 ? "weekly" : "monthly",
          strength: Math.floor(40 + random(10) * 35),
          trend: random(11) > 0.5 ? "decreasing" : "stable",
          indexVsPopulation: Math.floor(85 + random(12) * 30),
          details: "Usually triggered by sales or social media",
        },
        {
          id: "subscribe-services",
          name: "Subscribe to services",
          frequency: "monthly",
          strength: Math.floor(65 + random(13) * 25),
          trend: "increasing",
          indexVsPopulation: Math.floor(120 + random(14) * 20),
          details: "Streaming, meal kits, software subscriptions",
        },
      ],
    },
    {
      id: "health",
      name: "Health & Wellness",
      icon: <Heart className="h-5 w-5" />,
      description: "Fitness, nutrition, and self-care routines",
      habits: [
        {
          id: "exercise",
          name: "Exercise regularly",
          frequency: random(15) > 0.4 ? "weekly" : "daily",
          strength: Math.floor(55 + random(16) * 35),
          trend: random(17) > 0.5 ? "increasing" : "stable",
          indexVsPopulation: Math.floor(100 + random(18) * 25),
          details: "Mix of cardio and strength training",
        },
        {
          id: "track-fitness",
          name: "Use fitness tracking",
          frequency: "daily",
          strength: Math.floor(60 + random(19) * 30),
          trend: "increasing",
          indexVsPopulation: Math.floor(125 + random(20) * 20),
          details: "Smartwatch or fitness app",
        },
        {
          id: "meal-prep",
          name: "Meal prep / plan meals",
          frequency: "weekly",
          strength: Math.floor(45 + random(21) * 40),
          trend: random(22) > 0.5 ? "increasing" : "stable",
          indexVsPopulation: Math.floor(105 + random(23) * 25),
          details: "Sunday meal prep for the week",
        },
        {
          id: "supplements",
          name: "Take supplements/vitamins",
          frequency: "daily",
          strength: Math.floor(50 + random(24) * 40),
          trend: "increasing",
          indexVsPopulation: Math.floor(110 + random(25) * 20),
          details: "Multivitamins, protein, specialized supplements",
        },
        {
          id: "meditation",
          name: "Practice mindfulness/meditation",
          frequency: random(26) > 0.5 ? "weekly" : "occasionally",
          strength: Math.floor(35 + random(27) * 45),
          trend: "increasing",
          indexVsPopulation: Math.floor(115 + random(28) * 25),
          details: "Using apps like Calm or Headspace",
        },
      ],
    },
    {
      id: "digital",
      name: "Digital Habits",
      icon: <Smartphone className="h-5 w-5" />,
      description: "Technology usage and online behaviors",
      habits: [
        {
          id: "social-media",
          name: "Check social media",
          frequency: "daily",
          strength: Math.floor(80 + random(29) * 15),
          trend: random(30) > 0.6 ? "stable" : "decreasing",
          indexVsPopulation: Math.floor(105 + random(31) * 15),
          details: "Multiple times per day across platforms",
        },
        {
          id: "streaming",
          name: "Stream video content",
          frequency: "daily",
          strength: Math.floor(75 + random(32) * 20),
          trend: "stable",
          indexVsPopulation: Math.floor(110 + random(33) * 15),
          details: "Netflix, YouTube, Disney+ primarily",
        },
        {
          id: "podcasts",
          name: "Listen to podcasts",
          frequency: random(34) > 0.4 ? "weekly" : "daily",
          strength: Math.floor(50 + random(35) * 40),
          trend: "increasing",
          indexVsPopulation: Math.floor(120 + random(36) * 25),
          details: "During commute and exercise",
        },
        {
          id: "online-research",
          name: "Research before decisions",
          frequency: "daily",
          strength: Math.floor(85 + random(37) * 12),
          trend: "stable",
          indexVsPopulation: Math.floor(108 + random(38) * 15),
          details: "Google, Reddit, YouTube for research",
        },
        {
          id: "screen-time",
          name: "Monitor screen time",
          frequency: "weekly",
          strength: Math.floor(40 + random(39) * 40),
          trend: "increasing",
          indexVsPopulation: Math.floor(115 + random(40) * 20),
          details: "Trying to reduce and be more intentional",
        },
      ],
    },
    {
      id: "sustainability",
      name: "Sustainability",
      icon: <Leaf className="h-5 w-5" />,
      description: "Environmental consciousness and green habits",
      habits: [
        {
          id: "recycle",
          name: "Recycle consistently",
          frequency: "daily",
          strength: Math.floor(65 + random(41) * 30),
          trend: "stable",
          indexVsPopulation: Math.floor(105 + random(42) * 20),
          details: "Home and office recycling",
        },
        {
          id: "reusable-bags",
          name: "Use reusable bags/containers",
          frequency: "weekly",
          strength: Math.floor(55 + random(43) * 35),
          trend: "increasing",
          indexVsPopulation: Math.floor(115 + random(44) * 20),
          details: "Shopping bags, water bottles, food containers",
        },
        {
          id: "eco-products",
          name: "Choose eco-friendly products",
          frequency: "weekly",
          strength: Math.floor(45 + random(45) * 40),
          trend: "increasing",
          indexVsPopulation: Math.floor(120 + random(46) * 25),
          details: "When price difference is reasonable",
        },
        {
          id: "reduce-waste",
          name: "Actively reduce waste",
          frequency: "daily",
          strength: Math.floor(50 + random(47) * 35),
          trend: "increasing",
          indexVsPopulation: Math.floor(110 + random(48) * 20),
          details: "Food waste, single-use plastics",
        },
      ],
    },
    {
      id: "financial",
      name: "Financial Habits",
      icon: <DollarSign className="h-5 w-5" />,
      description: "Money management and financial behaviors",
      habits: [
        {
          id: "budgeting",
          name: "Track expenses/budget",
          frequency: random(49) > 0.4 ? "weekly" : "monthly",
          strength: Math.floor(50 + random(50) * 40),
          trend: "increasing",
          indexVsPopulation: Math.floor(105 + random(51) * 25),
          details: "Using apps or spreadsheets",
        },
        {
          id: "saving",
          name: "Save regularly",
          frequency: "monthly",
          strength: Math.floor(60 + random(52) * 30),
          trend: "stable",
          indexVsPopulation: Math.floor(100 + random(53) * 20),
          details: "Automatic transfers to savings",
        },
        {
          id: "investing",
          name: "Invest/manage portfolio",
          frequency: random(54) > 0.5 ? "weekly" : "monthly",
          strength: Math.floor(45 + random(55) * 40),
          trend: "increasing",
          indexVsPopulation: Math.floor(115 + random(56) * 25),
          details: "Stocks, ETFs, retirement accounts",
        },
        {
          id: "deals-coupons",
          name: "Use deals/coupons",
          frequency: "weekly",
          strength: Math.floor(55 + random(57) * 35),
          trend: "stable",
          indexVsPopulation: Math.floor(95 + random(58) * 25),
          details: "Coupon apps, cashback, loyalty programs",
        },
      ],
    },
    {
      id: "social",
      name: "Social Behaviors",
      icon: <Users className="h-5 w-5" />,
      description: "Relationships and social activities",
      habits: [
        {
          id: "social-plans",
          name: "Make social plans",
          frequency: "weekly",
          strength: Math.floor(55 + random(59) * 35),
          trend: random(60) > 0.5 ? "increasing" : "stable",
          indexVsPopulation: Math.floor(100 + random(61) * 20),
          details: "Dinner, activities with friends/family",
        },
        {
          id: "messaging",
          name: "Stay in touch via messaging",
          frequency: "daily",
          strength: Math.floor(80 + random(62) * 15),
          trend: "stable",
          indexVsPopulation: Math.floor(105 + random(63) * 15),
          details: "Text, WhatsApp, iMessage",
        },
        {
          id: "video-calls",
          name: "Video call friends/family",
          frequency: random(64) > 0.5 ? "weekly" : "monthly",
          strength: Math.floor(50 + random(65) * 35),
          trend: "stable",
          indexVsPopulation: Math.floor(110 + random(66) * 20),
          details: "FaceTime, Zoom for personal calls",
        },
        {
          id: "attend-events",
          name: "Attend social events",
          frequency: "monthly",
          strength: Math.floor(45 + random(67) * 40),
          trend: random(68) > 0.5 ? "increasing" : "stable",
          indexVsPopulation: Math.floor(95 + random(69) * 25),
          details: "Parties, gatherings, community events",
        },
      ],
    },
  ]

  const shoppingBehaviors: ShoppingBehavior[] = [
    {
      category: "Electronics",
      preferredChannels: [
        { channel: "Amazon", percentage: 45 },
        { channel: "Brand Website", percentage: 25 },
        { channel: "Best Buy", percentage: 20 },
        { channel: "Other", percentage: 10 },
      ],
      avgSpend: "$150-300/purchase",
      frequency: "Quarterly",
      topFactors: ["Reviews", "Price", "Brand reputation", "Features"],
      brandLoyalty: 72,
    },
    {
      category: "Groceries",
      preferredChannels: [
        { channel: "Supermarket", percentage: 50 },
        { channel: "Grocery delivery", percentage: 30 },
        { channel: "Specialty stores", percentage: 15 },
        { channel: "Farmers market", percentage: 5 },
      ],
      avgSpend: "$120-180/week",
      frequency: "Weekly",
      topFactors: ["Quality", "Convenience", "Price", "Organic options"],
      brandLoyalty: 58,
    },
    {
      category: "Clothing",
      preferredChannels: [
        { channel: "Online retailers", percentage: 55 },
        { channel: "Department stores", percentage: 25 },
        { channel: "Brand stores", percentage: 15 },
        { channel: "Secondhand", percentage: 5 },
      ],
      avgSpend: "$100-200/month",
      frequency: "Monthly",
      topFactors: ["Style", "Quality", "Price", "Sustainability"],
      brandLoyalty: 45,
    },
  ]

  const digitalBehaviors: DigitalBehavior[] = [
    {
      category: "Social Media",
      dailyTime: Math.floor(90 + random(70) * 60),
      platforms: [
        { name: "Instagram", usage: Math.floor(25 + random(71) * 15) },
        { name: "TikTok", usage: Math.floor(15 + random(72) * 20) },
        { name: "Twitter/X", usage: Math.floor(10 + random(73) * 15) },
        { name: "LinkedIn", usage: Math.floor(5 + random(74) * 15) },
        { name: "Facebook", usage: Math.floor(10 + random(75) * 10) },
      ],
      peakTimes: ["7-8 AM", "12-1 PM", "8-10 PM"],
      contentPreferences: ["Friends' posts", "News", "Entertainment", "Educational"],
    },
    {
      category: "Entertainment Streaming",
      dailyTime: Math.floor(60 + random(76) * 90),
      platforms: [
        { name: "Netflix", usage: Math.floor(30 + random(77) * 15) },
        { name: "YouTube", usage: Math.floor(25 + random(78) * 15) },
        { name: "Disney+", usage: Math.floor(10 + random(79) * 15) },
        { name: "HBO Max", usage: Math.floor(10 + random(80) * 10) },
        { name: "Spotify", usage: Math.floor(15 + random(81) * 10) },
      ],
      peakTimes: ["7-10 PM", "Weekends"],
      contentPreferences: ["Drama series", "Documentaries", "Comedy", "Music"],
    },
    {
      category: "News & Information",
      dailyTime: Math.floor(30 + random(82) * 40),
      platforms: [
        { name: "News apps", usage: Math.floor(35 + random(83) * 15) },
        { name: "Podcasts", usage: Math.floor(25 + random(84) * 15) },
        { name: "Reddit", usage: Math.floor(15 + random(85) * 15) },
        { name: "Newsletter", usage: Math.floor(15 + random(86) * 10) },
      ],
      peakTimes: ["Morning", "Lunch", "Evening"],
      contentPreferences: ["Business", "Technology", "Politics", "Health"],
    },
  ]

  return { habitCategories, shoppingBehaviors, digitalBehaviors }
}

export function HabitsBehaviors({
  audienceId,
  audienceName: _audienceName,
  audienceCriteria,
  className,
}: HabitsBehaviorsProps) {
  const t = useTranslations("audiences")
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<ReturnType<typeof generateHabitData> | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      const habitData = generateHabitData(audienceId, audienceCriteria)
      setData(habitData)
      setIsLoading(false)
    }, 400)

    return () => clearTimeout(timer)
  }, [audienceId, audienceCriteria])

  if (isLoading) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Habits & Behaviors
        </CardTitle>
        <CardDescription>
          Behavioral patterns, routines, and preferences with population indexing
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="habits" className="w-full">
          <TabsList className="w-full justify-start mb-4 flex-wrap h-auto gap-1">
            <TabsTrigger value="habits">Core Habits</TabsTrigger>
            <TabsTrigger value="shopping">Shopping</TabsTrigger>
            <TabsTrigger value="digital">Digital</TabsTrigger>
          </TabsList>

          {/* Core Habits Tab */}
          <TabsContent value="habits" className="space-y-6">
            {data.habitCategories.map((category) => (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {category.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold">{category.name}</h4>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>

                <div className="grid gap-3 ml-12">
                  {category.habits.map((habit) => (
                    <div
                      key={habit.id}
                      className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{habit.name}</span>
                            <Badge className={cn("text-xs", frequencyLabels[habit.frequency].color)}>
                              {frequencyLabels[habit.frequency].label}
                            </Badge>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  {trendIcons[habit.trend]}
                                </TooltipTrigger>
                                <TooltipContent>
                                  Trend: {habit.trend}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          {habit.details && (
                            <p className="text-sm text-muted-foreground">{habit.details}</p>
                          )}
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Strength</span>
                              <span>{habit.strength}%</span>
                            </div>
                            <Progress value={habit.strength} className="h-1.5" />
                          </div>
                        </div>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "px-2 py-1 rounded text-xs font-medium",
                                  habit.indexVsPopulation >= 115 ? "bg-emerald-100 text-emerald-700" :
                                  habit.indexVsPopulation >= 100 ? "bg-blue-100 text-blue-700" :
                                  "bg-amber-100 text-amber-700"
                                )}
                              >
                                {habit.indexVsPopulation}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Index vs. general population</p>
                              <p className="text-xs text-muted-foreground">
                                100 = average, {">"}115 = over-indexes significantly
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Shopping Behaviors Tab */}
          <TabsContent value="shopping" className="space-y-4">
            {data.shoppingBehaviors.map((behavior, i) => (
              <div key={i} className="p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">{behavior.category}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{behavior.frequency}</span>
                    <span className="font-medium text-foreground">{behavior.avgSpend}</span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Preferred Channels */}
                  <div>
                    <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <ShoppingCart className="h-4 w-4" />
                      Preferred Channels
                    </h5>
                    <div className="space-y-2">
                      {behavior.preferredChannels.map((channel) => (
                        <div key={channel.channel}>
                          <div className="flex justify-between text-xs mb-1">
                            <span>{channel.channel}</span>
                            <span>{channel.percentage}%</span>
                          </div>
                          <Progress value={channel.percentage} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Purchase Factors */}
                  <div>
                    <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      Purchase Factors
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {behavior.topFactors.map((factor, j) => (
                        <Badge key={j} variant="outline" className="text-xs">
                          {j + 1}. {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Brand Loyalty */}
                  <div>
                    <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      Brand Loyalty
                    </h5>
                    <div className="flex items-center gap-3">
                      <Progress value={behavior.brandLoyalty} className="h-3 flex-1" />
                      <span className="text-sm font-medium">{behavior.brandLoyalty}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {behavior.brandLoyalty >= 70 ? "High loyalty - prefers familiar brands" :
                       behavior.brandLoyalty >= 50 ? "Moderate loyalty - open to trying new" :
                       "Low loyalty - price/value driven"}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Shopping Insights */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <h4 className="font-semibold text-emerald-600 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Key Drivers
                </h4>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-3 w-3" />
                    Quality and durability
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-3 w-3" />
                    Convenience and speed
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-3 w-3" />
                    Reviews and recommendations
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Deal Breakers
                </h4>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-3 w-3" />
                    Hidden fees or costs
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-3 w-3" />
                    Poor customer service
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-3 w-3" />
                    Lack of transparency
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <h4 className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Opportunities
                </h4>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-3 w-3" />
                    Personalized recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-3 w-3" />
                    Loyalty rewards programs
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="h-3 w-3" />
                    Subscription options
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* Digital Behaviors Tab */}
          <TabsContent value="digital" className="space-y-4">
            {data.digitalBehaviors.map((behavior, i) => (
              <div key={i} className="p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">{behavior.category}</h4>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {Math.floor(behavior.dailyTime / 60)}h {behavior.dailyTime % 60}m / day
                  </Badge>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Platform Usage */}
                  <div>
                    <h5 className="text-sm font-medium mb-2">Platform Distribution</h5>
                    <div className="space-y-2">
                      {behavior.platforms.map((platform) => (
                        <div key={platform.name}>
                          <div className="flex justify-between text-xs mb-1">
                            <span>{platform.name}</span>
                            <span>{platform.usage}%</span>
                          </div>
                          <Progress value={platform.usage} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Peak Times */}
                  <div>
                    <h5 className="text-sm font-medium mb-2">Peak Usage Times</h5>
                    <div className="flex flex-wrap gap-2">
                      {behavior.peakTimes.map((time, j) => (
                        <Badge key={j} variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Content Preferences */}
                  <div>
                    <h5 className="text-sm font-medium mb-2">Content Preferences</h5>
                    <div className="flex flex-wrap gap-1">
                      {behavior.contentPreferences.map((pref, j) => (
                        <Badge key={j} variant="outline" className="text-xs">
                          {pref}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Digital Insights */}
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Digital Engagement Insights
              </h4>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="text-center p-3 rounded-lg bg-background">
                  <div className="text-2xl font-bold text-primary">4.2h</div>
                  <div className="text-xs text-muted-foreground">Daily screen time</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-background">
                  <div className="text-2xl font-bold text-primary">150+</div>
                  <div className="text-xs text-muted-foreground">Phone pickups/day</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-background">
                  <div className="text-2xl font-bold text-primary">3.5</div>
                  <div className="text-xs text-muted-foreground">Social platforms used</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-background">
                  <div className="text-2xl font-bold text-primary">85%</div>
                  <div className="text-xs text-muted-foreground">Mobile-first browsing</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
