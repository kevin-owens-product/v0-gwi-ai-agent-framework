"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  Download,
  Share2,
  Edit,
  MoreHorizontal,
  Users,
  Calendar,
  Globe,
  TrendingUp,
  BarChart3,
  Target,
  Zap,
  Loader2,
  Copy,
  Check,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Mock audience data - 10 advanced examples
const audienceData: Record<string, {
  id: string
  name: string
  description: string
  size: string
  markets: string[]
  lastUsed: string
  createdBy: string
  demographics: { label: string; value: string }[]
  behaviors: string[]
  interests: string[]
}> = {
  "1": {
    id: "1",
    name: "Eco-Conscious Millennials",
    description: "Sustainability-focused consumers aged 25-40 with strong environmental values and premium brand affinity",
    size: "1.2M",
    markets: ["US", "UK", "DE", "FR", "NL"],
    lastUsed: "2 hours ago",
    createdBy: "Sarah Chen",
    demographics: [
      { label: "Age Range", value: "25-40" },
      { label: "Gender", value: "52% Female" },
      { label: "Income", value: "$65K-$120K" },
      { label: "Education", value: "Bachelor's+" },
      { label: "Location", value: "Urban Metro" },
      { label: "HH Size", value: "2.3 avg" },
    ],
    behaviors: [
      "Pays premium for sustainable products (avg +23%)",
      "Researches brand sustainability practices before purchase",
      "Uses reusable products daily",
      "Reduced meat consumption by 40%+ in past year",
      "Prefers public transit or EV ownership",
      "Active recycler and composter",
      "Influences household purchasing decisions",
    ],
    interests: [
      "Climate activism & policy",
      "Organic & local food sourcing",
      "Renewable energy investment",
      "Ethical fashion & slow fashion",
      "Zero-waste lifestyle",
      "Outdoor recreation & nature",
      "Wellness & mindfulness",
    ],
  },
  "2": {
    id: "2",
    name: "Tech Early Adopters",
    description: "High-income innovation enthusiasts who are first to adopt new technologies and influence peer purchases",
    size: "850K",
    markets: ["US", "JP", "KR", "DE", "UK"],
    lastUsed: "1 day ago",
    createdBy: "Marcus Johnson",
    demographics: [
      { label: "Age Range", value: "28-45" },
      { label: "Gender", value: "62% Male" },
      { label: "Income", value: "$120K+" },
      { label: "Education", value: "Graduate+" },
      { label: "Location", value: "Tech Hubs" },
      { label: "Occupation", value: "Tech/Finance" },
    ],
    behaviors: [
      "Pre-orders 80% of new flagship devices",
      "Beta tests 5+ software products annually",
      "Owns 12+ connected smart devices",
      "Spends 4+ hours daily on tech content",
      "Recommends products to 15+ people monthly",
      "Attends tech conferences and launches",
      "Invests in tech stocks and crypto",
    ],
    interests: [
      "Artificial Intelligence & ML",
      "Consumer electronics & gadgets",
      "Startup ecosystem & VC",
      "Cryptocurrency & DeFi",
      "Gaming & esports",
      "Smart home automation",
      "Space technology",
    ],
  },
  "3": {
    id: "3",
    name: "Gen Z Content Creators",
    description: "Digital-native creators aged 16-25 building personal brands across multiple social platforms",
    size: "2.1M",
    markets: ["Global"],
    lastUsed: "3 days ago",
    createdBy: "Alex Rivera",
    demographics: [
      { label: "Age Range", value: "16-25" },
      { label: "Gender", value: "55% Female" },
      { label: "Income", value: "$25K-$75K" },
      { label: "Education", value: "In School/Recent Grad" },
      { label: "Location", value: "Global Urban" },
      { label: "Platform", value: "4.2 avg platforms" },
    ],
    behaviors: [
      "Posts content 5+ times weekly",
      "Creates short-form video content primarily",
      "Engages with brand partnerships monthly",
      "Multi-platform presence (TikTok, IG, YouTube)",
      "Monetizes through multiple revenue streams",
      "Collaborates with other creators regularly",
      "Follows and sets micro-trends",
    ],
    interests: [
      "Social media trends & algorithms",
      "Video editing & production",
      "Fashion & beauty trends",
      "Music & audio trends",
      "Pop culture & entertainment",
      "Personal branding",
      "Entrepreneurship",
    ],
  },
  "4": {
    id: "4",
    name: "Luxury Experience Seekers",
    description: "Affluent consumers prioritizing premium experiences over material goods, focused on travel and dining",
    size: "680K",
    markets: ["US", "UK", "UAE", "SG", "HK"],
    lastUsed: "5 hours ago",
    createdBy: "Victoria Wells",
    demographics: [
      { label: "Age Range", value: "35-55" },
      { label: "Gender", value: "48% Female" },
      { label: "Income", value: "$200K+" },
      { label: "Education", value: "Graduate+" },
      { label: "Location", value: "Major Cities" },
      { label: "Net Worth", value: "$1M+" },
    ],
    behaviors: [
      "Takes 4+ international trips annually",
      "Spends $500+ per dining experience",
      "Books exclusive/members-only experiences",
      "Values personalization over price",
      "Engages with luxury brand loyalty programs",
      "Prefers boutique over chain hotels",
      "Seeks unique cultural experiences",
    ],
    interests: [
      "Fine dining & culinary arts",
      "Luxury travel & hospitality",
      "Art collecting & galleries",
      "Wine & spirits connoisseurship",
      "Private members clubs",
      "Wellness retreats & spas",
      "Cultural experiences & events",
    ],
  },
  "5": {
    id: "5",
    name: "Health-Optimized Professionals",
    description: "Career-focused individuals investing heavily in health optimization, biohacking, and peak performance",
    size: "920K",
    markets: ["US", "UK", "AU", "CA", "DE"],
    lastUsed: "1 day ago",
    createdBy: "Dr. James Park",
    demographics: [
      { label: "Age Range", value: "30-50" },
      { label: "Gender", value: "58% Male" },
      { label: "Income", value: "$150K+" },
      { label: "Education", value: "Bachelor's+" },
      { label: "Location", value: "Urban Professional" },
      { label: "Work Style", value: "High-Performance" },
    ],
    behaviors: [
      "Tracks 5+ health metrics daily",
      "Spends $300+/month on supplements",
      "Uses 3+ health tracking devices",
      "Follows structured exercise regimen",
      "Practices intermittent fasting",
      "Prioritizes sleep optimization",
      "Consults with health coaches/nutritionists",
    ],
    interests: [
      "Biohacking & longevity",
      "Fitness & strength training",
      "Nutrition science & supplements",
      "Sleep optimization",
      "Mental performance & focus",
      "Wearable technology",
      "Preventive healthcare",
    ],
  },
  "6": {
    id: "6",
    name: "Suburban Family Decision Makers",
    description: "Parents in suburban households who control majority of family purchasing across multiple categories",
    size: "3.4M",
    markets: ["US", "UK", "CA", "AU"],
    lastUsed: "6 hours ago",
    createdBy: "Emily Thompson",
    demographics: [
      { label: "Age Range", value: "32-48" },
      { label: "Gender", value: "68% Female" },
      { label: "Income", value: "$85K-$175K" },
      { label: "Education", value: "Bachelor's+" },
      { label: "Location", value: "Suburban" },
      { label: "Children", value: "2.1 avg" },
    ],
    behaviors: [
      "Controls 85% of household purchases",
      "Heavy online research before buying",
      "Values safety and quality for family",
      "Price-compares across 3+ retailers",
      "Influenced by parent community reviews",
      "Subscribes to family-oriented services",
      "Plans purchases around school calendar",
    ],
    interests: [
      "Family health & safety",
      "Educational resources & activities",
      "Home improvement & organization",
      "Family travel & experiences",
      "Meal planning & nutrition",
      "Children's extracurriculars",
      "Financial planning for family",
    ],
  },
  "7": {
    id: "7",
    name: "Digital Nomad Professionals",
    description: "Location-independent workers who blend travel with remote careers, prioritizing flexibility and experiences",
    size: "1.5M",
    markets: ["Global"],
    lastUsed: "2 days ago",
    createdBy: "Noah Williams",
    demographics: [
      { label: "Age Range", value: "26-42" },
      { label: "Gender", value: "52% Male" },
      { label: "Income", value: "$75K-$200K" },
      { label: "Education", value: "Bachelor's+" },
      { label: "Location", value: "Variable/Global" },
      { label: "Work Type", value: "Remote/Freelance" },
    ],
    behaviors: [
      "Changes location 4+ times annually",
      "Works from coworking spaces regularly",
      "Prioritizes fast WiFi in accommodations",
      "Uses 10+ productivity/travel apps",
      "Maintains minimal possessions",
      "Books accommodations monthly+",
      "Values experiences over stability",
    ],
    interests: [
      "Remote work optimization",
      "Travel hacking & deals",
      "Coworking & community spaces",
      "Cultural immersion",
      "Minimalism & essentialism",
      "Photography & content creation",
      "Language learning",
    ],
  },
  "8": {
    id: "8",
    name: "Gaming & Esports Enthusiasts",
    description: "Dedicated gamers who spend significant time and money on gaming, streaming, and esports content",
    size: "4.2M",
    markets: ["US", "KR", "JP", "BR", "DE", "UK"],
    lastUsed: "4 hours ago",
    createdBy: "Kevin Zhang",
    demographics: [
      { label: "Age Range", value: "16-35" },
      { label: "Gender", value: "71% Male" },
      { label: "Income", value: "$40K-$100K" },
      { label: "Education", value: "Varied" },
      { label: "Location", value: "Urban/Suburban" },
      { label: "Play Time", value: "20+ hrs/week" },
    ],
    behaviors: [
      "Plays 20+ hours weekly across platforms",
      "Spends $100+/month on games & in-game",
      "Watches 10+ hours of gaming content weekly",
      "Follows esports leagues and tournaments",
      "Participates in online gaming communities",
      "Upgrades hardware annually",
      "Pre-orders anticipated game releases",
    ],
    interests: [
      "Competitive gaming & esports",
      "Gaming hardware & peripherals",
      "Streaming platforms & creators",
      "Game development & mods",
      "Virtual reality gaming",
      "Gaming merchandise & collectibles",
      "Anime & gaming crossovers",
    ],
  },
  "9": {
    id: "9",
    name: "Conscious Beauty Consumers",
    description: "Beauty enthusiasts prioritizing clean ingredients, cruelty-free products, and inclusive brands",
    size: "2.8M",
    markets: ["US", "UK", "FR", "KR", "AU"],
    lastUsed: "1 day ago",
    createdBy: "Isabella Martinez",
    demographics: [
      { label: "Age Range", value: "22-45" },
      { label: "Gender", value: "82% Female" },
      { label: "Income", value: "$55K-$130K" },
      { label: "Education", value: "Bachelor's+" },
      { label: "Location", value: "Urban" },
      { label: "Spend", value: "$150+/month" },
    ],
    behaviors: [
      "Reads ingredient lists before purchasing",
      "Pays 30%+ premium for clean beauty",
      "Follows beauty influencers for research",
      "Avoids products with specific ingredients",
      "Supports BIPOC and indie brands",
      "Recycles beauty packaging",
      "Tries 3+ new products monthly",
    ],
    interests: [
      "Clean & natural ingredients",
      "Cruelty-free & vegan products",
      "Skincare science & routines",
      "Inclusive beauty brands",
      "Sustainable packaging",
      "K-beauty & J-beauty trends",
      "DIY beauty & wellness",
    ],
  },
  "10": {
    id: "10",
    name: "Financial Independence Seekers",
    description: "Individuals actively pursuing early retirement through aggressive saving, investing, and side income",
    size: "1.8M",
    markets: ["US", "UK", "CA", "AU", "NL"],
    lastUsed: "8 hours ago",
    createdBy: "David Chen",
    demographics: [
      { label: "Age Range", value: "25-45" },
      { label: "Gender", value: "56% Male" },
      { label: "Income", value: "$80K-$250K" },
      { label: "Education", value: "Bachelor's+" },
      { label: "Location", value: "Urban/Suburban" },
      { label: "Savings Rate", value: "40%+" },
    ],
    behaviors: [
      "Saves 40%+ of income",
      "Invests in index funds primarily",
      "Tracks net worth monthly",
      "Has multiple income streams",
      "Optimizes tax strategies",
      "Lives below means intentionally",
      "Consumes FIRE community content",
    ],
    interests: [
      "Index fund investing",
      "Real estate investment",
      "Tax optimization strategies",
      "Side hustles & passive income",
      "Frugal living strategies",
      "Early retirement planning",
      "Financial independence community",
    ],
  },
}

