# GWI Data Models

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Surveys](#surveys)
3. [Taxonomy](#taxonomy)
4. [Data Pipelines](#data-pipelines)
5. [LLM Configuration](#llm-configuration)
6. [Prompt Templates](#prompt-templates)
7. [GWI Data Sources](#gwi-data-sources)

---

## Overview

GWI data models support the GWI Portal functionality for managing surveys, taxonomy, data pipelines, LLM configurations, and data source connections. These models are scoped to organizations and managed by GWI team members with appropriate permissions.

**Database:** PostgreSQL  
**ORM:** Prisma  
**Schema File:** `prisma/schema.prisma`  
**Access:** GWI Portal (requires `gwiToken` authentication)

---

## Surveys

### Survey Model

**Model:** `Survey`  
**Purpose:** Survey definitions and management

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID) |
| `name` | `String` | Survey name |
| `description` | `String?` | Survey description |
| `version` | `Int` | Version number (default: 1) |
| `status` | `SurveyStatus` | Status (DRAFT, ACTIVE, PAUSED, COMPLETED, ARCHIVED) |
| `orgId` | `String?` | Organization ID (null = global) |
| `createdById` | `String` | Creator super admin ID |
| `createdAt` | `DateTime` | Creation timestamp |
| `updatedAt` | `DateTime` | Last update timestamp |

### Relationships

- **Questions:** `SurveyQuestion[]` - Survey questions
- **Responses:** `SurveyResponse[]` - Survey responses
- **Distributions:** `SurveyDistribution[]` - Survey distributions
- **Organization:** `Organization?` - Owning organization
- **Creator:** `SuperAdmin` - Creator user

### Survey Status

**Enum:** `SurveyStatus`

- `DRAFT` - Draft (not yet active)
- `ACTIVE` - Active and collecting responses
- `PAUSED` - Temporarily paused
- `COMPLETED` - Survey completed
- `ARCHIVED` - Archived (read-only)

### Survey Question

**Model:** `SurveyQuestion`  
**Purpose:** Individual survey questions

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID) |
| `surveyId` | `String` | Survey ID |
| `code` | `String` | Question code (unique per survey) |
| `text` | `String` | Question text |
| `type` | `QuestionType` | Question type |
| `options` | `Json?` | Options for select questions |
| `validationRules` | `Json?` | Validation rules |
| `order` | `Int` | Display order |
| `required` | `Boolean` | Required flag |
| `taxonomyLinks` | `Json?` | Links to taxonomy categories |
| `createdAt` | `DateTime` | Creation timestamp |
| `updatedAt` | `DateTime` | Last update timestamp |

### Question Types

**Enum:** `QuestionType`

- `SINGLE_SELECT` - Single choice question
- `MULTI_SELECT` - Multiple choice question
- `SCALE` - Scale/rating question
- `OPEN_TEXT` - Open text response
- `NUMERIC` - Numeric response
- `DATE` - Date response
- `MATRIX` - Matrix/grid question

### Survey Response

**Model:** `SurveyResponse`  
**Purpose:** Individual survey responses

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID) |
| `surveyId` | `String` | Survey ID |
| `respondentId` | `String` | Respondent identifier |
| `answers` | `Json` | Response answers |
| `metadata` | `Json?` | Additional metadata |
| `completedAt` | `DateTime?` | Completion timestamp |
| `createdAt` | `DateTime` | Creation timestamp |

### Survey Distribution

**Model:** `SurveyDistribution`  
**Purpose:** Survey distribution channels

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID) |
| `surveyId` | `String` | Survey ID |
| `channel` | `String` | Distribution channel |
| `targetCount` | `Int` | Target response count |
| `completedCount` | `Int` | Completed response count |
| `startDate` | `DateTime` | Start date |
| `endDate` | `DateTime?` | End date |
| `status` | `String` | Distribution status |
| `createdAt` | `DateTime` | Creation timestamp |

### Usage Example

```typescript
import { prisma } from '@/lib/db'

// Create survey
const survey = await prisma.survey.create({
  data: {
    name: 'Consumer Behavior Survey',
    description: 'Q1 2026 consumer behavior',
    status: 'DRAFT',
    orgId: 'org_123',
    createdById: 'admin_123',
    questions: {
      create: [
        {
          code: 'Q1',
          text: 'How often do you shop online?',
          type: 'SINGLE_SELECT',
          options: ['Daily', 'Weekly', 'Monthly', 'Rarely'],
          order: 1,
          required: true,
        },
      ],
    },
  },
})
```

---

## Taxonomy

### Taxonomy Category

**Model:** `TaxonomyCategory`  
**Purpose:** Taxonomy category definitions

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID) |
| `name` | `String` | Category name |
| `code` | `String` | Category code (unique) |
| `description` | `String?` | Category description |
| `parentId` | `String?` | Parent category ID |
| `version` | `Int` | Version number (default: 1) |
| `isActive` | `Boolean` | Active status |
| `orgId` | `String?` | Organization ID (null = global) |
| `createdAt` | `DateTime` | Creation timestamp |
| `updatedAt` | `DateTime` | Last update timestamp |

### Relationships

- **Parent:** `TaxonomyCategory?` - Parent category
- **Children:** `TaxonomyCategory[]` - Child categories
- **Attributes:** `TaxonomyAttribute[]` - Category attributes
- **Organization:** `Organization?` - Owning organization

### Taxonomy Attribute

**Model:** `TaxonomyAttribute`  
**Purpose:** Attributes within taxonomy categories

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID) |
| `categoryId` | `String` | Category ID |
| `name` | `String` | Attribute name |
| `code` | `String` | Attribute code (unique per category) |
| `dataType` | `String` | Data type (string, number, boolean, etc.) |
| `allowedValues` | `Json?` | Allowed values |
| `validationRules` | `Json?` | Validation rules |
| `isRequired` | `Boolean` | Required flag |
| `createdAt` | `DateTime` | Creation timestamp |
| `updatedAt` | `DateTime` | Last update timestamp |

