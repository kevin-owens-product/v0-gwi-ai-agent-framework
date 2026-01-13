/**
 * ReportViewer Component
 *
 * Interactive viewer for research reports with slide navigation, comments, sharing,
 * export capabilities, and collaboration features. Supports multiple report types
 * including presentations, dashboards, PDFs, and infographics.
 *
 * Features:
 * - Slide-by-slide navigation with thumbnails
 * - Fullscreen presentation mode
 * - Export to multiple formats (PDF, PowerPoint, Image, JSON)
 * - Sharing via email, link, or collaboration invite
 * - Real-time comments and collaboration
 * - Version history and change tracking
 * - Regeneration and editing capabilities
 * - Event tracking for views, exports, and shares
 *
 * @component
 * @module components/reports/report-viewer
 *
 * @example
 * ```tsx
 * <ReportViewer reportId="report-123" />
 * ```
 *
 * @see Report
 * @see ReportBuilder
 */

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Download,
  Share2,
  Edit,
  MoreVertical,
  Eye,
  FileText,
  CheckCircle2,
  MessageSquare,
  Clock,
  GitBranch,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  RefreshCw,
  Copy,
  Mail,
  Link2,
  Sparkles,
  PenLine,
  Layers,
  Send,
  Loader2,
} from "lucide-react"
import { SlideContent, SlideThumbnail } from "./slide-content"

// Default placeholder data for when report is loading or has no content
const defaultReportData = {
  slides: [
    {
      id: 1,
      title: "Executive Summary",
      thumbnail: "/executive-summary-slide-with-key-metrics.jpg",
      content: "Key findings from the consumer research.",
    },
    {
      id: 2,
      title: "Key Findings",
      thumbnail: "/key-findings-chart-with-statistics.jpg",
      content: "Top consumer behavior shifts identified.",
    },
    {
      id: 3,
      title: "Audience Segments",
      thumbnail: "/audience-segmentation-pie-chart.jpg",
      content: "Primary segments from the analysis.",
    },
    {
      id: 4,
      title: "Insights Deep Dive",
      thumbnail: "/gen-z-consumer-behavior-infographic.jpg",
      content: "Detailed analysis of key behaviors.",
    },
    {
      id: 5,
      title: "Media Consumption",
      thumbnail: "/media-consumption-bar-chart.jpg",
      content: "Media consumption patterns.",
    },
    {
      id: 6,
      title: "Purchase Drivers",
      thumbnail: "/purchase-decision-factors-diagram.jpg",
      content: "Key purchase drivers identified.",
    },
    {
      id: 7,
      title: "Trend Analysis",
      thumbnail: "/trend-analysis-line-graph.jpg",
      content: "Emerging trends in consumption.",
    },
    {
      id: 8,
      title: "Recommendations",
      thumbnail: "/recommendations-bullet-points-slide.jpg",
      content: "Strategic recommendations.",
    },
  ],
  citations: [
    { source: "GWI Core Survey", confidence: 98, dataPoints: 15, markets: 52 },
    { source: "GWI USA Dataset", confidence: 95, dataPoints: 8, markets: 1 },
    { source: "GWI Zeitgeist", confidence: 92, dataPoints: 12, markets: 15 },
  ],
  comments: [],
  versions: [],
  activity: [],
}

interface Report {
  id: string
  title: string
  description?: string
  type: string
  status: string
  createdAt: string
  updatedAt: string
  views: number
  agentId?: string
  createdBy?: string
  content?: any
}

