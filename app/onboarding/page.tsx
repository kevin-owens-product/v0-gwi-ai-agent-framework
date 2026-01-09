"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  Cpu,
  FileText,
  LayoutDashboard,
  Lightbulb,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const steps = [
  { id: 1, title: "Profile", description: "Tell us about yourself" },
  { id: 2, title: "Team", description: "Set up your workspace" },
  { id: 3, title: "Goals", description: "What do you want to achieve" },
  { id: 4, title: "Agents", description: "Choose your first agents" },
  { id: 5, title: "Complete", description: "You're all set!" },
]

const roles = [
  { value: "researcher", label: "Market Researcher", icon: Target },
  { value: "strategist", label: "Brand Strategist", icon: Lightbulb },
  { value: "analyst", label: "Data Analyst", icon: TrendingUp },
  { value: "marketer", label: "Marketing Manager", icon: Sparkles },
  { value: "executive", label: "Executive/Leadership", icon: Building2 },
  { value: "other", label: "Other", icon: Users },
]

const goals = [
  {
    value: "audience",
    label: "Understand my target audience",
    description: "Get deep insights into consumer behavior and preferences",
  },
  {
    value: "competitive",
    label: "Track competitors",
    description: "Monitor competitive landscape and market positioning",
  },
  { value: "trends", label: "Spot market trends", description: "Identify emerging trends before they go mainstream" },
  {
    value: "creative",
    label: "Improve creative strategy",
    description: "Generate data-backed creative briefs and concepts",
  },
  { value: "reports", label: "Automate reporting", description: "Generate insights reports automatically" },
  { value: "all", label: "All of the above", description: "I want the full power of GWI agents" },
]