### Taxonomy Mapping Rule

**Model:** `TaxonomyMappingRule`  
**Purpose:** Rules for mapping data to taxonomy

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID) |
| `name` | `String` | Rule name |
| `sourceField` | `String` | Source field name |
| `targetCategoryCode` | `String` | Target category code |
| `targetAttributeCode` | `String?` | Target attribute code |
| `transformationRule` | `Json?` | Transformation rules |
| `priority` | `Int` | Priority (higher = evaluated first) |
| `isActive` | `Boolean` | Active status |
| `createdAt` | `DateTime` | Creation timestamp |
| `updatedAt` | `DateTime` | Last update timestamp |

### Usage Example

```typescript
import { prisma } from '@/lib/db'

// Create taxonomy category
const category = await prisma.taxonomyCategory.create({
  data: {
    name: 'Demographics',
    code: 'DEMO',
    description: 'Demographic categories',
    orgId: 'org_123',
    attributes: {
      create: [
        {
          name: 'Age Range',
          code: 'age_range',
          dataType: 'string',
          allowedValues: ['18-24', '25-34', '35-44', '45+'],
          isRequired: true,
        },
      ],
    },
  },
})
```

---

## Data Pipelines

### Data Pipeline

**Model:** `DataPipeline`  
**Purpose:** ETL and data transformation pipelines

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID) |
| `name` | `String` | Pipeline name |
| `description` | `String?` | Pipeline description |
| `type` | `PipelineType` | Pipeline type |
| `configuration` | `Json` | Pipeline configuration |
| `schedule` | `String?` | Cron expression for scheduling |
| `isActive` | `Boolean` | Active status |
| `orgId` | `String?` | Organization ID |
| `createdById` | `String` | Creator super admin ID |
| `createdAt` | `DateTime` | Creation timestamp |
| `updatedAt` | `DateTime` | Last update timestamp |

