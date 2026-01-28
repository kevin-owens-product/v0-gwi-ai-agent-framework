"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import {
  Search,
  FileText,
  Users,
  TrendingUp,
  Sparkles,
  Globe,
  BarChart3,
  Lightbulb,
  Megaphone,
  Target,
  Clock,
  ArrowRight,
} from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTemplate: (prompt: string) => void
}

// Templates are now defined inside the component to use translations

export function CommandPalette({ open, onOpenChange, onSelectTemplate }: CommandPaletteProps) {
  const t = useTranslations("playground.commandPalette")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Build templates with translated content
  const recentTemplates = [
    {
      id: 1,
      name: t("templates.creativeBrief.name"),
      icon: Megaphone,
      prompt: t("templates.creativeBrief.prompt"),
    },
    {
      id: 2,
      name: t("templates.audienceProfile.name"),
      icon: Users,
      prompt: t("templates.audienceProfile.prompt"),
    },
    {
      id: 3,
      name: t("templates.trendAnalysis.name"),
      icon: TrendingUp,
      prompt: t("templates.trendAnalysis.prompt"),
    },
  ]

  const allTemplates = [
    {
      id: 1,
      name: t("templates.creativeBrief.name"),
      icon: Megaphone,
      category: t("categories.briefs"),
      prompt: t("templates.creativeBrief.prompt"),
    },
    {
      id: 2,
      name: t("templates.audienceProfile.name"),
      icon: Users,
      category: t("categories.research"),
      prompt: t("templates.audienceProfile.prompt"),
    },
    {
      id: 3,
      name: t("templates.trendAnalysis.name"),
      icon: TrendingUp,
      category: t("categories.analysis"),
      prompt: t("templates.trendAnalysis.prompt"),
    },
    {
      id: 4,
      name: t("templates.competitiveLandscape.name"),
      icon: Target,
      category: t("categories.analysis"),
      prompt: t("templates.competitiveLandscape.prompt"),
    },
    {
      id: 5,
      name: t("templates.marketEntry.name"),
      icon: Globe,
      category: t("categories.research"),
      prompt: t("templates.marketEntry.prompt"),
    },
    {
      id: 6,
      name: t("templates.consumerInsight.name"),
      icon: Lightbulb,
      category: t("categories.research"),
      prompt: t("templates.consumerInsight.prompt"),
    },
    {
      id: 7,
      name: t("templates.campaignDebrief.name"),
      icon: BarChart3,
      category: t("categories.analysis"),
      prompt: t("templates.campaignDebrief.prompt"),
    },
    {
      id: 8,
      name: t("templates.presentationNarrative.name"),
      icon: FileText,
      category: t("categories.briefs"),
      prompt: t("templates.presentationNarrative.prompt"),
    },
  ]

  const filteredTemplates = searchQuery
    ? allTemplates.filter(
        (template) =>
          template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          template.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : allTemplates

  useEffect(() => {
    setSelectedIndex(0)
  }, [searchQuery])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev < filteredTemplates.length - 1 ? prev + 1 : prev))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
      } else if (e.key === "Enter") {
        e.preventDefault()
        if (filteredTemplates[selectedIndex]) {
          onSelectTemplate(filteredTemplates[selectedIndex].prompt)
          onOpenChange(false)
          setSearchQuery("")
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, filteredTemplates, selectedIndex, onSelectTemplate, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
        <div className="flex items-center border-b border-border px-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">ESC</span>
          </kbd>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {!searchQuery && (
            <div className="px-2 py-2">
              <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-3 h-3" />
                {t("recent")}
              </p>
              {recentTemplates.map((template, index) => (
                <button
                  key={template.id}
                  className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors ${
                    selectedIndex === index ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                  }`}
                  onClick={() => {
                    onSelectTemplate(template.prompt)
                    onOpenChange(false)
                    setSearchQuery("")
                  }}
                >
                  <div className="p-1.5 rounded bg-muted">
                    <template.icon className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-sm">{template.name}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}

          <div className="px-2 py-2">
            <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              {searchQuery ? t("results") : t("allTemplates")}
            </p>
            {filteredTemplates.map((template, index) => {
              const adjustedIndex = searchQuery ? index : index + recentTemplates.length
              return (
                <button
                  key={template.id}
                  className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors ${
                    selectedIndex === adjustedIndex ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                  }`}
                  onClick={() => {
                    onSelectTemplate(template.prompt)
                    onOpenChange(false)
                    setSearchQuery("")
                  }}
                >
                  <div className="p-1.5 rounded bg-muted">
                    <template.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm block">{template.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {template.category}
                  </Badge>
                </button>
              )
            })}
          </div>
        </div>

        <div className="border-t border-border px-3 py-2 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded border bg-muted font-mono text-[10px]">↑↓</kbd>
            <span>{t("navigate")}</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded border bg-muted font-mono text-[10px]">↵</kbd>
            <span>{t("select")}</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded border bg-muted font-mono text-[10px]">ESC</kbd>
            <span>{t("close")}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
