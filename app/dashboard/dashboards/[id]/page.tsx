"use client"

import { useState, useEffect, useMemo, use, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Eye,
  Calendar,
  Users,
  LayoutDashboard,
  BarChart3,
  Plus,
  Loader2,
  Copy,
  Check,
  Trash2,
  Filter,
  Search,
  X,
  SlidersHorizontal,
  Grid3X3,
  Rows3,
  LayoutGrid,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Target,
  PieChart,
  LineChart,
  Activity,
  Star,
  StarOff,
  Link2,
  Mail,
  Clock,
  Maximize2,
  Minimize2,
  MoreVertical,
  Bell,
  BellOff,
  AlertTriangle,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  FileJson,
  FileText,
  FileImage,
  Table,
  Tag,
  Hash,
  Globe,
  Lock,
  UserPlus,
  Settings,
  Zap,
  History,
  Shield,
  ExternalLink,
  ChevronRight,
  Play,
  Pause,
  Timer,
  Info,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuLabel,
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ChartRenderer, generateSampleData } from "@/components/charts"
import { CommentsPanel } from "@/components/shared/comments-panel"
import { VersionHistory } from "@/components/shared/version-history"
import type { ChartType } from "@/components/charts"

// Mock dashboard data - 10 advanced examples
const dashboardData: Record<string, {
  id: string
  name: string
  description: string
  charts: { id: string; name: string; type: ChartType; category?: string; dataSource?: string }[]
  lastModified: string
  views: number
  createdBy: string
  isPublic: boolean
  category: string
  tags?: string[]
}> = {
  "1": {
    id: "1",
    name: "Q4 2024 Campaign Performance Hub",
    description: "Comprehensive performance analytics for Q4 marketing campaigns across all channels with real-time KPI tracking",
    charts: [
      { id: "c1", name: "Multi-Channel Engagement Rates", type: "BAR", category: "Engagement", dataSource: "GWI Core" },
      { id: "c2", name: "Full-Funnel Conversion Analysis", type: "FUNNEL", category: "Conversion", dataSource: "GWI Core" },
      { id: "c3", name: "Weekly Performance Trajectory", type: "LINE", category: "Performance", dataSource: "Internal" },
      { id: "c4", name: "Audience Reach by Demographic", type: "PIE", category: "Audience", dataSource: "GWI Core" },
      { id: "c5", name: "ROI by Campaign & Creative", type: "BAR", category: "ROI", dataSource: "Internal" },
      { id: "c6", name: "CTR Trend with Benchmarks", type: "AREA", category: "Performance", dataSource: "GWI Core" },
      { id: "c7", name: "Brand Lift by Exposure Level", type: "RADAR", category: "Brand", dataSource: "GWI Core" },
      { id: "c8", name: "CPA Optimization Tracker", type: "LINE", category: "Cost", dataSource: "Internal" },
      { id: "c9", name: "Attribution Model Comparison", type: "BAR", category: "Attribution", dataSource: "Internal" },
      { id: "c10", name: "Budget Allocation Efficiency", type: "DONUT", category: "Budget", dataSource: "Internal" },
    ],
    lastModified: "1 hour ago",
    views: 2341,
    createdBy: "Sarah Chen",
    isPublic: false,
    category: "Campaign Analytics",
    tags: ["Q4", "Campaign", "Performance", "Marketing"],
  },
  "2": {
    id: "2",
    name: "Global Consumer Trends 2024",
    description: "Annual consumer behavior analysis covering digital habits, purchase patterns, and emerging lifestyle trends across 48 markets",
    charts: [
      { id: "c1", name: "Social Platform Penetration by Gen", type: "BAR", category: "Social", dataSource: "GWI Core" },
      { id: "c2", name: "Omnichannel Shopping Mix", type: "PIE", category: "Commerce", dataSource: "GWI Core" },
      { id: "c3", name: "Brand Loyalty Evolution (3Y)", type: "LINE", category: "Brand", dataSource: "GWI Core" },
      { id: "c4", name: "Sustainability Attitude Segments", type: "TREEMAP", category: "Sustainability", dataSource: "GWI Zeitgeist" },
      { id: "c5", name: "Device Ecosystem Usage", type: "DONUT", category: "Technology", dataSource: "GWI Core" },
      { id: "c6", name: "Content Format Preferences", type: "BAR", category: "Media", dataSource: "GWI Core" },
      { id: "c7", name: "Purchase Decision Drivers", type: "RADAR", category: "Commerce", dataSource: "GWI Core" },
      { id: "c8", name: "Generational Breakdown", type: "PIE", category: "Demographics", dataSource: "GWI Core" },
      { id: "c9", name: "Regional Behavior Variations", type: "BAR", category: "Regional", dataSource: "GWI Core" },
      { id: "c10", name: "YoY Trend Comparison", type: "AREA", category: "Trends", dataSource: "GWI Core" },
      { id: "c11", name: "Emerging Behavior Indicators", type: "BAR", category: "Trends", dataSource: "GWI Zeitgeist" },
      { id: "c12", name: "Category Market Share", type: "DONUT", category: "Market Share", dataSource: "GWI Core" },
    ],
    lastModified: "4 hours ago",
    views: 5672,
    createdBy: "Marcus Johnson",
    isPublic: true,
    category: "Market Research",
    tags: ["2024", "Consumer", "Global", "Trends"],
  },
  "3": {
    id: "3",
    name: "Competitive Brand Health Tracker",
    description: "Real-time monitoring of brand perception metrics vs. key competitors with sentiment analysis and advocacy tracking",
    charts: [
      { id: "c1", name: "Unaided vs Aided Awareness", type: "BAR", category: "Awareness", dataSource: "GWI Brand Tracker" },
      { id: "c2", name: "NPS Trend Analysis", type: "LINE", category: "NPS", dataSource: "Internal" },
      { id: "c3", name: "Share of Voice Distribution", type: "PIE", category: "SOV", dataSource: "Social Listening" },
      { id: "c4", name: "Sentiment Score by Channel", type: "RADAR", category: "Sentiment", dataSource: "Social Listening" },
      { id: "c5", name: "Purchase Consideration Funnel", type: "FUNNEL", category: "Funnel", dataSource: "GWI Brand Tracker" },
      { id: "c6", name: "Brand Attribute Mapping", type: "BAR", category: "Attributes", dataSource: "GWI Brand Tracker" },
      { id: "c7", name: "Competitive Positioning Matrix", type: "SCATTER", category: "Positioning", dataSource: "GWI Brand Tracker" },
      { id: "c8", name: "Brand Advocacy Index", type: "AREA", category: "Advocacy", dataSource: "GWI Core" },
    ],
    lastModified: "2 days ago",
    views: 3892,
    createdBy: "Emily Thompson",
    isPublic: true,
    category: "Brand Intelligence",
    tags: ["Brand", "Competitive", "Health", "Tracking"],
  },
  "4": {
    id: "4",
    name: "Gen Z Insights Command Center",
    description: "Deep-dive analysis of Gen Z consumer behaviors, platform preferences, and brand relationships across global markets",
    charts: [
      { id: "c1", name: "Platform Time Allocation", type: "DONUT", category: "Platforms", dataSource: "GWI Core" },
      { id: "c2", name: "Content Consumption by Format", type: "BAR", category: "Content", dataSource: "GWI Core" },
      { id: "c3", name: "Shopping Journey Mapping", type: "FUNNEL", category: "Commerce", dataSource: "GWI Core" },
      { id: "c4", name: "Influencer Trust Levels", type: "BAR", category: "Influencers", dataSource: "GWI Zeitgeist" },
      { id: "c5", name: "Values & Causes Alignment", type: "RADAR", category: "Values", dataSource: "GWI Core" },
      { id: "c6", name: "Brand Discovery Channels", type: "PIE", category: "Discovery", dataSource: "GWI Core" },
      { id: "c7", name: "Purchase Influence Factors", type: "BAR", category: "Influence", dataSource: "GWI Core" },
      { id: "c8", name: "Cross-Market Comparison", type: "BAR", category: "Regional", dataSource: "GWI Core" },
      { id: "c9", name: "Emerging Trend Radar", type: "RADAR", category: "Trends", dataSource: "GWI Zeitgeist" },
    ],
    lastModified: "6 hours ago",
    views: 4521,
    createdBy: "Alex Rivera",
    isPublic: true,
    category: "Audience Intelligence",
    tags: ["Gen Z", "Youth", "Insights", "Audience"],
  },
  "5": {
    id: "5",
    name: "E-commerce Performance Analytics",
    description: "End-to-end e-commerce funnel analysis with cart behavior, payment preferences, and cross-channel attribution",
    charts: [
      { id: "c1", name: "Funnel Drop-off Analysis", type: "FUNNEL", category: "Funnel", dataSource: "Internal" },
      { id: "c2", name: "Cart Abandonment Reasons", type: "PIE", category: "Cart", dataSource: "Internal" },
      { id: "c3", name: "Revenue by Channel", type: "BAR", category: "Revenue", dataSource: "Internal" },
      { id: "c4", name: "Payment Method Preferences", type: "DONUT", category: "Payments", dataSource: "GWI Core" },
      { id: "c5", name: "AOV Trend by Segment", type: "LINE", category: "AOV", dataSource: "Internal" },
      { id: "c6", name: "Repeat Purchase Patterns", type: "AREA", category: "Retention", dataSource: "Internal" },
      { id: "c7", name: "Cross-sell/Upsell Success", type: "BAR", category: "Cross-sell", dataSource: "Internal" },
      { id: "c8", name: "Mobile vs Desktop Split", type: "PIE", category: "Device", dataSource: "Internal" },
      { id: "c9", name: "Seasonal Performance", type: "LINE", category: "Seasonality", dataSource: "Internal" },
      { id: "c10", name: "Customer Lifetime Value", type: "TREEMAP", category: "CLV", dataSource: "Internal" },
    ],
    lastModified: "3 hours ago",
    views: 2987,
    createdBy: "Victoria Wells",
    isPublic: false,
    category: "Commerce Analytics",
    tags: ["E-commerce", "Funnel", "Revenue", "Analytics"],
  },
  "6": {
    id: "6",
    name: "Media Mix Optimization Center",
    description: "Cross-channel media performance analysis with budget allocation recommendations and reach/frequency optimization",
    charts: [
      { id: "c1", name: "Channel Efficiency Matrix", type: "BAR", category: "Efficiency", dataSource: "Internal" },
      { id: "c2", name: "Budget Allocation Current", type: "DONUT", category: "Budget", dataSource: "Internal" },
      { id: "c3", name: "Reach Curve Analysis", type: "AREA", category: "Reach", dataSource: "GWI Core" },
      { id: "c4", name: "Frequency Distribution", type: "BAR", category: "Frequency", dataSource: "Internal" },
      { id: "c5", name: "Cross-Channel Synergy", type: "RADAR", category: "Synergy", dataSource: "Internal" },
      { id: "c6", name: "Daypart Performance", type: "BAR", category: "Daypart", dataSource: "GWI Media" },
      { id: "c7", name: "Creative Fatigue Tracker", type: "LINE", category: "Creative", dataSource: "Internal" },
      { id: "c8", name: "Incremental Reach by Medium", type: "BAR", category: "Reach", dataSource: "GWI Core" },
    ],
    lastModified: "8 hours ago",
    views: 1876,
    createdBy: "Kevin Zhang",
    isPublic: false,
    category: "Media Planning",
    tags: ["Media", "Budget", "Optimization", "Planning"],
  },
  "7": {
    id: "7",
    name: "Sustainability & ESG Tracker",
    description: "Consumer sustainability attitudes, brand perception on ESG issues, and green product adoption patterns",
    charts: [
      { id: "c1", name: "Sustainability Segment Sizes", type: "PIE", category: "Segments", dataSource: "GWI Core" },
      { id: "c2", name: "Willingness to Pay Premium", type: "BAR", category: "Pricing", dataSource: "GWI Core" },
      { id: "c3", name: "ESG Awareness Trend", type: "AREA", category: "Awareness", dataSource: "GWI Zeitgeist" },
      { id: "c4", name: "Green Product Adoption", type: "FUNNEL", category: "Adoption", dataSource: "GWI Core" },
      { id: "c5", name: "Brand ESG Perception", type: "RADAR", category: "Perception", dataSource: "GWI Brand Tracker" },
      { id: "c6", name: "Greenwashing Skepticism", type: "BAR", category: "Skepticism", dataSource: "GWI Zeitgeist" },
      { id: "c7", name: "Sustainable Behavior Index", type: "LINE", category: "Behavior", dataSource: "GWI Core" },
      { id: "c8", name: "Category Sustainability Importance", type: "BAR", category: "Category", dataSource: "GWI Core" },
      { id: "c9", name: "Gen Comparison on ESG", type: "BAR", category: "Generational", dataSource: "GWI Core" },
    ],
    lastModified: "1 day ago",
    views: 2234,
    createdBy: "Dr. James Park",
    isPublic: true,
    category: "ESG & Sustainability",
    tags: ["ESG", "Sustainability", "Green", "Environment"],
  },
  "8": {
    id: "8",
    name: "Streaming & Entertainment Landscape",
    description: "Comprehensive analysis of streaming platform usage, content preferences, and subscriber behavior patterns",
    charts: [
      { id: "c1", name: "Platform Subscriber Share", type: "DONUT", category: "Market Share", dataSource: "GWI Core" },
      { id: "c2", name: "Multi-Subscription Patterns", type: "BAR", category: "Subscriptions", dataSource: "GWI Core" },
      { id: "c3", name: "Churn Risk Indicators", type: "FUNNEL", category: "Churn", dataSource: "Internal" },
      { id: "c4", name: "Content Genre Preferences", type: "TREEMAP", category: "Content", dataSource: "GWI Core" },
      { id: "c5", name: "Viewing Time by Daypart", type: "AREA", category: "Viewing", dataSource: "GWI Core" },
      { id: "c6", name: "Ad-Tier Adoption Rate", type: "LINE", category: "Ad-tier", dataSource: "GWI Zeitgeist" },
      { id: "c7", name: "Device Preference Split", type: "PIE", category: "Device", dataSource: "GWI Core" },
      { id: "c8", name: "Binge vs Linear Viewing", type: "BAR", category: "Viewing", dataSource: "GWI Core" },
      { id: "c9", name: "Password Sharing Behavior", type: "BAR", category: "Behavior", dataSource: "GWI Zeitgeist" },
      { id: "c10", name: "Content Discovery Methods", type: "RADAR", category: "Discovery", dataSource: "GWI Core" },
    ],
    lastModified: "5 hours ago",
    views: 3456,
    createdBy: "Isabella Martinez",
    isPublic: true,
    category: "Entertainment",
    tags: ["Streaming", "Entertainment", "Media", "Content"],
  },
  "9": {
    id: "9",
    name: "Financial Services Consumer Insights",
    description: "Banking, fintech, and investment behavior analysis with product adoption and trust metrics by segment",
    charts: [
      { id: "c1", name: "Digital Banking Adoption", type: "AREA", category: "Banking", dataSource: "GWI Core" },
      { id: "c2", name: "Fintech Product Usage", type: "BAR", category: "Fintech", dataSource: "GWI Core" },
      { id: "c3", name: "Investment App Penetration", type: "BAR", category: "Investing", dataSource: "GWI Core" },
      { id: "c4", name: "BNPL Usage by Demo", type: "BAR", category: "BNPL", dataSource: "GWI Zeitgeist" },
      { id: "c5", name: "Trust in Financial Institutions", type: "RADAR", category: "Trust", dataSource: "GWI Core" },
      { id: "c6", name: "Crypto Ownership Trends", type: "LINE", category: "Crypto", dataSource: "GWI Zeitgeist" },
      { id: "c7", name: "Insurance Product Gaps", type: "FUNNEL", category: "Insurance", dataSource: "GWI Core" },
      { id: "c8", name: "Financial Wellness Score", type: "DONUT", category: "Wellness", dataSource: "GWI Core" },
      { id: "c9", name: "Advisory Preference", type: "PIE", category: "Advisory", dataSource: "GWI Core" },
    ],
    lastModified: "12 hours ago",
    views: 2789,
    createdBy: "David Chen",
    isPublic: false,
    category: "Financial Services",
    tags: ["Finance", "Banking", "Fintech", "Investment"],
  },
  "10": {
    id: "10",
    name: "Health & Wellness Market Monitor",
    description: "Consumer health priorities, wellness product adoption, and fitness behavior trends across demographics",
    charts: [
      { id: "c1", name: "Wellness Priority Rankings", type: "BAR", category: "Priorities", dataSource: "GWI Core" },
      { id: "c2", name: "Fitness App Market Share", type: "DONUT", category: "Fitness", dataSource: "GWI Core" },
      { id: "c3", name: "Supplement Category Growth", type: "AREA", category: "Supplements", dataSource: "GWI Core" },
      { id: "c4", name: "Mental Health Awareness", type: "LINE", category: "Mental Health", dataSource: "GWI Zeitgeist" },
      { id: "c5", name: "Wearable Adoption Rates", type: "BAR", category: "Wearables", dataSource: "GWI Core" },
      { id: "c6", name: "Telehealth Usage Patterns", type: "FUNNEL", category: "Telehealth", dataSource: "GWI Core" },
      { id: "c7", name: "Diet & Nutrition Trends", type: "TREEMAP", category: "Nutrition", dataSource: "GWI Core" },
      { id: "c8", name: "Sleep Optimization Behaviors", type: "RADAR", category: "Sleep", dataSource: "GWI Core" },
      { id: "c9", name: "Preventive Care Spending", type: "LINE", category: "Spending", dataSource: "Internal" },
      { id: "c10", name: "Wellness Spend by Segment", type: "PIE", category: "Spending", dataSource: "GWI Core" },
    ],
    lastModified: "2 hours ago",
    views: 1923,
    createdBy: "Noah Williams",
    isPublic: true,
    category: "Health & Wellness",
    tags: ["Health", "Wellness", "Fitness", "Medical"],
  },
}

