"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Wand2 } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ParsedCriteria {
  dimension: string
  operator: string
  value: string | number | [number, number]
  confidence: number
}

interface ParseResult {
  criteria: ParsedCriteria[]
  confidence: number
  suggestions: Array<{ dimension: string; operator: string; value: string; reason: string }>
  estimatedSize: number
}

interface AIAudienceBuilderProps {
  onCriteriaGenerated: (criteria: ParsedCriteria[], estimatedSize: number) => void
  initialQuery?: string
  markets?: string[]
}

export function AIAudienceBuilder({
  onCriteriaGenerated,
  initialQuery = "",
  markets = ["Global"],
}: AIAudienceBuilderProps) {
  const [query, setQuery] = useState(initialQuery)
  const [isParsing, setIsParsing] = useState(false)
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const debouncedQuery = useDebounce(query, 500)

  // Auto-parse when query changes (debounced)
  useEffect(() => {
    if (debouncedQuery.trim().length > 10 && !isParsing) {
      handleParse()
    }
  }, [debouncedQuery])

  const handleParse = useCallback(async () => {
    if (!query.trim() || query.trim().length < 10) {
      setError("Please enter at least 10 characters")
      return
    }

    setIsParsing(true)
    setError(null)

    try {
      const response = await fetch("/api/v1/audiences/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          context: { markets },
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to parse query")
      }

      const result = await response.json()
      setParseResult(result)
      setShowSuggestions(result.suggestions?.length > 0)

      // Auto-generate criteria if confidence is high
      if (result.confidence > 0.7 && result.criteria.length > 0) {
        onCriteriaGenerated(result.criteria, result.estimatedSize)
      }
    } catch (err) {
      console.error("Error parsing query:", err)
      setError(err instanceof Error ? err.message : "Failed to parse query")
    } finally {
      setIsParsing(false)
    }
  }, [query, markets, onCriteriaGenerated])

  const handleApplySuggestion = useCallback(
    (suggestion: { dimension: string; operator: string; value: string }) => {
      const newCriteria: ParsedCriteria = {
        dimension: suggestion.dimension,
        operator: suggestion.operator,
        value: suggestion.value,
        confidence: 0.8,
      }

      if (parseResult) {
        const updatedCriteria = [...parseResult.criteria, newCriteria]
        setParseResult({
          ...parseResult,
          criteria: updatedCriteria,
        })
        onCriteriaGenerated(updatedCriteria, parseResult.estimatedSize)
      }
    },
    [parseResult, onCriteriaGenerated]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI-Powered Audience Builder
        </CardTitle>
        <CardDescription>
          Describe your audience in natural language. We'll automatically generate criteria for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            ref={textareaRef}
            placeholder="e.g., Millennials aged 25-35 who are interested in sustainability and shop online..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{query.length} characters</span>
            {isParsing && (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Analyzing...
              </span>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {parseResult && (
          <div className="space-y-4">
            {/* Generated Criteria */}
            {parseResult.criteria.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Generated Criteria</h4>
                  <Badge variant={parseResult.confidence > 0.7 ? "default" : "secondary"}>
                    {Math.round(parseResult.confidence * 100)}% confidence
                  </Badge>
                </div>
                <div className="space-y-2">
                  {parseResult.criteria.map((criterion, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded-lg bg-muted/50"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium capitalize">{criterion.dimension}</div>
                        <div className="text-xs text-muted-foreground">
                          {criterion.operator} {Array.isArray(criterion.value) ? `${criterion.value[0]}-${criterion.value[1]}` : criterion.value}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(criterion.confidence * 100)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estimated Size */}
            {parseResult.estimatedSize > 0 && (
              <div className="p-3 border rounded-lg bg-primary/5">
                <div className="text-sm font-medium mb-1">Estimated Audience Size</div>
                <div className="text-2xl font-bold">
                  {parseResult.estimatedSize >= 1000000
                    ? `${(parseResult.estimatedSize / 1000000).toFixed(1)}M`
                    : parseResult.estimatedSize >= 1000
                    ? `${(parseResult.estimatedSize / 1000).toFixed(0)}K`
                    : parseResult.estimatedSize}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {showSuggestions && parseResult.suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  Suggestions
                </h4>
                <div className="space-y-2">
                  {parseResult.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => handleApplySuggestion(suggestion)}
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium capitalize">{suggestion.dimension}</div>
                        <div className="text-xs text-muted-foreground">{suggestion.reason}</div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Refine Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleParse}
              disabled={isParsing}
            >
              {isParsing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Refining...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Refine Criteria
                </>
              )}
            </Button>
          </div>
        )}

        {!parseResult && !isParsing && (
          <Button
            className="w-full"
            onClick={handleParse}
            disabled={query.trim().length < 10}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Criteria
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
