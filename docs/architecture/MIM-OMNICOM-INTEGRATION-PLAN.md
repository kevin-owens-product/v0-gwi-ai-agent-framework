# Media in Mind (MiM) & Omnicom Integration Plan

## Executive Summary

This document outlines a comprehensive integration strategy for supporting IPG Mediabrands' **Media in Mind (MiM)** platform and the broader **Omnicom/IPG ecosystem**, including the unified **Omni platform** and **Acxiom data services**. The integration will enable mindset-based media planning, unified audience management, and cross-platform optimization within the GWI AI Agent Framework.

---

## 1. Integration Overview

### 1.1 Key Platforms to Integrate

| Platform | Owner | Primary Capability | Integration Priority |
|----------|-------|-------------------|---------------------|
| **Media in Mind (MiM)** | IPG Mediabrands | Mindset-based media planning | High |
| **Omni** | Omnicom | Unified marketing intelligence | High |
| **Acxiom RealID** | Omnicom (via IPG) | Identity resolution & consumer data | High |
| **Unified Retail Media Solution** | IPG Mediabrands | Cross-retailer media optimization | Medium |
| **KINESSO** | IPG Mediabrands | Performance marketing & AI | Medium |
| **AMP (Audience Management Platform)** | IPG Mediabrands | Holistic audience data | Medium |

### 1.2 Integration Value Proposition

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    GWI AI Agent Framework                                │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                   Consumer Insights Layer                         │    │
│  │  - GWI Core Data    - Spark MCP    - Audience Analytics          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                              ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │              NEW: Mindset & Media Planning Layer                  │    │
│  │  - MiM Integration  - Omni Platform  - Acxiom Data               │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                              ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                   Activation Layer                                │    │
│  │  - Meta Ads  - DV360  - Trade Desk  - Retail Media Networks      │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Media in Mind (MiM) Integration

### 2.1 Core Capabilities to Support

Based on MiM's mindset-based planning approach, we need to support:

1. **Consumer Mindset Taxonomy**
   - Psychological states (e.g., seeking inspiration, indulgence, connection)
   - Temporal context (time of day, day of week, seasonal)
   - Environmental context (at home, commuting, at work)

2. **Receptivity Scoring**
   - Channel-mindset alignment scores
   - Message-mindset compatibility
   - Optimal timing recommendations

3. **Channel Optimization**
   - Cross-channel mindset prevalence mapping
   - Budget allocation recommendations
   - Performance prediction by mindset-channel combination

### 2.2 New Data Models

