"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Heart,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  ShoppingBag,
  Smartphone,
  Car,
  Utensils,
  Coffee,
  Shirt,
  Home,
  Dumbbell,
  Plane,
  CreditCard,
  Sparkles,
  Award,
  Target,
  Loader2,
  ChevronRight,
  ExternalLink,
  BarChart3,
  Zap,
  Crown,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Brand affinity types
export interface Brand {
  id: string
  name: string
  logo?: string
  category: string
  affinity: number // 0-100
  indexVsPopulation: number // 100 = average
  trend: "up" | "stable" | "down"
  attributes: string[]
  sentiment: "positive" | "neutral" | "negative"
}

export interface BrandCategory {
  id: string
  name: string
  icon: React.ReactNode
  brands: Brand[]
  insights: string[]
}

export interface BrandLoyaltyProfile {
  overallLoyalty: number
  switchingPropensity: number
  priceVsLoyalty: "price" | "balanced" | "loyalty"
  advocacyLevel: number // likelihood to recommend
  topLoyaltyDrivers: string[]
}

interface BrandAffinitiesProps {
  audienceId: string
  audienceName: string
  audienceCriteria?: Record<string, unknown>
  className?: string
}

const categoryIcons: Record<string, React.ReactNode> = {
  "Technology": <Smartphone className="h-5 w-5" />,
  "Automotive": <Car className="h-5 w-5" />,
  "Food & Beverage": <Coffee className="h-5 w-5" />,
  "Fashion & Apparel": <Shirt className="h-5 w-5" />,
  "Health & Fitness": <Dumbbell className="h-5 w-5" />,
  "Travel & Hospitality": <Plane className="h-5 w-5" />,
  "Financial Services": <CreditCard className="h-5 w-5" />,
  "Home & Living": <Home className="h-5 w-5" />,
  "Restaurants": <Utensils className="h-5 w-5" />,
  "Retail": <ShoppingBag className="h-5 w-5" />,
}

const trendIcons: Record<string, React.ReactNode> = {
  up: <TrendingUp className="h-3 w-3 text-emerald-500" />,
  stable: <Minus className="h-3 w-3 text-slate-500" />,
  down: <TrendingDown className="h-3 w-3 text-red-500" />,
}

