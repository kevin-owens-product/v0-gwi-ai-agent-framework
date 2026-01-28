"use client"

import { useTranslations } from "next-intl"
import { BarChart3, PieChart, TrendingUp, Users, Target, Lightbulb, FileText, CheckCircle2, AlertTriangle, Building2 } from "lucide-react"

interface Slide {
  id: number
  title: string
  content: string
  thumbnail?: string
  type?: string
}

// Map slide titles/keywords to appropriate icons
function getSlideIcon(title: string, type?: string) {
  const titleLower = title.toLowerCase()

  if (type === 'metrics' || titleLower.includes('metrics') || titleLower.includes('kpi')) {
    return BarChart3
  }
  if (type === 'chart' || titleLower.includes('distribution') || titleLower.includes('breakdown')) {
    return PieChart
  }
  if (type === 'trends' || titleLower.includes('trend') || titleLower.includes('movement')) {
    return TrendingUp
  }
  if (titleLower.includes('segment') || titleLower.includes('persona') || titleLower.includes('audience') || titleLower.includes('demographic')) {
    return Users
  }
  if (titleLower.includes('strategy') || titleLower.includes('recommendation') || titleLower.includes('action')) {
    return Target
  }
  if (titleLower.includes('insight') || titleLower.includes('finding') || titleLower.includes('analysis')) {
    return Lightbulb
  }
  if (titleLower.includes('executive') || titleLower.includes('summary') || titleLower.includes('overview')) {
    return FileText
  }
  if (titleLower.includes('opportunity') || titleLower.includes('win') || titleLower.includes('success')) {
    return CheckCircle2
  }
  if (titleLower.includes('risk') || titleLower.includes('threat') || titleLower.includes('challenge') || titleLower.includes('competitor')) {
    return AlertTriangle
  }
  if (titleLower.includes('market') || titleLower.includes('industry') || titleLower.includes('enterprise')) {
    return Building2
  }

  return FileText
}

// Parse content to extract bullet points or key metrics
function parseContent(content: string): { bullets: string[], metrics: { label: string, value: string }[] } {
  const bullets: string[] = []
  const metrics: { label: string, value: string }[] = []

  // Split by periods or common delimiters
  const segments = content.split(/\.\s+|;\s+/).filter(s => s.trim().length > 0)

  for (const segment of segments) {
    // Check for metric patterns (e.g., "78% care about", "3.2x conversion", "$4,200 avg spend")
    const metricMatch = segment.match(/(\d+[\d,]*\.?\d*[%xXkKmMbB]*)\s+(.+?)(?:\s*[-–:]\s*|$)/i)
    if (metricMatch) {
      // Extract metric value and what it describes
      const value = metricMatch[1]
      const label = metricMatch[2].trim()
      if (label && label.length > 3 && label.length < 50) {
        metrics.push({ value, label })
        continue
      }
    }

    // Check for patterns like "Label: Value" or "Label (Value)"
    const labelValueMatch = segment.match(/^([^:()]+?):\s*(.+)$/) || segment.match(/^(.+?)\s*\(([^)]+)\)$/)
    if (labelValueMatch) {
      const potentialLabel = labelValueMatch[1].trim()
      const potentialValue = labelValueMatch[2].trim()
      if (potentialLabel.length < 40 && potentialValue.length < 60) {
        // If value looks like a metric, add to metrics
        if (/\d/.test(potentialValue)) {
          metrics.push({ label: potentialLabel, value: potentialValue })
          continue
        }
      }
    }

    // Otherwise, treat as a bullet point
    const cleanedSegment = segment.trim()
    if (cleanedSegment.length > 10 && cleanedSegment.length < 200) {
      bullets.push(cleanedSegment)
    }
  }

  // If we have too many metrics, convert some to bullets
  if (metrics.length > 6) {
    const extraMetrics = metrics.splice(6)
    bullets.push(...extraMetrics.map(m => `${m.label}: ${m.value}`))
  }

  // If no bullets or metrics found, just use the whole content as one bullet
  if (bullets.length === 0 && metrics.length === 0) {
    bullets.push(content)
  }

  return { bullets, metrics }
}