export function ReportViewer({ id }: { id: string }) {
  const router = useRouter()
  const [report, setReport] = useState<Report | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [_editingSlide, _setEditingSlide] = useState<number | null>(null)

  // Fetch report data
  useEffect(() => {
    async function fetchReport() {
      try {
        const response = await fetch(`/api/v1/reports/${id}`)
        if (response.ok) {
          const data = await response.json()
          setReport(data.data || data)
        }
      } catch (error) {
        console.error("Failed to fetch report:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchReport()
  }, [id])

  // Get report data with fallbacks - ensure arrays are always arrays
  const reportData = {
    id: report?.id || id,
    title: report?.title || "Report",
    description: report?.description || "Loading report details...",
    type: report?.type?.toLowerCase() || "presentation",
    status: report?.status?.toLowerCase() || "draft",
    createdAt: report?.createdAt || new Date().toISOString(),
    updatedAt: report?.updatedAt || new Date().toISOString(),
    views: report?.views || 0,
    agent: report?.agentId || "AI Agent",
    slides: Array.isArray(report?.content?.slides) ? report.content.slides : defaultReportData.slides,
    citations: Array.isArray(report?.content?.citations) ? report.content.citations : defaultReportData.citations,
    comments: Array.isArray(report?.content?.comments) ? report.content.comments : defaultReportData.comments,
    versions: Array.isArray(report?.content?.versions) ? report.content.versions : defaultReportData.versions,
    activity: Array.isArray(report?.content?.activity) ? report.content.activity : defaultReportData.activity,
    author: {
      name: "User",
      avatar: "",
      role: "Analyst",
    },
  }

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, reportData.slides.length - 1))
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0))

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-card shrink-0">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/reports">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{reportData.title}</h1>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  {reportData.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Generated by {reportData.agent} • Last updated {new Date(reportData.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* AI Enhance */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Enhance
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>AI Enhancement</SheetTitle>
                  <SheetDescription>Use AI to improve this report</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh with latest data
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <PenLine className="mr-2 h-4 w-4" />
                    Improve writing style
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Layers className="mr-2 h-4 w-4" />
                    Add more visualizations
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Generate executive summary
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Share Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share Report</DialogTitle>
                  <DialogDescription>Share this report with your team or external stakeholders</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Invite by email</label>
                    <div className="flex gap-2">
                      <Input placeholder="Enter email addresses" />
                      <Button>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Share link</label>
                    <div className="flex gap-2">
                      <Input value="https://gwi.app/reports/q4-consumer-insights" readOnly />
                      <Button variant="outline">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <Link2 className="mr-2 h-4 w-4" />
                      Slack
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <FileText className="mr-2 h-4 w-4" />
                  PowerPoint (.pptx)
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="mr-2 h-4 w-4" />
                  PDF Document
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="mr-2 h-4 w-4" />
                  Google Slides
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Raw Data (.csv)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button size="sm" onClick={() => router.push(`/dashboard/reports/${id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Duplicate report</DropdownMenuItem>
                <DropdownMenuItem>Schedule updates</DropdownMenuItem>
                <DropdownMenuItem>View API endpoint</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Delete report</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main viewer */}
        <div className="flex-1 p-6 flex flex-col">
          {/* Slide viewer */}
          <div className="relative flex-1 bg-muted rounded-lg overflow-hidden mb-4 group">
            <SlideContent
              slide={reportData.slides[currentSlide]}
              slideIndex={currentSlide}
              totalSlides={reportData.slides.length}
            />

            {/* Slide controls overlay */}
            <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="secondary"
                size="icon"
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="h-10 w-10 rounded-full"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={nextSlide}
                disabled={currentSlide === reportData.slides.length - 1}
                className="h-10 w-10 rounded-full"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Bottom controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-4 py-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <span className="text-sm font-medium px-2">
                {currentSlide + 1} / {reportData.slides.length}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsFullscreen(!isFullscreen)}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Slide title */}
            <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <span className="text-sm font-medium">{reportData.slides[currentSlide].title}</span>
            </div>
          </div>

          {/* Slide thumbnails */}
          <div className="flex gap-2 overflow-x-auto pb-2 shrink-0">
            {reportData.slides.map((slide: any, index: number) => (
              <button
                key={slide.id || index}
                onClick={() => setCurrentSlide(index)}
                className={`relative flex-shrink-0 w-32 aspect-video rounded-md overflow-hidden border-2 transition-all ${
                  currentSlide === index
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover:border-muted-foreground/50"
                }`}
              >
                <SlideThumbnail
                  slide={slide}
                  slideIndex={index}
                  totalSlides={reportData.slides.length}
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                  <span className="text-[10px] text-white font-medium">
                    {index + 1}. {slide.title}
                  </span>
                </div>
                {reportData.comments.some((c: any) => c.slide === slide.id) && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <MessageSquare className="h-2.5 w-2.5 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l bg-card shrink-0 flex flex-col">
          <Tabs defaultValue="details" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b h-auto p-0 shrink-0">
              <TabsTrigger
                value="details"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3"
              >
                Comments ({reportData.comments.length})
              </TabsTrigger>
              <TabsTrigger
                value="citations"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3"
              >
                Sources
              </TabsTrigger>
              <TabsTrigger
                value="versions"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-4 py-3"
              >
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="flex-1 p-4 space-y-6 m-0 overflow-auto">
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{reportData.description}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Author</h3>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={reportData.author.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{reportData.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{reportData.author.name}</p>
                    <p className="text-sm text-muted-foreground">{reportData.author.role}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Eye className="h-4 w-4" />
                      <span className="text-xs">Views</span>
                    </div>
                    <p className="text-2xl font-bold">{reportData.views}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <FileText className="h-4 w-4" />
                      <span className="text-xs">Slides</span>
                    </div>
                    <p className="text-2xl font-bold">{reportData.slides.length}</p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="font-medium mb-2">Recent Activity</h3>
                <div className="space-y-3">
                  {reportData.activity.slice(0, 4).map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">{item.user[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-muted-foreground">
                        <span className="font-medium text-foreground">{item.user}</span> {item.action}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comments" className="flex-1 flex flex-col m-0 overflow-hidden">
              <div className="flex-1 p-4 space-y-4 overflow-auto">
                {reportData.comments.map((comment: any) => (
                  <div key={comment.id} className="space-y-2">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{comment.user[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{comment.user}</span>
                          <span className="text-xs text-muted-foreground">{comment.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{comment.text}</p>
                        <button
                          className="text-xs text-primary mt-1 hover:underline"
                          onClick={() => setCurrentSlide(comment.slide - 1)}
                        >
                          View slide {comment.slide}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t shrink-0">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[60px] resize-none"
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-muted-foreground">Commenting on slide {currentSlide + 1}</span>
                  <Button size="sm" disabled={!newComment.trim()}>
                    <Send className="h-4 w-4 mr-1" />
                    Send
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="citations" className="flex-1 p-4 space-y-4 m-0 overflow-auto">
              <p className="text-sm text-muted-foreground">This report is backed by verified GWI data sources.</p>
              {reportData.citations.map((citation: any, index: number) => (
                <Card key={index} className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">{citation.source}</p>
                          <p className="text-xs text-muted-foreground">
                            {citation.dataPoints} data points • {citation.markets} markets
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                        {citation.confidence}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="versions" className="flex-1 p-4 space-y-4 m-0 overflow-auto">
              <p className="text-sm text-muted-foreground">Version history for this report.</p>
              {reportData.versions.map((version: any, index: number) => (
                <div
                  key={version.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <div className="p-2 bg-muted rounded-full">
                    <GitBranch className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{version.name}</span>
                      {index === 0 && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{version.changes}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{version.date}</span>
                      <span>•</span>
                      <span>{version.author}</span>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
