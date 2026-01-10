import {
  Target,
  TrendingUp,
  Palette,
  Sparkles,
  Megaphone,
  Users,
  Globe,
  BarChart3,
  FileText,
  ShoppingCart,
  Brain,
  type LucideIcon,
} from "lucide-react"

export interface StoreAgent {
  id: string
  name: string
  description: string
  longDescription: string
  author: string
  verified: boolean
  rating: number
  reviewCount: number
  installs: string
  category: string
  price: "Included" | "Pro" | "Enterprise"
  version: string
  lastUpdated: string
  dataSources: string[]
  capabilities: string[]
  examplePrompts: string[]
  greeting: string
  systemPrompt: string
  iconName: "target" | "trending" | "palette" | "sparkles" | "megaphone" | "users" | "globe" | "chart" | "file" | "cart" | "brain"
  color: string
  ratings: Record<number, number>
  reviews: Array<{
    id: number
    author: string
    role: string
    company: string
    rating: number
    date: string
    content: string
    helpful: number
  }>
  relatedAgents: Array<{ id: string; name: string; rating: number }>
}

export const iconMap: Record<string, LucideIcon> = {
  target: Target,
  trending: TrendingUp,
  palette: Palette,
  sparkles: Sparkles,
  megaphone: Megaphone,
  users: Users,
  globe: Globe,
  chart: BarChart3,
  file: FileText,
  cart: ShoppingCart,
  brain: Brain,
}

