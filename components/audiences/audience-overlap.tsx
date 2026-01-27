"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Users, CircleDot, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface Audience {
  id: string
  name: string
  size: number
  color: string
}

interface OverlapData {
  audiences: string[]
  overlapSize: number
  percentage: number
}

interface AudienceOverlapProps {
  availableAudiences: Audience[]
  className?: string
}

// Calculate overlap between audiences (mock)
function calculateOverlap(audienceIds: string[], audiences: Audience[]): OverlapData[] {
  const results: OverlapData[] = []

  if (audienceIds.length < 2) return results

  // Generate mock overlap data
  const selectedAudiences = audiences.filter(a => audienceIds.includes(a.id))

  // Pairwise overlaps
  for (let i = 0; i < audienceIds.length; i++) {
    for (let j = i + 1; j < audienceIds.length; j++) {
      const aud1 = audiences.find(a => a.id === audienceIds[i])
      const aud2 = audiences.find(a => a.id === audienceIds[j])
      if (!aud1 || !aud2) continue

      const minSize = Math.min(aud1.size, aud2.size)
      const overlapPercent = 15 + Math.random() * 30 // 15-45% overlap
      const overlapSize = Math.round(minSize * (overlapPercent / 100))

      results.push({
        audiences: [audienceIds[i], audienceIds[j]],
        overlapSize,
        percentage: Math.round(overlapPercent),
      })
    }
  }

  // Total overlap (all selected)
  if (audienceIds.length > 2) {
    const minSize = Math.min(...selectedAudiences.map(a => a.size))
    const totalOverlapPercent = 5 + Math.random() * 15 // 5-20% total overlap
    results.push({
      audiences: audienceIds,
      overlapSize: Math.round(minSize * (totalOverlapPercent / 100)),
      percentage: Math.round(totalOverlapPercent),
    })
  }

  return results
}

// Simple Venn diagram component
function VennDiagram({
  audiences,
  overlaps,
  selectedAudiences,
}: {
  audiences: Audience[]
  overlaps: OverlapData[]
  selectedAudiences: string[]
}) {
  const selected = audiences.filter(a => selectedAudiences.includes(a.id))

  if (selected.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Select audiences to view overlap
      </div>
    )
  }

  if (selected.length === 1) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div
          className="w-40 h-40 rounded-full flex items-center justify-center text-white font-medium"
          style={{ backgroundColor: selected[0].color }}
        >
          {selected[0].name}
        </div>
      </div>
    )
  }

  // 2 circles
  if (selected.length === 2) {
    const overlap = overlaps.find(o => o.audiences.length === 2)
    return (
      <div className="h-64 flex items-center justify-center relative">
        <div
          className="absolute w-36 h-36 rounded-full opacity-70 flex items-center justify-center"
          style={{
            backgroundColor: selected[0].color,
            left: "calc(50% - 90px)",
          }}
        >
          <span className="text-white text-xs font-medium text-center px-2">
            {selected[0].name}
          </span>
        </div>
        <div
          className="absolute w-36 h-36 rounded-full opacity-70 flex items-center justify-center"
          style={{
            backgroundColor: selected[1].color,
            left: "calc(50% - 54px)",
          }}
        >
          <span className="text-white text-xs font-medium text-center px-2">
            {selected[1].name}
          </span>
        </div>
        {overlap && (
          <div className="absolute z-10 bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs font-medium shadow">
            {overlap.percentage}% overlap
          </div>
        )}
      </div>
    )
  }

  // 3 circles
  if (selected.length === 3) {
    const centerOverlap = overlaps.find(o => o.audiences.length === 3)
    return (
      <div className="h-64 flex items-center justify-center relative">
        <div
          className="absolute w-32 h-32 rounded-full opacity-60"
          style={{
            backgroundColor: selected[0].color,
            top: "20%",
            left: "calc(50% - 64px)",
          }}
        />
        <div
          className="absolute w-32 h-32 rounded-full opacity-60"
          style={{
            backgroundColor: selected[1].color,
            bottom: "20%",
            left: "calc(50% - 90px)",
          }}
        />
        <div
          className="absolute w-32 h-32 rounded-full opacity-60"
          style={{
            backgroundColor: selected[2].color,
            bottom: "20%",
            right: "calc(50% - 90px)",
          }}
        />
        {centerOverlap && (
          <div className="absolute z-10 bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs font-medium shadow">
            {centerOverlap.percentage}% all
          </div>
        )}
      </div>
    )
  }

  // 4+ circles - simplified grid
  return (
    <div className="h-64 grid grid-cols-2 gap-4 p-4">
      {selected.slice(0, 4).map((aud) => (
        <div
          key={aud.id}
          className="rounded-full flex items-center justify-center p-4"
          style={{ backgroundColor: aud.color + "60" }}
        >
          <span className="text-xs font-medium text-center">{aud.name}</span>
        </div>
      ))}
    </div>
  )
}

