"use client"

import { useState, useEffect } from "react"
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
  Tv,
  Radio,
  Newspaper,
  Smartphone,
  Monitor,
  Headphones,
  Music,
  Film,
  BookOpen,
  Gamepad2,
  Globe,
  MessageSquare,
  Heart,
  ThumbsUp,
  Share2,
  Clock,
  TrendingUp,
  Star,
  Loader2,
  Play,
  Pause,
  Volume2,
  Wifi,
  Podcast,
  Rss,
  Camera,
  Video,
  Mail,
  Bell,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Linkedin,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Media consumption types
export interface MediaChannel {
  id: string
  name: string
  category: "social" | "streaming" | "audio" | "news" | "gaming" | "print"
  icon: string
  usage: {
    dailyMinutes: number
    weeklyHours: number
    indexVsPopulation: number
    trend: "up" | "stable" | "down"
  }
  engagement: {
    activeEngagement: number // percentage of time actively engaging vs passive
    contentCreation: number // percentage who create content
    shareRate: number // percentage who share content
  }
  preferences: {
    contentTypes: string[]
    peakTimes: string[]
    devices: string[]
  }
}

export interface StreamingService {
  name: string
  penetration: number // percentage who use
  avgWeeklyHours: number
  favoriteGenres: string[]
  watchingBehavior: "binge" | "episodic" | "mixed"
}

export interface SocialPlatform {
  name: string
  penetration: number
  dailyMinutes: number
  primaryUse: string[]
  engagementStyle: "creator" | "curator" | "consumer" | "lurker"
  adReceptivity: number // 0-100
}

export interface NewsSource {
  type: string
  penetration: number
  trustLevel: number
  frequency: string
}

interface MediaConsumptionProps {
  audienceId: string
  audienceName: string
  audienceCriteria?: Record<string, unknown>
  className?: string
}

const channelIcons: Record<string, React.ReactNode> = {
  Instagram: <Instagram className="h-4 w-4" />,
  YouTube: <Youtube className="h-4 w-4" />,
  TikTok: <Video className="h-4 w-4" />,
  Twitter: <Twitter className="h-4 w-4" />,
  Facebook: <Facebook className="h-4 w-4" />,
  LinkedIn: <Linkedin className="h-4 w-4" />,
  Netflix: <Tv className="h-4 w-4" />,
  Spotify: <Music className="h-4 w-4" />,
  Podcasts: <Podcast className="h-4 w-4" />,
  News: <Newspaper className="h-4 w-4" />,
  Gaming: <Gamepad2 className="h-4 w-4" />,
  Radio: <Radio className="h-4 w-4" />,
}

