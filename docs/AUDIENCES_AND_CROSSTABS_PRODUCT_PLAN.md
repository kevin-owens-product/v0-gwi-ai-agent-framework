# Audiences & Cross-Tabs Product Plan

## Executive Summary

This document outlines a comprehensive product strategy to transform the Audiences and Cross-Tabs features into world-class products that users will love. Based on thorough research of the current implementation, industry best practices, and user needs, we present a vision for creating intuitive, powerful, and delightful experiences for consumer insights professionals.

---

## Current State Analysis

### What We Have Today

#### Audiences Feature
- **CRUD Operations**: Full create, read, update, delete functionality
- **List View**: Card-based grid with statistics, tabs (All/Recent/Favorites), search
- **Detail View**: Demographics, behaviors, interests display with export/share actions
- **Creation Flow**: Basic form with AI query builder UI (not connected), manual attribute builder
- **Data Model**: Name, description, criteria (JSON), size, markets, favorites, usage tracking
- **API Integration**: Connected to GWI Platform API for external audience creation

#### Cross-Tabs Feature
- **CRUD Operations**: Full create, read, update, delete functionality
- **List View**: Card grid with statistics, search, tabs
- **Detail View**: Interactive data table with color-coded values, export (JSON/CSV)
- **Creation Flow**: Audience selection + metric selection with summary sidebar
- **Data Model**: Name, audiences array, metrics array, filters, cached results
- **10 Pre-built Examples**: Rich demo data showing various analysis types

### Strengths
1. Solid technical foundation (Next.js 16, Prisma, TypeScript)
2. Clean UI components using Radix UI and Tailwind
3. Good data model structure with organizational multi-tenancy
4. Role-based access control already implemented
5. Comprehensive chart rendering capability (Recharts)
6. Integration points with playground, charts, and dashboards

### Gaps & Opportunities
1. **AI Query Builder**: UI exists but backend not connected
2. **Real-time Size Estimation**: Static placeholder, not dynamic
3. **Visualization**: Cross-tab "Visualize" button not functional
4. **Collaboration**: No real-time collaboration or commenting
5. **Templates**: Limited starter templates for common use cases
6. **Insights Generation**: No automated insight detection
7. **Historical Tracking**: No trend/change tracking over time

---

## Product Vision

### Audiences Vision
**"Empower researchers to discover and define any audience segment in seconds using natural language, with real-time validation and instant access to actionable insights."**

### Cross-Tabs Vision
**"Transform complex audience comparisons into clear, visual stories that drive confident decision-making."**

---

## User Personas & Jobs-to-Be-Done

### Primary Personas

#### 1. Sarah - Research Analyst
- **Goal**: Quickly build audience definitions for client projects
- **Pain Points**: Manual audience building is time-consuming; hard to validate segment sizes
- **Jobs-to-Be-Done**:
  - Define an audience from a client brief in < 5 minutes
  - Validate that the audience size is adequate for research
  - Export audience definitions for use in surveys/campaigns

#### 2. Marcus - Strategy Director
- **Goal**: Compare consumer segments to inform strategic recommendations
- **Pain Points**: Cross-tab analysis requires multiple tools; hard to visualize patterns
- **Jobs-to-Be-Done**:
  - Compare 4-6 audience segments across key metrics
  - Identify the biggest differentiators between segments
  - Create compelling visualizations for client presentations

#### 3. Emily - Brand Manager
- **Goal**: Understand target audience deeply for campaign planning
- **Pain Points**: Audience profiles are static; no dynamic exploration
- **Jobs-to-Be-Done**:
  - Explore audience attitudes, behaviors, and media habits
  - Discover new audience opportunities
  - Track how target audiences evolve over time

---

## Feature Roadmap

## Phase 1: Foundation & Quick Wins (Priority: High)

### 1.1 AI-Powered Audience Builder
**Transform natural language into audience definitions instantly.**

Implementation:
- Connect existing AI query input to LLM backend
- Parse natural language into structured audience criteria
- Show real-time attribute suggestions as user types
- Display confidence scores for AI-generated attributes

Example Flow:
```
User types: "Millennials who care about sustainability and shop online"

AI generates:
- Age: 27-42 (Millennials) [95% confidence]
- Values: Sustainability-focused [88% confidence]
- Shopping: Online shoppers [92% confidence]
- Estimated Reach: 2.4M consumers
```

### 1.2 Real-Time Audience Size Estimation
**Show estimated audience sizes that update as criteria change.**

