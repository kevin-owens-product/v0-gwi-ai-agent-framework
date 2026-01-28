"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FolderOpen, Plus, Clock, Star, MoreVertical, Trash2, Edit2, Copy } from "lucide-react"

interface Workspace {
  id: string
  name: string
  description?: string
  agent: string
  messageCount: number
  lastAccessed: string
  starred: boolean
  created: string
}

interface WorkspaceManagerProps {
  currentWorkspaceName?: string
  onLoadWorkspace: (workspace: Workspace) => void
  onSaveWorkspace: (name: string, description?: string) => void
  onCreateNew: () => void
}

export function WorkspaceManager({
  currentWorkspaceName,
  onLoadWorkspace,
  onSaveWorkspace,
  onCreateNew,
}: WorkspaceManagerProps) {
  const t = useTranslations("playground.workspaceManager")
  const tCommon = useTranslations("common")
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [workspaceName, setWorkspaceName] = useState("")
  const [workspaceDescription, setWorkspaceDescription] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "starred" | "recent">("recent")

  // Demo workspaces - in production, these would come from API
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    {
      id: "1",
      name: "Gen Z Sustainability Research",
      description: "Analysis of Gen Z attitudes toward eco-friendly brands",
      agent: "Audience Explorer",
      messageCount: 15,
      lastAccessed: "2 hours ago",
      starred: true,
      created: "2026-01-08",
    },
    {
      id: "2",
      name: "Social Media Trends Q4",
      description: "Platform usage comparison across demographics",
      agent: "Culture Tracker",
      messageCount: 23,
      lastAccessed: "5 hours ago",
      starred: true,
      created: "2026-01-07",
    },
    {
      id: "3",
      name: "Tech Early Adopter Persona",
      description: "Detailed persona development for 25-35 age group",
      agent: "Persona Architect",
      messageCount: 8,
      lastAccessed: "1 day ago",
      starred: false,
      created: "2026-01-06",
    },
    {
      id: "4",
      name: "Brand Loyalty Study",
      description: "Cross-generational brand relationship analysis",
      agent: "Brand Analyst",
      messageCount: 12,
      lastAccessed: "2 days ago",
      starred: false,
      created: "2026-01-05",
    },
    {
      id: "5",
      name: "US vs UK Market Compare",
      description: "Consumer behavior comparison between markets",
      agent: "Global Perspective",
      messageCount: 19,
      lastAccessed: "3 days ago",
      starred: false,
      created: "2026-01-04",
    },
  ])

  const handleSaveWorkspace = () => {
    if (!workspaceName.trim()) return
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      onSaveWorkspace(workspaceName, workspaceDescription)
      setWorkspaceName("")
      setWorkspaceDescription("")
      setIsSaving(false)
      // In production, would add to workspaces list from API response
    }, 500)
  }

  const handleToggleStar = (id: string) => {
    setWorkspaces((prev) =>
      prev.map((ws) => (ws.id === id ? { ...ws, starred: !ws.starred } : ws))
    )
  }

  const handleDuplicate = (workspace: Workspace) => {
    const newWorkspace = {
      ...workspace,
      id: Date.now().toString(),
      name: `${workspace.name} (Copy)`,
      created: new Date().toISOString().split("T")[0],
      lastAccessed: "Just now",
    }
    setWorkspaces((prev) => [newWorkspace, ...prev])
  }

  const handleDelete = (id: string) => {
    setWorkspaces((prev) => prev.filter((ws) => ws.id !== id))
  }

  const filteredWorkspaces = workspaces.filter((ws) => {
    if (activeTab === "starred") return ws.starred
    if (activeTab === "recent") return true // Already sorted by recency
    return true
  })

  return (
    <>
      {/* Save Current Workspace Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FolderOpen className="h-4 w-4 mr-2" />
            {currentWorkspaceName || t("saveWorkspace")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("saveWorkspace")}</DialogTitle>
            <DialogDescription>
              {t("saveDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">{t("workspaceName")}</Label>
              <Input
                id="workspace-name"
                placeholder={t("workspaceNamePlaceholder")}
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace-description">{t("descriptionLabel")}</Label>
              <Input
                id="workspace-description"
                placeholder={t("descriptionPlaceholder")}
                value={workspaceDescription}
                onChange={(e) => setWorkspaceDescription(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setWorkspaceName("")}>
              {tCommon("cancel")}
            </Button>
            <Button onClick={handleSaveWorkspace} disabled={!workspaceName.trim() || isSaving}>
              {isSaving ? t("saving") : t("saveWorkspace")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Workspace Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Clock className="h-4 w-4 mr-2" />
            {t("workspaces")}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("yourWorkspaces")}</DialogTitle>
            <DialogDescription>
              {t("loadDescription")}
            </DialogDescription>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b">
            <button
              onClick={() => setActiveTab("recent")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "recent"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("recent")}
            </button>
            <button
              onClick={() => setActiveTab("starred")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "starred"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Star className="h-3.5 w-3.5 inline mr-1" />
              {t("starred")}
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "all"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("all")}
            </button>
            <div className="ml-auto">
              <Button size="sm" onClick={onCreateNew}>
                <Plus className="h-4 w-4 mr-1" />
                {t("newWorkspace")}
              </Button>
            </div>
          </div>

          {/* Workspace List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredWorkspaces.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{t("noWorkspaces")}</p>
              </div>
            ) : (
              filteredWorkspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  className="border rounded-lg p-3 hover:border-primary transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      onClick={() => {
                        onLoadWorkspace(workspace)
                        setIsOpen(false)
                      }}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium group-hover:text-primary transition-colors">
                          {workspace.name}
                        </h4>
                        {workspace.starred && <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />}
                      </div>
                      {workspace.description && (
                        <p className="text-sm text-muted-foreground mt-1">{workspace.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {workspace.agent}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {t("messagesCount", { count: workspace.messageCount })}
                        </span>
                        <span className="text-xs text-muted-foreground">{workspace.lastAccessed}</span>
                      </div>
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleToggleStar(workspace.id)}>
                          <Star className="h-4 w-4 mr-2" />
                          {workspace.starred ? t("unstar") : t("star")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(workspace)}>
                          <Copy className="h-4 w-4 mr-2" />
                          {tCommon("duplicate")}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit2 className="h-4 w-4 mr-2" />
                          {t("rename")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(workspace.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {tCommon("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
