"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Sparkles,
  Clock,
  Activity,
  Heart,
  Tv,
  MessageSquare,
  History,
  Eye,
  ChevronDown,
  Star,
  StarOff,
  Play,
  Pause,
  Mail,
  FileJson,
  FileImage,
  FileText,
  Table,
  UserPlus,
  Link2,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Import new advanced audience components
import { useTranslations } from "next-intl"
import { AudiencePersona } from "@/components/audiences/audience-persona"
import { DayInTheLife } from "@/components/audiences/day-in-the-life"
import { HabitsBehaviors } from "@/components/audiences/habits-behaviors"
import { MediaConsumption } from "@/components/audiences/media-consumption"
import { BrandAffinities } from "@/components/audiences/brand-affinities"
import { CommentsPanel } from "@/components/shared/comments-panel"
import { VersionHistory } from "@/components/shared/version-history"

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
  criteria?: Record<string, unknown>
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
    criteria: { age: "25-40", income: "$65,000 - $120,000" },
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
    criteria: { age: "28-45", income: "$120,000+" },
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
    criteria: { age: "16-25", income: "$25,000 - $75,000" },
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
    criteria: { age: "35-55", income: "$200,000+" },
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
    criteria: { age: "30-50", income: "$150,000+" },
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
    criteria: { age: "32-48", income: "$85,000 - $175,000" },
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
    criteria: { age: "26-42", income: "$75,000 - $200,000" },
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
    criteria: { age: "16-35", income: "$40,000 - $100,000" },
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
    criteria: { age: "22-45", income: "$55,000 - $130,000" },
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
    criteria: { age: "25-45", income: "$80,000 - $250,000" },
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
  criteria?: Record<string, unknown>
}

interface ActivityItem {
  id: string
  action: string
  user: string
  timestamp: string
  details?: string
}

// Mock activity data
const mockActivityData: ActivityItem[] = [
  { id: "1", action: "viewed", user: "John Smith", timestamp: "10 minutes ago" },
  { id: "2", action: "exported", user: "Sarah Chen", timestamp: "2 hours ago", details: "JSON format" },
  { id: "3", action: "edited", user: "Marcus Johnson", timestamp: "1 day ago", details: "Updated demographics" },
  { id: "4", action: "shared", user: "Emily Thompson", timestamp: "2 days ago", details: "Via email to research team" },
  { id: "5", action: "created chart", user: "Sarah Chen", timestamp: "3 days ago", details: "Social Media Usage" },
  { id: "6", action: "added to crosstab", user: "Alex Rivera", timestamp: "4 days ago", details: "Gen Z Analysis" },
  { id: "7", action: "created", user: "Sarah Chen", timestamp: "1 week ago" },
]