// Generate brand affinity data
function generateBrandData(audienceId: string, criteria?: Record<string, unknown>) {
  const seed = audienceId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const random = (index: number) => ((seed * (index + 1)) % 100) / 100

  const brandCategories: BrandCategory[] = [
    {
      id: "tech",
      name: "Technology",
      icon: <Smartphone className="h-5 w-5" />,
      brands: [
        {
          id: "apple",
          name: "Apple",
          category: "Technology",
          affinity: Math.floor(75 + random(1) * 20),
          indexVsPopulation: Math.floor(115 + random(2) * 25),
          trend: "stable",
          attributes: ["Premium", "Innovative", "Ecosystem"],
          sentiment: "positive",
        },
        {
          id: "google",
          name: "Google",
          category: "Technology",
          affinity: Math.floor(70 + random(3) * 20),
          indexVsPopulation: Math.floor(105 + random(4) * 20),
          trend: "stable",
          attributes: ["Useful", "Ubiquitous", "Data-driven"],
          sentiment: "positive",
        },
        {
          id: "samsung",
          name: "Samsung",
          category: "Technology",
          affinity: Math.floor(55 + random(5) * 25),
          indexVsPopulation: Math.floor(95 + random(6) * 20),
          trend: random(7) > 0.5 ? "up" : "stable",
          attributes: ["Value", "Variety", "Quality"],
          sentiment: "positive",
        },
        {
          id: "microsoft",
          name: "Microsoft",
          category: "Technology",
          affinity: Math.floor(60 + random(8) * 20),
          indexVsPopulation: Math.floor(100 + random(9) * 15),
          trend: "up",
          attributes: ["Productivity", "Enterprise", "Reliable"],
          sentiment: "positive",
        },
        {
          id: "amazon",
          name: "Amazon",
          category: "Technology",
          affinity: Math.floor(80 + random(10) * 15),
          indexVsPopulation: Math.floor(110 + random(11) * 15),
          trend: "stable",
          attributes: ["Convenience", "Selection", "Value"],
          sentiment: "positive",
        },
      ],
      insights: [
        "Strong Apple ecosystem loyalty",
        "Values integration and seamless experience",
        "Willing to pay premium for quality",
      ],
    },
    {
      id: "automotive",
      name: "Automotive",
      icon: <Car className="h-5 w-5" />,
      brands: [
        {
          id: "tesla",
          name: "Tesla",
          category: "Automotive",
          affinity: Math.floor(55 + random(12) * 30),
          indexVsPopulation: Math.floor(130 + random(13) * 25),
          trend: "up",
          attributes: ["Innovation", "Electric", "Tech-forward"],
          sentiment: "positive",
        },
        {
          id: "toyota",
          name: "Toyota",
          category: "Automotive",
          affinity: Math.floor(60 + random(14) * 20),
          indexVsPopulation: Math.floor(100 + random(15) * 15),
          trend: "stable",
          attributes: ["Reliable", "Practical", "Value"],
          sentiment: "positive",
        },
        {
          id: "bmw",
          name: "BMW",
          category: "Automotive",
          affinity: Math.floor(45 + random(16) * 30),
          indexVsPopulation: Math.floor(110 + random(17) * 25),
          trend: random(18) > 0.5 ? "up" : "stable",
          attributes: ["Luxury", "Performance", "Status"],
          sentiment: "positive",
        },
        {
          id: "honda",
          name: "Honda",
          category: "Automotive",
          affinity: Math.floor(55 + random(19) * 20),
          indexVsPopulation: Math.floor(95 + random(20) * 15),
          trend: "stable",
          attributes: ["Reliable", "Affordable", "Practical"],
          sentiment: "positive",
        },
      ],
      insights: [
        "Growing interest in electric vehicles",
        "Values reliability and low maintenance",
        "Status consideration for some segments",
      ],
    },
    {
      id: "food",
      name: "Food & Beverage",
      icon: <Coffee className="h-5 w-5" />,
      brands: [
        {
          id: "starbucks",
          name: "Starbucks",
          category: "Food & Beverage",
          affinity: Math.floor(65 + random(21) * 25),
          indexVsPopulation: Math.floor(115 + random(22) * 20),
          trend: "stable",
          attributes: ["Convenience", "Quality", "Experience"],
          sentiment: "positive",
        },
        {
          id: "chipotle",
          name: "Chipotle",
          category: "Food & Beverage",
          affinity: Math.floor(55 + random(23) * 30),
          indexVsPopulation: Math.floor(120 + random(24) * 20),
          trend: "up",
          attributes: ["Fresh", "Customizable", "Fast-casual"],
          sentiment: "positive",
        },
        {
          id: "wholefood",
          name: "Whole Foods",
          category: "Food & Beverage",
          affinity: Math.floor(50 + random(25) * 30),
          indexVsPopulation: Math.floor(125 + random(26) * 20),
          trend: "stable",
          attributes: ["Organic", "Quality", "Health-conscious"],
          sentiment: "positive",
        },
        {
          id: "trader",
          name: "Trader Joe's",
          category: "Food & Beverage",
          affinity: Math.floor(60 + random(27) * 25),
          indexVsPopulation: Math.floor(120 + random(28) * 20),
          trend: "up",
          attributes: ["Value", "Unique products", "Friendly"],
          sentiment: "positive",
        },
      ],
      insights: [
        "Prefers quality over lowest price",
        "Values convenience and speed",
        "Growing interest in health-conscious options",
      ],
    },
    {
      id: "fashion",
      name: "Fashion & Apparel",
      icon: <Shirt className="h-5 w-5" />,
      brands: [
        {
          id: "nike",
          name: "Nike",
          category: "Fashion & Apparel",
          affinity: Math.floor(70 + random(29) * 20),
          indexVsPopulation: Math.floor(110 + random(30) * 15),
          trend: "stable",
          attributes: ["Athletic", "Trendy", "Quality"],
          sentiment: "positive",
        },
        {
          id: "lululemon",
          name: "Lululemon",
          category: "Fashion & Apparel",
          affinity: Math.floor(50 + random(31) * 35),
          indexVsPopulation: Math.floor(130 + random(32) * 25),
          trend: "up",
          attributes: ["Premium", "Fitness", "Lifestyle"],
          sentiment: "positive",
        },
        {
          id: "patagonia",
          name: "Patagonia",
          category: "Fashion & Apparel",
          affinity: Math.floor(45 + random(33) * 35),
          indexVsPopulation: Math.floor(125 + random(34) * 25),
          trend: "up",
          attributes: ["Sustainable", "Outdoor", "Quality"],
          sentiment: "positive",
        },
        {
          id: "uniqlo",
          name: "Uniqlo",
          category: "Fashion & Apparel",
          affinity: Math.floor(55 + random(35) * 25),
          indexVsPopulation: Math.floor(115 + random(36) * 20),
          trend: "up",
          attributes: ["Value", "Basics", "Functional"],
          sentiment: "positive",
        },
      ],
      insights: [
        "Athleisure continues strong",
        "Sustainability becoming a factor",
        "Willing to pay for quality basics",
      ],
    },
    {
      id: "travel",
      name: "Travel & Hospitality",
      icon: <Plane className="h-5 w-5" />,
      brands: [
        {
          id: "airbnb",
          name: "Airbnb",
          category: "Travel & Hospitality",
          affinity: Math.floor(60 + random(37) * 25),
          indexVsPopulation: Math.floor(125 + random(38) * 20),
          trend: "up",
          attributes: ["Unique", "Local", "Flexible"],
          sentiment: "positive",
        },
        {
          id: "marriott",
          name: "Marriott",
          category: "Travel & Hospitality",
          affinity: Math.floor(55 + random(39) * 25),
          indexVsPopulation: Math.floor(105 + random(40) * 20),
          trend: "stable",
          attributes: ["Reliable", "Loyalty program", "Quality"],
          sentiment: "positive",
        },
        {
          id: "delta",
          name: "Delta",
          category: "Travel & Hospitality",
          affinity: Math.floor(50 + random(41) * 25),
          indexVsPopulation: Math.floor(100 + random(42) * 20),
          trend: "stable",
          attributes: ["Reliable", "Service", "Hub network"],
          sentiment: "positive",
        },
      ],
      insights: [
        "Values experiences over things",
        "Loyalty programs influence decisions",
        "Prefers flexibility in booking",
      ],
    },
    {
      id: "finance",
      name: "Financial Services",
      icon: <CreditCard className="h-5 w-5" />,
      brands: [
        {
          id: "chase",
          name: "Chase",
          category: "Financial Services",
          affinity: Math.floor(60 + random(43) * 25),
          indexVsPopulation: Math.floor(105 + random(44) * 15),
          trend: "stable",
          attributes: ["Rewards", "Ubiquitous", "Digital"],
          sentiment: "positive",
        },
        {
          id: "amex",
          name: "American Express",
          category: "Financial Services",
          affinity: Math.floor(50 + random(45) * 30),
          indexVsPopulation: Math.floor(120 + random(46) * 25),
          trend: "stable",
          attributes: ["Premium", "Rewards", "Status"],
          sentiment: "positive",
        },
        {
          id: "fidelity",
          name: "Fidelity",
          category: "Financial Services",
          affinity: Math.floor(45 + random(47) * 30),
          indexVsPopulation: Math.floor(115 + random(48) * 20),
          trend: "up",
          attributes: ["Investment", "Low-cost", "Research"],
          sentiment: "positive",
        },
        {
          id: "venmo",
          name: "Venmo",
          category: "Financial Services",
          affinity: Math.floor(65 + random(49) * 25),
          indexVsPopulation: Math.floor(125 + random(50) * 20),
          trend: "stable",
          attributes: ["Social", "Convenient", "P2P"],
          sentiment: "positive",
        },
      ],
      insights: [
        "Rewards and benefits drive choice",
        "Growing use of fintech solutions",
        "Values digital-first experience",
      ],
    },
  ]

  const loyaltyProfile: BrandLoyaltyProfile = {
    overallLoyalty: Math.floor(55 + random(51) * 30),
    switchingPropensity: Math.floor(35 + random(52) * 35),
    priceVsLoyalty: random(53) > 0.6 ? "loyalty" : random(53) > 0.3 ? "balanced" : "price",
    advocacyLevel: Math.floor(50 + random(54) * 35),
    topLoyaltyDrivers: [
      "Product quality",
      "Customer service",
      "Rewards/loyalty programs",
      "Brand values alignment",
      "Convenience",
    ].sort(() => random(55) - 0.5).slice(0, 4),
  }

  const topBrandsOverall = brandCategories
    .flatMap(c => c.brands)
    .sort((a, b) => b.affinity - a.affinity)
    .slice(0, 10)

  const risingBrands = brandCategories
    .flatMap(c => c.brands)
    .filter(b => b.trend === "up")
    .sort((a, b) => b.indexVsPopulation - a.indexVsPopulation)
    .slice(0, 5)

  return { brandCategories, loyaltyProfile, topBrandsOverall, risingBrands }
}