export const storeAgents: Record<string, StoreAgent> = {
  "audience-strategist-pro": {
    id: "audience-strategist-pro",
    name: "Audience Strategist Pro",
    description: "Advanced audience segmentation with predictive modeling and lookalike expansion",
    longDescription: `The Audience Strategist Pro agent leverages GWI's comprehensive consumer database to build rich, actionable audience profiles.

Using advanced clustering algorithms and predictive modeling, it identifies not just who your audience is, but why they behave the way they do.

Key capabilities include:
- Multi-dimensional audience segmentation
- Predictive lookalike modeling
- Cross-platform behavior analysis
- Real-time persona updates
- Competitive audience benchmarking`,
    author: "GWI Labs",
    verified: true,
    rating: 4.9,
    reviewCount: 284,
    installs: "12.4k",
    category: "Audience & Targeting",
    price: "Included",
    version: "2.4.1",
    lastUpdated: "2024-01-15",
    dataSources: ["GWI Core", "GWI USA", "GWI Zeitgeist", "Custom Uploads"],
    capabilities: [
      "Build multi-dimensional audience personas",
      "Identify lookalike audiences for expansion",
      "Analyze cross-platform behaviors",
      "Compare audiences against competitors",
      "Generate presentation-ready profiles",
      "Export segments to ad platforms",
    ],
    examplePrompts: [
      "Build a persona for millennial coffee drinkers in the UK",
      "Find lookalike audiences for our current customers",
      "Compare our target audience with Competitor X's audience",
      "What media channels does our audience use most?",
    ],
    greeting: "Hello! I'm the Audience Strategist Pro. I specialize in advanced audience segmentation with predictive modeling and lookalike expansion. I can help you build detailed, data-driven personas that go beyond demographics. What audience would you like to explore today?",
    systemPrompt: "You are the Audience Strategist Pro agent, specializing in audience segmentation and persona building using GWI consumer data. Provide data-driven insights about consumer segments, create detailed personas, and identify lookalike audiences.",
    iconName: "target",
    color: "text-blue-500",
    ratings: { 5: 78, 4: 15, 3: 5, 2: 1, 1: 1 },
    reviews: [
      { id: 1, author: "Sarah M.", role: "Senior Researcher", company: "Global Brand Co", rating: 5, date: "2024-01-10", content: "This agent has completely transformed how we build audience profiles. The depth of insight is incredible, and the time savings are substantial.", helpful: 24 },
      { id: 2, author: "James L.", role: "Strategy Director", company: "MediaCorp", rating: 5, date: "2024-01-05", content: "The lookalike modeling feature is a game-changer. We've discovered new audience segments we never would have found manually.", helpful: 18 },
      { id: 3, author: "Michelle K.", role: "Brand Manager", company: "Consumer Goods Inc", rating: 4, date: "2023-12-28", content: "Great agent overall. Would love to see more customization options for the output format, but the insights are top-notch.", helpful: 12 },
    ],
    relatedAgents: [
      { id: "consumer-journey-mapper", name: "Consumer Journey Mapper", rating: 4.7 },
      { id: "creative-intelligence", name: "Creative Intelligence", rating: 4.7 },
      { id: "purchase-intent-analyzer", name: "Purchase Intent Analyzer", rating: 4.3 },
    ],
  },
  "brand-tracker-360": {
    id: "brand-tracker-360",
    name: "Brand Tracker 360",
    description: "Comprehensive brand health monitoring with sentiment analysis and share of voice",
    longDescription: `Brand Tracker 360 provides real-time monitoring of your brand's health across global markets.

Monitor key metrics including:
- Brand awareness (aided and unaided)
- Brand consideration and preference
- Net Promoter Score (NPS) trends
- Share of voice vs competitors
- Sentiment analysis across channels

Get instant alerts when significant changes occur and track performance over time.`,
    author: "GWI Labs",
    verified: true,
    rating: 4.8,
    reviewCount: 156,
    installs: "8.2k",
    category: "Competitive Intel",
    price: "Included",
    version: "3.1.0",
    lastUpdated: "2024-01-12",
    dataSources: ["GWI Core", "GWI Brand Tracker", "Social Listening"],
    capabilities: [
      "Track brand awareness over time",
      "Monitor share of voice vs competitors",
      "Analyze brand sentiment by segment",
      "Set up automated alerts for changes",
      "Generate executive dashboards",
      "Compare performance across markets",
    ],
    examplePrompts: [
      "How has our brand awareness changed this quarter?",
      "Compare our NPS to our top 3 competitors",
      "What's driving negative sentiment about our brand?",
      "Which demographics have the highest brand affinity?",
    ],
    greeting: "Hi! I'm Brand Tracker 360. I provide comprehensive brand health monitoring with sentiment analysis and share of voice tracking. I can help you understand how your brand is performing and how it compares to competitors. What would you like to know about your brand?",
    systemPrompt: "You are Brand Tracker 360, specializing in brand health monitoring, sentiment analysis, and competitive benchmarking. Provide insights on brand awareness, NPS, share of voice, and brand perception using GWI data.",
    iconName: "trending",
    color: "text-emerald-500",
    ratings: { 5: 72, 4: 18, 3: 7, 2: 2, 1: 1 },
    reviews: [
      { id: 1, author: "David R.", role: "Brand Director", company: "Tech Corp", rating: 5, date: "2024-01-08", content: "Essential for any brand team. The competitive benchmarking alone is worth it.", helpful: 31 },
      { id: 2, author: "Emily S.", role: "Marketing VP", company: "Retail Giants", rating: 5, date: "2024-01-02", content: "Finally, real-time brand tracking without the manual work. Love the automated alerts.", helpful: 22 },
    ],
    relatedAgents: [
      { id: "competitive-radar", name: "Competitive Radar", rating: 4.6 },
      { id: "audience-strategist-pro", name: "Audience Strategist Pro", rating: 4.9 },
      { id: "insight-summarizer", name: "Insight Summarizer", rating: 4.8 },
    ],
  },
  "creative-intelligence": {
    id: "creative-intelligence",
    name: "Creative Intelligence",
    description: "AI-powered creative brief generation with audience-matched messaging strategies",
    longDescription: `Creative Intelligence transforms consumer insights into actionable creative direction.

This agent helps creative teams by:
- Generating data-backed creative briefs
- Identifying resonant messaging for target audiences
- Recommending visual and tonal directions
- Testing creative concepts against audience data
- Benchmarking against successful campaigns

Bridge the gap between research and creative execution.`,
    author: "GWI Labs",
    verified: true,
    rating: 4.7,
    reviewCount: 203,
    installs: "9.8k",
    category: "Creative & Content",
    price: "Included",
    version: "2.2.0",
    lastUpdated: "2024-01-10",
    dataSources: ["GWI Core", "GWI Zeitgeist", "Campaign Benchmarks"],
    capabilities: [
      "Generate audience-informed creative briefs",
      "Develop messaging strategies by segment",
      "Recommend visual direction and tone",
      "Test concepts against target audience data",
      "Benchmark against successful campaigns",
      "Export to creative tools",
    ],
    examplePrompts: [
      "Create a creative brief for Gen Z sustainability campaign",
      "What messaging resonates with health-conscious millennials?",
      "Recommend visual direction for luxury automotive audience",
      "How should we position our product for price-sensitive consumers?",
    ],
    greeting: "Hello! I'm Creative Intelligence. I transform consumer insights into actionable creative direction. I can help you generate data-backed creative briefs, identify resonant messaging, and recommend visual directions. What creative challenge are you working on?",
    systemPrompt: "You are Creative Intelligence, specializing in creative brief generation and messaging strategy. Use consumer insights to provide data-backed creative direction, visual recommendations, and messaging strategies tailored to specific audiences.",
    iconName: "palette",
    color: "text-purple-500",
    ratings: { 5: 68, 4: 22, 3: 8, 2: 1, 1: 1 },
    reviews: [
      { id: 1, author: "Alex T.", role: "Creative Director", company: "Agency One", rating: 5, date: "2024-01-06", content: "This has revolutionized how we brief our creative teams. Data-driven creativity is finally accessible.", helpful: 28 },
      { id: 2, author: "Rachel M.", role: "Content Strategist", company: "Brand Co", rating: 4, date: "2023-12-30", content: "Great for getting started on briefs. Sometimes needs human refinement but saves hours of work.", helpful: 15 },
    ],
    relatedAgents: [
      { id: "audience-strategist-pro", name: "Audience Strategist Pro", rating: 4.9 },
      { id: "trend-forecaster", name: "Trend Forecaster", rating: 4.6 },
      { id: "insight-summarizer", name: "Insight Summarizer", rating: 4.8 },
    ],
  },
  "trend-forecaster": {
    id: "trend-forecaster",
    name: "Trend Forecaster",
    description: "Predict emerging consumer trends before they hit mainstream",
    longDescription: `Trend Forecaster uses advanced analytics to identify emerging consumer behaviors and cultural shifts before they become mainstream.

Capabilities include:
- Early trend identification across categories
- Cultural movement tracking
- Adoption curve prediction
- Geographic trend mapping
- Industry-specific trend alerts

Stay ahead of the curve with predictive trend intelligence.`,
    author: "GWI Labs",
    verified: true,
    rating: 4.6,
    reviewCount: 98,
    installs: "5.4k",
    category: "Trends & Insights",
    price: "Included",
    version: "1.8.0",
    lastUpdated: "2024-01-08",
    dataSources: ["GWI Zeitgeist", "GWI Core", "Cultural Pulse"],
    capabilities: [
      "Identify emerging trends early",
      "Track cultural movements and shifts",
      "Predict adoption curves",
      "Map trends by geography",
      "Set up trend alerts",
      "Generate trend reports",
    ],
    examplePrompts: [
      "What consumer trends are emerging in sustainable fashion?",
      "Predict the next big wellness trend for 2025",
      "Which Gen Z behaviors will become mainstream?",
      "Track the adoption of plant-based diets across markets",
    ],
    greeting: "Welcome! I'm the Trend Forecaster. I use advanced analytics to predict emerging consumer trends before they hit mainstream. I can help you identify cultural shifts, track adoption curves, and stay ahead of the competition. What trends would you like to explore?",
    systemPrompt: "You are the Trend Forecaster, specializing in identifying emerging consumer trends and cultural shifts. Provide predictive insights on consumer behaviors, cultural movements, and trend adoption patterns using GWI data.",
    iconName: "sparkles",
    color: "text-amber-500",
    ratings: { 5: 62, 4: 25, 3: 10, 2: 2, 1: 1 },
    reviews: [
      { id: 1, author: "Mark J.", role: "Innovation Lead", company: "Future Labs", rating: 5, date: "2024-01-04", content: "Invaluable for our innovation pipeline. We've spotted trends 12-18 months before competitors.", helpful: 19 },
    ],
    relatedAgents: [
      { id: "creative-intelligence", name: "Creative Intelligence", rating: 4.7 },
      { id: "global-market-scanner", name: "Global Market Scanner", rating: 4.4 },
      { id: "audience-strategist-pro", name: "Audience Strategist Pro", rating: 4.9 },
    ],
  },
  "media-mix-optimizer": {
    id: "media-mix-optimizer",
    name: "Media Mix Optimizer",
    description: "Data-driven media planning and channel allocation recommendations",
    longDescription: `Media Mix Optimizer helps you allocate media budgets more effectively based on real consumer behavior data.

Features include:
- Audience-based channel recommendations
- Budget allocation optimization
- Cross-channel synergy analysis
- Daypart and placement recommendations
- Competitive media benchmarking

Make every media dollar work harder.`,
    author: "GWI Labs",
    verified: true,
    rating: 4.5,
    reviewCount: 67,
    installs: "3.2k",
    category: "Media & Advertising",
    price: "Included",
    version: "2.0.0",
    lastUpdated: "2024-01-05",
    dataSources: ["GWI Core", "GWI Media", "Ad Benchmarks"],
    capabilities: [
      "Recommend optimal channel mix",
      "Analyze audience media behaviors",
      "Optimize budget allocation",
      "Identify cross-channel synergies",
      "Benchmark against competitors",
      "Generate media plans",
    ],
    examplePrompts: [
      "What's the optimal media mix for reaching Gen Z gamers?",
      "How should we allocate our $5M budget across channels?",
      "Which platforms have the best reach for our target?",
      "Compare our media strategy to competitor X",
    ],
    greeting: "Hi there! I'm the Media Mix Optimizer. I help you allocate media budgets more effectively based on real consumer behavior data. I can recommend optimal channel mixes, analyze audience media habits, and optimize your budget allocation. What media planning challenge can I help with?",
    systemPrompt: "You are the Media Mix Optimizer, specializing in media planning and channel allocation. Provide data-driven recommendations on media mix, budget allocation, and channel effectiveness based on audience behavior data.",
    iconName: "megaphone",
    color: "text-rose-500",
    ratings: { 5: 55, 4: 30, 3: 12, 2: 2, 1: 1 },
    reviews: [
      { id: 1, author: "Lisa P.", role: "Media Director", company: "Media Agency", rating: 5, date: "2024-01-02", content: "Finally, data-driven media planning. Our clients love the audience-first approach.", helpful: 14 },
    ],
    relatedAgents: [
      { id: "audience-strategist-pro", name: "Audience Strategist Pro", rating: 4.9 },
      { id: "competitive-radar", name: "Competitive Radar", rating: 4.6 },
      { id: "insight-summarizer", name: "Insight Summarizer", rating: 4.8 },
    ],
  },
  "consumer-journey-mapper": {
    id: "consumer-journey-mapper",
    name: "Consumer Journey Mapper",
    description: "Map complete customer journeys with touchpoint analysis",
    longDescription: `Consumer Journey Mapper helps you understand the complete path consumers take from awareness to purchase and beyond.

Analyze:
- Awareness and discovery touchpoints
- Consideration and research behaviors
- Purchase triggers and barriers
- Post-purchase engagement
- Loyalty and advocacy drivers

Optimize every step of the customer journey.`,
    author: "GWI Labs",
    verified: true,
    rating: 4.7,
    reviewCount: 112,
    installs: "6.1k",
    category: "Audience & Targeting",
    price: "Included",
    version: "2.1.0",
    lastUpdated: "2024-01-06",
    dataSources: ["GWI Core", "GWI Commerce", "Journey Data"],
    capabilities: [
      "Map complete customer journeys",
      "Analyze touchpoint effectiveness",
      "Identify conversion barriers",
      "Track post-purchase behavior",
      "Compare journeys by segment",
      "Generate journey visualizations",
    ],
    examplePrompts: [
      "Map the purchase journey for luxury car buyers",
      "What touchpoints matter most for B2B software?",
      "Where do customers drop off in the funnel?",
      "How does Gen Z discover new brands?",
    ],
    greeting: "Hello! I'm the Consumer Journey Mapper. I help you understand the complete path consumers take from awareness to purchase and beyond. I can map customer journeys, analyze touchpoints, and identify conversion barriers. What journey would you like to explore?",
    systemPrompt: "You are the Consumer Journey Mapper, specializing in customer journey mapping and touchpoint analysis. Provide insights on consumer paths to purchase, touchpoint effectiveness, and journey optimization using GWI data.",
    iconName: "users",
    color: "text-cyan-500",
    ratings: { 5: 65, 4: 24, 3: 8, 2: 2, 1: 1 },
    reviews: [
      { id: 1, author: "Tom H.", role: "Customer Experience Lead", company: "E-Commerce Co", rating: 5, date: "2024-01-03", content: "Game-changer for understanding our customers. The visualizations are presentation-ready.", helpful: 21 },
    ],
    relatedAgents: [
      { id: "audience-strategist-pro", name: "Audience Strategist Pro", rating: 4.9 },
      { id: "purchase-intent-analyzer", name: "Purchase Intent Analyzer", rating: 4.3 },
      { id: "brand-tracker-360", name: "Brand Tracker 360", rating: 4.8 },
    ],
  },
  "global-market-scanner": {
    id: "global-market-scanner",
    name: "Global Market Scanner",
    description: "Cross-market analysis and international expansion insights",
    longDescription: `Global Market Scanner provides deep cross-market analysis to support international expansion and global strategy.

Features include:
- Market sizing and opportunity analysis
- Consumer behavior comparison across markets
- Cultural nuance identification
- Competitive landscape by market
- Entry strategy recommendations

Go global with confidence.`,
    author: "GWI Labs",
    verified: true,
    rating: 4.4,
    reviewCount: 45,
    installs: "2.8k",
    category: "Trends & Insights",
    price: "Pro",
    version: "1.5.0",
    lastUpdated: "2024-01-01",
    dataSources: ["GWI Core", "GWI Global", "Market Intelligence"],
    capabilities: [
      "Analyze market opportunities",
      "Compare consumer behavior across markets",
      "Identify cultural nuances",
      "Map competitive landscapes",
      "Recommend market entry strategies",
      "Generate market reports",
    ],
    examplePrompts: [
      "Compare e-commerce behavior across APAC markets",
      "What are the cultural nuances for marketing in Brazil?",
      "Which European markets are best for our product?",
      "How does Gen Z differ across US, UK, and Germany?",
    ],
    greeting: "Welcome! I'm the Global Market Scanner. I provide deep cross-market analysis to support international expansion and global strategy. I can help you compare consumer behaviors across markets, identify cultural nuances, and develop market entry strategies. Which markets are you interested in?",
    systemPrompt: "You are the Global Market Scanner, specializing in cross-market analysis and international expansion insights. Provide comparative analysis of consumer behaviors across markets, cultural nuances, and market entry recommendations.",
    iconName: "globe",
    color: "text-indigo-500",
    ratings: { 5: 52, 4: 28, 3: 15, 2: 3, 1: 2 },
    reviews: [
      { id: 1, author: "Nina C.", role: "Global Strategy", company: "Multinational Corp", rating: 5, date: "2023-12-28", content: "Essential for our international expansion. Saved months of research.", helpful: 17 },
    ],
    relatedAgents: [
      { id: "trend-forecaster", name: "Trend Forecaster", rating: 4.6 },
      { id: "audience-strategist-pro", name: "Audience Strategist Pro", rating: 4.9 },
      { id: "competitive-radar", name: "Competitive Radar", rating: 4.6 },
    ],
  },
  "competitive-radar": {
    id: "competitive-radar",
    name: "Competitive Radar",
    description: "Real-time competitive monitoring with automated alerts",
    longDescription: `Competitive Radar keeps you informed about your competitors' positioning, audience overlap, and strategic moves.

Monitor:
- Competitor audience profiles
- Share of voice changes
- Positioning shifts
- New market entries
- Campaign activities

Never be surprised by a competitor again.`,
    author: "GWI Labs",
    verified: true,
    rating: 4.6,
    reviewCount: 89,
    installs: "4.7k",
    category: "Competitive Intel",
    price: "Included",
    version: "2.3.0",
    lastUpdated: "2024-01-07",
    dataSources: ["GWI Core", "GWI Brand Tracker", "Competitive Intel"],
    capabilities: [
      "Monitor competitor audiences",
      "Track share of voice changes",
      "Set up automated alerts",
      "Analyze competitive positioning",
      "Compare audience overlap",
      "Generate intel reports",
    ],
    examplePrompts: [
      "Who is our biggest competitor targeting?",
      "How much audience overlap do we have with competitor X?",
      "Alert me when a competitor enters a new market",
      "What's our share of voice in the sustainability space?",
    ],
    greeting: "Hi! I'm Competitive Radar. I keep you informed about your competitors' positioning, audience overlap, and strategic moves in real-time. I can help you monitor competitors, track share of voice changes, and set up automated alerts. What competitive intelligence do you need?",
    systemPrompt: "You are Competitive Radar, specializing in competitive intelligence and monitoring. Provide insights on competitor positioning, audience overlap, share of voice, and competitive landscape analysis using GWI data.",
    iconName: "chart",
    color: "text-orange-500",
    ratings: { 5: 60, 4: 28, 3: 9, 2: 2, 1: 1 },
    reviews: [
      { id: 1, author: "Steve B.", role: "Competitive Intel", company: "Strategy Firm", rating: 5, date: "2024-01-05", content: "The automated alerts have caught several competitor moves early. Invaluable.", helpful: 23 },
    ],
    relatedAgents: [
      { id: "brand-tracker-360", name: "Brand Tracker 360", rating: 4.8 },
      { id: "audience-strategist-pro", name: "Audience Strategist Pro", rating: 4.9 },
      { id: "trend-forecaster", name: "Trend Forecaster", rating: 4.6 },
    ],
  },
  "insight-summarizer": {
    id: "insight-summarizer",
    name: "Insight Summarizer",
    description: "Automatically summarize complex research into executive-ready insights",
    longDescription: `Insight Summarizer transforms complex research findings into clear, actionable executive summaries.

Features:
- Automatic insight extraction
- Executive summary generation
- Key finding prioritization
- Recommendation synthesis
- Multiple output formats

Turn hours of analysis into minutes.`,
    author: "GWI Labs",
    verified: true,
    rating: 4.8,
    reviewCount: 178,
    installs: "7.9k",
    category: "Reporting & Analytics",
    price: "Included",
    version: "3.0.0",
    lastUpdated: "2024-01-09",
    dataSources: ["All GWI Data", "Custom Reports"],
    capabilities: [
      "Summarize complex research",
      "Generate executive summaries",
      "Extract key insights",
      "Prioritize findings",
      "Create presentation decks",
      "Export in multiple formats",
    ],
    examplePrompts: [
      "Summarize our Q4 brand tracking results",
      "Create an executive summary of the Gen Z study",
      "What are the top 5 insights from this research?",
      "Generate a presentation on key findings",
    ],
    greeting: "Hello! I'm the Insight Summarizer. I transform complex research findings into clear, actionable executive summaries. I can help you extract key insights, generate summaries, and create presentation-ready reports. What research would you like me to summarize?",
    systemPrompt: "You are the Insight Summarizer, specializing in research summarization and insight extraction. Transform complex research findings into clear executive summaries, prioritize key findings, and generate presentation-ready reports.",
    iconName: "file",
    color: "text-teal-500",
    ratings: { 5: 75, 4: 18, 3: 5, 2: 1, 1: 1 },
    reviews: [
      { id: 1, author: "Jennifer K.", role: "Research Director", company: "Insights Co", rating: 5, date: "2024-01-08", content: "Saves me hours every week. The summaries are actually good enough to share with clients.", helpful: 32 },
    ],
    relatedAgents: [
      { id: "audience-strategist-pro", name: "Audience Strategist Pro", rating: 4.9 },
      { id: "creative-intelligence", name: "Creative Intelligence", rating: 4.7 },
      { id: "brand-tracker-360", name: "Brand Tracker 360", rating: 4.8 },
    ],
  },
  "purchase-intent-analyzer": {
    id: "purchase-intent-analyzer",
    name: "Purchase Intent Analyzer",
    description: "Predict purchase likelihood and identify high-value segments",
    longDescription: `Purchase Intent Analyzer uses behavioral data to predict which consumers are most likely to convert.

Analyze:
- Purchase intent signals
- Conversion probability scoring
- High-value segment identification
- Purchase barrier analysis
- Category-specific triggers

Focus your efforts on the highest potential customers.`,
    author: "DataMinds Inc",
    verified: true,
    rating: 4.3,
    reviewCount: 34,
    installs: "1.9k",
    category: "Audience & Targeting",
    price: "Pro",
    version: "1.2.0",
    lastUpdated: "2023-12-20",
    dataSources: ["GWI Core", "GWI Commerce", "Purchase Data"],
    capabilities: [
      "Score purchase intent",
      "Identify high-value segments",
      "Analyze purchase barriers",
      "Predict conversion probability",
      "Track intent over time",
      "Recommend targeting strategies",
    ],
    examplePrompts: [
      "Which segments have the highest purchase intent?",
      "What barriers prevent conversion in our category?",
      "Score our audience's likelihood to purchase",
      "Identify high-value prospects for targeting",
    ],
    greeting: "Hi! I'm the Purchase Intent Analyzer. I use behavioral data to predict which consumers are most likely to convert. I can help you score purchase intent, identify high-value segments, and analyze purchase barriers. What would you like to analyze?",
    systemPrompt: "You are the Purchase Intent Analyzer, specializing in purchase prediction and conversion optimization. Provide insights on purchase intent signals, conversion probability, and high-value segment identification.",
    iconName: "cart",
    color: "text-pink-500",
    ratings: { 5: 48, 4: 32, 3: 14, 2: 4, 1: 2 },
    reviews: [
      { id: 1, author: "Chris D.", role: "Performance Marketing", company: "D2C Brand", rating: 4, date: "2023-12-15", content: "Good for identifying high-intent audiences. Could use more granular scoring options.", helpful: 11 },
    ],
    relatedAgents: [
      { id: "audience-strategist-pro", name: "Audience Strategist Pro", rating: 4.9 },
      { id: "consumer-journey-mapper", name: "Consumer Journey Mapper", rating: 4.7 },
      { id: "media-mix-optimizer", name: "Media Mix Optimizer", rating: 4.5 },
    ],
  },
  "neural-persona-builder": {
    id: "neural-persona-builder",
    name: "Neural Persona Builder",
    description: "AI-generated personas with deep psychological profiling",
    longDescription: `Neural Persona Builder uses advanced AI to create detailed consumer personas that go beyond demographics into psychology and behavior prediction.

Features:
- Deep psychological profiling
- Behavioral prediction modeling
- Persona evolution tracking
- Emotional driver mapping
- Decision-making pattern analysis

Build personas that truly understand consumer psychology.`,
    author: "Cognitive AI",
    verified: false,
    rating: 4.1,
    reviewCount: 23,
    installs: "890",
    category: "Audience & Targeting",
    price: "Enterprise",
    version: "0.9.0",
    lastUpdated: "2023-12-01",
    dataSources: ["GWI Core", "Psychological Data", "Behavioral Signals"],
    capabilities: [
      "Create psychological profiles",
      "Predict consumer behaviors",
      "Map emotional drivers",
      "Analyze decision patterns",
      "Track persona evolution",
      "Generate narrative personas",
    ],
    examplePrompts: [
      "Build a psychological profile for luxury buyers",
      "What emotionally drives our target audience?",
      "Predict how this persona will respond to our messaging",
      "What decision-making patterns define our audience?",
    ],
    greeting: "Welcome! I'm the Neural Persona Builder. I use advanced AI to create detailed consumer personas with deep psychological profiling. I can help you understand the emotional drivers, decision patterns, and psychological factors that define your audience. What persona would you like to build?",
    systemPrompt: "You are the Neural Persona Builder, specializing in psychological profiling and behavioral prediction. Create detailed personas with deep psychological insights, emotional drivers, and decision-making pattern analysis.",
    iconName: "brain",
    color: "text-violet-500",
    ratings: { 5: 42, 4: 30, 3: 18, 2: 6, 1: 4 },
    reviews: [
      { id: 1, author: "Dr. Anna W.", role: "Consumer Psychologist", company: "Research Institute", rating: 4, date: "2023-11-28", content: "Interesting approach to persona building. The psychological dimensions are unique, though still in early stages.", helpful: 8 },
    ],
    relatedAgents: [
      { id: "audience-strategist-pro", name: "Audience Strategist Pro", rating: 4.9 },
      { id: "creative-intelligence", name: "Creative Intelligence", rating: 4.7 },
      { id: "consumer-journey-mapper", name: "Consumer Journey Mapper", rating: 4.7 },
    ],
  },
}

