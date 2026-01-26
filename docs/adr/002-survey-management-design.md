# ADR-002: Survey Management System Design

## Status
Accepted

## Date
2024-01-15

## Context
GWI needs to manage complex survey instruments with multiple question types, versioning, response collection, and distribution management. Surveys are the core data collection mechanism and must support:
- Multiple question types (single select, multi-select, scales, matrices, open text)
- Taxonomy integration for standardized data classification
- Version control for survey iterations
- Response tracking and analytics
- Multi-channel distribution

## Decision
We implement a hierarchical survey management system with the following structure:

### Data Model

```
Survey (1) ---> (N) SurveyQuestion
Survey (1) ---> (N) SurveyResponse
Survey (1) ---> (N) SurveyDistribution
```

### Key Design Decisions

1. **Question Type Enumeration**: Questions support 7 distinct types:
   - `SINGLE_SELECT` - Radio button style selection
   - `MULTI_SELECT` - Checkbox style selection
   - `SCALE` - Numeric scale (e.g., 1-10)
   - `OPEN_TEXT` - Free text response
   - `NUMERIC` - Numeric input with validation
   - `DATE` - Date picker input
   - `MATRIX` - Grid of options (row x column)

2. **Flexible Options Storage**: Question options stored as JSON to support:
   - Simple string arrays for select questions
   - Complex objects for scales (min, max, labels)
   - Matrix configurations (rows, columns)

3. **Taxonomy Integration**: Questions link to taxonomy categories via `taxonomyLinks` JSON field:
   ```json
   {
     "category": "demographics",
     "attribute": "age_group"
   }
   ```

4. **Survey Versioning**: Surveys have explicit version numbers:
   - Incremented on status changes
   - Enables tracking of survey evolution
   - Supports comparison between versions

5. **Status Workflow**:
   ```
   DRAFT -> ACTIVE -> PAUSED -> COMPLETED -> ARCHIVED
   ```
   - `DRAFT`: Under development
   - `ACTIVE`: Collecting responses
   - `PAUSED`: Temporarily stopped
   - `COMPLETED`: Collection finished
   - `ARCHIVED`: Historical record

6. **Response Storage**: Answers stored as JSON keyed by question code:
   ```json
   {
     "DEMO_AGE": "25-34",
     "BRAND_AWARENESS": ["Apple", "Google"],
     "SATISFACTION": 8
   }
   ```

## Consequences

### Positive
- Flexible question type support without schema changes
- Easy taxonomy integration via JSON links
- Version history for compliance and auditing
- Efficient response storage with question-keyed JSON

### Negative
- JSON fields reduce queryability for complex analytics
- No referential integrity between questions and taxonomy
- Response schema not enforced at database level

### Mitigation
- Pipeline validation rules enforce response schema
- Taxonomy links validated during question creation
- BigQuery/analytics warehouse used for complex queries

## Implementation Notes
- Survey CRUD: `app/api/gwi/surveys/route.ts`
- Question management: `app/api/gwi/surveys/[id]/questions/route.ts`
- Response analytics: `app/api/gwi/surveys/[id]/responses/route.ts`
- Distribution tracking: `app/api/gwi/surveys/[id]/distribution/route.ts`