export function BrandAffinities({
  audienceId,
  audienceName,
  audienceCriteria,
  className,
}: BrandAffinitiesProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<ReturnType<typeof generateBrandData> | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      const brandData = generateBrandData(audienceId, audienceCriteria)
      setData(brandData)
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
          <Heart className="h-5 w-5 text-primary" />
          Brand Affinities
        </CardTitle>
        <CardDescription>
          Brand preferences, loyalty patterns, and category-level insights
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start mb-4 flex-wrap h-auto gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">By Category</TabsTrigger>
            <TabsTrigger value="loyalty">Loyalty Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Top Brands */}
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500" />
                Top Brand Affinities
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {data.topBrandsOverall.slice(0, 8).map((brand, i) => (
                  <div
                    key={brand.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-bold">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{brand.name}</span>
                        {brand.indexVsPopulation >= 120 && (
                          <Badge variant="secondary" className="text-xs">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Over-index
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{brand.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{brand.affinity}%</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        {trendIcons[brand.trend]}
                        <span>Index: {brand.indexVsPopulation}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rising Brands */}
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-500" />
                Rising Brands (Trend: Up)
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.risingBrands.map((brand) => (
                  <div
                    key={brand.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                  >
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span className="font-medium">{brand.name}</span>
                    <Badge variant="outline" className="text-xs">
                      +{brand.indexVsPopulation - 100} index
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-2xl font-bold text-primary">{data.loyaltyProfile.overallLoyalty}%</div>
                <div className="text-xs text-muted-foreground">Overall Brand Loyalty</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-2xl font-bold text-primary">{data.loyaltyProfile.advocacyLevel}%</div>
                <div className="text-xs text-muted-foreground">Advocacy Score</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-2xl font-bold text-primary capitalize">{data.loyaltyProfile.priceVsLoyalty}</div>
                <div className="text-xs text-muted-foreground">Price vs Loyalty</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-2xl font-bold text-primary">{data.loyaltyProfile.switchingPropensity}%</div>
                <div className="text-xs text-muted-foreground">Switching Propensity</div>
              </div>
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <ScrollArea className="h-[600px] pr-4">
              {data.brandCategories.map((category) => (
                <div key={category.id} className="mb-6 last:mb-0">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {category.icon}
                    </div>
                    <h4 className="font-semibold">{category.name}</h4>
                  </div>

                  <div className="space-y-3 mb-4">
                    {category.brands.map((brand) => (
                      <div
                        key={brand.id}
                        className="p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{brand.name}</span>
                              {trendIcons[brand.trend]}
                              {brand.sentiment === "positive" && (
                                <Heart className="h-3 w-3 text-pink-500 fill-pink-500" />
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {brand.attributes.map((attr, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {attr}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">Affinity</span>
                                  <span>{brand.affinity}%</span>
                                </div>
                                <Progress value={brand.affinity} className="h-1.5" />
                              </div>
                            </div>
                          </div>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={cn(
                                    "px-2 py-1 rounded text-xs font-medium",
                                    brand.indexVsPopulation >= 120 ? "bg-emerald-100 text-emerald-700" :
                                    brand.indexVsPopulation >= 100 ? "bg-blue-100 text-blue-700" :
                                    "bg-amber-100 text-amber-700"
                                  )}
                                >
                                  {brand.indexVsPopulation}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                Index vs. general population (100 = average)
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Category Insights */}
                  <div className="p-3 rounded-lg bg-muted/50">
                    <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-primary" />
                      Category Insights
                    </h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {category.insights.map((insight, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 shrink-0 mt-0.5" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>

          {/* Loyalty Profile Tab */}
          <TabsContent value="loyalty" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Overall Loyalty */}
              <div className="p-4 rounded-lg border bg-card">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  Overall Brand Loyalty
                </h4>
                <div className="text-4xl font-bold mb-2">{data.loyaltyProfile.overallLoyalty}%</div>
                <Progress value={data.loyaltyProfile.overallLoyalty} className="h-3 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {data.loyaltyProfile.overallLoyalty >= 70 ? "Highly loyal - prefers familiar brands" :
                   data.loyaltyProfile.overallLoyalty >= 50 ? "Moderately loyal - open to trying new brands" :
                   "Low loyalty - frequently switches brands"}
                </p>
              </div>

              {/* Switching Propensity */}
              <div className="p-4 rounded-lg border bg-card">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Switching Propensity
                </h4>
                <div className="text-4xl font-bold mb-2">{data.loyaltyProfile.switchingPropensity}%</div>
                <Progress value={data.loyaltyProfile.switchingPropensity} className="h-3 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Likelihood to switch brands for better value, features, or experience
                </p>
              </div>

              {/* Price vs Loyalty */}
              <div className="p-4 rounded-lg border bg-card">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Price vs Loyalty Balance
                </h4>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-sm">Price-driven</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: data.loyaltyProfile.priceVsLoyalty === "price" ? "25%" :
                               data.loyaltyProfile.priceVsLoyalty === "balanced" ? "50%" : "75%"
                      }}
                    />
                  </div>
                  <span className="text-sm">Loyalty-driven</span>
                </div>
                <p className="text-sm text-muted-foreground capitalize">
                  {data.loyaltyProfile.priceVsLoyalty === "price" ? "Primarily motivated by price and deals" :
                   data.loyaltyProfile.priceVsLoyalty === "balanced" ? "Balances price with brand preference" :
                   "Willing to pay more for preferred brands"}
                </p>
              </div>

              {/* Advocacy Level */}
              <div className="p-4 rounded-lg border bg-card">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  Brand Advocacy
                </h4>
                <div className="text-4xl font-bold mb-2">{data.loyaltyProfile.advocacyLevel}%</div>
                <Progress value={data.loyaltyProfile.advocacyLevel} className="h-3 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Likelihood to recommend favorite brands to others
                </p>
              </div>
            </div>

            {/* Loyalty Drivers */}
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Top Loyalty Drivers
              </h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {data.loyaltyProfile.topLoyaltyDrivers.map((driver, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-background"
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold">
                      {i + 1}
                    </div>
                    <span>{driver}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <h4 className="font-semibold text-emerald-600 mb-2">Retention Strategies</h4>
                <ul className="text-sm space-y-1">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 shrink-0 mt-0.5" />
                    Reward loyalty with exclusive perks
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 shrink-0 mt-0.5" />
                    Personalize communications
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 shrink-0 mt-0.5" />
                    Deliver consistent quality
                  </li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <h4 className="font-semibold text-blue-600 mb-2">Acquisition Strategies</h4>
                <ul className="text-sm space-y-1">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 shrink-0 mt-0.5" />
                    Lead with value proposition
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 shrink-0 mt-0.5" />
                    Leverage social proof
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 shrink-0 mt-0.5" />
                    Offer risk-free trials
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
