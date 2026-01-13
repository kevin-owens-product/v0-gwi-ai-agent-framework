# Data Change Tracking & Analysis Evolution Insights

## Executive Summary

This document outlines a comprehensive plan to implement data change tracking, new data detection, and analysis evolution insights for our market research platform. The goal is to provide clients with clear visibility into how their data and analyses have changed over time, enabling better decision-making and trend identification.

---

## 1. Client Requirements Analysis

### What Clients Are Asking For

1. **What Data Has Changed**
   - See differences between current and previous data states
   - Understand which metrics have moved significantly
   - Track changes in audience definitions and sizes

2. **What Data Is New**
   - Identify newly available data points
   - Highlight new audience segments discovered
   - Surface new market opportunities

3. **How Past Analysis Has Changed**
   - Compare historical analyses with current results
   - Understand trend reversals and continuations
   - Track how AI-generated insights have evolved

---

## 2. Current State Assessment

### Existing Infrastructure

| Component | Current Capability | Gap |
|-----------|-------------------|-----|
| **AuditLog** | Records who/what/when | No before/after snapshots |
| **BrandTrackingSnapshot** | Time-series metrics | Good foundation, needs expansion |
| **ToolMemory** | Caches execution results | Session-bound, no long-term history |
| **Insight** | Stores AI insights | No version comparison |
| **Audience** | Definition storage | No change history |
| **Crosstab** | Cached results | No historical comparison |

### Key Files Reference
- `lib/audit.ts` - Event logging foundation
- `lib/tool-memory.ts` - Execution caching
- `prisma/schema.prisma` - Data models (1073 lines)

---

## 3. Proposed Solution Architecture

### 3.1 Data Versioning Layer

#### New Database Models

```prisma
// Entity Version Tracking
model EntityVersion {
  id            String    @id @default(cuid())
  orgId         String
  entityType    String    // 'audience' | 'crosstab' | 'insight' | 'chart'
  entityId      String
  version       Int
  data          Json      // Full entity snapshot
  delta         Json?     // Changes from previous version
  changedFields String[]  // List of changed field names
  changeType    ChangeType
  createdBy     String?
  createdAt     DateTime  @default(now())

  @@index([orgId, entityType, entityId])
  @@index([entityId, version])
}

enum ChangeType {
  CREATE
  UPDATE
  DELETE
  REGENERATE  // For AI-generated content
}

// Analysis Evolution Tracking
model AnalysisHistory {
  id              String    @id @default(cuid())
  orgId           String
  analysisType    String    // 'crosstab' | 'audience_insight' | 'brand_health'
  referenceId     String    // ID of the analyzed entity
  analysisVersion Int
  results         Json      // Full analysis results
  aiInsights      String[]  // AI-generated insights at this point
  keyMetrics      Json      // Important metrics for comparison
  dataSourceDate  DateTime  // When underlying data was collected
  createdAt       DateTime  @default(now())

  @@index([orgId, analysisType, referenceId])
  @@index([referenceId, analysisVersion])
}

// Change Summary for Dashboard Display
model ChangeSummary {
  id              String    @id @default(cuid())
  orgId           String
  period          String    // 'daily' | 'weekly' | 'monthly'
  periodStart     DateTime
  periodEnd       DateTime
  summaryType     String    // 'overview' | 'audiences' | 'insights' | 'brand'
  metrics         Json      // Aggregated change metrics
  highlights      Json      // Notable changes for display
  newItems        Int       @default(0)
  updatedItems    Int       @default(0)
  significantChanges Int    @default(0)
  createdAt       DateTime  @default(now())

  @@index([orgId, period, summaryType])
  @@index([periodStart, periodEnd])
}
```

### 3.2 Core Services

#### Change Detection Service (`lib/change-tracking.ts`)