Implementation:
- API endpoint that calculates approximate audience size from criteria
- Debounced updates as user modifies attributes
- Visual feedback (progress ring, size animation)
- Market breakdown (size per selected market)

### 1.3 Cross-Tab Visualization
**Make the "Visualize" button functional with multiple chart options.**

Implementation:
- Modal with chart type selector (bar, heatmap, radar, grouped bar)
- One-click chart generation from any cross-tab
- Ability to save visualizations to charts collection
- Export as image (PNG/SVG) or add to dashboard

Chart Types to Support:
- Grouped/stacked bar charts (default for comparisons)
- Heatmaps (for many metrics x many audiences)
- Radar charts (for profile comparisons)
- Diverging bar charts (for +/- differences from baseline)

### 1.4 Enhanced Data Table
**Make cross-tab tables more interactive and insightful.**

Implementation:
- Sortable columns (click header to sort)
- Index/highlight options (% difference from base, statistical significance)
- Row/column hover highlighting
- Conditional formatting customization
- Inline mini-charts (sparklines in cells)

---

## Phase 2: Intelligence & Insights (Priority: High)

### 2.1 Automated Insights Detection
**Surface key findings automatically from any cross-tab or audience.**

Implementation:
- Algorithm to detect significant patterns:
  - Highest/lowest values in each column/row
  - Biggest differences between segments
  - Unexpected correlations
  - Outliers (values 2+ std dev from mean)
- "Key Insights" panel showing top 3-5 findings
- Natural language summaries: "Gen Z is 3x more likely to use TikTok than Boomers"

### 2.2 Audience Comparison Mode
**Quick side-by-side audience comparison from audience detail page.**

Implementation:
- "Compare with..." button on audience detail page
- Split-screen view showing two audiences
- Auto-generated comparison highlighting differences
- One-click "Create Cross-tab" from comparison

### 2.3 Lookalike Audience Generation
**Generate similar audiences based on defining characteristics.**

Implementation:
- Analyze key characteristics of source audience
- Find similar consumers who don't match current criteria
- Show overlap percentage and unique differentiators
- Adjust lookalike threshold (1%-10% similarity)

### 2.4 Smart Templates
**Pre-built audience and cross-tab templates for common use cases.**

Audience Templates:
- Generational segments (Gen Z, Millennials, Gen X, Boomers)
- Income segments (Low, Middle, High, Ultra-High)
- Life stage segments (Students, Young Professionals, Parents, Empty Nesters)
- Behavioral segments (Early Adopters, Mainstream, Laggards)
- Value-based segments (Eco-conscious, Price-sensitive, Quality-focused)

Cross-Tab Templates:
- Social Media Platform Analysis
- Purchase Channel Preferences
- Brand Health Funnel
- Media Consumption by Daypart
- Sustainability Attitudes
- Geographic Market Comparison

---

## Phase 3: Collaboration & Workflow (Priority: Medium)

### 3.1 Audience Versioning & History
**Track changes to audiences over time.**

Implementation:
- Version history for each audience
- Compare versions side-by-side
- Restore previous versions
- Audit log of who changed what, when

### 3.2 Comments & Annotations
**Enable team discussion on audiences and cross-tabs.**

Implementation:
- Comment threads on audiences and cross-tabs
- @mention team members
- Pin comments to specific data points in cross-tabs
- Activity feed showing recent comments

### 3.3 Folders & Organization
**Better organization for large audience/cross-tab libraries.**

Implementation:
- Folder hierarchy for audiences and cross-tabs
- Bulk actions (move, tag, delete, export)
- Custom tags/labels
- Advanced search with filters

### 3.4 Workflow Status
**Track audience/cross-tab through research workflow.**

Implementation:
- Status labels: Draft, In Review, Approved, Archived
- Approval workflow with reviewers
- Due dates and reminders
- Integration with project management (optional)

---

## Phase 4: Advanced Analytics (Priority: Medium)

### 4.1 Trend Tracking
**See how audiences and metrics change over time.**

Implementation:
- Historical data storage for key metrics
- Time-series visualization of audience metrics
- Change alerts (notify when significant shifts occur)
- Comparative periods (This quarter vs. last quarter)

### 4.2 Statistical Significance
**Help users understand confidence in their findings.**

Implementation:
- Significance testing for cross-tab comparisons
- Confidence intervals on percentages
- Sample size indicators
- Visual cues for statistically significant differences

### 4.3 Audience Overlap Analysis
**Understand how audiences intersect.**

