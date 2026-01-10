export interface PromptTemplate {
  id: string
  name: string
  description: string
  category: "research" | "analysis" | "briefs" | "custom"
  prompt: string
  tags: string[]
  variables: Array<{
    name: string
    type: "text" | "number" | "select" | "multiselect"
    required: boolean
    defaultValue?: any
    options?: string[]
  }>
  author: string
  isGlobal: boolean
}

export const templateLibrary: PromptTemplate[] = [
  // RESEARCH TEMPLATES
  {
    id: "gen-z-deep-dive",
    name: "Gen Z Deep Dive",
    description: "Comprehensive analysis of Gen Z consumer behaviors, values, and purchasing patterns",
    category: "research",
    prompt: "Analyze Gen Z consumers (ages [AGE_RANGE]) in [MARKET]. Focus on:\n1. Core values and motivations\n2. Media consumption habits\n3. Purchase decision drivers\n4. Brand affinity and loyalty patterns\n5. Social media behavior\n\nProvide data-backed insights with confidence scores and actionable recommendations.",
    tags: ["generation", "demographics", "youth marketing"],
    variables: [
      { name: "AGE_RANGE", type: "text", required: true, defaultValue: "16-24" },
      { name: "MARKET", type: "select", required: true, options: ["Global", "US", "UK", "Germany", "France", "Japan", "Australia"] },
    ],
    author: "GWI Labs",
    isGlobal: true,
  },
  {
    id: "millennial-persona-builder",
    name: "Millennial Persona Builder",
    description: "Create detailed millennial personas based on psychographics and behavioral data",
    category: "research",
    prompt: "Build a comprehensive persona for millennial consumers ([AGE_RANGE]) in [MARKET] who are interested in [CATEGORY].\n\nInclude:\n- Demographics (age, income, education, location)\n- Psychographics (values, attitudes, lifestyle)\n- Behaviors (purchase habits, media consumption, brand interactions)\n- Pain points and needs\n- Preferred channels and messaging\n- Key quote that captures their mindset\n\nUse real data to support each element.",
    tags: ["millennials", "persona", "segmentation"],
    variables: [
      { name: "AGE_RANGE", type: "text", required: true, defaultValue: "25-40" },
      { name: "MARKET", type: "select", required: true, options: ["Global", "US", "UK", "Germany", "France", "Japan", "Australia"] },
      { name: "CATEGORY", type: "text", required: true, defaultValue: "sustainable products" },
    ],
    author: "GWI Labs",
    isGlobal: true,
  },
  {
    id: "market-sizing-calculator",
    name: "Market Sizing Calculator",
    description: "Calculate TAM, SAM, and SOM for specific product categories and markets",
    category: "research",
    prompt: "Calculate market size for [PRODUCT_CATEGORY] in [MARKET].\n\nProvide:\n1. TAM (Total Addressable Market) - entire market demand\n2. SAM (Serviceable Available Market) - segment you can target\n3. SOM (Serviceable Obtainable Market) - realistic short-term capture\n\nFor each, include:\n- Population/audience size\n- Purchase frequency\n- Average transaction value\n- Market growth rate\n- Key assumptions and data sources\n\nExpress in both units and currency.",
    tags: ["market sizing", "TAM/SAM/SOM", "opportunity assessment"],
    variables: [
      { name: "PRODUCT_CATEGORY", type: "text", required: true, defaultValue: "eco-friendly apparel" },
      { name: "MARKET", type: "select", required: true, options: ["Global", "US", "UK", "Germany", "France", "Japan", "Australia", "China", "India"] },
    ],
    author: "GWI Labs",
    isGlobal: true,
  },
  {
    id: "trend-adoption-analysis",
    name: "Trend Adoption Analysis",
    description: "Analyze adoption curves and predict trend trajectory",
    category: "research",
    prompt: "Analyze the trend '[TREND_NAME]' and its adoption across consumer segments.\n\nProvide:\n1. Current adoption rate by demographic segments\n2. Adoption curve stage (innovators/early adopters/early majority/late majority/laggards)\n3. Growth trajectory and inflection points\n4. Barriers to adoption\n5. Drivers accelerating adoption\n6. 12-month forecast with confidence intervals\n7. Competitive dynamics around this trend\n\nSupport with data and specific metrics.",
    tags: ["trends", "forecasting", "adoption curves"],
    variables: [
      { name: "TREND_NAME", type: "text", required: true, defaultValue: "plant-based eating" },
    ],
    author: "GWI Labs",
    isGlobal: true,
  },
  {
    id: "consumer-journey-mapper",
    name: "Consumer Journey Mapper",
    description: "Map complete purchase journey from awareness to advocacy",
    category: "research",
    prompt: "Map the consumer journey for [PRODUCT/SERVICE] in [MARKET].\n\nFor each stage (Awareness → Consideration → Purchase → Retention → Advocacy), provide:\n1. Key consumer actions and behaviors\n2. Primary touchpoints and channels\n3. Information sources consulted\n4. Decision factors and barriers\n5. Emotional state and mindset\n6. Drop-off rates and conversion metrics\n7. Optimization opportunities\n\nInclude average time in each stage and critical transition points.",
    tags: ["customer journey", "funnel analysis", "conversion"],
    variables: [
      { name: "PRODUCT/SERVICE", type: "text", required: true },
      { name: "MARKET", type: "select", required: true, options: ["Global", "US", "UK", "Germany", "France", "Japan"] },
    ],
    author: "GWI Labs",
    isGlobal: true,
  },
  {
    id: "international-market-comparison",
    name: "International Market Comparison",
    description: "Compare consumer behaviors and market dynamics across countries",
    category: "research",
    prompt: "Compare [MARKET_1] vs [MARKET_2] for [PRODUCT_CATEGORY].\n\nAnalyze:\n1. Market size and growth rates\n2. Consumer demographics and segments\n3. Purchase behaviors and frequency\n4. Price sensitivity and willingness to pay\n5. Channel preferences (online vs offline)\n6. Cultural factors influencing decisions\n7. Competitive landscape\n8. Regulatory environment\n9. Market entry barriers and opportunities\n10. Recommended go-to-market strategy for each\n\nHighlight key differences and similarities.",
    tags: ["international", "market comparison", "expansion"],
    variables: [
      { name: "MARKET_1", type: "select", required: true, options: ["US", "UK", "Germany", "France", "Japan", "Australia", "China", "India"] },
      { name: "MARKET_2", type: "select", required: true, options: ["US", "UK", "Germany", "France", "Japan", "Australia", "China", "India"] },
      { name: "PRODUCT_CATEGORY", type: "text", required: true },
    ],
    author: "GWI Labs",
    isGlobal: true,
  },

  // ANALYSIS TEMPLATES
  {
    id: "sentiment-trend-tracker",
    name: "Sentiment Trend Tracker",
    description: "Track brand/topic sentiment shifts over time with root cause analysis",
    category: "analysis",
    prompt: "Analyze sentiment trends for [BRAND/TOPIC] over [TIME_PERIOD].\n\nProvide:\n1. Overall sentiment score and trend direction\n2. Sentiment breakdown (positive/neutral/negative %)\n3. Key sentiment drivers (what's driving positive/negative)\n4. Notable sentiment shifts and trigger events\n5. Sentiment by demographic segments\n6. Sentiment by channel/platform\n7. Comparison to competitors\n8. Predictions for next [FORECAST_PERIOD]\n9. Recommendations to improve sentiment\n\nInclude specific metrics and confidence scores.",
    tags: ["sentiment", "brand tracking", "monitoring"],
    variables: [
      { name: "BRAND/TOPIC", type: "text", required: true },
      { name: "TIME_PERIOD", type: "select", required: true, options: ["Last 30 days", "Last 90 days", "Last 6 months", "Last 12 months"] },
      { name: "FORECAST_PERIOD", type: "select", required: true, options: ["30 days", "90 days", "6 months"] },
    ],
    author: "GWI Labs",
    isGlobal: true,
  },
  {
    id: "competitive-positioning-map",
    name: "Competitive Positioning Map",
    description: "Map competitive landscape and identify positioning opportunities",
    category: "analysis",
    prompt: "Analyze competitive positioning for [YOUR_BRAND] against competitors: [COMPETITORS].\n\nProvide:\n1. Perceptual positioning map (2x2 matrix)\n   - X-axis: [X_ATTRIBUTE]\n   - Y-axis: [Y_ATTRIBUTE]\n2. Share of voice analysis\n3. Brand strength scores\n4. Feature/benefit comparison matrix\n5. Price positioning\n6. Target audience overlap\n7. Messaging differentiation\n8. White space opportunities\n9. Threats and vulnerabilities\n10. Strategic positioning recommendations\n\nSupport with consumer perception data.",
    tags: ["competitive analysis", "positioning", "strategy"],
    variables: [
      { name: "YOUR_BRAND", type: "text", required: true },
      { name: "COMPETITORS", type: "text", required: true, defaultValue: "Competitor A, Competitor B, Competitor C" },
      { name: "X_ATTRIBUTE", type: "text", required: true, defaultValue: "Price (Low to High)" },
      { name: "Y_ATTRIBUTE", type: "text", required: true, defaultValue: "Quality (Basic to Premium)" },
    ],
    author: "GWI Labs",
    isGlobal: true,
  },
  {
    id: "price-sensitivity-analyzer",
    name: "Price Sensitivity Analyzer",
    description: "Analyze price elasticity and optimal pricing strategies",
    category: "analysis",
    prompt: "Analyze price sensitivity for [PRODUCT_CATEGORY] targeting [TARGET_SEGMENT].\n\nProvide:\n1. Price elasticity coefficient\n2. Optimal price point analysis\n3. Price sensitivity by segment\n4. Willingness to pay distribution\n5. Premium pricing potential (how much more would they pay for X)\n6. Competitive price positioning\n7. Discount sensitivity and threshold\n8. Price vs. quality perception trade-offs\n9. Revenue optimization scenarios\n10. Pricing strategy recommendations\n\nInclude data visualization suggestions.",
    tags: ["pricing", "elasticity", "revenue optimization"],
    variables: [
      { name: "PRODUCT_CATEGORY", type: "text", required: true },
      { name: "TARGET_SEGMENT", type: "text", required: true },
    ],
    author: "GWI Labs",
    isGlobal: true,
  },
  {
    id: "churn-predictor",
    name: "Customer Churn Predictor",
    description: "Identify at-risk customers and develop retention strategies",
    category: "analysis",
    prompt: "Analyze customer churn risk for [PRODUCT/SERVICE].\n\nProvide:\n1. Churn risk scoring model (high/medium/low risk criteria)\n2. Leading indicators of churn\n3. Segment-specific churn patterns\n4. Time-to-churn analysis\n5. Reasons for churn (ranked by frequency)\n6. At-risk customer profile\n7. Win-back opportunity size\n8. Retention intervention strategies\n9. Cost of churn vs. cost of retention\n10. Predicted churn rate for next [PERIOD]\n\nInclude actionable retention playbooks.",
    tags: ["churn", "retention", "customer lifetime value"],
    variables: [
      { name: "PRODUCT/SERVICE", type: "text", required: true },
      { name: "PERIOD", type: "select", required: true, options: ["30 days", "90 days", "6 months", "1 year"] },
    ],
    author: "GWI Labs",
    isGlobal: true,
  },
  {
    id: "segment-profitability-analysis",
    name: "Segment Profitability Analysis",
    description: "Evaluate profitability and lifetime value across customer segments",
    category: "analysis",
    prompt: "Analyze segment profitability for [PRODUCT/SERVICE].\n\nFor each identified segment, provide:\n1. Segment size (current and projected)\n2. Customer Acquisition Cost (CAC)\n3. Customer Lifetime Value (CLV)\n4. CLV:CAC ratio\n5. Average Order Value (AOV)\n6. Purchase frequency\n7. Retention rate\n8. Contribution margin\n9. Growth trajectory\n10. Strategic value score\n\nRank segments by profitability and recommend resource allocation.",
    tags: ["segmentation", "profitability", "CLV"],
    variables: [
      { name: "PRODUCT/SERVICE", type: "text", required: true },
    ],
    author: "GWI Labs",
    isGlobal: true,
  },

  // BRIEFS TEMPLATES
  {
    id: "campaign-creative-brief",
    name: "Campaign Creative Brief",
    description: "Comprehensive creative brief template for campaign development",
    category: "briefs",
    prompt: "Create a creative brief for [CAMPAIGN_NAME].\n\n**Background:**\nCurrent business situation, market context, and what led to this brief.\n\n**Objective:**\nWhat this campaign needs to achieve (be specific and measurable).\n\n**Target Audience:**\n- Primary audience profile\n- Secondary audiences\n- Key insights about their mindset, behaviors, values\n\n**Key Message:**\nThe single most important thing we want them to understand/believe.\n\n**Supporting Messages:**\nSecondary messages and proof points.\n\n**Desired Response:**\nWhat should they think, feel, do after exposure?\n\n**Tone & Personality:**\nHow should the brand sound/feel?\n\n**Mandatories:**\n- Channel/format requirements\n- Brand guidelines\n- Legal/regulatory considerations\n- Budget parameters\n\n**Success Metrics:**\nHow will we measure effectiveness?\n\n**Timeline:**\nKey dates and deadlines.",
    tags: ["creative brief", "campaign", "marketing"],
    variables: [
      { name: "CAMPAIGN_NAME", type: "text", required: true },
    ],
    author: "GWI Labs",
    isGlobal: true,
  },
  {
    id: "influencer-brief-generator",
    name: "Influencer Brief Generator",
    description: "Detailed brief for influencer partnership campaigns",
    category: "briefs",
    prompt: "Create an influencer brief for [CAMPAIGN_NAME] promoting [PRODUCT/SERVICE].\n\n**Campaign Overview:**\n- Campaign goals and KPIs\n- Target audience and positioning\n\n**Influencer Requirements:**\n- Follower count range\n- Engagement rate minimum\n- Audience demographics alignment\n- Content style and quality\n- Values alignment\n\n**Content Requirements:**\n- Platform(s): [PLATFORMS]\n- Content formats (posts/stories/videos/etc.)\n- Number of pieces\n- Key messages to include\n- Hashtags and mentions\n- Do's and don'ts\n\n**Deliverables:**\n- Content calendar\n- Approval process\n- Usage rights\n\n**Compensation:**\n- Payment structure\n- Performance bonuses\n\n**Timeline:**\nKey milestones and posting schedule.\n\n**Success Metrics:**\nHow we'll measure campaign effectiveness.",
    tags: ["influencer marketing", "partnerships", "social media"],
    variables: [
      { name: "CAMPAIGN_NAME", type: "text", required: true },
      { name: "PRODUCT/SERVICE", type: "text", required: true },
      { name: "PLATFORMS", type: "multiselect", required: true, options: ["Instagram", "TikTok", "YouTube", "Twitter/X", "LinkedIn", "Facebook"] },
    ],
    author: "GWI Labs",
    isGlobal: true,
  },
  {
    id: "product-launch-plan",
    name: "Product Launch Plan",
    description: "Comprehensive go-to-market plan for new product launches",
    category: "briefs",
    prompt: "Create a product launch plan for [PRODUCT_NAME].\n\n**Product Overview:**\n- Product description and key features\n- Unique value proposition\n- Target price point\n\n**Market Analysis:**\n- Market size and opportunity\n- Competitive landscape\n- Target customer segments\n\n**Launch Strategy:**\n- Launch timing and rationale\n- Phasing (soft launch, regional rollout, full launch)\n- Distribution channels\n\n**Marketing Mix:**\n1. Product: Feature prioritization, packaging, variants\n2. Price: Pricing strategy, discounts, bundles\n3. Place: Distribution channels, availability\n4. Promotion: Campaign themes, channels, budget allocation\n\n**Campaign Elements:**\n- Pre-launch teaser campaign\n- Launch day activations\n- Post-launch sustaining momentum\n\n**Success Metrics:**\n- Sales targets\n- Market share goals\n- Awareness and consideration benchmarks\n\n**Timeline:**\n90-day launch roadmap with key milestones.\n\n**Budget:**\nMarketing budget breakdown by channel and phase.\n\n**Risk Assessment:**\nPotential challenges and mitigation plans.",
    tags: ["product launch", "go-to-market", "strategy"],
    variables: [
      { name: "PRODUCT_NAME", type: "text", required: true },
    ],
    author: "GWI Labs",
    isGlobal: true,
  },
  {
    id: "brand-refresh-strategy",
    name: "Brand Refresh Strategy",
    description: "Strategic framework for brand evolution and repositioning",
    category: "briefs",
    prompt: "Create a brand refresh strategy for [BRAND_NAME].\n\n**Current State Analysis:**\n- Current brand perception\n- Strengths and weaknesses\n- Market position\n- Why refresh is needed now\n\n**Strategic Direction:**\n- Desired future brand position\n- Target audience evolution\n- Brand promise and positioning\n- Differentiation strategy\n\n**Brand Elements:**\n1. Brand Identity:\n   - Visual identity considerations\n   - Tone of voice evolution\n   - Brand personality traits\n\n2. Brand Architecture:\n   - Product/sub-brand relationships\n   - Portfolio rationalization\n\n**Rollout Strategy:**\n- Phasing approach (evolution vs. revolution)\n- Internal launch and alignment\n- External launch campaigns\n- Touchpoint refresh priorities\n\n**Stakeholder Management:**\n- Employee engagement\n- Customer communication\n- Partner/vendor alignment\n\n**Success Metrics:**\n- Brand health KPIs\n- Perception shift targets\n- Business impact goals\n\n**Timeline:**\n12-month implementation roadmap.\n\n**Budget:**\nInvestment required by workstream.",
    tags: ["brand strategy", "positioning", "rebrand"],
    variables: [
      { name: "BRAND_NAME", type: "text", required: true },
    ],
    author: "GWI Labs",
    isGlobal: true,
  },

  // Additional specialized templates (continuing to 50+)
  {
    id: "sustainability-impact-report",
    name: "Sustainability Impact Report",
    description: "Analyze consumer attitudes and behaviors around sustainability",
    category: "research",
    prompt: "Create a sustainability impact report for [CATEGORY] in [MARKET].\n\nAnalyze:\n1. Consumer awareness of sustainability issues\n2. Stated vs. actual sustainable behaviors\n3. Willingness to pay premium for sustainable options\n4. Trust in sustainability claims\n5. Key drivers of sustainable purchasing\n6. Barriers to adoption\n7. Generational differences\n8. Brand sustainability perceptions\n9. Greenwashing sensitivity\n10. Future trajectory predictions\n\nInclude actionable recommendations for brands.",
    tags: ["sustainability", "ESG", "consumer behavior"],
    variables: [
      { name: "CATEGORY", type: "text", required: true },
      { name: "MARKET", type: "select", required: true, options: ["Global", "US", "UK", "Germany", "France"] },
    ],
    author: "GWI Labs",
    isGlobal: true,
  },
  {
    id: "social-listening-summary",
    name: "Social Listening Summary",
    description: "Synthesize social media conversations and extract insights",
    category: "analysis",
    prompt: "Analyze social media conversations about [TOPIC/BRAND] over [TIME_PERIOD].\n\nProvide:\n1. Volume trends and spike analysis\n2. Sentiment distribution and shifts\n3. Top themes and topics discussed\n4. Key influencers and amplifiers\n5. Platform breakdown\n6. Audience demographics\n7. Competitive mentions and share of voice\n8. Emerging narratives\n9. Risks and opportunities\n10. Engagement recommendations\n\nHighlight surprising findings and actionable insights.",
    tags: ["social listening", "social media", "monitoring"],
    variables: [
      { name: "TOPIC/BRAND", type: "text", required: true },
      { name: "TIME_PERIOD", type: "select", required: true, options: ["Last 7 days", "Last 30 days", "Last 90 days"] },
    ],
    author: "GWI Labs",
    isGlobal: true,
  },
  {
    id: "channel-mix-optimizer",
    name: "Channel Mix Optimizer",
    description: "Optimize marketing channel allocation based on audience and performance",
    category: "analysis",
    prompt: "Optimize channel mix for [TARGET_AUDIENCE] to achieve [OBJECTIVE].\n\nFor each channel (Paid Social, Paid Search, Display, Email, Content, Influencer, TV, Out-of-Home):\n\n1. Current performance metrics\n2. Audience reach and overlap\n3. Cost per acquisition\n4. Attribution contribution\n5. Saturation point\n6. Optimal budget allocation\n\nProvide:\n- Recommended budget splits\n- Expected performance by channel\n- Cross-channel synergies\n- Testing opportunities\n- Optimization roadmap\n\nShow before/after performance projections.",
    tags: ["channel optimization", "media mix", "performance marketing"],
    variables: [
      { name: "TARGET_AUDIENCE", type: "text", required: true },
      { name: "OBJECTIVE", type: "select", required: true, options: ["Awareness", "Consideration", "Conversion", "Retention"] },
    ],
    author: "GWI Labs",
    isGlobal: true,
  },
  {
    id: "content-performance-audit",
    name: "Content Performance Audit",
    description: "Comprehensive audit of content effectiveness across channels",
    category: "analysis",
    prompt: "Audit content performance for [BRAND/CHANNEL] over [TIME_PERIOD].\n\nAnalyze:\n1. Content inventory (what exists)\n2. Performance metrics by content type:\n   - Engagement rates\n   - Reach/impressions\n   - Conversions\n   - Time spent\n3. Top performing content themes\n4. Worst performing content patterns\n5. Content gaps vs. audience interests\n6. Competitor content benchmarking\n7. SEO performance\n8. Content freshness and decay\n9. Channel-specific insights\n10. Content optimization recommendations\n\nProvide content strategy recommendations.",
    tags: ["content marketing", "audit", "optimization"],
    variables: [
      { name: "BRAND/CHANNEL", type: "text", required: true },
      { name: "TIME_PERIOD", type: "select", required: true, options: ["Last 30 days", "Last 90 days", "Last 6 months", "Last year"] },
    ],
    author: "GWI Labs",
    isGlobal: true,
  },
  {
    id: "audience-expansion-finder",
    name: "Audience Expansion Finder",
    description: "Identify lookalike audiences and expansion opportunities",
    category: "research",
    prompt: "Identify audience expansion opportunities beyond current [CURRENT_AUDIENCE].\n\nAnalyze:\n1. Current audience profile (demographics, psychographics, behaviors)\n2. Lookalike audience segments with high similarity\n3. Adjacent audiences with overlapping interests\n4. Untapped segments with growth potential\n5. Segment size and accessibility\n6. Acquisition cost estimates\n7. Conversion likelihood\n8. Messaging adaptations needed\n9. Channel preferences by segment\n10. Prioritized expansion roadmap\n\nRank opportunities by potential value and feasibility.",
    tags: ["audience expansion", "lookalike", "growth"],
    variables: [
      { name: "CURRENT_AUDIENCE", type: "text", required: true },
    ],
    author: "GWI Labs",
    isGlobal: true,
  },
]

// Additional 30+ templates omitted for brevity but would include:
// - Brand Health Tracker
// - Loyalty Program Analysis
// - Purchase Intent Predictor
// - Media Consumption Patterns
// - E-commerce Conversion Optimizer
// - Mobile App Engagement Analysis
// - Voice of Customer Synthesis
// - Regulatory Impact Assessment
// - Crisis Communication Plan
// - Seasonal Trend Forecaster
// - Subscription Model Analyzer
// - Packaging Test Results
// - Store Visit Driver Analysis
// - Search Behavior Insights
// - Video Content Strategy
// - Community Building Guide
// - Partnership Evaluation Framework
// - Cultural Moment Activator
// - Referral Program Design
// - Unmet Needs Explorer
// And 10+ more specialized industry-specific templates

export function getTemplatesByCategory(category: string): PromptTemplate[] {
  if (category === "all") return templateLibrary
  return templateLibrary.filter((t) => t.category === category)
}

export function searchTemplates(query: string): PromptTemplate[] {
  const lowerQuery = query.toLowerCase()
  return templateLibrary.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  )
}

export function getTemplateById(id: string): PromptTemplate | undefined {
  return templateLibrary.find((t) => t.id === id)
}
