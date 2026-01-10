"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Users,
  Target,
  Sparkles,
  RefreshCw,
  Check,
  Plus,
  TrendingUp,
  Percent,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface LookalikeAudience {
  id: string
  name: string
  description: string
  estimatedSize: number
  overlapPercentage: number
  uniquePercentage: number
  keyDifferentiators: string[]
  similarity: number
}

interface LookalikeGeneratorProps {
  sourceAudienceId: string
  sourceAudienceName: string
  onCreateLookalike?: (lookalike: LookalikeAudience, name: string) => void
  className?: string
}

export function LookalikeGenerator({
  sourceAudienceId,
  sourceAudienceName,
  onCreateLookalike,
  className,
}: LookalikeGeneratorProps) {
  const [lookalikes, setLookalikes] = useState<LookalikeAudience[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [similarityThreshold, setSimilarityThreshold] = useState([0.6])
  const [selectedLookalike, setSelectedLookalike] = useState<LookalikeAudience | null>(null)
  const [newName, setNewName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const fetchLookalikes = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(
        `/api/v1/audiences/${sourceAudienceId}/lookalike?similarity=${similarityThreshold[0]}`
      )

      if (!response.ok) throw new Error("Failed to fetch lookalikes")

      const data = await response.json()
      if (data.success && data.data) {
        setLookalikes(data.data.lookalikes)
      }
    } catch (err) {
      setError("Failed to generate lookalike audiences")
      console.error("Lookalike error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLookalikes()
  }, [sourceAudienceId])

  const handleSimilarityChange = (value: number[]) => {
    setSimilarityThreshold(value)
  }

  const handleCreateLookalike = async () => {
    if (!selectedLookalike) return

    setIsCreating(true)
    try {
      const response = await fetch(`/api/v1/audiences/${sourceAudienceId}/lookalike`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedLookalikeId: selectedLookalike.id,
          name: newName || selectedLookalike.name,
        }),
      })

      if (response.ok) {
        onCreateLookalike?.(selectedLookalike, newName || selectedLookalike.name)
        setShowCreateDialog(false)
        setSelectedLookalike(null)
        setNewName("")
      }
    } catch (err) {
      console.error("Create lookalike error:", err)
    } finally {
      setIsCreating(false)
    }
  }

  const formatSize = (size: number): string => {
    if (size >= 1000000) return `${(size / 1000000).toFixed(1)}M`
    if (size >= 1000) return `${(size / 1000).toFixed(0)}K`
    return size.toString()
  }

  const getSimilarityColor = (similarity: number): string => {
    if (similarity >= 0.8) return "text-green-600 bg-green-100 dark:bg-green-900/30"
    if (similarity >= 0.7) return "text-blue-600 bg-blue-100 dark:bg-blue-900/30"
    return "text-amber-600 bg-amber-100 dark:bg-amber-900/30"
  }

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          <h3 className="font-semibold">Lookalike Audiences</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-destructive">
            <Target className="h-5 w-5" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLookalikes}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Lookalike Audiences</h3>
          <Badge variant="secondary">{lookalikes.length} found</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchLookalikes}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Source Info */}
      <Card className="p-3 bg-muted/50">
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Based on:</span>
          <span className="font-medium">{sourceAudienceName}</span>
        </div>
      </Card>

      {/* Similarity Threshold */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Similarity Threshold</Label>
          <span className="text-sm text-muted-foreground">
            {Math.round(similarityThreshold[0] * 100)}%
          </span>
        </div>
        <Slider
          value={similarityThreshold}
          onValueChange={handleSimilarityChange}
          onValueCommit={fetchLookalikes}
          min={0.5}
          max={0.95}
          step={0.05}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Broader reach</span>
          <span>Higher similarity</span>
        </div>
      </div>

      {/* Lookalike List */}
      <div className="space-y-3">
        {lookalikes.map((lookalike) => (
          <Card
            key={lookalike.id}
            className={cn(
              "p-4 cursor-pointer transition-all hover:border-primary",
              selectedLookalike?.id === lookalike.id && "border-primary bg-primary/5"
            )}
            onClick={() => setSelectedLookalike(lookalike)}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{lookalike.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatSize(lookalike.estimatedSize)} consumers
                  </p>
                </div>
                <Badge className={cn("text-xs", getSimilarityColor(lookalike.similarity))}>
                  {Math.round(lookalike.similarity * 100)}% similar
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <Percent className="h-3 w-3 text-blue-500" />
                  <span>{lookalike.overlapPercentage}% overlap</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span>{lookalike.uniquePercentage}% unique</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {lookalike.keyDifferentiators.map((diff, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {diff}
                  </Badge>
                ))}
              </div>

              {selectedLookalike?.id === lookalike.id && (
                <Button
                  size="sm"
                  className="w-full mt-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    setNewName(lookalike.name)
                    setShowCreateDialog(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create This Audience
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {lookalikes.length === 0 && (
        <Card className="p-8 text-center">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h4 className="font-medium mb-2">No lookalikes at this threshold</h4>
          <p className="text-sm text-muted-foreground">
            Try lowering the similarity threshold to find more audiences
          </p>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Create Lookalike Audience
            </DialogTitle>
            <DialogDescription>
              This will create a new audience based on the selected lookalike profile.
            </DialogDescription>
          </DialogHeader>

          {selectedLookalike && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Audience Name</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={selectedLookalike.name}
                />
              </div>

              <Card className="p-3 bg-muted/50">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Estimated Size</p>
                    <p className="font-medium">{formatSize(selectedLookalike.estimatedSize)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Similarity</p>
                    <p className="font-medium">{Math.round(selectedLookalike.similarity * 100)}%</p>
                  </div>
                </div>
              </Card>

              <div>
                <p className="text-sm font-medium mb-2">Key Characteristics</p>
                <div className="flex flex-wrap gap-2">
                  {selectedLookalike.keyDifferentiators.map((diff, i) => (
                    <Badge key={i} variant="secondary">
                      {diff}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateLookalike} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Create Audience
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