// Mock related dashboards
const relatedDashboardsData = [
  { id: "r1", name: "Weekly Campaign Snapshot", views: 1234, charts: 6, category: "Campaign Analytics" },
  { id: "r2", name: "Audience Demographics Deep Dive", views: 892, charts: 8, category: "Audience Intelligence" },
  { id: "r3", name: "Content Performance Tracker", views: 2156, charts: 10, category: "Content Analytics" },
]

// Mock collaborators
const mockCollaborators = [
  { id: "u1", name: "Sarah Chen", email: "sarah.chen@company.com", avatar: "", role: "owner", initials: "SC" },
  { id: "u2", name: "Alex Rivera", email: "alex.rivera@company.com", avatar: "", role: "editor", initials: "AR" },
  { id: "u3", name: "Emily Thompson", email: "emily.t@company.com", avatar: "", role: "viewer", initials: "ET" },
]

// Mock activity data
const mockActivityData = [
  { id: "a1", user: "Sarah Chen", action: "edited", target: "Chart: Multi-Channel Engagement", time: "10 min ago" },
  { id: "a2", user: "Alex Rivera", action: "commented on", target: "ROI Analysis section", time: "25 min ago" },
  { id: "a3", user: "Emily Thompson", action: "viewed", target: "dashboard", time: "1 hour ago" },
  { id: "a4", user: "Marcus Johnson", action: "exported", target: "dashboard as PDF", time: "2 hours ago" },
  { id: "a5", user: "Sarah Chen", action: "added", target: "new chart: Budget Allocation", time: "3 hours ago" },
]

