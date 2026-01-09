"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
} from "lucide-react"

const reports = [
  {
    id: "1",
    title: "Q4 2024 Consumer Insights Report",
    type: "presentation",
    status: "published",
    thumbnail: "/presentation-slides.png",
    createdAt: "2024-12-01",
    updatedAt: "2024-12-03",
    views: 234,
    agent: "Audience Strategy Agent",
    author: { name: "Sarah Chen", avatar: "/diverse-woman-avatar.png" },
  },
  {
    id: "2",
    title: "Gen Z Media Consumption Dashboard",
    type: "dashboard",
    status: "published",
    thumbnail: "/analytics-dashboard.png",
    createdAt: "2024-11-28",
    updatedAt: "2024-12-02",
    views: 567,
    agent: "Trend Forecaster Agent",
    author: { name: "Michael Park", avatar: "/man-avatar.png" },
  },
  {
    id: "3",
    title: "Beauty Industry Competitive Analysis",
    type: "pdf",
    status: "draft",
    thumbnail: "/pdf-report-document.jpg",
    createdAt: "2024-11-25",
    updatedAt: "2024-12-01",
    views: 0,
    agent: "Competitive Tracker Agent",
    author: { name: "Emily Johnson", avatar: "/professional-woman.png" },
  },
  {
    id: "4",
    title: "Sustainability Segment Export",
    type: "export",
    status: "published",
    thumbnail: "/data-export-spreadsheet.jpg",
    createdAt: "2024-11-20",
    updatedAt: "2024-11-22",
    views: 89,
    agent: "Data Export Agent",
    author: { name: "James Wilson", avatar: "/professional-man.png" },
  },
  {
    id: "5",
    title: "Holiday Campaign Creative Brief",
    type: "pdf",
    status: "published",
    thumbnail: "/creative-brief-marketing.jpg",
    createdAt: "2024-11-15",
    updatedAt: "2024-11-18",
    views: 342,
    agent: "Creative Brief Builder",
    author: { name: "Lisa Wang", avatar: "/asian-woman-avatar.png" },
  },
  {
    id: "6",
    title: "Sports Audience Infographic",
    type: "infographic",
    status: "archived",
    thumbnail: "/infographic-sports-audience.jpg",
    createdAt: "2024-10-10",
    updatedAt: "2024-10-15",
    views: 1205,
    agent: "Infographic Builder",
    author: { name: "David Kim", avatar: "/korean-man-avatar.jpg" },
  },
]

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

export function ReportsGrid() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reports.map((report) => {
        const TypeIcon = typeIcons[report.type as keyof typeof typeIcons]
        return (
          <Card
            key={report.id}
            className="group overflow-hidden transition-all hover:shadow-lg"
            onMouseEnter={() => setHoveredId(report.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="relative aspect-video overflow-hidden bg-muted">
              <img
                src={report.thumbnail || "/placeholder.svg"}
                alt={report.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
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
                <Button size="sm" variant="secondary">
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
                    <DropdownMenuItem>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
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
  )
}
