"use client"

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

const outputTypes = [
  { id: "chart", icon: BarChart3, label: "Chart", description: "Create data visualization" },
  { id: "table", icon: Table, label: "Table", description: "Generate data table" },
  { id: "persona", icon: Users, label: "Persona", description: "Build consumer persona" },
  { id: "slides", icon: Presentation, label: "Slides", description: "Create presentation" },
  { id: "comparison", icon: GitCompare, label: "Compare", description: "Side-by-side analysis" },
  { id: "image", icon: ImageIcon, label: "Image", description: "Generate visual" },
  { id: "code", icon: Code, label: "Export", description: "Export as code/data" },
]

export function PlaygroundToolbar() {
  const { mode, setMode, config, setConfig, isStreaming } = usePlayground()

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
      <div className="flex items-center gap-4">
        {/* Mode Switcher */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
          <TabsList className="bg-secondary/50 h-8">
            <TabsTrigger value="chat" className="text-xs h-7 px-3 gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="canvas" className="text-xs h-7 px-3 gap-1.5">
              <Layout className="h-3.5 w-3.5" />
              Canvas
            </TabsTrigger>
            <TabsTrigger value="split" className="text-xs h-7 px-3 gap-1.5">
              <Columns className="h-3.5 w-3.5" />
              Split
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="h-4 w-px bg-border" />

        {/* Output Type Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-2 text-xs bg-transparent">
              <Plus className="h-3.5 w-3.5" />
              Add Output
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {outputTypes.map((type) => (
              <DropdownMenuItem key={type.id} className="gap-3 py-2">
                <type.icon className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{type.label}</span>
                  <span className="text-xs text-muted-foreground">{type.description}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick Actions */}
        <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs" disabled={isStreaming}>
          <Wand2 className="h-3.5 w-3.5" />
          Auto-Generate
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
          Reasoning
          {config.reasoningMode && (
            <Badge variant="secondary" className="ml-1 h-4 text-[10px] px-1 bg-accent/30">
              ON
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
