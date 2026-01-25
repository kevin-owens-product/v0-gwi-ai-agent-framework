import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { getValidatedOrgId, getUserMembership } from '@/lib/tenant'
import { hasPermission } from '@/lib/permissions'
import { recordUsage } from '@/lib/billing'
import { z } from 'zod'

const chatRequestSchema = z.object({
  message: z.string().min(1),
  agentId: z.string().optional(),
  context: z.record(z.unknown()).optional(),
  config: z.object({
    temperature: z.number().optional(),
    maxTokens: z.number().optional(),
    enableCitations: z.boolean().optional(),
    enableMemory: z.boolean().optional(),
    selectedSources: z.array(z.string()).optional(),
  }).optional(),
})

// Built-in agent knowledge bases
const agentKnowledge: Record<string, { systemPrompt: string; capabilities: string[] }> = {
  'audience-explorer': {
    systemPrompt: `You are the Audience Explorer agent, specialized in discovering and analyzing consumer segments.
You have access to GWI Core data covering 2.8 billion consumers across 52 markets.
Provide detailed demographic profiles, behavioral patterns, and psychographic insights.
Always cite specific data points and percentages where possible.`,
    capabilities: ['Segment Analysis', 'Persona Generation', 'Behavioral Mapping', 'Demographic Profiling'],
  },
  'persona-architect': {
    systemPrompt: `You are the Persona Architect agent, specialized in creating rich, data-driven consumer personas.
You build comprehensive profiles including motivations, pain points, media habits, and journey maps.
Focus on bringing personas to life with specific details and actionable insights.`,
    capabilities: ['Persona Creation', 'Motivation Mapping', 'Journey Mapping', 'Archetype Definition'],
  },
  'motivation-decoder': {
    systemPrompt: `You are the Motivation Decoder agent, specialized in analyzing the 'why' behind consumer behavior.
You uncover values, beliefs, emotional drivers, and decision factors.
Go beyond surface-level needs to reveal deep motivations and need states.`,
    capabilities: ['Value Analysis', 'Emotional Drivers', 'Decision Factors', 'Need State Mapping'],
  },
  'culture-tracker': {
    systemPrompt: `You are the Culture Tracker agent, specialized in monitoring cultural shifts and emerging trends.
You track movements, societal changes, and zeitgeist patterns that shape consumer behavior.
Identify emerging signals and predict cultural evolution.`,
    capabilities: ['Trend Detection', 'Cultural Analysis', 'Movement Tracking', 'Zeitgeist Mapping'],
  },
  'brand-analyst': {
    systemPrompt: `You are the Brand Relationship Analyst, specialized in examining brand-consumer relationships.
You analyze brand perception, loyalty patterns, competitive positioning, and affinity mapping.
Provide actionable insights for brand strategy and positioning.`,
    capabilities: ['Brand Perception', 'Loyalty Analysis', 'Competitive Position', 'Affinity Mapping'],
  },
  'global-perspective': {
    systemPrompt: `You are the Global Perspective Agent, specialized in cross-market consumer analysis.
You compare behaviors across markets and cultures to identify universal truths and local nuances.
Support market entry strategies and global campaign localization.`,
    capabilities: ['Cross-Market Analysis', 'Cultural Comparison', 'Global Trends', 'Market Entry'],
  },
}

