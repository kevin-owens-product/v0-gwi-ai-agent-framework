"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  History,
  ArrowLeftRight,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Edit3,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface VersionChange {
  field: string
  oldValue: string
  newValue: string
  type: "added" | "removed" | "modified"
}

interface Version {
  id: string
  version: number
  createdAt: string
  createdBy: {
    name: string
    email: string
    avatar?: string
  }
  description: string
  changes: VersionChange[]
  isCurrent: boolean
}

interface VersionHistoryProps {
  resourceType: "audience" | "crosstab"
  resourceId: string
  resourceName: string
  versions: Version[]
  onRestore?: (versionId: string) => void
  className?: string
}

// Mock version data generator
function generateMockVersions(_resourceId: string, resourceName: string): Version[] {
  const users = [
    { name: "Sarah Chen", email: "sarah@example.com" },
    { name: "Marcus Johnson", email: "marcus@example.com" },
    { name: "Emily Thompson", email: "emily@example.com" },
  ]

  const changes: VersionChange[][] = [
    [
      { field: "name", oldValue: resourceName, newValue: resourceName, type: "modified" },
    ],
    [
      { field: "description", oldValue: "Original description", newValue: "Updated description with more details", type: "modified" },
      { field: "criteria.age", oldValue: "25-35", newValue: "25-40", type: "modified" },
    ],
    [
      { field: "criteria.interests", oldValue: "", newValue: "sustainability, technology", type: "added" },
    ],
    [
      { field: "markets", oldValue: "US, UK", newValue: "US, UK, DE", type: "modified" },
      { field: "criteria.income", oldValue: "75000", newValue: "100000", type: "modified" },
    ],
    [
      { field: "criteria.behavior", oldValue: "online_shopper", newValue: "", type: "removed" },
      { field: "criteria.education", oldValue: "", newValue: "bachelors+", type: "added" },
    ],
  ]

  const now = new Date()
  const versions: Version[] = []

  for (let i = 0; i < 5; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000 * (1 + Math.random() * 3))
    versions.push({
      id: `v${5 - i}`,
      version: 5 - i,
      createdAt: date.toISOString(),
      createdBy: users[i % users.length],
      description: i === 0 ? "Latest changes" : `Version ${5 - i} updates`,
      changes: changes[i] || [],
      isCurrent: i === 0,
    })
  }

  return versions
}

export function VersionHistory({
  resourceType: _resourceType,
  resourceId,
  resourceName,
  versions: providedVersions,
  onRestore,
  className,
}: VersionHistoryProps) {
  const versions = providedVersions.length > 0
    ? providedVersions
    : generateMockVersions(resourceId, resourceName)

  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set([versions[0]?.id]))
  const [compareMode, setCompareMode] = useState(false)
  const [compareVersions, setCompareVersions] = useState<[string, string] | null>(null)
  const [restoreVersion, setRestoreVersion] = useState<Version | null>(null)

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedVersions)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedVersions(newExpanded)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getChangeIcon = (type: VersionChange["type"]) => {
    switch (type) {
      case "added":
        return <Plus className="h-3 w-3 text-green-500" />
      case "removed":
        return <Minus className="h-3 w-3 text-red-500" />
      case "modified":
        return <Edit3 className="h-3 w-3 text-blue-500" />
    }
  }

  const getChangeColor = (type: VersionChange["type"]) => {
    switch (type) {
      case "added":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "removed":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      case "modified":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
    }
  }

  const handleRestore = (version: Version) => {
    setRestoreVersion(version)
  }

  const confirmRestore = () => {
    if (restoreVersion && onRestore) {
      onRestore(restoreVersion.id)
    }
    setRestoreVersion(null)
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Version History</h3>
          <Badge variant="secondary">{versions.length} versions</Badge>
        </div>
        <Button
          variant={compareMode ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setCompareMode(!compareMode)
            setCompareVersions(null)
          }}
        >
          <ArrowLeftRight className="h-4 w-4 mr-2" />
          {compareMode ? "Exit Compare" : "Compare"}
        </Button>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

        {/* Version items */}
        <div className="space-y-4">
          {versions.map((version, _index) => (
            <div key={version.id} className="relative pl-12">
              {/* Timeline dot */}
              <div
                className={cn(
                  "absolute left-3.5 w-3 h-3 rounded-full border-2 bg-background",
                  version.isCurrent
                    ? "border-primary bg-primary"
                    : "border-muted-foreground"
                )}
              />

              <Card
                className={cn(
                  "p-4 transition-all",
                  expandedVersions.has(version.id) && "border-primary/50",
                  compareMode && "cursor-pointer hover:border-primary"
                )}
                onClick={() => {
                  if (compareMode) {
                    if (!compareVersions) {
                      setCompareVersions([version.id, ""])
                    } else if (compareVersions[0] && !compareVersions[1]) {
                      setCompareVersions([compareVersions[0], version.id])
                    } else {
                      setCompareVersions([version.id, ""])
                    }
                  }
                }}
              >
                {/* Version Header */}
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={(e) => {
                    if (!compareMode) {
                      e.stopPropagation()
                      toggleExpanded(version.id)
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={version.createdBy.avatar} />
                      <AvatarFallback>
                        {version.createdBy.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">v{version.version}</span>
                        {version.isCurrent && (
                          <Badge variant="default" className="text-xs">Current</Badge>
                        )}
                        {compareMode && compareVersions?.includes(version.id) && (
                          <Badge variant="secondary" className="text-xs">
                            Selected {compareVersions[0] === version.id ? "A" : "B"}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{version.createdBy.name}</span>
                        <span>•</span>
                        <span>{formatDate(version.createdAt)} at {formatTime(version.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!version.isCurrent && !compareMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRestore(version)
                        }}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Restore
                      </Button>
                    )}
                    {!compareMode && (
                      expandedVersions.has(version.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedVersions.has(version.id) && !compareMode && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <p className="text-sm text-muted-foreground">{version.description}</p>

                    {version.changes.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-medium text-muted-foreground">Changes</span>
                        {version.changes.map((change, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 p-2 bg-muted/50 rounded text-sm"
                          >
                            {getChangeIcon(change.type)}
                            <div className="flex-1">
                              <span className="font-mono text-xs">{change.field}</span>
                              <div className="flex items-center gap-2 mt-1">
                                {change.oldValue && (
                                  <span className="text-muted-foreground line-through text-xs">
                                    {change.oldValue}
                                  </span>
                                )}
                                {change.oldValue && change.newValue && (
                                  <span className="text-muted-foreground">→</span>
                                )}
                                {change.newValue && (
                                  <Badge className={cn("text-xs", getChangeColor(change.type))}>
                                    {change.newValue}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Compare View */}
      {compareMode && compareVersions && compareVersions[0] && compareVersions[1] && (
        <Card className="p-4 bg-muted/50">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            Comparing Versions
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Badge variant="secondary" className="mb-2">Version A</Badge>
              <p className="text-sm">
                v{versions.find(v => v.id === compareVersions[0])?.version}
              </p>
            </div>
            <div>
              <Badge variant="secondary" className="mb-2">Version B</Badge>
              <p className="text-sm">
                v{versions.find(v => v.id === compareVersions[1])?.version}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Restore Dialog */}
      <Dialog open={!!restoreVersion} onOpenChange={() => setRestoreVersion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Restore Version
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to restore to version {restoreVersion?.version}?
              This will create a new version with the restored content.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreVersion(null)}>
              Cancel
            </Button>
            <Button onClick={confirmRestore}>
              Restore Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
