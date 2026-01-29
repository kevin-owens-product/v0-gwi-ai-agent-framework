"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Home,
  DollarSign,
  Users,
  Sparkles,
  Quote,
  Target,
  TrendingUp,
  Star,
  Camera,
  RefreshCw,
  Loader2,
  ChevronRight,
  Brain,
  Lightbulb,
  ShoppingBag,
  Smartphone,
  Coffee,
  Dumbbell,
  Music,
  BookOpen,
  Plane,
  Car,
  Dog,
  Baby,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Persona profile types
export interface PersonaProfile {
  id: string
  name: string
  avatar: string
  tagline: string
  quote: string
  demographics: {
    ageRange: string
    gender: string
    location: string
    locationType: "urban" | "suburban" | "rural"
    income: string
    education: string
    occupation: string
    familyStatus: string
    livingArrangement: string
  }
  personality: {
    traits: { name: string; score: number }[]
    values: string[]
    motivations: string[]
    frustrations: string[]
  }
  lifestyle: {
    interests: string[]
    hobbies: string[]
    lifeStage: string
    socialClass: string
    techSavviness: number // 1-100
    healthConsciousness: number // 1-100
    environmentalAwareness: number // 1-100
    brandLoyalty: number // 1-100
  }
  goals: {
    shortTerm: string[]
    longTerm: string[]
    aspirations: string[]
  }
  challenges: {
    painPoints: string[]
    barriers: string[]
    fears: string[]
  }
  decisionMaking: {
    influencers: string[]
    researchBehavior: string
    purchaseDrivers: string[]
    pricePreference: "budget" | "value" | "premium" | "luxury"
  }
}

interface AudiencePersonaProps {
  audienceId: string
  audienceName: string
  audienceCriteria?: Record<string, unknown>
  className?: string
}

// Life stage icons
const lifeStageIcons: Record<string, React.ReactNode> = {
  "Young Adult": <GraduationCap className="h-4 w-4" />,
  "Early Career": <Briefcase className="h-4 w-4" />,
  "Established Professional": <Target className="h-4 w-4" />,
  "Young Family": <Baby className="h-4 w-4" />,
  "Growing Family": <Users className="h-4 w-4" />,
  "Empty Nester": <Home className="h-4 w-4" />,
  "Pre-Retiree": <TrendingUp className="h-4 w-4" />,
  "Retiree": <Coffee className="h-4 w-4" />,
}

// Interest icons
const interestIcons: Record<string, React.ReactNode> = {
  "Technology": <Smartphone className="h-3 w-3" />,
  "Fitness": <Dumbbell className="h-3 w-3" />,
  "Music": <Music className="h-3 w-3" />,
  "Reading": <BookOpen className="h-3 w-3" />,
  "Travel": <Plane className="h-3 w-3" />,
  "Automotive": <Car className="h-3 w-3" />,
  "Pets": <Dog className="h-3 w-3" />,
  "Photography": <Camera className="h-3 w-3" />,
  "Fashion": <ShoppingBag className="h-3 w-3" />,
}

