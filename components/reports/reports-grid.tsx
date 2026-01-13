"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCurrentOrganization } from "@/components/providers/organization-provider"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  FileText,
  Presentation,
  BarChart3,
  Download,
  ImageIcon,
  MoreVertical,
  Share2,
  Copy,
  Trash2,
  Eye,
  Edit,
  Check,
  Loader2,
} from "lucide-react"

interface Report {
  id: string
  title: string
  type: string
  status: string
  thumbnail: string
  createdAt: string
  updatedAt: string
  views: number
  agent: string
  author: { name: string; avatar: string }
}

// Demo reports shown when API returns empty - organized by solution area
const demoReports: Report[] = [
  // ============================================================================
  // CORE SOLUTION AREA REPORTS
  // ============================================================================
  {
    id: "core-1",
    title: "Global Audience Segmentation Analysis 2024",
    type: "presentation",
    status: "published",
    thumbnail: "/presentation-slides.png",
    createdAt: "2024-12-10",
    updatedAt: "2024-12-12",
    views: 892,
    agent: "Audience Explorer Agent",
    author: { name: "Sarah Chen", avatar: "/diverse-woman-avatar.png" },
  },
  {
    id: "core-2",
    title: "Millennial vs Gen Z Behavioral Comparison",
    type: "dashboard",
    status: "published",
    thumbnail: "/analytics-dashboard.png",
    createdAt: "2024-12-05",
    updatedAt: "2024-12-08",
    views: 1247,
    agent: "Persona Architect Agent",
    author: { name: "Michael Park", avatar: "/man-avatar.png" },
  },
  {
    id: "core-3",
    title: "Cultural Shifts in Consumer Values Q4 2024",
    type: "pdf",
    status: "published",
    thumbnail: "/pdf-report-document.jpg",
    createdAt: "2024-11-28",
    updatedAt: "2024-12-01",
    views: 654,
    agent: "Culture Tracker Agent",
    author: { name: "Emily Johnson", avatar: "/professional-woman.png" },
  },

  // ============================================================================
  // SALES SOLUTION AREA REPORTS
  // ============================================================================
  {
    id: "sales-1",
    title: "Enterprise Buyer Persona Deep Dive",
    type: "presentation",
    status: "published",
    thumbnail: "/presentation-slides.png",
    createdAt: "2024-12-08",
    updatedAt: "2024-12-10",
    views: 423,
    agent: "Buyer Persona Agent",
    author: { name: "James Wilson", avatar: "/man-avatar.png" },
  },
  {
    id: "sales-2",
    title: "Competitive Battlecard: Tech Industry Q4",
    type: "pdf",
    status: "published",
    thumbnail: "/pdf-report-document.jpg",
    createdAt: "2024-12-03",
    updatedAt: "2024-12-06",
    views: 312,
    agent: "Competitive Intelligence Agent",
    author: { name: "Lisa Martinez", avatar: "/diverse-woman-avatar.png" },
  },
  {
    id: "sales-3",
    title: "Account Prioritization Model Dashboard",
    type: "dashboard",
    status: "draft",
    thumbnail: "/analytics-dashboard.png",
    createdAt: "2024-12-11",
    updatedAt: "2024-12-12",
    views: 0,
    agent: "Account Scoring Agent",
    author: { name: "David Kim", avatar: "/man-avatar.png" },
  },

  // ============================================================================
  // INSIGHTS SOLUTION AREA REPORTS
  // ============================================================================
  {
    id: "insights-1",
    title: "Consumer Motivation Analysis: Sustainability",
    type: "presentation",
    status: "published",
    thumbnail: "/presentation-slides.png",
    createdAt: "2024-11-25",
    updatedAt: "2024-11-28",
    views: 789,
    agent: "Motivation Decoder Agent",
    author: { name: "Rachel Green", avatar: "/professional-woman.png" },
  },
  {
    id: "insights-2",
    title: "Cross-Market Insights: US vs UK vs Germany",
    type: "dashboard",
    status: "published",
    thumbnail: "/analytics-dashboard.png",
    createdAt: "2024-11-20",
    updatedAt: "2024-11-25",
    views: 1056,
    agent: "Global Perspective Agent",
    author: { name: "Thomas Anderson", avatar: "/man-avatar.png" },
  },

  // ============================================================================
  // AD SALES SOLUTION AREA REPORTS
  // ============================================================================
  {
    id: "adsales-1",
    title: "Premium Audience Package: Tech Enthusiasts",
    type: "presentation",
    status: "published",
    thumbnail: "/presentation-slides.png",
    createdAt: "2024-12-02",
    updatedAt: "2024-12-05",
    views: 534,
    agent: "Audience Packager Agent",
    author: { name: "Amanda Foster", avatar: "/diverse-woman-avatar.png" },
  },
  {
    id: "adsales-2",
    title: "Q1 2025 Media Planning Recommendations",
    type: "pdf",
    status: "draft",
    thumbnail: "/pdf-report-document.jpg",
    createdAt: "2024-12-09",
    updatedAt: "2024-12-11",
    views: 0,
    agent: "Media Planner Agent",
    author: { name: "Kevin O'Brien", avatar: "/man-avatar.png" },
  },
  {
    id: "adsales-3",
    title: "Automotive Advertiser Pitch Deck",
    type: "presentation",
    status: "published",
    thumbnail: "/presentation-slides.png",
    createdAt: "2024-11-18",
    updatedAt: "2024-11-22",
    views: 267,
    agent: "Pitch Generator Agent",
    author: { name: "Sophia Lee", avatar: "/professional-woman.png" },
  },

  // ============================================================================
  // MARKETING SOLUTION AREA REPORTS
  // ============================================================================
  {
    id: "marketing-1",
    title: "Holiday Campaign Performance Forecast",
    type: "dashboard",
    status: "published",
    thumbnail: "/analytics-dashboard.png",
    createdAt: "2024-11-15",
    updatedAt: "2024-11-20",
    views: 1423,
    agent: "Performance Predictor Agent",
    author: { name: "Jennifer Walsh", avatar: "/diverse-woman-avatar.png" },
  },
  {
    id: "marketing-2",
    title: "Social Media Trend Analysis: TikTok vs Instagram",
    type: "infographic",
    status: "published",
    thumbnail: "/analytics-dashboard.png",
    createdAt: "2024-11-22",
    updatedAt: "2024-11-25",
    views: 2156,
    agent: "Trend Forecaster Agent",
    author: { name: "Alex Rivera", avatar: "/man-avatar.png" },
  },
  {
    id: "marketing-3",
    title: "Content Strategy Framework: Gen Z Engagement",
    type: "pdf",
    status: "draft",
    thumbnail: "/pdf-report-document.jpg",
    createdAt: "2024-12-07",
    updatedAt: "2024-12-10",
    views: 0,
    agent: "Content Creator Agent",
    author: { name: "Michelle Taylor", avatar: "/professional-woman.png" },
  },

  // ============================================================================
  // PRODUCT DEVELOPMENT SOLUTION AREA REPORTS
  // ============================================================================
  {
    id: "product-1",
    title: "New Product Opportunity Landscape 2025",
    type: "presentation",
    status: "published",
    thumbnail: "/presentation-slides.png",
    createdAt: "2024-11-10",
    updatedAt: "2024-11-15",
    views: 876,
    agent: "Opportunity Scout Agent",
    author: { name: "Daniel Brooks", avatar: "/man-avatar.png" },
  },
  {
    id: "product-2",
    title: "Feature Prioritization Matrix: Mobile App",
    type: "dashboard",
    status: "published",
    thumbnail: "/analytics-dashboard.png",
    createdAt: "2024-11-28",
    updatedAt: "2024-12-01",
    views: 445,
    agent: "Feature Prioritizer Agent",
    author: { name: "Olivia Martinez", avatar: "/diverse-woman-avatar.png" },
  },

  // ============================================================================
  // MARKET RESEARCH SOLUTION AREA REPORTS
  // ============================================================================
  {
    id: "research-1",
    title: "Financial Services Market Landscape Report",
    type: "pdf",
    status: "published",
    thumbnail: "/pdf-report-document.jpg",
    createdAt: "2024-10-25",
    updatedAt: "2024-11-01",
    views: 1678,
    agent: "Market Mapper Agent",
    author: { name: "Robert Chen", avatar: "/man-avatar.png" },
  },
  {
    id: "research-2",
    title: "Consumer Survey Results: Brand Perception",
    type: "export",
    status: "archived",
    thumbnail: "/analytics-dashboard.png",
    createdAt: "2024-09-15",
    updatedAt: "2024-10-01",
    views: 923,
    agent: "Survey Analyzer Agent",
    author: { name: "Nina Patel", avatar: "/professional-woman.png" },
  },

  // ============================================================================
  // INNOVATION SOLUTION AREA REPORTS
  // ============================================================================
  {
    id: "innovation-1",
    title: "Emerging Trends Synthesis: AI & Consumer Tech",
    type: "presentation",
    status: "published",
    thumbnail: "/presentation-slides.png",
    createdAt: "2024-11-05",
    updatedAt: "2024-11-10",
    views: 1534,
    agent: "Trend Synthesizer Agent",
    author: { name: "Chris Morgan", avatar: "/man-avatar.png" },
  },
  {
    id: "innovation-2",
    title: "Innovation Validation Report: Smart Home Products",
    type: "pdf",
    status: "draft",
    thumbnail: "/pdf-report-document.jpg",
    createdAt: "2024-12-06",
    updatedAt: "2024-12-09",
    views: 0,
    agent: "Innovation Validator Agent",
    author: { name: "Emma Thompson", avatar: "/diverse-woman-avatar.png" },
  },
]

