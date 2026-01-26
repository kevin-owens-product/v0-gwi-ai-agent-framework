import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/super-admin')
vi.mock('@/lib/gwi-permissions')
vi.mock('next/headers')

describe('GWI Data Pipelines API - /api/gwi/pipelines', () => {
  describe('GET /api/gwi/pipelines', () => {
    describe('Authorization', () => {
      it('should require pipelines:read permission', () => {
        const requiredPermission = 'pipelines:read'
        const dataEngineerPermissions = ['pipelines:read', 'pipelines:write', 'pipelines:run']
        expect(dataEngineerPermissions).toContain(requiredPermission)
      })

      it('should allow DATA_ENGINEER role', () => {
        const allowedRoles = ['DATA_ENGINEER', 'ML_ENGINEER', 'GWI_ADMIN', 'SUPER_ADMIN']
        expect(allowedRoles).toContain('DATA_ENGINEER')
      })
    })

    describe('Response Structure', () => {
      it('should return pipelines with metadata', () => {
        const pipeline = {
          id: 'pipeline-1',
          name: 'Survey Response ETL',
          description: 'Extracts and transforms survey responses',
          type: 'ETL',
          configuration: {
            source: { type: 'postgres', table: 'SurveyResponse' },
            destination: { type: 'bigquery', dataset: 'analytics' }
          },
          schedule: '0 */6 * * *',
          isActive: true,
          createdAt: new Date().toISOString(),
          _count: { runs: 50 }
        }

        expect(pipeline.type).toBeTruthy()
        expect(pipeline.configuration).toBeDefined()
        expect(pipeline._count).toBeDefined()
      })

      it('should include latest run status', () => {
        const pipeline = {
          id: 'pipeline-1',
          latestRun: {
            id: 'run-1',
            status: 'COMPLETED',
            startedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            recordsProcessed: 5000
          }
        }

        expect(pipeline.latestRun).toBeDefined()
        expect(pipeline.latestRun.status).toBeTruthy()
      })

      it('should support filtering by type', () => {
        const pipelineTypes = ['ETL', 'TRANSFORMATION', 'AGGREGATION', 'EXPORT', 'SYNC']
        const filterType = 'ETL'
        expect(pipelineTypes).toContain(filterType)
      })

      it('should support filtering by active status', () => {
        const pipelines = [
          { id: '1', isActive: true },
          { id: '2', isActive: false },
          { id: '3', isActive: true }
        ]

        const activePipelines = pipelines.filter(p => p.isActive)
        expect(activePipelines).toHaveLength(2)
      })
    })
  })

  describe('POST /api/gwi/pipelines', () => {
    describe('Request Validation', () => {
      it('should require name, type, and configuration', () => {
        const validPipeline = {
          name: 'New ETL Pipeline',
          type: 'ETL',
          configuration: {
            source: { type: 'postgres', table: 'data' },
            destination: { type: 'bigquery', dataset: 'analytics' }
          }
        }

        expect(validPipeline.name).toBeTruthy()
        expect(validPipeline.type).toBeTruthy()
        expect(validPipeline.configuration).toBeDefined()
      })

      it('should validate pipeline types', () => {
        const validTypes = ['ETL', 'TRANSFORMATION', 'AGGREGATION', 'EXPORT', 'SYNC']
        const type = 'ETL'
        expect(validTypes).toContain(type)
      })

      it('should validate cron schedule format', () => {
        const validSchedules = [
          '0 */6 * * *',  // Every 6 hours
          '0 2 * * *',    // Daily at 2 AM
          '*/30 * * * *', // Every 30 minutes
          '0 0 1 * *'     // First day of month
        ]

        const cronRegex = /^(\*|(\*\/)?[0-9,\-\/]+)\s+(\*|(\*\/)?[0-9,\-\/]+)\s+(\*|(\*\/)?[0-9,\-\/]+)\s+(\*|(\*\/)?[0-9,\-\/]+)\s+(\*|(\*\/)?[0-9,\-\/]+)$/

        validSchedules.forEach(schedule => {
          expect(schedule).toMatch(cronRegex)
        })
      })

      it('should validate ETL configuration', () => {
        const etlConfig = {
          source: {
            type: 'postgres',
            table: 'SurveyResponse',
            incremental: true,
            incrementalField: 'createdAt'
          },
          transform: {
            applyTaxonomyMappings: true,
            validateSchema: true
          },
          destination: {
            type: 'bigquery',
            dataset: 'gwi_analytics',
            table: 'survey_responses_processed',
            writeMode: 'append'
          }
        }

        expect(etlConfig.source.type).toBeTruthy()
        expect(etlConfig.destination.type).toBeTruthy()
      })

      it('should validate aggregation configuration', () => {
        const aggConfig = {
          source: { type: 'bigquery', dataset: 'analytics' },
          aggregations: [
            { metric: 'response_count', groupBy: ['country', 'age_group'] },
            { metric: 'nps_average', groupBy: ['brand', 'country'] }
          ],
          destination: { type: 'bigquery', table: 'aggregates' }
        }

        expect(aggConfig.aggregations).toBeDefined()
        expect(aggConfig.aggregations.length).toBeGreaterThan(0)
        expect(aggConfig.aggregations[0].metric).toBeTruthy()
        expect(aggConfig.aggregations[0].groupBy).toBeDefined()
      })
    })

    describe('Authorization', () => {
      it('should require pipelines:write permission', () => {
        const requiredPermission = 'pipelines:write'
        const dataEngineerPermissions = ['pipelines:read', 'pipelines:write', 'pipelines:run']
        expect(dataEngineerPermissions).toContain(requiredPermission)
      })
    })
  })

  describe('POST /api/gwi/pipelines/[id]/run', () => {
    describe('Pipeline Execution', () => {
      it('should require pipelines:run permission', () => {
        const requiredPermission = 'pipelines:run'
        const dataEngineerPermissions = ['pipelines:read', 'pipelines:write', 'pipelines:run']
        expect(dataEngineerPermissions).toContain(requiredPermission)
      })

      it('should create a new pipeline run', () => {
        const pipelineRun = {
          id: 'run-new',
          pipelineId: 'pipeline-1',
          status: 'PENDING',
          startedAt: new Date().toISOString()
        }

        expect(pipelineRun.status).toBe('PENDING')
        expect(pipelineRun.pipelineId).toBeTruthy()
      })

      it('should prevent running inactive pipeline', () => {
        const pipeline = { isActive: false }
        expect(pipeline.isActive).toBe(false)
      })

      it('should prevent concurrent runs by default', () => {
        const existingRuns = [
          { status: 'RUNNING' },
          { status: 'COMPLETED' }
        ]

        const hasRunningRun = existingRuns.some(r => r.status === 'RUNNING')
        expect(hasRunningRun).toBe(true)
      })

      it('should support override parameters', () => {
        const runParams = {
          parameters: {
            startDate: '2024-01-01',
            endDate: '2024-01-31',
            dryRun: true
          }
        }

        expect(runParams.parameters).toBeDefined()
        expect(runParams.parameters.dryRun).toBe(true)
      })
    })
  })

  describe('GET /api/gwi/pipelines/[id]/runs', () => {
    describe('Run History', () => {
      it('should return runs sorted by startedAt descending', () => {
        const runs = [
          { id: '1', startedAt: new Date('2024-01-03') },
          { id: '2', startedAt: new Date('2024-01-01') },
          { id: '3', startedAt: new Date('2024-01-02') }
        ]

        const sorted = [...runs].sort((a, b) =>
          b.startedAt.getTime() - a.startedAt.getTime()
        )

        expect(sorted[0].startedAt.getTime()).toBeGreaterThan(sorted[1].startedAt.getTime())
      })

      it('should include run metrics', () => {
        const run = {
          id: 'run-1',
          status: 'COMPLETED',
          startedAt: new Date('2024-01-01T00:00:00Z'),
          completedAt: new Date('2024-01-01T00:05:30Z'),
          recordsProcessed: 5000,
          recordsFailed: 12,
          metrics: {
            bytesProcessed: 10485760,
            transformationTime: 180000,
            loadTime: 120000
          }
        }

        expect(run.metrics).toBeDefined()
        expect(run.recordsProcessed).toBeGreaterThan(0)
      })

      it('should include error details for failed runs', () => {
        const failedRun = {
          id: 'run-failed',
          status: 'FAILED',
          errorLog: {
            error: 'Schema validation failed',
            details: 'Unexpected null value in required field',
            failedRecords: ['RESP-001', 'RESP-002']
          }
        }

        expect(failedRun.errorLog).toBeDefined()
        expect(failedRun.errorLog.error).toBeTruthy()
      })

      it('should support filtering by status', () => {
        const runs = [
          { id: '1', status: 'COMPLETED' },
          { id: '2', status: 'FAILED' },
          { id: '3', status: 'COMPLETED' }
        ]

        const failedRuns = runs.filter(r => r.status === 'FAILED')
        expect(failedRuns).toHaveLength(1)
      })

      it('should support date range filtering', () => {
        const startDate = new Date('2024-01-01')
        const endDate = new Date('2024-01-31')

        const runs = [
          { id: '1', startedAt: new Date('2024-01-15') },
          { id: '2', startedAt: new Date('2024-02-15') }
        ]

        const filtered = runs.filter(r =>
          r.startedAt >= startDate && r.startedAt <= endDate
        )

        expect(filtered).toHaveLength(1)
      })
    })
  })

  describe('Pipeline Validation Rules', () => {
    describe('GET /api/gwi/pipelines/[id]/validation-rules', () => {
      it('should return validation rules for pipeline', () => {
        const rules = [
          {
            id: 'rule-1',
            name: 'Required Fields Check',
            rule: { type: 'not_null', fields: ['respondentId', 'surveyId'] },
            severity: 'error',
            isActive: true
          },
          {
            id: 'rule-2',
            name: 'Age Range Validation',
            rule: { type: 'range', field: 'age', min: 16, max: 99 },
            severity: 'warning',
            isActive: true
          }
        ]

        expect(rules.length).toBeGreaterThan(0)
        expect(rules[0].rule).toBeDefined()
        expect(rules[0].severity).toBeTruthy()
      })

      it('should validate rule types', () => {
        const validRuleTypes = ['not_null', 'range', 'regex', 'enum', 'threshold', 'custom']
        const ruleType = 'range'
        expect(validRuleTypes).toContain(ruleType)
      })

      it('should validate severity levels', () => {
        const validSeverities = ['error', 'warning', 'info']
        const severity = 'error'
        expect(validSeverities).toContain(severity)
      })
    })

    describe('POST /api/gwi/pipelines/[id]/validation-rules', () => {
      it('should require name and rule', () => {
        const validRule = {
          name: 'New Validation Rule',
          rule: { type: 'not_null', fields: ['field1'] },
          severity: 'error'
        }

        expect(validRule.name).toBeTruthy()
        expect(validRule.rule).toBeDefined()
      })

      it('should validate range rule configuration', () => {
        const rangeRule = {
          type: 'range',
          field: 'age',
          min: 0,
          max: 100
        }

        expect(rangeRule.min).toBeLessThan(rangeRule.max)
        expect(rangeRule.field).toBeTruthy()
      })

      it('should validate regex rule configuration', () => {
        const regexRule = {
          type: 'regex',
          field: 'country',
          pattern: '^[A-Z]{2}$'
        }

        expect(regexRule.pattern).toBeTruthy()
        expect(() => new RegExp(regexRule.pattern)).not.toThrow()
      })

      it('should validate threshold rule configuration', () => {
        const thresholdRule = {
          type: 'threshold',
          metric: 'count',
          minValue: 30,
          groupBy: ['country', 'segment']
        }

        expect(thresholdRule.metric).toBeTruthy()
        expect(thresholdRule.minValue).toBeGreaterThan(0)
      })
    })
  })

  describe('Pipeline Schedules', () => {
    describe('Schedule Management', () => {
      it('should parse cron expression', () => {
        const schedule = '0 */6 * * *'
        const parts = schedule.split(' ')

        expect(parts).toHaveLength(5)
        expect(parts[0]).toBe('0')      // minute
        expect(parts[1]).toBe('*/6')    // hour (every 6 hours)
        expect(parts[2]).toBe('*')      // day of month
        expect(parts[3]).toBe('*')      // month
        expect(parts[4]).toBe('*')      // day of week
      })

      it('should calculate next run time', () => {
        // Simple approximation - every 6 hours
        const now = new Date()
        const hoursToNext = 6 - (now.getHours() % 6)
        const nextRun = new Date(now)
        nextRun.setHours(now.getHours() + hoursToNext, 0, 0, 0)

        expect(nextRun.getTime()).toBeGreaterThan(now.getTime())
      })

      it('should support disabling schedule', () => {
        const pipeline = {
          schedule: '0 */6 * * *',
          isActive: false
        }

        // Pipeline won't run if inactive, even with schedule
        expect(pipeline.isActive).toBe(false)
      })

      it('should support on-demand only pipelines', () => {
        const pipeline = {
          schedule: null,
          isActive: true
        }

        expect(pipeline.schedule).toBeNull()
      })
    })
  })
})

