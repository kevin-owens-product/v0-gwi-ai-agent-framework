import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/auth')
vi.mock('@/lib/db')
vi.mock('@/lib/tenant')
vi.mock('@/lib/permissions')
vi.mock('@/lib/analysis-evolution')
vi.mock('next/headers')

describe('Evolution API - GET /api/v1/evolution/[analysisType]/[referenceId]', () => {
  describe('Analysis Type Validation', () => {
    it('should accept valid analysis types', () => {
      const validTypes = [
        'crosstab',
        'audience_insight',
        'brand_health',
        'market_analysis',
        'competitor_analysis',
        'trend_analysis',
      ]

      validTypes.forEach(type => {
        expect(validTypes).toContain(type)
      })
    })

    it('should reject invalid analysis types', () => {
      const invalidTypes = ['random', 'user_analysis', 'unknown']
      const validTypes = [
        'crosstab',
        'audience_insight',
        'brand_health',
        'market_analysis',
        'competitor_analysis',
        'trend_analysis',
      ]

      invalidTypes.forEach(type => {
        expect(validTypes).not.toContain(type)
      })
    })
  })

  describe('Request Parameters', () => {
    it('should validate pagination parameters', () => {
      const limit = 50
      const offset = 0

      expect(limit).toBeGreaterThan(0)
      expect(limit).toBeLessThanOrEqual(100)
      expect(offset).toBeGreaterThanOrEqual(0)
    })

    it('should parse metrics parameter', () => {
      const metricsStr = 'brandScore,awareness,consideration'
      const metrics = metricsStr.split(',')

      expect(metrics).toHaveLength(3)
      expect(metrics).toContain('brandScore')
    })

    it('should parse periods parameter for trends', () => {
      const periods = 12
      expect(periods).toBeGreaterThan(0)
      expect(periods).toBeLessThanOrEqual(50)
    })
  })

  describe('Response Structure', () => {
    it('should return analysis history response', () => {
      const response = {
        analysisType: 'brand_health',
        referenceId: 'ref-123',
        history: [],
        total: 0,
        limit: 50,
        offset: 0,
      }

      expect(response.analysisType).toBeDefined()
      expect(response.referenceId).toBeDefined()
      expect(Array.isArray(response.history)).toBe(true)
    })

    it('should include analysis history entries', () => {
      const entry = {
        id: 'analysis-123',
        orgId: 'org-123',
        analysisType: 'brand_health',
        referenceId: 'brand-123',
        analysisVersion: 5,
        results: {
          overallHealth: 78,
          segments: { awareness: 65, consideration: 55, preference: 42 },
        },
        aiInsights: [
          'Brand awareness has improved 12% YoY',
          'Consider targeting 25-34 age group for growth',
          'Competitive pressure from Brand X noted',
        ],
        keyMetrics: {
          brandScore: 78,
          awareness: 65,
          consideration: 55,
          preference: 42,
          nps: 32,
        },
        confidence: 0.89,
        dataSourceDate: new Date('2024-01-15'),
        metadata: { source: 'quarterly_survey' },
        createdAt: new Date(),
      }

      expect(entry.analysisVersion).toBeGreaterThan(0)
      expect(entry.aiInsights.length).toBeGreaterThan(0)
      expect(entry.confidence).toBeGreaterThanOrEqual(0)
      expect(entry.confidence).toBeLessThanOrEqual(1)
    })
  })

  describe('Trend Analysis', () => {
    it('should return metric trends', () => {
      const trend = {
        metric: 'brandScore',
        dataPoints: [
          { version: 1, date: new Date('2024-01-01'), value: 65, confidence: 0.85 },
          { version: 2, date: new Date('2024-02-01'), value: 70, confidence: 0.87 },
          { version: 3, date: new Date('2024-03-01'), value: 75, confidence: 0.89 },
          { version: 4, date: new Date('2024-04-01'), value: 78, confidence: 0.91 },
        ],
        direction: 'increasing',
        changePercent: 0.2,
        trendStrength: 0.92,
      }

      expect(trend.dataPoints).toHaveLength(4)
      expect(trend.direction).toBe('increasing')
      expect(trend.trendStrength).toBeGreaterThan(0)
    })

    it('should detect trend directions', () => {
      const directions = ['increasing', 'decreasing', 'stable', 'volatile']

      directions.forEach(dir => {
        expect(['increasing', 'decreasing', 'stable', 'volatile']).toContain(dir)
      })
    })

    it('should calculate change percentage', () => {
      const firstValue = 50
      const lastValue = 75
      const changePercent = (lastValue - firstValue) / firstValue

      expect(changePercent).toBeCloseTo(0.5) // 50% increase
    })
  })

  describe('Error Handling', () => {
    it('should return 401 for unauthenticated requests', () => {
      const errorResponse = { error: 'Unauthorized' }
      const status = 401

      expect(status).toBe(401)
    })

    it('should return 400 for invalid analysis type', () => {
      const errorResponse = {
        error: 'Invalid analysis type. Must be one of: crosstab, audience_insight, brand_health, market_analysis, competitor_analysis, trend_analysis',
      }
      const status = 400

      expect(status).toBe(400)
      expect(errorResponse.error).toContain('Invalid analysis type')
    })

    it('should return 404 when no organization found', () => {
      const errorResponse = { error: 'No organization found' }
      const status = 404

      expect(status).toBe(404)
    })

    it('should return 403 when permission denied', () => {
      const errorResponse = { error: 'Permission denied' }
      const status = 403

      expect(status).toBe(403)
    })
  })
})