```prisma
// Add to prisma/schema.prisma

// Consumer Mindset definitions
model ConsumerMindset {
  id              String   @id @default(cuid())
  orgId           String
  name            String   // e.g., "Seeking Inspiration", "Looking for Deals"
  description     String?
  category        MindsetCategory

  // Behavioral indicators
  indicators      Json     // Signals that identify this mindset

  // Temporal patterns
  temporalPattern Json     // Time-based prevalence patterns

  // Channel affinity
  channelAffinity Json     // Channel receptivity scores

  // Demographics correlation
  demographicIndex Json?   // How different demographics over/under-index

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  organization    Organization @relation(fields: [orgId], references: [id])
  mediaPlans      MindsetMediaPlan[]

  @@index([orgId])
}

enum MindsetCategory {
  EMOTIONAL       // Seeking joy, comfort, excitement
  FUNCTIONAL      // Problem-solving, information-seeking
  SOCIAL          // Connection, belonging, status
  ASPIRATIONAL    // Self-improvement, inspiration
  TRANSACTIONAL   // Ready to purchase, deal-seeking
}

// Mindset-based Media Planning
model MindsetMediaPlan {
  id              String   @id @default(cuid())
  orgId           String
  name            String
  description     String?

  // Target mindsets
  targetMindsets  String[] // Array of ConsumerMindset IDs

  // Audience integration
  audienceIds     String[] // GWI Audiences to apply mindsets to

  // Channel allocations
  channelPlan     Json     // Channel -> budget/timing allocation

  // Optimization settings
  optimizationGoal OptimizationGoal
  constraints     Json?    // Budget, timing, channel constraints

  // Performance tracking
  status          MediaPlanStatus @default(DRAFT)
  performance     Json?    // Actual vs. predicted performance

  // Integration references
  externalPlanId  String?  // MiM or Omni plan reference

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdBy       String

  organization    Organization @relation(fields: [orgId], references: [id])
  mindsets        ConsumerMindset[]
  activations     MediaActivation[]

  @@index([orgId])
}

enum OptimizationGoal {
  AWARENESS
  CONSIDERATION
  CONVERSION
  ENGAGEMENT
  REACH_EFFICIENCY
  BRAND_LIFT
}

enum MediaPlanStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  ACTIVE
  PAUSED
  COMPLETED
}

// Media Activation Records
model MediaActivation {
  id              String   @id @default(cuid())
  orgId           String
  mediaPlanId     String

  // Channel details
  channel         MediaChannel
  platform        String   // Specific platform within channel

  // Targeting
  mindsetIds      String[]
  audienceIds     String[]

  // Budget & timing
  budget          Float
  startDate       DateTime
  endDate         DateTime

  // External references
  externalCampaignId String?  // DSP/Platform campaign ID

  // Performance metrics
  metrics         Json?    // Impressions, clicks, conversions, etc.

  status          ActivationStatus @default(PENDING)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  organization    Organization @relation(fields: [orgId], references: [id])
  mediaPlan       MindsetMediaPlan @relation(fields: [mediaPlanId], references: [id])

  @@index([orgId])
  @@index([mediaPlanId])
}

enum MediaChannel {
  SOCIAL_MEDIA
  STREAMING_VIDEO
  CONNECTED_TV
  DIGITAL_DISPLAY
  PROGRAMMATIC_AUDIO
  SEARCH
  RETAIL_MEDIA
  OUT_OF_HOME
  LINEAR_TV
  RADIO
  PRINT
}

enum ActivationStatus {
  PENDING
  LIVE
  PAUSED
  COMPLETED
  FAILED
}

// Acxiom Identity Integration
model IdentityMapping {
  id              String   @id @default(cuid())
  orgId           String

  // GWI audience reference
  audienceId      String

  // Acxiom integration
  acxiomSegmentId String?  // Acxiom RealID segment
  matchRate       Float?   // Identity match rate

  // Omni integration
  omniAudienceId  String?  // Omni platform audience ID

  // Sync status
  lastSyncAt      DateTime?
  syncStatus      SyncStatus @default(PENDING)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  organization    Organization @relation(fields: [orgId], references: [id])
  audience        Audience @relation(fields: [audienceId], references: [id])

  @@unique([audienceId, acxiomSegmentId])
  @@index([orgId])
}

enum SyncStatus {
  PENDING
  SYNCING
  SYNCED
  ERROR
}
```

### 2.3 New Tools for Mindset-Based Planning

```typescript
// lib/mim-tools.ts - Media in Mind Tools

export const getMindsetInsightsTool: GWITool = {
  name: 'get_mindset_insights',
  description: 'Analyze consumer mindsets for a given audience segment. Returns mindset distribution, channel receptivity, and optimal timing windows.',
  category: 'analysis',
  parameters: {
    type: 'object',
    properties: {
      audienceId: {
        type: 'string',
        description: 'GWI Audience ID to analyze mindsets for'
      },
      mindsetCategories: {
        type: 'array',
        items: { type: 'string' },
        description: 'Filter by mindset categories (EMOTIONAL, FUNCTIONAL, SOCIAL, ASPIRATIONAL, TRANSACTIONAL)'
      },
      channels: {
        type: 'array',
        items: { type: 'string' },
        description: 'Specific channels to analyze receptivity for'
      },
      timeframe: {
        type: 'string',
        enum: ['daily', 'weekly', 'monthly'],
        description: 'Temporal analysis granularity'
      }
    },
    required: ['audienceId']
  },
  returns: {
    type: 'object',
    description: 'Mindset analysis with distribution, receptivity scores, and timing recommendations'
  }
}

export const createMindsetMediaPlanTool: GWITool = {
  name: 'create_mindset_media_plan',
  description: 'Create a mindset-based media plan that optimizes channel allocation based on consumer psychological states and receptivity.',
  category: 'analysis',
  parameters: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Name for the media plan'
      },
      audienceIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'Target audience IDs from GWI'
      },
      targetMindsets: {
        type: 'array',
        items: { type: 'string' },
        description: 'Mindset IDs to target'
      },
      budget: {
        type: 'number',
        description: 'Total budget for the media plan'
      },
      optimizationGoal: {
        type: 'string',
        enum: ['AWARENESS', 'CONSIDERATION', 'CONVERSION', 'ENGAGEMENT', 'REACH_EFFICIENCY', 'BRAND_LIFT'],
        description: 'Primary optimization objective'
      },
      channels: {
        type: 'array',
        items: { type: 'string' },
        description: 'Allowed channels for media allocation'
      },
      dateRange: {
        type: 'object',
        properties: {
          start: { type: 'string', description: 'Campaign start date (ISO format)' },
          end: { type: 'string', description: 'Campaign end date (ISO format)' }
        }
      }
    },
    required: ['name', 'audienceIds', 'budget', 'optimizationGoal']
  },
  returns: {
    type: 'object',
    description: 'Created media plan with channel allocations and mindset targeting strategy'
  }
}

export const optimizeChannelMixTool: GWITool = {
  name: 'optimize_channel_mix',
  description: 'Optimize media channel allocation based on mindset-channel receptivity scores and budget constraints.',
  category: 'analysis',
  parameters: {
    type: 'object',
    properties: {
      mediaPlanId: {
        type: 'string',
        description: 'Existing media plan ID to optimize'
      },
      constraints: {
        type: 'object',
        description: 'Optimization constraints (min/max by channel, frequency caps, etc.)'
      },
      scenario: {
        type: 'string',
        enum: ['aggressive', 'balanced', 'conservative'],
        description: 'Optimization risk profile'
      }
    },
    required: ['mediaPlanId']
  },
  returns: {
    type: 'object',
    description: 'Optimized channel allocation with predicted performance'
  }
}

export const getReceptivityWindowsTool: GWITool = {
  name: 'get_receptivity_windows',
  description: 'Identify optimal timing windows when target audiences are most receptive to messaging based on their mindset patterns.',
  category: 'analysis',
  parameters: {
    type: 'object',
    properties: {
      audienceId: {
        type: 'string',
        description: 'Target audience ID'
      },
      mindsetId: {
        type: 'string',
        description: 'Specific mindset to analyze'
      },
      channel: {
        type: 'string',
        description: 'Media channel to analyze'
      },
      granularity: {
        type: 'string',
        enum: ['hourly', 'daypart', 'daily', 'weekly'],
        description: 'Time granularity for analysis'
      }
    },
    required: ['audienceId']
  },
  returns: {
    type: 'object',
    description: 'Receptivity windows with scores and recommended activation times'
  }
}
```

