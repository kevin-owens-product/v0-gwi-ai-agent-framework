"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Edit,
  Download,
  Share2,
  MoreHorizontal,
  Target,
  Loader2,
  Copy,
  Check,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  BarChart3,
  Calendar,
  Users,
  Bell,
} from "lucide-react"
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
import { ChartRenderer, generateSampleData } from "@/components/charts"
import type { ChartType } from "@/components/charts"

interface BrandTrackingData {
  id: string
  brandName: string
  description?: string
  industry?: string
  status: string
  competitors: string[]
  audiences: string[]
  schedule?: string
  metrics: {
    awareness?: number
    consideration?: number
    preference?: number
    loyalty?: number
    nps?: number
    sentiment?: number
    marketShare?: number
  }
  lastSnapshot?: string
  nextSnapshot?: string
  snapshotCount?: number
}

export default function BrandTrackingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { status: sessionStatus } = useSession()
  const [brandTracking, setBrandTracking] = useState<BrandTrackingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "trends" | "competitors" | "insights">("overview")

  useEffect(() => {
    async function fetchBrandTracking() {
      if (sessionStatus === "loading") return
      if (sessionStatus === "unauthenticated") {
        router.push("/login")
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/v1/brand-tracking/${id}`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          if (response.status === 404) {
            setBrandTracking(null)
            return
          }
          throw new Error("Failed to fetch brand tracking")
        }

        const result = await response.json()
        const data = result.data || result
        setBrandTracking(data)
      } catch (error) {
        console.error("Error fetching brand tracking:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBrandTracking()
  }, [id, sessionStatus, router])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/v1/brand-tracking/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
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

  if (isLoading || sessionStatus === "loading") {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!brandTracking) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/brand-tracking">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Brand Tracking Not Found</h1>
            <p className="text-muted-foreground mt-1">The brand tracking you're looking for doesn't exist</p>
          </div>
        </div>
        <Card className="p-12 text-center">
          <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Brand Tracking Not Found</h2>
          <p className="text-muted-foreground mb-4">
            This brand tracking may have been deleted or you don't have permission to view it.
          </p>
          <Link href="/dashboard/brand-tracking">
            <Button>Back to Brand Tracking</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const metrics = brandTracking.metrics || {}
  const metricCards = [
    { key: "awareness", label: "Awareness", value: metrics.awareness || 0, trend: "+2.5%" },
    { key: "consideration", label: "Consideration", value: metrics.consideration || 0, trend: "+1.2%" },
    { key: "preference", label: "Preference", value: metrics.preference || 0, trend: "-0.5%" },
    { key: "loyalty", label: "Loyalty", value: metrics.loyalty || 0, trend: "+3.1%" },
    { key: "nps", label: "NPS", value: metrics.nps || 0, trend: "+5" },
    { key: "sentiment", label: "Sentiment", value: metrics.sentiment || 0, trend: "+0.8%" },
  ]

  return (
    <div className="flex-1 space-y-6 p-6">
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
              <h1 className="text-2xl font-bold">{brandTracking.brandName}</h1>
              <Badge variant={brandTracking.status === "ACTIVE" ? "default" : "secondary"}>
                {brandTracking.status}
              </Badge>
            </div>
            {brandTracking.description && (
              <p className="text-sm text-muted-foreground max-w-2xl">{brandTracking.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
              {brandTracking.industry && (
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" /> {brandTracking.industry}
                </span>
              )}
              {brandTracking.lastSnapshot && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Last snapshot: {new Date(brandTracking.lastSnapshot).toLocaleDateString()}
                </span>
              )}
              {brandTracking.snapshotCount !== undefined && (
                <span className="flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" /> {brandTracking.snapshotCount} snapshots
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/brand-tracking/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? "Copied!" : "Copy Link"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="overview">
            <Target className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="trends">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="competitors">
            <Users className="h-4 w-4 mr-2" />
            Competitors
          </TabsTrigger>
          <TabsTrigger value="insights">
            <BarChart3 className="h-4 w-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Metric Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {metricCards.map((metric) => (
              <Card key={metric.key}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <Badge
                      variant={metric.trend.startsWith("+") ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {metric.trend.startsWith("+") ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {metric.trend}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Competitors */}
          {brandTracking.competitors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Competitors</CardTitle>
                <CardDescription>Tracked competitor brands</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {brandTracking.competitors.map((competitor) => (
                    <Badge key={competitor} variant="outline">
                      {competitor}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Brand Health Trends</CardTitle>
              <CardDescription>Track changes in brand metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartRenderer
                  type="LINE"
                  data={generateSampleData("LINE", 12)}
                  config={{
                    showLegend: true,
                    showGrid: true,
                    showTooltip: true,
                    height: 400,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Competitive Positioning</CardTitle>
              <CardDescription>Compare brand performance against competitors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ChartRenderer
                  type="BAR"
                  data={generateSampleData("BAR", 5)}
                  config={{
                    showLegend: true,
                    showGrid: true,
                    showTooltip: true,
                    height: 400,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Insights</CardTitle>
              <CardDescription>Automated insights about brand performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Strong Growth in Awareness</h4>
                      <p className="text-sm text-muted-foreground">
                        Brand awareness has increased by 2.5% over the last quarter, indicating successful marketing campaigns.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Preference Declining</h4>
                      <p className="text-sm text-muted-foreground">
                        Brand preference has decreased slightly. Consider reviewing product positioning and messaging.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Brand Tracking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{brandTracking.brandName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