export default function AudienceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const t = useTranslations("dashboard.audiences.detail")
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [audience, setAudience] = useState<AudienceType | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [shareEmail, setShareEmail] = useState("")
  const [shareRole, setShareRole] = useState("viewer")
  const [activeTab, setActiveTab] = useState("overview")

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

            // Extract demographics from criteria structure
            const demographics: { label: string; value: string }[] = []
            if (criteria.ageRange) {
              demographics.push({ label: t("demographics.ageRange"), value: `${criteria.ageRange.min}-${criteria.ageRange.max}` })
            }
            if (criteria.income) {
              demographics.push({ label: t("demographics.income"), value: `$${(criteria.income.min / 1000).toFixed(0)}K+` })
            }
            if (criteria.lifestyle && Array.isArray(criteria.lifestyle)) {
              criteria.lifestyle.forEach((l: string) => {
                demographics.push({ label: t("demographics.lifestyle"), value: formatCriteriaValue(l) })
              })
            }
            if (criteria.values && Array.isArray(criteria.values)) {
              criteria.values.forEach((v: string) => {
                demographics.push({ label: t("demographics.values"), value: formatCriteriaValue(v) })
              })
            }

            setAudience({
              id: apiAudience.id,
              name: apiAudience.name,
              description: apiAudience.description || "",
              size: formatSize(apiAudience.size || 0),
              // markets is at root level in seed data, not inside criteria
              markets: apiAudience.markets || criteria.markets || ["Global"],
              lastUsed: formatTimeAgo(apiAudience.updatedAt || apiAudience.lastUsed),
              createdBy: apiAudience.createdByName || "Unknown",
              demographics,
              // behaviors and interests are arrays of strings in seed data
              behaviors: (criteria.behaviors || []).map((b: string) => formatCriteriaValue(b)),
              interests: (criteria.interests || []).map((i: string) => formatCriteriaValue(i)),
              criteria,
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

  // Convert snake_case criteria values to Title Case for display
  function formatCriteriaValue(value: string): string {
    if (!value) return value
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  function formatTimeAgo(dateString: string): string {
    if (!dateString) return t("common.unknown")
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays > 0) return t("common.relativeTime.daysAgo", { count: diffDays })
    if (diffHours > 0) return t("common.relativeTime.hoursAgo", { count: diffHours })
    return t("common.relativeTime.justNow")
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
            <h1 className="text-3xl font-bold">{t("notFound")}</h1>
            <p className="text-muted-foreground mt-1">{t("notFoundDescription")}</p>
          </div>
        </div>
        <Card className="p-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t("notFound")}</h2>
          <p className="text-muted-foreground mb-4">
            {t("notFoundDetailedDescription")}
          </p>
          <Link href="/dashboard/audiences">
            <Button>{t("backToAudiences")}</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const handleExport = async (format: "json" | "csv" | "pdf" | "pptx" = "json") => {
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

      const dateStr = new Date().toISOString().split("T")[0]

      if (format === "csv") {
        // Create CSV content
        const demoHeaders = [t("export.csvHeaders.attribute"), t("export.csvHeaders.value")]
        const demoRows = audience.demographics.map(d => `"${d.label}","${d.value}"`)
        const behaviorRows = audience.behaviors.map((b, i) => `"${t("export.csvHeaders.behavior")} ${i + 1}","${b}"`)
        const interestRows = audience.interests.map((int, i) => `"${t("export.csvHeaders.interest")} ${i + 1}","${int}"`)
        const csvContent = [
          `"${t("export.csvHeaders.audience")}: ${audience.name}"`,
          `"${t("export.csvHeaders.description")}: ${audience.description}"`,
          `"${t("export.csvHeaders.size")}: ${audience.size}"`,
          `"${t("export.csvHeaders.markets")}: ${audience.markets.join(", ")}"`,
          "",
          demoHeaders.join(","),
          ...demoRows,
          "",
          t("export.csvHeaders.behaviors"),
          ...behaviorRows,
          "",
          t("export.csvHeaders.interests"),
          ...interestRows,
        ].join("\n")
        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `audience-${audience.id}-${dateStr}.csv`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        // JSON and other formats
        const content = JSON.stringify(exportData, null, 2)
        const blob = new Blob([content], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `audience-${audience.id}-${dateStr}.${format}`
        a.click()
        URL.revokeObjectURL(url)
      }
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
    <TooltipProvider>
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/audiences">
            <Button variant="ghost" size="icon" className="mt-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{audience.name}</h1>
              <Badge variant="secondary">{audience.size} {t("people")}</Badge>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsFavorite(!isFavorite)}>
                    {isFavorite ? <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /> : <StarOff className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isFavorite ? t("removeFromFavorites") : t("addToFavorites")}</TooltipContent>
              </Tooltip>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">{audience.description}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {audience.markets.join(", ")}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Used {audience.lastUsed}</span>
              <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {audience.createdBy}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => setAutoRefresh(!autoRefresh)}>
                {autoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{autoRefresh ? "Pause auto-refresh" : "Enable auto-refresh"}</TooltipContent>
          </Tooltip>

          <Link href={`/dashboard/playground?audience=${audience.id}`}>
            <Button variant="outline" size="sm">
              <Zap className="h-4 w-4 mr-2" />
              Explore
            </Button>
          </Link>

          <Button variant="outline" size="sm" onClick={() => setShowShareDialog(true)}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("json")}>
                <FileJson className="h-4 w-4 mr-2" /> Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                <Table className="h-4 w-4 mr-2" /> Export as CSV
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                <FileText className="h-4 w-4 mr-2" /> Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pptx")}>
                <FileImage className="h-4 w-4 mr-2" /> Export to PowerPoint
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/audiences/new?lookalike=${audience.id}`}>
                  <Users className="h-4 w-4 mr-2" /> Create Lookalike
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/crosstabs/new?audience=${audience.id}`}>
                  <BarChart3 className="h-4 w-4 mr-2" /> Add to Crosstab
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/dashboards/new?audience=${audience.id}`}>
                  <Target className="h-4 w-4 mr-2" /> Add to Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowScheduleDialog(true)}>
                <Mail className="h-4 w-4 mr-2" /> Schedule Report
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCopyLink}>
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Link2 className="h-4 w-4 mr-2" />}
                {copied ? "Copied!" : "Copy Link"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Tabs for Audience Insights */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <TabsList className="w-full justify-start flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="persona" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Persona
          </TabsTrigger>
          <TabsTrigger value="day-in-life" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Day in the Life
          </TabsTrigger>
          <TabsTrigger value="habits" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Habits & Behaviors
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Tv className="h-4 w-4" />
            Media Consumption
          </TabsTrigger>
          <TabsTrigger value="brands" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Brand Affinities
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comments
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Original Content */}
        <TabsContent value="overview">
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
                  <Button variant="outline" className="w-full justify-start bg-transparent" onClick={() => handleExport("json")} disabled={isExporting}>
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
        </TabsContent>

        {/* Persona Tab */}
        <TabsContent value="persona">
          <AudiencePersona
            audienceId={audience.id}
            audienceName={audience.name}
            audienceCriteria={audience.criteria}
          />
        </TabsContent>

        {/* Day in the Life Tab */}
        <TabsContent value="day-in-life">
          <DayInTheLife
            audienceId={audience.id}
            audienceName={audience.name}
            audienceCriteria={audience.criteria}
          />
        </TabsContent>

        {/* Habits & Behaviors Tab */}
        <TabsContent value="habits">
          <HabitsBehaviors
            audienceId={audience.id}
            audienceName={audience.name}
            audienceCriteria={audience.criteria}
          />
        </TabsContent>

        {/* Media Consumption Tab */}
        <TabsContent value="media">
          <MediaConsumption
            audienceId={audience.id}
            audienceName={audience.name}
            audienceCriteria={audience.criteria}
          />
        </TabsContent>

        {/* Brand Affinities Tab */}
        <TabsContent value="brands">
          <BrandAffinities
            audienceId={audience.id}
            audienceName={audience.name}
            audienceCriteria={audience.criteria}
          />
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="space-y-4">
          <Card className="p-6">
            <CommentsPanel
              resourceType="audience"
              resourceId={id}
              currentUserId="current-user"
            />
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Recent activity on this audience</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {mockActivityData.map(item => (
                    <div key={item.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        item.action === "viewed" ? "bg-blue-500/10 text-blue-500" :
                        item.action === "exported" ? "bg-green-500/10 text-green-500" :
                        item.action === "shared" ? "bg-orange-500/10 text-orange-500" :
                        item.action === "edited" ? "bg-yellow-500/10 text-yellow-500" :
                        item.action === "created" ? "bg-primary/10 text-primary" :
                        "bg-purple-500/10 text-purple-500"
                      }`}>
                        {item.action === "viewed" && <Eye className="h-4 w-4" />}
                        {item.action === "exported" && <Download className="h-4 w-4" />}
                        {item.action === "shared" && <Share2 className="h-4 w-4" />}
                        {item.action === "edited" && <Edit className="h-4 w-4" />}
                        {item.action === "created" && <Sparkles className="h-4 w-4" />}
                        {item.action === "created chart" && <BarChart3 className="h-4 w-4" />}
                        {item.action === "added to crosstab" && <Users className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{item.user}</span>
                          <span className="text-muted-foreground"> {item.action}</span>
                        </p>
                        {item.details && <p className="text-xs text-muted-foreground">{item.details}</p>}
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {item.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card className="p-6">
            <VersionHistory
              resourceType="audience"
              resourceId={id}
              resourceName={audience.name}
              versions={[]}
              onRestore={(_versionId) => {
                // Version restore functionality to be implemented
              }}
            />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete.description", { name: audience.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("delete.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {t("delete.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("share.title")}</DialogTitle>
            <DialogDescription>
              {t("share.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="shareEmail">{t("share.emailLabel")}</Label>
                <Input
                  id="shareEmail"
                  placeholder={t("share.emailPlaceholder")}
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>{t("share.roleLabel")}</Label>
                <Select value={shareRole} onValueChange={setShareRole}>
                  <SelectTrigger className="mt-2 w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">{t("share.viewer")}</SelectItem>
                    <SelectItem value="editor">{t("share.editor")}</SelectItem>
                    <SelectItem value="admin">{t("share.admin")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <Label className="text-xs text-muted-foreground">{t("share.shareLink")}</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input value={typeof window !== 'undefined' ? window.location.href : ''} readOnly className="text-xs" />
                <Button size="sm" variant="outline" onClick={handleCopyLink}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>{t("share.cancel")}</Button>
            <Button onClick={() => { setShowShareDialog(false); setShareEmail(""); }}>
              <UserPlus className="h-4 w-4 mr-2" /> {t("share.share")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Report Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("schedule.title")}</DialogTitle>
            <DialogDescription>{t("schedule.description")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("schedule.recipients")}</Label>
              <Input placeholder={t("schedule.recipientsPlaceholder")} className="mt-2" />
            </div>
            <div>
              <Label>{t("schedule.frequency")}</Label>
              <Select defaultValue="weekly">
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{t("schedule.daily")}</SelectItem>
                  <SelectItem value="weekly">{t("schedule.weekly")}</SelectItem>
                  <SelectItem value="monthly">{t("schedule.monthly")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("schedule.format")}</Label>
              <Select defaultValue="pdf">
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">{t("schedule.pdf")}</SelectItem>
                  <SelectItem value="csv">{t("schedule.csv")}</SelectItem>
                  <SelectItem value="json">{t("schedule.json")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>{t("schedule.cancel")}</Button>
            <Button><Mail className="h-4 w-4 mr-2" /> {t("schedule.schedule")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  )
}