// Mock response templates for agent types
const agentTypeResponses: Record<string, (query: string, agentName?: string) => { response: string; outputBlocks: Array<{ id: string; type: string; title: string; content: Record<string, unknown> }> }> = {
  RESEARCH: (query: string, agentName?: string) => {
    const lowerQuery = query.toLowerCase()
    const hasGenZ = lowerQuery.includes('gen z') || lowerQuery.includes('generation z')
    const hasSustainability = lowerQuery.includes('sustain') || lowerQuery.includes('eco') || lowerQuery.includes('green')
    const hasMarket = lowerQuery.includes('market') || lowerQuery.includes('region') || lowerQuery.includes('country')
    const hasBrand = lowerQuery.includes('brand') || lowerQuery.includes('company') || lowerQuery.includes('competitor')

    let response = `## Research Analysis${agentName ? ` from ${agentName}` : ''}

Based on comprehensive analysis of GWI Core data across 52 global markets, here are the key research findings:

### Executive Summary
Our research methodology combined quantitative survey data (n=2.8M respondents) with behavioral tracking to uncover actionable insights.

`

    if (hasGenZ) {
      response += `### Gen Z Consumer Profile (Ages 18-26)

**Digital Behavior Patterns**
- Average daily screen time: 7.2 hours (highest among all generations)
- Platform distribution: TikTok (89%), YouTube (92%), Instagram (78%)
- Content preference: 73% favor short-form video under 60 seconds
- Brand discovery: 67% via social media vs 34% through traditional search

**Purchase Decision Factors**
| Factor | Importance Score | YoY Change |
|--------|-----------------|------------|
| Authenticity | 92% | +8% |
| Social proof | 87% | +12% |
| Sustainability | 84% | +15% |
| Price value | 78% | +3% |
| Brand heritage | 34% | -12% |

**Key Insight**: Gen Z has developed sophisticated "authenticity detection" - 92% claim they can identify performative messaging within seconds.

`
    }

    if (hasSustainability) {
      response += `### Sustainability Segment Analysis

**Market Segmentation**
1. **Eco-Warriors** (18% of market): Actively avoid unsustainable brands, 30%+ premium tolerance
2. **Conscious Mainstream** (34%): Prefer sustainable when convenient, moderate premium acceptance
3. **Passive Supporters** (28%): Appreciate sustainability but don't actively seek it
4. **Price-Focused** (20%): Sustainability is secondary to value

**Behavioral Correlations**
- Sustainability-focused consumers spend 2.3x more time researching purchases
- 76% verify brand claims through third-party sources
- Social sharing rate: 4.2x higher for sustainable brand experiences

**Regional Variance**
| Region | Sustainability Priority | Premium Willingness |
|--------|------------------------|---------------------|
| Western Europe | 79% | +24% |
| North America | 64% | +18% |
| APAC | 71% | +21% |
| LATAM | 68% | +15% |

`
    }

    if (hasMarket) {
      response += `### Cross-Market Analysis

**Market Maturity Index**
| Market | Digital Adoption | Consumer Confidence | Growth Trajectory |
|--------|-----------------|--------------------|--------------------|
| United States | 78% | 62/100 | Moderate |
| United Kingdom | 82% | 54/100 | Stable |
| Germany | 71% | 58/100 | Growing |
| Japan | 85% | 48/100 | Mature |
| Brazil | 74% | 67/100 | High Growth |
| India | 69% | 78/100 | Emerging |

**Universal Patterns Across Markets**
- Digital-first discovery: 70%+ across all surveyed markets
- Trust deficit: Brand trust declining globally (avg -12% from 2020)
- Values-driven purchasing: 65%+ among under-35 demographic
- Community seeking: Post-pandemic desire for connection remains elevated

`
    }

    if (hasBrand) {
      response += `### Brand Relationship Analysis

**Trust Metrics (Global Benchmarks)**
- Overall brand trust: 42% (down from 54% in 2020)
- Trust in brand claims: 34%
- Trust with third-party validation: 71%

**Consumer-Brand Relationship Archetypes**
1. **Loyal Advocates** (12%): Deep emotional connection, +45% premium tolerance
2. **Transactional Loyalists** (28%): Convenience-driven, will switch for better deals
3. **Values-Aligned Seekers** (34%): Choose brands matching personal values
4. **Price Switchers** (26%): Minimal loyalty, price-primary decisions

**Affinity Drivers**
| Driver | Importance | Trend |
|--------|-----------|-------|
| Product quality | 89% | Stable |
| Value for money | 84% | ↑ Growing |
| Brand values | 72% | ↑ Growing |
| Customer service | 68% | Stable |
| Innovation | 54% | ↓ Declining |

`
    }

    response += `### Methodology & Confidence
- Sample size: 2.8M respondents
- Markets covered: 52 countries
- Confidence interval: 95%
- Data recency: Q4 2024

Would you like me to dive deeper into any specific segment or generate visualizations for these findings?`

    const outputBlocks: Array<{ id: string; type: string; title: string; content: Record<string, unknown> }> = []

    if (hasGenZ || hasSustainability) {
      outputBlocks.push({
        id: `chart-${Date.now()}`,
        type: 'chart',
        title: hasGenZ ? 'Gen Z Purchase Drivers' : 'Sustainability Segment Distribution',
        content: hasGenZ ? {
          chartType: 'bar',
          categories: ['Authenticity', 'Social Proof', 'Sustainability', 'Price Value', 'Brand Heritage'],
          series: [
            { name: 'Gen Z', data: [92, 87, 84, 78, 34], color: '#8b5cf6' },
            { name: 'Millennials', data: [78, 72, 76, 82, 48], color: '#3b82f6' },
            { name: 'Gen X', data: [65, 58, 58, 89, 67], color: '#10b981' },
          ],
        } : {
          chartType: 'bar',
          categories: ['Eco-Warriors', 'Conscious Mainstream', 'Passive Supporters', 'Price-Focused'],
          series: [
            { name: 'Market Share', data: [18, 34, 28, 20], color: '#10b981' },
            { name: 'Premium Tolerance', data: [30, 15, 8, 2], color: '#3b82f6' },
          ],
        },
      })
    }

    if (hasGenZ) {
      outputBlocks.push({
        id: `persona-${Date.now()}`,
        type: 'persona',
        title: 'Digital-Native Gen Z',
        content: {
          name: 'Digital-Native Gen Z',
          age: '18-26',
          income: '$25K-$55K',
          location: 'Urban centers globally',
          values: ['Authenticity', 'Social Justice', 'Mental Health', 'Creativity'],
          behaviors: [
            'Discovers brands through social media (67%)',
            'Checks 3+ sources before major purchases',
            'Values creator recommendations over celebrity endorsements',
            'Completes 78% of purchases on mobile',
          ],
          mediaHabits: ['TikTok (3.5h/day)', 'YouTube (2.8h/day)', 'Instagram (2.1h/day)'],
        },
      })
    }

    return { response, outputBlocks }
  },

  ANALYSIS: (query: string, agentName?: string) => {
    const lowerQuery = query.toLowerCase()
    const hasCompare = lowerQuery.includes('compare') || lowerQuery.includes('vs') || lowerQuery.includes('versus')
    const hasTrend = lowerQuery.includes('trend') || lowerQuery.includes('change') || lowerQuery.includes('growth')
    const hasSegment = lowerQuery.includes('segment') || lowerQuery.includes('audience') || lowerQuery.includes('group')

    let response = `## Analytical Deep-Dive${agentName ? ` from ${agentName}` : ''}

I've performed a comprehensive analytical assessment using our multi-dimensional framework:

### Analysis Framework
- **Quantitative Analysis**: Statistical modeling with 95% confidence intervals
- **Qualitative Synthesis**: Pattern recognition across behavioral indicators
- **Predictive Modeling**: Trend extrapolation with scenario analysis

### Key Analytical Findings

`

    if (hasCompare) {
      response += `#### Comparative Analysis Matrix

| Dimension | Segment A | Segment B | Delta | Significance |
|-----------|----------|----------|-------|--------------|
| Engagement Rate | 4.2% | 3.1% | +35% | High (p<0.01) |
| Conversion | 2.8% | 2.1% | +33% | High (p<0.01) |
| Retention (90d) | 67% | 54% | +24% | Medium (p<0.05) |
| LTV Projection | $142 | $98 | +45% | High (p<0.01) |
| NPS Score | +42 | +28 | +50% | High (p<0.01) |

**Statistical Significance**: All key metrics show statistically significant differences with p-values below threshold.

**Confidence Assessment**: High confidence in comparative findings based on sample sizes >10,000 per segment.

`
    }

    if (hasTrend) {
      response += `#### Trend Analysis & Forecasting

**Historical Trajectory (24-month lookback)**
- Q1 2024: Baseline establishment, +12% YoY growth
- Q2 2024: Acceleration phase, +18% YoY growth
- Q3 2024: Peak momentum, +24% YoY growth
- Q4 2024: Stabilization, +21% YoY growth

**Predictive Model Output (12-month forward)**
| Scenario | Probability | Projected Growth | Key Drivers |
|----------|------------|-----------------|-------------|
| Bullish | 25% | +28-32% | Market expansion, digital adoption |
| Base Case | 55% | +18-22% | Steady state, organic growth |
| Conservative | 20% | +8-12% | Economic headwinds, saturation |

**Leading Indicators to Monitor**
1. Digital engagement velocity (current: +15% MoM)
2. Social sentiment index (current: 72/100 positive)
3. Competitive intensity ratio (current: moderate)

`
    }

    if (hasSegment) {
      response += `#### Segment Clustering Analysis

**Cluster Identification (K-means, k=4)**

| Cluster | Size | Cohesion | Key Characteristics |
|---------|------|----------|---------------------|
| Alpha | 28% | High | High-value, engaged, loyal |
| Beta | 34% | Medium | Mainstream, price-sensitive |
| Gamma | 22% | Medium | Emerging, growth potential |
| Delta | 16% | Low | At-risk, declining engagement |

**Segment Migration Patterns**
- Alpha → Beta: 8% annual churn
- Beta → Alpha: 12% annual upgrade
- Gamma → Alpha: 15% conversion opportunity
- Delta → Churn: 24% attrition risk

**Actionable Segmentation Insights**
1. **Protect Alpha**: High-touch engagement programs
2. **Nurture Beta**: Value demonstration campaigns
3. **Accelerate Gamma**: Onboarding optimization
4. **Rescue Delta**: Win-back interventions

`
    }

    response += `#### Analysis Quality Metrics
- Data completeness: 94%
- Model accuracy: R² = 0.87
- Cross-validation score: 0.84
- Prediction confidence: High

### Recommendations Based on Analysis
1. **Immediate**: Focus resources on high-growth segments
2. **Short-term**: Implement predictive monitoring dashboard
3. **Long-term**: Develop automated segmentation refresh

Would you like me to export this analysis or dive deeper into any specific dimension?`

    const outputBlocks: Array<{ id: string; type: string; title: string; content: Record<string, unknown> }> = []

    outputBlocks.push({
      id: `chart-${Date.now()}`,
      type: 'chart',
      title: 'Trend Analysis: Growth Trajectory',
      content: {
        chartType: 'bar',
        categories: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025 (Proj)'],
        series: [
          { name: 'Actual Growth', data: [12, 18, 24, 21, 0], color: '#3b82f6' },
          { name: 'Projected', data: [0, 0, 0, 0, 20], color: '#8b5cf6' },
        ],
      },
    })

    outputBlocks.push({
      id: `table-${Date.now()}`,
      type: 'table',
      title: 'Segment Performance Matrix',
      content: {
        headers: ['Segment', 'Size', 'Growth', 'Engagement', 'Value Index'],
        rows: [
          ['Alpha (High-Value)', '28%', '+18%', 'High', '142'],
          ['Beta (Mainstream)', '34%', '+8%', 'Medium', '98'],
          ['Gamma (Emerging)', '22%', '+24%', 'Growing', '115'],
          ['Delta (At-Risk)', '16%', '-5%', 'Low', '72'],
        ],
      },
    })

    return { response, outputBlocks }
  },

  REPORTING: (_query: string, agentName?: string) => {
    const response = `## Executive Report${agentName ? ` from ${agentName}` : ''}

### Report Summary
**Report Type**: Comprehensive Consumer Intelligence Report
**Report Period**: Q4 2024
**Markets Covered**: 52 Global Markets
**Generated**: ${new Date().toLocaleDateString()}

---

### Key Performance Indicators

| KPI | Current | Previous | Change | Status |
|-----|---------|----------|--------|--------|
| Total Addressable Market | $4.2B | $3.8B | +10.5% | ✅ On Track |
| Market Share | 12.4% | 11.2% | +1.2pp | ✅ Above Target |
| Customer Acquisition | 145K | 128K | +13.3% | ✅ Exceeding |
| Customer Retention | 78% | 74% | +4pp | ✅ Improving |
| NPS Score | +42 | +38 | +4pts | ✅ Strong |
| Revenue per User | $87 | $82 | +6.1% | ⚠️ Monitor |

---

### Executive Highlights

#### Market Position
We have strengthened our market position with a 1.2 percentage point gain in market share, outpacing the industry average growth of 0.8pp. This positions us as the #2 player in key markets.

#### Consumer Sentiment
- **Brand Awareness**: 67% (+5% YoY)
- **Brand Consideration**: 45% (+8% YoY)
- **Brand Preference**: 28% (+3% YoY)
- **Purchase Intent**: 22% (+6% YoY)

#### Competitive Landscape
| Competitor | Market Share | Change | Threat Level |
|------------|-------------|--------|--------------|
| Market Leader | 18.2% | -0.5pp | Low |
| Competitor B | 10.8% | +0.8pp | Medium |
| Competitor C | 8.4% | +0.3pp | Low |
| Emerging Players | 6.2% | +1.2pp | Watch |

---

### Regional Performance

#### Top Performing Markets
1. **United Kingdom** (+18% YoY) - Sustainability messaging resonating
2. **Germany** (+15% YoY) - Quality positioning effective
3. **Brazil** (+22% YoY) - Digital-first strategy succeeding

#### Markets Requiring Attention
1. **Japan** (-3% YoY) - Cultural adaptation needed
2. **France** (+2% YoY) - Below expectations

---

### Recommendations

**Immediate Actions (0-30 days)**
1. Double down on UK market momentum
2. Launch Japan market research initiative
3. Optimize France messaging strategy

**Strategic Initiatives (30-90 days)**
1. Expand sustainability product line
2. Develop Gen Z targeted campaign
3. Implement loyalty program enhancements

---

### Appendix
- Full data tables available in supplementary materials
- Methodology documentation in Section A
- Statistical significance tests in Section B

*Report generated by ${agentName || 'Reporting Agent'} | Confidence: High | Next Update: Q1 2025*`

    const outputBlocks: Array<{ id: string; type: string; title: string; content: Record<string, unknown> }> = [
      {
        id: `table-${Date.now()}`,
        type: 'table',
        title: 'Q4 2024 KPI Dashboard',
        content: {
          headers: ['KPI', 'Current', 'Target', 'Variance', 'Status'],
          rows: [
            ['Market Share', '12.4%', '12.0%', '+0.4pp', '✅'],
            ['Customer Growth', '+13.3%', '+10%', '+3.3pp', '✅'],
            ['Retention Rate', '78%', '75%', '+3pp', '✅'],
            ['NPS Score', '+42', '+40', '+2pts', '✅'],
            ['Revenue/User', '$87', '$90', '-$3', '⚠️'],
          ],
        },
      },
      {
        id: `chart-${Date.now() + 1}`,
        type: 'chart',
        title: 'Regional Performance Comparison',
        content: {
          chartType: 'bar',
          categories: ['UK', 'Germany', 'Brazil', 'US', 'Japan', 'France'],
          series: [
            { name: 'YoY Growth', data: [18, 15, 22, 12, -3, 2], color: '#3b82f6' },
            { name: 'Target', data: [15, 12, 18, 15, 8, 10], color: '#94a3b8' },
          ],
        },
      },
    ]

    return { response, outputBlocks }
  },

  MONITORING: (_query: string, agentName?: string) => {
    const response = `## Real-Time Monitoring Dashboard${agentName ? ` from ${agentName}` : ''}

### System Status: 🟢 All Systems Operational

---

### Live Metrics (Last Updated: ${new Date().toLocaleTimeString()})

#### Traffic & Engagement
| Metric | Current | Baseline | Change | Alert |
|--------|---------|----------|--------|-------|
| Active Users | 24,847 | 22,100 | +12.4% | 🟢 |
| Sessions/Hour | 3,421 | 3,200 | +6.9% | 🟢 |
| Avg. Session Duration | 4:32 | 4:15 | +6.7% | 🟢 |
| Bounce Rate | 38.2% | 40.0% | -1.8pp | 🟢 |
| Conversion Rate | 3.2% | 2.8% | +0.4pp | 🟢 |

#### Performance Indicators
| System | Status | Latency | Uptime |
|--------|--------|---------|--------|
| API Gateway | 🟢 Healthy | 45ms | 99.98% |
| Database | 🟢 Healthy | 12ms | 99.99% |
| Cache Layer | 🟢 Healthy | 2ms | 99.99% |
| CDN | 🟢 Healthy | 18ms | 99.97% |
| ML Pipeline | 🟢 Healthy | 156ms | 99.95% |

---

### Anomaly Detection

#### Recent Alerts (Last 24h)
| Time | Severity | Alert | Status |
|------|----------|-------|--------|
| 14:23 | ⚠️ Warning | Traffic spike +45% | Resolved |
| 09:15 | 🔵 Info | New market segment detected | Monitoring |
| 03:42 | ⚠️ Warning | Latency threshold exceeded | Resolved |

#### Trend Anomalies Detected
1. **Positive**: Unusual engagement spike from mobile users (+28%)
2. **Neutral**: Shift in peak usage hours (2hr earlier than typical)
3. **Monitor**: Slight increase in API error rate (0.1% → 0.15%)

---

### Consumer Behavior Signals

#### Trending Topics (Real-Time)
1. 🔥 "Sustainable packaging" - Mentions up 340%
2. 📈 "Price comparison" - Searches up 89%
3. 🆕 "New product launch" - Interest spike detected
4. 📊 "Brand reviews" - Sentiment trending positive

#### Sentiment Analysis
- **Overall Sentiment**: 72% Positive (+4% from yesterday)
- **Social Mentions**: 12,847 (last 24h)
- **Sentiment Velocity**: Improving

---

### Automated Actions Triggered

| Action | Trigger | Time | Result |
|--------|---------|------|--------|
| Scale API instances | Traffic >120% baseline | 14:23 | ✅ Success |
| Alert stakeholders | Sentiment drop >5% | N/A | Not triggered |
| Cache refresh | Staleness >1hr | 10:00 | ✅ Success |
| Report generation | Daily schedule | 06:00 | ✅ Success |

---

### Monitoring Configuration
- **Refresh Rate**: Real-time (5s intervals)
- **Alert Threshold**: Configurable per metric
- **Data Retention**: 90 days
- **Escalation**: Auto-notify on critical alerts

*Monitoring provided by ${agentName || 'Monitoring Agent'} | Status: Active | Coverage: Full*`

    const outputBlocks: Array<{ id: string; type: string; title: string; content: Record<string, unknown> }> = [
      {
        id: `chart-${Date.now()}`,
        type: 'chart',
        title: 'Real-Time Traffic Monitor',
        content: {
          chartType: 'bar',
          categories: ['06:00', '09:00', '12:00', '15:00', '18:00', 'Now'],
          series: [
            { name: 'Active Users', data: [8200, 18500, 22100, 24847, 21300, 24847], color: '#3b82f6' },
            { name: 'Baseline', data: [8000, 18000, 22000, 22000, 20000, 22000], color: '#94a3b8' },
          ],
        },
      },
      {
        id: `table-${Date.now() + 1}`,
        type: 'table',
        title: 'System Health Status',
        content: {
          headers: ['System', 'Status', 'Latency', 'Uptime', 'Last Check'],
          rows: [
            ['API Gateway', '🟢 Healthy', '45ms', '99.98%', 'Just now'],
            ['Database', '🟢 Healthy', '12ms', '99.99%', 'Just now'],
            ['Cache Layer', '🟢 Healthy', '2ms', '99.99%', 'Just now'],
            ['ML Pipeline', '🟢 Healthy', '156ms', '99.95%', 'Just now'],
          ],
        },
      },
    ]

    return { response, outputBlocks }
  },

  CUSTOM: (query: string, agentName?: string) => {
    const lowerQuery = query.toLowerCase()

    let response = `## Analysis Results${agentName ? ` from ${agentName}` : ''}

Thank you for your query. I've analyzed the available data and prepared the following insights:

### Query Understanding
I interpreted your request as: "${query}"

### Analysis Approach
1. **Data Collection**: Gathered relevant consumer data from GWI Core
2. **Pattern Recognition**: Identified key behavioral and demographic patterns
3. **Insight Generation**: Synthesized findings into actionable insights
4. **Visualization**: Prepared supporting charts and tables

### Key Findings

`

    if (lowerQuery.includes('audience') || lowerQuery.includes('consumer') || lowerQuery.includes('customer')) {
      response += `#### Audience Overview
- **Primary Segment**: 25-44 year olds, urban, digitally-engaged
- **Segment Size**: Approximately 340M consumers globally
- **Growth Rate**: +12% YoY
- **Digital Penetration**: 82%

#### Behavioral Characteristics
| Behavior | Prevalence | Trend |
|----------|-----------|-------|
| Mobile-first shopping | 78% | ↑ +15% |
| Social media discovery | 67% | ↑ +22% |
| Review-based decisions | 72% | ↑ +8% |
| Sustainability preference | 64% | ↑ +18% |

`
    }

    if (lowerQuery.includes('trend') || lowerQuery.includes('insight') || lowerQuery.includes('pattern')) {
      response += `#### Emerging Trends
1. **Digital-First Engagement** (Confidence: 94%)
   - Consumers expect seamless omnichannel experiences
   - Mobile transactions now exceed desktop in most markets

2. **Values-Based Purchasing** (Confidence: 89%)
   - 64% consider brand values before purchasing
   - Authenticity and transparency are key differentiators

3. **Community-Driven Discovery** (Confidence: 87%)
   - Peer recommendations outweigh traditional advertising
   - Micro-communities driving niche product success

`
    }

    if (lowerQuery.includes('recommend') || lowerQuery.includes('strategy') || lowerQuery.includes('action')) {
      response += `#### Strategic Recommendations

**Quick Wins (0-30 days)**
1. Optimize mobile experience - 78% of target audience is mobile-first
2. Enhance review visibility - Reviews influence 72% of purchase decisions
3. Amplify social proof - User-generated content drives +28% engagement

**Medium-Term (30-90 days)**
1. Develop community engagement program
2. Launch values-based content campaign
3. Implement personalization at scale

**Long-Term (90+ days)**
1. Build sustainable product line extensions
2. Expand into adjacent market segments
3. Develop loyalty and retention program

`
    }

    response += `### Data Quality & Confidence
- **Sample Size**: 2.8M+ respondents
- **Geographic Coverage**: 52 markets
- **Data Recency**: Q4 2024
- **Confidence Level**: High (95% CI)

### Next Steps
Would you like me to:
1. Dive deeper into any specific finding?
2. Generate additional visualizations?
3. Compare with different segments or markets?
4. Export this analysis for presentation?

*Analysis generated by ${agentName || 'Custom Agent'} | Query processed successfully*`

    const outputBlocks: Array<{ id: string; type: string; title: string; content: Record<string, unknown> }> = [
      {
        id: `chart-${Date.now()}`,
        type: 'chart',
        title: 'Consumer Behavior Trends',
        content: {
          chartType: 'bar',
          categories: ['Mobile Shopping', 'Social Discovery', 'Review-Based', 'Sustainability'],
          series: [
            { name: 'Current', data: [78, 67, 72, 64], color: '#8b5cf6' },
            { name: 'Previous Year', data: [63, 45, 64, 46], color: '#94a3b8' },
          ],
        },
      },
      {
        id: `table-${Date.now() + 1}`,
        type: 'table',
        title: 'Segment Analysis Summary',
        content: {
          headers: ['Metric', 'Value', 'Benchmark', 'Index'],
          rows: [
            ['Segment Size', '340M', '280M avg', '121'],
            ['Growth Rate', '+12%', '+8% avg', '150'],
            ['Digital Engagement', '82%', '74% avg', '111'],
            ['Purchase Intent', '45%', '38% avg', '118'],
          ],
        },
      },
    ]

    return { response, outputBlocks }
  },
}

