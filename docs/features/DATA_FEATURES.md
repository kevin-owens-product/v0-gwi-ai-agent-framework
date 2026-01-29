# Data Features

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Audiences](#audiences)
2. [Crosstabs](#crosstabs)
3. [Brand Tracking](#brand-tracking)
4. [Charts](#charts)
5. [Data Sources](#data-sources)
6. [Data Export](#data-export)

---

## Audiences

### Overview

Audiences enable segmentation and targeting using demographic, behavioral, and psychographic criteria. They are reusable definitions that can be used across analyses, reports, and brand tracking.

### Audience Model

**Database Model:** `Audience`

```prisma
model Audience {
  id          String    @id @default(cuid())
  orgId       String
  name        String
  description String?
  criteria    Json      @default("{}") // Audience definition
  size        Int?      // Estimated audience size
  markets     String[]  // Market codes (e.g., ["US", "UK"])
  isFavorite  Boolean   @default(false)
  lastUsed    DateTime?
  usageCount  Int       @default(0)
  createdBy   String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  organization Organization @relation(...)
}
```

### Audience Criteria Structure

**Criteria Format:**
```json
{
  "filters": [
    {
      "field": "age",
      "operator": "between",
      "value": [25, 40]
    },
    {
      "field": "income",
      "operator": "greater_than",
      "value": 50000
    },
    {
      "field": "interests",
      "operator": "contains",
      "value": ["technology", "gaming"]
    }
  ],
  "logic": "AND" // or "OR"
}
```

**Filter Operators:**
- `equals` - Exact match
- `contains` - Array contains value
- `between` - Range match
- `greater_than` - Numeric comparison
- `less_than` - Numeric comparison
- `in` - Value in array
- `not_in` - Value not in array

### Market Scoping

**Markets:** Array of market codes (ISO country codes or custom codes)
- Examples: `["US", "UK", "DE", "FR"]`
- Used for regional analysis
- Affects data availability and calculations

### Usage Tracking

- **`lastUsed`** - Timestamp of last usage
- **`usageCount`** - Total number of times used
- **`isFavorite`** - User favorite flag

---

## Crosstabs

### Overview

Crosstabs enable multi-dimensional analysis by comparing multiple audiences against various metrics. They provide cross-tabulation capabilities for complex data analysis.

### Crosstab Model

**Database Model:** `Crosstab`

```prisma
model Crosstab {
  id          String   @id @default(cuid())
  orgId       String
  name        String
  description String?
  audiences   String[] // Audience IDs to compare
  metrics     String[] // Metric identifiers
  filters     Json     @default("{}") // Additional filters
  results     Json?    // Cached results
  views       Int      @default(0)
  createdBy   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  organization Organization @relation(...)
}
```

### Crosstab Structure

**Audiences:** Array of audience IDs to compare
- Multiple audiences can be compared side-by-side
- Each audience represents a column in the crosstab

**Metrics:** Array of metric identifiers
- Examples: `["awareness", "consideration", "preference", "nps"]`
- Each metric represents a row in the crosstab

**Filters:** Additional filtering criteria
- Market filters
- Time period filters
- Custom filters

### Result Caching

**Cached Results:** `results` field stores computed crosstab data
- Format: Matrix of audience × metric values
- Cached to improve performance
- Invalidated when underlying data changes

**Result Structure:**
```json
{
  "rows": [
    {
      "metric": "awareness",
      "values": {
        "audience_1": 0.65,
        "audience_2": 0.72,
        "audience_3": 0.58
      }
    }
  ],
  "metadata": {
    "computedAt": "2026-01-15T10:00:00Z",
    "markets": ["US", "UK"]
  }
}
```

### Time-Series Comparisons

Crosstabs support time-series analysis:
- Compare metrics across time periods
- Track trends and changes
- Generate alerts on significant changes

---

## Brand Tracking

### Overview

Brand Tracking provides ongoing brand health monitoring with automated snapshots, competitor analysis, and alert thresholds.

### Brand Tracking Model

**Database Model:** `BrandTracking`

```prisma
model BrandTracking {
  id              String              @id @default(cuid())
  orgId           String
  brandName       String
  description     String?
  industry        String?
  competitors     Json                @default("[]") // Competitor names
  audiences       String[]            // Audience IDs
  metrics         Json                @default("{}") // Metric configs
  trackingConfig  Json                @default("{}") // Advanced settings
  status          BrandTrackingStatus @default(DRAFT)
  schedule        String?             // Cron expression
  alertThresholds Json                @default("{}") // Alert configs
  lastSnapshot    DateTime?
  nextSnapshot    DateTime?
  snapshotCount   Int                 @default(0)
  createdBy       String
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
  
  organization Organization            @relation(...)
  snapshots    BrandTrackingSnapshot[]
}
```

### Brand Metrics

**Tracked Metrics:**
- **Brand Health Score** - Overall health (0-100)
- **Market Share** - Market share percentage
- **Sentiment Score** - Sentiment analysis (-1 to 1)
- **Awareness** - Brand awareness percentage
- **Consideration** - Consideration percentage
- **Preference** - Preference score
- **Loyalty** - Loyalty metrics
- **NPS** - Net Promoter Score

### Competitor Analysis

**Competitors:** Array of competitor brand names
- Tracked alongside primary brand
- Comparative analysis available
- Competitive positioning insights

### Automated Snapshots

**Scheduling:** Cron-based snapshot generation
- Example: `"0 9 * * 1"` - Every Monday at 9 AM
- Automatic snapshot creation
- Historical trend tracking

**Snapshot Model:** `BrandTrackingSnapshot`

```prisma
model BrandTrackingSnapshot {
  id                String   @id @default(cuid())
  brandTrackingId   String
  orgId             String
  snapshotDate      DateTime @default(now())
  metrics           Json     @default("{}")
  brandHealth       Float?
  marketShare       Float?
  sentimentScore    Float?
  awareness         Float?
  consideration     Float?
  preference        Float?
  loyalty           Float?
  nps               Float?
  competitorData    Json     @default("{}")
  audienceBreakdown Json     @default("{}")
  insights          String[] // AI-generated insights
  metadata          Json     @default("{}")
  createdAt         DateTime @default(now())
  
  brandTracking BrandTracking @relation(...)
}
```

### Alert Thresholds

**Alert Configuration:**
```json
{
  "brandHealth": {
    "threshold": 50,
    "direction": "below",
    "severity": "warning"
  },
  "marketShare": {
    "threshold": 0.05,
    "direction": "decrease",
    "severity": "critical"
  }
}
```

**Alert Types:**
- Threshold crossed (above/below)
- Significant change (increase/decrease)
- Anomaly detection

---

## Charts

### Overview

Charts provide flexible data visualization with multiple chart types, custom data sources, and interactive filtering.

### Chart Model

**Database Model:** `Chart`

```prisma
model Chart {
  id          String      @id @default(cuid())
  orgId       String
  name        String
  description String?
  type        ChartType
  dataSource  Json        // Data source configuration
  config      Json        @default("{}") // Chart configuration
  status      ChartStatus @default(DRAFT)
  views       Int         @default(0)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  organization Organization @relation(...)
}
```

### Chart Types

```typescript
enum ChartType {
  BAR        // Bar chart
  LINE       // Line chart
  PIE        // Pie chart
  DONUT      // Donut chart
  AREA       // Area chart
  SCATTER    // Scatter plot
  HEATMAP    // Heatmap
  TREEMAP    // Treemap
  FUNNEL     // Funnel chart
  RADAR      // Radar chart
}
```

### Data Source Configuration

**Data Source Format:**
```json
{
  "type": "agent_run",
  "agentId": "agent_123",
  "metric": "awareness",
  "filters": {
    "market": "US",
    "timeRange": "last_30_days"
  }
}
```

**Data Source Types:**
- `agent_run` - Agent execution results
- `workflow_run` - Workflow execution results
- `crosstab` - Crosstab results
- `brand_tracking` - Brand tracking snapshots
- `audience` - Audience analysis
- `custom` - Custom data query

### Chart Configuration

**Configuration Options:**
- Colors and styling
- Axis labels and formatting
- Legend positioning
- Tooltip configuration
- Animation settings
- Export options

### Dashboard Integration

Charts can be embedded in dashboards:
- Widget-based layout
- Responsive sizing
- Interactive filtering
- Real-time updates

---

## Data Sources

### Overview

Data Sources provide connections to external data systems, enabling integration with various data providers and APIs.

### Data Source Model

**Database Model:** `DataSource`

```prisma
model DataSource {
  id          String           @id @default(cuid())
  orgId       String
  name        String
  type        DataSourceType
  status      DataSourceStatus @default(PENDING)
  config      Json             // Connection configuration
  lastSync    DateTime?
  syncStatus  Json             @default("{}")
  error       String?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  
  organization Organization @relation(...)
}
```

### Data Source Types

```typescript
enum DataSourceType {
  API           // REST API connection
  DATABASE      // Database connection
  FILE_UPLOAD   // File upload
  WEBHOOK       // Webhook receiver
  INTEGRATION   // Third-party integration
}
```

### Connection Configuration

**API Source:**
```json
{
  "url": "https://api.example.com",
  "authType": "bearer",
  "apiKey": "encrypted_key",
  "headers": {},
  "rateLimit": 100
}
```

**Database Source:**
```json
{
  "host": "db.example.com",
  "port": 5432,
  "database": "mydb",
  "username": "user",
  "password": "encrypted_password",
  "ssl": true
}
```

### Sync Status

**Sync Status Tracking:**
- Last sync timestamp
- Sync frequency
- Error tracking
- Record counts
- Sync duration

### GWI Data Source Connections

**GWI-Specific Connections:**

```prisma
model GWIDataSourceConnection {
  id          String   @id @default(cuid())
  orgId       String
  name        String
  type        String   // "spark", "platform", "mcp"
  config      Json     // Connection config
  status      String   @default("pending")
  lastSync    DateTime?
  syncStatus  Json     @default("{}")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  organization Organization @relation(...)
}
```

**GWI Connection Types:**
- **Spark MCP** - Conversational AI queries
- **Spark API** - Quick insights generation
- **Platform API** - Audience and data fetching

---

## Data Export

### Overview

Data Export enables scheduled and on-demand exports of platform data in various formats.

### Export Formats

```typescript
enum ExportFormat {
  CSV      // Comma-separated values
  JSON     // JSON format
  EXCEL    // Excel spreadsheet
  PDF      // PDF document
  PARQUET  // Parquet format
}
```

### Scheduled Exports

**Database Model:** `ScheduledExport`

```prisma
model ScheduledExport {
  id          String        @id @default(cuid())
  orgId       String
  userId      String
  name        String
  description String?
  dataType    String        // "agents", "workflows", "reports", etc.
  filters     Json          @default("{}")
  format      ExportFormat
  schedule    String        // Cron expression
  recipients  String[]      // Email addresses
  isActive    Boolean       @default(true)
  lastRun     DateTime?
  nextRun     DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  organization Organization @relation(...)
  user         User          @relation(...)
  history      ExportHistory[]
}
```

### Export History

**Database Model:** `ExportHistory`

```prisma
model ExportHistory {
  id              String        @id @default(cuid())
  scheduledExportId String
  orgId           String
  status          ExportStatus
  format          ExportFormat
  fileUrl         String?       // Storage URL
  fileSize        Int?          // Bytes
  recordCount     Int?
  startedAt       DateTime
  completedAt     DateTime?
  error           String?
  createdAt       DateTime      @default(now())
  
  scheduledExport ScheduledExport @relation(...)
}
```

### Export Status

```typescript
enum ExportStatus {
  PENDING     // Queued for export
  PROCESSING  // Currently exporting
  COMPLETED   // Successfully completed
  FAILED      // Export failed
  CANCELLED   // Cancelled by user
}
```

### Export Data Types

**Supported Data Types:**
- Agent runs
- Workflow runs
- Reports
- Dashboards
- Audiences
- Crosstabs
- Brand tracking snapshots
- Charts
- Analytics data

### Export Configuration

**Filter Options:**
- Date ranges
- Status filters
- Organization filters
- Custom filters per data type

**Delivery Options:**
- Email delivery
- Storage URL
- Webhook delivery
- Download link

---

## Related Documentation

- [Core Features](./CORE_FEATURES.md) - Agent system and workflows
- [Database Architecture](../architecture/DATABASE_ARCHITECTURE.md) - Database schema
- [API Overview](../api/API_OVERVIEW.md) - API endpoints

---

**Last Updated:** January 2026  
**Maintained By:** Engineering Team
