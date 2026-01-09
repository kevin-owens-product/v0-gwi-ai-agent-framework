"use client"

import { useState } from "react"
import { ExternalLink, Copy, Check, FileText, Database, TrendingUp, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface Citation {
  id: string
  title: string
  source: string
  excerpt: string
  confidence: number
  type: "survey" | "report" | "trend"
  date: string
  url?: string
}

interface SourcePreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  citation: Citation | null
}

export function SourcePreview({ open, onOpenChange, citation }: SourcePreviewProps) {
  const [copied, setCopied] = useState(false)

  if (!citation) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(citation.excerpt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "survey":
        return <Database className="w-4 h-4" />
      case "report":
        return <FileText className="w-4 h-4" />
      case "trend":
        return <TrendingUp className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-emerald-400"
    if (confidence >= 70) return "text-amber-400"
    return "text-red-400"
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] bg-card border-border">
        <SheetHeader className="pb-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">{getTypeIcon(citation.type)}</div>
              <div>
                <SheetTitle className="text-left">{citation.title}</SheetTitle>
                <p className="text-sm text-muted-foreground">{citation.source}</p>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="secondary" className="capitalize">
              {citation.type}
            </Badge>
            <span className="text-muted-foreground">{citation.date}</span>
            <span className={`font-medium ${getConfidenceColor(citation.confidence)}`}>
              {citation.confidence}% confidence
            </span>
          </div>

          {/* Citation Excerpt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">Citation</h4>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4 mr-1 text-emerald-400" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-foreground leading-relaxed">"{citation.excerpt}"</p>
            </div>
          </div>

          {/* Context */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Context</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This data point was extracted from the {citation.source} dataset. The confidence score reflects the
              relevance and recency of the data relative to your query.
            </p>
          </div>

          {/* Related Data Points */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Related Data Points</h4>
            <div className="space-y-2">
              {[
                "Gen Z values authenticity over brand prestige (87% agree)",
                "Environmental impact influences 72% of Gen Z purchase decisions",
                "Social media is primary discovery channel for 68% of Gen Z",
              ].map((point, index) => (
                <button
                  key={index}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-background border border-border hover:border-accent/50 transition-colors text-left"
                >
                  <span className="text-sm text-foreground">{point}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-border flex items-center gap-2">
          {citation.url && (
            <Button variant="outline" className="flex-1 bg-transparent">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Full Report
            </Button>
          )}
          <Button className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">Explore Data</Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