// Mock alerts
const mockAlerts = [
  { id: "al1", name: "High Traffic Alert", condition: "Views > 1000/day", status: "active", triggered: false },
  { id: "al2", name: "Data Staleness Warning", condition: "Data age > 24h", status: "active", triggered: true },
  { id: "al3", name: "Error Rate Spike", condition: "Errors > 5%", status: "inactive", triggered: false },
]

const CHART_TYPE_ICONS: Record<string, React.ReactNode> = {
  BAR: <BarChart3 className="h-4 w-4" />,
  LINE: <LineChart className="h-4 w-4" />,
  PIE: <PieChart className="h-4 w-4" />,
  DONUT: <PieChart className="h-4 w-4" />,
  AREA: <TrendingUp className="h-4 w-4" />,
  SCATTER: <Target className="h-4 w-4" />,
  RADAR: <Target className="h-4 w-4" />,
  FUNNEL: <Filter className="h-4 w-4" />,
  HEATMAP: <Grid3X3 className="h-4 w-4" />,
  TREEMAP: <LayoutGrid className="h-4 w-4" />,
  METRIC: <Activity className="h-4 w-4" />,
}

function formatChartTypeName(type: ChartType): string {
  const typeMap: Record<ChartType, string> = {
    BAR: "Bar",
    LINE: "Line",
    PIE: "Pie",
    DONUT: "Donut",
    AREA: "Area",
    SCATTER: "Scatter",
    HEATMAP: "Heatmap",
    TREEMAP: "Treemap",
    FUNNEL: "Funnel",
    RADAR: "Radar",
    METRIC: "Metric",
  }
  return typeMap[type] || type
}