// Generate media consumption data
function generateMediaData(audienceId: string, criteria?: Record<string, unknown>) {
  const seed = audienceId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const random = (index: number) => ((seed * (index + 1)) % 100) / 100

  const socialPlatforms: SocialPlatform[] = [
    {
      name: "Instagram",
      penetration: Math.floor(75 + random(1) * 20),
      dailyMinutes: Math.floor(30 + random(2) * 45),
      primaryUse: ["Browsing feed", "Stories", "Reels", "Messaging"],
      engagementStyle: random(3) > 0.6 ? "consumer" : random(3) > 0.3 ? "curator" : "creator",
      adReceptivity: Math.floor(45 + random(4) * 30),
    },
    {
      name: "YouTube",
      penetration: Math.floor(85 + random(5) * 12),
      dailyMinutes: Math.floor(45 + random(6) * 60),
      primaryUse: ["Entertainment", "How-to", "Music", "News"],
      engagementStyle: "consumer",
      adReceptivity: Math.floor(40 + random(7) * 25),
    },
    {
      name: "TikTok",
      penetration: Math.floor(45 + random(8) * 35),
      dailyMinutes: Math.floor(25 + random(9) * 50),
      primaryUse: ["Entertainment", "Trends", "Discovery"],
      engagementStyle: random(10) > 0.7 ? "consumer" : "curator",
      adReceptivity: Math.floor(50 + random(11) * 30),
    },
    {
      name: "LinkedIn",
      penetration: Math.floor(55 + random(12) * 30),
      dailyMinutes: Math.floor(10 + random(13) * 20),
      primaryUse: ["Professional networking", "Industry news", "Job opportunities"],
      engagementStyle: random(14) > 0.5 ? "consumer" : "curator",
      adReceptivity: Math.floor(55 + random(15) * 25),
    },
    {
      name: "Twitter/X",
      penetration: Math.floor(40 + random(16) * 35),
      dailyMinutes: Math.floor(15 + random(17) * 30),
      primaryUse: ["News", "Commentary", "Following interests"],
      engagementStyle: random(18) > 0.6 ? "consumer" : "curator",
      adReceptivity: Math.floor(35 + random(19) * 25),
    },
    {
      name: "Facebook",
      penetration: Math.floor(60 + random(20) * 25),
      dailyMinutes: Math.floor(20 + random(21) * 25),
      primaryUse: ["Friends/family", "Groups", "Marketplace", "Events"],
      engagementStyle: "consumer",
      adReceptivity: Math.floor(40 + random(22) * 25),
    },
  ]

  const streamingServices: StreamingService[] = [
    {
      name: "Netflix",
      penetration: Math.floor(70 + random(23) * 20),
      avgWeeklyHours: Math.floor(5 + random(24) * 8),
      favoriteGenres: ["Drama", "Comedy", "Documentary", "Thriller"],
      watchingBehavior: random(25) > 0.5 ? "binge" : "mixed",
    },
    {
      name: "YouTube Premium",
      penetration: Math.floor(25 + random(26) * 25),
      avgWeeklyHours: Math.floor(3 + random(27) * 6),
      favoriteGenres: ["How-to", "Entertainment", "Music", "Vlogs"],
      watchingBehavior: "mixed",
    },
    {
      name: "Disney+",
      penetration: Math.floor(40 + random(28) * 25),
      avgWeeklyHours: Math.floor(2 + random(29) * 5),
      favoriteGenres: ["Family", "Marvel/Star Wars", "Animation"],
      watchingBehavior: "episodic",
    },
    {
      name: "HBO Max",
      penetration: Math.floor(30 + random(30) * 25),
      avgWeeklyHours: Math.floor(2 + random(31) * 5),
      favoriteGenres: ["Drama", "Documentary", "Comedy"],
      watchingBehavior: "episodic",
    },
    {
      name: "Hulu",
      penetration: Math.floor(35 + random(32) * 25),
      avgWeeklyHours: Math.floor(3 + random(33) * 5),
      favoriteGenres: ["TV Shows", "Reality", "Comedy"],
      watchingBehavior: "mixed",
    },
    {
      name: "Amazon Prime Video",
      penetration: Math.floor(50 + random(34) * 25),
      avgWeeklyHours: Math.floor(2 + random(35) * 4),
      favoriteGenres: ["Drama", "Action", "Original Series"],
      watchingBehavior: "mixed",
    },
  ]

  const audioServices = [
    {
      name: "Spotify",
      penetration: Math.floor(60 + random(36) * 25),
      dailyMinutes: Math.floor(45 + random(37) * 60),
      primaryUse: ["Music", "Playlists", "Podcasts", "Discover"],
    },
    {
      name: "Apple Music",
      penetration: Math.floor(25 + random(38) * 20),
      dailyMinutes: Math.floor(30 + random(39) * 45),
      primaryUse: ["Music", "Radio", "Playlists"],
    },
    {
      name: "Podcasts",
      penetration: Math.floor(45 + random(40) * 30),
      dailyMinutes: Math.floor(20 + random(41) * 40),
      primaryUse: ["News", "Entertainment", "Education", "True Crime"],
    },
    {
      name: "Audiobooks",
      penetration: Math.floor(20 + random(42) * 25),
      dailyMinutes: Math.floor(15 + random(43) * 30),
      primaryUse: ["Fiction", "Self-help", "Business", "Biography"],
    },
  ]

  const newsSources: NewsSource[] = [
    {
      type: "Online news sites",
      penetration: Math.floor(70 + random(44) * 20),
      trustLevel: Math.floor(55 + random(45) * 25),
      frequency: "Multiple times daily",
    },
    {
      type: "Social media news",
      penetration: Math.floor(65 + random(46) * 25),
      trustLevel: Math.floor(35 + random(47) * 25),
      frequency: "Throughout the day",
    },
    {
      type: "News apps",
      penetration: Math.floor(50 + random(48) * 30),
      trustLevel: Math.floor(60 + random(49) * 25),
      frequency: "Daily",
    },
    {
      type: "Podcasts/audio news",
      penetration: Math.floor(35 + random(50) * 30),
      trustLevel: Math.floor(55 + random(51) * 30),
      frequency: "Daily/Weekly",
    },
    {
      type: "TV news",
      penetration: Math.floor(45 + random(52) * 30),
      trustLevel: Math.floor(50 + random(53) * 25),
      frequency: "Daily",
    },
    {
      type: "Newsletters",
      penetration: Math.floor(40 + random(54) * 30),
      trustLevel: Math.floor(60 + random(55) * 25),
      frequency: "Daily/Weekly",
    },
    {
      type: "Print newspapers/magazines",
      penetration: Math.floor(15 + random(56) * 25),
      trustLevel: Math.floor(65 + random(57) * 25),
      frequency: "Weekly/Monthly",
    },
  ]

  const mediaPreferences = {
    primetime: "7 PM - 10 PM",
    secondaryTime: "Lunch break (12-1 PM)",
    weekendPeak: "Saturday evening",
    preferredDevice: "Smartphone (55%), TV (30%), Laptop (15%)",
    multiscreening: Math.floor(65 + random(58) * 25),
    adTolerance: Math.floor(40 + random(59) * 30),
    subscriptionFatigue: Math.floor(55 + random(60) * 30),
  }

  const contentPreferences = {
    videoLength: {
      "Short form (<1 min)": Math.floor(25 + random(61) * 15),
      "Medium (1-10 min)": Math.floor(35 + random(62) * 15),
      "Long form (10-30 min)": Math.floor(25 + random(63) * 10),
      "Feature length (30+ min)": Math.floor(15 + random(64) * 10),
    },
    genres: [
      { name: "Comedy/Entertainment", affinity: Math.floor(70 + random(65) * 25) },
      { name: "Drama/Thriller", affinity: Math.floor(60 + random(66) * 25) },
      { name: "Documentary", affinity: Math.floor(50 + random(67) * 30) },
      { name: "Reality/Competition", affinity: Math.floor(40 + random(68) * 30) },
      { name: "News/Current Affairs", affinity: Math.floor(55 + random(69) * 25) },
      { name: "Sports", affinity: Math.floor(35 + random(70) * 40) },
      { name: "Educational/How-to", affinity: Math.floor(55 + random(71) * 30) },
      { name: "Music", affinity: Math.floor(65 + random(72) * 25) },
    ],
  }

  return {
    socialPlatforms,
    streamingServices,
    audioServices,
    newsSources,
    mediaPreferences,
    contentPreferences,
  }
}