```typescript
interface ChangeDetectionConfig {
  significanceThreshold: number  // % change to flag as significant
  trackFields: string[]          // Fields to monitor
  ignoreFields: string[]         // Fields to skip (timestamps, etc.)
}

class ChangeTrackingService {
  // Capture entity snapshot before/after changes
  async captureVersion(entityType, entityId, data, userId)

  // Detect changes between versions
  async detectChanges(entityType, entityId, oldData, newData)

  // Get version history for an entity
  async getVersionHistory(entityType, entityId, options)

  // Compare two specific versions
  async compareVersions(entityType, entityId, v1, v2)

  // Generate change summary for a period
  async generateChangeSummary(orgId, period, startDate, endDate)

  // Get new items since last visit
  async getNewItemsSince(orgId, lastVisit, entityTypes)
}
```

#### Analysis Evolution Service (`lib/analysis-evolution.ts`)

```typescript
class AnalysisEvolutionService {
  // Track analysis results over time
  async trackAnalysis(analysisType, referenceId, results, dataSourceDate)

  // Compare current vs previous analysis
  async compareWithPrevious(analysisType, referenceId)

  // Get trend data for an analysis
  async getAnalysisTrend(analysisType, referenceId, periods)

  // Detect significant trend changes
  async detectTrendShifts(analysisType, referenceId, threshold)

  // Generate AI summary of evolution
  async generateEvolutionInsights(analysisType, referenceId)
}
```

### 3.3 Change Detection Algorithms

#### Significance Detection

```typescript
interface SignificanceConfig {
  absolute: {
    min: number      // Minimum absolute change
  }
  relative: {
    threshold: number // % change threshold (e.g., 5%)
  }
  statistical: {
    stdDevMultiplier: number // Flag if change > N std deviations
  }
}

// Example thresholds by metric type
const SIGNIFICANCE_THRESHOLDS = {
  audience_size: { relative: 0.10 },      // 10% change
  brand_health: { absolute: 5 },          // 5 point change
  market_share: { relative: 0.05 },       // 5% change
  nps: { absolute: 10 },                  // 10 point change
  sentiment: { absolute: 0.1 },           // 0.1 change (-1 to 1 scale)
}
```

---

## 4. User Interface Components

### 4.1 Change Timeline View

A chronological view of all changes to data and analyses.

```
+------------------------------------------------------------------+
| CHANGE TIMELINE                                          [Filter] |
+------------------------------------------------------------------+
| TODAY                                                             |
| +--------------------------------------------------------------+ |
| | 10:45 AM  Audience "Tech Enthusiasts" size changed           | |
| |           +15.2% (45,230 -> 52,105)                          | |
| |           [View Details] [Compare]                           | |
| +--------------------------------------------------------------+ |
| | 09:30 AM  NEW: Insight generated for Q4 Brand Analysis       | |
| |           "Brand awareness up 12% in 18-24 demographic"      | |
| |           [View Insight]                                     | |
| +--------------------------------------------------------------+ |
| YESTERDAY                                                         |
| +--------------------------------------------------------------+ |
| | 3:15 PM   Brand Health Score changed -3.2 points             | |
| |           (78.5 -> 75.3) - SIGNIFICANT                       | |
| |           [View Trend] [Investigate]                         | |
| +--------------------------------------------------------------+ |
```

### 4.2 Before/After Comparison View

Side-by-side comparison of data states.

```
+------------------------------------------------------------------+
| COMPARE: Audience "Millennials" - v3 vs v5                        |
+------------------------------------------------------------------+
|                    VERSION 3           VERSION 5                  |
|                    (Jan 15)            (Jan 22)                   |
+------------------------------------------------------------------+
| Size              42,500               48,200  (+13.4%)           |
| Markets           US, UK               US, UK, DE  (+1)           |
| Age 18-24         32%                  35%     (+3pp)             |
| Age 25-34         68%                  65%     (-3pp)             |
+------------------------------------------------------------------+
| CRITERIA CHANGES                                                  |
| + Added: "Streaming service subscriber"                           |
| ~ Modified: Income range $50k-$100k -> $45k-$100k                 |
+------------------------------------------------------------------+
```

