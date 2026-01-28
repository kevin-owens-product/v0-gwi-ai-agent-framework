"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Globe, TrendingUp, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MarketBreakdown {
  market: string
  size: number
  percentage: number
}

interface AudienceSizeIndicatorProps {
  attributes: { dimension: string; operator: string; value: string }[]
  markets: string[]
  className?: string
}

export function AudienceSizeIndicator({
  attributes,
  markets,
  className,
}: AudienceSizeIndicatorProps) {
  const t = useTranslations("audiences")
  const [totalSize, setTotalSize] = useState<number>(0)
  const [marketBreakdown, setMarketBreakdown] = useState<MarketBreakdown[]>([])
  const [confidence, setConfidence] = useState<"high" | "medium" | "low">("medium")
  const [isLoading, setIsLoading] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [animatedSize, setAnimatedSize] = useState(0)

  // Fetch estimate when attributes or markets change
  useEffect(() => {
    const fetchEstimate = async () => {
      if (attributes.length === 0 && markets.length === 0) {
        setTotalSize(0)
        setMarketBreakdown([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch("/api/v1/audiences/estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attributes, markets }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            setTotalSize(data.data.totalSize)
            setMarketBreakdown(data.data.marketBreakdown)
            setConfidence(data.data.confidence)
          }
        }
      } catch (error) {
        console.error("Failed to fetch estimate:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce the API call
    const timer = setTimeout(fetchEstimate, 300)
    return () => clearTimeout(timer)
  }, [attributes, markets])

  // Animate the size counter
  useEffect(() => {
    if (totalSize === 0) {
      setAnimatedSize(0)
      return
    }

    const duration = 800
    const steps = 30
    const increment = totalSize / steps
    let current = animatedSize
    let step = 0

    const timer = setInterval(() => {
      step++
      current = Math.min(current + increment, totalSize)
      setAnimatedSize(Math.round(current))

      if (step >= steps) {
        clearInterval(timer)
        setAnimatedSize(totalSize)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [totalSize])

  const formatSize = (size: number): string => {
    if (size >= 1000000000) return `${(size / 1000000000).toFixed(1)}B`
    if (size >= 1000000) return `${(size / 1000000).toFixed(1)}M`
    if (size >= 1000) return `${(size / 1000).toFixed(0)}K`
    return size.toString()
  }

  const getConfidenceBadge = () => {
    switch (confidence) {
      case "high":
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30">{t("sizeIndicator.confidence.high")}</Badge>
      case "medium":
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30">{t("sizeIndicator.confidence.medium")}</Badge>
      case "low":
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30">{t("sizeIndicator.confidence.low")}</Badge>
    }
  }

  const getSizeCategory = (size: number): { label: string; color: string } => {
    if (size >= 10000000) return { label: t("sizeIndicator.sizeCategory.veryLarge"), color: "text-green-600" }
    if (size >= 1000000) return { label: t("sizeIndicator.sizeCategory.large"), color: "text-blue-600" }
    if (size >= 100000) return { label: t("sizeIndicator.sizeCategory.medium"), color: "text-amber-600" }
    if (size >= 10000) return { label: t("sizeIndicator.sizeCategory.small"), color: "text-orange-600" }
    return { label: t("sizeIndicator.sizeCategory.niche"), color: "text-red-600" }
  }

  const sizeCategory = getSizeCategory(totalSize)

  return (
    <Card className={cn("p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t("sizeIndicator.title")}
        </h3>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {/* Main Size Display */}
      <div className="text-center py-4">
        <div className="text-5xl font-bold tracking-tight">
          {formatSize(animatedSize)}
        </div>
        <p className="text-muted-foreground mt-1">{t("sizeIndicator.consumersMatch")}</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          {getConfidenceBadge()}
          <Badge variant="outline" className={sizeCategory.color}>
            {t("sizeIndicator.audienceLabel", { label: sizeCategory.label })}
          </Badge>
        </div>
      </div>

      {/* Market Breakdown Toggle */}
      {marketBreakdown.length > 0 && (
        <div className="border-t pt-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between"
            onClick={() => setShowBreakdown(!showBreakdown)}
          >
            <span className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t("sizeIndicator.marketBreakdown")}
            </span>
            {showBreakdown ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {showBreakdown && (
            <div className="space-y-2 mt-3">
              {marketBreakdown.map((item) => (
                <div
                  key={item.market}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{item.market}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">
                      {formatSize(item.size)}
                    </span>
                    <span className="text-xs text-muted-foreground w-10">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Size Tips */}
      <div className="text-xs text-muted-foreground border-t pt-3">
        <div className="flex items-start gap-2">
          <TrendingUp className="h-3 w-3 mt-0.5" />
          <span>
            {totalSize > 1000000
              ? t("sizeIndicator.tips.large")
              : totalSize > 100000
              ? t("sizeIndicator.tips.medium")
              : totalSize > 10000
              ? t("sizeIndicator.tips.targeted")
              : t("sizeIndicator.tips.specific")}
          </span>
        </div>
      </div>
    </Card>
  )
}
