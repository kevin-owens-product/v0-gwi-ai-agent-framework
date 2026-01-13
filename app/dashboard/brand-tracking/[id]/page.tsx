"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Users,
  BarChart3,
  Loader2,
  RefreshCw,
  Edit,
  Trash2,
  Share2,
  Download,
  MoreHorizontal,
  Copy,
  Check,
  Star,
  StarOff,
  Play,
  Pause,
  MessageSquare,
  History,
  Clock,
  Eye,
  FileJson,
  FileText,
  Table,
  FileImage,
  Mail,
  UserPlus,
  Link2,
  ChevronDown,
  Sparkles,
} from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from "date-fns"
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
  Tooltip as TooltipUI,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CommentsPanel } from "@/components/shared/comments-panel"
import { VersionHistory } from "@/components/shared/version-history"

interface BrandTracking {
  id: string
  brandName: string
  description: string | null
  industry: string | null
  status: string
  competitors: string[]
  audiences: string[]
  snapshotCount: number
  lastSnapshot: string | null
  createdAt: string
  snapshots?: Array<{
    id: string
    snapshotDate: string
    brandHealth: number | null
    awareness: number | null
    consideration: number | null
    preference: number | null
    loyalty: number | null
    nps: number | null
    sentimentScore: number | null
    marketShare: number | null
  }>
}

const statusColors = {
  ACTIVE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  PAUSED: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  DRAFT: "bg-muted text-muted-foreground border-muted",
  ARCHIVED: "bg-slate-500/10 text-slate-500 border-slate-500/20",
}

// Mock activity data
interface ActivityItem {
  id: string
  action: string
  user: string
  timestamp: string
  details?: string
}

const mockActivityData: ActivityItem[] = [
  { id: "1", action: "viewed", user: "John Smith", timestamp: "10 minutes ago" },
  { id: "2", action: "took snapshot", user: "Sarah Chen", timestamp: "2 hours ago" },
  { id: "3", action: "edited", user: "Marcus Johnson", timestamp: "1 day ago", details: "Updated competitors" },
  { id: "4", action: "shared", user: "Emily Thompson", timestamp: "2 days ago", details: "Via email to brand team" },
  { id: "5", action: "exported", user: "Sarah Chen", timestamp: "3 days ago", details: "PDF format" },
  { id: "6", action: "commented", user: "Alex Rivera", timestamp: "4 days ago", details: "Added note on awareness trend" },
  { id: "7", action: "created", user: "Sarah Chen", timestamp: "1 week ago" },
]

// Generate demo snapshots for visualization when no real data exists
function generateDemoSnapshots(_brandName: string) {
  const snapshots = []
  const now = new Date()

  for (let i = 0; i < 10; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - i * 7) // Weekly snapshots

    // Create trending data with slight variations
    const baseAwareness = 65 + Math.sin(i * 0.5) * 10 + (10 - i) * 1.5
    const baseHealth = 72 + Math.cos(i * 0.3) * 8 + (10 - i) * 1.2

    snapshots.push({
      id: `demo-${i}`,
      snapshotDate: date.toISOString(),
      brandHealth: Math.min(95, Math.max(50, baseHealth)),
      awareness: Math.min(95, Math.max(40, baseAwareness)),
      consideration: Math.min(90, Math.max(30, baseAwareness * 0.65)),
      preference: Math.min(85, Math.max(20, baseAwareness * 0.45)),
      loyalty: Math.min(80, Math.max(15, baseAwareness * 0.35)),
      nps: Math.round(15 + Math.random() * 40),
      sentimentScore: 0.5 + Math.random() * 0.4,
      marketShare: 18 + Math.random() * 15,
    })
  }

  return snapshots
}