---

## 3. Omni Platform Integration

### 3.1 Integration Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        GWI Platform                                   │
├──────────────────────────────────────────────────────────────────────┤
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────┐   │
│  │   Audiences    │────▶│  Identity      │────▶│  Activation    │   │
│  │   & Insights   │     │  Resolution    │     │  & Delivery    │   │
│  └────────────────┘     └────────────────┘     └────────────────┘   │
│          │                     │                      │              │
└──────────┼─────────────────────┼──────────────────────┼──────────────┘
           │                     │                      │
           ▼                     ▼                      ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    Integration Services Layer                         │
├──────────────────────────────────────────────────────────────────────┤
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────┐   │
│  │  Omni Sync     │     │  Acxiom API    │     │  Retail Media  │   │
│  │  Service       │     │  Client        │     │  Connector     │   │
│  └────────────────┘     └────────────────┘     └────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
           │                     │                      │
           ▼                     ▼                      ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    External Platforms                                 │
├────────────────────┬────────────────────┬────────────────────────────┤
│     Omni           │    Acxiom          │   Retail Media Networks    │
│  - Audiences       │  - RealID          │   - Amazon Ads             │
│  - Creative        │  - Consumer Data   │   - Walmart Connect        │
│  - Media Planning  │  - Identity Graph  │   - Target Roundel         │
│  - Measurement     │  - Segments        │   - Instacart              │
└────────────────────┴────────────────────┴────────────────────────────┘
```

### 3.2 Omni API Integration Service

```typescript
// lib/integrations/omni-client.ts

interface OmniConfig {
  apiBaseUrl: string
  clientId: string
  clientSecret: string
  tenantId: string
}

interface OmniAudience {
  id: string
  name: string
  description: string
  size: number
  segments: OmniSegment[]
  identityMatch: {
    realIdCoverage: number
    platformCoverage: Record<string, number>
  }
}

interface OmniSegment {
  id: string
  type: 'demographic' | 'behavioral' | 'intent' | 'mindset'
  criteria: Record<string, unknown>
}

interface OmniMediaPlan {
  id: string
  name: string
  status: string
  channels: OmniChannelAllocation[]
  budget: {
    total: number
    currency: string
  }
  performance?: OmniPerformanceMetrics
}

interface OmniChannelAllocation {
  channel: string
  allocation: number
  platforms: string[]
  targeting: {
    audiences: string[]
    mindsets: string[]
  }
}

export class OmniApiClient {
  private config: OmniConfig
  private accessToken: string | null = null
  private tokenExpiry: Date | null = null