### 4.3 New Data Highlights Dashboard Widget

```
+------------------------------------------------------------------+
| WHAT'S NEW THIS WEEK                                              |
+------------------------------------------------------------------+
| +-- AUDIENCES (3 new) ----------------------------------------+ |
| |  - Gen Z Gamers (created Mon)                               | |
| |  - Luxury Shoppers 2024 (created Tue)                       | |
| |  - Health-Conscious Parents (created Thu)                   | |
| +------------------------------------------------------------+ |
|                                                                   |
| +-- INSIGHTS (12 new) ----------------------------------------+ |
| |  Brand Performance: 5 new insights                          | |
| |  Market Trends: 4 new insights                              | |
| |  Competitor Analysis: 3 new insights                        | |
| +------------------------------------------------------------+ |
|                                                                   |
| +-- DATA UPDATES (2) -----------------------------------------+ |
| |  GWI Q4 2024 data now available                             | |
| |  Social media metrics updated (Jan 20)                      | |
| +------------------------------------------------------------+ |
```

### 4.4 Analysis Evolution Chart

Trend visualization showing how analyses have changed over time.

```
+------------------------------------------------------------------+
| BRAND HEALTH TREND - "TechCorp"                                   |
+------------------------------------------------------------------+
|                                                                    |
|  85 |                                    *                        |
|     |                               *         *                   |
|  80 |          *    *    *    *                    *    *        |
|     |     *                                                  *    |
|  75 |*                                                            |
|     |                                                             |
|  70 +----+----+----+----+----+----+----+----+----+----+----+     |
|      Oct  Nov  Dec  Jan  Feb  Mar  Apr  May  Jun  Jul  Aug       |
|                                                                    |
| Key Insight: Brand health improved 12% following Q2 campaign      |
| Previous Insight (Jun): "Declining trend expected to continue"    |
| INSIGHT CHANGED: Analysis now shows recovery pattern              |
+------------------------------------------------------------------+
```

### 4.5 Change Notification Panel

Real-time alerts for significant changes.

```
+------------------------------------------------------------------+
| CHANGE ALERTS                                         [Settings]  |
+------------------------------------------------------------------+
| ! SIGNIFICANT: Brand health dropped below threshold (< 75)        |
|   TechCorp: 75.3 -> 73.8 (-1.5 points)                           |
|   [Investigate] [Dismiss]                                         |
+------------------------------------------------------------------+
| i DATA UPDATE: Q4 2024 survey data now reflects 15,000 new       |
|   respondents in US market                                        |
|   [Review Impact] [Dismiss]                                       |
+------------------------------------------------------------------+
| + NEW AUDIENCE: "Sustainable Shoppers" auto-created from         |
|   trending topic analysis                                         |
|   [View] [Dismiss]                                                |
+------------------------------------------------------------------+
```

---

## 5. Implementation Phases

### Phase 1: Foundation (4-6 weeks)

**Goal:** Establish core versioning infrastructure

**Tasks:**
1. Create new Prisma models for EntityVersion and AnalysisHistory
2. Implement ChangeTrackingService with basic versioning
3. Add version capture hooks to key entity CRUD operations
4. Build change detection algorithms
5. Create API endpoints for version history

**Deliverables:**
- Database migrations deployed
- Core services operational
- API endpoints for version retrieval

**Key Files to Create/Modify:**
- `prisma/schema.prisma` - Add new models
- `lib/change-tracking.ts` - New service
- `app/api/v1/versions/[type]/[id]/route.ts` - Version API
- `app/api/v1/changes/route.ts` - Changes feed API

### Phase 2: Change Detection & Notifications (3-4 weeks)

**Goal:** Intelligent change detection with user notifications

**Tasks:**
1. Implement significance threshold algorithms
2. Build change summary generation for periods
3. Create notification system for significant changes
4. Add user preferences for alert thresholds
5. Implement "What's New" since last visit tracking