function mapApiReportToUI(apiReport: any): Report {
  const typeMap: Record<string, string> = {
    PRESENTATION: 'presentation',
    DASHBOARD: 'dashboard',
    PDF: 'pdf',
    EXPORT: 'export',
    INFOGRAPHIC: 'infographic',
  }
  return {
    id: apiReport.id,
    title: apiReport.title,
    type: typeMap[apiReport.type] || 'pdf',
    status: apiReport.status?.toLowerCase() || 'draft',
    thumbnail: apiReport.thumbnail || '/placeholder.svg',
    createdAt: apiReport.createdAt,
    updatedAt: apiReport.updatedAt,
    views: apiReport.views || 0,
    agent: apiReport.agentId || 'AI Agent',
    author: { name: 'User', avatar: '' },
  }
}

const typeIcons = {
  presentation: Presentation,
  dashboard: BarChart3,
  pdf: FileText,
  export: Download,
  infographic: ImageIcon,
}

const statusColors = {
  published: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  draft: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  archived: "bg-muted text-muted-foreground border-muted",
}

// Type mapping from filter labels to internal types
const typeFilterMap: Record<string, string> = {
  "Presentation": "presentation",
  "Dashboard": "dashboard",
  "PDF Report": "pdf",
  "Data Export": "export",
  "Infographic": "infographic",
}

