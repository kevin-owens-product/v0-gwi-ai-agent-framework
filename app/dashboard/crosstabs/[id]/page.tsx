"use client"

import { useState, use } from "react"
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
  Table2,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Mock crosstab data - 10 advanced examples
const crosstabData: Record<string, {
  id: string
  name: string
  audiences: string[]
  metrics: string[]
  lastModified: string
  views: number
  createdBy: string
  description: string
  dataSource: string
  data: { metric: string; values: Record<string, number> }[]
}> = {
  "1": {
    id: "1",
    name: "Generational Social Media Platform Analysis",
    audiences: ["Gen Z (18-24)", "Millennials (25-40)", "Gen X (41-56)", "Boomers (57-75)"],
    metrics: ["TikTok", "Instagram", "Facebook", "YouTube", "LinkedIn", "Twitter/X", "Snapchat", "Pinterest"],
    lastModified: "1 hour ago",
    views: 1892,
    createdBy: "Sarah Chen",
    description: "Comprehensive multi-generational analysis of social media platform usage, engagement frequency, and content preferences",
    dataSource: "GWI Core Q4 2024",
    data: [
      { metric: "TikTok", values: { "Gen Z (18-24)": 87, "Millennials (25-40)": 52, "Gen X (41-56)": 24, "Boomers (57-75)": 8 } },
      { metric: "Instagram", values: { "Gen Z (18-24)": 82, "Millennials (25-40)": 71, "Gen X (41-56)": 48, "Boomers (57-75)": 28 } },
      { metric: "Facebook", values: { "Gen Z (18-24)": 42, "Millennials (25-40)": 68, "Gen X (41-56)": 78, "Boomers (57-75)": 72 } },
      { metric: "YouTube", values: { "Gen Z (18-24)": 91, "Millennials (25-40)": 85, "Gen X (41-56)": 76, "Boomers (57-75)": 62 } },
      { metric: "LinkedIn", values: { "Gen Z (18-24)": 28, "Millennials (25-40)": 52, "Gen X (41-56)": 48, "Boomers (57-75)": 35 } },
      { metric: "Twitter/X", values: { "Gen Z (18-24)": 38, "Millennials (25-40)": 42, "Gen X (41-56)": 35, "Boomers (57-75)": 22 } },
      { metric: "Snapchat", values: { "Gen Z (18-24)": 72, "Millennials (25-40)": 35, "Gen X (41-56)": 12, "Boomers (57-75)": 4 } },
      { metric: "Pinterest", values: { "Gen Z (18-24)": 45, "Millennials (25-40)": 48, "Gen X (41-56)": 42, "Boomers (57-75)": 38 } },
    ],
  },
  "2": {
    id: "2",
    name: "Income Segment Purchase Channel Preferences",
    audiences: ["Under $50K", "$50K-$100K", "$100K-$150K", "$150K-$250K", "$250K+"],
    metrics: ["E-commerce", "In-Store Retail", "Mobile Apps", "Social Commerce", "Subscription Services", "Direct-to-Consumer", "Luxury Retail", "Resale/Second-hand"],
    lastModified: "4 hours ago",
    views: 1245,
    createdBy: "Marcus Johnson",
    description: "Multi-dimensional analysis of purchase channel preferences across income segments with spend propensity indicators",
    dataSource: "GWI Commerce Q4 2024",
    data: [
      { metric: "E-commerce", values: { "Under $50K": 72, "$50K-$100K": 78, "$100K-$150K": 82, "$150K-$250K": 85, "$250K+": 79 } },
      { metric: "In-Store Retail", values: { "Under $50K": 68, "$50K-$100K": 62, "$100K-$150K": 58, "$150K-$250K": 55, "$250K+": 62 } },
      { metric: "Mobile Apps", values: { "Under $50K": 58, "$50K-$100K": 65, "$100K-$150K": 72, "$150K-$250K": 75, "$250K+": 71 } },
      { metric: "Social Commerce", values: { "Under $50K": 42, "$50K-$100K": 45, "$100K-$150K": 38, "$150K-$250K": 32, "$250K+": 28 } },
      { metric: "Subscription Services", values: { "Under $50K": 35, "$50K-$100K": 52, "$100K-$150K": 68, "$150K-$250K": 78, "$250K+": 82 } },
      { metric: "Direct-to-Consumer", values: { "Under $50K": 28, "$50K-$100K": 42, "$100K-$150K": 55, "$150K-$250K": 65, "$250K+": 72 } },
      { metric: "Luxury Retail", values: { "Under $50K": 8, "$50K-$100K": 18, "$100K-$150K": 35, "$150K-$250K": 58, "$250K+": 78 } },
      { metric: "Resale/Second-hand", values: { "Under $50K": 48, "$50K-$100K": 42, "$100K-$150K": 35, "$150K-$250K": 28, "$250K+": 22 } },
    ],
  },
  "3": {
    id: "3",
    name: "Global Market Digital Behavior Comparison",
    audiences: ["United States", "United Kingdom", "Germany", "France", "Japan", "South Korea", "Brazil", "Australia"],
    metrics: ["Streaming Video", "Mobile Gaming", "Social Media", "E-commerce", "Food Delivery", "Fintech Apps", "Fitness Apps", "Podcast Listening"],
    lastModified: "2 days ago",
    views: 2156,
    createdBy: "Alex Rivera",
    description: "Cross-market comparison of digital behavior penetration rates with cultural context and market maturity indicators",
    dataSource: "GWI Global Q4 2024",
    data: [
      { metric: "Streaming Video", values: { "United States": 89, "United Kingdom": 85, "Germany": 78, "France": 82, "Japan": 72, "South Korea": 88, "Brazil": 76, "Australia": 84 } },
      { metric: "Mobile Gaming", values: { "United States": 62, "United Kingdom": 58, "Germany": 52, "France": 55, "Japan": 78, "South Korea": 85, "Brazil": 72, "Australia": 56 } },
      { metric: "Social Media", values: { "United States": 82, "United Kingdom": 78, "Germany": 68, "France": 72, "Japan": 65, "South Korea": 88, "Brazil": 92, "Australia": 76 } },
      { metric: "E-commerce", values: { "United States": 78, "United Kingdom": 82, "Germany": 75, "France": 72, "Japan": 85, "South Korea": 92, "Brazil": 68, "Australia": 79 } },
      { metric: "Food Delivery", values: { "United States": 58, "United Kingdom": 62, "Germany": 48, "France": 52, "Japan": 55, "South Korea": 78, "Brazil": 65, "Australia": 58 } },
      { metric: "Fintech Apps", values: { "United States": 52, "United Kingdom": 58, "Germany": 45, "France": 42, "Japan": 38, "South Korea": 72, "Brazil": 78, "Australia": 55 } },
      { metric: "Fitness Apps", values: { "United States": 48, "United Kingdom": 45, "Germany": 42, "France": 38, "Japan": 35, "South Korea": 52, "Brazil": 42, "Australia": 52 } },
      { metric: "Podcast Listening", values: { "United States": 55, "United Kingdom": 48, "Germany": 35, "France": 32, "Japan": 22, "South Korea": 45, "Brazil": 58, "Australia": 52 } },
    ],
  },
  "4": {
    id: "4",
    name: "Sustainability Attitudes by Consumer Segment",
    audiences: ["Eco-Activists", "Mainstream Green", "Price-Conscious", "Skeptics", "Indifferent"],
    metrics: ["Pay Premium for Sustainable", "Check Brand Ethics", "Reduce Single-Use Plastic", "Buy Second-Hand", "Carbon Footprint Aware", "Support Local", "Vegan/Plant-Based Diet", "Boycott Unethical Brands"],
    lastModified: "6 hours ago",
    views: 987,
    createdBy: "Emily Thompson",
    description: "Segmented analysis of sustainability attitudes and behaviors with actionability scores for brand positioning",
    dataSource: "GWI Zeitgeist Nov 2024",
    data: [
      { metric: "Pay Premium for Sustainable", values: { "Eco-Activists": 92, "Mainstream Green": 65, "Price-Conscious": 28, "Skeptics": 12, "Indifferent": 8 } },
      { metric: "Check Brand Ethics", values: { "Eco-Activists": 95, "Mainstream Green": 72, "Price-Conscious": 35, "Skeptics": 18, "Indifferent": 5 } },
      { metric: "Reduce Single-Use Plastic", values: { "Eco-Activists": 98, "Mainstream Green": 78, "Price-Conscious": 52, "Skeptics": 32, "Indifferent": 15 } },
      { metric: "Buy Second-Hand", values: { "Eco-Activists": 82, "Mainstream Green": 55, "Price-Conscious": 68, "Skeptics": 22, "Indifferent": 18 } },
      { metric: "Carbon Footprint Aware", values: { "Eco-Activists": 88, "Mainstream Green": 45, "Price-Conscious": 18, "Skeptics": 8, "Indifferent": 2 } },
      { metric: "Support Local", values: { "Eco-Activists": 85, "Mainstream Green": 68, "Price-Conscious": 42, "Skeptics": 38, "Indifferent": 25 } },
      { metric: "Vegan/Plant-Based Diet", values: { "Eco-Activists": 48, "Mainstream Green": 22, "Price-Conscious": 12, "Skeptics": 5, "Indifferent": 3 } },
      { metric: "Boycott Unethical Brands", values: { "Eco-Activists": 92, "Mainstream Green": 58, "Price-Conscious": 28, "Skeptics": 15, "Indifferent": 5 } },
    ],
  },
  "5": {
    id: "5",
    name: "Brand Awareness Competitive Landscape",
    audiences: ["Brand A", "Brand B", "Brand C", "Brand D", "Brand E", "Brand F"],
    metrics: ["Unaided Awareness", "Aided Awareness", "Consideration", "Preference", "Purchase", "Loyalty", "Advocacy", "Premium Perception"],
    lastModified: "3 hours ago",
    views: 1456,
    createdBy: "Victoria Wells",
    description: "Full-funnel competitive brand health analysis with conversion rate calculations and market share correlation",
    dataSource: "GWI Brand Tracker Q4 2024",
    data: [
      { metric: "Unaided Awareness", values: { "Brand A": 72, "Brand B": 58, "Brand C": 45, "Brand D": 38, "Brand E": 28, "Brand F": 22 } },
      { metric: "Aided Awareness", values: { "Brand A": 95, "Brand B": 88, "Brand C": 82, "Brand D": 75, "Brand E": 68, "Brand F": 62 } },
      { metric: "Consideration", values: { "Brand A": 68, "Brand B": 55, "Brand C": 48, "Brand D": 42, "Brand E": 35, "Brand F": 28 } },
      { metric: "Preference", values: { "Brand A": 42, "Brand B": 28, "Brand C": 22, "Brand D": 18, "Brand E": 12, "Brand F": 8 } },
      { metric: "Purchase", values: { "Brand A": 38, "Brand B": 24, "Brand C": 18, "Brand D": 14, "Brand E": 10, "Brand F": 6 } },
      { metric: "Loyalty", values: { "Brand A": 78, "Brand B": 65, "Brand C": 58, "Brand D": 52, "Brand E": 45, "Brand F": 38 } },
      { metric: "Advocacy", values: { "Brand A": 52, "Brand B": 38, "Brand C": 32, "Brand D": 25, "Brand E": 18, "Brand F": 12 } },
      { metric: "Premium Perception", values: { "Brand A": 82, "Brand B": 68, "Brand C": 55, "Brand D": 42, "Brand E": 35, "Brand F": 28 } },
    ],
  },
  "6": {
    id: "6",
    name: "Media Consumption by Daypart",
    audiences: ["Morning (6-9am)", "Daytime (9am-5pm)", "Evening (5-9pm)", "Late Night (9pm-12am)", "Overnight (12-6am)"],
    metrics: ["Linear TV", "Streaming", "Social Media", "Podcasts", "Radio", "News Sites", "Gaming", "Music Streaming"],
    lastModified: "8 hours ago",
    views: 823,
    createdBy: "Kevin Zhang",
    description: "Daypart analysis of media consumption patterns for optimal campaign timing and channel planning",
    dataSource: "GWI Media Q4 2024",
    data: [
      { metric: "Linear TV", values: { "Morning (6-9am)": 35, "Daytime (9am-5pm)": 18, "Evening (5-9pm)": 72, "Late Night (9pm-12am)": 58, "Overnight (12-6am)": 12 } },
      { metric: "Streaming", values: { "Morning (6-9am)": 22, "Daytime (9am-5pm)": 28, "Evening (5-9pm)": 85, "Late Night (9pm-12am)": 78, "Overnight (12-6am)": 25 } },
      { metric: "Social Media", values: { "Morning (6-9am)": 68, "Daytime (9am-5pm)": 72, "Evening (5-9pm)": 78, "Late Night (9pm-12am)": 65, "Overnight (12-6am)": 28 } },
      { metric: "Podcasts", values: { "Morning (6-9am)": 52, "Daytime (9am-5pm)": 45, "Evening (5-9pm)": 35, "Late Night (9pm-12am)": 22, "Overnight (12-6am)": 8 } },
      { metric: "Radio", values: { "Morning (6-9am)": 58, "Daytime (9am-5pm)": 42, "Evening (5-9pm)": 25, "Late Night (9pm-12am)": 15, "Overnight (12-6am)": 8 } },
      { metric: "News Sites", values: { "Morning (6-9am)": 72, "Daytime (9am-5pm)": 55, "Evening (5-9pm)": 48, "Late Night (9pm-12am)": 32, "Overnight (12-6am)": 12 } },
      { metric: "Gaming", values: { "Morning (6-9am)": 15, "Daytime (9am-5pm)": 22, "Evening (5-9pm)": 65, "Late Night (9pm-12am)": 72, "Overnight (12-6am)": 35 } },
      { metric: "Music Streaming", values: { "Morning (6-9am)": 62, "Daytime (9am-5pm)": 58, "Evening (5-9pm)": 52, "Late Night (9pm-12am)": 45, "Overnight (12-6am)": 22 } },
    ],
  },
  "7": {
    id: "7",
    name: "Financial Product Adoption by Life Stage",
    audiences: ["Students", "Young Professionals", "Young Families", "Established Families", "Empty Nesters", "Retirees"],
    metrics: ["Mobile Banking", "Investment Apps", "BNPL Services", "Crypto Ownership", "Insurance Products", "Retirement Accounts", "Credit Cards", "Personal Loans"],
    lastModified: "1 day ago",
    views: 1034,
    createdBy: "David Chen",
    description: "Life stage analysis of financial product adoption with risk tolerance and advisory preference indicators",
    dataSource: "GWI Finance Q4 2024",
    data: [
      { metric: "Mobile Banking", values: { "Students": 82, "Young Professionals": 92, "Young Families": 88, "Established Families": 78, "Empty Nesters": 62, "Retirees": 42 } },
      { metric: "Investment Apps", values: { "Students": 28, "Young Professionals": 58, "Young Families": 52, "Established Families": 62, "Empty Nesters": 55, "Retirees": 35 } },
      { metric: "BNPL Services", values: { "Students": 55, "Young Professionals": 62, "Young Families": 58, "Established Families": 38, "Empty Nesters": 18, "Retirees": 8 } },
      { metric: "Crypto Ownership", values: { "Students": 32, "Young Professionals": 45, "Young Families": 35, "Established Families": 22, "Empty Nesters": 12, "Retirees": 5 } },
      { metric: "Insurance Products", values: { "Students": 18, "Young Professionals": 45, "Young Families": 78, "Established Families": 85, "Empty Nesters": 82, "Retirees": 88 } },
      { metric: "Retirement Accounts", values: { "Students": 12, "Young Professionals": 52, "Young Families": 68, "Established Families": 82, "Empty Nesters": 92, "Retirees": 95 } },
      { metric: "Credit Cards", values: { "Students": 45, "Young Professionals": 78, "Young Families": 85, "Established Families": 88, "Empty Nesters": 82, "Retirees": 72 } },
      { metric: "Personal Loans", values: { "Students": 22, "Young Professionals": 35, "Young Families": 48, "Established Families": 42, "Empty Nesters": 25, "Retirees": 12 } },
    ],
  },
  "8": {
    id: "8",
    name: "Health & Wellness Priorities by Persona",
    audiences: ["Fitness Enthusiasts", "Wellness Seekers", "Busy Professionals", "Health-Conscious Parents", "Active Seniors"],
    metrics: ["Gym Membership", "Home Fitness", "Nutrition Apps", "Mental Wellness Apps", "Sleep Tracking", "Supplements", "Organic Food", "Preventive Care"],
    lastModified: "5 hours ago",
    views: 756,
    createdBy: "Dr. James Park",
    description: "Persona-based health and wellness behavior analysis with spend propensity and brand preference indicators",
    dataSource: "GWI Health Q4 2024",
    data: [
      { metric: "Gym Membership", values: { "Fitness Enthusiasts": 92, "Wellness Seekers": 55, "Busy Professionals": 42, "Health-Conscious Parents": 35, "Active Seniors": 48 } },
      { metric: "Home Fitness", values: { "Fitness Enthusiasts": 78, "Wellness Seekers": 62, "Busy Professionals": 58, "Health-Conscious Parents": 72, "Active Seniors": 55 } },
      { metric: "Nutrition Apps", values: { "Fitness Enthusiasts": 72, "Wellness Seekers": 68, "Busy Professionals": 45, "Health-Conscious Parents": 58, "Active Seniors": 35 } },
      { metric: "Mental Wellness Apps", values: { "Fitness Enthusiasts": 45, "Wellness Seekers": 78, "Busy Professionals": 62, "Health-Conscious Parents": 52, "Active Seniors": 28 } },
      { metric: "Sleep Tracking", values: { "Fitness Enthusiasts": 68, "Wellness Seekers": 72, "Busy Professionals": 55, "Health-Conscious Parents": 48, "Active Seniors": 42 } },
      { metric: "Supplements", values: { "Fitness Enthusiasts": 85, "Wellness Seekers": 72, "Busy Professionals": 48, "Health-Conscious Parents": 55, "Active Seniors": 68 } },
      { metric: "Organic Food", values: { "Fitness Enthusiasts": 72, "Wellness Seekers": 82, "Busy Professionals": 38, "Health-Conscious Parents": 75, "Active Seniors": 58 } },
      { metric: "Preventive Care", values: { "Fitness Enthusiasts": 65, "Wellness Seekers": 78, "Busy Professionals": 42, "Health-Conscious Parents": 72, "Active Seniors": 88 } },
    ],
  },
  "9": {
    id: "9",
    name: "Luxury Brand Perception Matrix",
    audiences: ["Fashion", "Automotive", "Watches", "Travel", "Beauty", "Tech"],
    metrics: ["Exclusivity", "Craftsmanship", "Heritage", "Innovation", "Sustainability", "Status Symbol", "Value Retention", "Personal Expression"],
    lastModified: "12 hours ago",
    views: 645,
    createdBy: "Isabella Martinez",
    description: "Category-level analysis of luxury brand perception drivers with importance weighting for positioning strategy",
    dataSource: "GWI Luxury Q4 2024",
    data: [
      { metric: "Exclusivity", values: { "Fashion": 85, "Automotive": 78, "Watches": 92, "Travel": 72, "Beauty": 68, "Tech": 55 } },
      { metric: "Craftsmanship", values: { "Fashion": 78, "Automotive": 88, "Watches": 95, "Travel": 62, "Beauty": 72, "Tech": 65 } },
      { metric: "Heritage", values: { "Fashion": 82, "Automotive": 85, "Watches": 92, "Travel": 58, "Beauty": 75, "Tech": 35 } },
      { metric: "Innovation", values: { "Fashion": 55, "Automotive": 82, "Watches": 48, "Travel": 65, "Beauty": 72, "Tech": 95 } },
      { metric: "Sustainability", values: { "Fashion": 68, "Automotive": 72, "Watches": 45, "Travel": 78, "Beauty": 82, "Tech": 58 } },
      { metric: "Status Symbol", values: { "Fashion": 88, "Automotive": 92, "Watches": 85, "Travel": 75, "Beauty": 62, "Tech": 78 } },
      { metric: "Value Retention", values: { "Fashion": 42, "Automotive": 55, "Watches": 88, "Travel": 25, "Beauty": 28, "Tech": 35 } },
      { metric: "Personal Expression", values: { "Fashion": 92, "Automotive": 78, "Watches": 72, "Travel": 85, "Beauty": 88, "Tech": 68 } },
    ],
  },
  "10": {
    id: "10",
    name: "Content Format Preferences by Platform",
    audiences: ["TikTok", "Instagram", "YouTube", "Facebook", "LinkedIn", "Twitter/X"],
    metrics: ["Short Video (<60s)", "Long Video (>10min)", "Stories/Reels", "Static Images", "Carousels", "Live Streams", "Text Posts", "Podcasts/Audio"],
    lastModified: "2 hours ago",
    views: 1123,
    createdBy: "Noah Williams",
    description: "Platform-specific content format performance analysis with engagement rate benchmarks and algorithm optimization insights",
    dataSource: "GWI Social Q4 2024",
    data: [
      { metric: "Short Video (<60s)", values: { "TikTok": 95, "Instagram": 82, "YouTube": 68, "Facebook": 55, "LinkedIn": 35, "Twitter/X": 48 } },
      { metric: "Long Video (>10min)", values: { "TikTok": 22, "Instagram": 28, "YouTube": 92, "Facebook": 45, "LinkedIn": 42, "Twitter/X": 25 } },
      { metric: "Stories/Reels", values: { "TikTok": 88, "Instagram": 92, "YouTube": 55, "Facebook": 62, "LinkedIn": 28, "Twitter/X": 18 } },
      { metric: "Static Images", values: { "TikTok": 15, "Instagram": 75, "YouTube": 35, "Facebook": 72, "LinkedIn": 68, "Twitter/X": 65 } },
      { metric: "Carousels", values: { "TikTok": 35, "Instagram": 85, "YouTube": 25, "Facebook": 58, "LinkedIn": 78, "Twitter/X": 42 } },
      { metric: "Live Streams", values: { "TikTok": 72, "Instagram": 55, "YouTube": 78, "Facebook": 48, "LinkedIn": 35, "Twitter/X": 42 } },
      { metric: "Text Posts", values: { "TikTok": 8, "Instagram": 25, "YouTube": 18, "Facebook": 68, "LinkedIn": 88, "Twitter/X": 92 } },
      { metric: "Podcasts/Audio", values: { "TikTok": 12, "Instagram": 18, "YouTube": 72, "Facebook": 28, "LinkedIn": 35, "Twitter/X": 22 } },
    ],
  },
}

