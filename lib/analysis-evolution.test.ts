import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  analysisEvolution,
  trackAnalysis,
  getAnalysisHistory,
  compareAnalysisWithPrevious,
  getMetricTrends,
  generateEvolutionExplanation,
  type EvolutionComparison,
} from './analysis-evolution'

// Mock Prisma
vi.mock('./db', () => ({
  prisma: {
    analysisHistory: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
  },
}))

import { prisma } from './db'

describe('AnalysisEvolutionService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('trackAnalysis', () => {
    it('creates a new analysis entry with version 1 if none exists', async () => {
      const mockEntry = {
        id: 'analysis-1',
        orgId: 'org-1',
        analysisType: 'crosstab',
        referenceId: 'ref-1',
        analysisVersion: 1,
        results: { data: 'test' },
        aiInsights: ['Insight 1', 'Insight 2'],
        keyMetrics: { metric1: 100 },
        confidence: 0.85,
        dataSourceDate: new Date('2024-01-01'),
        metadata: {},
        createdAt: new Date(),
      }

      vi.mocked(prisma.analysisHistory.findFirst).mockResolvedValue(null)
      vi.mocked(prisma.analysisHistory.create).mockResolvedValue(mockEntry)

      const result = await analysisEvolution.trackAnalysis(
        'org-1',
        'crosstab',
        'ref-1',
        { data: 'test' },
        ['Insight 1', 'Insight 2'],
        { metric1: 100 },
        { confidence: 0.85, dataSourceDate: new Date('2024-01-01') }
      )

      expect(result.analysisVersion).toBe(1)
      expect(result.aiInsights).toHaveLength(2)
      expect(result.confidence).toBe(0.85)
    })

    it('increments version for existing analysis', async () => {
      const existingEntry = {
        id: 'analysis-1',
        orgId: 'org-1',
        analysisType: 'crosstab',
        referenceId: 'ref-1',
        analysisVersion: 3,
        results: {},
        aiInsights: [],
        keyMetrics: {},
        confidence: null,
        dataSourceDate: null,
        metadata: {},
        createdAt: new Date(),
      }

      const newEntry = {
        ...existingEntry,
        id: 'analysis-2',
        analysisVersion: 4,
      }

      vi.mocked(prisma.analysisHistory.findFirst).mockResolvedValue(existingEntry)
      vi.mocked(prisma.analysisHistory.create).mockResolvedValue(newEntry)

      const result = await analysisEvolution.trackAnalysis(
        'org-1',
        'crosstab',
        'ref-1',
        {},
        [],
        {}
      )

      expect(result.analysisVersion).toBe(4)
    })
  })

  describe('getAnalysisHistory', () => {
    it('returns analysis history with pagination', async () => {
      const mockHistory = [
        {
          id: 'a2',
          orgId: 'org-1',
          analysisType: 'crosstab',
          referenceId: 'ref-1',
          analysisVersion: 2,
          results: {},
          aiInsights: ['Insight B'],
          keyMetrics: { score: 80 },
          confidence: 0.9,
          dataSourceDate: null,
          metadata: {},
          createdAt: new Date('2024-02-01'),
        },
        {
          id: 'a1',
          orgId: 'org-1',
          analysisType: 'crosstab',
          referenceId: 'ref-1',
          analysisVersion: 1,
          results: {},
          aiInsights: ['Insight A'],
          keyMetrics: { score: 75 },
          confidence: 0.85,
          dataSourceDate: null,
          metadata: {},
          createdAt: new Date('2024-01-01'),
        },
      ]

      vi.mocked(prisma.analysisHistory.findMany).mockResolvedValue(mockHistory)
      vi.mocked(prisma.analysisHistory.count).mockResolvedValue(2)

      const result = await analysisEvolution.getAnalysisHistory('crosstab', 'ref-1')

      expect(result.history).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.history[0].analysisVersion).toBe(2)
    })

    it('applies limit and offset', async () => {
      vi.mocked(prisma.analysisHistory.findMany).mockResolvedValue([])
      vi.mocked(prisma.analysisHistory.count).mockResolvedValue(0)

      await analysisEvolution.getAnalysisHistory('crosstab', 'ref-1', { limit: 10, offset: 5 })

      expect(prisma.analysisHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 5,
        })
      )
    })
  })

  describe('compareWithPrevious', () => {
    it('compares current version with previous version', async () => {
      const current = {
        id: 'a2',
        orgId: 'org-1',
        analysisType: 'crosstab',
        referenceId: 'ref-1',
        analysisVersion: 2,
        results: {},
        aiInsights: ['New insight'],
        keyMetrics: { score: 85 },
        confidence: 0.9,
        dataSourceDate: null,
        metadata: {},
        createdAt: new Date(),
      }

      const previous = {
        ...current,
        id: 'a1',
        analysisVersion: 1,
        aiInsights: ['Old insight'],
        keyMetrics: { score: 75 },
        confidence: 0.8,
      }

      vi.mocked(prisma.analysisHistory.findFirst)
        .mockResolvedValueOnce(current)
        .mockResolvedValueOnce(previous)
        .mockResolvedValueOnce(previous)
        .mockResolvedValueOnce(current)

      vi.mocked(prisma.analysisHistory.findMany).mockResolvedValue([previous, current])

      const result = await analysisEvolution.compareWithPrevious('crosstab', 'ref-1')

      expect(result).not.toBeNull()
      expect(result!.versions.from).toBe(1)
      expect(result!.versions.to).toBe(2)
    })

    it('returns null if no previous version exists', async () => {
      vi.mocked(prisma.analysisHistory.findFirst)
        .mockResolvedValueOnce({
          id: 'a1',
          orgId: 'org-1',
          analysisType: 'crosstab',
          referenceId: 'ref-1',
          analysisVersion: 1,
          results: {},
          aiInsights: [],
          keyMetrics: {},
          confidence: null,
          dataSourceDate: null,
          metadata: {},
          createdAt: new Date(),
        })
        .mockResolvedValueOnce(null)

      const result = await analysisEvolution.compareWithPrevious('crosstab', 'ref-1')

      expect(result).toBeNull()
    })
  })

  describe('compareVersions', () => {
    it('compares two specific versions', async () => {
      const from = {
        id: 'a1',
        orgId: 'org-1',
        analysisType: 'crosstab',
        referenceId: 'ref-1',
        analysisVersion: 1,
        results: { old: 'data' },
        aiInsights: ['Insight A', 'Insight B'],
        keyMetrics: { score: 70, engagement: 0.5 },
        confidence: 0.8,
        dataSourceDate: null,
        metadata: {},
        createdAt: new Date('2024-01-01'),
      }

      const to = {
        ...from,
        id: 'a3',
        analysisVersion: 3,
        results: { new: 'data' },
        aiInsights: ['Insight B', 'Insight C'],
        keyMetrics: { score: 90, engagement: 0.7 },
        confidence: 0.95,
        createdAt: new Date('2024-03-01'),
      }

      vi.mocked(prisma.analysisHistory.findFirst)
        .mockResolvedValueOnce(from)
        .mockResolvedValueOnce(to)

      vi.mocked(prisma.analysisHistory.findMany).mockResolvedValue([from, to])

      const result = await analysisEvolution.compareVersions('crosstab', 'ref-1', 1, 3)

      expect(result).not.toBeNull()
      expect(result!.metricChanges).toBeDefined()
      expect(result!.insightEvolution).toBeDefined()
    })

    it('returns null if version not found', async () => {
      vi.mocked(prisma.analysisHistory.findFirst)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)

      const result = await analysisEvolution.compareVersions('crosstab', 'ref-1', 1, 3)

      expect(result).toBeNull()
    })

    it('calculates metric changes correctly', async () => {
      const from = {
        id: 'a1',
        orgId: 'org-1',
        analysisType: 'brand_health',
        referenceId: 'ref-1',
        analysisVersion: 1,
        results: {},
        aiInsights: [],
        keyMetrics: { brandScore: 50, awareness: 0.3 },
        confidence: null,
        dataSourceDate: null,
        metadata: {},
        createdAt: new Date(),
      }

      const to = {
        ...from,
        id: 'a2',
        analysisVersion: 2,
        keyMetrics: { brandScore: 75, awareness: 0.45 },
      }

      vi.mocked(prisma.analysisHistory.findFirst)
        .mockResolvedValueOnce(from)
        .mockResolvedValueOnce(to)

      vi.mocked(prisma.analysisHistory.findMany).mockResolvedValue([from, to])

      const result = await analysisEvolution.compareVersions('brand_health', 'ref-1', 1, 2)

      const brandScoreChange = result!.metricChanges.find(m => m.metric === 'brandScore')
      expect(brandScoreChange).toBeDefined()
      expect(brandScoreChange!.fromValue).toBe(50)
      expect(brandScoreChange!.toValue).toBe(75)
      expect(brandScoreChange!.changePercent).toBe(0.5) // 50% increase
      expect(brandScoreChange!.isSignificant).toBe(true) // >10%
    })

    it('calculates insight evolution correctly', async () => {
      const from = {
        id: 'a1',
        orgId: 'org-1',
        analysisType: 'audience_insight',
        referenceId: 'ref-1',
        analysisVersion: 1,
        results: {},
        aiInsights: ['Insight A', 'Insight B', 'Insight C'],
        keyMetrics: {},
        confidence: null,
        dataSourceDate: null,
        metadata: {},
        createdAt: new Date(),
      }

      const to = {
        ...from,
        id: 'a2',
        analysisVersion: 2,
        aiInsights: ['Insight B', 'Insight D', 'Insight E'],
      }

      vi.mocked(prisma.analysisHistory.findFirst)
        .mockResolvedValueOnce(from)
        .mockResolvedValueOnce(to)

      vi.mocked(prisma.analysisHistory.findMany).mockResolvedValue([from, to])

      const result = await analysisEvolution.compareVersions('audience_insight', 'ref-1', 1, 2)

      const evolution = result!.insightEvolution
      expect(evolution.previousInsights).toHaveLength(3)
      expect(evolution.currentInsights).toHaveLength(3)
      expect(evolution.addedInsights).toContain('Insight D')
      expect(evolution.addedInsights).toContain('Insight E')
      expect(evolution.removedInsights).toContain('Insight A')
      expect(evolution.removedInsights).toContain('Insight C')
      expect(evolution.consistentInsights).toContain('Insight B')
    })
  })

  describe('getMetricTrends', () => {
    it('returns trend analysis for metrics', async () => {
      const history = [
        {
          id: 'a1',
          orgId: 'org-1',
          analysisType: 'brand_health',
          referenceId: 'ref-1',
          analysisVersion: 1,
          results: {},
          aiInsights: [],
          keyMetrics: { score: 60 },
          confidence: 0.8,
          dataSourceDate: null,
          metadata: {},
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'a2',
          orgId: 'org-1',
          analysisType: 'brand_health',
          referenceId: 'ref-1',
          analysisVersion: 2,
          results: {},
          aiInsights: [],
          keyMetrics: { score: 70 },
          confidence: 0.85,
          dataSourceDate: null,
          metadata: {},
          createdAt: new Date('2024-02-01'),
        },
        {
          id: 'a3',
          orgId: 'org-1',
          analysisType: 'brand_health',
          referenceId: 'ref-1',
          analysisVersion: 3,
          results: {},
          aiInsights: [],
          keyMetrics: { score: 80 },
          confidence: 0.9,
          dataSourceDate: null,
          metadata: {},
          createdAt: new Date('2024-03-01'),
        },
      ]

      vi.mocked(prisma.analysisHistory.findMany).mockResolvedValue(history)

      const result = await analysisEvolution.getMetricTrends('brand_health', 'ref-1', ['score'])

      expect(result).toHaveLength(1)
      expect(result[0].metric).toBe('score')
      expect(result[0].dataPoints).toHaveLength(3)
      expect(result[0].direction).toBe('increasing')
      expect(result[0].changePercent).toBeCloseTo(0.333, 2) // 33.3% increase
    })

    it('returns empty array if less than 2 data points', async () => {
      vi.mocked(prisma.analysisHistory.findMany).mockResolvedValue([
        {
          id: 'a1',
          orgId: 'org-1',
          analysisType: 'brand_health',
          referenceId: 'ref-1',
          analysisVersion: 1,
          results: {},
          aiInsights: [],
          keyMetrics: { score: 60 },
          confidence: null,
          dataSourceDate: null,
          metadata: {},
          createdAt: new Date(),
        },
      ])

      const result = await analysisEvolution.getMetricTrends('brand_health', 'ref-1', ['score'])

      expect(result).toHaveLength(0)
    })

    it('detects decreasing trends', async () => {
      const history = [
        {
          id: 'a1',
          orgId: 'org-1',
          analysisType: 'brand_health',
          referenceId: 'ref-1',
          analysisVersion: 1,
          results: {},
          aiInsights: [],
          keyMetrics: { score: 90 },
          confidence: null,
          dataSourceDate: null,
          metadata: {},
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'a2',
          orgId: 'org-1',
          analysisType: 'brand_health',
          referenceId: 'ref-1',
          analysisVersion: 2,
          results: {},
          aiInsights: [],
          keyMetrics: { score: 70 },
          confidence: null,
          dataSourceDate: null,
          metadata: {},
          createdAt: new Date('2024-02-01'),
        },
      ]

      vi.mocked(prisma.analysisHistory.findMany).mockResolvedValue(history)

      const result = await analysisEvolution.getMetricTrends('brand_health', 'ref-1', ['score'])

      expect(result[0].direction).toBe('decreasing')
    })

    it('detects stable trends', async () => {
      const history = [
        {
          id: 'a1',
          orgId: 'org-1',
          analysisType: 'brand_health',
          referenceId: 'ref-1',
          analysisVersion: 1,
          results: {},
          aiInsights: [],
          keyMetrics: { score: 75 },
          confidence: null,
          dataSourceDate: null,
          metadata: {},
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'a2',
          orgId: 'org-1',
          analysisType: 'brand_health',
          referenceId: 'ref-1',
          analysisVersion: 2,
          results: {},
          aiInsights: [],
          keyMetrics: { score: 75 },
          confidence: null,
          dataSourceDate: null,
          metadata: {},
          createdAt: new Date('2024-02-01'),
        },
      ]

      vi.mocked(prisma.analysisHistory.findMany).mockResolvedValue(history)

      const result = await analysisEvolution.getMetricTrends('brand_health', 'ref-1', ['score'])

      expect(result[0].direction).toBe('stable')
    })
  })

  describe('getLatestAnalysis', () => {
    it('returns the latest analysis entry', async () => {
      const mockEntry = {
        id: 'a5',
        orgId: 'org-1',
        analysisType: 'crosstab',
        referenceId: 'ref-1',
        analysisVersion: 5,
        results: { latest: true },
        aiInsights: ['Latest insight'],
        keyMetrics: { score: 95 },
        confidence: 0.98,
        dataSourceDate: null,
        metadata: {},
        createdAt: new Date(),
      }

      vi.mocked(prisma.analysisHistory.findFirst).mockResolvedValue(mockEntry)

      const result = await analysisEvolution.getLatestAnalysis('crosstab', 'ref-1')

      expect(result).not.toBeNull()
      expect(result!.analysisVersion).toBe(5)
    })

    it('returns null if no analysis exists', async () => {
      vi.mocked(prisma.analysisHistory.findFirst).mockResolvedValue(null)

      const result = await analysisEvolution.getLatestAnalysis('crosstab', 'ref-1')

      expect(result).toBeNull()
    })
  })

  describe('getConfidenceHistory', () => {
    it('returns confidence scores over time', async () => {
      const history = [
        { analysisVersion: 1, createdAt: new Date('2024-01-01'), confidence: 0.7 },
        { analysisVersion: 2, createdAt: new Date('2024-02-01'), confidence: 0.8 },
        { analysisVersion: 3, createdAt: new Date('2024-03-01'), confidence: 0.9 },
      ]

      vi.mocked(prisma.analysisHistory.findMany).mockResolvedValue(history as any)

      const result = await analysisEvolution.getConfidenceHistory('crosstab', 'ref-1')

      expect(result).toHaveLength(3)
      expect(result[0].confidence).toBe(0.7)
      expect(result[2].confidence).toBe(0.9)
    })
  })

  describe('generateEvolutionExplanation', () => {
    it('generates explanation with factors and recommendations', async () => {
      const comparison: EvolutionComparison = {
        analysisType: 'brand_health',
        referenceId: 'ref-1',
        versions: { from: 1, to: 2 },
        metricChanges: [
          { metric: 'brandScore', fromValue: 50, toValue: 75, changePercent: 0.5, isSignificant: true },
          { metric: 'awareness', fromValue: 0.3, toValue: 0.45, changePercent: 0.5, isSignificant: true },
        ],
        insightEvolution: {
          previousInsights: ['Old insight'],
          currentInsights: ['New insight'],
          addedInsights: ['New insight'],
          removedInsights: ['Old insight'],
          consistentInsights: [],
          evolutionSummary: '1 new insights identified.',
        },
        trends: [],
        shifts: [],
      }

      const result = await analysisEvolution.generateEvolutionExplanation(comparison)

      expect(result.explanation).toContain('Analysis has evolved')
      expect(result.factors.length).toBeGreaterThan(0)
      expect(result.factors[0]).toContain('brandScore')
    })

    it('generates recommendation for trend reversals', async () => {
      const comparison: EvolutionComparison = {
        analysisType: 'brand_health',
        referenceId: 'ref-1',
        versions: { from: 1, to: 2 },
        metricChanges: [],
        insightEvolution: {
          previousInsights: [],
          currentInsights: [],
          addedInsights: [],
          removedInsights: [],
          consistentInsights: [],
          evolutionSummary: 'No changes.',
        },
        trends: [],
        shifts: [
          {
            metric: 'score',
            shiftType: 'reversal',
            previousDirection: 'increasing',
            newDirection: 'decreasing',
            magnitude: 0.3,
            detectedAt: new Date(),
            significance: 'high',
          },
        ],
      }

      const result = await analysisEvolution.generateEvolutionExplanation(comparison)

      expect(result.recommendations).toContain('Review recent changes that may have caused trend reversals')
    })

    it('generates recommendation for declining metrics', async () => {
      const comparison: EvolutionComparison = {
        analysisType: 'brand_health',
        referenceId: 'ref-1',
        versions: { from: 1, to: 2 },
        metricChanges: [
          { metric: 'score', fromValue: 80, toValue: 60, changePercent: -0.25, isSignificant: true },
        ],
        insightEvolution: {
          previousInsights: [],
          currentInsights: [],
          addedInsights: [],
          removedInsights: [],
          consistentInsights: [],
          evolutionSummary: 'No changes.',
        },
        trends: [],
        shifts: [],
      }

      const result = await analysisEvolution.generateEvolutionExplanation(comparison)

      expect(result.recommendations).toContain('Analyze factors contributing to declining metrics')
    })
  })
})

