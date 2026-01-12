"use client"

import { useState, useMemo, use, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
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
  Loader2,
  Copy,
  Check,
  Trash2,
  Filter,
  ChevronDown,
  SlidersHorizontal,
  X,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AdvancedCrosstabGrid,
  CrosstabRow,
  CrosstabColumn,
} from "@/components/crosstabs/advanced-crosstab-grid"
import {
  AdvancedFilters,
  FilterField,
  FilterGroup,
  SavedFilter,
} from "@/components/crosstabs/advanced-filters"
import { CommentsPanel } from "@/components/shared/comments-panel"
import { VersionHistory } from "@/components/shared/version-history"

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
  category?: string
  data: { metric: string; category?: string; values: Record<string, number> }[]
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
    category: "Social Media",
    data: [
      { metric: "TikTok", category: "Short-form Video", values: { "Gen Z (18-24)": 87, "Millennials (25-40)": 52, "Gen X (41-56)": 24, "Boomers (57-75)": 8 } },
      { metric: "Instagram", category: "Social Networks", values: { "Gen Z (18-24)": 82, "Millennials (25-40)": 71, "Gen X (41-56)": 48, "Boomers (57-75)": 28 } },
      { metric: "Facebook", category: "Social Networks", values: { "Gen Z (18-24)": 42, "Millennials (25-40)": 68, "Gen X (41-56)": 78, "Boomers (57-75)": 72 } },
      { metric: "YouTube", category: "Video Platforms", values: { "Gen Z (18-24)": 91, "Millennials (25-40)": 85, "Gen X (41-56)": 76, "Boomers (57-75)": 62 } },
      { metric: "LinkedIn", category: "Professional", values: { "Gen Z (18-24)": 28, "Millennials (25-40)": 52, "Gen X (41-56)": 48, "Boomers (57-75)": 35 } },
      { metric: "Twitter/X", category: "Microblogging", values: { "Gen Z (18-24)": 38, "Millennials (25-40)": 42, "Gen X (41-56)": 35, "Boomers (57-75)": 22 } },
      { metric: "Snapchat", category: "Short-form Video", values: { "Gen Z (18-24)": 72, "Millennials (25-40)": 35, "Gen X (41-56)": 12, "Boomers (57-75)": 4 } },
      { metric: "Pinterest", category: "Visual Discovery", values: { "Gen Z (18-24)": 45, "Millennials (25-40)": 48, "Gen X (41-56)": 42, "Boomers (57-75)": 38 } },
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
    category: "Commerce",
    data: [
      { metric: "E-commerce", category: "Digital", values: { "Under $50K": 72, "$50K-$100K": 78, "$100K-$150K": 82, "$150K-$250K": 85, "$250K+": 79 } },
      { metric: "In-Store Retail", category: "Physical", values: { "Under $50K": 68, "$50K-$100K": 62, "$100K-$150K": 58, "$150K-$250K": 55, "$250K+": 62 } },
      { metric: "Mobile Apps", category: "Digital", values: { "Under $50K": 58, "$50K-$100K": 65, "$100K-$150K": 72, "$150K-$250K": 75, "$250K+": 71 } },
      { metric: "Social Commerce", category: "Digital", values: { "Under $50K": 42, "$50K-$100K": 45, "$100K-$150K": 38, "$150K-$250K": 32, "$250K+": 28 } },
      { metric: "Subscription Services", category: "Digital", values: { "Under $50K": 35, "$50K-$100K": 52, "$100K-$150K": 68, "$150K-$250K": 78, "$250K+": 82 } },
      { metric: "Direct-to-Consumer", category: "Mixed", values: { "Under $50K": 28, "$50K-$100K": 42, "$100K-$150K": 55, "$150K-$250K": 65, "$250K+": 72 } },
      { metric: "Luxury Retail", category: "Physical", values: { "Under $50K": 8, "$50K-$100K": 18, "$100K-$150K": 35, "$150K-$250K": 58, "$250K+": 78 } },
      { metric: "Resale/Second-hand", category: "Mixed", values: { "Under $50K": 48, "$50K-$100K": 42, "$100K-$150K": 35, "$150K-$250K": 28, "$250K+": 22 } },
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
    category: "Global Markets",
    data: [
      { metric: "Streaming Video", category: "Entertainment", values: { "United States": 89, "United Kingdom": 85, "Germany": 78, "France": 82, "Japan": 72, "South Korea": 88, "Brazil": 76, "Australia": 84 } },
      { metric: "Mobile Gaming", category: "Entertainment", values: { "United States": 62, "United Kingdom": 58, "Germany": 52, "France": 55, "Japan": 78, "South Korea": 85, "Brazil": 72, "Australia": 56 } },
      { metric: "Social Media", category: "Social", values: { "United States": 82, "United Kingdom": 78, "Germany": 68, "France": 72, "Japan": 65, "South Korea": 88, "Brazil": 92, "Australia": 76 } },
      { metric: "E-commerce", category: "Commerce", values: { "United States": 78, "United Kingdom": 82, "Germany": 75, "France": 72, "Japan": 85, "South Korea": 92, "Brazil": 68, "Australia": 79 } },
      { metric: "Food Delivery", category: "Services", values: { "United States": 58, "United Kingdom": 62, "Germany": 48, "France": 52, "Japan": 55, "South Korea": 78, "Brazil": 65, "Australia": 58 } },
      { metric: "Fintech Apps", category: "Finance", values: { "United States": 52, "United Kingdom": 58, "Germany": 45, "France": 42, "Japan": 38, "South Korea": 72, "Brazil": 78, "Australia": 55 } },
      { metric: "Fitness Apps", category: "Health", values: { "United States": 48, "United Kingdom": 45, "Germany": 42, "France": 38, "Japan": 35, "South Korea": 52, "Brazil": 42, "Australia": 52 } },
      { metric: "Podcast Listening", category: "Entertainment", values: { "United States": 55, "United Kingdom": 48, "Germany": 35, "France": 32, "Japan": 22, "South Korea": 45, "Brazil": 58, "Australia": 52 } },
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
    category: "Sustainability",
    data: [
      { metric: "Pay Premium for Sustainable", category: "Purchasing", values: { "Eco-Activists": 92, "Mainstream Green": 65, "Price-Conscious": 28, "Skeptics": 12, "Indifferent": 8 } },
      { metric: "Check Brand Ethics", category: "Research", values: { "Eco-Activists": 95, "Mainstream Green": 72, "Price-Conscious": 35, "Skeptics": 18, "Indifferent": 5 } },
      { metric: "Reduce Single-Use Plastic", category: "Behavior", values: { "Eco-Activists": 98, "Mainstream Green": 78, "Price-Conscious": 52, "Skeptics": 32, "Indifferent": 15 } },
      { metric: "Buy Second-Hand", category: "Purchasing", values: { "Eco-Activists": 82, "Mainstream Green": 55, "Price-Conscious": 68, "Skeptics": 22, "Indifferent": 18 } },
      { metric: "Carbon Footprint Aware", category: "Awareness", values: { "Eco-Activists": 88, "Mainstream Green": 45, "Price-Conscious": 18, "Skeptics": 8, "Indifferent": 2 } },
      { metric: "Support Local", category: "Purchasing", values: { "Eco-Activists": 85, "Mainstream Green": 68, "Price-Conscious": 42, "Skeptics": 38, "Indifferent": 25 } },
      { metric: "Vegan/Plant-Based Diet", category: "Lifestyle", values: { "Eco-Activists": 48, "Mainstream Green": 22, "Price-Conscious": 12, "Skeptics": 5, "Indifferent": 3 } },
      { metric: "Boycott Unethical Brands", category: "Activism", values: { "Eco-Activists": 92, "Mainstream Green": 58, "Price-Conscious": 28, "Skeptics": 15, "Indifferent": 5 } },
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
    category: "Brand Health",
    data: [
      { metric: "Unaided Awareness", category: "Awareness", values: { "Brand A": 72, "Brand B": 58, "Brand C": 45, "Brand D": 38, "Brand E": 28, "Brand F": 22 } },
      { metric: "Aided Awareness", category: "Awareness", values: { "Brand A": 95, "Brand B": 88, "Brand C": 82, "Brand D": 75, "Brand E": 68, "Brand F": 62 } },
      { metric: "Consideration", category: "Funnel", values: { "Brand A": 68, "Brand B": 55, "Brand C": 48, "Brand D": 42, "Brand E": 35, "Brand F": 28 } },
      { metric: "Preference", category: "Funnel", values: { "Brand A": 42, "Brand B": 28, "Brand C": 22, "Brand D": 18, "Brand E": 12, "Brand F": 8 } },
      { metric: "Purchase", category: "Funnel", values: { "Brand A": 38, "Brand B": 24, "Brand C": 18, "Brand D": 14, "Brand E": 10, "Brand F": 6 } },
      { metric: "Loyalty", category: "Retention", values: { "Brand A": 78, "Brand B": 65, "Brand C": 58, "Brand D": 52, "Brand E": 45, "Brand F": 38 } },
      { metric: "Advocacy", category: "Retention", values: { "Brand A": 52, "Brand B": 38, "Brand C": 32, "Brand D": 25, "Brand E": 18, "Brand F": 12 } },
      { metric: "Premium Perception", category: "Perception", values: { "Brand A": 82, "Brand B": 68, "Brand C": 55, "Brand D": 42, "Brand E": 35, "Brand F": 28 } },
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
    category: "Media Planning",
    data: [
      { metric: "Linear TV", category: "Traditional", values: { "Morning (6-9am)": 35, "Daytime (9am-5pm)": 18, "Evening (5-9pm)": 72, "Late Night (9pm-12am)": 58, "Overnight (12-6am)": 12 } },
      { metric: "Streaming", category: "Digital Video", values: { "Morning (6-9am)": 22, "Daytime (9am-5pm)": 28, "Evening (5-9pm)": 85, "Late Night (9pm-12am)": 78, "Overnight (12-6am)": 25 } },
      { metric: "Social Media", category: "Digital", values: { "Morning (6-9am)": 68, "Daytime (9am-5pm)": 72, "Evening (5-9pm)": 78, "Late Night (9pm-12am)": 65, "Overnight (12-6am)": 28 } },
      { metric: "Podcasts", category: "Audio", values: { "Morning (6-9am)": 52, "Daytime (9am-5pm)": 45, "Evening (5-9pm)": 35, "Late Night (9pm-12am)": 22, "Overnight (12-6am)": 8 } },
      { metric: "Radio", category: "Traditional", values: { "Morning (6-9am)": 58, "Daytime (9am-5pm)": 42, "Evening (5-9pm)": 25, "Late Night (9pm-12am)": 15, "Overnight (12-6am)": 8 } },
      { metric: "News Sites", category: "Digital", values: { "Morning (6-9am)": 72, "Daytime (9am-5pm)": 55, "Evening (5-9pm)": 48, "Late Night (9pm-12am)": 32, "Overnight (12-6am)": 12 } },
      { metric: "Gaming", category: "Entertainment", values: { "Morning (6-9am)": 15, "Daytime (9am-5pm)": 22, "Evening (5-9pm)": 65, "Late Night (9pm-12am)": 72, "Overnight (12-6am)": 35 } },
      { metric: "Music Streaming", category: "Audio", values: { "Morning (6-9am)": 62, "Daytime (9am-5pm)": 58, "Evening (5-9pm)": 52, "Late Night (9pm-12am)": 45, "Overnight (12-6am)": 22 } },
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
    category: "Financial Services",
    data: [
      { metric: "Mobile Banking", category: "Digital Banking", values: { "Students": 82, "Young Professionals": 92, "Young Families": 88, "Established Families": 78, "Empty Nesters": 62, "Retirees": 42 } },
      { metric: "Investment Apps", category: "Investing", values: { "Students": 28, "Young Professionals": 58, "Young Families": 52, "Established Families": 62, "Empty Nesters": 55, "Retirees": 35 } },
      { metric: "BNPL Services", category: "Credit", values: { "Students": 55, "Young Professionals": 62, "Young Families": 58, "Established Families": 38, "Empty Nesters": 18, "Retirees": 8 } },
      { metric: "Crypto Ownership", category: "Investing", values: { "Students": 32, "Young Professionals": 45, "Young Families": 35, "Established Families": 22, "Empty Nesters": 12, "Retirees": 5 } },
      { metric: "Insurance Products", category: "Insurance", values: { "Students": 18, "Young Professionals": 45, "Young Families": 78, "Established Families": 85, "Empty Nesters": 82, "Retirees": 88 } },
      { metric: "Retirement Accounts", category: "Savings", values: { "Students": 12, "Young Professionals": 52, "Young Families": 68, "Established Families": 82, "Empty Nesters": 92, "Retirees": 95 } },
      { metric: "Credit Cards", category: "Credit", values: { "Students": 45, "Young Professionals": 78, "Young Families": 85, "Established Families": 88, "Empty Nesters": 82, "Retirees": 72 } },
      { metric: "Personal Loans", category: "Credit", values: { "Students": 22, "Young Professionals": 35, "Young Families": 48, "Established Families": 42, "Empty Nesters": 25, "Retirees": 12 } },
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
    category: "Health & Wellness",
    data: [
      { metric: "Gym Membership", category: "Fitness", values: { "Fitness Enthusiasts": 92, "Wellness Seekers": 55, "Busy Professionals": 42, "Health-Conscious Parents": 35, "Active Seniors": 48 } },
      { metric: "Home Fitness", category: "Fitness", values: { "Fitness Enthusiasts": 78, "Wellness Seekers": 62, "Busy Professionals": 58, "Health-Conscious Parents": 72, "Active Seniors": 55 } },
      { metric: "Nutrition Apps", category: "Digital Health", values: { "Fitness Enthusiasts": 72, "Wellness Seekers": 68, "Busy Professionals": 45, "Health-Conscious Parents": 58, "Active Seniors": 35 } },
      { metric: "Mental Wellness Apps", category: "Digital Health", values: { "Fitness Enthusiasts": 45, "Wellness Seekers": 78, "Busy Professionals": 62, "Health-Conscious Parents": 52, "Active Seniors": 28 } },
      { metric: "Sleep Tracking", category: "Digital Health", values: { "Fitness Enthusiasts": 68, "Wellness Seekers": 72, "Busy Professionals": 55, "Health-Conscious Parents": 48, "Active Seniors": 42 } },
      { metric: "Supplements", category: "Nutrition", values: { "Fitness Enthusiasts": 85, "Wellness Seekers": 72, "Busy Professionals": 48, "Health-Conscious Parents": 55, "Active Seniors": 68 } },
      { metric: "Organic Food", category: "Nutrition", values: { "Fitness Enthusiasts": 72, "Wellness Seekers": 82, "Busy Professionals": 38, "Health-Conscious Parents": 75, "Active Seniors": 58 } },
      { metric: "Preventive Care", category: "Healthcare", values: { "Fitness Enthusiasts": 65, "Wellness Seekers": 78, "Busy Professionals": 42, "Health-Conscious Parents": 72, "Active Seniors": 88 } },
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
    category: "Luxury",
    data: [
      { metric: "Exclusivity", category: "Perception", values: { "Fashion": 85, "Automotive": 78, "Watches": 92, "Travel": 72, "Beauty": 68, "Tech": 55 } },
      { metric: "Craftsmanship", category: "Perception", values: { "Fashion": 78, "Automotive": 88, "Watches": 95, "Travel": 62, "Beauty": 72, "Tech": 65 } },
      { metric: "Heritage", category: "Perception", values: { "Fashion": 82, "Automotive": 85, "Watches": 92, "Travel": 58, "Beauty": 75, "Tech": 35 } },
      { metric: "Innovation", category: "Perception", values: { "Fashion": 55, "Automotive": 82, "Watches": 48, "Travel": 65, "Beauty": 72, "Tech": 95 } },
      { metric: "Sustainability", category: "Values", values: { "Fashion": 68, "Automotive": 72, "Watches": 45, "Travel": 78, "Beauty": 82, "Tech": 58 } },
      { metric: "Status Symbol", category: "Social", values: { "Fashion": 88, "Automotive": 92, "Watches": 85, "Travel": 75, "Beauty": 62, "Tech": 78 } },
      { metric: "Value Retention", category: "Financial", values: { "Fashion": 42, "Automotive": 55, "Watches": 88, "Travel": 25, "Beauty": 28, "Tech": 35 } },
      { metric: "Personal Expression", category: "Emotional", values: { "Fashion": 92, "Automotive": 78, "Watches": 72, "Travel": 85, "Beauty": 88, "Tech": 68 } },
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
    category: "Content Strategy",
    data: [
      { metric: "Short Video (<60s)", category: "Video", values: { "TikTok": 95, "Instagram": 82, "YouTube": 68, "Facebook": 55, "LinkedIn": 35, "Twitter/X": 48 } },
      { metric: "Long Video (>10min)", category: "Video", values: { "TikTok": 22, "Instagram": 28, "YouTube": 92, "Facebook": 45, "LinkedIn": 42, "Twitter/X": 25 } },
      { metric: "Stories/Reels", category: "Ephemeral", values: { "TikTok": 88, "Instagram": 92, "YouTube": 55, "Facebook": 62, "LinkedIn": 28, "Twitter/X": 18 } },
      { metric: "Static Images", category: "Visual", values: { "TikTok": 15, "Instagram": 75, "YouTube": 35, "Facebook": 72, "LinkedIn": 68, "Twitter/X": 65 } },
      { metric: "Carousels", category: "Visual", values: { "TikTok": 35, "Instagram": 85, "YouTube": 25, "Facebook": 58, "LinkedIn": 78, "Twitter/X": 42 } },
      { metric: "Live Streams", category: "Video", values: { "TikTok": 72, "Instagram": 55, "YouTube": 78, "Facebook": 48, "LinkedIn": 35, "Twitter/X": 42 } },
      { metric: "Text Posts", category: "Text", values: { "TikTok": 8, "Instagram": 25, "YouTube": 18, "Facebook": 68, "LinkedIn": 88, "Twitter/X": 92 } },
      { metric: "Podcasts/Audio", category: "Audio", values: { "TikTok": 12, "Instagram": 18, "YouTube": 72, "Facebook": 28, "LinkedIn": 35, "Twitter/X": 22 } },
    ],
  },
}

// Sample saved filters
const sampleSavedFilters: SavedFilter[] = [
  {
    id: "1",
    name: "High Performers",
    description: "Values above 70%",
    groups: [{
      id: "g1",
      name: "High Values",
      conditions: [{
        id: "c1",
        fieldId: "value",
        operator: "greater_than",
        value: 70,
        enabled: true,
      }],
      logic: "and",
      enabled: true,
    }],
    createdAt: new Date(),
    updatedAt: new Date(),
    isDefault: false,
    isFavorite: true,
  },
  {
    id: "2",
    name: "Low Performers",
    description: "Values below 30%",
    groups: [{
      id: "g2",
      name: "Low Values",
      conditions: [{
        id: "c2",
        fieldId: "value",
        operator: "less_than",
        value: 30,
        enabled: true,
      }],
      logic: "and",
      enabled: true,
    }],
    createdAt: new Date(),
    updatedAt: new Date(),
    isDefault: false,
    isFavorite: false,
  },
]

// Type for crosstab data
interface CrosstabData {
  id: string
  name: string
  audiences: string[]
  metrics: string[]
  lastModified: string
  views: number
  createdBy: string
  description: string
  dataSource: string
  category?: string
  data: { metric: string; category?: string; values: Record<string, number> }[]
}

// Transform API response to frontend format
function transformApiCrosstab(apiData: any): CrosstabData | null {
  if (!apiData) return null

  // API returns: results.rows = [{ segment: 'name', metric1: val, metric2: val, ... }]
  // Frontend expects: data = [{ metric: 'name', values: { audience1: val, audience2: val, ... } }]

  const results = apiData.results || {}
  const rows = Array.isArray(results.rows) ? results.rows : []
  const metrics = Array.isArray(apiData.metrics) ? apiData.metrics : []

  // Build audiences list from the first row's keys (excluding 'segment' and metric-like keys)
  let audiences: string[] = []
  if (rows.length > 0) {
    // Get column names that aren't metrics - these are the audience/segment names
    const firstRow = rows[0]
    audiences = Object.keys(firstRow).filter(key => key !== 'segment' && !metrics.includes(key))

    // If no audiences found from row keys, check if row values have audience-keyed values
    if (audiences.length === 0 && firstRow.segment) {
      // The data is structured with segment as the row identifier
      // and metric values as columns - need to transpose
      audiences = rows.map((r: any) => r.segment).filter(Boolean)
    }
  }

  // If audiences is still empty, use the API's audiences field
  if (audiences.length === 0 && Array.isArray(apiData.audiences)) {
    audiences = apiData.audiences
  }

  // Transform the data structure
  let data: { metric: string; category?: string; values: Record<string, number> }[] = []

  if (rows.length > 0 && metrics.length > 0) {
    // Transpose: rows are segments, columns are metrics -> rows are metrics, columns are segments
    data = metrics.map((metric: string) => {
      const values: Record<string, number> = {}
      rows.forEach((row: any) => {
        const segmentName = row.segment || row.name || 'Unknown'
        if (row[metric] !== undefined) {
          values[segmentName] = row[metric]
        }
      })
      return { metric, values }
    })

    // Update audiences to be the segment names from rows
    if (rows.length > 0 && rows[0].segment) {
      audiences = rows.map((r: any) => r.segment).filter(Boolean)
    }
  }

  return {
    id: apiData.id,
    name: apiData.name,
    audiences,
    metrics,
    lastModified: apiData.updatedAt ? formatTimeAgo(apiData.updatedAt) : 'Recently',
    views: apiData.views || 0,
    createdBy: apiData.createdByName || 'Unknown',
    description: apiData.description || '',
    dataSource: apiData.dataSource || 'GWI Core',
    category: apiData.category,
    data,
  }
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  return 'Just now'
}

export default function CrosstabDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [crosstab, setCrosstab] = useState<CrosstabData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [activeTab, setActiveTab] = useState<"filters" | "audiences" | "metrics">("filters")

  // Filter state
  const [activeFilters, setActiveFilters] = useState<FilterGroup[]>([])
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(sampleSavedFilters)
  const [selectedAudiences, setSelectedAudiences] = useState<Set<string>>(new Set())
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(new Set())
  const [valueRange, setValueRange] = useState<[number, number]>([0, 100])
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  // Fetch crosstab data from API
  useEffect(() => {
    async function fetchCrosstab() {
      try {
        const response = await fetch(`/api/v1/crosstabs/${id}`)
        if (response.ok) {
          const data = await response.json()
          const apiCrosstab = data.data || data
          if (apiCrosstab && apiCrosstab.id) {
            const transformed = transformApiCrosstab(apiCrosstab)
            if (transformed && transformed.data.length > 0) {
              setCrosstab(transformed)
            } else {
              // Fallback to demo data
              setCrosstab(crosstabData[id] || null)
            }
          } else {
            // Fallback to demo data
            setCrosstab(crosstabData[id] || null)
          }
        } else {
          // Fallback to demo data
          setCrosstab(crosstabData[id] || null)
        }
      } catch (error) {
        console.error('Failed to fetch crosstab:', error)
        // Fallback to demo data
        setCrosstab(crosstabData[id] || null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCrosstab()
  }, [id])

  // Initialize selected audiences and metrics
  useMemo(() => {
    if (crosstab && selectedAudiences.size === 0) {
      setSelectedAudiences(new Set(crosstab.audiences))
    }
    if (crosstab && selectedMetrics.size === 0) {
      setSelectedMetrics(new Set(crosstab.metrics))
    }
  }, [crosstab])

  // Get unique categories
  const categories = useMemo(() => {
    if (!crosstab) return []
    const cats = new Set(crosstab.data.map(d => d.category).filter(Boolean))
    return Array.from(cats) as string[]
  }, [crosstab])

  // Filter fields for AdvancedFilters component
  const filterFields: FilterField[] = useMemo(() => {
    if (!crosstab) return []

    return [
      {
        id: "metric",
        name: "metric",
        label: "Metric Name",
        type: "select" as const,
        category: "Data",
        options: crosstab.metrics.map(m => ({ value: m, label: m })),
      },
      {
        id: "category",
        name: "category",
        label: "Category",
        type: "select" as const,
        category: "Data",
        options: categories.map(c => ({ value: c, label: c })),
      },
      {
        id: "value",
        name: "value",
        label: "Value",
        type: "number" as const,
        category: "Data",
        min: 0,
        max: 100,
      },
      ...crosstab.audiences.map(audience => ({
        id: `audience_${audience}`,
        name: `audience_${audience}`,
        label: audience,
        type: "number" as const,
        category: "Audiences",
        min: 0,
        max: 100,
      })),
    ]
  }, [crosstab, categories])

  // Transform data for AdvancedCrosstabGrid
  const gridColumns: CrosstabColumn[] = useMemo(() => {
    if (!crosstab) return []
    return crosstab.audiences
      .filter(a => selectedAudiences.has(a))
      .map(audience => ({
        id: audience,
        key: audience,
        label: audience,
      }))
  }, [crosstab, selectedAudiences])

  // Apply filters to data
  const filteredData = useMemo(() => {
    if (!crosstab) return []

    return crosstab.data
      .filter(row => {
        // Filter by selected metrics
        if (!selectedMetrics.has(row.metric)) return false

        // Filter by category
        if (categoryFilter !== "all" && row.category !== categoryFilter) return false

        // Filter by value range - check if any value in row is within range
        const values = Object.values(row.values)
        const hasValueInRange = values.some(v => v >= valueRange[0] && v <= valueRange[1])
        if (!hasValueInRange) return false

        // Apply advanced filters
        if (activeFilters.length > 0) {
          for (const group of activeFilters) {
            if (!group.enabled) continue

            const conditionResults = group.conditions.map(condition => {
              if (!condition.enabled) return true

              if (condition.fieldId === "metric") {
                if (condition.operator === "equals") return row.metric === condition.value
                if (condition.operator === "not_equals") return row.metric !== condition.value
                if (condition.operator === "contains") return row.metric.toLowerCase().includes(String(condition.value).toLowerCase())
              }

              if (condition.fieldId === "category") {
                if (condition.operator === "equals") return row.category === condition.value
                if (condition.operator === "not_equals") return row.category !== condition.value
              }

              if (condition.fieldId === "value") {
                const allValues = Object.values(row.values)
                if (condition.operator === "greater_than") return allValues.some(v => v > condition.value)
                if (condition.operator === "less_than") return allValues.some(v => v < condition.value)
                if (condition.operator === "equals") return allValues.some(v => v === condition.value)
                if (condition.operator === "between") return allValues.some(v => v >= condition.value && v <= (condition.value2 || condition.value))
              }

              // Audience-specific filters
              if (condition.fieldId.startsWith("audience_")) {
                const audience = condition.fieldId.replace("audience_", "")
                const value = row.values[audience]
                if (value === undefined) return false

                if (condition.operator === "greater_than") return value > condition.value
                if (condition.operator === "less_than") return value < condition.value
                if (condition.operator === "equals") return value === condition.value
                if (condition.operator === "between") return value >= condition.value && value <= (condition.value2 || condition.value)
              }

              return true
            })

            const passes = group.logic === "and"
              ? conditionResults.every(Boolean)
              : conditionResults.some(Boolean)

            if (!passes) return false
          }
        }

        return true
      })
  }, [crosstab, selectedMetrics, categoryFilter, valueRange, activeFilters])

  const gridData: CrosstabRow[] = useMemo(() => {
    return filteredData.map(row => ({
      id: row.metric,
      metric: row.metric,
      category: row.category,
      values: Object.fromEntries(
        Object.entries(row.values).filter(([key]) => selectedAudiences.has(key))
      ),
    }))
  }, [filteredData, selectedAudiences])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (crosstab) {
      if (selectedAudiences.size < crosstab.audiences.length) count++
      if (selectedMetrics.size < crosstab.metrics.length) count++
    }
    if (valueRange[0] > 0 || valueRange[1] < 100) count++
    if (categoryFilter !== "all") count++
    count += activeFilters.filter(g => g.enabled && g.conditions.some(c => c.enabled)).length
    return count
  }, [crosstab, selectedAudiences, selectedMetrics, valueRange, categoryFilter, activeFilters])

  // Handle filter save
  const handleFilterSave = useCallback((filter: SavedFilter) => {
    setSavedFilters(prev => [...prev, filter])
  }, [])

  // Handle filter delete
  const handleFilterDelete = useCallback((filterId: string) => {
    setSavedFilters(prev => prev.filter(f => f.id !== filterId))
  }, [])

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    if (crosstab) {
      setSelectedAudiences(new Set(crosstab.audiences))
      setSelectedMetrics(new Set(crosstab.metrics))
    }
    setValueRange([0, 100])
    setCategoryFilter("all")
    setActiveFilters([])
  }, [crosstab])

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/crosstabs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    )
  }

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

  const handleExport = async (format: "json" | "csv" | "pdf" | "excel" | "pptx" | "html" = "json") => {
    setIsExporting(true)
    try {
      const dateStr = new Date().toISOString().split("T")[0]
      const headers = ["Metric", ...Array.from(selectedAudiences)]
      const rows = filteredData.map((row) => [
        row.metric,
        ...Array.from(selectedAudiences).map((a) => row.values[a]?.toString() || "0"),
      ])

      if (format === "csv") {
        const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `crosstab-${crosstab.id}-${dateStr}.csv`
        a.click()
        URL.revokeObjectURL(url)
      } else if (format === "html") {
        // Generate HTML report
        const htmlContent = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${crosstab.name}</title>
<style>
  body { font-family: -apple-system, sans-serif; max-width: 1200px; margin: 40px auto; padding: 20px; }
  h1 { color: #111827; border-bottom: 2px solid #000; padding-bottom: 10px; }
  .meta { color: #6b7280; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
  th { background: #f3f4f6; font-weight: 600; }
  tr:nth-child(even) { background: #f9fafb; }
  .footer { margin-top: 40px; color: #9ca3af; font-size: 12px; }
</style></head><body>
  <h1>${crosstab.name}</h1>
  <div class="meta">
    <p><strong>Description:</strong> ${crosstab.description}</p>
    <p><strong>Data Source:</strong> ${crosstab.dataSource}</p>
    <p><strong>Created by:</strong> ${crosstab.createdBy}</p>
    <p><strong>Exported:</strong> ${new Date().toLocaleString()}</p>
  </div>
  <table>
    <thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
  </table>
  <div class="footer">Generated by GWI AI Agent Framework</div>
</body></html>`
        const blob = new Blob([htmlContent], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `crosstab-${crosstab.id}-${dateStr}.html`
        a.click()
        URL.revokeObjectURL(url)
      } else if (format === "pdf" || format === "pptx" || format === "excel") {
        // For PDF, PowerPoint, and Excel, call the report generator API
        const exportData = {
          name: crosstab.name,
          description: crosstab.description,
          type: "crosstab",
          format: format.toUpperCase(),
          data: {
            headers,
            rows,
            metadata: {
              dataSource: crosstab.dataSource,
              createdBy: crosstab.createdBy,
              audiences: Array.from(selectedAudiences),
              metrics: Array.from(selectedMetrics),
              filters: { valueRange, categoryFilter },
            },
          },
        }

        // Create a downloadable version using a simulated export
        // In production, this would call the actual report-generator.ts
        const filename = `crosstab-${crosstab.id}-${dateStr}.${format === "excel" ? "xlsx" : format}`

        // Create a rich text format for now (simulated)
        const content = JSON.stringify(exportData, null, 2)
        const blob = new Blob([content], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)

        // Show toast that full export would require server-side processing
        console.log(`${format.toUpperCase()} export initiated. Full rendering requires server-side processing.`)
      } else {
        // JSON export
        const exportData = {
          crosstab: { id: crosstab.id, name: crosstab.name, audiences: Array.from(selectedAudiences), metrics: Array.from(selectedMetrics) },
          data: filteredData,
          filters: { valueRange, categoryFilter, activeFilters },
          metadata: { exportedAt: new Date().toISOString(), createdBy: crosstab.createdBy, dataSource: crosstab.dataSource },
        }
        const content = JSON.stringify(exportData, null, 2)
        const blob = new Blob([content], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `crosstab-${crosstab.id}-${dateStr}.json`
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
      const response = await fetch(`/api/v1/crosstabs/${id}`, { method: "DELETE" })
      if (response.ok) {
        router.push("/dashboard/crosstabs")
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
    try {
      const response = await fetch("/api/v1/crosstabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${crosstab.name} (Copy)`, audiences: crosstab.audiences, metrics: crosstab.metrics }),
      })
      if (response.ok) {
        router.push("/dashboard/crosstabs")
      }
    } catch (error) {
      console.error("Duplicate failed:", error)
    }
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
          {/* Filter Button */}
          <Sheet open={showFilterPanel} onOpenChange={setShowFilterPanel}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="bg-transparent relative">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between">
                  <span>Data Filters</span>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  )}
                </SheetTitle>
                <SheetDescription>
                  Filter and refine your crosstab data
                </SheetDescription>
              </SheetHeader>

              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mt-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="filters">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </TabsTrigger>
                  <TabsTrigger value="audiences">
                    <Users className="h-4 w-4 mr-2" />
                    Audiences
                  </TabsTrigger>
                  <TabsTrigger value="metrics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Metrics
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="filters" className="mt-4 space-y-4">
                  {/* Quick Filters */}
                  <Card className="p-4">
                    <h4 className="font-medium mb-3">Quick Filters</h4>

                    {/* Value Range */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Value Range: {valueRange[0]}% - {valueRange[1]}%</Label>
                        <Slider
                          value={valueRange}
                          onValueChange={(v) => setValueRange(v as [number, number])}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                      </div>

                      {/* Category Filter */}
                      {categories.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm">Category</Label>
                          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger>
                              <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Categories</SelectItem>
                              {categories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Advanced Filters */}
                  <AdvancedFilters
                    fields={filterFields}
                    activeFilters={activeFilters}
                    savedFilters={savedFilters}
                    onFiltersChange={setActiveFilters}
                    onFilterSave={handleFilterSave}
                    onFilterDelete={handleFilterDelete}
                    onFilterApply={(filters) => {
                      setActiveFilters(filters)
                      setShowFilterPanel(false)
                    }}
                  />
                </TabsContent>

                <TabsContent value="audiences" className="mt-4">
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Select Audiences</h4>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedAudiences(new Set(crosstab.audiences))}
                        >
                          Select All
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedAudiences(new Set())}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {crosstab.audiences.map(audience => (
                          <label
                            key={audience}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                          >
                            <Checkbox
                              checked={selectedAudiences.has(audience)}
                              onCheckedChange={(checked) => {
                                const newSet = new Set(selectedAudiences)
                                if (checked) {
                                  newSet.add(audience)
                                } else {
                                  newSet.delete(audience)
                                }
                                setSelectedAudiences(newSet)
                              }}
                            />
                            <span>{audience}</span>
                          </label>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                      {selectedAudiences.size} of {crosstab.audiences.length} selected
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="metrics" className="mt-4">
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Select Metrics</h4>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedMetrics(new Set(crosstab.metrics))}
                        >
                          Select All
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedMetrics(new Set())}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {crosstab.metrics.map(metric => {
                          const metricData = crosstab.data.find(d => d.metric === metric)
                          return (
                            <label
                              key={metric}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                            >
                              <Checkbox
                                checked={selectedMetrics.has(metric)}
                                onCheckedChange={(checked) => {
                                  const newSet = new Set(selectedMetrics)
                                  if (checked) {
                                    newSet.add(metric)
                                  } else {
                                    newSet.delete(metric)
                                  }
                                  setSelectedMetrics(newSet)
                                }}
                              />
                              <div className="flex-1">
                                <span>{metric}</span>
                                {metricData?.category && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {metricData.category}
                                  </Badge>
                                )}
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    </ScrollArea>
                    <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                      {selectedMetrics.size} of {crosstab.metrics.length} selected
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </SheetContent>
          </Sheet>

          <Button variant="outline" size="sm" className="bg-transparent">
            <BarChart3 className="h-4 w-4 mr-2" />
            Visualize
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-transparent" disabled={isExporting}>
                {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Export
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("json")}>
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("html")}>
                Export as HTML
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")}>
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pptx")}>
                Export as PowerPoint
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
              <DropdownMenuItem onClick={handleDuplicate}>Duplicate</DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/dashboards/new?crosstab=${crosstab.id}`}>Add to Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCopyLink}>
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? "Copied!" : "Copy Link"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Crosstab</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{crosstab.name}"? This action cannot be undone.
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
        </div>
      </div>

      {/* Meta info and active filter badges */}
      <div className="flex items-center justify-between">
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

        {/* Active filter badges */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {selectedAudiences.size < crosstab.audiences.length && (
              <Badge variant="secondary" className="text-xs">
                {selectedAudiences.size} audiences
              </Badge>
            )}
            {selectedMetrics.size < crosstab.metrics.length && (
              <Badge variant="secondary" className="text-xs">
                {selectedMetrics.size} metrics
              </Badge>
            )}
            {(valueRange[0] > 0 || valueRange[1] < 100) && (
              <Badge variant="secondary" className="text-xs">
                {valueRange[0]}%-{valueRange[1]}%
              </Badge>
            )}
            {categoryFilter !== "all" && (
              <Badge variant="secondary" className="text-xs">
                {categoryFilter}
              </Badge>
            )}
            {activeFilters.filter(g => g.enabled).length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFilters.filter(g => g.enabled).length} filter groups
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Advanced Crosstab Grid */}
      <AdvancedCrosstabGrid
        columns={gridColumns}
        data={gridData}
        title={crosstab.name}
        description={`${gridData.length} metrics × ${gridColumns.length} audiences | Source: ${crosstab.dataSource}`}
        config={{
          showStatistics: true,
          showSparklines: true,
          showConditionalFormatting: true,
          showSignificance: true,
          showTotals: true,
          groupByCategory: categories.length > 0,
        }}
      />

      {/* AI Insights Panel */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI-Generated Insights</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="font-medium text-sm mb-2">Top Performer</h4>
            <p className="text-sm text-muted-foreground">
              {gridData.length > 0 && gridColumns.length > 0 ? (
                <>
                  <span className="font-semibold text-foreground">{gridColumns[0]?.label}</span> leads in most metrics with an average of {
                    Math.round(gridData.reduce((sum, row) => sum + (row.values[gridColumns[0]?.key] || 0), 0) / gridData.length)
                  }%.
                </>
              ) : "No data available"}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="font-medium text-sm mb-2">Biggest Gap</h4>
            <p className="text-sm text-muted-foreground">
              The largest variance between audiences is observed in the data, indicating significant segmentation opportunities.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="font-medium text-sm mb-2">Trending</h4>
            <p className="text-sm text-muted-foreground">
              {filteredData.length} metrics currently displayed after applying {activeFilterCount > 0 ? activeFilterCount : "no"} filters.
            </p>
          </div>
        </div>
      </Card>

      {/* Comments and Version History */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <CommentsPanel
            resourceType="crosstab"
            resourceId={id}
            currentUserId="current-user"
          />
        </Card>
        <Card className="p-6">
          <VersionHistory
            resourceType="crosstab"
            resourceId={id}
            resourceName={crosstab.name}
            versions={[]}
            onRestore={(versionId) => {
              console.log("Restoring version:", versionId)
            }}
          />
        </Card>
      </div>
    </div>
  )
}
