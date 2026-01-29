"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Users, TrendingUp, TrendingDown, Minus, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface AudienceComparisonProps {
  baseAudienceId: string
  onCompareClick?: () => void
}

interface ComparisonData {
  base: {
    id: string
    name: string
    size: number | null
    criteria: unknown
  }
  comparisons: Array<{
    audience: {
      id: string
      name: string
      size: number | null
    }
    differences: Array<{
      dimension: string
      baseValue: string | number | [number, number]
      compareValue: string | number | [number, number]
      significance: "high" | "medium" | "low"
    }>
    overlap: number
    similarity: number
  }>
  summary: {
    keyDifferentiators: Array<{
      dimension: string
      values: Record<string, string | number>
      significance: "high" | "medium" | "low"
    }>
    sizeComparison: Record<string, number>
  }
}

export function AudienceComparison({ baseAudienceId, onCompareClick }: AudienceComparisonProps) {
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([])
  const [availableAudiences, setAvailableAudiences] = useState<Array<{ id: string; name: string }>>([])
  const [comparison, setComparison] = useState<ComparisonData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch available audiences for comparison
    fetch("/api/v1/audiences?limit=50")
      .then((res) => res.json())
      .then((data) => {
        const audiences = (data.audiences || data.data || []).filter(
          (a: { id: string }) => a.id !== baseAudienceId
        )
        setAvailableAudiences(audiences.slice(0, 10)) // Limit to 10 for dropdown
      })
      .catch(console.error)
  }, [baseAudienceId])

  const handleCompare = async () => {
    if (selectedAudiences.length === 0) {
      setError("Please select at least one audience to compare")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const compareWith = selectedAudiences.join(",")
      const response = await fetch(
        `/api/v1/audiences/${baseAudienceId}/compare?compareWith=${compareWith}`,
        {
          credentials: "include",
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to compare audiences")
      }

      const data = await response.json()
      setComparison(data.comparison)
      onCompareClick?.()
    } catch (err) {
      console.error("Error comparing audiences:", err)
      setError(err instanceof Error ? err.message : "Failed to compare audiences")
    } finally {
      setIsLoading(false)
    }
  }

  const formatValue = (value: string | number | [number, number]): string => {
    if (Array.isArray(value)) {
      return `${value[0]}-${value[1]}`
    }
    return String(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Compare Audiences
        </CardTitle>
        <CardDescription>
          Compare this audience with up to 3 others to identify key differences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select audiences to compare</label>
          <div className="flex flex-wrap gap-2">
            {availableAudiences.map((audience) => (
              <Badge
                key={audience.id}
                variant={selectedAudiences.includes(audience.id) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  if (selectedAudiences.includes(audience.id)) {
                    setSelectedAudiences(selectedAudiences.filter((id) => id !== audience.id))
                  } else if (selectedAudiences.length < 3) {
                    setSelectedAudiences([...selectedAudiences, audience.id])
                  }
                }}
              >
                {audience.name}
                {selectedAudiences.includes(audience.id) && (
                  <X className="h-3 w-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
          {selectedAudiences.length >= 3 && (
            <p className="text-xs text-muted-foreground">
              Maximum 3 audiences can be compared at once
            </p>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          className="w-full"
          onClick={handleCompare}
          disabled={isLoading || selectedAudiences.length === 0}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Comparing...
            </>
          ) : (
            <>
              <Users className="h-4 w-4 mr-2" />
              Compare
            </>
          )}
        </Button>

        {comparison && (
          <div className="space-y-4 pt-4 border-t">
            {/* Key Differentiators */}
            {comparison.summary.keyDifferentiators.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Key Differentiators</h4>
                <div className="space-y-2">
                  {comparison.summary.keyDifferentiators.map((diff, index) => (
                    <div key={index} className="p-2 border rounded-lg">
                      <div className="text-sm font-medium capitalize mb-1">{diff.dimension}</div>
                      <div className="space-y-1 text-xs">
                        {Object.entries(diff.values).map(([name, value]) => (
                          <div key={name} className="flex justify-between">
                            <span className="text-muted-foreground">{name}:</span>
                            <span className="font-medium">{formatValue(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Size Comparison */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Size Comparison</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Audience</TableHead>
                    <TableHead className="text-right">Size</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(comparison.summary.sizeComparison).map(([name, size]) => (
                    <TableRow key={name}>
                      <TableCell>{name}</TableCell>
                      <TableCell className="text-right">
                        {size >= 1000000
                          ? `${(size / 1000000).toFixed(1)}M`
                          : size >= 1000
                          ? `${(size / 1000).toFixed(0)}K`
                          : size}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Detailed Comparisons */}
            {comparison.comparisons.map((comp) => (
              <div key={comp.audience.id} className="space-y-2 p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{comp.audience.name}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {Math.round(comp.similarity * 100)}% similar
                    </Badge>
                    <Badge variant="outline">
                      {Math.round(comp.overlap * 100)}% overlap
                    </Badge>
                  </div>
                </div>
                {comp.differences.length > 0 && (
                  <div className="space-y-1 text-xs">
                    {comp.differences.slice(0, 5).map((diff, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-muted-foreground capitalize">{diff.dimension}:</span>
                        <div className="flex items-center gap-2">
                          <span>{formatValue(diff.baseValue)}</span>
                          <Minus className="h-3 w-3" />
                          <span>{formatValue(diff.compareValue)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
