"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Download,
  Share2,
  RotateCcw,
  Sparkles,
  Check,
  Copy,
  FileJson,
  FileText,
  FileCode,
  PanelRightOpen,
  PanelRightClose,
  Workflow,
  HelpCircle,
} from "lucide-react"
import { usePlayground } from "@/app/dashboard/playground/page"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { WorkspaceManager } from "@/components/playground/workspace-manager"

const agentNames: Record<string, string> = {
  "audience-explorer": "Audience Explorer",
  "persona-architect": "Persona Architect",
  "motivation-decoder": "Motivation Decoder",
  "culture-tracker": "Culture Tracker",
  "brand-analyst": "Brand Relationship Analyst",
  "global-perspective": "Global Perspective Agent",
}

export function PlaygroundHeader() {
  const { config, messages, resetChat, contextPanelOpen, setContextPanelOpen, customAgent, setShowWelcome, setConfig: _setConfig, setMessages: _setMessages } = usePlayground()
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false)
  const [currentWorkspace, setCurrentWorkspace] = useState<string>()
  const [copied, setCopied] = useState(false)

  const handleLoadWorkspace = (workspace: any) => {
    // In production, load workspace data from API
    setCurrentWorkspace(workspace.name)
    // Would set config and messages here
  }

  const handleSaveWorkspace = (name: string, _description?: string) => {
    setCurrentWorkspace(name)
    // In production, save to API
  }

  const handleCreateNew = () => {
    setCurrentWorkspace(undefined)
    resetChat()
  }

  const handleShare = () => {
    const shareUrl = `https://gwi-insights.app/shared/${Math.random().toString(36).substring(7)}`
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExport = (format: "json" | "markdown" | "txt") => {
    let content = ""
    let filename = `gwi-conversation-${new Date().toISOString().split("T")[0]}`
    let mimeType = "text/plain"

    if (format === "json") {
      content = JSON.stringify(
        {
          agent: config.selectedAgent,
          dataSources: config.selectedSources,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
            citations: m.citations,
          })),
          exportedAt: new Date().toISOString(),
        },
        null,
        2,
      )
      filename += ".json"
      mimeType = "application/json"
    } else if (format === "markdown") {
      content = `# GWI Insights Conversation\n\n`
      content += `**Agent**: ${agentNames[config.selectedAgent] || config.selectedAgent}\n`
      content += `**Date**: ${new Date().toLocaleDateString()}\n\n---\n\n`
      messages.forEach((m) => {
        content += `### ${m.role === "user" ? "You" : "Agent"}\n\n${m.content}\n\n`
        if (m.citations) {
          content += `*Sources: ${m.citations.map((c) => `${c.source} (${c.confidence}%)`).join(", ")}*\n\n`
        }
      })
      filename += ".md"
      mimeType = "text/markdown"
    } else {
      messages.forEach((m) => {
        content += `[${m.role.toUpperCase()}]\n${m.content}\n\n`
      })
      filename += ".txt"
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">Agent Playground</h1>
              <p className="text-xs text-muted-foreground">Interactive insights workspace</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs font-medium">
            {customAgent?.name || agentNames[config.selectedAgent] || config.selectedAgent}
          </Badge>
          {config.enableMemory && (
            <Badge variant="outline" className="text-xs text-emerald-500 border-emerald-500/30">
              Memory Active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="gap-2 h-8 text-xs" onClick={resetChat}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>

          <WorkspaceManager
            currentWorkspaceName={currentWorkspace}
            onLoadWorkspace={handleLoadWorkspace}
            onSaveWorkspace={handleSaveWorkspace}
            onCreateNew={handleCreateNew}
          />

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowWelcome(true)} title="Show tutorial">
            <HelpCircle className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="sm" className="gap-2 h-8 text-xs" onClick={() => setShowWorkflowDialog(true)}>
            <Workflow className="h-3.5 w-3.5" />
            To Workflow
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 h-8 text-xs">
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("json")}>
                <FileJson className="h-4 w-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("markdown")}>
                <FileCode className="h-4 w-4 mr-2" />
                Export as Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("txt")}>
                <FileText className="h-4 w-4 mr-2" />
                Export as Text
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="secondary" size="sm" className="gap-2 h-8 text-xs" onClick={() => setShowShareDialog(true)}>
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            variant={contextPanelOpen ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setContextPanelOpen(!contextPanelOpen)}
          >
            {contextPanelOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Conversation</DialogTitle>
            <DialogDescription>Share this conversation with your team members.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Shareable Link</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`https://gwi-insights.app/shared/${Math.random().toString(36).substring(7)}`}
                  className="bg-secondary"
                />
                <Button onClick={handleShare}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Anyone with this link can view this conversation. The link expires in 7 days.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showWorkflowDialog} onOpenChange={setShowWorkflowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert to Workflow</DialogTitle>
            <DialogDescription>Transform this conversation into a reusable automated workflow.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input id="workflow-name" placeholder="e.g., Weekly Gen Z Analysis" />
            </div>
            <div className="space-y-2">
              <Label>Detected Steps</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs font-medium text-accent">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Data Query</p>
                    <p className="text-xs text-muted-foreground">Fetch from GWI Core</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs font-medium text-accent">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Audience Analysis</p>
                    <p className="text-xs text-muted-foreground">Run Audience Explorer agent</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs font-medium text-accent">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Generate Output</p>
                    <p className="text-xs text-muted-foreground">Create report with insights</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowWorkflowDialog(false)}>
                Cancel
              </Button>
              <Button>
                <Workflow className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