### Relationships

- **Runs:** `PipelineRun[]` - Pipeline execution history
- **Validation Rules:** `PipelineValidationRule[]` - Validation rules
- **Organization:** `Organization?` - Owning organization
- **Creator:** `SuperAdmin` - Creator user

### Pipeline Types

**Enum:** `PipelineType`

- `ETL` - Extract, Transform, Load
- `TRANSFORMATION` - Data transformation
- `AGGREGATION` - Data aggregation
- `EXPORT` - Data export
- `SYNC` - Data synchronization

### Pipeline Configuration

```typescript
{
  source: {
    type: 'api' | 'database' | 'file'
    connection: string
    query?: string
  }
  transformations: Array<{
    type: string
    config: Record<string, any>
  }>
  destination: {
    type: 'database' | 'api' | 'file'
    connection: string
  }
  errorHandling?: {
    retryAttempts: number
    onError: 'fail' | 'skip' | 'continue'
  }
}
```

### Pipeline Run

**Model:** `PipelineRun`  
**Purpose:** Pipeline execution history

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID) |
| `pipelineId` | `String` | Pipeline ID |
| `status` | `PipelineRunStatus` | Run status |
| `startedAt` | `DateTime` | Start timestamp |
| `completedAt` | `DateTime?` | Completion timestamp |
| `recordsProcessed` | `Int?` | Records processed |
| `recordsFailed` | `Int?` | Records failed |
| `errorLog` | `Json?` | Error log |
| `metrics` | `Json?` | Execution metrics |

### Pipeline Run Status

**Enum:** `PipelineRunStatus`

- `PENDING` - Queued for execution
- `RUNNING` - Currently running
- `COMPLETED` - Successfully completed
- `FAILED` - Failed execution
- `CANCELLED` - Cancelled execution

### Usage Example

```typescript
import { prisma } from '@/lib/db'

// Create pipeline
const pipeline = await prisma.dataPipeline.create({
  data: {
    name: 'Daily Survey Data Sync',
    type: 'SYNC',
    schedule: '0 2 * * *', // Daily at 2 AM
    isActive: true,
    orgId: 'org_123',
    configuration: {
      source: {
        type: 'api',
        connection: 'gwi_api',
      },
      destination: {
        type: 'database',
        connection: 'postgres',
      },
    },
    createdById: 'admin_123',
  },
})
```

---

## LLM Configuration

**Model:** `LLMConfiguration`  
**Purpose:** LLM provider configurations for GWI Portal

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID) |
| `name` | `String` | Configuration name |
| `provider` | `String` | Provider (anthropic, openai, gwi_spark) |
| `apiKey` | `String` | API key (encrypted) |
| `baseUrl` | `String?` | Base URL override |
| `defaultModel` | `String` | Default model name |
| `settings` | `Json` | Provider-specific settings |
| `isActive` | `Boolean` | Active status |
| `createdAt` | `DateTime` | Creation timestamp |
| `updatedAt` | `DateTime` | Last update timestamp |

### Settings Structure

```typescript
{
  temperature?: number
  maxTokens?: number
  timeout?: number
  retryPolicy?: {
    maxRetries: number
    backoffMs: number
  }
  rateLimits?: {
    requestsPerMinute: number
    tokensPerMinute: number
  }
}
```

### Usage Example

```typescript
import { prisma } from '@/lib/db'

// Create LLM configuration
const llmConfig = await prisma.lLMConfiguration.create({
  data: {
    name: 'Anthropic Production',
    provider: 'anthropic',
    apiKey: 'encrypted_key',
    defaultModel: 'claude-3-opus-20240229',
    settings: {
      temperature: 0.7,
      maxTokens: 4096,
    },
    isActive: true,
  },
})
```

---

## Prompt Templates

