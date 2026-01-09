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
  Users,
  Calendar,
  Globe,
  TrendingUp,
  BarChart3,
  Target,
  Zap,
} from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock audience data
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
}> = {
  "1": {
    id: "1",
    name: "Eco-Conscious Millennials",
    description: "25-40, urban, high engagement with sustainability brands",
    size: "1.2M",
    markets: ["US", "UK", "DE"],
    lastUsed: "2 hours ago",
    createdBy: "John Doe",
    demographics: [
      { label: "Age Range", value: "25-40" },
      { label: "Gender", value: "All" },
      { label: "Income", value: "$50K-$100K" },
      { label: "Education", value: "College+" },
      { label: "Location", value: "Urban" },
    ],
    behaviors: [
      "Shops at sustainable brands",
      "Uses reusable products",
      "Reduces meat consumption",
      "Prefers public transit",
      "Active recycler",
    ],
    interests: [
      "Environmental activism",
      "Organic food",
      "Renewable energy",
      "Ethical fashion",
      "Zero-waste living",
    ],
  },
  "2": {
    id: "2",
    name: "Tech Early Adopters",
    description: "High-income professionals, first to try new technology",
    size: "850K",
    markets: ["US", "JP", "KR"],
    lastUsed: "1 day ago",
    createdBy: "Jane Smith",
    demographics: [
      { label: "Age Range", value: "28-45" },
      { label: "Gender", value: "60% Male" },
      { label: "Income", value: "$100K+" },
      { label: "Education", value: "Graduate+" },
      { label: "Location", value: "Tech Hubs" },
    ],
    behaviors: [
      "Pre-orders new devices",
      "Beta tests software",
      "Multiple smart devices",
      "High app usage",
      "Tech influencer following",
    ],
    interests: [
      "AI & Machine Learning",
      "Gadgets & Electronics",
      "Startups",
      "Cryptocurrency",
      "Gaming",
    ],
  },
  "3": {
    id: "3",
    name: "Gen Z Content Creators",
    description: "16-25, active on social media, creating content weekly",
    size: "2.1M",
    markets: ["Global"],
    lastUsed: "3 days ago",
    createdBy: "Mike Johnson",
    demographics: [
      { label: "Age Range", value: "16-25" },
      { label: "Gender", value: "55% Female" },
      { label: "Income", value: "Varied" },
      { label: "Education", value: "High School+" },
      { label: "Location", value: "Global Urban" },
    ],
    behaviors: [
      "Posts daily on social",
      "Creates video content",
      "Engages with brands",
      "Multi-platform presence",
      "Monetizes content",
    ],
    interests: [
      "Social media trends",
      "Video editing",
      "Fashion & Beauty",
      "Music",
      "Pop culture",
    ],
  },
}

export default function AudienceDetailPage({ params }: { params: { id: string } }) {
  const [isExporting, setIsExporting] = useState(false)
  const audience = audienceData[params.id]

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
            <h1 className="text-3xl font-bold">Audience Not Found</h1>
            <p className="text-muted-foreground mt-1">The requested audience could not be found</p>
          </div>
        </div>
        <Card className="p-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Audience not found</h2>
          <p className="text-muted-foreground mb-4">
            The audience you're looking for doesn't exist or has been deleted.
          </p>
          <Link href="/dashboard/audiences">
            <Button>Back to Audiences</Button>
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
          <Link href="/dashboard/audiences">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{audience.name}</h1>
            <p className="text-muted-foreground mt-1">{audience.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/playground?audience=${audience.id}`}>
            <Button variant="outline" size="sm" className="bg-transparent">
              <Zap className="h-4 w-4 mr-2" />
              Explore
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="bg-transparent">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent" onClick={handleExport} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
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
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Create Lookalike</DropdownMenuItem>
              <DropdownMenuItem>Add to Project</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{audience.size} people</span>
        </div>
        <div className="flex items-center gap-1">
          <Globe className="h-4 w-4" />
          <span>{audience.markets.join(", ")}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>Used {audience.lastUsed}</span>
        </div>
        <div className="flex items-center gap-1">
          <Target className="h-4 w-4" />
          <span>Created by {audience.createdBy}</span>
        </div>
      </div>

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
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <BarChart3 className="h-4 w-4 mr-2" />
                Create Chart
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Users className="h-4 w-4 mr-2" />
                Compare Audiences
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export Profile
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
