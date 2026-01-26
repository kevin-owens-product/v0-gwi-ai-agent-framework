# ADR-004: Data Pipeline Architecture

## Status
Accepted

## Date
2024-01-15

## Context
GWI processes large volumes of survey data requiring ETL operations, transformations, aggregations, and exports. Pipelines must:
- Run on schedules or on-demand
- Support multiple data sources and destinations
- Apply validation rules and quality checks
- Track execution history and errors
- Scale to millions of records

## Decision
We implement a configurable pipeline system with run tracking and validation.

### Data Model

```
DataPipeline (1) ---> (N) PipelineRun
DataPipeline (1) ---> (N) PipelineValidationRule
```

### Key Design Decisions

1. **Pipeline Types**:
   - `ETL` - Extract, Transform, Load operations
   - `TRANSFORMATION` - Data quality and normalization
   - `AGGREGATION` - Metric calculation and rollups
   - `EXPORT` - Client data delivery
   - `SYNC` - External system synchronization

2. **Configuration as JSON**:
   Pipeline configuration stored as JSON for flexibility:
   ```json
   {
     "source": { "type": "postgres", "table": "SurveyResponse" },
     "transform": { "applyTaxonomyMappings": true },
     "destination": { "type": "bigquery", "dataset": "analytics" }
   }
   ```

3. **Cron-based Scheduling**:
   - Standard 5-field cron expressions
   - `null` schedule for on-demand only
   - Examples:
     - `0 */6 * * *` - Every 6 hours
     - `0 2 * * *` - Daily at 2 AM
     - `*/30 * * * *` - Every 30 minutes

4. **Run Status Workflow**:
   ```
   PENDING -> RUNNING -> COMPLETED
                     \-> FAILED
                     \-> CANCELLED
   ```

5. **Run Tracking**:
   - `recordsProcessed` - Total records handled
   - `recordsFailed` - Records with errors
   - `metrics` - Performance data (bytes, timing)
   - `errorLog` - Detailed error information

6. **Validation Rules**:
   - Applied before/during/after processing
   - Severity levels: `error`, `warning`, `info`
   - Rule types:
     - `not_null` - Required field check
     - `range` - Numeric bounds check
     - `regex` - Pattern matching
     - `enum` - Allowed values check
     - `threshold` - Aggregate limits

7. **Concurrency Control**:
   - Prevent multiple runs of same pipeline
   - Check for `RUNNING` status before starting
   - Override available for admin users

## Consequences

### Positive
- Flexible configuration supports diverse use cases
- Comprehensive run tracking for debugging
- Validation rules catch issues early
- Scheduling via standard cron syntax

### Negative
- JSON configuration not type-checked at database level
- Cron parsing done at application level
- No built-in retry mechanism

### Mitigation
- Configuration validated on pipeline save
- Validation rules provide data quality checks
- Monitoring alerts on repeated failures

## Pipeline Examples

### Survey ETL Pipeline
```json
{
  "type": "ETL",
  "schedule": "0 */6 * * *",
  "configuration": {
    "source": {
      "type": "postgres",
      "table": "SurveyResponse",
      "incremental": true,
      "incrementalField": "createdAt"
    },
    "transform": {
      "applyTaxonomyMappings": true,
      "validateSchema": true,
      "enrichWithDemographics": true
    },
    "destination": {
      "type": "bigquery",
      "dataset": "gwi_analytics",
      "table": "survey_responses_processed",
      "writeMode": "append"
    }
  }
}
```

### Daily Aggregation Pipeline
```json
{
  "type": "AGGREGATION",
  "schedule": "0 2 * * *",
  "configuration": {
    "source": { "type": "bigquery", "dataset": "gwi_analytics" },
    "aggregations": [
      { "metric": "response_count", "groupBy": ["country", "age_group"] },
      { "metric": "nps_average", "groupBy": ["brand", "country"] }
    ],
    "destination": { "type": "bigquery", "table": "daily_aggregates" }
  }
}
```

## Implementation Notes
- Pipeline CRUD: `app/api/gwi/pipelines/route.ts`
- Run management: `app/api/gwi/pipelines/[id]/run/route.ts`
- Run history: `app/api/gwi/pipelines/[id]/runs/route.ts`
- Validation rules: `app/api/gwi/pipelines/[id]/validation-rules/route.ts`