**Deliverables:**
- Smart change detection operational
- Notification system integrated
- User preference management

**Key Files to Create/Modify:**
- `lib/analysis-evolution.ts` - New service
- `lib/change-notifications.ts` - Notification logic
- `app/api/v1/notifications/changes/route.ts` - Notification API
- `hooks/useChangeNotifications.ts` - Client hook

### Phase 3: UI Components (4-5 weeks)

**Goal:** Rich UI for viewing and comparing changes

**Tasks:**
1. Build Change Timeline component
2. Create Before/After comparison views
3. Implement "What's New" dashboard widget
4. Design Analysis Evolution charts
5. Add change highlighting to existing views
6. Create comparison modals/pages

**Deliverables:**
- Timeline view component
- Comparison interface
- Dashboard widgets
- Analysis trend visualizations

**Key Files to Create:**
- `components/change-tracking/ChangeTimeline.tsx`
- `components/change-tracking/ComparisonView.tsx`
- `components/change-tracking/WhatsNewWidget.tsx`
- `components/change-tracking/EvolutionChart.tsx`
- `components/change-tracking/ChangeHighlight.tsx`

### Phase 4: Analysis Evolution & AI Insights (3-4 weeks)

**Goal:** Track and explain how AI-generated analyses have evolved

**Tasks:**
1. Implement analysis history tracking for all insight types
2. Build AI-powered explanation of changes ("Why did this change?")
3. Create trend shift detection for analyses
4. Add insight evolution narratives
5. Implement "analysis confidence over time" metrics

**Deliverables:**
- Analysis evolution tracking
- AI-generated change explanations
- Trend shift alerts
- Confidence tracking

**Key Files to Create/Modify:**
- `lib/insight-evolution.ts` - Insight tracking
- `lib/llm.ts` - Add change explanation prompts
- `app/api/v1/insights/[id]/evolution/route.ts` - Evolution API

### Phase 5: Advanced Features (4-5 weeks)

**Goal:** Power user features and integrations

**Tasks:**
1. Build data lineage visualization (what influenced changes)
2. Implement comparative analytics across time periods
3. Add export functionality for change reports
4. Create scheduled change summary emails
5. Build API webhooks for external integrations
6. Add change annotation/commenting system

**Deliverables:**
- Data lineage views
- Export capabilities
- Email summaries
- Webhook integrations
- Annotation system

---

## 6. Technical Architecture Diagram

```
+------------------------------------------------------------------+
|                         CLIENT LAYER                              |
+------------------------------------------------------------------+
|  Dashboard  |  Timeline  |  Comparison  |  Notifications  |  API |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                       API LAYER (Next.js)                         |
+------------------------------------------------------------------+
|  /api/v1/versions/*  |  /api/v1/changes/*  |  /api/v1/evolution/* |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                       SERVICE LAYER                               |
+------------------------------------------------------------------+
| ChangeTracking | AnalysisEvolution | ChangeNotification | Insight |
|    Service     |      Service      |      Service       | Evolu   |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                       DATA LAYER (Prisma)                         |
+------------------------------------------------------------------+
| EntityVersion | AnalysisHistory | ChangeSummary | AuditLog       |
| (NEW)         | (NEW)           | (NEW)         | (EXISTING)     |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                    POSTGRESQL DATABASE                            |
+------------------------------------------------------------------+
```

---

## 7. Data Model Relationships

```
EntityVersion
    |
    +-- orgId --> Organization
    |
    +-- entityType + entityId --> Audience | Crosstab | Chart | Insight
    |
    +-- createdBy --> User

AnalysisHistory
    |
    +-- orgId --> Organization
    |
    +-- referenceId --> Crosstab | BrandTracking | Audience
    |
    +-- Captures point-in-time analysis results

ChangeSummary
    |
    +-- orgId --> Organization
    |
    +-- Aggregates changes by period (daily/weekly/monthly)
    |
    +-- Used for "What's New" and change digest emails
```