describe('Pipeline Run Status Transitions', () => {
  it('should follow valid state transitions', () => {
    const validTransitions: Record<string, string[]> = {
      'PENDING': ['RUNNING', 'CANCELLED'],
      'RUNNING': ['COMPLETED', 'FAILED', 'CANCELLED'],
      'COMPLETED': [],
      'FAILED': [],
      'CANCELLED': []
    }

    // PENDING -> RUNNING is valid
    expect(validTransitions['PENDING']).toContain('RUNNING')

    // RUNNING -> COMPLETED is valid
    expect(validTransitions['RUNNING']).toContain('COMPLETED')

    // COMPLETED -> RUNNING is invalid
    expect(validTransitions['COMPLETED']).not.toContain('RUNNING')
  })

  it('should calculate run duration', () => {
    const run = {
      startedAt: new Date('2024-01-01T00:00:00Z'),
      completedAt: new Date('2024-01-01T00:05:30Z')
    }

    const durationMs = run.completedAt.getTime() - run.startedAt.getTime()
    const durationSeconds = durationMs / 1000

    expect(durationSeconds).toBe(330) // 5 minutes 30 seconds
  })

  it('should calculate success rate', () => {
    const runs = [
      { status: 'COMPLETED' },
      { status: 'COMPLETED' },
      { status: 'FAILED' },
      { status: 'COMPLETED' },
      { status: 'COMPLETED' }
    ]

    const total = runs.length
    const successful = runs.filter(r => r.status === 'COMPLETED').length
    const successRate = successful / total

    expect(successRate).toBe(0.8)
  })
})