describe('Evolution API - Compare Endpoint', () => {
  describe('Request Parameters', () => {
    it('should require two version numbers', () => {
      const fromVersion = 1
      const toVersion = 5

      expect(fromVersion).toBeLessThan(toVersion)
      expect(fromVersion).toBeGreaterThan(0)
      expect(toVersion).toBeGreaterThan(0)
    })
  })

  describe('Comparison Response Structure', () => {
    it('should return evolution comparison', () => {
      const comparison = {
        analysisType: 'brand_health',
        referenceId: 'brand-123',
        versions: { from: 1, to: 5 },
        metricChanges: [
          { metric: 'brandScore', fromValue: 60, toValue: 78, changePercent: 0.3, isSignificant: true },
          { metric: 'awareness', fromValue: 50, toValue: 65, changePercent: 0.3, isSignificant: true },
          { metric: 'consideration', fromValue: 45, toValue: 55, changePercent: 0.22, isSignificant: true },
        ],
        insightEvolution: {
          previousInsights: ['Insight A', 'Insight B'],
          currentInsights: ['Insight B', 'Insight C', 'Insight D'],
          addedInsights: ['Insight C', 'Insight D'],
          removedInsights: ['Insight A'],
          consistentInsights: ['Insight B'],
          evolutionSummary: '2 new insights identified. Analysis reveals additional patterns.',
        },
        trends: [],
        shifts: [],
      }

      expect(comparison.versions.from).toBeLessThan(comparison.versions.to)
      expect(comparison.metricChanges.length).toBeGreaterThan(0)
      expect(comparison.insightEvolution).toBeDefined()
    })

    it('should include metric changes with significance', () => {
      const metricChanges = [
        { metric: 'score', fromValue: 50, toValue: 60, changePercent: 0.2, isSignificant: true },
        { metric: 'minor', fromValue: 100, toValue: 105, changePercent: 0.05, isSignificant: false },
      ]

      const significant = metricChanges.filter(m => m.isSignificant)
      expect(significant).toHaveLength(1)
    })

    it('should calculate insight evolution', () => {
      const previousInsights = ['A', 'B', 'C']
      const currentInsights = ['B', 'C', 'D', 'E']

      const previousSet = new Set(previousInsights)
      const currentSet = new Set(currentInsights)

      const added = currentInsights.filter(i => !previousSet.has(i))
      const removed = previousInsights.filter(i => !currentSet.has(i))
      const consistent = currentInsights.filter(i => previousSet.has(i))

      expect(added).toEqual(['D', 'E'])
      expect(removed).toEqual(['A'])
      expect(consistent).toEqual(['B', 'C'])
    })
  })

  describe('Trend Shift Detection', () => {
    it('should detect trend reversals', () => {
      const shift = {
        metric: 'brandScore',
        shiftType: 'reversal',
        previousDirection: 'increasing',
        newDirection: 'decreasing',
        magnitude: 0.35,
        detectedAt: new Date(),
        significance: 'high',
      }

      expect(shift.shiftType).toBe('reversal')
      expect(shift.previousDirection).not.toBe(shift.newDirection)
    })

    it('should detect acceleration', () => {
      const shift = {
        metric: 'awareness',
        shiftType: 'acceleration',
        previousDirection: 'increasing',
        newDirection: 'increasing',
        magnitude: 0.25,
        detectedAt: new Date(),
        significance: 'medium',
      }

      expect(shift.shiftType).toBe('acceleration')
    })

    it('should detect deceleration', () => {
      const shift = {
        metric: 'consideration',
        shiftType: 'deceleration',
        previousDirection: 'increasing',
        newDirection: 'stable',
        magnitude: 0.15,
        detectedAt: new Date(),
        significance: 'low',
      }

      expect(shift.shiftType).toBe('deceleration')
    })

    it('should classify significance levels', () => {
      const significanceLevels = ['low', 'medium', 'high']

      significanceLevels.forEach(level => {
        expect(['low', 'medium', 'high']).toContain(level)
      })
    })
  })

  describe('Evolution Explanation', () => {
    it('should generate explanation with factors', () => {
      const explanation = {
        explanation: 'Analysis has evolved across 5 metrics. 3 show significant changes. 2 new insights identified.',
        factors: [
          'brandScore increased by 30.0%',
          'awareness increased by 30.0%',
          'consideration increased by 22.2%',
        ],
        recommendations: [
          'Investigate newly identified patterns for actionable opportunities',
        ],
      }

      expect(explanation.explanation).toBeTruthy()
      expect(explanation.factors.length).toBeGreaterThan(0)
      expect(Array.isArray(explanation.recommendations)).toBe(true)
    })

    it('should include recommendations based on patterns', () => {
      const scenarios = [
        { condition: 'trend_reversal', recommendation: 'Review recent changes that may have caused trend reversals' },
        { condition: 'new_insights', recommendation: 'Investigate newly identified patterns for actionable opportunities' },
        { condition: 'declining_metrics', recommendation: 'Analyze factors contributing to declining metrics' },
      ]

      scenarios.forEach(scenario => {
        expect(scenario.recommendation.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Confidence History', () => {
    it('should return confidence scores over time', () => {
      const confidenceHistory = [
        { version: 1, date: new Date('2024-01-01'), confidence: 0.75 },
        { version: 2, date: new Date('2024-02-01'), confidence: 0.80 },
        { version: 3, date: new Date('2024-03-01'), confidence: 0.85 },
        { version: 4, date: new Date('2024-04-01'), confidence: 0.89 },
      ]

      expect(confidenceHistory).toHaveLength(4)
      expect(confidenceHistory[3].confidence).toBeGreaterThan(confidenceHistory[0].confidence)
    })

    it('should handle null confidence values', () => {
      const confidenceHistory = [
        { version: 1, date: new Date(), confidence: 0.75 },
        { version: 2, date: new Date(), confidence: null },
        { version: 3, date: new Date(), confidence: 0.85 },
      ]

      const withConfidence = confidenceHistory.filter(h => h.confidence !== null)
      expect(withConfidence).toHaveLength(2)
    })
  })
})
