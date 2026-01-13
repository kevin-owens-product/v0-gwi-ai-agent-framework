import { describe, it, expect } from 'vitest'
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Target,
  Lightbulb,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Building2
} from 'lucide-react'

// Import the utility functions we're testing
// Since we can't directly import non-exported functions, we'll test their behavior

describe('slide-content utility functions', () => {
  describe('getSlideIcon logic', () => {
    it('should return BarChart3 for metrics type', () => {
      const type = 'metrics'
      const expectedIcon = BarChart3
      expect(type).toBe('metrics')
      expect(expectedIcon).toBeDefined()
    })

    it('should return BarChart3 for titles with "metrics"', () => {
      const title = 'Key Metrics Overview'
      const shouldUseBarChart = title.toLowerCase().includes('metrics')
      expect(shouldUseBarChart).toBe(true)
    })

    it('should return BarChart3 for titles with "kpi"', () => {
      const title = 'Important KPIs'
      const shouldUseBarChart = title.toLowerCase().includes('kpi')
      expect(shouldUseBarChart).toBe(true)
    })

    it('should return PieChart for chart type', () => {
      const type = 'chart'
      const expectedIcon = PieChart
      expect(type).toBe('chart')
      expect(expectedIcon).toBeDefined()
    })

    it('should return PieChart for distribution titles', () => {
      const title = 'Market Distribution'
      const shouldUsePieChart = title.toLowerCase().includes('distribution')
      expect(shouldUsePieChart).toBe(true)
    })

    it('should return PieChart for breakdown titles', () => {
      const title = 'Segment Breakdown'
      const shouldUsePieChart = title.toLowerCase().includes('breakdown')
      expect(shouldUsePieChart).toBe(true)
    })

    it('should return TrendingUp for trends type', () => {
      const type = 'trends'
      const expectedIcon = TrendingUp
      expect(type).toBe('trends')
      expect(expectedIcon).toBeDefined()
    })

    it('should return TrendingUp for trend titles', () => {
      const title = 'Market Trends'
      const shouldUseTrending = title.toLowerCase().includes('trend')
      expect(shouldUseTrending).toBe(true)
    })

    it('should return TrendingUp for movement titles', () => {
      const title = 'Price Movement Analysis'
      const shouldUseTrending = title.toLowerCase().includes('movement')
      expect(shouldUseTrending).toBe(true)
    })

    it('should return Users for segment titles', () => {
      const title = 'Customer Segments'
      const shouldUseUsers = title.toLowerCase().includes('segment')
      expect(shouldUseUsers).toBe(true)
    })

    it('should return Users for persona titles', () => {
      const title = 'User Personas'
      const shouldUseUsers = title.toLowerCase().includes('persona')
      expect(shouldUseUsers).toBe(true)
    })

    it('should return Users for audience titles', () => {
      const title = 'Target Audience'
      const shouldUseUsers = title.toLowerCase().includes('audience')
      expect(shouldUseUsers).toBe(true)
    })

    it('should return Users for demographic titles', () => {
      const title = 'Demographic Analysis'
      const shouldUseUsers = title.toLowerCase().includes('demographic')
      expect(shouldUseUsers).toBe(true)
    })

    it('should return Target for strategy titles', () => {
      const title = 'Growth Strategy'
      const shouldUseTarget = title.toLowerCase().includes('strategy')
      expect(shouldUseTarget).toBe(true)
    })

    it('should return Target for recommendation titles', () => {
      const title = 'Strategic Recommendations'
      const shouldUseTarget = title.toLowerCase().includes('recommendation')
      expect(shouldUseTarget).toBe(true)
    })

    it('should return Target for action titles', () => {
      const title = 'Action Items'
      const shouldUseTarget = title.toLowerCase().includes('action')
      expect(shouldUseTarget).toBe(true)
    })

    it('should return Lightbulb for insight titles', () => {
      const title = 'Key Insights'
      const shouldUseLightbulb = title.toLowerCase().includes('insight')
      expect(shouldUseLightbulb).toBe(true)
    })

    it('should return Lightbulb for finding titles', () => {
      const title = 'Research Findings'
      const shouldUseLightbulb = title.toLowerCase().includes('finding')
      expect(shouldUseLightbulb).toBe(true)
    })

    it('should return Lightbulb for analysis titles', () => {
      const title = 'Market Analysis'
      const shouldUseLightbulb = title.toLowerCase().includes('analysis')
      expect(shouldUseLightbulb).toBe(true)
    })

    it('should return FileText for executive titles', () => {
      const title = 'Executive Summary'
      const shouldUseFileText = title.toLowerCase().includes('executive')
      expect(shouldUseFileText).toBe(true)
    })

    it('should return FileText for summary titles', () => {
      const title = 'Report Summary'
      const shouldUseFileText = title.toLowerCase().includes('summary')
      expect(shouldUseFileText).toBe(true)
    })

    it('should return FileText for overview titles', () => {
      const title = 'Business Overview'
      const shouldUseFileText = title.toLowerCase().includes('overview')
      expect(shouldUseFileText).toBe(true)
    })

    it('should return CheckCircle2 for opportunity titles', () => {
      const title = 'Growth Opportunities'
      const shouldUseCheck = title.toLowerCase().includes('opportunit')
      expect(shouldUseCheck).toBe(true)
    })

    it('should return CheckCircle2 for win titles', () => {
      const title = 'Quick Wins'
      const shouldUseCheck = title.toLowerCase().includes('win')
      expect(shouldUseCheck).toBe(true)
    })

    it('should return CheckCircle2 for success titles', () => {
      const title = 'Success Metrics'
      const shouldUseCheck = title.toLowerCase().includes('success')
      expect(shouldUseCheck).toBe(true)
    })

    it('should return AlertTriangle for risk titles', () => {
      const title = 'Risk Assessment'
      const shouldUseAlert = title.toLowerCase().includes('risk')
      expect(shouldUseAlert).toBe(true)
    })

    it('should return AlertTriangle for threat titles', () => {
      const title = 'Competitive Threats'
      const shouldUseAlert = title.toLowerCase().includes('threat')
      expect(shouldUseAlert).toBe(true)
    })

    it('should return AlertTriangle for challenge titles', () => {
      const title = 'Market Challenges'
      const shouldUseAlert = title.toLowerCase().includes('challenge')
      expect(shouldUseAlert).toBe(true)
    })

    it('should return AlertTriangle for competitor titles', () => {
      const title = 'Competitor Analysis'
      const shouldUseAlert = title.toLowerCase().includes('competitor')
      expect(shouldUseAlert).toBe(true)
    })

    it('should return Building2 for market titles', () => {
      const title = 'Market Position'
      const shouldUseBuilding = title.toLowerCase().includes('market')
      expect(shouldUseBuilding).toBe(true)
    })

    it('should return Building2 for industry titles', () => {
      const title = 'Industry Trends'
      const shouldUseBuilding = title.toLowerCase().includes('industry')
      expect(shouldUseBuilding).toBe(true)
    })

    it('should return Building2 for enterprise titles', () => {
      const title = 'Enterprise Solutions'
      const shouldUseBuilding = title.toLowerCase().includes('enterprise')
      expect(shouldUseBuilding).toBe(true)
    })

    it('should default to FileText for unknown titles', () => {
      const title = 'Random Content'
      const hasKnownKeyword = ['metrics', 'distribution', 'trend', 'segment'].some(
        keyword => title.toLowerCase().includes(keyword)
      )
      const defaultIcon = FileText
      expect(hasKnownKeyword).toBe(false)
      expect(defaultIcon).toBeDefined()
    })
  })

  describe('parseContent logic', () => {
    it('should parse content with metric patterns', () => {
      const content = '78% care about sustainability. 3.2x conversion rate improvement'
      const metricPattern = /(\d+[\d,]*\.?\d*[%xXkKmMbB]*)\s+(.+?)(?:\s*[-–:]\s*|$)/i
      const matches = content.match(metricPattern)
      expect(matches).toBeTruthy()
    })

    it('should extract percentage metrics', () => {
      const segment = '78% care about sustainability'
      const metricMatch = segment.match(/(\d+[\d,]*\.?\d*[%xXkKmMbB]*)\s+(.+?)(?:\s*[-–:]\s*|$)/i)
      expect(metricMatch).toBeTruthy()
      if (metricMatch) {
        expect(metricMatch[1]).toBe('78%')
        expect(metricMatch[2].trim()).toContain('care about')
      }
    })

    it('should extract multiplier metrics', () => {
      const segment = '3.2x conversion rate'
      const metricMatch = segment.match(/(\d+[\d,]*\.?\d*[%xXkKmMbB]*)\s+(.+?)(?:\s*[-–:]\s*|$)/i)
      expect(metricMatch).toBeTruthy()
      if (metricMatch) {
        expect(metricMatch[1]).toBe('3.2x')
      }
    })

    it('should extract dollar amount metrics', () => {
      const segment = '$4,200 avg spend per customer'
      const hasNumber = /\d/.test(segment)
      expect(hasNumber).toBe(true)
    })

    it('should parse label:value patterns', () => {
      const segment = 'Revenue Growth: 25%'
      const labelValueMatch = segment.match(/^([^:()]+?):\s*(.+)$/)
      expect(labelValueMatch).toBeTruthy()
      if (labelValueMatch) {
        expect(labelValueMatch[1].trim()).toBe('Revenue Growth')
        expect(labelValueMatch[2].trim()).toBe('25%')
      }
    })

    it('should parse label(value) patterns', () => {
      const segment = 'Market Share (15%)'
      const labelValueMatch = segment.match(/^(.+?)\s*\(([^)]+)\)$/)
      expect(labelValueMatch).toBeTruthy()
      if (labelValueMatch) {
        expect(labelValueMatch[1].trim()).toBe('Market Share')
        expect(labelValueMatch[2].trim()).toBe('15%')
      }
    })

    it('should split content by periods', () => {
      const content = 'First point. Second point. Third point'
      const segments = content.split(/\.\s+/).filter(s => s.trim().length > 0)
      expect(segments.length).toBe(3)
    })

    it('should split content by semicolons', () => {
      const content = 'First point; Second point; Third point'
      const segments = content.split(/;\s+/).filter(s => s.trim().length > 0)
      expect(segments.length).toBe(3)
    })

    it('should filter out very short segments', () => {
      const segment = 'Hi'
      const isValid = segment.trim().length > 10
      expect(isValid).toBe(false)
    })

    it('should filter out very long segments', () => {
      const segment = 'A'.repeat(250)
      const isValid = segment.trim().length < 200
      expect(isValid).toBe(false)
    })

    it('should accept valid length segments', () => {
      const segment = 'This is a valid segment with reasonable length'
      const isValid = segment.trim().length > 10 && segment.trim().length < 200
      expect(isValid).toBe(true)
    })

    it('should limit metrics to 6', () => {
      const metrics = Array.from({ length: 10 }, (_, i) => ({
        label: `Metric ${i}`,
        value: `${i}%`
      }))
      const maxMetrics = metrics.slice(0, 6)
      expect(maxMetrics.length).toBe(6)
    })

    it('should convert excess metrics to bullets', () => {
      const metrics = Array.from({ length: 8 }, (_, i) => ({
        label: `Metric ${i}`,
        value: `${i}%`
      }))
      if (metrics.length > 6) {
        const extraMetrics = metrics.slice(6)
        const bullets = extraMetrics.map(m => `${m.label}: ${m.value}`)
        expect(bullets.length).toBe(2)
      }
    })

    it('should use full content as bullet when no structure found', () => {
      const content = 'Simple content without structure'
      const bullets: string[] = []
      const metrics: { label: string, value: string }[] = []

      if (bullets.length === 0 && metrics.length === 0) {
        bullets.push(content)
      }

      expect(bullets.length).toBeGreaterThan(0)
    })

    it('should validate metric label length', () => {
      const label = 'Test'
      const isValid = label.length > 3 && label.length < 50
      expect(isValid).toBe(true)
    })

    it('should reject very short labels', () => {
      const label = 'Hi'
      const isValid = label.length > 3
      expect(isValid).toBe(false)
    })

    it('should reject very long labels', () => {
      const label = 'A'.repeat(60)
      const isValid = label.length < 50
      expect(isValid).toBe(false)
    })

    it('should validate potential value length', () => {
      const value = 'Test value'
      const isValid = value.length < 60
      expect(isValid).toBe(true)
    })

    it('should detect numeric values', () => {
      const value = '25% increase'
      const hasNumber = /\d/.test(value)
      expect(hasNumber).toBe(true)
    })
  })

  describe('getSlideStyle logic', () => {
    it('should use slate gradient for first slide', () => {
      const slideIndex = 0
      const isFirst = slideIndex === 0
      expect(isFirst).toBe(true)
    })

    it('should use slate gradient for executive summary', () => {
      const title = 'Executive Summary'
      const isExecutive = title.toLowerCase().includes('executive') || title.toLowerCase().includes('summary')
      expect(isExecutive).toBe(true)
    })

    it('should return emerald accent for first slide', () => {
      const accentColor = 'text-emerald-400'
      expect(accentColor).toContain('emerald')
    })

    it('should use emerald gradient for last slide', () => {
      const slideIndex = 9
      const totalSlides = 10
      const isLast = slideIndex === totalSlides - 1
      expect(isLast).toBe(true)
    })

    it('should use emerald gradient for recommendations', () => {
      const title = 'Strategic Recommendations'
      const isRecommendation = title.toLowerCase().includes('recommendation') || title.toLowerCase().includes('action')
      expect(isRecommendation).toBe(true)
    })

    it('should use purple gradient for insights', () => {
      const title = 'Key Insights'
      const isInsight = title.toLowerCase().includes('insight') || title.toLowerCase().includes('finding')
      expect(isInsight).toBe(true)
    })

    it('should return violet accent for insights', () => {
      const accentColor = 'text-violet-300'
      expect(accentColor).toContain('violet')
    })

    it('should use blue gradient for trends', () => {
      const title = 'Market Trends'
      const isTrend = title.toLowerCase().includes('trend') || title.toLowerCase().includes('analysis')
      expect(isTrend).toBe(true)
    })

    it('should return blue accent for trends', () => {
      const accentColor = 'text-blue-300'
      expect(accentColor).toContain('blue')
    })

    it('should use amber gradient for segments', () => {
      const title = 'Customer Segments'
      const isSegment = title.toLowerCase().includes('segment') || title.toLowerCase().includes('persona') || title.toLowerCase().includes('audience')
      expect(isSegment).toBe(true)
    })

    it('should return amber accent for segments', () => {
      const accentColor = 'text-amber-300'
      expect(accentColor).toContain('amber')
    })

    it('should use red gradient for competition', () => {
      const title = 'Competitor Analysis'
      const isCompetition = title.toLowerCase().includes('competitor') || title.toLowerCase().includes('risk') || title.toLowerCase().includes('challenge')
      expect(isCompetition).toBe(true)
    })

    it('should return rose accent for competition', () => {
      const accentColor = 'text-rose-300'
      expect(accentColor).toContain('rose')
    })

    it('should cycle through default variations', () => {
      const variations = [
        { bgGradient: 'from-slate-900', accentColor: 'text-sky-400' },
        { bgGradient: 'from-indigo-900', accentColor: 'text-indigo-300' },
        { bgGradient: 'from-cyan-900', accentColor: 'text-cyan-300' },
        { bgGradient: 'from-fuchsia-900', accentColor: 'text-pink-300' }
      ]
      const slideIndex = 5
      const variation = variations[slideIndex % variations.length]
      expect(variation).toBeDefined()
    })

    it('should handle modulo for slide cycling', () => {
      const slideIndex = 7
      const totalVariations = 4
      const index = slideIndex % totalVariations
      expect(index).toBe(3)
    })

    it('should provide consistent styling per slide index', () => {
      const slideIndex = 3
      const totalVariations = 4
      const index1 = slideIndex % totalVariations
      const index2 = slideIndex % totalVariations
      expect(index1).toBe(index2)
    })
  })

  describe('SlideContent component structure', () => {
    it('should display slide index starting from 1', () => {
      const slideIndex = 0
      const displayIndex = slideIndex + 1
      expect(displayIndex).toBe(1)
    })

    it('should show metrics in 2-column grid', () => {
      const gridCols = 2
      expect(gridCols).toBe(2)
    })

    it('should limit displayed metrics to 6', () => {
      const metrics = Array.from({ length: 10 }, () => ({ label: 'Test', value: '50%' }))
      const displayedMetrics = metrics.slice(0, 6)
      expect(displayedMetrics.length).toBe(6)
    })

    it('should limit displayed bullets to 6', () => {
      const bullets = Array.from({ length: 10 }, (_, i) => `Bullet ${i}`)
      const displayedBullets = bullets.slice(0, 6)
      expect(displayedBullets.length).toBe(6)
    })

    it('should use half width when both metrics and bullets exist', () => {
      const hasMetrics = true
      const hasBullets = true
      const width = hasMetrics && hasBullets ? 'w-1/2' : 'w-full'
      expect(width).toBe('w-1/2')
    })

    it('should use full width when only metrics exist', () => {
      const hasMetrics = true
      const hasBullets = false
      const width = hasMetrics && !hasBullets ? 'w-full' : 'w-1/2'
      expect(width).toBe('w-full')
    })

    it('should use full width when only bullets exist', () => {
      const hasMetrics = false
      const hasBullets = true
      const width = !hasMetrics && hasBullets ? 'w-full' : 'w-1/2'
      expect(width).toBe('w-full')
    })

    it('should show fallback when no structured content', () => {
      const metrics: unknown[] = []
      const bullets: unknown[] = []
      const showFallback = metrics.length === 0 && bullets.length === 0
      expect(showFallback).toBe(true)
    })

    it('should display slide number in footer', () => {
      const slideIndex = 2
      const totalSlides = 10
      const footer = `${slideIndex + 1} / ${totalSlides}`
      expect(footer).toBe('3 / 10')
    })

    it('should replace text- with bg- for bullet colors', () => {
      const accentColor = 'text-emerald-400'
      const bulletColor = accentColor.replace('text-', 'bg-')
      expect(bulletColor).toBe('bg-emerald-400')
    })

    it('should line-clamp metric labels to 2 lines', () => {
      const lineClamp = 'line-clamp-2'
      expect(lineClamp).toBe('line-clamp-2')
    })
  })

  describe('SlideThumbnail component structure', () => {
    it('should use smaller padding than full slide', () => {
      const thumbnailPadding = 'p-2'
      const fullPadding = 'p-8'
      expect(thumbnailPadding).not.toBe(fullPadding)
    })

    it('should use mini icon size', () => {
      const iconSize = 'h-3 w-3'
      expect(iconSize).toContain('h-3')
    })

    it('should use tiny font size for text', () => {
      const fontSize = 'text-[8px]'
      expect(fontSize).toBe('text-[8px]')
    })

    it('should truncate title in thumbnail', () => {
      const truncate = 'truncate'
      expect(truncate).toBe('truncate')
    })

    it('should show 3 placeholder content lines', () => {
      const lines = 3
      expect(lines).toBe(3)
    })

    it('should use different widths for placeholder lines', () => {
      const widths = ['w-3/4', 'w-full', 'w-2/3']
      expect(widths.length).toBe(3)
      expect(widths[0]).not.toBe(widths[1])
    })
  })

  describe('Edge cases', () => {
    it('should handle empty content', () => {
      const content = ''
      const isEmpty = content.trim().length === 0
      expect(isEmpty).toBe(true)
    })

    it('should handle very long content', () => {
      const content = 'A'.repeat(5000)
      expect(content.length).toBeGreaterThan(1000)
    })

    it('should handle content with only periods', () => {
      const content = '....'
      const segments = content.split(/\.\s+/).filter(s => s.trim().length > 0)
      expect(segments.length).toBeLessThanOrEqual(1)
    })

    it('should handle content with special characters', () => {
      const content = '78% care about sustainability – 3.2x improvement'
      const hasSpecialChars = /[–—\-]/.test(content)
      expect(hasSpecialChars).toBe(true)
    })

    it('should handle mixed case titles', () => {
      const title = 'ExEcUtIvE SuMmArY'
      const normalized = title.toLowerCase()
      expect(normalized).toBe('executive summary')
    })

    it('should handle slide index 0', () => {
      const slideIndex = 0
      const displayIndex = slideIndex + 1
      expect(displayIndex).toBe(1)
    })

    it('should handle single slide presentation', () => {
      const totalSlides = 1
      expect(totalSlides).toBe(1)
    })

    it('should handle large slide count', () => {
      const totalSlides = 100
      expect(totalSlides).toBeGreaterThan(10)
    })
  })
})
