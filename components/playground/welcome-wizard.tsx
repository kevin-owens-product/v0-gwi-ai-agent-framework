"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, ChevronLeft, Sparkles, Users, MessageSquare, Layout, X } from "lucide-react"

interface WelcomeWizardProps {
  open: boolean
  onClose: () => void
  onExampleSelect: (example: { prompt: string; agent: string }) => void
}

const stepIcons = [Sparkles, Users, MessageSquare, Layout]

const agentColors = [
  "bg-purple-500/10 text-purple-600",
  "bg-blue-500/10 text-blue-600",
  "bg-emerald-500/10 text-emerald-600",
  "bg-orange-500/10 text-orange-600",
  "bg-pink-500/10 text-pink-600",
  "bg-indigo-500/10 text-indigo-600",
]

const agentKeys = [
  "audienceExplorer",
  "personaArchitect",
  "motivationDecoder",
  "cultureTracker",
  "brandAnalyst",
  "globalPerspective",
]

const exampleKeys = [
  { key: "genZSustainability", agent: "audience-explorer" },
  { key: "socialMediaComparison", agent: "culture-tracker" },
  { key: "techEarlyAdopter", agent: "persona-architect" },
  { key: "purchaseDecisionDrivers", agent: "motivation-decoder" },
  { key: "brandLoyalty", agent: "brand-analyst" },
  { key: "usUkComparison", agent: "global-perspective" },
]

const viewModeKeys = ["chat", "canvas", "split"]

export function WelcomeWizard({ open, onClose, onExampleSelect }: WelcomeWizardProps) {
  const t = useTranslations("playground.wizard")
  const tCommon = useTranslations("common")
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < 3) {
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

  const Icon = stepIcons[currentStep]

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium">{t("steps.welcome.whatYouCanDo")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{t("steps.welcome.capability1")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{t("steps.welcome.capability2")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{t("steps.welcome.capability3")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{t("steps.welcome.capability4")}</span>
                </li>
              </ul>
            </div>
          </div>
        )
      case 1: // Agents
        return (
          <div className="grid grid-cols-2 gap-3">
            {agentKeys.map((agentKey, index) => (
              <div key={agentKey} className={`p-3 rounded-lg border ${agentColors[index]}`}>
                <div className="font-medium text-sm">{t(`steps.agents.${agentKey}.name`)}</div>
                <div className="text-xs opacity-80 mt-1">{t(`steps.agents.${agentKey}.purpose`)}</div>
              </div>
            ))}
          </div>
        )
      case 2: // Examples
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">{t("steps.examples.clickToStart")}</p>
            {exampleKeys.map(({ key, agent }) => (
              <button
                key={key}
                onClick={() => handleExampleClick({ prompt: t(`steps.examples.items.${key}.prompt`), agent })}
                className="w-full text-left p-3 border rounded-lg hover:border-primary hover:bg-accent transition-colors group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="font-medium text-sm group-hover:text-primary transition-colors">
                      {t(`steps.examples.items.${key}.title`)}
                    </div>
                    <div className="text-xs text-muted-foreground">{t(`steps.examples.items.${key}.prompt`)}</div>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {t(`steps.examples.items.${key}.category`)}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        )
      case 3: // View Modes
        return (
          <div className="space-y-3">
            {viewModeKeys.map((modeKey) => (
              <div key={modeKey} className="border rounded-lg p-3 space-y-1">
                <div className="font-medium text-sm">{t(`steps.viewModes.${modeKey}.name`)}</div>
                <div className="text-xs text-muted-foreground">{t(`steps.viewModes.${modeKey}.description`)}</div>
                <div className="text-xs text-primary mt-1">{t(`steps.viewModes.${modeKey}.bestFor`)}</div>
              </div>
            ))}
          </div>
        )
      default:
        return null
    }
  }

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
              <DialogTitle>{t(`steps.${["welcome", "agents", "examples", "viewModes"][currentStep]}.title`)}</DialogTitle>
              <DialogDescription>{t(`steps.${["welcome", "agents", "examples", "viewModes"][currentStep]}.description`)}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-[300px] py-4">
          {renderStepContent()}
        </div>

        {/* Progress Indicators */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((index) => (
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
                {tCommon("back")}
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentStep === 3 ? t("getStarted") : tCommon("next")}
              {currentStep < 3 && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>

        <div className="text-center pt-2">
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            {t("skipTutorial")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
