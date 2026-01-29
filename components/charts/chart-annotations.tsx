"use client"

import React, { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Pin, X, Plus, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

export interface Annotation {
  id: string
  x: number
  y: number
  content: string
  author: string
  authorAvatar?: string
  createdAt: Date
  isPinned: boolean
  color?: string
}

interface ChartAnnotationsProps {
  annotations: Annotation[]
  onAnnotationAdd?: (annotation: Omit<Annotation, "id" | "createdAt">) => void
  onAnnotationUpdate?: (id: string, updates: Partial<Annotation>) => void
  onAnnotationDelete?: (id: string) => void
  chartWidth?: number
  chartHeight?: number
  className?: string
}

export function ChartAnnotations({
  annotations,
  onAnnotationAdd,
  onAnnotationUpdate,
  onAnnotationDelete,
  chartWidth = 800,
  chartHeight = 400,
  className,
}: ChartAnnotationsProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<{ x: number; y: number } | null>(null)
  const [newAnnotation, setNewAnnotation] = useState({ content: "", isPinned: false, color: "#3b82f6" })
  const chartRef = useRef<HTMLDivElement>(null)

  const handleChartClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!chartRef.current) return
    const rect = chartRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setSelectedPosition({ x, y })
    setShowAddDialog(true)
  }

  const handleAddAnnotation = () => {
    if (!selectedPosition || !newAnnotation.content.trim()) return

    if (onAnnotationAdd) {
      onAnnotationAdd({
        x: selectedPosition.x,
        y: selectedPosition.y,
        content: newAnnotation.content,
        author: "Current User", // In production, get from auth
        isPinned: newAnnotation.isPinned,
        color: newAnnotation.color,
      })
    }

    setShowAddDialog(false)
    setSelectedPosition(null)
    setNewAnnotation({ content: "", isPinned: false, color: "#3b82f6" })
  }

  return (
    <div className={cn("relative", className)}>
      <div
        ref={chartRef}
        className="relative border rounded-lg bg-background cursor-crosshair"
        style={{ width: chartWidth, height: chartHeight }}
        onClick={handleChartClick}
      >
        {/* Render annotations as overlays */}
        {annotations.map((annotation) => (
          <div
            key={annotation.id}
            className="absolute group"
            style={{
              left: `${annotation.x}%`,
              top: `${annotation.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className={cn(
                "w-3 h-3 rounded-full border-2 border-white shadow-lg cursor-pointer transition-all",
                "hover:scale-150 hover:z-50",
                annotation.isPinned && "ring-2 ring-primary"
              )}
              style={{ backgroundColor: annotation.color || "#3b82f6" }}
            >
              <div className="absolute left-1/2 top-full mt-2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                <Card className="w-64 p-2 shadow-lg">
                  <div className="flex items-start gap-2">
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: annotation.color || "#3b82f6" }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">{annotation.author}</span>
                        {annotation.isPinned && <Pin className="h-3 w-3 text-primary" />}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatDistanceToNow(annotation.createdAt, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{annotation.content}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        ))}

        {/* Click hint */}
        {annotations.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Click on the chart to add an annotation</p>
            </div>
          </div>
        )}
      </div>

      {/* Annotations List */}
      {annotations.length > 0 && (
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Annotations ({annotations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {annotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: annotation.color || "#3b82f6" }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{annotation.author}</span>
                        {annotation.isPinned && (
                          <Badge variant="outline" className="text-xs">
                            <Pin className="h-3 w-3 mr-1" />
                            Pinned
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatDistanceToNow(annotation.createdAt, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{annotation.content}</p>
                      <div className="text-xs text-muted-foreground mt-1">
                        Position: ({annotation.x.toFixed(1)}%, {annotation.y.toFixed(1)}%)
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onAnnotationDelete?.(annotation.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Add Annotation Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Annotation</DialogTitle>
            <DialogDescription>
              Add a comment or note at position ({selectedPosition?.x.toFixed(1)}%, {selectedPosition?.y.toFixed(1)}%)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Annotation Text</Label>
              <Textarea
                placeholder="Enter your annotation..."
                value={newAnnotation.content}
                onChange={(e) => setNewAnnotation({ ...newAnnotation, content: e.target.value })}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      newAnnotation.color === color ? "border-foreground scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewAnnotation({ ...newAnnotation, color })}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pin-annotation"
                checked={newAnnotation.isPinned}
                onChange={(e) => setNewAnnotation({ ...newAnnotation, isPinned: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="pin-annotation" className="text-sm cursor-pointer">
                Pin this annotation
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAnnotation} disabled={!newAnnotation.content.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Annotation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