// Featured agents for the store page
export const featuredAgentIds = [
  "audience-strategist-pro",
  "brand-tracker-360",
  "creative-intelligence",
]

// Get agent by ID
export function getStoreAgent(id: string): StoreAgent | undefined {
  return storeAgents[id]
}

// Get all agents as array
export function getAllStoreAgents(): StoreAgent[] {
  return Object.values(storeAgents)
}

// Get featured agents
export function getFeaturedAgents(): StoreAgent[] {
  return featuredAgentIds.map(id => storeAgents[id]).filter(Boolean)
}

// Get agents by category
export function getAgentsByCategory(category: string): StoreAgent[] {
  if (category === "all") return getAllStoreAgents()
  return getAllStoreAgents().filter(agent => agent.category === category)
}

// Installed agents storage key
const INSTALLED_AGENTS_KEY = "gwi-installed-agents"

// Get installed agent IDs from localStorage
export function getInstalledAgentIds(): string[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(INSTALLED_AGENTS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Check if agent is installed
export function isAgentInstalled(agentId: string): boolean {
  return getInstalledAgentIds().includes(agentId)
}

// Install an agent
export function installAgent(agentId: string): void {
  if (typeof window === "undefined") return
  const installed = getInstalledAgentIds()
  if (!installed.includes(agentId)) {
    installed.push(agentId)
    localStorage.setItem(INSTALLED_AGENTS_KEY, JSON.stringify(installed))
    // Dispatch custom event for components to react
    window.dispatchEvent(new CustomEvent("agent-installed", { detail: { agentId } }))
  }
}

// Uninstall an agent
export function uninstallAgent(agentId: string): void {
  if (typeof window === "undefined") return
  const installed = getInstalledAgentIds().filter(id => id !== agentId)
  localStorage.setItem(INSTALLED_AGENTS_KEY, JSON.stringify(installed))
  window.dispatchEvent(new CustomEvent("agent-uninstalled", { detail: { agentId } }))
}

// Get installed agents
export function getInstalledAgents(): StoreAgent[] {
  return getInstalledAgentIds()
    .map(id => storeAgents[id])
    .filter(Boolean)
}