  constructor(config: OmniConfig) {
    this.config = config
  }

  // Authentication
  async authenticate(): Promise<void> {
    const response = await fetch(`${this.config.apiBaseUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        tenant_id: this.config.tenantId
      })
    })
    const data = await response.json()
    this.accessToken = data.access_token
    this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000)
  }

  // Audience Operations
  async createAudience(audience: Partial<OmniAudience>): Promise<OmniAudience> {
    // Implementation
  }

  async syncAudienceFromGWI(gwiAudienceId: string): Promise<OmniAudience> {
    // Sync GWI audience to Omni platform
  }

  async getAudienceInsights(audienceId: string): Promise<unknown> {
    // Get enriched insights from Omni
  }

  // Media Planning Operations
  async createMediaPlan(plan: Partial<OmniMediaPlan>): Promise<OmniMediaPlan> {
    // Create media plan in Omni
  }

  async getOptimizationRecommendations(planId: string): Promise<unknown> {
    // Get AI-powered optimization recommendations
  }

  // Identity Resolution
  async resolveIdentities(audienceId: string): Promise<unknown> {
    // Resolve identities via Acxiom RealID
  }
}
```

### 3.3 Acxiom Data Integration

```typescript
// lib/integrations/acxiom-client.ts

interface AcxiomConfig {
  apiBaseUrl: string
  apiKey: string
  partnerId: string
}

interface AcxiomSegment {
  id: string
  name: string
  category: string
  description: string
  universeSize: number
  attributes: AcxiomAttribute[]
}

interface AcxiomAttribute {
  name: string
  type: 'demographic' | 'behavioral' | 'interest' | 'intent' | 'transactional'
  values: string[]
}

interface IdentityResolutionResult {
  inputRecords: number
  matchedRecords: number
  matchRate: number
  realIdCoverage: number
  platformMatch: Record<string, number>
}

export class AcxiomApiClient {
  private config: AcxiomConfig

  constructor(config: AcxiomConfig) {
    this.config = config
  }

  // Consumer Data Operations
  async getConsumerAttributes(criteria: Record<string, unknown>): Promise<unknown> {
    // Fetch consumer attributes from Acxiom
  }

  async enrichAudience(audienceId: string, attributes: string[]): Promise<unknown> {
    // Enrich GWI audience with Acxiom data
  }

  // Segment Operations
  async getAvailableSegments(category?: string): Promise<AcxiomSegment[]> {
    // List available Acxiom segments
  }

  async createCustomSegment(criteria: Record<string, unknown>): Promise<AcxiomSegment> {
    // Create custom segment in Acxiom
  }

  // Identity Resolution
  async resolveIdentity(identifiers: Record<string, string>): Promise<IdentityResolutionResult> {
    // Resolve identities using RealID
  }

  async getIdentityGraph(audienceId: string): Promise<unknown> {
    // Get identity graph for audience
  }

  // Real-time Signals
  async getRealtimeSignals(audienceId: string, signalTypes: string[]): Promise<unknown> {
    // Get real-time behavioral signals
  }
}
```

---

## 4. New Integration Tools

### 4.1 Complete Tool Definitions

```typescript
// lib/integration-tools.ts

// ==================== OMNI PLATFORM TOOLS ====================

export const syncToOmniTool: GWITool = {
  name: 'sync_to_omni',
  description: 'Sync a GWI audience to the Omni platform for unified marketing activation. Includes identity resolution via Acxiom RealID.',
  category: 'integration',
  parameters: {
    type: 'object',
    properties: {
      audienceId: {
        type: 'string',
        description: 'GWI Audience ID to sync'
      },
      enrichWithAcxiom: {
        type: 'boolean',
        description: 'Enrich audience with Acxiom consumer data'
      },
      activationPlatforms: {
        type: 'array',
        items: { type: 'string' },
        description: 'Target platforms for activation (e.g., ["meta", "google", "amazon"])'
      }
    },
    required: ['audienceId']
  },
  returns: {
    type: 'object',
    description: 'Sync result with Omni audience ID and match rates'
  }
}

export const getOmniInsightsTool: GWITool = {
  name: 'get_omni_insights',
  description: 'Retrieve enriched audience insights from the Omni platform, including Acxiom consumer data and real-time signals.',
  category: 'analysis',
  parameters: {
    type: 'object',
    properties: {
      omniAudienceId: {
        type: 'string',
        description: 'Omni platform audience ID'
      },
      insightTypes: {
        type: 'array',
        items: { type: 'string' },
        description: 'Types of insights to retrieve (e.g., ["demographics", "purchase_intent", "media_affinity"])'
      },
      includeCompetitive: {
        type: 'boolean',
        description: 'Include competitive intelligence'
      }
    },
    required: ['omniAudienceId']
  },
  returns: {
    type: 'object',
    description: 'Enriched insights from Omni platform'
  }
}

// ==================== ACXIOM DATA TOOLS ====================

export const enrichWithAcxiomTool: GWITool = {
  name: 'enrich_with_acxiom',
  description: 'Enrich a GWI audience with Acxiom consumer data attributes for deeper insights and better targeting.',
  category: 'data',
  parameters: {
    type: 'object',
    properties: {
      audienceId: {
        type: 'string',
        description: 'GWI Audience ID to enrich'
      },
      attributes: {
        type: 'array',
        items: { type: 'string' },
        description: 'Acxiom attributes to add (e.g., ["purchase_behavior", "household_composition", "financial_indicators"])'
      },
      matchMethod: {
        type: 'string',
        enum: ['deterministic', 'probabilistic', 'hybrid'],
        description: 'Identity matching method'
      }
    },
    required: ['audienceId', 'attributes']
  },
  returns: {
    type: 'object',
    description: 'Enrichment result with match rate and added attributes'
  }
}

export const resolveIdentitiesTool: GWITool = {
  name: 'resolve_identities',
  description: 'Resolve consumer identities across platforms using Acxiom RealID for cross-channel activation.',
  category: 'data',
  parameters: {
    type: 'object',
    properties: {
      audienceId: {
        type: 'string',
        description: 'Audience ID for identity resolution'
      },
      targetPlatforms: {
        type: 'array',
        items: { type: 'string' },
        description: 'Platforms to resolve identities for'
      },
      includePersistentId: {
        type: 'boolean',
        description: 'Generate persistent cross-device IDs'
      }
    },
    required: ['audienceId']
  },
  returns: {
    type: 'object',
    description: 'Identity resolution results with match rates by platform'
  }
}

// ==================== RETAIL MEDIA TOOLS ====================

export const getRetailMediaInsightsTool: GWITool = {
  name: 'get_retail_media_insights',
  description: 'Get insights for retail media network planning based on audience shopping behavior and retailer affinity.',
  category: 'analysis',
  parameters: {
    type: 'object',
    properties: {
      audienceId: {
        type: 'string',
        description: 'Target audience ID'
      },
      retailers: {
        type: 'array',
        items: { type: 'string' },
        description: 'Specific retailers to analyze (e.g., ["amazon", "walmart", "target", "instacart"])'
      },
      categories: {
        type: 'array',
        items: { type: 'string' },
        description: 'Product categories to focus on'
      }
    },
    required: ['audienceId']
  },
  returns: {
    type: 'object',
    description: 'Retail media insights with retailer affinity and category performance'
  }
}

export const optimizeRetailMediaSpendTool: GWITool = {
  name: 'optimize_retail_media_spend',
  description: 'Optimize budget allocation across retail media networks using IPG Unified Retail Media Solution intelligence.',
  category: 'analysis',
  parameters: {
    type: 'object',
    properties: {
      mediaPlanId: {
        type: 'string',
        description: 'Media plan ID to optimize'
      },
      totalBudget: {
        type: 'number',
        description: 'Total retail media budget'
      },
      optimizationGoal: {
        type: 'string',
        enum: ['ROAS', 'reach', 'conversion', 'new_customer_acquisition'],
        description: 'Primary optimization objective'
      },
      constraints: {
        type: 'object',
        description: 'Budget constraints by retailer or category'
      }
    },
    required: ['mediaPlanId', 'totalBudget', 'optimizationGoal']
  },
  returns: {
    type: 'object',
    description: 'Optimized allocation with predicted performance by retailer'
  }
}
```

---

## 5. New Agent Templates

### 5.1 Media Planning Agent

```typescript
// lib/solution-agents.ts - Add new agent templates

export const mindsetMediaPlannerAgent = {
  id: 'mindset-media-planner',
  name: 'Mindset-Based Media Planner',
  description: 'AI agent that creates media plans optimized for consumer mindsets and receptivity windows.',
  category: 'marketing',
  capabilities: [
    'Analyze audience mindset distributions',
    'Identify optimal channel-mindset combinations',
    'Create budget allocations based on receptivity',
    'Recommend timing strategies for maximum impact',
    'Integrate with MiM and Omni platforms'
  ],
  systemPrompt: `You are a mindset-based media planning specialist powered by Media in Mind (MiM) intelligence and Omni platform data.

Your role is to help users create media plans that go beyond demographics to target consumers based on their psychological states and receptivity.

When creating media plans:
1. First analyze the target audience's mindset distribution using get_mindset_insights
2. Identify which mindsets align with the campaign objectives
3. Map mindsets to optimal channels using channel receptivity data
4. Determine timing windows when target mindsets are most prevalent
5. Create a budget allocation that maximizes mindset-channel alignment
6. Sync audiences to Omni for activation when ready

Always explain your recommendations in terms of consumer psychology and receptivity, not just reach metrics.`,
  suggestedTools: [
    'get_mindset_insights',
    'create_mindset_media_plan',
    'optimize_channel_mix',
    'get_receptivity_windows',
    'sync_to_omni',
    'enrich_with_acxiom'
  ],
  examplePrompts: [
    'Create a media plan targeting consumers in an aspirational mindset for our new product launch',
    'What channels should we prioritize for reaching deal-seekers during Q4?',
    'Optimize our current media mix based on mindset receptivity data',
    'When are our target audiences most receptive to brand messaging?'
  ]
}

export const omniIntegrationAgent = {
  id: 'omni-integration',
  name: 'Omni Platform Integration Agent',
  description: 'AI agent that manages audience synchronization and activation across the Omni/IPG ecosystem.',
  category: 'integration',
  capabilities: [
    'Sync GWI audiences to Omni platform',
    'Enrich audiences with Acxiom data',
    'Resolve cross-platform identities',
    'Manage retail media network integrations',
    'Track activation performance'
  ],
  systemPrompt: `You are an integration specialist for the Omni marketing intelligence platform and IPG Mediabrands ecosystem.

Your role is to help users:
1. Sync GWI audiences to Omni for unified marketing activation
2. Enrich audiences with Acxiom consumer data
3. Resolve identities across platforms using RealID
4. Activate audiences across retail media networks
5. Monitor and optimize cross-platform performance

When syncing or activating:
- Always explain the identity match rates and what they mean
- Recommend enrichment attributes that will improve targeting
- Suggest optimal platforms based on audience characteristics
- Provide clear next steps for activation`,
  suggestedTools: [
    'sync_to_omni',
    'get_omni_insights',
    'enrich_with_acxiom',
    'resolve_identities',
    'get_retail_media_insights',
    'optimize_retail_media_spend'
  ],
  examplePrompts: [
    'Sync my tech enthusiast audience to Omni for activation',
    'Enrich this audience with Acxiom purchase behavior data',
    'What is the identity match rate for my audience across Meta and Google?',
    'Recommend retail media networks for my CPG campaign'
  ]
}
```

---

## 6. API Routes

### 6.1 New API Endpoints

```
POST   /api/v1/mindsets                    - Create consumer mindset definition
GET    /api/v1/mindsets                    - List mindsets
GET    /api/v1/mindsets/[id]               - Get mindset details
POST   /api/v1/mindsets/analyze            - Analyze mindset distribution for audience

POST   /api/v1/media-plans/mindset         - Create mindset-based media plan
GET    /api/v1/media-plans/mindset         - List mindset media plans
GET    /api/v1/media-plans/mindset/[id]    - Get media plan details
POST   /api/v1/media-plans/mindset/[id]/optimize - Optimize channel mix
POST   /api/v1/media-plans/mindset/[id]/activate - Activate media plan

POST   /api/v1/integrations/omni/sync      - Sync audience to Omni
GET    /api/v1/integrations/omni/audiences - List synced Omni audiences
POST   /api/v1/integrations/omni/insights  - Get Omni insights

POST   /api/v1/integrations/acxiom/enrich  - Enrich with Acxiom data
POST   /api/v1/integrations/acxiom/resolve - Resolve identities
GET    /api/v1/integrations/acxiom/segments - List available segments

POST   /api/v1/integrations/retail-media/insights   - Get retail media insights
POST   /api/v1/integrations/retail-media/optimize   - Optimize retail spend
GET    /api/v1/integrations/retail-media/networks   - List connected networks
```

---

## 7. UI Components

### 7.1 New Components Needed

```
components/
├── mindsets/
│   ├── mindset-explorer.tsx         - Visual mindset taxonomy browser
│   ├── mindset-distribution.tsx     - Audience mindset breakdown
│   ├── receptivity-heatmap.tsx      - Channel-time receptivity visualization
│   └── mindset-selector.tsx         - Mindset multi-select for planning
│
├── media-planning/
│   ├── mindset-media-planner.tsx    - Main media planning interface
│   ├── channel-allocation.tsx       - Budget allocation by channel
│   ├── timing-optimizer.tsx         - Daypart/timing configuration
│   └── performance-predictor.tsx    - Predicted vs actual performance
│
├── integrations/
│   ├── omni-sync-panel.tsx          - Omni audience sync UI
│   ├── acxiom-enrichment.tsx        - Acxiom data enrichment UI
│   ├── identity-resolution.tsx      - Identity match visualization
│   └── retail-media-panel.tsx       - Retail media network management
│
└── dashboards/
    └── mim-dashboard.tsx            - Media in Mind overview dashboard
```

### 7.2 Integration Grid Update

Add new integrations to the existing grid:

```typescript
// Update components/integrations/integrations-grid.tsx

const newIntegrations = [
  {
    id: 'media-in-mind',
    name: 'Media in Mind (MiM)',
    description: 'IPG Mediabrands mindset-based media planning',
    icon: '/ipg-mediabrands-logo.png',
    category: 'media-planning',
    popular: true,
    connected: false,
  },
  {
    id: 'omni',
    name: 'Omni Platform',
    description: 'Omnicom unified marketing intelligence',
    icon: '/omnicom-logo.png',
    category: 'media-planning',
    popular: true,
    connected: false,
  },
  {
    id: 'acxiom',
    name: 'Acxiom',
    description: 'Consumer data enrichment and identity resolution',
    icon: '/acxiom-logo.png',
    category: 'data',
    popular: true,
    connected: false,
  },
  {
    id: 'unified-retail-media',
    name: 'Unified Retail Media',
    description: 'IPG cross-retailer media optimization',
    icon: '/ipg-retail-logo.png',
    category: 'advertising',
    popular: false,
    connected: false,
  },
  {
    id: 'kinesso',
    name: 'KINESSO',
    description: 'IPG performance marketing and AI platform',
    icon: '/kinesso-logo.png',
    category: 'advertising',
    popular: false,
    connected: false,
  },
]

// Add new category
const categories = [
  // ... existing categories
  { id: 'media-planning', label: 'Media Planning' },
]
```

---

## 8. Implementation Phases

### Phase 1: Foundation (Weeks 1-4)
- [ ] Add new Prisma models for mindsets and media planning
- [ ] Create Omni API client with authentication
- [ ] Create Acxiom API client with authentication
- [ ] Implement basic sync functionality
- [ ] Add integration entries to UI

### Phase 2: Mindset Tools (Weeks 5-8)
- [ ] Implement `get_mindset_insights` tool
- [ ] Implement `create_mindset_media_plan` tool
- [ ] Implement `get_receptivity_windows` tool
- [ ] Create mindset explorer UI component
- [ ] Build receptivity heatmap visualization

### Phase 3: Omni Integration (Weeks 9-12)
- [ ] Implement `sync_to_omni` tool
- [ ] Implement `get_omni_insights` tool
- [ ] Build identity resolution flow
- [ ] Create Omni sync panel UI
- [ ] Add performance tracking

### Phase 4: Data Enrichment (Weeks 13-16)
- [ ] Implement `enrich_with_acxiom` tool
- [ ] Implement `resolve_identities` tool
- [ ] Build Acxiom enrichment UI
- [ ] Add identity match visualization
- [ ] Create enrichment reports

### Phase 5: Retail Media (Weeks 17-20)
- [ ] Implement retail media tools
- [ ] Build retailer network connectors
- [ ] Create retail media panel UI
- [ ] Add spend optimization
- [ ] Implement performance dashboards

### Phase 6: Agent Templates (Weeks 21-24)
- [ ] Create Mindset Media Planner agent
- [ ] Create Omni Integration agent
- [ ] Build agent workflows
- [ ] Add solution templates
- [ ] Documentation and training

---

## 9. Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Data Flow                                       │
└─────────────────────────────────────────────────────────────────────────────┘

1. AUDIENCE CREATION & ENRICHMENT
   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
   │   GWI    │───▶│  Create  │───▶│  Enrich  │───▶│  Resolve │
   │  Query   │    │ Audience │    │ (Acxiom) │    │ Identity │
   └──────────┘    └──────────┘    └──────────┘    └──────────┘
                                         │               │
                                         ▼               ▼
                               ┌─────────────────────────────────┐
                               │    Enriched Audience with IDs   │
                               └─────────────────────────────────┘

2. MINDSET ANALYSIS
   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
   │ Audience │───▶│  Mindset │───▶│ Channel  │───▶│  Timing  │
   │          │    │ Analysis │    │ Mapping  │    │ Windows  │
   └──────────┘    └──────────┘    └──────────┘    └──────────┘
                                         │               │
                                         ▼               ▼
                               ┌─────────────────────────────────┐
                               │   Mindset-Channel-Time Matrix   │
                               └─────────────────────────────────┘

3. MEDIA PLANNING
   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
   │ Mindset  │───▶│  Budget  │───▶│ Optimize │───▶│  Activate│
   │  Matrix  │    │ Allocate │    │   Mix    │    │  (Omni)  │
   └──────────┘    └──────────┘    └──────────┘    └──────────┘
                                         │               │
                                         ▼               ▼
                               ┌─────────────────────────────────┐
                               │    Activated Media Campaigns    │
                               └─────────────────────────────────┘

4. PERFORMANCE LOOP
   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
   │ Campaign │───▶│ Collect  │───▶│  Analyze │───▶│  Adjust  │
   │  Live    │    │ Metrics  │    │   Perf   │    │   Plan   │
   └──────────┘    └──────────┘    └──────────┘    └──────────┘
                                         │               │
                                         ▼               ▼
                               ┌─────────────────────────────────┐
                               │   Continuous Optimization       │
                               └─────────────────────────────────┘
```

---

## 10. Security & Compliance Considerations

### 10.1 Data Privacy
- All Acxiom data access must comply with consumer consent requirements
- Implement data minimization - only request necessary attributes
- Support regional data residency requirements
- Audit all data enrichment and identity resolution activities

### 10.2 API Security
- Use OAuth 2.0 for all external API integrations
- Store credentials in secure secrets management
- Implement rate limiting for external API calls
- Log all external API interactions for audit

### 10.3 Access Control
- Add new permissions: `mim:read`, `mim:write`, `omni:sync`, `acxiom:enrich`
- Require ADMIN or higher for integration configuration
- Allow MEMBER access for using integrations in workflows

---

## 11. Success Metrics

### 11.1 Integration Adoption
- Number of organizations with MiM/Omni integrations enabled
- Audiences synced to Omni platform
- Audiences enriched with Acxiom data

### 11.2 Planning Efficiency
- Time to create mindset-based media plans
- Optimization cycles per campaign
- Budget allocation accuracy vs. performance

### 11.3 Performance Improvement
- Lift in campaign performance vs. demographic-only targeting
- Identity match rate improvements
- Cross-platform reach efficiency

---

## 12. Dependencies & Prerequisites

### 12.1 External API Access
- [ ] Omni platform API credentials and documentation
- [ ] Acxiom developer portal access
- [ ] IPG Unified Retail Media API access
- [ ] Test/sandbox environments for each platform

### 12.2 Data Requirements
- [ ] Mindset taxonomy from IPG Mediabrands
- [ ] Channel receptivity benchmark data
- [ ] Acxiom attribute catalog
- [ ] Retail media network specifications

### 12.3 Technical Requirements
- [ ] OAuth 2.0 client registration for each platform
- [ ] Webhook endpoints for async operations
- [ ] Data clean room access if required
- [ ] Geographic API endpoint configuration

---

## 13. Next Steps

1. **Technical Discovery** - Schedule technical discussions with Omnicom/IPG teams to understand exact API specifications and authentication requirements

2. **Data Mapping** - Map GWI audience criteria to MiM mindset taxonomy and Acxiom attributes

3. **Sandbox Setup** - Request sandbox/test environment access for all platforms

4. **Prototype** - Build proof-of-concept for audience sync flow

5. **Security Review** - Complete security assessment for data handling

---

## References

- [IPG Mediabrands Unified Retail Media Solution](https://www.ipgmediabrands.com/ipg-mediabrands-launches-unified-retail-media-solution/)
- [Omnicom Omni Platform](https://www.omc.com/newsroom/omnicom-unveils-the-new-omni-an-ai-driven-marketing-intelligence-platform-delivering-measurable-sales-growth-for-brands/)
- [Acxiom Developer Portal](https://developer.myacxiom.com/)
- [Acxiom RealID](https://www.acxiom.com/identity-resolution/real-id/)
- [MAGNA Mindset Research](https://www.thedrum.com/profile/ipgmediabrands/article/magna-and-vox-media-unlock-listener-mindsets-as-podcasts-fuel-digital-audio-market-growth)

---

*Document Version: 1.0*
*Created: January 2026*
*Author: GWI AI Agent Framework Team*
