"use client"

import { useState } from "react"
import Link from "next/link"
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
} from "lucide-react"

const mockReport = {
  id: "1",
  title: "Q4 2024 Consumer Insights Report",
  description:
    "Comprehensive analysis of consumer behavior trends for Q4 2024, including shopping preferences, media consumption patterns, and emerging segments.",
  type: "presentation",
  status: "published",
  createdAt: "2024-12-01",
  updatedAt: "2024-12-03",
  views: 234,
  agent: "Audience Explorer",
  author: {
    name: "Sarah Chen",
    avatar: "/diverse-woman-avatar.png",
    role: "Senior Analyst",
  },
  slides: [
    {
      id: 1,
      title: "Executive Summary",
      thumbnail: "/executive-summary-slide-with-key-metrics.jpg",
      content: "Key findings from Q4 2024 consumer research across 15 markets.",
    },
    {
      id: 2,
      title: "Key Findings",
      thumbnail: "/key-findings-chart-with-statistics.jpg",
      content: "Top 5 consumer behavior shifts identified this quarter.",
    },
    {
      id: 3,
      title: "Audience Segments",
      thumbnail: "/audience-segmentation-pie-chart.jpg",
      content: "Four primary segments emerged from the analysis.",
    },
    {
      id: 4,
      title: "Gen Z Deep Dive",
      thumbnail: "/gen-z-consumer-behavior-infographic.jpg",
      content: "Digital-first behaviors and sustainability preferences.",
    },
    {
      id: 5,
      title: "Media Consumption",
      thumbnail: "/media-consumption-bar-chart.jpg",
      content: "Streaming continues to dominate, with social video growing.",
    },
    {
      id: 6,
      title: "Purchase Drivers",
      thumbnail: "/purchase-decision-factors-diagram.jpg",
      content: "Value and authenticity are top purchase drivers.",
    },
    {
      id: 7,
      title: "Trend Analysis",
      thumbnail: "/trend-analysis-line-graph.jpg",
      content: "Emerging trends in sustainable consumption.",
    },
    {
      id: 8,
      title: "Recommendations",
      thumbnail: "/recommendations-bullet-points-slide.jpg",
      content: "Strategic recommendations for Q1 2025 planning.",
    },
  ],
  citations: [
    { source: "GWI Core Survey Q4 2024", confidence: 98, dataPoints: 15, markets: 52 },
    { source: "GWI USA Dataset", confidence: 95, dataPoints: 8, markets: 1 },
    { source: "GWI Zeitgeist November 2024", confidence: 92, dataPoints: 12, markets: 15 },
    { source: "GWI Kids Dataset", confidence: 88, dataPoints: 5, markets: 12 },
  ],
  comments: [
    {
      id: 1,
      user: "Michael Park",
      avatar: "/man-avatar.png",
      text: "Great insights on Gen Z. Can we add more data on their social media preferences?",
      time: "2 hours ago",
      slide: 4,
    },
    {
      id: 2,
      user: "Emily Johnson",
      avatar: "/professional-woman.png",
      text: "The recommendations are spot on. Let's discuss the budget implications.",
      time: "1 day ago",
      slide: 8,
    },
  ],
  versions: [
    { id: 1, name: "v1.0", author: "Sarah Chen", date: "Dec 1, 2024", changes: "Initial creation" },
    { id: 2, name: "v1.1", author: "Sarah Chen", date: "Dec 2, 2024", changes: "Added Gen Z deep dive" },
    { id: 3, name: "v1.2", author: "Michael Park", date: "Dec 3, 2024", changes: "Updated recommendations" },
  ],
  activity: [
    { user: "Michael Park", action: "viewed", time: "2 hours ago" },
    { user: "Sarah Chen", action: "edited", time: "1 day ago" },
    { user: "Emily Johnson", action: "commented", time: "2 days ago" },
    { user: "Sarah Chen", action: "created", time: "3 days ago" },
  ],
}

export function ReportViewer({ id }: { id: string }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [editingSlide, setEditingSlide] = useState<number | null>(null)

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, mockReport.slides.length - 1))
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0))

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
                <h1 className="text-xl font-semibold">{mockReport.title}</h1>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  {mockReport.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Generated by {mockReport.agent} • Last updated {new Date(mockReport.updatedAt).toLocaleDateString()}
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

            <Button size="sm">
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
            <img
              src={mockReport.slides[currentSlide].thumbnail || "/placeholder.svg"}
              alt={mockReport.slides[currentSlide].title}
              className="w-full h-full object-contain"
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
                disabled={currentSlide === mockReport.slides.length - 1}
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
                {currentSlide + 1} / {mockReport.slides.length}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsFullscreen(!isFullscreen)}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Slide title */}
            <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <span className="text-sm font-medium">{mockReport.slides[currentSlide].title}</span>
            </div>
          </div>

          {/* Slide thumbnails */}
          <div className="flex gap-2 overflow-x-auto pb-2 shrink-0">
            {mockReport.slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(index)}
                className={`relative flex-shrink-0 w-32 aspect-video rounded-md overflow-hidden border-2 transition-all ${
                  currentSlide === index
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover:border-muted-foreground/50"
                }`}
              >
                <img
                  src={slide.thumbnail || "/placeholder.svg"}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                  <span className="text-[10px] text-white font-medium">
                    {index + 1}. {slide.title}
                  </span>
                </div>
                {mockReport.comments.some((c) => c.slide === slide.id) && (
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
                Comments ({mockReport.comments.length})
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
                <p className="text-sm text-muted-foreground">{mockReport.description}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Author</h3>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={mockReport.author.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{mockReport.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{mockReport.author.name}</p>
                    <p className="text-sm text-muted-foreground">{mockReport.author.role}</p>
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
                    <p className="text-2xl font-bold">{mockReport.views}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <FileText className="h-4 w-4" />
                      <span className="text-xs">Slides</span>
                    </div>
                    <p className="text-2xl font-bold">{mockReport.slides.length}</p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="font-medium mb-2">Recent Activity</h3>
                <div className="space-y-3">
                  {mockReport.activity.slice(0, 4).map((item, index) => (
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
                {mockReport.comments.map((comment) => (
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
              {mockReport.citations.map((citation, index) => (
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
              {mockReport.versions.map((version, index) => (
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
