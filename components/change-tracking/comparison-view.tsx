"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeftRight,
  Plus,
  Minus,
  Edit3,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface FieldDelta {
  field: string
  oldValue: unknown
  newValue: unknown
  changeType: "added" | "removed" | "modified"
  isSignificant: boolean
  changePercent?: number
}

interface VersionComparison {
  entityType: string
  entityId: string
  before: {
    version: number
    data: Record<string, unknown>
    createdAt: string
  }
  after: {
    version: number
    data: Record<string, unknown>
    createdAt: string
  }
  delta: {
    fields: FieldDelta[]
    changedFieldNames: string[]
    hasSignificantChanges: boolean
    summary: string
  }
}

interface Version {
  version: number
  createdAt: string
}

interface ComparisonViewProps {
  entityType: string
  entityId: string
  entityName?: string
  initialV1?: number
  initialV2?: number
  className?: string
}

export function ComparisonView({
  entityType,
  entityId,
  entityName,
  initialV1,
  initialV2,
  className,
}: ComparisonViewProps) {
  const [comparison, setComparison] = useState<VersionComparison | null>(null)
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedV1, setSelectedV1] = useState<number | null>(initialV1 ?? null)
  const [selectedV2, setSelectedV2] = useState<number | null>(initialV2 ?? null)
  const [viewMode, setViewMode] = useState<"side-by-side" | "unified">("side-by-side")

  useEffect(() => {
    fetchVersions()
  }, [entityType, entityId])

  useEffect(() => {
    if (selectedV1 && selectedV2) {
      fetchComparison()
    }
  }, [selectedV1, selectedV2])

  const fetchVersions = async () => {
    try {
      const response = await fetch(`/api/v1/versions/${entityType}/${entityId}?limit=100`)
      if (response.ok) {
        const data = await response.json()
        const versionList = data.versions.map((v: { version: number; createdAt: string }) => ({
          version: v.version,
          createdAt: v.createdAt,
        }))
        setVersions(versionList)

        // Auto-select latest two versions if not specified
        if (!selectedV1 && !selectedV2 && versionList.length >= 2) {
          setSelectedV1(versionList[1].version)
          setSelectedV2(versionList[0].version)
        } else if (!selectedV1 && versionList.length >= 1) {
          setSelectedV1(versionList[versionList.length - 1].version)
        } else if (!selectedV2 && versionList.length >= 1) {
          setSelectedV2(versionList[0].version)
        }
      }
    } catch (error) {
      console.error("Failed to fetch versions:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchComparison = async () => {
    if (!selectedV1 || !selectedV2) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/v1/versions/${entityType}/${entityId}/compare?v1=${selectedV1}&v2=${selectedV2}`
      )
      if (response.ok) {
        const data = await response.json()
        setComparison(data)
      }
    } catch (error) {
      console.error("Failed to fetch comparison:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "-"
    if (typeof value === "object") return JSON.stringify(value, null, 2)
    return String(value)
  }

  const getChangeIcon = (changeType: FieldDelta["changeType"]) => {
    switch (changeType) {
      case "added":
        return <Plus className="h-4 w-4 text-green-500" />
      case "removed":
        return <Minus className="h-4 w-4 text-red-500" />
      case "modified":
        return <Edit3 className="h-4 w-4 text-blue-500" />
    }
  }

  const getChangeColor = (changeType: FieldDelta["changeType"]) => {
    switch (changeType) {
      case "added":
        return "bg-green-50 dark:bg-green-900/20"
      case "removed":
        return "bg-red-50 dark:bg-red-900/20"
      case "modified":
        return "bg-blue-50 dark:bg-blue-900/20"
    }
  }

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? "+" : ""
    return `${sign}${(value * 100).toFixed(1)}%`
  }

  const swapVersions = () => {
    const temp = selectedV1
    setSelectedV1(selectedV2)
    setSelectedV2(temp)
  }

  if (loading && versions.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Compare Versions</h3>
            {entityName && <Badge variant="secondary">{entityName}</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "side-by-side" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("side-by-side")}
            >
              Side by Side
            </Button>
            <Button
              variant={viewMode === "unified" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("unified")}
            >
              Unified
            </Button>
          </div>
        </div>

        {/* Version Selectors */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              From (Older)
            </label>
            <Select
              value={selectedV1?.toString()}
              onValueChange={(v) => setSelectedV1(parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((v) => (
                  <SelectItem key={v.version} value={v.version.toString()}>
                    v{v.version} - {formatDate(v.createdAt)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="ghost" size="icon" onClick={swapVersions} className="mt-5">
            <ArrowLeftRight className="h-4 w-4" />
          </Button>

          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              To (Newer)
            </label>
            <Select
              value={selectedV2?.toString()}
              onValueChange={(v) => setSelectedV2(parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((v) => (
                  <SelectItem key={v.version} value={v.version.toString()}>
                    v{v.version} - {formatDate(v.createdAt)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Comparison Results */}
      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : comparison ? (
        <div className="space-y-4">
          {/* Summary */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{comparison.delta.summary}</h4>
                <p className="text-sm text-muted-foreground">
                  {comparison.delta.fields.length} field{comparison.delta.fields.length !== 1 ? "s" : ""} changed
                </p>
              </div>
              {comparison.delta.hasSignificantChanges && (
                <Badge variant="outline" className="text-amber-600 border-amber-600">
                  Significant Changes
                </Badge>
              )}
            </div>
          </Card>

          {/* Changes */}
          {viewMode === "side-by-side" ? (
            <Card className="overflow-hidden">
              <div className="grid grid-cols-2 divide-x">
                <div className="p-4 bg-muted/30">
                  <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    Version {comparison.before.version}
                    <span className="text-xs text-muted-foreground">
                      ({formatDate(comparison.before.createdAt)})
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-muted/30">
                  <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    Version {comparison.after.version}
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-xs text-muted-foreground">
                      ({formatDate(comparison.after.createdAt)})
                    </span>
                  </div>
                </div>
              </div>

              {comparison.delta.fields.map((field) => (
                <div
                  key={field.field}
                  className={cn("grid grid-cols-2 divide-x border-t", getChangeColor(field.changeType))}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getChangeIcon(field.changeType)}
                      <span className="font-mono text-sm font-medium">{field.field}</span>
                      {field.isSignificant && (
                        <Badge variant="outline" className="text-xs">
                          Significant
                        </Badge>
                      )}
                    </div>
                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap break-words bg-background/50 p-2 rounded">
                      {field.changeType === "added" ? "-" : formatValue(field.oldValue)}
                    </pre>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {field.changePercent !== undefined && (
                        <Badge
                          variant={field.changePercent >= 0 ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {field.changePercent >= 0 ? (
                            <ArrowUp className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDown className="h-3 w-3 mr-1" />
                          )}
                          {formatPercent(field.changePercent)}
                        </Badge>
                      )}
                    </div>
                    <pre className="text-sm whitespace-pre-wrap break-words bg-background/50 p-2 rounded">
                      {field.changeType === "removed" ? "-" : formatValue(field.newValue)}
                    </pre>
                  </div>
                </div>
              ))}
            </Card>
          ) : (
            <Card className="divide-y">
              {comparison.delta.fields.map((field) => (
                <div key={field.field} className={cn("p-4", getChangeColor(field.changeType))}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getChangeIcon(field.changeType)}
                      <span className="font-mono text-sm font-medium">{field.field}</span>
                      {field.isSignificant && (
                        <Badge variant="outline" className="text-xs">
                          Significant
                        </Badge>
                      )}
                    </div>
                    {field.changePercent !== undefined && (
                      <Badge
                        variant={field.changePercent >= 0 ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {field.changePercent >= 0 ? (
                          <ArrowUp className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDown className="h-3 w-3 mr-1" />
                        )}
                        {formatPercent(field.changePercent)}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">Before</span>
                      <pre className="text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap break-words bg-red-50 dark:bg-red-900/20 p-2 rounded">
                        {field.changeType === "added" ? "(not set)" : formatValue(field.oldValue)}
                      </pre>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">After</span>
                      <pre className="text-sm text-green-600 dark:text-green-400 whitespace-pre-wrap break-words bg-green-50 dark:bg-green-900/20 p-2 rounded">
                        {field.changeType === "removed" ? "(removed)" : formatValue(field.newValue)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <ArrowLeftRight className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h4 className="font-medium mb-2">Select Versions to Compare</h4>
          <p className="text-sm text-muted-foreground">
            Choose two versions above to see the differences.
          </p>
        </Card>
      )}
    </div>
  )
}