---

## 8. API Endpoints Design

### Version History

```
GET /api/v1/versions/{entityType}/{entityId}
  Query params: ?limit=10&before=<date>&after=<date>
  Response: { versions: [...], total: number }

GET /api/v1/versions/{entityType}/{entityId}/compare
  Query params: ?v1=3&v2=5
  Response: { before: {...}, after: {...}, delta: {...} }
```

### Changes Feed

```
GET /api/v1/changes
  Query params: ?period=week&type=significant&entityTypes=audience,insight
  Response: { changes: [...], newItems: [...], summary: {...} }

GET /api/v1/changes/since
  Query params: ?timestamp=<iso-date>
  Response: { changes: [...], newCount: number }
```

### Analysis Evolution

```
GET /api/v1/evolution/{analysisType}/{referenceId}
  Query params: ?periods=12
  Response: { history: [...], trend: {...}, insights: [...] }

GET /api/v1/evolution/{analysisType}/{referenceId}/explain
  Response: { explanation: string, factors: [...] }
```

### Change Summaries

```
GET /api/v1/summaries
  Query params: ?period=weekly&type=overview
  Response: { summaries: [...] }

POST /api/v1/summaries/generate
  Body: { period: 'weekly', startDate: '...', endDate: '...' }
  Response: { summary: {...} }
```

---

## 9. User Experience Flows

### Flow 1: Discovering What's Changed

```
User opens dashboard
    |
    v
System checks last visit timestamp
    |
    v
"What's New" badge shows count of changes
    |
    v
User clicks badge
    |
    v
Change summary panel opens showing:
- New items created since last visit
- Significant changes to existing data
- Analysis insights that have evolved
    |
    v
User can drill into any item for details
```

### Flow 2: Investigating a Specific Change

```
User sees "Audience size changed +15%"
    |
    v
Clicks "View Details"
    |
    v
Opens comparison view showing:
- Before/after values side by side
- Highlighted changes
- Contributing factors
    |
    v
User can:
- View full version history
- See related changes
- Add annotation/note
- Export comparison
```

### Flow 3: Tracking Analysis Evolution

```
User views brand health dashboard
    |
    v
Sees "View History" button on insight card
    |
    v
Opens evolution view showing:
- Timeline of how insight changed
- Original vs current analysis
- AI explanation of why it changed
    |
    v
User gains confidence in current analysis
by understanding its evolution
```

---

## 10. Integration Points

### Existing Systems to Integrate

| System | Integration Type | Purpose |
|--------|-----------------|---------|
| AuditLog | Extend | Add version capture triggers |
| BrandTrackingSnapshot | Extend | Comparison views |
| ToolMemory | Extend | Track tool result changes |
| Client Tracking | Extend | Track "last visit" per user |
| Notification System | Integrate | Deliver change alerts |

### New Integration Hooks

```typescript
// Add to entity creation/update flows
import { changeTracker } from '@/lib/change-tracking'

// In audience update handler
const previousData = await getAudience(id)
await updateAudience(id, newData)
await changeTracker.captureVersion('audience', id, {
  before: previousData,
  after: newData
}, userId)
```

---

## 11. Performance Considerations

### Data Volume Projections

| Entity Type | Estimated Versions/Month | Storage Impact |
|-------------|-------------------------|----------------|
| Audiences | 500 | ~5MB |
| Crosstabs | 2,000 | ~50MB |
| Insights | 10,000 | ~100MB |
| Charts | 1,000 | ~10MB |

**Total estimated additional storage:** ~165MB/month per organization

### Optimization Strategies

1. **Pruning Policy**
   - Keep full history for 90 days
   - After 90 days, keep only significant changes
   - After 1 year, archive to cold storage

2. **Delta Storage**
   - Store full snapshot only on creation
   - Store deltas for subsequent versions
   - Rebuild full state on-demand

