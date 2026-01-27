"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageSquare,
  Layout,
  Columns,
  BarChart3,
  Table,
  ImageIcon,
  Presentation,
  Code,
  Users,
  GitCompare,
  Plus,
  Wand2,
  Sparkles,
  Brain,
} from "lucide-react"
import { usePlayground } from "@/app/dashboard/playground/page"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const outputTypeKeys = [
  { id: "chart", icon: BarChart3, key: "outputs.chart" },
  { id: "table", icon: Table, key: "outputs.table" },
  { id: "persona", icon: Users, key: "outputs.persona" },
  { id: "slides", icon: Presentation, key: "outputs.slides" },
  { id: "comparison", icon: GitCompare, key: "outputs.compare" },
  { id: "image", icon: ImageIcon, key: "outputs.image" },
  { id: "code", icon: Code, key: "outputs.export" },
]

export function PlaygroundToolbar() {
  const t = useTranslations("playground.toolbar")
  const { mode, setMode, config, setConfig, isStreaming, addOutput } = usePlayground()

  const handleAutoGenerate = () => {
    // Generate a chart and table together
    addOutput("chart")
    setTimeout(() => addOutput("table"), 100)
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
      <div className="flex items-center gap-4">
        {/* Mode Switcher */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as "chat" | "canvas" | "split")}>
          <TabsList className="bg-secondary/50 h-8">
            <TabsTrigger value="chat" className="text-xs h-7 px-3 gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              {t("modes.chat")}
            </TabsTrigger>
            <TabsTrigger value="canvas" className="text-xs h-7 px-3 gap-1.5">
              <Layout className="h-3.5 w-3.5" />
              {t("modes.canvas")}
            </TabsTrigger>
            <TabsTrigger value="split" className="text-xs h-7 px-3 gap-1.5">
              <Columns className="h-3.5 w-3.5" />
              {t("modes.split")}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="h-4 w-px bg-border" />

        {/* Output Type Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-2 text-xs bg-transparent" disabled={isStreaming}>
              <Plus className="h-3.5 w-3.5" />
              {t("addOutput")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {outputTypeKeys.map((type) => (
              <DropdownMenuItem
                key={type.id}
                className="gap-3 py-2 cursor-pointer"
                onClick={() => addOutput(type.id as "chart" | "table" | "persona" | "slides" | "comparison" | "image" | "code")}
              >
                <type.icon className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{t(`${type.key}.label`)}</span>
                  <span className="text-xs text-muted-foreground">{t(`${type.key}.description`)}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick Actions */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2 text-xs"
          disabled={isStreaming}
          onClick={handleAutoGenerate}
        >
          <Wand2 className="h-3.5 w-3.5" />
          {t("autoGenerate")}
        </Button>
      </div>

      <div className="flex items-center gap-3">
        {/* Reasoning Mode Toggle */}
        <Button
          variant={config.reasoningMode ? "secondary" : "ghost"}
          size="sm"
          className={cn("h-8 gap-2 text-xs", config.reasoningMode && "bg-accent/20 text-accent")}
          onClick={() => setConfig((prev) => ({ ...prev, reasoningMode: !prev.reasoningMode }))}
        >
          <Brain className="h-3.5 w-3.5" />
          {t("reasoning")}
          {config.reasoningMode && (
            <Badge variant="secondary" className="ml-1 h-4 text-[10px] px-1 bg-accent/30">
              {t("on")}
            </Badge>
          )}
        </Button>

        {/* Model Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/50">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span className="text-xs font-medium">{config.model}</span>
        </div>
      </div>
    </div>
  )
}