// Generate mock response based on agent configuration
function generateAgentResponse(
  agentId: string,
  query: string,
  agentConfig?: { name: string; description?: string | null; type: string },
) {
  // Determine agent type - check custom agent first, then built-in agents
  let agentType = agentConfig?.type || 'CUSTOM'
  let agentName = agentConfig?.name

  // If it's a built-in playground agent, map to appropriate type
  const builtInAgentTypes: Record<string, string> = {
    'audience-explorer': 'RESEARCH',
    'persona-architect': 'RESEARCH',
    'motivation-decoder': 'ANALYSIS',
    'culture-tracker': 'MONITORING',
    'brand-analyst': 'ANALYSIS',
    'global-perspective': 'RESEARCH',
  }

  if (!agentConfig && builtInAgentTypes[agentId]) {
    agentType = builtInAgentTypes[agentId]
    agentName = agentKnowledge[agentId]?.capabilities.join(', ')
  }

  // Get response generator for the agent type
  const responseGenerator = agentTypeResponses[agentType] || agentTypeResponses.CUSTOM
  const { response, outputBlocks } = responseGenerator(query, agentName)

  // Generate citations
  const citations = [
    {
      id: '1',
      source: 'GWI Core Q4 2024',
      confidence: 94,
      type: 'survey',
      excerpt: 'Consumer insights from 2.8M respondents across 52 markets',
      date: '2024-12-15',
      title: 'Global Consumer Survey Q4 2024'
    },
    {
      id: '2',
      source: 'GWI Zeitgeist',
      confidence: 89,
      type: 'trend',
      excerpt: 'Real-time trend tracking and cultural signal detection',
      date: '2025-01-10',
      title: 'Zeitgeist Trend Report January 2025'
    },
    {
      id: '3',
      source: 'GWI USA',
      confidence: 91,
      type: 'report',
      excerpt: 'Deep-dive US consumer behavior and market dynamics',
      date: '2024-11-28',
      title: 'US Market Intelligence Report'
    },
  ]

  return {
    response,
    citations,
    outputBlocks
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgId = await getValidatedOrgId(request, session.user.id)
    if (!orgId) {
      return NextResponse.json({ error: 'No organization found or access denied' }, { status: 404 })
    }

    const membership = await getUserMembership(session.user.id, orgId)
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    if (!hasPermission(membership.role, 'agents:execute')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const body = await request.json()
    const validationResult = chatRequestSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { message, agentId, context, config } = validationResult.data

    // Fetch custom agent if ID provided and not a built-in agent
    let customAgent = null
    if (agentId && !agentKnowledge[agentId]) {
      customAgent = await prisma.agent.findFirst({
        where: { id: agentId, orgId },
      })
    }

    // Generate mock response based on agent configuration
    const { response, citations, outputBlocks } = generateAgentResponse(
      agentId || 'audience-explorer',
      message,
      customAgent ? { name: customAgent.name, description: customAgent.description, type: customAgent.type } : undefined
    )

    // Create agent run record if using custom agent
    if (customAgent) {
      await prisma.agentRun.create({
        data: {
          agentId: customAgent.id,
          orgId,
          input: { message, context } as Prisma.InputJsonValue,
          output: { response, citations } as Prisma.InputJsonValue,
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      })
    }

    // Store conversation in memory if enabled
    if (config?.enableMemory) {
      await prisma.memory.create({
        data: {
          orgId,
          agentId: agentId || null,
          type: 'CONVERSATION',
          key: `chat-${Date.now()}`,
          value: { message, response: response.substring(0, 500) } as Prisma.InputJsonValue,
          metadata: { userId: session.user.id } as Prisma.InputJsonValue,
        },
      }).catch(console.error) // Don't fail the request if memory save fails
    }

    recordUsage(orgId, 'API_CALLS', 1).catch(console.error)
    recordUsage(orgId, 'TOKENS_CONSUMED', response.length).catch(console.error)

    return NextResponse.json({
      data: {
        response,
        citations: config?.enableCitations !== false ? citations : undefined,
        outputBlocks,
        metadata: {
          agentId: agentId || 'audience-explorer',
          processingTime: Math.floor(Math.random() * 500) + 200,
          tokensUsed: response.length,
        },
      },
    })
  } catch (error) {
    console.error('Error processing chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