// Generate persona based on audience criteria
function generatePersonaFromCriteria(
  audienceId: string,
  _audienceName: string,
  criteria?: Record<string, unknown>
): PersonaProfile {
  // Use deterministic randomization based on audienceId for consistency
  const seed = audienceId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const random = (index: number) => ((seed * (index + 1)) % 100) / 100

  // Parse criteria to influence persona generation
  // Handle ageRange - can be string or object { min, max }
  let ageRange = "25-44"
  const ageValue = criteria?.age ?? criteria?.ageRange
  if (ageValue) {
    if (typeof ageValue === 'string') {
      ageRange = ageValue
    } else if (typeof ageValue === 'object' && ageValue !== null && 'min' in ageValue) {
      const ageObj = ageValue as { min: number; max?: number }
      ageRange = ageObj.max ? `${ageObj.min}-${ageObj.max}` : `${ageObj.min}+`
    }
  }

  const gender = random(1) > 0.5 ? "Female" : "Male"

  // Handle income - can be string or object { min, currency }
  let income = "$75,000 - $150,000"
  if (criteria?.income) {
    if (typeof criteria.income === 'string') {
      income = criteria.income
    } else if (typeof criteria.income === 'object' && criteria.income !== null && 'min' in criteria.income) {
      const incomeObj = criteria.income as { min: number; currency?: string }
      const formattedMin = new Intl.NumberFormat('en-US', { style: 'currency', currency: incomeObj.currency || 'USD', maximumFractionDigits: 0 }).format(incomeObj.min)
      income = `${formattedMin}+`
    }
  }

  // Generate names based on demographics
  const femaleNames = ["Sarah", "Emily", "Jessica", "Ashley", "Amanda", "Olivia", "Emma", "Sophia", "Mia", "Isabella"]
  const maleNames = ["Michael", "David", "James", "Robert", "William", "Alexander", "Daniel", "Matthew", "Christopher", "Andrew"]
  const names = gender === "Female" ? femaleNames : maleNames
  const firstName = names[Math.floor(random(2) * names.length)]
  const lastInitials = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lastName = lastInitials[Math.floor(random(3) * 26)]

  // Location types
  const locationTypes: Array<"urban" | "suburban" | "rural"> = ["urban", "suburban", "rural"]
  const locationType = locationTypes[Math.floor(random(4) * 3)]

  // Cities based on location type
  const urbanCities = ["New York, NY", "Los Angeles, CA", "Chicago, IL", "San Francisco, CA", "Seattle, WA", "Boston, MA", "Austin, TX"]
  const suburbanCities = ["Naperville, IL", "Plano, TX", "Irvine, CA", "Bellevue, WA", "Alpharetta, GA", "Scottsdale, AZ"]
  const ruralCities = ["Burlington, VT", "Asheville, NC", "Bend, OR", "Bozeman, MT", "Santa Fe, NM"]

  const cities = locationType === "urban" ? urbanCities : locationType === "suburban" ? suburbanCities : ruralCities
  const location = cities[Math.floor(random(5) * cities.length)]

  // Education levels
  const educationLevels = ["High School", "Some College", "Bachelor's Degree", "Master's Degree", "Professional Degree", "Doctorate"]
  const educationIndex = Math.min(Math.floor(random(6) * 6), 5)
  const education = educationLevels[educationIndex]

  // Occupations based on education and income
  const occupations = [
    "Software Engineer", "Marketing Manager", "Healthcare Professional", "Financial Analyst",
    "Teacher", "Business Owner", "Consultant", "Product Manager", "Designer", "Sales Executive",
    "Engineer", "Researcher", "Attorney", "Accountant", "Project Manager"
  ]
  const occupation = occupations[Math.floor(random(7) * occupations.length)]

  // Family status
  const familyStatuses = ["Single", "In a Relationship", "Married", "Married with Children", "Single Parent", "Empty Nester"]
  const familyStatus = familyStatuses[Math.floor(random(8) * familyStatuses.length)]

  // Living arrangements
  const livingArrangements = ["Renting Apartment", "Owns Condo", "Owns House", "Living with Family", "Owns Townhouse"]
  const livingArrangement = livingArrangements[Math.floor(random(9) * livingArrangements.length)]

  // Personality traits
  const allTraits = [
    { name: "Openness", baseScore: 65 },
    { name: "Conscientiousness", baseScore: 70 },
    { name: "Extraversion", baseScore: 55 },
    { name: "Agreeableness", baseScore: 72 },
    { name: "Neuroticism", baseScore: 35 },
    { name: "Adventurousness", baseScore: 60 },
    { name: "Analytical", baseScore: 68 },
    { name: "Creative", baseScore: 62 },
  ]
  const traits = allTraits.slice(0, 5).map((t, i) => ({
    name: t.name,
    score: Math.min(100, Math.max(20, t.baseScore + Math.floor((random(10 + i) - 0.5) * 40)))
  }))

  // Values
  const allValues = [
    "Family", "Career Success", "Financial Security", "Health & Wellness", "Personal Growth",
    "Work-Life Balance", "Community", "Innovation", "Authenticity", "Sustainability",
    "Adventure", "Independence", "Creativity", "Tradition", "Social Impact"
  ]
  const values = allValues.sort(() => random(20) - 0.5).slice(0, 5)

  // Motivations
  const allMotivations = [
    "Achieving professional success", "Providing for family", "Living a healthy lifestyle",
    "Making a positive impact", "Continuous learning", "Building meaningful relationships",
    "Financial independence", "Personal fulfillment", "Leaving a legacy", "Experiencing new things"
  ]
  const motivations = allMotivations.sort(() => random(21) - 0.5).slice(0, 4)

  // Frustrations
  const allFrustrations = [
    "Not enough time in the day", "Information overload", "Rising costs of living",
    "Work-life balance challenges", "Keeping up with technology", "Finding reliable products",
    "Environmental concerns", "Healthcare complexity", "Traffic and commuting", "Social media pressure"
  ]
  const frustrations = allFrustrations.sort(() => random(22) - 0.5).slice(0, 4)

  // Interests based on audience name keywords
  const baseInterests = [
    "Technology", "Health & Fitness", "Travel", "Food & Dining", "Entertainment",
    "Sports", "Fashion", "Home & Garden", "Finance", "Arts & Culture",
    "Music", "Photography", "Reading", "Gaming", "Outdoor Activities"
  ]
  const interests = baseInterests.sort(() => random(23) - 0.5).slice(0, 6)

  // Hobbies
  const allHobbies = [
    "Running", "Yoga", "Cooking", "Photography", "Hiking", "Reading",
    "Podcasts", "DIY Projects", "Gaming", "Gardening", "Painting",
    "Playing Music", "Volunteering", "Traveling", "Wine Tasting", "Cycling"
  ]
  const hobbies = allHobbies.sort(() => random(24) - 0.5).slice(0, 5)

  // Life stages
  const lifeStages = ["Young Adult", "Early Career", "Established Professional", "Young Family", "Growing Family", "Empty Nester"]
  const lifeStage = lifeStages[Math.floor(random(25) * lifeStages.length)]

  // Social class
  const socialClasses = ["Working Class", "Middle Class", "Upper Middle Class", "Upper Class"]
  const socialClass = socialClasses[Math.floor(random(26) * socialClasses.length)]

  // Goals
  const shortTermGoals = [
    "Get a promotion", "Start exercising regularly", "Save for vacation",
    "Learn a new skill", "Improve work-life balance", "Reduce screen time",
    "Eat healthier", "Network more", "Complete a project"
  ].sort(() => random(27) - 0.5).slice(0, 3)

  const longTermGoals = [
    "Buy a home", "Retire comfortably", "Start a business",
    "Travel the world", "Write a book", "Achieve financial freedom",
    "Make a career change", "Build passive income", "Leave a legacy"
  ].sort(() => random(28) - 0.5).slice(0, 3)

  const aspirations = [
    "Become a thought leader in my field",
    "Build a life I'm proud of",
    "Make a meaningful impact on others",
    "Achieve true work-life integration",
    "Be remembered for kindness and generosity"
  ].sort(() => random(29) - 0.5).slice(0, 3)

  // Challenges
  const painPoints = [
    "Struggling to stay organized", "Overwhelmed by choices",
    "Hard to find trustworthy recommendations", "Time management issues",
    "Balancing multiple priorities", "Staying motivated"
  ].sort(() => random(30) - 0.5).slice(0, 3)

  const barriers = [
    "Limited time", "Budget constraints", "Information overload",
    "Fear of change", "Lack of support", "Geographic limitations"
  ].sort(() => random(31) - 0.5).slice(0, 3)

  const fears = [
    "Missing out on opportunities", "Not being good enough",
    "Financial instability", "Losing work-life balance",
    "Being left behind technologically", "Health issues"
  ].sort(() => random(32) - 0.5).slice(0, 3)

  // Decision making
  const influencers = [
    "Friends and Family", "Online Reviews", "Social Media Influencers",
    "Expert Opinions", "Brand Reputation", "Peer Recommendations",
    "Professional Networks", "News Sources"
  ].sort(() => random(33) - 0.5).slice(0, 4)

  const researchBehaviors = [
    "Extensive online research before any purchase",
    "Relies heavily on reviews and ratings",
    "Consults friends and family for major decisions",
    "Follows trusted influencers and experts",
    "Quick decision maker once criteria are met"
  ]
  const researchBehavior = researchBehaviors[Math.floor(random(34) * researchBehaviors.length)]

  const purchaseDrivers = [
    "Quality", "Value for Money", "Brand Trust", "Convenience",
    "Sustainability", "Innovation", "Reviews", "Recommendations"
  ].sort(() => random(35) - 0.5).slice(0, 4)

  const pricePreferences: Array<"budget" | "value" | "premium" | "luxury"> = ["budget", "value", "premium", "luxury"]
  const pricePreference = pricePreferences[Math.floor(random(36) * 4)]

  // Quotes
  const quotes = [
    `"I want products that fit seamlessly into my busy life."`,
    `"Quality matters more than quantity - I'd rather invest in fewer, better things."`,
    `"I do my research, but ultimately trust my gut and recommendations from people I know."`,
    `"Time is my most valuable resource - convenience is key."`,
    `"I care about the impact my choices have on the world."`,
    `"I'm always looking for ways to optimize and improve."`,
    `"Authenticity matters - I can spot inauthenticity a mile away."`,
    `"I value experiences over possessions."`,
  ]
  const quote = quotes[Math.floor(random(37) * quotes.length)]

  // Generate avatar URL (using UI Avatars service for demo)
  const avatar = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random&size=200`

  // Tagline based on life stage and interests
  const taglines = [
    `${lifeStage} balancing ${interests[0].toLowerCase()} and ${interests[1].toLowerCase()}`,
    `${occupation} passionate about ${interests[0].toLowerCase()}`,
    `${familyStatus} ${locationType} dweller pursuing ${values[0].toLowerCase()}`,
    `${socialClass} professional focused on ${motivations[0].toLowerCase()}`,
  ]
  const tagline = taglines[Math.floor(random(38) * taglines.length)]

  return {
    id: audienceId,
    name: `${firstName} ${lastName}.`,
    avatar,
    tagline,
    quote,
    demographics: {
      ageRange,
      gender,
      location,
      locationType,
      income,
      education,
      occupation,
      familyStatus,
      livingArrangement,
    },
    personality: {
      traits,
      values,
      motivations,
      frustrations,
    },
    lifestyle: {
      interests,
      hobbies,
      lifeStage,
      socialClass,
      techSavviness: Math.floor(random(40) * 40 + 50),
      healthConsciousness: Math.floor(random(41) * 40 + 45),
      environmentalAwareness: Math.floor(random(42) * 50 + 35),
      brandLoyalty: Math.floor(random(43) * 35 + 50),
    },
    goals: {
      shortTerm: shortTermGoals,
      longTerm: longTermGoals,
      aspirations,
    },
    challenges: {
      painPoints,
      barriers,
      fears,
    },
    decisionMaking: {
      influencers,
      researchBehavior,
      purchaseDrivers,
      pricePreference,
    },
  }
}

export function AudiencePersona({
  audienceId,
  audienceName,
  audienceCriteria,
  className,
}: AudiencePersonaProps) {
  const t = useTranslations("audiences")
  const [persona, setPersona] = useState<PersonaProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRegenerating, setIsRegenerating] = useState(false)

  useEffect(() => {
    // Simulate loading persona data
    const timer = setTimeout(() => {
      const generatedPersona = generatePersonaFromCriteria(audienceId, audienceName, audienceCriteria)
      setPersona(generatedPersona)
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [audienceId, audienceName, audienceCriteria])

  const handleRegenerate = async () => {
    setIsRegenerating(true)
    // Simulate regeneration with slight variation
    await new Promise(resolve => setTimeout(resolve, 1000))
    const newPersona = generatePersonaFromCriteria(
      audienceId + Date.now().toString(),
      audienceName,
      audienceCriteria
    )
    setPersona(newPersona)
    setIsRegenerating(false)
  }

  if (isLoading) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!persona) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="py-8 text-center text-muted-foreground">
          Unable to generate persona profile
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Representative Persona
            </CardTitle>
            <CardDescription>
              AI-generated profile representing typical audience member
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                >
                  {isRegenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="ml-2 hidden sm:inline">Regenerate</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Generate a different persona variant</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent>
        {/* Persona Header */}
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-6 pb-6 border-b">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarImage src={persona.avatar} alt={persona.name} />
              <AvatarFallback className="text-2xl">
                {persona.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-1.5">
              <User className="h-3 w-3" />
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div>
              <h3 className="text-2xl font-bold">{persona.name}</h3>
              <p className="text-sm text-muted-foreground capitalize">{persona.tagline}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {persona.demographics.location}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {persona.demographics.occupation}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <GraduationCap className="h-3 w-3" />
                {persona.demographics.education}
              </Badge>
            </div>

            <div className="flex items-start gap-2 pt-2">
              <Quote className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-sm italic text-muted-foreground">{persona.quote}</p>
            </div>
          </div>
        </div>

        {/* Tabs for detailed info */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start mb-4 flex-wrap h-auto gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="personality">Personality</TabsTrigger>
            <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
            <TabsTrigger value="goals">Goals & Challenges</TabsTrigger>
            <TabsTrigger value="decisions">Decision Making</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Demographics Card */}
              <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Demographics
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Age Range</span>
                    <span className="font-medium">{persona.demographics.ageRange}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gender</span>
                    <span className="font-medium">{persona.demographics.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Income</span>
                    <span className="font-medium">{persona.demographics.income}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Family Status</span>
                    <span className="font-medium">{persona.demographics.familyStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Living</span>
                    <span className="font-medium">{persona.demographics.livingArrangement}</span>
                  </div>
                </div>
              </div>

              {/* Life Stage Card */}
              <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  Life Stage
                </h4>
                <div className="flex items-center gap-2 mb-3">
                  {lifeStageIcons[persona.lifestyle.lifeStage] || <User className="h-4 w-4" />}
                  <span className="font-medium">{persona.lifestyle.lifeStage}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Social Class</span>
                    <span className="font-medium">{persona.lifestyle.socialClass}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location Type</span>
                    <span className="font-medium capitalize">{persona.demographics.locationType}</span>
                  </div>
                </div>
              </div>

              {/* Key Metrics Card */}
              <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Key Attributes
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Tech Savviness</span>
                      <span>{persona.lifestyle.techSavviness}%</span>
                    </div>
                    <Progress value={persona.lifestyle.techSavviness} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Health Focus</span>
                      <span>{persona.lifestyle.healthConsciousness}%</span>
                    </div>
                    <Progress value={persona.lifestyle.healthConsciousness} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Eco-Awareness</span>
                      <span>{persona.lifestyle.environmentalAwareness}%</span>
                    </div>
                    <Progress value={persona.lifestyle.environmentalAwareness} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Brand Loyalty</span>
                      <span>{persona.lifestyle.brandLoyalty}%</span>
                    </div>
                    <Progress value={persona.lifestyle.brandLoyalty} className="h-2" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Values & Interests */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  Core Values
                </h4>
                <div className="flex flex-wrap gap-2">
                  {persona.personality.values.map((value) => (
                    <Badge key={value} variant="outline">{value}</Badge>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  Top Interests
                </h4>
                <div className="flex flex-wrap gap-2">
                  {persona.lifestyle.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="flex items-center gap-1">
                      {interestIcons[interest] || <ChevronRight className="h-3 w-3" />}
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Personality Tab */}
          <TabsContent value="personality" className="space-y-4">
            {/* Personality Traits */}
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                Personality Traits
              </h4>
              <div className="grid gap-3">
                {persona.personality.traits.map((trait) => (
                  <div key={trait.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{trait.name}</span>
                      <span className="font-medium">{trait.score}%</span>
                    </div>
                    <Progress value={trait.score} className="h-2" />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Motivations */}
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  Motivations
                </h4>
                <ul className="space-y-2">
                  {persona.personality.motivations.map((motivation, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      {motivation}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Frustrations */}
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-destructive" />
                  Frustrations
                </h4>
                <ul className="space-y-2">
                  {persona.personality.frustrations.map((frustration, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      {frustration}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* Lifestyle Tab */}
          <TabsContent value="lifestyle" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Interests */}
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  Interests
                </h4>
                <div className="flex flex-wrap gap-2">
                  {persona.lifestyle.interests.map((interest) => (
                    <Badge key={interest} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Hobbies */}
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Coffee className="h-4 w-4 text-primary" />
                  Hobbies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {persona.lifestyle.hobbies.map((hobby) => (
                    <Badge key={hobby} variant="outline">
                      {hobby}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Lifestyle Metrics */}
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Lifestyle Indicators
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Tech Savviness</span>
                    <span className="font-medium">{persona.lifestyle.techSavviness}%</span>
                  </div>
                  <Progress value={persona.lifestyle.techSavviness} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Health Consciousness</span>
                    <span className="font-medium">{persona.lifestyle.healthConsciousness}%</span>
                  </div>
                  <Progress value={persona.lifestyle.healthConsciousness} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Environmental Awareness</span>
                    <span className="font-medium">{persona.lifestyle.environmentalAwareness}%</span>
                  </div>
                  <Progress value={persona.lifestyle.environmentalAwareness} className="h-3" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Brand Loyalty</span>
                    <span className="font-medium">{persona.lifestyle.brandLoyalty}%</span>
                  </div>
                  <Progress value={persona.lifestyle.brandLoyalty} className="h-3" />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Goals & Challenges Tab */}
          <TabsContent value="goals" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Short-term Goals */}
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-emerald-600">
                  <Target className="h-4 w-4" />
                  Short-term Goals
                </h4>
                <ul className="space-y-2">
                  {persona.goals.shortTerm.map((goal, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Long-term Goals */}
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-600">
                  <TrendingUp className="h-4 w-4" />
                  Long-term Goals
                </h4>
                <ul className="space-y-2">
                  {persona.goals.longTerm.map((goal, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pain Points */}
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-amber-600">
                  <Target className="h-4 w-4" />
                  Pain Points
                </h4>
                <ul className="space-y-2">
                  {persona.challenges.painPoints.map((point, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Barriers */}
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-600">
                  <Target className="h-4 w-4" />
                  Barriers
                </h4>
                <ul className="space-y-2">
                  {persona.challenges.barriers.map((barrier, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      {barrier}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Aspirations */}
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-purple-600">
                <Sparkles className="h-4 w-4" />
                Aspirations
              </h4>
              <ul className="space-y-2">
                {persona.goals.aspirations.map((aspiration, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <Star className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
                    {aspiration}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          {/* Decision Making Tab */}
          <TabsContent value="decisions" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Influencers */}
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Key Influencers
                </h4>
                <div className="flex flex-wrap gap-2">
                  {persona.decisionMaking.influencers.map((influencer) => (
                    <Badge key={influencer} variant="secondary">
                      {influencer}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Purchase Drivers */}
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                  Purchase Drivers
                </h4>
                <div className="flex flex-wrap gap-2">
                  {persona.decisionMaking.purchaseDrivers.map((driver) => (
                    <Badge key={driver} variant="outline">
                      {driver}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Research Behavior */}
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                Research Behavior
              </h4>
              <p className="text-sm">{persona.decisionMaking.researchBehavior}</p>
            </div>

            {/* Price Preference */}
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Price Preference
              </h4>
              <div className="flex items-center gap-4">
                {["budget", "value", "premium", "luxury"].map((pref) => (
                  <div
                    key={pref}
                    className={cn(
                      "px-4 py-2 rounded-lg border text-sm font-medium capitalize",
                      persona.decisionMaking.pricePreference === pref
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/30 text-muted-foreground"
                    )}
                  >
                    {pref}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