3. **Indexed Queries**
   - Compound indexes on (orgId, entityType, entityId)
   - Time-based partitioning for large tables
   - Materialized views for common queries

4. **Caching**
   - Cache recent version comparisons
   - Pre-compute daily change summaries
   - Cache "What's New" counts per user

---

## 12. Security & Compliance

### Access Control

```typescript
// Version access inherits from entity permissions
const canViewHistory = await hasPermission(
  userId,
  orgId,
  `${entityType}:read`
)

// Change summaries require dashboard access
const canViewSummary = await hasPermission(
  userId,
  orgId,
  'dashboard:read'
)
```

### Audit Requirements

- All version access logged to AuditLog
- Comparison views create audit entries
- Export of change data requires elevated permissions
- GDPR: Version data included in data export/deletion

### Data Retention

```typescript
const RETENTION_POLICY = {
  full_history_days: 90,
  significant_changes_days: 365,
  archive_after_days: 730,  // 2 years
  deletion_after_days: 1095 // 3 years
}
```

---

## 13. Success Metrics

### Key Performance Indicators

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to find changes | < 30 seconds | User tracking |
| Change comparison usage | > 20% of users weekly | Event tracking |
| "What's New" engagement | > 50% click-through | Event tracking |
| User satisfaction with change visibility | > 4.0/5.0 | Surveys |
| Support tickets about data changes | -50% | Ticket analysis |

### User Engagement Metrics

- Daily active users viewing change timeline
- Average time spent on comparison views
- "What's New" widget interaction rate
- Change notification click-through rate
- Analysis evolution view engagement

---

## 14. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Storage growth exceeds projections | Medium | Medium | Implement aggressive pruning early |
| Performance degradation with history | Medium | High | Pre-compute summaries, use caching |
| User confusion with versions | Low | Medium | Clear UX, tutorials, tooltips |
| Integration complexity | Medium | Medium | Phased rollout, feature flags |
| Data consistency issues | Low | High | Transaction wrapping, validation |

---

## 15. Future Enhancements (Post-MVP)

### Potential Phase 6+ Features

1. **Predictive Analytics**
   - Predict likely future changes based on trends
   - Alert before significant shifts occur

2. **Collaborative Annotations**
   - Team members can annotate changes
   - Discussion threads on significant changes

3. **External Data Correlation**
   - Link changes to external events (news, campaigns)
   - "This change may be related to..."

4. **Custom Alerts**
   - User-defined thresholds per metric
   - Scheduled change digest emails

5. **API for External Tools**
   - Webhook notifications for changes
   - Real-time streaming of changes

6. **Machine Learning**
   - Anomaly detection in change patterns
   - Auto-categorization of change types

---

## 16. Conclusion

This plan provides a comprehensive roadmap for implementing data change tracking that addresses the three core client needs:

1. **What Data Has Changed** - Through versioning, comparison views, and change detection
2. **What Data Is New** - Through "What's New" widgets, creation tracking, and notifications
3. **How Analysis Has Evolved** - Through analysis history, trend visualization, and AI explanations

The phased approach allows for incremental value delivery while building toward a complete solution. The architecture leverages existing infrastructure (AuditLog, BrandTrackingSnapshot) while adding new capabilities in a modular way.

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Entity Version** | A point-in-time snapshot of an entity's state |
| **Delta** | The difference between two versions |
| **Significant Change** | A change that exceeds configured thresholds |
| **Analysis Evolution** | How AI-generated insights have changed over time |
| **Change Summary** | Aggregated view of changes over a period |

## Appendix B: Related Documents

- `lib/audit.ts` - Current audit implementation
- `lib/tool-memory.ts` - Tool execution caching
- `prisma/schema.prisma` - Current data models
- `lib/client-tracking.ts` - Client-side event tracking

---

*Document Version: 1.0*
*Created: January 2026*
*Author: Claude (AI Research Assistant)*