export function MediaConsumption({
  audienceId,
  audienceName,
  audienceCriteria,
  className,
}: MediaConsumptionProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<ReturnType<typeof generateMediaData> | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      const mediaData = generateMediaData(audienceId, audienceCriteria)
      setData(mediaData)
      setIsLoading(false)
    }, 400)

    return () => clearTimeout(timer)
  }, [audienceId, audienceCriteria])

  if (isLoading) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Tv className="h-5 w-5 text-primary" />
          Media Consumption
        </CardTitle>
        <CardDescription>
          Detailed breakdown of media habits across platforms and content types
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="social" className="w-full">
          <TabsList className="w-full justify-start mb-4 flex-wrap h-auto gap-1">
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="streaming">Streaming</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Social Media Tab */}
          <TabsContent value="social" className="space-y-4">
            <div className="grid gap-3">
              {data.socialPlatforms.map((platform) => (
                <div
                  key={platform.name}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        {channelIcons[platform.name] || <Globe className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{platform.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {platform.penetration}% reach
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {platform.dailyMinutes} min/day
                          </span>
                          <span className="capitalize">
                            {platform.engagementStyle}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {platform.primaryUse.map((use, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {use}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground mb-1">Ad receptivity</div>
                            <div className="flex items-center gap-2">
                              <Progress value={platform.adReceptivity} className="h-2 w-16" />
                              <span className="text-sm font-medium">{platform.adReceptivity}%</span>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          Likelihood to engage with ads on this platform
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Media Insights */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-4 rounded-lg bg-pink-500/10 border border-pink-500/20 text-center">
                <div className="text-2xl font-bold text-pink-600">
                  {Math.round(data.socialPlatforms.reduce((sum, p) => sum + p.dailyMinutes, 0))}
                </div>
                <div className="text-xs text-muted-foreground">Total daily social minutes</div>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {data.socialPlatforms.filter(p => p.penetration > 50).length}
                </div>
                <div className="text-xs text-muted-foreground">Primary platforms used</div>
              </div>
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(data.socialPlatforms.reduce((sum, p) => sum + p.adReceptivity, 0) / data.socialPlatforms.length)}%
                </div>
                <div className="text-xs text-muted-foreground">Avg ad receptivity</div>
              </div>
            </div>
          </TabsContent>

          {/* Streaming Tab */}
          <TabsContent value="streaming" className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {data.streamingServices.map((service) => (
                <div
                  key={service.name}
                  className="p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Tv className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{service.name}</span>
                    </div>
                    <Badge variant="secondary">{service.penetration}%</Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weekly hours</span>
                      <span className="font-medium">{service.avgWeeklyHours}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Watching style</span>
                      <span className="font-medium capitalize">{service.watchingBehavior}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Top genres: </span>
                      <span>{service.favoriteGenres.slice(0, 3).join(", ")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Streaming summary */}
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Play className="h-4 w-4 text-primary" />
                Streaming Behavior Summary
              </h4>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <div className="text-2xl font-bold">
                    {Math.round(data.streamingServices.reduce((sum, s) => sum + s.avgWeeklyHours, 0))}h
                  </div>
                  <div className="text-xs text-muted-foreground">Weekly streaming</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {data.streamingServices.filter(s => s.penetration > 40).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Active subscriptions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold capitalize">
                    {data.streamingServices[0].watchingBehavior}
                  </div>
                  <div className="text-xs text-muted-foreground">Primary watching style</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {data.mediaPreferences.subscriptionFatigue}%
                  </div>
                  <div className="text-xs text-muted-foreground">Subscription fatigue</div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Audio Tab */}
          <TabsContent value="audio" className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {data.audioServices.map((service) => (
                <div
                  key={service.name}
                  className="p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {service.name === "Spotify" ? <Music className="h-4 w-4" /> :
                       service.name === "Podcasts" ? <Podcast className="h-4 w-4" /> :
                       <Headphones className="h-4 w-4" />}
                      <span className="font-semibold">{service.name}</span>
                    </div>
                    <Badge variant="secondary">{service.penetration}%</Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily minutes</span>
                      <span className="font-medium">{service.dailyMinutes}m</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Primary use: </span>
                      <span>{service.primaryUse.slice(0, 3).join(", ")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Audio insights */}
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <h4 className="font-semibold mb-2 text-emerald-600 flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Audio Listening Patterns
              </h4>
              <ul className="text-sm space-y-1">
                <li>Peak listening: During commute and exercise</li>
                <li>Podcast topics: News, Business, True Crime, Self-improvement</li>
                <li>Music discovery: Through algorithmic playlists and social sharing</li>
                <li>Audio ads: {data.mediaPreferences.adTolerance}% tolerance</li>
              </ul>
            </div>
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news" className="space-y-4">
            <div className="space-y-3">
              {data.newsSources.map((source, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Newspaper className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{source.type}</span>
                    </div>
                    <Badge variant="secondary">{source.penetration}% use</Badge>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Trust level</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={source.trustLevel} className="h-2" />
                        <span>{source.trustLevel}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Frequency</span>
                      <div className="font-medium mt-1">{source.frequency}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reach index</span>
                      <div className="font-medium mt-1">{source.penetration > 50 ? "High" : source.penetration > 30 ? "Medium" : "Low"}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* News insights */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <h4 className="font-semibold mb-2 text-blue-600">News Consumption Pattern</h4>
                <ul className="text-sm space-y-1">
                  <li>Morning: Quick headline scan</li>
                  <li>Lunch: Deep dive on interests</li>
                  <li>Evening: Catch-up and analysis</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <h4 className="font-semibold mb-2 text-amber-600">Trust Factors</h4>
                <ul className="text-sm space-y-1">
                  <li>Values: Factual reporting, transparency</li>
                  <li>Prefers: Multiple source verification</li>
                  <li>Skeptical of: Sensationalism, bias</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4">
            {/* Content length preferences */}
            <div className="p-4 rounded-lg border bg-card">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Video Content Length Preferences
              </h4>
              <div className="space-y-3">
                {Object.entries(data.contentPreferences.videoLength).map(([length, percentage]) => (
                  <div key={length}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{length}</span>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </div>

            {/* Genre preferences */}
            <div className="p-4 rounded-lg border bg-card">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Film className="h-4 w-4 text-primary" />
                Genre Affinities
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {data.contentPreferences.genres.map((genre) => (
                  <div key={genre.name} className="flex items-center justify-between">
                    <span className="text-sm">{genre.name}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={genre.affinity} className="h-2 w-20" />
                      <span className="text-sm font-medium w-10">{genre.affinity}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Viewing habits summary */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <div className="font-semibold">{data.mediaPreferences.primetime}</div>
                <div className="text-xs text-muted-foreground">Prime viewing time</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Smartphone className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <div className="font-semibold">{data.mediaPreferences.multiscreening}%</div>
                <div className="text-xs text-muted-foreground">Multi-screen while watching</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Bell className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <div className="font-semibold">{data.mediaPreferences.adTolerance}%</div>
                <div className="text-xs text-muted-foreground">Ad tolerance</div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Monitor className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <div className="font-semibold text-sm">{data.mediaPreferences.preferredDevice.split(",")[0]}</div>
                <div className="text-xs text-muted-foreground">Primary device</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