const statusFilterMap: Record<string, string> = {
  "Published": "published",
  "Draft": "draft",
  "Archived": "archived",
}

// Thumbnail component with error handling
function ReportThumbnail({ src, alt, type }: { src: string; alt: string; type: string }) {
  const [imgSrc, setImgSrc] = useState(src || "/placeholder.svg")
  const [hasError, setHasError] = useState(false)

  const TypeIcon = typeIcons[type as keyof typeof typeIcons] || FileText

  if (hasError || !imgSrc || imgSrc === "/placeholder.svg") {
    // Render a styled placeholder with icon instead of broken image
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/50">
        <TypeIcon className="h-12 w-12 text-muted-foreground/50 mb-2" />
        <span className="text-xs text-muted-foreground/50 capitalize">{type} Report</span>
      </div>
    )
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className="object-cover transition-transform group-hover:scale-105"
      onError={() => {
        setHasError(true)
        setImgSrc("/placeholder.svg")
      }}
      unoptimized
    />
  )
}

interface ReportsGridProps {
  searchQuery?: string
  selectedTypes?: string[]
  selectedStatuses?: string[]
}

export function ReportsGrid({
  searchQuery = "",
  selectedTypes = [],
  selectedStatuses = [],
}: ReportsGridProps) {
  const router = useRouter()
  const org = useCurrentOrganization()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [reportToShare, setReportToShare] = useState<Report | null>(null)
  const [copied, setCopied] = useState(false)

  // Fetch reports from API
  useEffect(() => {
    async function fetchReports() {
      try {
        const response = await fetch('/api/v1/reports', {
          headers: { 'x-organization-id': org.id },
        })
        if (response.ok) {
          const responseData = await response.json()
          const apiReports = Array.isArray(responseData.data) ? responseData.data : []
          if (apiReports.length > 0) {
            setReports(apiReports.map(mapApiReportToUI))
          } else {
            setReports(demoReports)
          }
        } else {
          setReports(demoReports)
        }
      } catch (error) {
        console.error('Failed to fetch reports:', error)
        setReports(demoReports)
      } finally {
        setIsLoading(false)
      }
    }
    fetchReports()
  }, [org.id])

  // Filter reports based on search, types, and statuses
  const filteredReports = reports.filter((report) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!report.title.toLowerCase().includes(query) &&
          !report.agent.toLowerCase().includes(query)) {
        return false
      }
    }

    // Type filter
    if (selectedTypes.length > 0) {
      const mappedTypes = selectedTypes.map((t) => typeFilterMap[t]).filter(Boolean)
      if (!mappedTypes.includes(report.type)) {
        return false
      }
    }

    // Status filter
    if (selectedStatuses.length > 0) {
      const mappedStatuses = selectedStatuses.map((s) => statusFilterMap[s]).filter(Boolean)
      if (!mappedStatuses.includes(report.status)) {
        return false
      }
    }

    return true
  })

  const handleEditReport = (report: Report) => {
    router.push(`/dashboard/reports/${report.id}/edit`)
  }

  const handleShareReport = (report: Report) => {
    setReportToShare(report)
    setShareDialogOpen(true)
  }

  const handleCopyLink = () => {
    if (reportToShare) {
      navigator.clipboard.writeText(`${window.location.origin}/dashboard/reports/${reportToShare.id}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDuplicateReport = async (report: Report) => {
    try {
      const typeMap: Record<string, string> = {
        presentation: 'PRESENTATION',
        dashboard: 'DASHBOARD',
        pdf: 'PDF',
        export: 'EXPORT',
        infographic: 'INFOGRAPHIC',
      }
      const response = await fetch('/api/v1/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': org.id,
        },
        body: JSON.stringify({
          title: `${report.title} (Copy)`,
          type: typeMap[report.type] || 'PDF',
        }),
      })
      if (response.ok) {
        const newReport = await response.json()
        setReports(prev => [mapApiReportToUI(newReport), ...prev])
      }
    } catch (error) {
      console.error('Failed to duplicate report:', error)
      // Fallback to local duplicate
      const newReport: Report = {
        ...report,
        id: `report-${Date.now()}`,
        title: `${report.title} (Copy)`,
        status: "draft",
        views: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      }
      setReports(prev => [newReport, ...prev])
    }
  }

  const handleDownloadReport = (report: Report) => {
    const link = document.createElement('a')
    link.href = report.thumbnail || '/placeholder.svg'
    link.download = `${report.title}.${report.type === 'pdf' ? 'pdf' : 'png'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDeleteReport = (report: Report) => {
    setReportToDelete(report)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (reportToDelete) {
      try {
        await fetch(`/api/v1/reports/${reportToDelete.id}`, {
          method: 'DELETE',
          headers: { 'x-organization-id': org.id },
        })
      } catch (error) {
        console.error('Failed to delete report:', error)
      }
      setReports(prev => prev.filter(r => r.id !== reportToDelete.id))
    }
    setDeleteDialogOpen(false)
    setReportToDelete(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (filteredReports.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No reports found</h3>
        <p className="text-muted-foreground max-w-md">
          {searchQuery || selectedTypes.length > 0 || selectedStatuses.length > 0
            ? "Try adjusting your search or filter criteria."
            : "Create your first report to get started."}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredReports.map((report) => {
          const TypeIcon = typeIcons[report.type as keyof typeof typeIcons]
          return (
            <Card
              key={report.id}
              className="group overflow-hidden transition-all hover:shadow-lg"
              onMouseEnter={() => setHoveredId(report.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="relative aspect-video overflow-hidden bg-muted">
                <ReportThumbnail
                  src={report.thumbnail}
                  alt={report.title}
                  type={report.type}
                />
                <div
                  className={`absolute inset-0 bg-black/60 flex items-center justify-center gap-2 transition-opacity ${
                    hoveredId === report.id ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Button size="sm" variant="secondary" asChild>
                    <Link href={`/dashboard/reports/${report.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleEditReport(report)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </div>
                <div className="absolute top-2 left-2 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`${statusColors[report.status as keyof typeof statusColors]} backdrop-blur-sm`}
                  >
                    {report.status}
                  </Badge>
                </div>
                <div className="absolute top-2 right-2">
                  <div className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm">
                    <TypeIcon className="h-3 w-3" />
                    <span className="capitalize">{report.type}</span>
                  </div>
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">{report.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">Generated by {report.agent}</p>
              </CardContent>

              <CardFooter className="flex items-center justify-between border-t p-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={report.author.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{report.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">{report.author.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  {report.views > 0 && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {report.views}
                    </span>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleShareReport(report)}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicateReport(report)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownloadReport(report)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteReport(report)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Report</DialogTitle>
            <DialogDescription>
              Share "{reportToShare?.title}" with your team or external stakeholders.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={reportToShare ? `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard/reports/${reportToShare.id}` : ''}
                />
                <Button onClick={handleCopyLink} variant="outline">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{reportToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