**Model:** `PromptTemplate`  
**Purpose:** Reusable prompt templates for GWI Portal

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID) |
| `name` | `String` | Template name |
| `description` | `String?` | Template description |
| `category` | `String` | Template category |
| `prompt` | `String` | Prompt template (with variables) |
| `variables` | `Json` | Variable definitions |
| `tags` | `String[]` | Tags |
| `isGlobal` | `Boolean` | Available to all organizations |
| `orgId` | `String?` | Organization ID (null = global) |
| `createdById` | `String` | Creator super admin ID |
| `createdAt` | `DateTime` | Creation timestamp |
| `updatedAt` | `DateTime` | Last update timestamp |

### Variables Structure

```typescript
Array<{
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  description: string
  required: boolean
  default?: any
}>
```

### Usage Example

```typescript
import { prisma } from '@/lib/db'

// Create prompt template
const template = await prisma.promptTemplate.create({
  data: {
    name: 'Survey Analysis Template',
    category: 'analysis',
    prompt: 'Analyze the survey data for {{market}} market focusing on {{topic}}.',
    variables: [
      {
        name: 'market',
        type: 'string',
        description: 'Market code',
        required: true,
      },
      {
        name: 'topic',
        type: 'string',
        description: 'Analysis topic',
        required: true,
      },
    ],
    orgId: 'org_123',
    createdById: 'admin_123',
  },
})
```

---

## GWI Data Sources

**Model:** `GWIDataSourceConnection`  
**Purpose:** GWI data source connections

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String` | Unique identifier (CUID) |
| `name` | `String` | Connection name |
| `type` | `String` | Connection type |
| `configuration` | `Json` | Connection configuration |
| `status` | `String` | Connection status |
| `lastSync` | `DateTime?` | Last sync timestamp |
| `orgId` | `String?` | Organization ID |
| `createdAt` | `DateTime` | Creation timestamp |
| `updatedAt` | `DateTime` | Last update timestamp |

### Configuration Structure

```typescript
{
  endpoint: string
  credentials: {
    apiKey?: string
    username?: string
    password?: string
  }
  syncSettings?: {
    frequency: string
    batchSize: number
  }
}
```

### Usage Example

```typescript
import { prisma } from '@/lib/db'

// Create data source connection
const connection = await prisma.gWIDataSourceConnection.create({
  data: {
    name: 'GWI API Connection',
    type: 'gwi_api',
    configuration: {
      endpoint: 'https://api.gwi.com',
      credentials: {
        apiKey: 'encrypted_key',
      },
    },
    status: 'ACTIVE',
    orgId: 'org_123',
  },
})
```

---

## Best Practices

### 1. Organization Scoping

```typescript
// Always filter by organization when applicable
const surveys = await prisma.survey.findMany({
  where: { orgId: 'org_123' },
})
```

### 2. Version Management

```typescript
// Use versioning for surveys and taxonomy
const survey = await prisma.survey.create({
  data: {
    ...surveyData,
    version: 1,
  },
})

// Create new version
const newVersion = await prisma.survey.create({
  data: {
    ...surveyData,
    version: survey.version + 1,
  },
})
```

### 3. Pipeline Error Handling

```typescript
// Log pipeline errors
await prisma.pipelineRun.create({
  data: {
    pipelineId: pipelineId,
    status: 'FAILED',
    errorLog: {
      error: error.message,
      stack: error.stack,
      timestamp: new Date(),
    },
  },
})
```

### 4. Taxonomy Hierarchy

```typescript
// Use parent-child relationships for taxonomy
const category = await prisma.taxonomyCategory.create({
  data: {
    name: 'Subcategory',
    code: 'SUB',
    parentId: parentCategoryId,
  },
})
```

---

## Related Documentation

- [Core Data Models](./CORE_DATA_MODELS.md) - Core platform models
- [Enterprise Data Models](./ENTERPRISE_DATA_MODELS.md) - Enterprise features
- [GWI API](../api/GWI_API.md) - GWI API endpoints
- [Data Pipelines](../features/DATA_PIPELINES.md) - Pipeline documentation

---

**Last Updated:** January 2026  
**Maintained By:** Engineering Team