Implementation:
- Venn diagram visualization
- Mutual exclusivity analysis
- "Unique to audience A" vs "Shared" vs "Unique to B"
- Recommendation for combined audiences

### 4.4 Predictive Audiences
**Create audiences based on predicted behaviors.**

Implementation:
- "Likely to..." audience builder
- Probability scoring (High/Medium/Low likelihood)
- Validation against historical data
- Confidence intervals

---

## Phase 5: Enterprise & Scale (Priority: Lower)

### 5.1 Audience Library Marketplace
**Share and discover audiences across the organization.**

Implementation:
- Published vs. private audiences
- Audience ratings and usage stats
- "Featured" audiences curated by admins
- Category browsing

### 5.2 API Access
**Enable programmatic audience and cross-tab access.**

Implementation:
- RESTful API with full CRUD
- Bulk operations support
- Webhook notifications
- SDK for common languages

### 5.3 Advanced Permissions
**Granular access control for enterprise needs.**

Implementation:
- Audience-level permissions
- View-only sharing
- External user access (limited)
- Audit compliance features

---

## UI/UX Improvements

### Audience Detail Page Enhancements

```
+------------------------------------------------------------------+
|  [<] Eco-Conscious Millennials                    [Explore] [Edit]|
|  Sustainability-focused consumers aged 25-40...        [Share v]  |
+------------------------------------------------------------------+
|                                                                   |
|  [Key Insights]                    | [Summary]                    |
|  - 3x more likely to pay premium   | Size: 1.2M                  |
|  - 89% research brand ethics       | Markets: US, UK, DE         |
|  - High social media engagement    | Created: 2 days ago         |
|                                                                   |
+------------------------------------------------------------------+
|                                                                   |
|  [Demographics]  [Behaviors]  [Interests]  [Media]  [Brands]     |
|  +----------------------------------------------------------+    |
|  |                                                          |    |
|  |  Visual card/chart showing selected tab data             |    |
|  |                                                          |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  [Quick Actions]                                                  |
|  [Compare]  [Create Lookalike]  [Add to Cross-tab]  [Export]     |
+------------------------------------------------------------------+
```

### Cross-Tab Detail Page Enhancements

```
+------------------------------------------------------------------+
|  [<] Generational Social Media Analysis           [Visualize v]   |
|  Comparing Gen Z, Millennials, Gen X, Boomers       [Export v]    |
+------------------------------------------------------------------+
|                                                                   |
|  [Key Insights]                                                   |
|  ! Gen Z leads TikTok adoption at 87% (3x Boomers)               |
|  ! YouTube is the most universal platform (62-91%)               |
|  ! LinkedIn peaks with Millennials (52%)                         |
|                                                                   |
+------------------------------------------------------------------+
|  [Table View]  [Chart View]  [Heatmap View]                      |
|  +----------------------------------------------------------+    |
|  |          | Gen Z | Mill. | Gen X | Boom. | Diff    |     |    |
|  |----------|-------|-------|-------|-------|---------|     |    |
|  | TikTok   |  87%  |  52%  |  24%  |   8%  | +79 pts |     |    |
|  | Instagram|  82%  |  71%  |  48%  |  28%  | +54 pts |     |    |
|  | Facebook |  42%  |  68%  |  78%  |  72%  | -30 pts |     |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Legend: [>70% highlighted] [<30% muted] [Significant *]         |
+------------------------------------------------------------------+
```

### New Audience Builder Flow

```
Step 1: Start with Intent
+------------------------------------------------------------------+
|  How would you like to build your audience?                       |
|                                                                   |
|  [Describe in Natural Language]  - "I want people who..."        |
|  [Start from Template]           - Browse common segments         |
|  [Build Manually]                - Add attributes one by one      |
|  [Clone Existing]                - Copy and modify                |
+------------------------------------------------------------------+

Step 2: Refine & Validate (AI Path)
+------------------------------------------------------------------+
|  "Young urban professionals interested in sustainable fashion"   |
|                                                                   |
|  Generated Criteria:                          Estimated Size      |
|  +--------------------------------+          +----------------+   |
|  | Age: 25-35          [x] [Edit]|          |    1.8M        |   |
|  | Location: Urban     [x] [Edit]|          |   consumers    |   |
|  | Occupation: Prof.   [x] [Edit]|          |                |   |
|  | Interest: Sustain.  [x] [Edit]|          | [View by Market]|  |
|  | Interest: Fashion   [x] [Edit]|          +----------------+   |
|  +--------------------------------+                               |
|                                                                   |
|  [+ Add more criteria]          [Refine with AI]  [Save Audience]|
+------------------------------------------------------------------+
```

