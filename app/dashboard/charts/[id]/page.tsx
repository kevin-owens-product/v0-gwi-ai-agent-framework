"use client"

import { useState, use } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  BarChart3,
  Download,
  Share2,
  Edit,
  MoreHorizontal,
  Eye,
  Calendar,
  Users,
  LineChart,
  PieChart,
} from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock chart data - 10 advanced examples
const chartData: Record<string, {
  id: string
  name: string
  type: "bar" | "line" | "pie"
  audience: string
  metric: string
  lastModified: string
  views: number
  createdBy: string
  description: string
  dataSource: string
  timePeriod: string
}> = {
  "1": {
    id: "1",
    name: "Social Media Platform Penetration by Generation",
    type: "bar",
    audience: "All Adults 18-65",
    metric: "Platform Usage (%)",
    lastModified: "2 hours ago",
    views: 1234,
    createdBy: "Sarah Chen",
    description: "Comparative analysis of social media platform adoption rates across Gen Z, Millennials, Gen X, and Boomers with statistical significance indicators",
    dataSource: "GWI Core Q4 2024",
    timePeriod: "Oct-Dec 2024",
  },
  "2": {
    id: "2",
    name: "E-commerce Purchase Intent Trajectory",
    type: "line",
    audience: "Online Shoppers",
    metric: "Purchase Intent Index",
    lastModified: "4 hours ago",
    views: 892,
    createdBy: "Marcus Johnson",
    description: "24-month trend analysis of purchase intent across major retail categories with seasonal adjustment and YoY comparison",
    dataSource: "GWI Commerce",
    timePeriod: "Jan 2023 - Dec 2024",
  },
  "3": {
    id: "3",
    name: "Competitive Brand Health Dashboard",
    type: "bar",
    audience: "Category Buyers",
    metric: "Brand Health Score",
    lastModified: "1 day ago",
    views: 567,
    createdBy: "Emily Thompson",
    description: "Multi-dimensional brand health comparison featuring awareness, consideration, preference, and advocacy metrics across top 8 competitors",
    dataSource: "GWI Brand Tracker",
    timePeriod: "Q4 2024",
  },
  "4": {
    id: "4",
    name: "Media Consumption Time Share",
    type: "pie",
    audience: "Eco-Conscious Millennials",
    metric: "Daily Minutes",
    lastModified: "6 hours ago",
    views: 445,
    createdBy: "Alex Rivera",
    description: "Distribution of daily media consumption time across streaming, social, gaming, traditional TV, podcasts, and news platforms",
    dataSource: "GWI Core Q4 2024",
    timePeriod: "Nov 2024",
  },
  "5": {
    id: "5",
    name: "Cross-Market Sustainability Attitudes",
    type: "bar",
    audience: "Premium Consumers",
    metric: "Agreement Index",
    lastModified: "2 days ago",
    views: 723,
    createdBy: "Victoria Wells",
    description: "Comparative analysis of sustainability attitudes and willingness to pay premium across 12 key markets with cultural context",
    dataSource: "GWI Zeitgeist",
    timePeriod: "Q3-Q4 2024",
  },
  "6": {
    id: "6",
    name: "Streaming Service Subscriber Journey",
    type: "line",
    audience: "Cord-Cutters",
    metric: "Subscriber %",
    lastModified: "12 hours ago",
    views: 1089,
    createdBy: "Kevin Zhang",
    description: "Subscriber growth trajectories for major streaming platforms including churn analysis and multi-subscription behavior patterns",
    dataSource: "GWI Entertainment",
    timePeriod: "2022-2024",
  },
  "7": {
    id: "7",
    name: "Gen Z Financial Product Adoption",
    type: "bar",
    audience: "Gen Z (18-25)",
    metric: "Usage Rate (%)",
    lastModified: "1 day ago",
    views: 634,
    createdBy: "Isabella Martinez",
    description: "Adoption rates of fintech products including BNPL, crypto, neobanks, and investment apps with demographic breakdowns",
    dataSource: "GWI Finance",
    timePeriod: "Q4 2024",
  },
  "8": {
    id: "8",
    name: "Influencer Trust by Category",
    type: "pie",
    audience: "Social Media Active Users",
    metric: "Trust Score",
    lastModified: "3 days ago",
    views: 512,
    createdBy: "Noah Williams",
    description: "Consumer trust distribution across influencer categories: celebrities, macro-influencers, micro-influencers, and nano-influencers by product category",
    dataSource: "GWI Social",
    timePeriod: "Q4 2024",
  },
  "9": {
    id: "9",
    name: "Health & Wellness Spending Trends",
    type: "line",
    audience: "Health-Optimized Professionals",
    metric: "Monthly Spend ($)",
    lastModified: "8 hours ago",
    views: 378,
    createdBy: "Dr. James Park",
    description: "Tracking monthly spend across supplements, fitness, mental wellness apps, and preventive healthcare with income segment analysis",
    dataSource: "GWI Health",
    timePeriod: "2023-2024",
  },
  "10": {
    id: "10",
    name: "Luxury Purchase Drivers Analysis",
    type: "bar",
    audience: "Luxury Experience Seekers",
    metric: "Importance Score",
    lastModified: "5 hours ago",
    views: 456,
    createdBy: "Victoria Wells",
    description: "Ranked analysis of luxury purchase motivators including exclusivity, craftsmanship, heritage, sustainability, and social signaling",
    dataSource: "GWI Luxury",
    timePeriod: "Q4 2024",
  },
}

const ChartIcon = ({ type }: { type: "bar" | "line" | "pie" }) => {
  switch (type) {
    case "line":
      return <LineChart className="h-16 w-16 text-muted-foreground" />
    case "pie":
      return <PieChart className="h-16 w-16 text-muted-foreground" />
    default:
      return <BarChart3 className="h-16 w-16 text-muted-foreground" />
  }
}

export default function ChartDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [isExporting, setIsExporting] = useState(false)
  const chart = chartData[id]

  if (!chart) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/charts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Chart Not Found</h1>
            <p className="text-muted-foreground mt-1">The requested chart could not be found</p>
          </div>
        </div>
        <Card className="p-12 text-center">
          <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Chart not found</h2>
          <p className="text-muted-foreground mb-4">
            The chart you're looking for doesn't exist or has been deleted.
          </p>
          <Link href="/dashboard/charts">
            <Button>Back to Charts</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const handleExport = async () => {
    setIsExporting(true)
    // Simulate export delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsExporting(false)
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/charts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{chart.name}</h1>
            <p className="text-muted-foreground mt-1">{chart.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-transparent">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent" onClick={handleExport} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
          <Link href={`/dashboard/charts/new?edit=${chart.id}`}>
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
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Add to Dashboard</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>Modified {chart.lastModified}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          <span>{chart.views} views</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>Created by {chart.createdBy}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <ChartIcon type={chart.type} />
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Chart Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <Badge variant="secondary" className="mt-1 capitalize">
                  {chart.type} Chart
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Audience</p>
                <p className="font-medium">{chart.audience}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Metric</p>
                <p className="font-medium">{chart.metric}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export as PNG
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export as CSV
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Share2 className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