// Get slide style based on position or type
function getSlideStyle(slideIndex: number, totalSlides: number, title: string): { bgGradient: string, accentColor: string } {
  const titleLower = title.toLowerCase()

  // Executive summary or first slide
  if (slideIndex === 0 || titleLower.includes('executive') || titleLower.includes('summary')) {
    return { bgGradient: 'from-slate-900 via-slate-800 to-slate-900', accentColor: 'text-emerald-400' }
  }

  // Recommendations or last slide
  if (slideIndex === totalSlides - 1 || titleLower.includes('recommendation') || titleLower.includes('action')) {
    return { bgGradient: 'from-emerald-900 via-emerald-800 to-teal-900', accentColor: 'text-emerald-300' }
  }

  // Insights or findings
  if (titleLower.includes('insight') || titleLower.includes('finding')) {
    return { bgGradient: 'from-purple-900 via-violet-800 to-purple-900', accentColor: 'text-violet-300' }
  }

  // Trends or analysis
  if (titleLower.includes('trend') || titleLower.includes('analysis')) {
    return { bgGradient: 'from-blue-900 via-indigo-800 to-blue-900', accentColor: 'text-blue-300' }
  }

  // Segments or personas
  if (titleLower.includes('segment') || titleLower.includes('persona') || titleLower.includes('audience')) {
    return { bgGradient: 'from-amber-900 via-orange-800 to-amber-900', accentColor: 'text-amber-300' }
  }

  // Competition or risk
  if (titleLower.includes('competitor') || titleLower.includes('risk') || titleLower.includes('challenge')) {
    return { bgGradient: 'from-red-900 via-rose-800 to-red-900', accentColor: 'text-rose-300' }
  }

  // Default variations based on slide index
  const variations = [
    { bgGradient: 'from-slate-900 via-zinc-800 to-slate-900', accentColor: 'text-sky-400' },
    { bgGradient: 'from-indigo-900 via-blue-800 to-indigo-900', accentColor: 'text-indigo-300' },
    { bgGradient: 'from-cyan-900 via-teal-800 to-cyan-900', accentColor: 'text-cyan-300' },
    { bgGradient: 'from-fuchsia-900 via-pink-800 to-fuchsia-900', accentColor: 'text-pink-300' },
  ]

  return variations[slideIndex % variations.length]
}

export function SlideContent({ slide, slideIndex = 0, totalSlides = 1 }: { slide: Slide, slideIndex?: number, totalSlides?: number }) {
  const t = useTranslations("reports")
  const Icon = getSlideIcon(slide.title, slide.type)
  const { bullets, metrics } = parseContent(slide.content)
  const { bgGradient, accentColor } = getSlideStyle(slideIndex, totalSlides, slide.title)

  return (
    <div className={`w-full h-full bg-gradient-to-br ${bgGradient} p-8 flex flex-col text-white`}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`p-3 rounded-xl bg-white/10 backdrop-blur-sm ${accentColor}`}>
          <Icon className="h-8 w-8" />
        </div>
        <div>
          <p className={`text-sm font-medium ${accentColor} uppercase tracking-wider`}>{t("slide.slideNumber", { number: slideIndex + 1 })}</p>
          <h2 className="text-3xl font-bold">{slide.title}</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex gap-8">
        {/* Metrics grid - show if we have metrics */}
        {metrics.length > 0 && (
          <div className={`${bullets.length > 0 ? 'w-1/2' : 'w-full'}`}>
            <div className="grid grid-cols-2 gap-4 h-full content-start">
              {metrics.slice(0, 6).map((metric, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                >
                  <p className={`text-3xl font-bold ${accentColor}`}>{metric.value}</p>
                  <p className="text-sm text-white/70 mt-1 line-clamp-2">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bullet points - show if we have bullets */}
        {bullets.length > 0 && (
          <div className={`${metrics.length > 0 ? 'w-1/2' : 'w-full'}`}>
            <ul className="space-y-4">
              {bullets.slice(0, 6).map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className={`mt-2 h-2 w-2 rounded-full ${accentColor.replace('text-', 'bg-')} shrink-0`} />
                  <span className="text-lg text-white/90 leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Fallback if no structured content */}
        {metrics.length === 0 && bullets.length === 0 && (
          <div className="w-full flex items-center justify-center">
            <p className="text-xl text-white/80 text-center max-w-2xl">{slide.content}</p>
          </div>
        )}
      </div>

      {/* Footer branding */}
      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <span className="text-xs font-bold text-white">GWI</span>
          </div>
          <span className="text-sm text-white/50">{t("slide.poweredBy")}</span>
        </div>
        <span className="text-sm text-white/50">{slideIndex + 1} / {totalSlides}</span>
      </div>
    </div>
  )
}

// Thumbnail version for the slide strip
export function SlideThumbnail({ slide, slideIndex = 0, totalSlides = 1 }: { slide: Slide, slideIndex?: number, totalSlides?: number }) {
  const Icon = getSlideIcon(slide.title, slide.type)
  const { bgGradient, accentColor } = getSlideStyle(slideIndex, totalSlides, slide.title)

  return (
    <div className={`w-full h-full bg-gradient-to-br ${bgGradient} p-2 flex flex-col text-white`}>
      {/* Mini header */}
      <div className="flex items-center gap-1.5 mb-1">
        <div className={`p-1 rounded bg-white/10 ${accentColor}`}>
          <Icon className="h-3 w-3" />
        </div>
        <p className="text-[8px] font-medium truncate">{slide.title}</p>
      </div>

      {/* Placeholder content lines */}
      <div className="flex-1 space-y-1">
        <div className="h-1 w-3/4 bg-white/20 rounded" />
        <div className="h-1 w-full bg-white/20 rounded" />
        <div className="h-1 w-2/3 bg-white/20 rounded" />
      </div>
    </div>
  )
}
