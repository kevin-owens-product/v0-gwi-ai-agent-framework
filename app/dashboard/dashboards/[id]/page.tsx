"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  LineChart,
  PieChart,
  Plus,
  Settings,
} from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock dashboard data
const dashboardData: Record<string, {
  id: string
  name: string
  description: string
  charts: { id: string; name: string; type: "bar" | "line" | "pie" }[]
  lastModified: string
  views: number
  createdBy: string
  isPublic: boolean
}> = {
  "1": {
    id: "1",
    name: "Q4 Campaign Performance",
    description: "Overview of Q4 marketing campaign metrics and KPIs",
    charts: [
      { id: "c1", name: "Engagement Rate by Channel", type: "bar" },
      { id: "c2", name: "Conversion Funnel", type: "bar" },
      { id: "c3", name: "Weekly Performance Trend", type: "line" },
      { id: "c4", name: "Audience Reach by Demo", type: "pie" },
      { id: "c5", name: "ROI by Campaign", type: "bar" },
      { id: "c6", name: "Click-through Rates", type: "line" },
      { id: "c7", name: "Brand Lift Metrics", type: "bar" },
      { id: "c8", name: "Cost per Acquisition", type: "line" },
    ],
    lastModified: "1 hour ago",
    views: 234,
    createdBy: "John Doe",
    isPublic: false,
  },
  "2": {
    id: "2",
    name: "Consumer Trends 2024",
    description: "Annual consumer behavior trends and insights analysis",
    charts: [
      { id: "c1", name: "Social Media Preferences", type: "bar" },
      { id: "c2", name: "Shopping Channel Mix", type: "pie" },
      { id: "c3", name: "Brand Loyalty Trends", type: "line" },
      { id: "c4", name: "Sustainability Attitudes", type: "bar" },
      { id: "c5", name: "Device Usage", type: "pie" },
      { id: "c6", name: "Content Consumption", type: "bar" },
      { id: "c7", name: "Purchase Drivers", type: "bar" },
      { id: "c8", name: "Age Demo Breakdown", type: "pie" },
      { id: "c9", name: "Regional Differences", type: "bar" },
      { id: "c10", name: "YoY Comparison", type: "line" },
      { id: "c11", name: "Emerging Behaviors", type: "bar" },
      { id: "c12", name: "Market Share", type: "pie" },
    ],
    lastModified: "2 days ago",
    views: 567,
    createdBy: "Jane Smith",
    isPublic: true,
  },
  "3": {
    id: "3",
    name: "Brand Health Monitor",
    description: "Track brand perception and competitive positioning",
    charts: [
      { id: "c1", name: "Brand Awareness", type: "bar" },
      { id: "c2", name: "Net Promoter Score", type: "line" },
      { id: "c3", name: "Competitive Share", type: "pie" },
      { id: "c4", name: "Sentiment Analysis", type: "bar" },
      { id: "c5", name: "Purchase Consideration", type: "bar" },
      { id: "c6", name: "Brand Attributes", type: "bar" },
    ],
    lastModified: "1 week ago",
    views: 892,
    createdBy: "Mike Johnson",
    isPublic: true,
  },
}

const ChartIcon = ({ type }: { type: "bar" | "line" | "pie" }) => {
  switch (type) {
    case "line":
      return <LineChart className="h-8 w-8 text-muted-foreground" />
    case "pie":
      return <PieChart className="h-8 w-8 text-muted-foreground" />
    default:
      return <BarChart3 className="h-8 w-8 text-muted-foreground" />
  }
}

export default function DashboardDetailPage({ params }: { params: { id: string } }) {
  const [isExporting, setIsExporting] = useState(false)
  const dashboard = dashboardData[params.id]

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

  const handleExport = async () => {
    setIsExporting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsExporting(false)
  }

  return (
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
              {dashboard.isPublic && (
                <Badge variant="secondary">Public</Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">{dashboard.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Add Chart
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent" onClick={handleExport} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
          <Button size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Add to Report</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>Modified {dashboard.lastModified}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          <span>{dashboard.views} views</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>Created by {dashboard.createdBy}</span>
        </div>
        <div className="flex items-center gap-1">
          <BarChart3 className="h-4 w-4" />
          <span>{dashboard.charts.length} charts</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {dashboard.charts.map((chart) => (
          <Card key={chart.id} className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
            <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
              <ChartIcon type={chart.type} />
            </div>
            <h3 className="font-medium text-sm">{chart.name}</h3>
            <p className="text-xs text-muted-foreground capitalize">{chart.type} chart</p>
          </Card>
        ))}

        {/* Add Chart Card */}
        <Card className="p-4 border-dashed hover:bg-accent/50 transition-colors cursor-pointer">
          <div className="aspect-video rounded-lg mb-3 flex items-center justify-center">
            <div className="text-center">
              <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Add Chart</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