interface DashboardType {
  id: string
  name: string
  description: string
  charts: { id: string; name: string; type: ChartType; category?: string; dataSource?: string }[]
  lastModified: string
  views: number
  createdBy: string
  isPublic: boolean
  category: string
  tags?: string[]
}

type LayoutView = "grid" | "list" | "compact"
type ExportFormat = "json" | "pdf" | "png" | "csv"

export default function DashboardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isExporting, setIsExporting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [copied, setCopied] = useState(false)
  const [dashboard, setDashboard] = useState<DashboardType | null>(null)

  // Filter state
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedChartTypes, setSelectedChartTypes] = useState<Set<ChartType>>(new Set())
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [selectedDataSources, setSelectedDataSources] = useState<Set<string>>(new Set())
  const [layoutView, setLayoutView] = useState<LayoutView>("grid")

  // New feature states
  const [isFavorite, setIsFavorite] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showAlertDialog, setShowAlertDialog] = useState(false)
  const [showTagsDialog, setShowTagsDialog] = useState(false)
  const [shareEmail, setShareEmail] = useState("")
  const [shareRole, setShareRole] = useState("viewer")
  const [collaborators, setCollaborators] = useState(mockCollaborators)
  const [dashboardTags, setDashboardTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [expandedChart, setExpandedChart] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState("5")
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [alerts, setAlerts] = useState(mockAlerts)
  const [newAlertName, setNewAlertName] = useState("")
  const [newAlertCondition, setNewAlertCondition] = useState("")
  const [activeTab, setActiveTab] = useState("charts")
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    async function fetchDashboard() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/v1/dashboards/${id}`)
        if (response.ok) {
          const data = await response.json()
          const apiDashboard = data.data || data
          if (apiDashboard && apiDashboard.id) {
            const widgetsArray = Array.isArray(apiDashboard.widgets) ? apiDashboard.widgets : []
            // Valid chart types for validation
            const validChartTypes: ChartType[] = ["BAR", "LINE", "PIE", "DONUT", "AREA", "SCATTER", "HEATMAP", "TREEMAP", "FUNNEL", "RADAR", "METRIC"]
            const getValidChartType = (type: string | undefined): ChartType => {
              const upperType = (type || "").toUpperCase()
              return validChartTypes.includes(upperType as ChartType) ? (upperType as ChartType) : "BAR"
            }
            setDashboard({
              id: apiDashboard.id,
              name: apiDashboard.name,
              description: apiDashboard.description || "",
              charts: widgetsArray.map((w: any, i: number) => ({
                id: w.id || `chart-${i}`,
                name: w.title || w.name || `Chart ${i + 1}`,
                type: getValidChartType(w.type),
                category: w.category || "General",
                dataSource: w.dataSource || "Unknown",
              })),
              lastModified: apiDashboard.updatedAt ? formatTimeAgo(apiDashboard.updatedAt) : "Recently",
              views: apiDashboard.views || 0,
              createdBy: apiDashboard.createdByName || "Unknown",
              isPublic: apiDashboard.isPublic || false,
              category: apiDashboard.category || "Dashboard",
              tags: apiDashboard.tags || [],
            })
            setDashboardTags(apiDashboard.tags || [])
          } else {
            // Fall back to demo data
            const demoData = dashboardData[id]
            setDashboard(demoData || null)
            setDashboardTags(demoData?.tags || [])
          }
        } else {
          // Fall back to demo data
          const demoData = dashboardData[id]
          setDashboard(demoData || null)
          setDashboardTags(demoData?.tags || [])
        }
      } catch (error) {
        console.error('Failed to fetch dashboard:', error)
        // Fall back to demo data
        const demoData = dashboardData[id]
        setDashboard(demoData || null)
        setDashboardTags(demoData?.tags || [])
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboard()

    // Load favorite state from localStorage
    const favorites = JSON.parse(localStorage.getItem('dashboard-favorites') || '[]')
    setIsFavorite(favorites.includes(id))
  }, [id])

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && refreshInterval) {
      const intervalMs = parseInt(refreshInterval) * 60 * 1000
      refreshTimerRef.current = setInterval(() => {
        setLastRefresh(new Date())
        // In real app, this would refetch dashboard data
      }, intervalMs)
    }
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
      }
    }
  }, [autoRefresh, refreshInterval])

  // Get unique categories and data sources
  const { categories, dataSources, chartTypes } = useMemo(() => {
    if (!dashboard) return { categories: [], dataSources: [], chartTypes: [] }

    const cats = new Set(dashboard.charts.map(c => c.category).filter(Boolean))
    const sources = new Set(dashboard.charts.map(c => c.dataSource).filter(Boolean))
    const types = new Set(dashboard.charts.map(c => c.type))

    return {
      categories: Array.from(cats) as string[],
      dataSources: Array.from(sources) as string[],
      chartTypes: Array.from(types) as ChartType[],
    }
  }, [dashboard])

  // Filtered charts
  const filteredCharts = useMemo(() => {
    if (!dashboard) return []

    return dashboard.charts.filter(chart => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!chart.name.toLowerCase().includes(query) &&
            !chart.category?.toLowerCase().includes(query)) {
          return false
        }
      }

      // Chart type filter
      if (selectedChartTypes.size > 0 && !selectedChartTypes.has(chart.type)) {
        return false
      }

      // Category filter
      if (selectedCategories.size > 0 && chart.category && !selectedCategories.has(chart.category)) {
        return false
      }

      // Data source filter
      if (selectedDataSources.size > 0 && chart.dataSource && !selectedDataSources.has(chart.dataSource)) {
        return false
      }

      return true
    })
  }, [dashboard, searchQuery, selectedChartTypes, selectedCategories, selectedDataSources])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (searchQuery) count++
    if (selectedChartTypes.size > 0) count++
    if (selectedCategories.size > 0) count++
    if (selectedDataSources.size > 0) count++
    return count
  }, [searchQuery, selectedChartTypes, selectedCategories, selectedDataSources])

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchQuery("")
    setSelectedChartTypes(new Set())
    setSelectedCategories(new Set())
    setSelectedDataSources(new Set())
  }, [])

  function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  // Toggle favorite
  const handleToggleFavorite = useCallback(() => {
    const favorites = JSON.parse(localStorage.getItem('dashboard-favorites') || '[]')
    if (isFavorite) {
      const newFavorites = favorites.filter((fav: string) => fav !== id)
      localStorage.setItem('dashboard-favorites', JSON.stringify(newFavorites))
    } else {
      favorites.push(id)
      localStorage.setItem('dashboard-favorites', JSON.stringify(favorites))
    }
    setIsFavorite(!isFavorite)
  }, [id, isFavorite])

  // Add collaborator
  const handleAddCollaborator = useCallback(() => {
    if (!shareEmail) return
    const newCollaborator = {
      id: `u${Date.now()}`,
      name: shareEmail.split('@')[0],
      email: shareEmail,
      avatar: "",
      role: shareRole,
      initials: shareEmail.substring(0, 2).toUpperCase(),
    }
    setCollaborators([...collaborators, newCollaborator])
    setShareEmail("")
  }, [shareEmail, shareRole, collaborators])

  // Remove collaborator
  const handleRemoveCollaborator = useCallback((collaboratorId: string) => {
    setCollaborators(collaborators.filter(c => c.id !== collaboratorId))
  }, [collaborators])

  // Add tag
  const handleAddTag = useCallback(() => {
    if (!newTag || dashboardTags.includes(newTag)) return
    setDashboardTags([...dashboardTags, newTag])
    setNewTag("")
  }, [newTag, dashboardTags])

  // Remove tag
  const handleRemoveTag = useCallback((tag: string) => {
    setDashboardTags(dashboardTags.filter(t => t !== tag))
  }, [dashboardTags])

  // Add alert
  const handleAddAlert = useCallback(() => {
    if (!newAlertName || !newAlertCondition) return
    const newAlert = {
      id: `al${Date.now()}`,
      name: newAlertName,
      condition: newAlertCondition,
      status: "active" as const,
      triggered: false,
    }
    setAlerts([...alerts, newAlert])
    setNewAlertName("")
    setNewAlertCondition("")
  }, [newAlertName, newAlertCondition, alerts])

  // Toggle alert status
  const handleToggleAlert = useCallback((alertId: string) => {
    setAlerts(alerts.map(a =>
      a.id === alertId ? { ...a, status: a.status === "active" ? "inactive" : "active" } : a
    ))
  }, [alerts])

  // Manual refresh
  const handleManualRefresh = useCallback(() => {
    setLastRefresh(new Date())
    // In real app, this would refetch dashboard data
  }, [])

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/dashboards">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Dashboard Not Found</h1>
            <p className="text-muted-foreground mt-1">The requested dashboard could not be found</p>
          </div>
        </div>
        <Card className="p-12 text-center">
          <LayoutDashboard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Dashboard not found</h2>
          <p className="text-muted-foreground mb-4">
            The dashboard you're looking for doesn't exist or has been deleted.
          </p>
          <Link href="/dashboard/dashboards">
            <Button>Back to Dashboards</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const handleExport = async (format: ExportFormat = "json") => {
    setIsExporting(true)
    try {
      const exportData = {
        dashboard: {
          id: dashboard.id,
          name: dashboard.name,
          description: dashboard.description,
          category: dashboard.category,
          isPublic: dashboard.isPublic,
          createdBy: dashboard.createdBy,
          tags: dashboardTags,
          exportedAt: new Date().toISOString(),
        },
        charts: filteredCharts.map(chart => ({
          id: chart.id,
          name: chart.name,
          type: chart.type,
          category: chart.category,
          dataSource: chart.dataSource,
        })),
        filters: {
          searchQuery,
          selectedChartTypes: Array.from(selectedChartTypes),
          selectedCategories: Array.from(selectedCategories),
          selectedDataSources: Array.from(selectedDataSources),
        },
        metadata: {
          views: dashboard.views,
          lastModified: dashboard.lastModified,
          totalCharts: dashboard.charts.length,
          filteredCharts: filteredCharts.length,
        },
      }

      let content: string
      let mimeType: string
      let extension: string

      switch (format) {
        case "csv":
          // Export charts as CSV
          const csvHeaders = ["ID", "Name", "Type", "Category", "Data Source"]
          const csvRows = filteredCharts.map(chart =>
            [chart.id, chart.name, chart.type, chart.category || "", chart.dataSource || ""].join(",")
          )
          content = [csvHeaders.join(","), ...csvRows].join("\n")
          mimeType = "text/csv"
          extension = "csv"
          break
        case "pdf":
          // For PDF, we'll create an HTML representation (in a real app, use a PDF library)
          content = `
<!DOCTYPE html>
<html>
<head><title>${dashboard.name}</title></head>
<body>
<h1>${dashboard.name}</h1>
<p>${dashboard.description}</p>
<h2>Charts (${filteredCharts.length})</h2>
<ul>
${filteredCharts.map(c => `<li>${c.name} - ${c.type}</li>`).join("\n")}
</ul>
<p>Exported: ${new Date().toISOString()}</p>
</body>
</html>`
          mimeType = "text/html"
          extension = "html"
          break
        case "png":
          // For PNG export, we'd use html2canvas or similar in a real app
          // Here we'll export metadata as JSON for demonstration
          content = JSON.stringify({ ...exportData, note: "PNG export requires canvas rendering" }, null, 2)
          mimeType = "application/json"
          extension = "json"
          break
        default:
          content = JSON.stringify(exportData, null, 2)
          mimeType = "application/json"
          extension = "json"
      }

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dashboard-${dashboard.id}-${new Date().toISOString().split('T')[0]}.${extension}`
      a.click()
      URL.revokeObjectURL(url)
      setShowExportDialog(false)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/v1/dashboards/${id}`, { method: "DELETE" })
      if (response.ok) {
        router.push("/dashboard/dashboards")
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
      const response = await fetch("/api/v1/dashboards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${dashboard.name} (Copy)`,
          description: dashboard.description,
          charts: dashboard.charts.map((c) => c.id),
          isPublic: dashboard.isPublic,
        }),
      })
      if (response.ok) {
        router.push("/dashboard/dashboards")
      }
    } catch (error) {
      console.error("Duplicate failed:", error)
    }
  }

  const getLayoutGridClass = () => {
    switch (layoutView) {
      case "list":
        return "grid gap-4 grid-cols-1"
      case "compact":
        return "grid gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
      default:
        return "grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    }
  }

  return (
    <TooltipProvider>
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/dashboards">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{dashboard.name}</h1>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleToggleFavorite}
                    >
                      {isFavorite ? (
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ) : (
                        <StarOff className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isFavorite ? "Remove from favorites" : "Add to favorites"}
                  </TooltipContent>
                </Tooltip>
                {dashboard.isPublic ? (
                  <Badge variant="secondary" className="gap-1">
                    <Globe className="h-3 w-3" />
                    Public
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <Lock className="h-3 w-3" />
                    Private
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">{dashboard.description}</p>
              {/* Tags */}
              <div className="flex items-center gap-2 mt-2">
                {dashboardTags.map(tag => (
                  <Badge key={tag} variant="outline" className="gap-1 text-xs">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setShowTagsDialog(true)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Tag
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Auto Refresh Control */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={`bg-transparent ${autoRefresh ? 'text-green-600' : ''}`}>
                  {autoRefresh ? (
                    <Play className="h-4 w-4 mr-2" />
                  ) : (
                    <Pause className="h-4 w-4 mr-2" />
                  )}
                  {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Auto-refresh</Label>
                    <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                  </div>
                  <div className="space-y-2">
                    <Label>Refresh interval</Label>
                    <Select value={refreshInterval} onValueChange={setRefreshInterval}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Every 1 minute</SelectItem>
                        <SelectItem value="5">Every 5 minutes</SelectItem>
                        <SelectItem value="15">Every 15 minutes</SelectItem>
                        <SelectItem value="30">Every 30 minutes</SelectItem>
                        <SelectItem value="60">Every hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last refreshed: {lastRefresh.toLocaleTimeString()}
                  </div>
                  <Button size="sm" className="w-full" onClick={handleManualRefresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Now
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Filter Button */}
            <Sheet open={showFilterPanel} onOpenChange={setShowFilterPanel}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="bg-transparent relative">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[450px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="flex items-center justify-between">
                    <span>Filter Charts</span>
                    {activeFilterCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                        <X className="h-4 w-4 mr-1" />
                        Clear All
                      </Button>
                    )}
                  </SheetTitle>
                  <SheetDescription>
                    Filter and search through dashboard charts
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  {/* Search */}
                  <div className="space-y-2">
                    <Label>Search Charts</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                      {searchQuery && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                          onClick={() => setSearchQuery("")}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Chart Types */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Chart Types</Label>
                      {selectedChartTypes.size > 0 && (
                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setSelectedChartTypes(new Set())}>
                          Clear
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {chartTypes.map(type => (
                        <Button
                          key={type}
                          variant={selectedChartTypes.has(type) ? "secondary" : "outline"}
                          size="sm"
                          className="h-8"
                          onClick={() => {
                            const newSet = new Set(selectedChartTypes)
                            if (newSet.has(type)) {
                              newSet.delete(type)
                            } else {
                              newSet.add(type)
                            }
                            setSelectedChartTypes(newSet)
                          }}
                        >
                          {CHART_TYPE_ICONS[type]}
                          <span className="ml-1">{formatChartTypeName(type)}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Categories */}
                  {categories.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Categories</Label>
                        {selectedCategories.size > 0 && (
                          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setSelectedCategories(new Set())}>
                            Clear
                          </Button>
                        )}
                      </div>
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {categories.map(category => (
                            <label
                              key={category}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                            >
                              <Checkbox
                                checked={selectedCategories.has(category)}
                                onCheckedChange={(checked) => {
                                  const newSet = new Set(selectedCategories)
                                  if (checked) {
                                    newSet.add(category)
                                  } else {
                                    newSet.delete(category)
                                  }
                                  setSelectedCategories(newSet)
                                }}
                              />
                              <span>{category}</span>
                              <Badge variant="outline" className="ml-auto text-xs">
                                {dashboard.charts.filter(c => c.category === category).length}
                              </Badge>
                            </label>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}

                  {/* Data Sources */}
                  {dataSources.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Data Sources</Label>
                        {selectedDataSources.size > 0 && (
                          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setSelectedDataSources(new Set())}>
                            Clear
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {dataSources.map(source => (
                          <label
                            key={source}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                          >
                            <Checkbox
                              checked={selectedDataSources.has(source)}
                              onCheckedChange={(checked) => {
                                const newSet = new Set(selectedDataSources)
                                if (checked) {
                                  newSet.add(source)
                                } else {
                                  newSet.delete(source)
                                }
                                setSelectedDataSources(newSet)
                              }}
                            />
                            <span>{source}</span>
                            <Badge variant="outline" className="ml-auto text-xs">
                              {dashboard.charts.filter(c => c.dataSource === source).length}
                            </Badge>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Results summary */}
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Showing {filteredCharts.length} of {dashboard.charts.length} charts
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Button variant="outline" size="sm" className="bg-transparent">
              <Plus className="h-4 w-4 mr-2" />
              Add Chart
            </Button>
            <Button variant="outline" size="sm" className="bg-transparent" onClick={() => setShowShareDialog(true)}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="bg-transparent" onClick={() => setShowExportDialog(true)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Link href={`/dashboard/dashboards/builder?id=${dashboard.id}`}>
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
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyLink}>
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Link2 className="h-4 w-4 mr-2" />}
                  {copied ? "Copied!" : "Copy Link"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowAlertDialog(true)}>
                  <Bell className="h-4 w-4 mr-2" />
                  Manage Alerts
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowTagsDialog(true)}>
                  <Tag className="h-4 w-4 mr-2" />
                  Manage Tags
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

        {/* Meta info and toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Modified {dashboard.lastModified}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{dashboard.views.toLocaleString()} views</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Created by {dashboard.createdBy}</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              <span>{filteredCharts.length} of {dashboard.charts.length} charts</span>
            </div>
            {collaborators.length > 1 && (
              <div className="flex items-center gap-1">
                <div className="flex -space-x-2">
                  {collaborators.slice(0, 3).map((c) => (
                    <Avatar key={c.id} className="h-6 w-6 border-2 border-background">
                      <AvatarImage src={c.avatar} />
                      <AvatarFallback className="text-xs">{c.initials}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                {collaborators.length > 3 && (
                  <span className="text-xs">+{collaborators.length - 3}</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Quick search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search charts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 w-48"
              />
            </div>

            {/* Layout toggle */}
            <div className="flex items-center border rounded-md">
              <Button
                variant={layoutView === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-2 rounded-r-none"
                onClick={() => setLayoutView("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={layoutView === "list" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-2 rounded-none border-x"
                onClick={() => setLayoutView("list")}
              >
                <Rows3 className="h-4 w-4" />
              </Button>
              <Button
                variant={layoutView === "compact" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-2 rounded-l-none"
                onClick={() => setLayoutView("compact")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active filters badges */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: "{searchQuery}"
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
              </Badge>
            )}
            {selectedChartTypes.size > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {selectedChartTypes.size} chart type{selectedChartTypes.size > 1 ? 's' : ''}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedChartTypes(new Set())} />
              </Badge>
            )}
            {selectedCategories.size > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {selectedCategories.size} categor{selectedCategories.size > 1 ? 'ies' : 'y'}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategories(new Set())} />
              </Badge>
            )}
            {selectedDataSources.size > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {selectedDataSources.size} data source{selectedDataSources.size > 1 ? 's' : ''}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedDataSources(new Set())} />
              </Badge>
            )}
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleClearFilters}>
              Clear all
            </Button>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="charts" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Charts ({filteredCharts.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <Activity className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <History className="h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6">
            {/* Charts Grid */}
            {filteredCharts.length > 0 ? (
              <div className={getLayoutGridClass()}>
                {filteredCharts.map((chart) => (
                  <Card
                    key={chart.id}
                    className={`p-4 hover:bg-accent/50 transition-colors cursor-pointer group relative ${
                      layoutView === "list" ? "flex items-center gap-4" : ""
                    } ${expandedChart === chart.id ? "col-span-2 row-span-2" : ""}`}
                  >
                    {/* Chart Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 bg-background/80 backdrop-blur-sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setExpandedChart(expandedChart === chart.id ? null : chart.id)}>
                            {expandedChart === chart.id ? (
                              <>
                                <Minimize2 className="h-4 w-4 mr-2" />
                                Minimize
                              </>
                            ) : (
                              <>
                                <Maximize2 className="h-4 w-4 mr-2" />
                                Expand
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh Data
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Export Chart
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open in Editor
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove from Dashboard
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className={`bg-muted rounded-lg overflow-hidden ${
                      layoutView === "list" ? "w-48 h-24" :
                      layoutView === "compact" ? "aspect-square" :
                      expandedChart === chart.id ? "aspect-video mb-3 h-64" : "aspect-video mb-3"
                    }`}>
                      <ChartRenderer
                        type={chart.type}
                        data={generateSampleData(chart.type, 6)}
                        config={{
                          showLegend: expandedChart === chart.id,
                          showGrid: expandedChart === chart.id,
                          showTooltip: true,
                          height: layoutView === "list" ? 96 : layoutView === "compact" ? 100 : expandedChart === chart.id ? 256 : 120,
                        }}
                      />
                    </div>
                    <div className={layoutView === "list" ? "flex-1" : ""}>
                      <h3 className={`font-medium ${layoutView === "compact" ? "text-xs truncate" : "text-sm"}`}>
                        {chart.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {CHART_TYPE_ICONS[chart.type]}
                          <span className="ml-1">{formatChartTypeName(chart.type)}</span>
                        </Badge>
                        {chart.category && layoutView !== "compact" && (
                          <Badge variant="secondary" className="text-xs">
                            {chart.category}
                          </Badge>
                        )}
                      </div>
                      {chart.dataSource && layoutView === "list" && (
                        <p className="text-xs text-muted-foreground mt-1">Source: {chart.dataSource}</p>
                      )}
                    </div>
                  </Card>
                ))}

                {/* Add Chart Card */}
                <Link href="/dashboard/charts/new">
                  <Card className={`p-4 border-dashed hover:bg-accent/50 transition-colors cursor-pointer h-full ${
                    layoutView === "list" ? "flex items-center justify-center" : ""
                  }`}>
                    <div className={`flex items-center justify-center ${
                      layoutView === "list" ? "" :
                      layoutView === "compact" ? "aspect-square" : "aspect-video rounded-lg mb-3"
                    }`}>
                      <div className="text-center">
                        <Plus className={`text-muted-foreground mx-auto mb-2 ${
                          layoutView === "compact" ? "h-6 w-6" : "h-8 w-8"
                        }`} />
                        <p className={`text-muted-foreground ${layoutView === "compact" ? "text-xs" : "text-sm"}`}>
                          Add Chart
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No charts match your filters</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search query to see more charts.
                </p>
                <Button onClick={handleClearFilters}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </Card>
            )}

            {/* AI Insights Panel */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Dashboard Insights</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium text-sm mb-2">Chart Distribution</h4>
                  <p className="text-sm text-muted-foreground">
                    {chartTypes.length} chart types used across {categories.length} categories.
                    Most common: {chartTypes.length > 0 ? formatChartTypeName(chartTypes[0]) : 'N/A'} charts.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium text-sm mb-2">Data Sources</h4>
                  <p className="text-sm text-muted-foreground">
                    {dataSources.length} data source{dataSources.length !== 1 ? 's' : ''} powering this dashboard.
                    {dataSources.length > 0 && ` Primary: ${dataSources[0]}.`}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium text-sm mb-2">Current View</h4>
                  <p className="text-sm text-muted-foreground">
                    {filteredCharts.length} of {dashboard.charts.length} charts displayed
                    {activeFilterCount > 0 ? ` with ${activeFilterCount} active filter${activeFilterCount !== 1 ? 's' : ''}.` : '.'}
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Views</p>
                    <p className="text-3xl font-bold">{dashboard.views.toLocaleString()}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12% from last week
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Unique Viewers</p>
                    <p className="text-3xl font-bold">{Math.floor(dashboard.views * 0.6).toLocaleString()}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +8% from last week
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Time on Page</p>
                    <p className="text-3xl font-bold">4:32</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <Timer className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="flex items-center mt-2 text-sm text-red-600">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  -5% from last week
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Exports</p>
                    <p className="text-3xl font-bold">156</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                    <Download className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +23% from last week
                </div>
              </Card>
            </div>

            {/* Views over time chart placeholder */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Views Over Time</h3>
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <LineChart className="h-12 w-12 mx-auto mb-2" />
                  <p>View analytics chart coming soon</p>
                </div>
              </div>
            </Card>

            {/* Popular Charts */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Most Viewed Charts</h3>
              <div className="space-y-4">
                {dashboard.charts.slice(0, 5).map((chart, index) => (
                  <div key={chart.id} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{chart.name}</p>
                      <p className="text-xs text-muted-foreground">{chart.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{Math.floor(Math.random() * 500 + 100)} views</p>
                      <p className="text-xs text-muted-foreground">{Math.floor(Math.random() * 50 + 10)} interactions</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {mockActivityData.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{activity.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>{' '}
                        <span className="text-muted-foreground">{activity.action}</span>{' '}
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Comments and Version History */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-6">
                <CommentsPanel
                  resourceType="dashboard"
                  resourceId={id}
                  currentUserId="current-user"
                />
              </Card>
              <Card className="p-6">
                <VersionHistory
                  resourceType="dashboard"
                  resourceId={id}
                  resourceName={dashboard.name}
                  versions={[]}
                  onRestore={(versionId) => {
                    console.log("Restoring version:", versionId)
                  }}
                />
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* General Settings */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  General Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Public Dashboard</Label>
                      <p className="text-xs text-muted-foreground">Allow anyone with the link to view</p>
                    </div>
                    <Switch checked={dashboard.isPublic} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Comments</Label>
                      <p className="text-xs text-muted-foreground">Enable commenting on this dashboard</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show in Search</Label>
                      <p className="text-xs text-muted-foreground">Include in organization search results</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </Card>

              {/* Alerts Management */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Alerts & Notifications
                </h3>
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        {alert.triggered ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <Bell className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{alert.name}</p>
                          <p className="text-xs text-muted-foreground">{alert.condition}</p>
                        </div>
                      </div>
                      <Switch
                        checked={alert.status === "active"}
                        onCheckedChange={() => handleToggleAlert(alert.id)}
                      />
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" onClick={() => setShowAlertDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Alert
                  </Button>
                </div>
              </Card>

              {/* Collaborators */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Collaborators
                </h3>
                <div className="space-y-3">
                  {collaborators.map((collab) => (
                    <div key={collab.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={collab.avatar} />
                          <AvatarFallback>{collab.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{collab.name}</p>
                          <p className="text-xs text-muted-foreground">{collab.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={collab.role === "owner" ? "default" : "secondary"} className="capitalize">
                          {collab.role}
                        </Badge>
                        {collab.role !== "owner" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleRemoveCollaborator(collab.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" onClick={() => setShowShareDialog(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Collaborator
                  </Button>
                </div>
              </Card>

              {/* Related Dashboards */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5" />
                  Related Dashboards
                </h3>
                <div className="space-y-3">
                  {relatedDashboardsData.map((related) => (
                    <Link key={related.id} href={`/dashboard/dashboards/${related.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                        <div>
                          <p className="font-medium text-sm">{related.name}</p>
                          <p className="text-xs text-muted-foreground">{related.category}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{related.charts} charts</span>
                          <span>{related.views} views</span>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Share Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Share Dashboard</DialogTitle>
              <DialogDescription>
                Invite people to view or collaborate on this dashboard
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email address"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="flex-1"
                />
                <Select value={shareRole} onValueChange={setShareRole}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddCollaborator}>
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>People with access</Label>
                {collaborators.map((collab) => (
                  <div key={collab.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={collab.avatar} />
                        <AvatarFallback>{collab.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{collab.name}</p>
                        <p className="text-xs text-muted-foreground">{collab.email}</p>
                      </div>
                    </div>
                    <Badge variant={collab.role === "owner" ? "default" : "secondary"} className="capitalize">
                      {collab.role}
                    </Badge>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Link sharing</Label>
                <div className="flex gap-2">
                  <Input value={typeof window !== 'undefined' ? window.location.href : ''} readOnly className="flex-1" />
                  <Button variant="outline" onClick={handleCopyLink}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Public access</p>
                    <p className="text-xs text-muted-foreground">Anyone with the link can view</p>
                  </div>
                  <Switch checked={dashboard.isPublic} />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Dashboard</DialogTitle>
              <DialogDescription>
                Choose an export format for your dashboard
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Button
                variant="outline"
                className="justify-start h-auto py-4"
                onClick={() => handleExport("json")}
                disabled={isExporting}
              >
                <FileJson className="h-8 w-8 mr-4 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium">JSON</p>
                  <p className="text-xs text-muted-foreground">Full data export with all metadata</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-4"
                onClick={() => handleExport("csv")}
                disabled={isExporting}
              >
                <Table className="h-8 w-8 mr-4 text-green-500" />
                <div className="text-left">
                  <p className="font-medium">CSV</p>
                  <p className="text-xs text-muted-foreground">Chart data in spreadsheet format</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-4"
                onClick={() => handleExport("pdf")}
                disabled={isExporting}
              >
                <FileText className="h-8 w-8 mr-4 text-red-500" />
                <div className="text-left">
                  <p className="font-medium">PDF / HTML</p>
                  <p className="text-xs text-muted-foreground">Printable report format</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-4"
                onClick={() => handleExport("png")}
                disabled={isExporting}
              >
                <FileImage className="h-8 w-8 mr-4 text-purple-500" />
                <div className="text-left">
                  <p className="font-medium">PNG Image</p>
                  <p className="text-xs text-muted-foreground">Screenshot of the dashboard</p>
                </div>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tags Dialog */}
        <Dialog open={showTagsDialog} onOpenChange={setShowTagsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Tags</DialogTitle>
              <DialogDescription>
                Add tags to organize and find your dashboard easily
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a new tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button onClick={handleAddTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {dashboardTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 hover:bg-destructive/20"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                {dashboardTags.length === 0 && (
                  <p className="text-sm text-muted-foreground">No tags added yet</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTagsDialog(false)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Alerts Dialog */}
        <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Alerts</DialogTitle>
              <DialogDescription>
                Set up notifications for dashboard metrics
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <Label>Create New Alert</Label>
                <Input
                  placeholder="Alert name..."
                  value={newAlertName}
                  onChange={(e) => setNewAlertName(e.target.value)}
                />
                <Input
                  placeholder="Condition (e.g., Views > 1000/day)"
                  value={newAlertCondition}
                  onChange={(e) => setNewAlertCondition(e.target.value)}
                />
                <Button onClick={handleAddAlert} disabled={!newAlertName || !newAlertCondition}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Alert
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Active Alerts</Label>
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      {alert.triggered ? (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      ) : alert.status === "active" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{alert.name}</p>
                        <p className="text-xs text-muted-foreground">{alert.condition}</p>
                      </div>
                    </div>
                    <Switch
                      checked={alert.status === "active"}
                      onCheckedChange={() => handleToggleAlert(alert.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAlertDialog(false)}>
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Dashboard</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{dashboard.name}"? This action cannot be undone.
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
    </TooltipProvider>
  )
}