interface AudienceType {
  id: string
  name: string
  description: string
  size: string
  markets: string[]
  lastUsed: string
  createdBy: string
  demographics: { label: string; value: string }[]
  behaviors: string[]
  interests: string[]
}

export default function AudienceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [audience, setAudience] = useState<AudienceType | null>(null)

  useEffect(() => {
    async function fetchAudience() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/v1/audiences/${id}`)
        if (response.ok) {
          const data = await response.json()
          const apiAudience = data.data || data
          if (apiAudience && apiAudience.id) {
            const criteria = apiAudience.criteria || {}
            setAudience({
              id: apiAudience.id,
              name: apiAudience.name,
              description: apiAudience.description || "",
              size: formatSize(apiAudience.size || 0),
              markets: criteria.markets || ["Global"],
              lastUsed: formatTimeAgo(apiAudience.updatedAt),
              createdBy: apiAudience.createdByName || "Unknown",
              demographics: criteria.demographics || [],
              behaviors: criteria.behaviors || [],
              interests: criteria.interests || [],
            })
          } else {
            setAudience(audienceData[id] || null)
          }
        } else {
          setAudience(audienceData[id] || null)
        }
      } catch (error) {
        console.error("Failed to fetch audience:", error)
        setAudience(audienceData[id] || null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAudience()
  }, [id])

  function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    return "Just now"
  }

  function formatSize(size: number): string {
    if (size >= 1000000) return `${(size / 1000000).toFixed(1)}M`
    if (size >= 1000) return `${(size / 1000).toFixed(0)}K`
    return size.toString()
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (!audience) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/audiences">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Audience Not Found</h1>
            <p className="text-muted-foreground mt-1">The requested audience could not be found</p>
          </div>
        </div>
        <Card className="p-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Audience not found</h2>
          <p className="text-muted-foreground mb-4">
            The audience you're looking for doesn't exist or has been deleted.
          </p>
          <Link href="/dashboard/audiences">
            <Button>Back to Audiences</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const exportData = {
        audience: {
          id: audience.id,
          name: audience.name,
          description: audience.description,
          size: audience.size,
          markets: audience.markets,
          demographics: audience.demographics,
          behaviors: audience.behaviors,
          interests: audience.interests,
        },
        metadata: {
          exportedAt: new Date().toISOString(),
          lastUsed: audience.lastUsed,
          createdBy: audience.createdBy,
        },
      }
      const content = JSON.stringify(exportData, null, 2)
      const blob = new Blob([content], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `audience-${audience.id}-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/v1/audiences/${id}`, { method: "DELETE" })
      if (response.ok) {
        router.push("/dashboard/audiences")
      }
    } catch (error) {
      console.error("Delete failed:", error)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDuplicate = async () => {
    try {
      const response = await fetch("/api/v1/audiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${audience.name} (Copy)`,
          description: audience.description,
          criteria: {
            demographics: audience.demographics,
            behaviors: audience.behaviors,
            interests: audience.interests,
            markets: audience.markets,
          },
        }),
      })
      if (response.ok) {
        router.push("/dashboard/audiences")
      }
    } catch (error) {
      console.error("Duplicate failed:", error)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/audiences">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{audience.name}</h1>
            <p className="text-muted-foreground mt-1">{audience.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/playground?audience=${audience.id}`}>
            <Button variant="outline" size="sm" className="bg-transparent">
              <Zap className="h-4 w-4 mr-2" />
              Explore
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="bg-transparent">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent" onClick={handleExport} disabled={isExporting}>
            {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            {isExporting ? "Exporting..." : "Export"}
          </Button>
          <Link href={`/dashboard/audiences/new?edit=${audience.id}`}>
            <Button size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDuplicate}>Duplicate</DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/audiences/new?lookalike=${audience.id}`}>Create Lookalike</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/crosstabs/new?audience=${audience.id}`}>Add to Crosstab</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Audience</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{audience.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{audience.size} people</span>
        </div>
        <div className="flex items-center gap-1">
          <Globe className="h-4 w-4" />
          <span>{audience.markets.join(", ")}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>Used {audience.lastUsed}</span>
        </div>
        <div className="flex items-center gap-1">
          <Target className="h-4 w-4" />
          <span>Created by {audience.createdBy}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Demographics */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Demographics
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {audience.demographics.map((demo) => (
                <div key={demo.label} className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{demo.label}</p>
                  <p className="font-semibold">{demo.value}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Behaviors */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Key Behaviors
            </h3>
            <div className="flex flex-wrap gap-2">
              {audience.behaviors.map((behavior) => (
                <Badge key={behavior} variant="secondary" className="text-sm py-1.5">
                  {behavior}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Interests */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {audience.interests.map((interest) => (
                <Badge key={interest} variant="outline" className="text-sm py-1.5">
                  {interest}
                </Badge>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Audience Summary</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Size</p>
                <p className="text-2xl font-bold">{audience.size}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Markets</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {audience.markets.map((market) => (
                    <Badge key={market} variant="secondary">
                      {market}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Quick Actions</h3>
            <div className="space-y-2">
              <Link href={`/dashboard/charts/new?audience=${audience.id}`}>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Create Chart
                </Button>
              </Link>
              <Link href={`/dashboard/crosstabs/new?audience=${audience.id}`}>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Users className="h-4 w-4 mr-2" />
                  Compare Audiences
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleExport} disabled={isExporting}>
                {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Export Profile
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleCopyLink}>
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
