"use client"

import { useState, useEffect, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Coffee,
  Briefcase,
  Utensils,
  Dumbbell,
  ShoppingCart,
  Tv,
  Smartphone,
  MessageSquare,
  Mail,
  Music,
  BookOpen,
  Car,
  Train,
  Home,
  Users,
  Heart,
  Loader2,
  Clock,
  MapPin,
  Zap,
  Target,
  Headphones,
  Laptop,
  Gamepad2,
  Baby,
  Dog,
  Bed,
  Bath,
  ChefHat,
  Newspaper,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Linkedin,
  Podcast,
  Globe,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Activity types
export interface DailyActivity {
  id: string
  time: string
  timeSlot: "early_morning" | "morning" | "midday" | "afternoon" | "evening" | "night"
  activity: string
  description: string
  duration: number // minutes
  location: "home" | "work" | "transit" | "gym" | "store" | "restaurant" | "outdoors" | "other"
  category: "routine" | "work" | "leisure" | "social" | "health" | "shopping" | "media" | "family"
  mood: "energized" | "focused" | "relaxed" | "stressed" | "happy" | "tired"
  devices: ("smartphone" | "laptop" | "tablet" | "tv" | "smartwatch" | "none")[]
  touchpoints: string[]
  icon: string
}

export interface MediaMoment {
  time: string
  platform: string
  content: string
  duration: number
  device: string
  engagement: "passive" | "active" | "interactive"
}

export interface DayProfile {
  dayType: "weekday" | "weekend"
  wakeTime: string
  sleepTime: string
  totalScreenTime: number
  activities: DailyActivity[]
  mediaMoments: MediaMoment[]
  peakProductivity: string
  peakEngagement: string
  moodPattern: { time: string; mood: number }[]
  deviceUsage: { device: string; minutes: number; percentage: number }[]
}

interface DayInTheLifeProps {
  audienceId: string
  audienceName: string
  audienceCriteria?: Record<string, unknown>
  className?: string
}

// Icons mapping
const activityIcons: Record<string, React.ReactNode> = {
  wake: <Sunrise className="h-4 w-4" />,
  sleep: <Moon className="h-4 w-4" />,
  coffee: <Coffee className="h-4 w-4" />,
  breakfast: <Utensils className="h-4 w-4" />,
  lunch: <Utensils className="h-4 w-4" />,
  dinner: <ChefHat className="h-4 w-4" />,
  work: <Briefcase className="h-4 w-4" />,
  meeting: <Users className="h-4 w-4" />,
  commute: <Car className="h-4 w-4" />,
  transit: <Train className="h-4 w-4" />,
  exercise: <Dumbbell className="h-4 w-4" />,
  shopping: <ShoppingCart className="h-4 w-4" />,
  tv: <Tv className="h-4 w-4" />,
  phone: <Smartphone className="h-4 w-4" />,
  social: <MessageSquare className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  music: <Music className="h-4 w-4" />,
  reading: <BookOpen className="h-4 w-4" />,
  home: <Home className="h-4 w-4" />,
  family: <Heart className="h-4 w-4" />,
  childcare: <Baby className="h-4 w-4" />,
  pet: <Dog className="h-4 w-4" />,
  gaming: <Gamepad2 className="h-4 w-4" />,
  podcast: <Headphones className="h-4 w-4" />,
  news: <Newspaper className="h-4 w-4" />,
  relaxation: <Bath className="h-4 w-4" />,
  bed: <Bed className="h-4 w-4" />,
}

const platformIcons: Record<string, React.ReactNode> = {
  Instagram: <Instagram className="h-4 w-4" />,
  YouTube: <Youtube className="h-4 w-4" />,
  Twitter: <Twitter className="h-4 w-4" />,
  Facebook: <Facebook className="h-4 w-4" />,
  LinkedIn: <Linkedin className="h-4 w-4" />,
  Spotify: <Music className="h-4 w-4" />,
  Netflix: <Tv className="h-4 w-4" />,
  Podcasts: <Podcast className="h-4 w-4" />,
  News: <Globe className="h-4 w-4" />,
  Email: <Mail className="h-4 w-4" />,
}

const timeSlotColors: Record<string, string> = {
  early_morning: "bg-indigo-500/10 border-indigo-500/30 text-indigo-600",
  morning: "bg-amber-500/10 border-amber-500/30 text-amber-600",
  midday: "bg-yellow-500/10 border-yellow-500/30 text-yellow-600",
  afternoon: "bg-orange-500/10 border-orange-500/30 text-orange-600",
  evening: "bg-purple-500/10 border-purple-500/30 text-purple-600",
  night: "bg-blue-500/10 border-blue-500/30 text-blue-600",
}

const categoryColors: Record<string, string> = {
  routine: "bg-slate-100 text-slate-700",
  work: "bg-blue-100 text-blue-700",
  leisure: "bg-green-100 text-green-700",
  social: "bg-pink-100 text-pink-700",
  health: "bg-red-100 text-red-700",
  shopping: "bg-amber-100 text-amber-700",
  media: "bg-purple-100 text-purple-700",
  family: "bg-rose-100 text-rose-700",
}

// Generate day profile based on audience criteria
function generateDayProfile(
  audienceId: string,
  _criteria?: Record<string, unknown>,
  dayType: "weekday" | "weekend" = "weekday"
): DayProfile {
  const seed = audienceId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const random = (index: number) => ((seed * (index + 1)) % 100) / 100

  // Parse criteria for context
  const hasKids = random(1) > 0.6
  const isUrban = random(2) > 0.4
  const isHealthy = random(3) > 0.5
  const isWorkFromHome = random(4) > 0.7
  const isTechSavvy = random(5) > 0.4

  // Determine wake/sleep times
  const wakeTime = dayType === "weekend"
    ? `${7 + Math.floor(random(6) * 2)}:${random(7) > 0.5 ? '00' : '30'} AM`
    : `${5 + Math.floor(random(8) * 2)}:${random(9) > 0.5 ? '00' : '30'} AM`

  const sleepTime = dayType === "weekend"
    ? `${10 + Math.floor(random(10) * 2)}:${random(11) > 0.5 ? '00' : '30'} PM`
    : `${10 + Math.floor(random(12))}:${random(13) > 0.5 ? '00' : '30'} PM`

  // Generate activities based on day type
  const weekdayActivities: DailyActivity[] = [
    {
      id: "1",
      time: "6:00 AM",
      timeSlot: "early_morning",
      activity: "Wake up & morning routine",
      description: "Alarm goes off, quick check of phone notifications, shower and get ready",
      duration: 45,
      location: "home",
      category: "routine",
      mood: "energized",
      devices: ["smartphone"],
      touchpoints: ["News app", "Weather app", "Email preview"],
      icon: "wake",
    },
    {
      id: "2",
      time: "6:45 AM",
      timeSlot: "early_morning",
      activity: "Breakfast & news",
      description: hasKids ? "Prepare breakfast for family, help kids get ready" : "Quick breakfast while catching up on news",
      duration: 30,
      location: "home",
      category: hasKids ? "family" : "routine",
      mood: "focused",
      devices: ["smartphone", "tablet"],
      touchpoints: hasKids ? ["Family calendar app", "School notifications"] : ["News aggregator", "Social media"],
      icon: hasKids ? "family" : "breakfast",
    },
    {
      id: "3",
      time: "7:15 AM",
      timeSlot: "morning",
      activity: isWorkFromHome ? "Start remote work" : "Commute to work",
      description: isWorkFromHome
        ? "Settle into home office, check emails and Slack"
        : isUrban ? "Take public transit, listen to podcast" : "Drive to office, listen to music/news",
      duration: isWorkFromHome ? 15 : 45,
      location: isWorkFromHome ? "home" : "transit",
      category: "work",
      mood: "focused",
      devices: isWorkFromHome ? ["laptop", "smartphone"] : ["smartphone"],
      touchpoints: isWorkFromHome
        ? ["Slack", "Email", "Calendar"]
        : ["Spotify", "Podcast app", "Google Maps"],
      icon: isWorkFromHome ? "work" : isUrban ? "transit" : "commute",
    },
    {
      id: "4",
      time: isWorkFromHome ? "7:30 AM" : "8:00 AM",
      timeSlot: "morning",
      activity: "Deep work session",
      description: "Focus on priority tasks, limit distractions",
      duration: 180,
      location: "work",
      category: "work",
      mood: "focused",
      devices: ["laptop"],
      touchpoints: ["Work tools", "Project management", "Collaboration apps"],
      icon: "work",
    },
    {
      id: "5",
      time: "11:00 AM",
      timeSlot: "midday",
      activity: "Meetings & collaboration",
      description: "Video calls, team syncs, client meetings",
      duration: 90,
      location: "work",
      category: "work",
      mood: "focused",
      devices: ["laptop", "smartphone"],
      touchpoints: ["Zoom", "Teams", "Slack", "Calendar"],
      icon: "meeting",
    },
    {
      id: "6",
      time: "12:30 PM",
      timeSlot: "midday",
      activity: "Lunch break",
      description: "Grab lunch, scroll social media, take a mental break",
      duration: 45,
      location: "work",
      category: "routine",
      mood: "relaxed",
      devices: ["smartphone"],
      touchpoints: ["Instagram", "Twitter", "News apps", "Food delivery app"],
      icon: "lunch",
    },
    {
      id: "7",
      time: "1:15 PM",
      timeSlot: "afternoon",
      activity: "Afternoon work",
      description: "Continue work tasks, respond to emails, admin work",
      duration: 180,
      location: "work",
      category: "work",
      mood: "focused",
      devices: ["laptop", "smartphone"],
      touchpoints: ["Email", "CRM", "Analytics tools"],
      icon: "work",
    },
    ...(isHealthy ? [{
      id: "8",
      time: "5:00 PM",
      timeSlot: "afternoon" as const,
      activity: "Exercise",
      description: "Hit the gym, go for a run, or workout at home",
      duration: 60,
      location: "gym" as const,
      category: "health" as const,
      mood: "energized" as const,
      devices: ["smartwatch", "smartphone"] as DailyActivity["devices"],
      touchpoints: ["Fitness app", "Spotify", "Health tracking"],
      icon: "exercise",
    }] : []),
    {
      id: "9",
      time: isHealthy ? "6:00 PM" : "5:30 PM",
      timeSlot: "evening",
      activity: isWorkFromHome ? "End of work day" : "Commute home",
      description: isWorkFromHome
        ? "Wrap up work, transition to personal time"
        : "Head home, decompress from the day",
      duration: isWorkFromHome ? 15 : 45,
      location: isWorkFromHome ? "home" : "transit",
      category: "routine",
      mood: "relaxed",
      devices: ["smartphone"],
      touchpoints: isWorkFromHome
        ? ["Personal email", "Social media"]
        : ["Podcast", "Music", "Audiobook"],
      icon: isWorkFromHome ? "home" : isUrban ? "transit" : "commute",
    },
    {
      id: "10",
      time: "6:30 PM",
      timeSlot: "evening",
      activity: hasKids ? "Family dinner preparation" : "Dinner",
      description: hasKids
        ? "Cook dinner with family, help with homework, quality time"
        : "Prepare or order dinner, catch up with partner/roommates",
      duration: hasKids ? 90 : 60,
      location: "home",
      category: hasKids ? "family" : "routine",
      mood: "happy",
      devices: hasKids ? ["tablet"] : ["smartphone"],
      touchpoints: hasKids
        ? ["Recipe app", "Family calendar", "Homework apps"]
        : ["Food delivery", "Recipe app", "Streaming"],
      icon: hasKids ? "family" : "dinner",
    },
    {
      id: "11",
      time: hasKids ? "8:00 PM" : "7:30 PM",
      timeSlot: "evening",
      activity: "Evening entertainment",
      description: "Watch TV shows, browse social media, gaming, or hobbies",
      duration: 120,
      location: "home",
      category: "leisure",
      mood: "relaxed",
      devices: ["tv", "smartphone", isTechSavvy ? "tablet" : "none"].filter(d => d !== "none") as DailyActivity["devices"],
      touchpoints: ["Netflix/Streaming", "Social media", "Gaming", "YouTube"],
      icon: isTechSavvy ? "gaming" : "tv",
    },
    {
      id: "12",
      time: "10:00 PM",
      timeSlot: "night",
      activity: "Wind down routine",
      description: "Final social media check, personal care, reading",
      duration: 45,
      location: "home",
      category: "routine",
      mood: "tired",
      devices: ["smartphone"],
      touchpoints: ["Social media", "News", "Reading app", "Sleep app"],
      icon: "relaxation",
    },
    {
      id: "13",
      time: "10:45 PM",
      timeSlot: "night",
      activity: "Sleep",
      description: "Lights out, possibly fall asleep to podcast or white noise",
      duration: 0,
      location: "home",
      category: "routine",
      mood: "tired",
      devices: ["smartphone"],
      touchpoints: ["Sleep tracking", "White noise app"],
      icon: "sleep",
    },
  ]

  const weekendActivities: DailyActivity[] = [
    {
      id: "w1",
      time: "8:00 AM",
      timeSlot: "morning",
      activity: "Leisurely wake up",
      description: "Sleep in, no alarm, slow morning scroll through phone",
      duration: 30,
      location: "home",
      category: "routine",
      mood: "relaxed",
      devices: ["smartphone"],
      touchpoints: ["Social media", "News", "Email"],
      icon: "wake",
    },
    {
      id: "w2",
      time: "8:30 AM",
      timeSlot: "morning",
      activity: "Brunch preparation",
      description: hasKids ? "Make pancakes for the family" : "Elaborate breakfast or brunch plans",
      duration: 60,
      location: "home",
      category: hasKids ? "family" : "leisure",
      mood: "happy",
      devices: ["smartphone", "tablet"],
      touchpoints: ["Recipe app", "Music/Podcast", "Social media"],
      icon: "breakfast",
    },
    {
      id: "w3",
      time: "10:00 AM",
      timeSlot: "morning",
      activity: hasKids ? "Kids activities" : "Personal time",
      description: hasKids
        ? "Sports practice, playdates, or family outing"
        : "Hobbies, exercise, or errands",
      duration: 120,
      location: hasKids ? "other" : isHealthy ? "gym" : "home",
      category: hasKids ? "family" : isHealthy ? "health" : "leisure",
      mood: "energized",
      devices: ["smartphone", "smartwatch"],
      touchpoints: hasKids
        ? ["Family calendar", "Location sharing", "Messaging"]
        : ["Fitness app", "Music", "Navigation"],
      icon: hasKids ? "family" : isHealthy ? "exercise" : "home",
    },
    {
      id: "w4",
      time: "12:00 PM",
      timeSlot: "midday",
      activity: "Lunch out or at home",
      description: "Grab lunch at a local spot or cook at home",
      duration: 90,
      location: random(14) > 0.5 ? "restaurant" : "home",
      category: "social",
      mood: "happy",
      devices: ["smartphone"],
      touchpoints: ["Yelp/Google Maps", "Instagram", "Payment apps"],
      icon: "lunch",
    },
    {
      id: "w5",
      time: "1:30 PM",
      timeSlot: "afternoon",
      activity: "Shopping or errands",
      description: "Weekly shopping, returns, or browsing",
      duration: 120,
      location: "store",
      category: "shopping",
      mood: "focused",
      devices: ["smartphone"],
      touchpoints: ["Shopping apps", "Price comparison", "Loyalty apps", "Payment"],
      icon: "shopping",
    },
    {
      id: "w6",
      time: "3:30 PM",
      timeSlot: "afternoon",
      activity: "Relaxation time",
      description: "Watch sports, catch up on shows, or outdoor activity",
      duration: 150,
      location: "home",
      category: "leisure",
      mood: "relaxed",
      devices: ["tv", "smartphone"],
      touchpoints: ["Sports streaming", "Netflix", "Social media", "Gaming"],
      icon: random(15) > 0.5 ? "tv" : "gaming",
    },
    {
      id: "w7",
      time: "6:00 PM",
      timeSlot: "evening",
      activity: "Social plans",
      description: "Dinner with friends/family, date night, or hosting",
      duration: 180,
      location: random(16) > 0.5 ? "restaurant" : "home",
      category: "social",
      mood: "happy",
      devices: ["smartphone"],
      touchpoints: ["OpenTable", "Messaging", "Photos", "Payment apps"],
      icon: "social",
    },
    {
      id: "w8",
      time: "9:00 PM",
      timeSlot: "evening",
      activity: "Evening entertainment",
      description: "Movie, gaming, or relaxing at home",
      duration: 120,
      location: "home",
      category: "leisure",
      mood: "relaxed",
      devices: ["tv", "smartphone"],
      touchpoints: ["Streaming services", "Social media", "Gaming"],
      icon: "tv",
    },
    {
      id: "w9",
      time: "11:00 PM",
      timeSlot: "night",
      activity: "Wind down & sleep",
      description: "Later night on weekends, final social media check",
      duration: 30,
      location: "home",
      category: "routine",
      mood: "tired",
      devices: ["smartphone"],
      touchpoints: ["Social media", "Messaging", "Sleep app"],
      icon: "sleep",
    },
  ]

  const activities = dayType === "weekday" ? weekdayActivities : weekendActivities

  // Generate media moments
  const mediaMoments: MediaMoment[] = [
    { time: "6:15 AM", platform: "Email", content: "Quick inbox scan", duration: 5, device: "smartphone", engagement: "passive" },
    { time: "6:45 AM", platform: "News", content: "Morning headlines", duration: 10, device: "smartphone", engagement: "passive" },
    { time: "7:30 AM", platform: isWorkFromHome ? "LinkedIn" : "Spotify", content: isWorkFromHome ? "Professional updates" : "Commute playlist", duration: isWorkFromHome ? 10 : 45, device: "smartphone", engagement: "passive" },
    { time: "12:35 PM", platform: "Instagram", content: "Lunch scroll", duration: 15, device: "smartphone", engagement: "active" },
    { time: "12:50 PM", platform: "Twitter", content: "News & trending", duration: 10, device: "smartphone", engagement: "active" },
    { time: "5:15 PM", platform: "Podcasts", content: "Daily podcast", duration: 30, device: "smartphone", engagement: "passive" },
    { time: "7:45 PM", platform: "Netflix", content: "Show episode", duration: 45, device: "tv", engagement: "passive" },
    { time: "8:30 PM", platform: "YouTube", content: "Videos & recommendations", duration: 30, device: "tv", engagement: "passive" },
    { time: "10:00 PM", platform: "Instagram", content: "Evening scroll", duration: 20, device: "smartphone", engagement: "active" },
    { time: "10:20 PM", platform: "News", content: "Final news check", duration: 10, device: "smartphone", engagement: "passive" },
  ]

  // Calculate device usage
  const deviceUsage = [
    { device: "Smartphone", minutes: Math.floor(180 + random(17) * 120), percentage: 0 },
    { device: "Laptop", minutes: Math.floor(300 + random(18) * 180), percentage: 0 },
    { device: "TV", minutes: Math.floor(60 + random(19) * 120), percentage: 0 },
    { device: "Tablet", minutes: Math.floor(20 + random(20) * 60), percentage: 0 },
    { device: "Smartwatch", minutes: Math.floor(10 + random(21) * 30), percentage: 0 },
  ]

  const totalDeviceMinutes = deviceUsage.reduce((sum, d) => sum + d.minutes, 0)
  deviceUsage.forEach(d => {
    d.percentage = Math.round((d.minutes / totalDeviceMinutes) * 100)
  })

  // Mood pattern throughout the day
  const moodPattern = [
    { time: "6 AM", mood: 50 },
    { time: "8 AM", mood: 70 },
    { time: "10 AM", mood: 85 },
    { time: "12 PM", mood: 75 },
    { time: "2 PM", mood: 65 },
    { time: "4 PM", mood: 60 },
    { time: "6 PM", mood: 75 },
    { time: "8 PM", mood: 80 },
    { time: "10 PM", mood: 55 },
  ].map((m, i) => ({
    ...m,
    mood: Math.min(100, Math.max(30, m.mood + Math.floor((random(22 + i) - 0.5) * 20)))
  }))

  return {
    dayType,
    wakeTime,
    sleepTime,
    totalScreenTime: Math.floor(300 + random(23) * 180),
    activities,
    mediaMoments,
    peakProductivity: dayType === "weekday" ? "9:00 AM - 11:00 AM" : "N/A",
    peakEngagement: "7:00 PM - 9:00 PM",
    moodPattern,
    deviceUsage: deviceUsage.sort((a, b) => b.minutes - a.minutes),
  }
}

export function DayInTheLife({
  audienceId,
  audienceName: _audienceName,
  audienceCriteria,
  className,
}: DayInTheLifeProps) {
  const t = useTranslations("audiences")
  const [dayType, setDayType] = useState<"weekday" | "weekend">("weekday")
  const [isLoading, setIsLoading] = useState(true)
  const [dayProfile, setDayProfile] = useState<DayProfile | null>(null)

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      const profile = generateDayProfile(audienceId, audienceCriteria, dayType)
      setDayProfile(profile)
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [audienceId, audienceCriteria, dayType])

  const timeSlots = useMemo(() => {
    if (!dayProfile) return []

    const slots = [
      { key: "early_morning", label: "Early Morning", icon: <Sunrise className="h-4 w-4" />, timeRange: "5AM - 7AM" },
      { key: "morning", label: "Morning", icon: <Sun className="h-4 w-4" />, timeRange: "7AM - 11AM" },
      { key: "midday", label: "Midday", icon: <Sun className="h-4 w-4" />, timeRange: "11AM - 1PM" },
      { key: "afternoon", label: "Afternoon", icon: <Sunset className="h-4 w-4" />, timeRange: "1PM - 5PM" },
      { key: "evening", label: "Evening", icon: <Moon className="h-4 w-4" />, timeRange: "5PM - 9PM" },
      { key: "night", label: "Night", icon: <Moon className="h-4 w-4" />, timeRange: "9PM - 12AM" },
    ]

    return slots.map(slot => ({
      ...slot,
      activities: dayProfile.activities.filter(a => a.timeSlot === slot.key)
    }))
  }, [dayProfile])

  if (isLoading) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!dayProfile) return null

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              A Day in the Life
            </CardTitle>
            <CardDescription>
              Typical daily journey showing activities, touchpoints, and media consumption
            </CardDescription>
          </div>
          <Select value={dayType} onValueChange={(v) => setDayType(v as "weekday" | "weekend")}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekday">Weekday</SelectItem>
              <SelectItem value="weekend">Weekend</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="media">Media Moments</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="mood">Mood & Energy</TabsTrigger>
          </TabsList>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4">
            {/* Day summary */}
            <div className="flex flex-wrap gap-4 p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Sunrise className="h-4 w-4 text-amber-500" />
                <span className="text-sm">Wake: <strong>{dayProfile.wakeTime}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Sleep: <strong>{dayProfile.sleepTime}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Screen time: <strong>{Math.floor(dayProfile.totalScreenTime / 60)}h {dayProfile.totalScreenTime % 60}m</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-500" />
                <span className="text-sm">Peak productivity: <strong>{dayProfile.peakProductivity}</strong></span>
              </div>
            </div>

            {/* Timeline */}
            <ScrollArea className="h-[500px]">
              <div className="space-y-6 pr-4">
                {timeSlots.map((slot) => (
                  <div key={slot.key} className="space-y-3">
                    <div className="flex items-center gap-2 sticky top-0 bg-background py-2 z-10">
                      <div className={cn("p-2 rounded-lg", timeSlotColors[slot.key])}>
                        {slot.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold">{slot.label}</h4>
                        <p className="text-xs text-muted-foreground">{slot.timeRange}</p>
                      </div>
                    </div>

                    <div className="ml-4 border-l-2 border-dashed pl-6 space-y-4">
                      {slot.activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="relative"
                        >
                          {/* Timeline dot */}
                          <div className="absolute -left-[31px] top-2 w-4 h-4 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          </div>

                          <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-muted">
                                  {activityIcons[activity.icon] || <Clock className="h-4 w-4" />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-muted-foreground">{activity.time}</span>
                                    <span className="text-sm font-semibold">{activity.activity}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>

                                  <div className="flex flex-wrap gap-2 mt-2">
                                    <Badge variant="outline" className={cn("text-xs", categoryColors[activity.category])}>
                                      {activity.category}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {activity.duration}m
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      <MapPin className="h-3 w-3 mr-1" />
                                      {activity.location}
                                    </Badge>
                                  </div>

                                  {activity.touchpoints.length > 0 && (
                                    <div className="mt-2">
                                      <span className="text-xs text-muted-foreground">Touchpoints: </span>
                                      <span className="text-xs">{activity.touchpoints.join(", ")}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex gap-1">
                                {activity.devices.filter(d => d !== "none").map((device) => (
                                  <TooltipProvider key={device}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="p-1.5 rounded bg-muted">
                                          {device === "smartphone" && <Smartphone className="h-3 w-3" />}
                                          {device === "laptop" && <Laptop className="h-3 w-3" />}
                                          {device === "tablet" && <Laptop className="h-3 w-3" />}
                                          {device === "tv" && <Tv className="h-3 w-3" />}
                                          {device === "smartwatch" && <Clock className="h-3 w-3" />}
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>{device}</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Media Moments Tab */}
          <TabsContent value="media" className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="font-semibold">Peak Engagement Window</span>
              </div>
              <p className="text-sm text-muted-foreground">{dayProfile.peakEngagement}</p>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {dayProfile.mediaMoments.map((moment, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                  >
                    <div className="text-sm font-medium text-muted-foreground w-20">
                      {moment.time}
                    </div>
                    <div className="p-2 rounded-lg bg-muted">
                      {platformIcons[moment.platform] || <Globe className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{moment.platform}</div>
                      <div className="text-sm text-muted-foreground">{moment.content}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">
                        {moment.duration}m
                      </Badge>
                      <div className="text-xs text-muted-foreground capitalize">
                        {moment.engagement}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Devices Tab */}
          <TabsContent value="devices" className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-4">Daily Device Usage</h4>
              <div className="space-y-4">
                {dayProfile.deviceUsage.map((device) => (
                  <div key={device.device}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-2">
                        {device.device === "Smartphone" && <Smartphone className="h-4 w-4" />}
                        {device.device === "Laptop" && <Laptop className="h-4 w-4" />}
                        {device.device === "TV" && <Tv className="h-4 w-4" />}
                        {device.device === "Tablet" && <Laptop className="h-4 w-4" />}
                        {device.device === "Smartwatch" && <Clock className="h-4 w-4" />}
                        {device.device}
                      </span>
                      <span className="font-medium">
                        {Math.floor(device.minutes / 60)}h {device.minutes % 60}m ({device.percentage}%)
                      </span>
                    </div>
                    <Progress value={device.percentage} className="h-3" />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <h4 className="font-semibold text-blue-600 mb-2">Primary Device</h4>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-6 w-6 text-blue-500" />
                  <span className="text-lg font-bold">Smartphone</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Used throughout the day for quick checks and on-the-go access
                </p>
              </div>

              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <h4 className="font-semibold text-purple-600 mb-2">Work Device</h4>
                <div className="flex items-center gap-2">
                  <Laptop className="h-6 w-6 text-purple-500" />
                  <span className="text-lg font-bold">Laptop</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Primary device for productivity and work tasks
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Mood & Energy Tab */}
          <TabsContent value="mood" className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-4">Energy Levels Throughout the Day</h4>
              <div className="h-48 flex items-end justify-between gap-2">
                {dayProfile.moodPattern.map((point, i) => (
                  <TooltipProvider key={i}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col items-center flex-1">
                          <div
                            className={cn(
                              "w-full rounded-t transition-all",
                              point.mood > 75 ? "bg-emerald-500" :
                              point.mood > 50 ? "bg-amber-500" : "bg-red-400"
                            )}
                            style={{ height: `${point.mood * 1.5}px` }}
                          />
                          <span className="text-xs mt-2 text-muted-foreground">{point.time}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        Energy level: {point.mood}%
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <h4 className="font-semibold text-emerald-600 mb-1">Peak Energy</h4>
                <p className="text-2xl font-bold">10 AM</p>
                <p className="text-sm text-muted-foreground">Mid-morning focus</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <h4 className="font-semibold text-amber-600 mb-1">Energy Dip</h4>
                <p className="text-2xl font-bold">2-4 PM</p>
                <p className="text-sm text-muted-foreground">Post-lunch slump</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <h4 className="font-semibold text-blue-600 mb-1">Evening Revival</h4>
                <p className="text-2xl font-bold">8 PM</p>
                <p className="text-sm text-muted-foreground">Second wind</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