export default function BrandTrackingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [brandTracking, setBrandTracking] = useState<BrandTracking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [shareEmail, setShareEmail] = useState("")
  const [shareRole, setShareRole] = useState("viewer")
  const [activeTab, setActiveTab] = useState("funnel")

  useEffect(() => {
    fetchBrandTracking()
  }, [id])

  async function fetchBrandTracking() {
    try {
      const response = await fetch(`/api/v1/brand-tracking/${id}`)
      if (response.ok) {
        const data = await response.json()
        // If no snapshots exist, generate demo data for visualization
        if (!data.snapshots || data.snapshots.length === 0) {
          data.snapshots = generateDemoSnapshots(data.brandName)
          data._isUsingDemoData = true
        }
        setBrandTracking(data)
      } else {
        // For demo IDs or when API fails, create demo brand tracking
        const demoBrands: Record<string, BrandTracking> = {
          '1': {
            id: '1',
            brandName: 'Nike',
            description: 'Track Nike\'s brand health and competitive position in athletic wear market',
            industry: 'Sportswear',
            status: 'ACTIVE',
            competitors: ['Adidas', 'Under Armour', 'Puma', 'Reebok'],
            audiences: ['18-24', '25-34', 'Athletes'],
            snapshotCount: 47,
            lastSnapshot: new Date().toISOString(),
            createdAt: '2024-11-01',
            snapshots: generateDemoSnapshots('Nike'),
          },
          '2': {
            id: '2',
            brandName: 'Coca-Cola',
            description: 'Monitor brand perception and market share in beverage industry',
            industry: 'Beverages',
            status: 'ACTIVE',
            competitors: ['Pepsi', 'Dr Pepper', 'Sprite'],
            audiences: ['All Ages', 'Health Conscious'],
            snapshotCount: 124,
            lastSnapshot: new Date().toISOString(),
            createdAt: '2024-10-15',
            snapshots: generateDemoSnapshots('Coca-Cola'),
          },
          '3': {
            id: '3',
            brandName: 'Tesla',
            description: 'Track electric vehicle brand performance and innovation perception',
            industry: 'Automotive',
            status: 'ACTIVE',
            competitors: ['Ford', 'GM', 'Rivian', 'Lucid'],
            audiences: ['Tech Early Adopters', 'Eco-Conscious', '35-54'],
            snapshotCount: 89,
            lastSnapshot: new Date().toISOString(),
            createdAt: '2024-09-20',
            snapshots: generateDemoSnapshots('Tesla'),
          },
        }
        const demoData = demoBrands[id]
        if (demoData) {
          setBrandTracking(demoData)
        }
      }
    } catch (error) {
      console.error('Failed to fetch brand tracking:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleTakeSnapshot() {
    setIsRefreshing(true)
    try {
      const response = await fetch(`/api/v1/brand-tracking/${id}/snapshot`, {
        method: 'POST',
      })
      if (response.ok) {
        await fetchBrandTracking()
      }
    } catch (error) {
      console.error('Failed to take snapshot:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleExport = async (format: "json" | "csv" | "pdf" = "json") => {
    if (!brandTracking) return
    setIsExporting(true)
    try {
      const exportData = {
        brand: {
          id: brandTracking.id,
          name: brandTracking.brandName,
          description: brandTracking.description,
          industry: brandTracking.industry,
          status: brandTracking.status,
          competitors: brandTracking.competitors,
          audiences: brandTracking.audiences,
        },
        snapshots: brandTracking.snapshots,
        metadata: {
          exportedAt: new Date().toISOString(),
          snapshotCount: brandTracking.snapshotCount,
        },
      }
      const dateStr = new Date().toISOString().split("T")[0]
      if (format === "csv") {
        const csvContent = [
          `"Brand: ${brandTracking.brandName}"`,
          `"Industry: ${brandTracking.industry || 'N/A'}"`,
          `"Status: ${brandTracking.status}"`,
          "",
          "Date,Brand Health,Awareness,Consideration,Preference,Loyalty,NPS,Market Share",
          ...(brandTracking.snapshots || []).map(s =>
            `"${s.snapshotDate}",${s.brandHealth || ''},${s.awareness || ''},${s.consideration || ''},${s.preference || ''},${s.loyalty || ''},${s.nps || ''},${s.marketShare || ''}`
          ),
        ].join("\n")
        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `brand-tracking-${brandTracking.id}-${dateStr}.csv`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        const content = JSON.stringify(exportData, null, 2)
        const blob = new Blob([content], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `brand-tracking-${brandTracking.id}-${dateStr}.${format}`
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
      const response = await fetch(`/api/v1/brand-tracking/${id}`, { method: "DELETE" })
      if (response.ok) {
        router.push("/dashboard/brand-tracking")
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
    if (!brandTracking) return
    try {
      const response = await fetch("/api/v1/brand-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: `${brandTracking.brandName} (Copy)`,
          description: brandTracking.description,
          industry: brandTracking.industry,
          competitors: brandTracking.competitors,
          audiences: brandTracking.audiences,
        }),
      })
      if (response.ok) {
        router.push("/dashboard/brand-tracking")
      }
    } catch (error) {
      console.error("Duplicate failed:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!brandTracking) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold">Brand tracking not found</h3>
        <Button className="mt-4" asChild>
          <Link href="/dashboard/brand-tracking">Back to Brand Tracking</Link>
        </Button>
      </div>
    )
  }

  const latestSnapshot = brandTracking.snapshots?.[0]
  const previousSnapshot = brandTracking.snapshots?.[1]

  // Prepare chart data
  const chartData = brandTracking.snapshots?.slice(0, 10).reverse().map((snapshot) => ({
    date: format(new Date(snapshot.snapshotDate), 'MMM dd'),
    awareness: snapshot.awareness?.toFixed(1),
    consideration: snapshot.consideration?.toFixed(1),
    preference: snapshot.preference?.toFixed(1),
    loyalty: snapshot.loyalty?.toFixed(1),
  })) || []

  const healthChartData = brandTracking.snapshots?.slice(0, 10).reverse().map((snapshot) => ({
    date: format(new Date(snapshot.snapshotDate), 'MMM dd'),
    health: snapshot.brandHealth?.toFixed(1),
    nps: snapshot.nps?.toFixed(1),
  })) || []

  const calculateTrend = (current: number | null | undefined, previous: number | null | undefined) => {
    if (!current || !previous) return null
    return current - previous
  }

  const awarenessTrend = calculateTrend(latestSnapshot?.awareness, previousSnapshot?.awareness)
  const healthTrend = calculateTrend(latestSnapshot?.brandHealth, previousSnapshot?.brandHealth)

  return (
    <TooltipProvider>
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/brand-tracking">
            <Button variant="ghost" size="icon" className="mt-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Target className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold">{brandTracking.brandName}</h1>
              <Badge variant="outline" className={statusColors[brandTracking.status as keyof typeof statusColors]}>
                {brandTracking.status}
              </Badge>
              <TooltipUI>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsFavorite(!isFavorite)}>
                    {isFavorite ? <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /> : <StarOff className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isFavorite ? "Remove from favorites" : "Add to favorites"}</TooltipContent>
              </TooltipUI>
            </div>
            {brandTracking.industry && (
              <p className="text-sm text-muted-foreground">{brandTracking.industry}</p>
            )}
            {brandTracking.description && (
              <p className="text-sm text-muted-foreground max-w-2xl">{brandTracking.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> {brandTracking.snapshotCount} snapshots</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Last snapshot: {brandTracking.lastSnapshot ? format(new Date(brandTracking.lastSnapshot), 'MMM dd, yyyy') : 'Never'}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <TooltipUI>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => setAutoRefresh(!autoRefresh)}>
                {autoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{autoRefresh ? "Pause auto-refresh" : "Enable auto-refresh"}</TooltipContent>
          </TooltipUI>

          <Button variant="outline" size="sm" onClick={handleTakeSnapshot} disabled={isRefreshing}>
            {isRefreshing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Snapshot
          </Button>

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
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href={`/dashboard/brand-tracking/new?edit=${brandTracking.id}`}>
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

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Brand Health</p>
                <p className="text-2xl font-bold">{latestSnapshot?.brandHealth?.toFixed(1) || 'N/A'}</p>
                {typeof healthTrend === 'number' && (
                  <p className={`text-xs mt-1 flex items-center gap-1 ${healthTrend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {healthTrend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {healthTrend >= 0 ? '+' : ''}{healthTrend.toFixed(1)}
                  </p>
                )}
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Awareness</p>
                <p className="text-2xl font-bold">{latestSnapshot?.awareness?.toFixed(1) || 'N/A'}%</p>
                {typeof awarenessTrend === 'number' && (
                  <p className={`text-xs mt-1 flex items-center gap-1 ${awarenessTrend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {awarenessTrend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {awarenessTrend >= 0 ? '+' : ''}{awarenessTrend.toFixed(1)}%
                  </p>
                )}
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">NPS Score</p>
                <p className="text-2xl font-bold">{latestSnapshot?.nps?.toFixed(0) || 'N/A'}</p>
                <p className="text-xs text-muted-foreground mt-1">Net Promoter Score</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Market Share</p>
                <p className="text-2xl font-bold">{latestSnapshot?.marketShare?.toFixed(1) || 'N/A'}%</p>
                <p className="text-xs text-muted-foreground mt-1">Total snapshots: {brandTracking.snapshotCount}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="funnel" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Brand Funnel
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Activity className="h-4 w-4" /> Health & NPS
          </TabsTrigger>
          <TabsTrigger value="competitors" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Competitors
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Insights
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Comments
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Eye className="h-4 w-4" /> Activity
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" /> History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="funnel">
          <Card>
            <CardHeader>
              <CardTitle>Brand Awareness Funnel Over Time</CardTitle>
              <CardDescription>
                Track how consumers move through awareness, consideration, preference, and loyalty
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="awareness" stroke="#8b5cf6" strokeWidth={2} name="Awareness" />
                    <Line type="monotone" dataKey="consideration" stroke="#3b82f6" strokeWidth={2} name="Consideration" />
                    <Line type="monotone" dataKey="preference" stroke="#10b981" strokeWidth={2} name="Preference" />
                    <Line type="monotone" dataKey="loyalty" stroke="#f59e0b" strokeWidth={2} name="Loyalty" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  No data available. Take your first snapshot to see metrics.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle>Brand Health & Net Promoter Score</CardTitle>
              <CardDescription>
                Overall brand health score and customer satisfaction metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {healthChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={healthChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="health" fill="#8b5cf6" name="Brand Health" />
                    <Bar dataKey="nps" fill="#10b981" name="NPS Score" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  No data available. Take your first snapshot to see metrics.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitors">
          <Card>
            <CardHeader>
              <CardTitle>Competitive Landscape</CardTitle>
              <CardDescription>
                Compare your brand against {brandTracking.competitors.length} competitors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {brandTracking.competitors.map((competitor: string) => (
                  <div key={competitor} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{competitor}</span>
                    <Badge variant="outline">Tracked</Badge>
                  </div>
                ))}
                {brandTracking.competitors.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No competitors added yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Insights</CardTitle>
              <CardDescription>
                Key findings and recommendations based on your brand tracking data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {latestSnapshot ? (
                  <>
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <p className="text-sm">
                        Brand awareness has shown a positive trend, indicating effective marketing initiatives.
                      </p>
                    </div>
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-sm">
                        Younger demographics (18-34) show higher engagement rates compared to other age groups.
                      </p>
                    </div>
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <p className="text-sm">
                        Consider increasing focus on loyalty programs to improve retention metrics.
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Take a snapshot to generate AI insights
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="space-y-4">
          <Card className="p-6">
            <CommentsPanel
              resourceType="brand-tracking"
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
              <CardDescription>Recent activity on this brand tracker</CardDescription>
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
                        item.action === "took snapshot" ? "bg-purple-500/10 text-purple-500" :
                        "bg-pink-500/10 text-pink-500"
                      }`}>
                        {item.action === "viewed" && <Eye className="h-4 w-4" />}
                        {item.action === "exported" && <Download className="h-4 w-4" />}
                        {item.action === "shared" && <Share2 className="h-4 w-4" />}
                        {item.action === "edited" && <Edit className="h-4 w-4" />}
                        {item.action === "created" && <Sparkles className="h-4 w-4" />}
                        {item.action === "took snapshot" && <RefreshCw className="h-4 w-4" />}
                        {item.action === "commented" && <MessageSquare className="h-4 w-4" />}
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
              resourceType="brand-tracking"
              resourceId={id}
              resourceName={brandTracking.brandName}
              versions={[]}
              onRestore={(versionId) => {
                console.log("Restoring version:", versionId)
              }}
            />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Brand Tracker</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{brandTracking.brandName}"? This action cannot be undone and all snapshots will be lost.
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

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Brand Tracker</DialogTitle>
            <DialogDescription>
              Share this brand tracker with team members or external collaborators.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="shareEmail">Email address</Label>
                <Input
                  id="shareEmail"
                  placeholder="email@example.com"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={shareRole} onValueChange={setShareRole}>
                  <SelectTrigger className="mt-2 w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <Label className="text-xs text-muted-foreground">Share link</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input value={typeof window !== 'undefined' ? window.location.href : ''} readOnly className="text-xs" />
                <Button size="sm" variant="outline" onClick={handleCopyLink}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>Cancel</Button>
            <Button onClick={() => { setShowShareDialog(false); setShareEmail(""); }}>
              <UserPlus className="h-4 w-4 mr-2" /> Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Report Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Report</DialogTitle>
            <DialogDescription>Set up automatic email delivery of this brand tracking report.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Recipients</Label>
              <Input placeholder="email@example.com, team@example.com" className="mt-2" />
            </div>
            <div>
              <Label>Frequency</Label>
              <Select defaultValue="weekly">
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Format</Label>
              <Select defaultValue="pdf">
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
            <Button><Mail className="h-4 w-4 mr-2" /> Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  )
}
