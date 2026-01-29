"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Loader2, Users, Sparkles } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LookalikeAudienceGeneratorProps {
  sourceAudienceId: string
  onLookalikeGenerated: (criteria: unknown, estimatedSize: number) => void
}

export function LookalikeAudienceGenerator({
  sourceAudienceId,
  onLookalikeGenerated,
}: LookalikeAudienceGeneratorProps) {
  const [similarityThreshold, setSimilarityThreshold] = useState([5]) // 5% default
  const [excludeOverlap, setExcludeOverlap] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    criteria: unknown
    estimatedSize: number
    similarity: number
    overlap: number
    differentiators: Array<{ dimension: string; sourceValue: string; lookalikeValue: string; reason: string }>
  } | null>(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/v1/audiences/lookalike", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceAudienceId,
          similarityThreshold: similarityThreshold[0] / 100, // Convert to decimal
          excludeOverlap,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to generate lookalike audience")
      }

      const data = await response.json()
      setResult(data.lookalike)
      onLookalikeGenerated(data.lookalike.criteria, data.lookalike.estimatedSize)
    } catch (err) {
      console.error("Error generating lookalike:", err)
      setError(err instanceof Error ? err.message : "Failed to generate lookalike audience")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Generate Lookalike Audience
        </CardTitle>
        <CardDescription>
          Create a similar audience based on this audience's characteristics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Similarity Threshold: {similarityThreshold[0]}%</Label>
          <Slider
            value={similarityThreshold}
            onValueChange={setSimilarityThreshold}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Higher values create more similar audiences (1-10%)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="excludeOverlap"
            checked={excludeOverlap}
            onChange={(e) => setExcludeOverlap(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="excludeOverlap" className="text-sm">
            Exclude overlapping users
          </Label>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-3 p-3 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Similarity</span>
              <Badge>{Math.round(result.similarity * 100)}%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overlap</span>
              <Badge variant="secondary">{Math.round(result.overlap * 100)}%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Estimated Size</span>
              <span className="font-bold">
                {result.estimatedSize >= 1000000
                  ? `${(result.estimatedSize / 1000000).toFixed(1)}M`
                  : result.estimatedSize >= 1000
                  ? `${(result.estimatedSize / 1000).toFixed(0)}K`
                  : result.estimatedSize}
              </span>
            </div>
            {result.differentiators.length > 0 && (
              <div className="space-y-1 pt-2 border-t">
                <div className="text-xs font-medium text-muted-foreground">Key Differences</div>
                {result.differentiators.map((diff, index) => (
                  <div key={index} className="text-xs">
                    <span className="font-medium capitalize">{diff.dimension}:</span> {diff.reason}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Button
          className="w-full"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Users className="h-4 w-4 mr-2" />
              Generate Lookalike
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