describe('Convenience Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('trackAnalysis delegates to analysisEvolution', async () => {
    const mockEntry = {
      id: 'a1',
      orgId: 'org-1',
      analysisType: 'crosstab',
      referenceId: 'ref-1',
      analysisVersion: 1,
      results: {},
      aiInsights: [],
      keyMetrics: {},
      confidence: null,
      dataSourceDate: null,
      metadata: {},
      createdAt: new Date(),
    }

    vi.mocked(prisma.analysisHistory.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.analysisHistory.create).mockResolvedValue(mockEntry)

    const result = await trackAnalysis('org-1', 'crosstab', 'ref-1', {}, [], {})

    expect(result.analysisVersion).toBe(1)
  })

  it('getAnalysisHistory delegates correctly', async () => {
    vi.mocked(prisma.analysisHistory.findMany).mockResolvedValue([])
    vi.mocked(prisma.analysisHistory.count).mockResolvedValue(0)

    const result = await getAnalysisHistory('crosstab', 'ref-1')

    expect(result.history).toHaveLength(0)
  })

  it('compareAnalysisWithPrevious delegates correctly', async () => {
    vi.mocked(prisma.analysisHistory.findFirst)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)

    const result = await compareAnalysisWithPrevious('crosstab', 'ref-1')

    expect(result).toBeNull()
  })

  it('getMetricTrends delegates correctly', async () => {
    vi.mocked(prisma.analysisHistory.findMany).mockResolvedValue([])

    const result = await getMetricTrends('crosstab', 'ref-1', ['score'])

    expect(result).toHaveLength(0)
  })

  it('generateEvolutionExplanation delegates correctly', async () => {
    const comparison: EvolutionComparison = {
      analysisType: 'brand_health',
      referenceId: 'ref-1',
      versions: { from: 1, to: 2 },
      metricChanges: [],
      insightEvolution: {
        previousInsights: [],
        currentInsights: [],
        addedInsights: [],
        removedInsights: [],
        consistentInsights: [],
        evolutionSummary: 'Insights remain consistent.',
      },
      trends: [],
      shifts: [],
    }

    const result = await generateEvolutionExplanation(comparison)

    expect(result.explanation).toBeDefined()
    expect(result.factors).toBeDefined()
    expect(result.recommendations).toBeDefined()
  })
})