---

## Technical Implementation Notes

### Backend Priorities

1. **AI Integration Service**
   - Create `/api/v1/audiences/parse` endpoint for NLP parsing
   - Integrate with LLM (OpenAI/Anthropic) for natural language processing
   - Build criteria schema validator

2. **Size Estimation Service**
   - Create `/api/v1/audiences/estimate` endpoint
   - Cache estimation results with TTL
   - Support incremental estimation (add/remove criterion)

3. **Insights Engine**
   - Create `/api/v1/crosstabs/[id]/insights` endpoint
   - Implement pattern detection algorithms
   - Generate natural language summaries

4. **Visualization API**
   - Enhance `/api/v1/crosstabs/[id]/chart` endpoint
   - Support multiple chart type transformations
   - Return Recharts-compatible data structures

### Frontend Priorities

1. **AI Query Component**
   - Real-time suggestions as user types
   - Streaming response display
   - Confidence indicator UI

2. **Interactive Data Table**
   - Virtual scrolling for large datasets
   - Sortable/filterable columns
   - Cell-level interactions

3. **Visualization Modal**
   - Chart type picker with previews
   - Customization options panel
   - Export controls

4. **Insights Panel**
   - Auto-expanding insight cards
   - "Explain this" interaction
   - Copy/share insights

---

## Success Metrics

### Engagement Metrics
| Metric | Current | Target (6 months) |
|--------|---------|-------------------|
| Audiences created per user/month | TBD | 10+ |
| Cross-tabs created per user/month | TBD | 15+ |
| Average session time | TBD | 20+ minutes |
| Feature adoption (AI builder) | 0% | 60%+ |
| Export usage | TBD | 40% of views |

### Quality Metrics
| Metric | Current | Target |
|--------|---------|--------|
| Audience creation time | ~10 min | < 2 min |
| Time to first insight | ~15 min | < 1 min |
| User satisfaction (NPS) | TBD | 50+ |
| Support tickets (feature) | TBD | < 5/week |

### Business Metrics
| Metric | Target |
|--------|--------|
| Feature stickiness (7-day return) | 70%+ |
| Premium feature conversion | 25%+ |
| API usage growth | 20% MoM |

---

## Competitive Differentiation

### vs. Traditional Survey Platforms
- **Our Edge**: AI-powered natural language building, instant insights, modern UX
- **Their Strength**: Deeper survey methodology, established trust

### vs. DMP/CDP Platforms
- **Our Edge**: Consumer insights focus, behavioral/attitudinal data, visualization
- **Their Strength**: Real-time activation, 1st-party data integration

### vs. Business Intelligence Tools
- **Our Edge**: Purpose-built for audiences, GWI data integration, research workflow
- **Their Strength**: Flexibility, custom data sources, advanced analytics

**Our Unique Value Proposition**:
> "The fastest path from question to consumer insight, powered by the world's largest consumer research dataset and AI that speaks your language."

---

## Risk Assessment & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| AI accuracy concerns | High | Medium | Confidence scores, human verification, feedback loop |
| Performance at scale | Medium | Medium | Caching, pagination, async processing |
| Data freshness | Medium | Low | Real-time updates where possible, clear date labeling |
| Adoption resistance | Medium | Medium | Guided onboarding, templates, training |
| Feature creep | Medium | High | Strict prioritization, MVP approach, user feedback |

---

## Implementation Approach

### Recommended Order

1. **Month 1-2**: AI Builder + Size Estimation
   - Highest user value
   - Differentiating capability
   - Foundation for other features

2. **Month 2-3**: Visualization + Insights
   - Completes the cross-tab experience
   - High visibility impact
   - Drives engagement

3. **Month 3-4**: Templates + Comparison Mode
   - Reduces friction for new users
   - Increases discovery
   - Quick wins

4. **Month 4-6**: Collaboration + History
   - Enterprise readiness
   - Team adoption
   - Retention driver

---

## Appendix

### A. Detailed User Research Findings
*(To be populated after user interviews)*

### B. Technical Architecture Diagrams
*(To be created during implementation planning)*

### C. Competitive Feature Matrix
*(To be maintained as competitive landscape evolves)*

### D. API Specification
*(To be defined in OpenAPI format)*

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-10 | Claude | Initial research and plan |

---

*This plan is a living document and should be updated as we learn more from users and the market.*