export default function CrosstabDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [isExporting, setIsExporting] = useState(false)
  const crosstab = crosstabData[id]

  if (!crosstab) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/crosstabs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Crosstab Not Found</h1>
            <p className="text-muted-foreground mt-1">The requested crosstab could not be found</p>
          </div>
        </div>
        <Card className="p-12 text-center">
          <Table2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Crosstab not found</h2>
          <p className="text-muted-foreground mb-4">
            The crosstab you're looking for doesn't exist or has been deleted.
          </p>
          <Link href="/dashboard/crosstabs">
            <Button>Back to Crosstabs</Button>
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
          <Link href="/dashboard/crosstabs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{crosstab.name}</h1>
            <p className="text-muted-foreground mt-1">{crosstab.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-transparent">
            <BarChart3 className="h-4 w-4 mr-2" />
            Visualize
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent" onClick={handleExport} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
          <Link href={`/dashboard/crosstabs/new?edit=${crosstab.id}`}>
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
              <DropdownMenuItem>Add to Report</DropdownMenuItem>
              <DropdownMenuItem>Save as Template</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>Modified {crosstab.lastModified}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          <span>{crosstab.views} views</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>Created by {crosstab.createdBy}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Table */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Metric</TableHead>
                    {crosstab.audiences.map((audience) => (
                      <TableHead key={audience} className="text-center font-semibold">
                        {audience}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {crosstab.data.map((row) => (
                    <TableRow key={row.metric}>
                      <TableCell className="font-medium">{row.metric}</TableCell>
                      {crosstab.audiences.map((audience) => (
                        <TableCell key={audience} className="text-center">
                          <span className={`font-mono ${row.values[audience] >= 70 ? "text-emerald-600 font-semibold" : row.values[audience] <= 30 ? "text-amber-600" : ""}`}>
                            {row.values[audience]}%
                          </span>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Crosstab Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Audiences</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {crosstab.audiences.map((audience) => (
                    <Badge key={audience} variant="secondary" className="text-xs">
                      {audience}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Metrics</p>
                <p className="font-medium">{crosstab.metrics.length} metrics</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export as Excel
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export as CSV
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <BarChart3 className="h-4 w-4 mr-2" />
                Create Chart
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