const agentOptions = [
  {
    id: "audience-strategist",
    name: "Audience Strategist",
    description: "Build detailed audience personas from GWI data",
    icon: Target,
    recommended: true,
  },
  {
    id: "creative-brief",
    name: "Creative Brief Builder",
    description: "Generate data-driven creative briefs",
    icon: FileText,
    recommended: true,
  },
  {
    id: "competitive-tracker",
    name: "Competitive Tracker",
    description: "Monitor brand perception vs competitors",
    icon: TrendingUp,
    recommended: false,
  },
  {
    id: "trend-spotter",
    name: "Trend Spotter",
    description: "Identify emerging consumer trends",
    icon: Lightbulb,
    recommended: false,
  },
  {
    id: "media-planner",
    name: "Media Planner",
    description: "Optimize media mix recommendations",
    icon: LayoutDashboard,
    recommended: false,
  },
  {
    id: "insight-generator",
    name: "Insight Generator",
    description: "Surface key insights from data queries",
    icon: Sparkles,
    recommended: true,
  },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    jobTitle: "",
    role: "",
    companyName: "",
    teamSize: "",
    goals: [] as string[],
    selectedAgents: ["audience-strategist", "creative-brief", "insight-generator"],
  })

  const progress = (currentStep / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const toggleGoal = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal) ? prev.goals.filter((g) => g !== goal) : [...prev.goals, goal],
    }))
  }

  const toggleAgent = (agentId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedAgents: prev.selectedAgents.includes(agentId)
        ? prev.selectedAgents.filter((a) => a !== agentId)
        : [...prev.selectedAgents, agentId],
    }))
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b py-4 px-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Cpu className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">GWI</span>
          </Link>
          <div className="text-sm text-muted-foreground">
            Step {currentStep} of {steps.length}
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={cn("text-xs", step.id <= currentStep ? "text-primary" : "text-muted-foreground")}
              >
                {step.title}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 py-12 px-6">
        <div className="max-w-2xl mx-auto">
          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Welcome to GWI</h1>
                <p className="text-muted-foreground">Let's personalize your experience</p>
              </div>

              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      placeholder="Senior Market Researcher"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>What best describes your role?</Label>
                    <RadioGroup
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value })}
                      className="grid grid-cols-2 md:grid-cols-3 gap-3"
                    >
                      {roles.map((role) => (
                        <Label
                          key={role.value}
                          htmlFor={role.value}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                            formData.role === role.value ? "border-primary bg-primary/5" : "hover:border-primary/50",
                          )}
                        >
                          <RadioGroupItem value={role.value} id={role.value} className="sr-only" />
                          <role.icon className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm">{role.label}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Set up your workspace</h1>
                <p className="text-muted-foreground">Tell us about your team</p>
              </div>

              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="Acme Corp"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>How big is your team?</Label>
                    <RadioGroup
                      value={formData.teamSize}
                      onValueChange={(value) => setFormData({ ...formData, teamSize: value })}
                      className="space-y-2"
                    >
                      {[
                        { value: "1", label: "Just me" },
                        { value: "2-10", label: "2-10 people" },
                        { value: "11-50", label: "11-50 people" },
                        { value: "51-200", label: "51-200 people" },
                        { value: "200+", label: "200+ people" },
                      ].map((size) => (
                        <Label
                          key={size.value}
                          htmlFor={`size-${size.value}`}
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                            formData.teamSize === size.value
                              ? "border-primary bg-primary/5"
                              : "hover:border-primary/50",
                          )}
                        >
                          <RadioGroupItem value={size.value} id={`size-${size.value}`} />
                          <span>{size.label}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">What do you want to achieve?</h1>
                <p className="text-muted-foreground">Select all that apply</p>
              </div>

              <div className="grid gap-3">
                {goals.map((goal) => (
                  <Card
                    key={goal.value}
                    className={cn(
                      "cursor-pointer transition-colors",
                      formData.goals.includes(goal.value) ? "border-primary bg-primary/5" : "hover:border-primary/50",
                    )}
                    onClick={() => toggleGoal(goal.value)}
                  >
                    <CardContent className="flex items-center gap-4 py-4">
                      <Checkbox checked={formData.goals.includes(goal.value)} className="h-5 w-5" />
                      <div className="flex-1">
                        <div className="font-medium">{goal.label}</div>
                        <div className="text-sm text-muted-foreground">{goal.description}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Choose your first agents</h1>
                <p className="text-muted-foreground">We've pre-selected some based on your goals</p>
              </div>

              <div className="grid gap-3">
                {agentOptions.map((agent) => (
                  <Card
                    key={agent.id}
                    className={cn(
                      "cursor-pointer transition-colors",
                      formData.selectedAgents.includes(agent.id)
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50",
                    )}
                    onClick={() => toggleAgent(agent.id)}
                  >
                    <CardContent className="flex items-center gap-4 py-4">
                      <Checkbox checked={formData.selectedAgents.includes(agent.id)} className="h-5 w-5" />
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <agent.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{agent.name}</span>
                          {agent.recommended && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              Recommended
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{agent.description}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-8 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Check className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">You're all set!</h1>
                <p className="text-muted-foreground">
                  Your workspace is ready. Let's start exploring consumer insights.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>What's next?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link
                    href="/dashboard/playground"
                    className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">Try the Playground</div>
                      <div className="text-sm text-muted-foreground">Chat with your first agent</div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                  <Link
                    href="/dashboard/workflows/new"
                    className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">Create a Workflow</div>
                      <div className="text-sm text-muted-foreground">Automate multi-step research</div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <LayoutDashboard className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">Go to Dashboard</div>
                      <div className="text-sm text-muted-foreground">Explore all features</div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      {currentStep < 5 && (
        <footer className="border-t py-4 px-6">
          <div className="max-w-2xl mx-auto flex justify-between">
            <Button variant="ghost" onClick={handleBack} disabled={currentStep === 1}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleNext}>
              {currentStep === 4 ? "Complete Setup" : "Continue"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </footer>
      )}
    </div>
  )
}
