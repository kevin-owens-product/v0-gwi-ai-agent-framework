"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, ChevronLeft, Sparkles, Users, MessageSquare, Layout, X } from "lucide-react"

interface WelcomeWizardProps {
  open: boolean
  onClose: () => void
  onExampleSelect: (example: { prompt: string; agent: string }) => void
}

const wizardSteps = [
  {
    title: "Welcome to the Playground",
    icon: Sparkles,
    description: "Your AI-powered insights sandbox for exploring consumer data, creating personas, and uncovering behavioral patterns.",
    content: (
      <div className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium">What you can do:</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Ask questions about consumer segments in natural language</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Generate charts, tables, and personas from GWI data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Switch between 6 specialized AI agents for different analyses</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Save your work and share insights with your team</span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    title: "Choose Your AI Agent",
    icon: Users,
    description: "Select from specialized agents designed for different types of consumer insights.",
    content: (
      <div className="grid grid-cols-2 gap-3">
        {[
          { name: "Audience Explorer", purpose: "Segment analysis & profiling", color: "bg-purple-500/10 text-purple-600" },
          { name: "Persona Architect", purpose: "Rich persona creation", color: "bg-blue-500/10 text-blue-600" },
          { name: "Motivation Decoder", purpose: "Behavioral 'why' analysis", color: "bg-emerald-500/10 text-emerald-600" },
          { name: "Culture Tracker", purpose: "Trends & cultural shifts", color: "bg-orange-500/10 text-orange-600" },
          { name: "Brand Analyst", purpose: "Brand relationships", color: "bg-pink-500/10 text-pink-600" },
          { name: "Global Perspective", purpose: "Cross-market insights", color: "bg-indigo-500/10 text-indigo-600" },
        ].map((agent) => (
          <div key={agent.name} className={`p-3 rounded-lg border ${agent.color}`}>
            <div className="font-medium text-sm">{agent.name}</div>
            <div className="text-xs opacity-80 mt-1">{agent.purpose}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Explore Examples",
    icon: MessageSquare,
    description: "Get started quickly with these common use cases.",
    content: null, // Will be filled with examples dynamically
  },
  {
    title: "View Modes",
    icon: Layout,
    description: "Switch between different layouts based on your workflow.",
    content: (
      <div className="space-y-3">
        {[
          {
            mode: "Chat Mode",
            description: "Conversational interface for exploratory questions",
            use: "Best for: Quick questions, iterative analysis",
          },
          {
            mode: "Canvas Mode",
            description: "Visual workspace with all output blocks in a grid",
            use: "Best for: Presentations, comparing multiple insights",
          },
          {
            mode: "Split View",
            description: "Chat on left, canvas on right for simultaneous work",
            use: "Best for: Building reports while refining queries",
          },
        ].map((viewMode) => (
          <div key={viewMode.mode} className="border rounded-lg p-3 space-y-1">
            <div className="font-medium text-sm">{viewMode.mode}</div>
            <div className="text-xs text-muted-foreground">{viewMode.description}</div>
            <div className="text-xs text-primary mt-1">{viewMode.use}</div>
          </div>
        ))}
      </div>
    ),
  },
]

const examplePrompts = [
  {
    title: "Gen Z Sustainability Analysis",
    prompt: "Analyze Gen Z's attitudes toward sustainability and eco-friendly purchasing behavior",
    agent: "audience-explorer",
    category: "Audience Research",
  },
  {
    title: "Social Media Usage Comparison",
    prompt: "Compare social media platform usage between Millennials and Gen X",
    agent: "culture-tracker",
    category: "Trend Analysis",
  },
  {
    title: "Tech Early Adopter Persona",
    prompt: "Create a detailed persona for tech early adopters aged 25-35 in urban markets",
    agent: "persona-architect",
    category: "Persona Development",
  },
  {
    title: "Purchase Decision Drivers",
    prompt: "What motivates consumers to choose sustainable brands over traditional alternatives?",
    agent: "motivation-decoder",
    category: "Behavioral Insights",
  },
  {
    title: "Brand Loyalty by Generation",
    prompt: "Analyze brand loyalty differences across generational cohorts",
    agent: "brand-analyst",
    category: "Brand Strategy",
  },
  {
    title: "US vs UK Market Comparison",
    prompt: "Compare consumer behaviors and preferences between US and UK markets",
    agent: "global-perspective",
    category: "Market Analysis",
  },
]

export function WelcomeWizard({ open, onClose, onExampleSelect }: WelcomeWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      onClose()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleExampleClick = (example: { prompt: string; agent: string }) => {
    onExampleSelect(example)
    onClose()
  }

  const currentStepData = wizardSteps[currentStep]
  const Icon = currentStepData.icon

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle>{currentStepData.title}</DialogTitle>
              <DialogDescription>{currentStepData.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-[300px] py-4">
          {/* Examples Step - Custom Content */}
          {currentStep === 2 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">Click any example to start exploring:</p>
              {examplePrompts.map((example) => (
                <button
                  key={example.title}
                  onClick={() => handleExampleClick({ prompt: example.prompt, agent: example.agent })}
                  className="w-full text-left p-3 border rounded-lg hover:border-primary hover:bg-accent transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="font-medium text-sm group-hover:text-primary transition-colors">
                        {example.title}
                      </div>
                      <div className="text-xs text-muted-foreground">{example.prompt}</div>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {example.category}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            currentStepData.content
          )}
        </div>

        {/* Progress Indicators */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-1">
            {wizardSteps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-8 rounded-full transition-colors ${
                  index === currentStep ? "bg-primary" : index < currentStep ? "bg-primary/50" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentStep === wizardSteps.length - 1 ? "Get Started" : "Next"}
              {currentStep < wizardSteps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>

        <div className="text-center pt-2">
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Skip tutorial
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
