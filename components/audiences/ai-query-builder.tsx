"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Loader2, X, AlertCircle, CheckCircle2, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"

interface ParsedAttribute {
  dimension: string
  operator: string
  value: string
  confidence: number
  source: string
}

interface AIQueryBuilderProps {
  onAttributesGenerated: (attributes: ParsedAttribute[]) => void
  onEstimatedSizeChange: (size: number) => void
  markets: string[]
  initialQuery?: string
}

export function AIQueryBuilder({
  onAttributesGenerated,
  onEstimatedSizeChange,
  markets,
  initialQuery = "",
}: AIQueryBuilderProps) {
  const [query, setQuery] = useState(initialQuery)
  const [isProcessing, setIsProcessing] = useState(false)
  const [attributes, setAttributes] = useState<ParsedAttribute[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [summary, setSummary] = useState("")
  const [error, setError] = useState("")

  // Debounced auto-parse
  useEffect(() => {
    if (query.length < 10) return

    const timer = setTimeout(() => {
      handleParse(true) // silent parse
    }, 800)

    return () => clearTimeout(timer)
  }, [query])

  const handleParse = useCallback(async (silent = false) => {
    if (!query.trim()) {
      setError("Please enter a description of your target audience")
      return
    }

    if (!silent) setIsProcessing(true)
    setError("")

    try {
      const response = await fetch("/api/v1/audiences/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, markets }),
      })

      if (!response.ok) {
        throw new Error("Failed to parse query")
      }

      const data = await response.json()

      if (data.success && data.data) {
        setAttributes(data.data.attributes)
        setSuggestions(data.data.suggestions)
        setSummary(data.data.naturalLanguageSummary)
        onAttributesGenerated(data.data.attributes)
        onEstimatedSizeChange(data.data.estimatedSize)
      }
    } catch (err) {
      if (!silent) {
        setError("Failed to process your query. Please try again.")
      }
      console.error("Parse error:", err)
    } finally {
      if (!silent) setIsProcessing(false)
    }
  }, [query, markets, onAttributesGenerated, onEstimatedSizeChange])

  const removeAttribute = (index: number) => {
    const newAttributes = attributes.filter((_, i) => i !== index)
    setAttributes(newAttributes)
    onAttributesGenerated(newAttributes)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-600 bg-green-100 dark:bg-green-900/30"
    if (confidence >= 0.7) return "text-amber-600 bg-amber-100 dark:bg-amber-900/30"
    return "text-red-600 bg-red-100 dark:bg-red-900/30"
  }

  const formatDimension = (dimension: string) => {
    return dimension.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatValue = (value: string) => {
    // Format income values
    if (value.match(/^\d+$/)) {
      const num = parseInt(value)
      if (num >= 1000) return `$${(num / 1000).toFixed(0)}K+`
      return value
    }
    return value.replace(/_/g, " ").replace(/,/g, ", ")
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">AI-Powered Query Builder</h2>
      </div>

      <p className="text-sm text-muted-foreground">
        Describe your target audience in natural language. Our AI will extract the key attributes and estimate the audience size.
      </p>

      <Textarea
        placeholder="e.g., Millennials who care about sustainability, live in urban areas, have high income, and are interested in technology and travel"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        rows={3}
        className="resize-none"
      />

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <Button
        onClick={() => handleParse(false)}
        disabled={isProcessing || !query.trim()}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Attributes
          </>
        )}
      </Button>

      {/* Generated Attributes */}
      {attributes.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Generated Criteria</h3>
            <span className="text-xs text-muted-foreground">
              {attributes.length} attribute{attributes.length !== 1 ? "s" : ""} detected
            </span>
          </div>

          <div className="space-y-2">
            {attributes.map((attr, index) => (
              <div
                key={`${attr.dimension}-${index}`}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {formatDimension(attr.dimension)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {attr.operator}
                      </Badge>
                      <span className="text-sm">
                        {formatValue(attr.value)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        from: "{attr.source}"
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={cn("text-xs", getConfidenceColor(attr.confidence))}
                  >
                    {Math.round(attr.confidence * 100)}%
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeAttribute(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          {summary && (
            <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
              <p className="text-sm">{summary}</p>
            </div>
          )}
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Suggestions
          </div>
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <p
                key={index}
                className="text-sm text-muted-foreground pl-6"
              >
                • {suggestion}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Example queries */}
      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground mb-2">Try these examples:</p>
        <div className="flex flex-wrap gap-2">
          {[
            "Gen Z who love gaming and tech",
            "Affluent millennials interested in sustainability",
            "Parents in suburban areas who shop online",
            "Health-conscious urban professionals",
          ].map((example) => (
            <button
              key={example}
              onClick={() => setQuery(example)}
              className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded-full transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </Card>
  )
}