export function AudienceOverlap({
  availableAudiences,
  className,
}: AudienceOverlapProps) {
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([])

  const overlaps = useMemo(
    () => calculateOverlap(selectedAudiences, availableAudiences),
    [selectedAudiences, availableAudiences]
  )

  const toggleAudience = (id: string) => {
    if (selectedAudiences.includes(id)) {
      setSelectedAudiences(selectedAudiences.filter(a => a !== id))
    } else if (selectedAudiences.length < 4) {
      setSelectedAudiences([...selectedAudiences, id])
    }
  }

  const formatSize = (size: number): string => {
    if (size >= 1000000) return `${(size / 1000000).toFixed(1)}M`
    if (size >= 1000) return `${(size / 1000).toFixed(0)}K`
    return size.toString()
  }

  // Calculate unique and shared sizes
  const uniqueSizes = useMemo(() => {
    if (selectedAudiences.length < 2) return {}

    const result: Record<string, number> = {}
    const selected = availableAudiences.filter(a => selectedAudiences.includes(a.id))

    for (const aud of selected) {
      const pairOverlaps = overlaps.filter(
        o => o.audiences.length === 2 && o.audiences.includes(aud.id)
      )
      const totalOverlap = pairOverlaps.reduce((sum, o) => sum + o.overlapSize, 0)
      result[aud.id] = Math.max(0, aud.size - totalOverlap)
    }

    return result
  }, [selectedAudiences, availableAudiences, overlaps])

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <CircleDot className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Audience Overlap Analysis</h3>
        <Badge variant="secondary">
          {selectedAudiences.length}/4 selected
        </Badge>
      </div>

      {/* Audience Selector */}
      <Card className="p-4">
        <Label className="text-sm font-medium mb-3 block">
          Select Audiences to Analyze (max 4)
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {availableAudiences.map((audience) => (
            <label
              key={audience.id}
              className={cn(
                "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors",
                selectedAudiences.includes(audience.id)
                  ? "border-primary bg-primary/5"
                  : "hover:bg-muted/50",
                selectedAudiences.length >= 4 && !selectedAudiences.includes(audience.id)
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              )}
            >
              <Checkbox
                checked={selectedAudiences.includes(audience.id)}
                onCheckedChange={() => toggleAudience(audience.id)}
                disabled={selectedAudiences.length >= 4 && !selectedAudiences.includes(audience.id)}
              />
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: audience.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{audience.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(audience.size)}
                </p>
              </div>
            </label>
          ))}
        </div>
      </Card>

      {/* Venn Diagram */}
      <Card className="p-4">
        <VennDiagram
          audiences={availableAudiences}
          overlaps={overlaps}
          selectedAudiences={selectedAudiences}
        />
      </Card>

      {/* Overlap Stats */}
      {selectedAudiences.length >= 2 && (
        <Card className="p-4 space-y-4">
          <h4 className="font-medium">Overlap Analysis</h4>

          {/* Unique to each audience */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Unique to Each</Label>
            {availableAudiences
              .filter(a => selectedAudiences.includes(a.id))
              .map((aud) => (
                <div
                  key={aud.id}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: aud.color }}
                    />
                    <span className="text-sm">{aud.name}</span>
                  </div>
                  <span className="text-sm font-mono">
                    {formatSize(uniqueSizes[aud.id] || 0)}
                  </span>
                </div>
              ))}
          </div>

          {/* Pairwise overlaps */}
          {overlaps.filter(o => o.audiences.length === 2).length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Pairwise Overlap</Label>
              {overlaps
                .filter(o => o.audiences.length === 2)
                .map((overlap, i) => {
                  const aud1 = availableAudiences.find(a => a.id === overlap.audiences[0])
                  const aud2 = availableAudiences.find(a => a.id === overlap.audiences[1])
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: aud1?.color }}
                        />
                        <Plus className="h-3 w-3 text-muted-foreground" />
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: aud2?.color }}
                        />
                        <span className="text-sm">
                          {aud1?.name.split(" ")[0]} & {aud2?.name.split(" ")[0]}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-mono">
                          {formatSize(overlap.overlapSize)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({overlap.percentage}%)
                        </span>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}

          {/* Total overlap */}
          {overlaps.find(o => o.audiences.length > 2) && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">All Selected</span>
                <div className="text-right">
                  <span className="text-sm font-mono font-medium">
                    {formatSize(overlaps.find(o => o.audiences.length > 2)?.overlapSize || 0)}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({overlaps.find(o => o.audiences.length > 2)?.percentage || 0}%)
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Recommendations */}
      {selectedAudiences.length >= 2 && (
        <Card className="p-4 bg-primary/5">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Recommendations
          </h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {overlaps.some(o => o.percentage > 30) && (
              <li>• High overlap detected - consider consolidating audiences</li>
            )}
            {overlaps.every(o => o.percentage < 20) && (
              <li>• Low overlap - audiences are distinct, good for A/B testing</li>
            )}
            <li>• Create a combined audience to reach shared consumers once</li>
            <li>• Use exclusions to target unique-only segments</li>
          </ul>
        </Card>
      )}
    </div>
  )
}
