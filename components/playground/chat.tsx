"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip, StopCircle, Sparkles, Command, ImageIcon, BarChart3, Table, Users } from "lucide-react"
import { ChatMessage } from "./chat-message"
import { usePlayground, type OutputBlock } from "@/app/dashboard/playground/page"
import { CommandPalette } from "./command-palette"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const generateOutputBlocks = (topic: string): OutputBlock[] => {
  if (topic === "genz" || topic === "sustainability") {
    return [
      {
        id: "chart-1",
        type: "chart",
        title: "Purchase Drivers by Generation",
        content: {
          chartType: "bar",
          categories: ["Price", "Quality", "Sustainability", "Brand", "Convenience"],
          series: [
            { name: "Gen Z", data: [65, 72, 89, 45, 71], color: "#8b5cf6" },
            { name: "Millennials", data: [72, 78, 76, 52, 68], color: "#3b82f6" },
            { name: "Gen X", data: [85, 82, 58, 61, 74], color: "#10b981" },
          ],
        },
      },
      {
        id: "persona-1",
        type: "persona",
        title: "Eco-Conscious Gen Z",
        content: {
          name: "Eco-Conscious Gen Z",
          age: "18-26",
          income: "$35K-$65K",
          location: "Urban areas",
          values: ["Sustainability", "Authenticity", "Social Justice"],
          behaviors: [
            "Researches brands before buying",
            "Shares opinions on social media",
            "Prefers experiences over things",
          ],
          mediaHabits: ["TikTok (3.2h/day)", "Instagram (2.1h/day)", "YouTube (1.8h/day)"],
        },
      },
    ]
  }
  return [
    {
      id: "table-1",
      type: "table",
      title: "Market Overview",
      content: {
        headers: ["Metric", "Value", "Change", "Trend"],
        rows: [
          ["Market Size", "$4.2B", "+12%", "↑"],
          ["Active Users", "2.3M", "+8%", "↑"],
          ["Avg. Engagement", "4.2 min", "+15%", "↑"],
          ["Conversion Rate", "3.8%", "-2%", "↓"],
        ],
      },
    },
  ]
}

const agentResponses: Record<string, Record<string, string>> = {
  "audience-explorer": {
    default: `Based on my analysis of GWI Core data across 52 markets, I've identified several key insights about your target audience:

## Key Findings

**Demographics & Reach**
- Primary age group: 25-34 (42% of segment)
- Gender split: 52% female, 48% male  
- Geographic concentration: Urban centers (68%)
- Income bracket: Upper-middle ($75K-$150K)

**Behavioral Patterns**
- High engagement with purpose-driven content (+67% vs. average)
- Active on visual platforms (Instagram, TikTok) averaging 3.2 hours daily
- Strong preference for authentic brand storytelling over polished ads
- Research-intensive: 73% check 3+ sources before major purchases

**Purchase Drivers**
1. Environmental impact (89% consider important)
2. Brand values alignment (76%)
3. Social proof and reviews (72%)
4. Price-to-value ratio (68%)

## Strategic Recommendations

1. **Content Strategy**: Focus on educational content demonstrating real impact
2. **Channel Mix**: Prioritize short-form video on TikTok and Instagram Reels
3. **Messaging**: Lead with quantifiable impact metrics and third-party certifications

Would you like me to dive deeper into any segment, or shall I generate a detailed persona?`,
    genz: `Here's my comprehensive analysis of Gen Z consumer behavior from GWI's latest data:

## Gen Z Consumer Profile (Ages 18-26)

**Digital Behavior**
- Average screen time: 7.2 hours daily (highest of any generation)
- Platform preference: TikTok (89%), Instagram (78%), YouTube (92%)
- Content format: Short-form video dominates (73% prefer under 60 seconds)
- Discovery: 67% discover new brands through social media vs. 34% through search

**Values & Priorities**
- Mental health awareness: 84% actively prioritize
- Climate action: 76% express genuine concern (not just performative)
- Diversity & inclusion: 81% expect brands to take real stances
- Authenticity detection: 92% claim they can spot "performative" messaging

**Purchase Behavior**
- Research-intensive: 67% check 3+ sources before buying
- Creator influence: 71% trust micro-influencers over celebrities
- Price sensitivity: High, but 64% pay premium for values alignment
- Mobile commerce: 78% complete purchases on mobile devices

## Strategic Implications

1. **Authenticity is Non-Negotiable**: Gen Z has highly developed detection for inauthentic messaging
2. **Take Meaningful Stances**: Silence on social issues is perceived as a negative signal
3. **Enable Co-Creation**: Involve them in product development and campaign creation
4. **Mobile-First Everything**: Desktop is an afterthought for this generation

Shall I generate specific campaign tactics or build out detailed personas?`,
    sustainability: `Here's my deep dive into sustainability-focused consumer segments across global markets:

## Sustainability Consumer Segments

### Segment 1: "Eco-Warriors" (18% of market)
- **Demographics**: 18-34, varied income, urban
- **Behavior**: Actively avoid unsustainable brands, willing to pay 30%+ premium
- **Channels**: Reddit, specialized eco-blogs, documentary platforms
- **Influence**: High - they shape opinions in their networks

### Segment 2: "Conscious Mainstream" (34% of market)
- **Demographics**: 25-45, middle to upper-middle income
- **Behavior**: Prefer sustainable when convenient, price-sensitive on premium
- **Channels**: Instagram, mainstream news, influencer content
- **Influence**: Medium - follow trends more than set them

### Segment 3: "Passive Supporters" (28% of market)
- **Demographics**: 35-55, upper-middle to high income
- **Behavior**: Appreciate sustainability but don't actively seek it
- **Channels**: Facebook, traditional media, email newsletters
- **Influence**: Low - but significant purchasing power

## Key Metrics from GWI Core

| Metric | Eco-Warriors | Conscious Mainstream | Passive Supporters |
|--------|-------------|---------------------|-------------------|
| Premium willingness | +32% | +12% | +5% |
| Brand loyalty | High | Medium | Low |
| Social sharing | Very High | Medium | Low |
| Research depth | Deep | Moderate | Surface |
| Market influence | High | Medium | Low |

Would you like me to create targeting strategies for any specific segment, or compare across markets?`,
  },
  "persona-architect": {
    default: `I'll help you build a comprehensive, data-driven persona. Let me create one based on the patterns I'm seeing in GWI data:

## Persona: "The Mindful Achiever"

### Demographics
- **Age**: 28-35 years old
- **Income**: $75,000 - $120,000 annually
- **Location**: Urban/suburban areas in developed markets
- **Education**: Bachelor's degree or higher (78%)
- **Life Stage**: Early career advancement, some starting families

### Psychographics

**Core Values**
- Personal growth and continuous learning
- Work-life integration (not just balance)
- Sustainability and ethical consumption
- Authentic connections over superficial networking

**Motivations**
- Career advancement without sacrificing wellbeing
- Making purchasing decisions that align with values
- Building a lifestyle that reflects personal identity
- Contributing to positive change in their communities

### Behavioral Profile

**Media Consumption**
- Primary: LinkedIn (professional), Instagram (lifestyle)
- Secondary: Podcasts (education), YouTube (tutorials)
- Emerging: Substack newsletters, niche communities
- Time spent: 4.2 hours daily on digital media

**Purchase Journey**
1. Discovery through peer recommendations (42%)
2. Research phase: 2-3 weeks for major purchases
3. Validation through reviews and certifications
4. Post-purchase sharing with network

### Pain Points & Opportunities

**Pain Points**
- Information overload making decisions difficult
- Skepticism toward brand claims (greenwashing fatigue)
- Time poverty limiting research capacity
- Premium pricing for sustainable options

**Opportunities for Brands**
- Simplify decision-making with clear impact metrics
- Build trust through transparency and third-party validation
- Create time-saving tools and experiences
- Offer accessible entry points to premium positioning

Would you like me to create additional personas or map the journey for this one?`,
  },
  "motivation-decoder": {
    default: `Let me decode the underlying motivations driving consumer behavior in your target segment:

## Motivation Analysis

### Surface-Level Needs (Functional)
These are the obvious, stated needs consumers express:
- **Convenience**: Save time and reduce friction
- **Value**: Get quality at a fair price
- **Performance**: Products that work as promised

### Deep-Level Drivers (Emotional)

**1. Identity Expression (Primary Driver)**
- Consumers use purchases to signal who they are
- 78% say brand choices reflect personal values
- Social visibility of choices matters significantly
- *Implication*: Position products as identity enablers, not just functional solutions

**2. Anxiety Reduction (Secondary Driver)**
- Fear of making wrong choices drives extensive research
- Environmental guilt creates preference for sustainable options
- Social pressure to make "smart" purchases
- *Implication*: Provide reassurance through social proof and guarantees

**3. Belonging & Connection (Tertiary Driver)**
- Desire to be part of communities sharing values
- Brand communities offer sense of belonging
- Peer validation heavily influences decisions
- *Implication*: Build community, enable user connection

### The "Why Behind the Why"

| Stated Reason | Surface Need | Deep Motivation |
|--------------|--------------|-----------------|
| "It's eco-friendly" | Environmental impact | Anxiety about future |
| "Great reviews" | Quality assurance | Fear of wrong choice |
| "Friends recommended" | Trust | Need for belonging |
| "Aligns with my values" | Ethics | Identity expression |

### Strategic Application

1. **Messaging**: Address emotional needs, prove with functional benefits
2. **Experience**: Reduce anxiety throughout the journey
3. **Community**: Create spaces for connection and validation
4. **Positioning**: Enable identity expression, not just consumption

Shall I dive deeper into any specific motivation or analyze a particular decision journey?`,
  },
  "culture-tracker": {
    default: `Here's my analysis of the cultural trends shaping consumer behavior:

## Emerging Cultural Movements

### 1. "Underconsumption Core" 
**Confidence: 94%** | **Velocity: High**

A backlash against overconsumption gaining significant traction:
- 2.3B+ views on TikTok for related content
- 67% of Gen Z expressing intent to "buy less, better"
- Driving demand for durable, repairable products
- *Brand Implication*: Quality and longevity messaging resonates

### 2. "Soft Life" Movement
**Confidence: 89%** | **Velocity: Medium-High**

Rejection of hustle culture in favor of gentler living:
- Originated in Black communities, now mainstream
- Emphasis on ease, comfort, and reduced stress
- Influencing product design and brand tone
- *Brand Implication*: Comfort and simplicity positioning

### 3. "Digital Detox Paradox"
**Confidence: 85%** | **Velocity: Medium**

Desire to disconnect while remaining connected:
- 78% growth in digital detox retreats
- Yet screen time continues to increase
- Creating demand for "mindful tech" products
- *Brand Implication*: Help consumers manage, not eliminate, digital life

### 4. "Micro-Community Renaissance"
**Confidence: 91%** | **Velocity: High**

Shift from mass social to intimate groups:
- Discord servers, group chats, private communities
- Local shopping up 34% as "community" value rises
- Third places (beyond home/work) gaining importance
- *Brand Implication*: Community building over broadcast marketing

## Trend Impact Matrix

| Trend | Impact on Purchasing | Timeline to Mainstream |
|-------|---------------------|----------------------|
| Underconsumption | High (buying patterns) | Already mainstream |
| Soft Life | Medium (brand preference) | 6-12 months |
| Digital Detox | Medium (product features) | 12-18 months |
| Micro-Communities | High (marketing channels) | Already mainstream |

## Signals to Watch
- "De-influencing" content continuing to grow
- Repair café attendance increasing globally
- "Third place" searches up 156% YoY

Which trend would you like me to explore in more depth?`,
  },
  "brand-analyst": {
    default: `Let me analyze the brand-consumer relationship dynamics:

## Brand Relationship Analysis

### Current Brand Perception Landscape

Based on GWI data, here's how consumers relate to brands today:

**Trust Metrics (Global Average)**
- Brand trust overall: 42% (down from 54% in 2020)
- Trust in brand claims: 34%
- Trust in brand values statements: 38%
- Trust when backed by third-party validation: 71%

### Relationship Archetypes

**1. Loyal Advocates (12% of consumers)**
- Deep emotional connection to select brands
- Active promoters within their networks
- Willing to pay significant premium (avg +45%)
- Forgive occasional missteps

**2. Transactional Loyalists (28%)**
- Repeat purchasers driven by convenience/habit
- Low emotional attachment
- Will switch for better deals
- Require continuous value delivery

**3. Values-Aligned Seekers (34%)**
- Choose brands matching personal values
- Growing segment, especially under 35
- Research-intensive decision makers
- Demand authenticity and transparency

**4. Price-Driven Switchers (26%)**
- Minimal brand loyalty
- Decision based primarily on price
- Growing segment due to economic pressures
- Opportunity during value-conscious moments

### Brand Affinity Drivers

| Driver | Importance | Trend |
|--------|-----------|-------|
| Product quality | 89% | Stable |
| Value for money | 84% | ↑ Growing |
| Brand values | 72% | ↑ Growing |
| Customer service | 68% | Stable |
| Innovation | 54% | ↓ Declining |
| Brand heritage | 41% | ↓ Declining |

### Competitive Positioning Opportunities

1. **Trust Gap**: Massive opportunity for brands demonstrating genuine transparency
2. **Values Activation**: Moving beyond statements to provable action
3. **Community Building**: Creating belonging beyond transactions
4. **Personalization**: Individual recognition at scale

Would you like me to analyze specific brand comparisons or dive into a particular market segment?`,
  },
  "global-perspective": {
    default: `Here's my cross-market analysis comparing consumer behaviors globally:

## Global Consumer Comparison

### Market Overview

| Market | Consumer Confidence | Digital Adoption | Sustainability Priority |
|--------|-------------------|------------------|------------------------|
| 🇺🇸 United States | 62/100 | 78% | 64% |
| 🇬🇧 United Kingdom | 54/100 | 82% | 74% |
| 🇩🇪 Germany | 58/100 | 71% | 79% |
| 🇯🇵 Japan | 48/100 | 85% | 62% |
| 🇧🇷 Brazil | 67/100 | 74% | 71% |
| 🇮🇳 India | 78/100 | 69% | 68% |

### Universal Truths (Cross-Market)

These patterns hold true across all 52 markets in our data:

1. **Digital-First Discovery**: 70%+ discover brands online first (all markets)
2. **Trust Deficit**: Declining brand trust is global, not regional
3. **Values Matter**: Under-35s prioritize values globally (65%+ all markets)
4. **Community Seeking**: Post-pandemic desire for connection universal

### Market-Specific Nuances

**United States**
- Highest brand loyalty variation by category
- Convenience often trumps sustainability
- Influencer impact: Medium-high

**United Kingdom**
- Strongest sustainability preference in Western markets
- Value-conscious but quality-oriented
- High receptivity to humor in marketing

**Germany**
- Highest research intensity before purchase
- Strong preference for local/European brands
- Skeptical of overt marketing claims

**Japan**
- Highest expectations for product quality
- Brand heritage still matters significantly
- Subtle, understated marketing preferred

### Market Entry Recommendations

| Target Market | Entry Strategy | Key Success Factor |
|--------------|----------------|-------------------|
| Germany | Partnership with local brand | Quality certification |
| Brazil | Digital-first, influencer-led | Mobile optimization |
| Japan | Premium positioning, patience | Cultural adaptation |
| India | Value + aspiration balance | Local relevance |

Would you like a deeper dive into any specific market comparison?`,
  },
}

function detectTopic(query: string): string {
  const lowerQuery = query.toLowerCase()
  if (lowerQuery.includes("gen z") || lowerQuery.includes("genz") || lowerQuery.includes("generation z")) {
    return "genz"
  }
  if (
    lowerQuery.includes("sustain") ||
    lowerQuery.includes("eco") ||
    lowerQuery.includes("green") ||
    lowerQuery.includes("environment")
  ) {
    return "sustainability"
  }
  return "default"
}

export function PlaygroundChat() {
  const { config, messages, setMessages, isStreaming, setIsStreaming, mode, customAgent, activeVariables } = usePlayground()
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSelectTemplate = (prompt: string) => {
    setInput(prompt)
  }

  const handleSubmit = async () => {
    if (!input.trim() || isStreaming) return

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: input + (attachments.length > 0 ? `\n\n[Attached: ${attachments.map((f) => f.name).join(", ")}]` : ""),
      status: "complete" as const,
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setAttachments([])
    setIsStreaming(true)

    const assistantMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant" as const,
      content: "",
      status: "streaming" as const,
      reasoning: config.reasoningMode
        ? "Let me analyze this query step by step:\n1. Identifying relevant data sources...\n2. Filtering by demographic criteria...\n3. Cross-referencing behavioral patterns...\n4. Generating insights with confidence scores..."
        : undefined,
      subAgents: [
        { name: "Data Retrieval", status: "running" as const },
        { name: "Analysis Engine", status: "pending" as const },
        { name: "Insight Generator", status: "pending" as const },
      ],
    }

    setMessages((prev) => [...prev, assistantMessage])

    try {
      // Call the real chat API
      const response = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          agentId: customAgent?.id || config.selectedAgent,
          context: activeVariables,
          config: {
            temperature: config.temperature,
            maxTokens: config.maxTokens,
            enableCitations: config.enableCitations,
            enableMemory: config.enableMemory,
            selectedSources: config.selectedSources,
          },
        }),
      })

      // Update sub-agent status to show progress
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                subAgents: [
                  { name: "Data Retrieval", status: "complete", duration: 0.8 },
                  { name: "Analysis Engine", status: "running" },
                  { name: "Insight Generator", status: "pending" },
                ],
              }
            : msg,
        ),
      )

      await new Promise((resolve) => setTimeout(resolve, 300))

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                subAgents: [
                  { name: "Data Retrieval", status: "complete", duration: 0.8 },
                  { name: "Analysis Engine", status: "complete", duration: 0.6 },
                  { name: "Insight Generator", status: "running" },
                ],
              }
            : msg,
        ),
      )

      if (response.ok) {
        const data = await response.json()
        const apiResponse = data.data?.response || "I apologize, but I couldn't process that request."
        const apiCitations = data.data?.citations || []
        const apiOutputBlocks = data.data?.outputBlocks || []

        // Stream the response for better UX
        let currentContent = ""
        const words = apiResponse.split(" ")

        for (let i = 0; i < words.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 8 + Math.random() * 12))
          currentContent += (i > 0 ? " " : "") + words[i]

          setMessages((prev) =>
            prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: currentContent } : msg)),
          )
        }

        // Complete the message with citations and output blocks
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? {
                  ...msg,
                  status: "complete",
                  citations: config.enableCitations ? apiCitations : undefined,
                  outputBlocks: config.outputFormat === "rich" ? apiOutputBlocks : undefined,
                  subAgents: [
                    { name: "Data Retrieval", status: "complete", duration: 0.8 },
                    { name: "Analysis Engine", status: "complete", duration: 0.6 },
                    { name: "Insight Generator", status: "complete", duration: 1.2 },
                  ],
                }
              : msg,
          ),
        )
      } else {
        // Fall back to local response generation on API error
        const topic = detectTopic(currentInput)
        const agentKey = config.selectedAgent
        const responsePool = agentResponses[agentKey] || agentResponses["audience-explorer"]
        const fallbackResponse = responsePool[topic] || responsePool.default

        let currentContent = ""
        const words = fallbackResponse.split(" ")

        for (let i = 0; i < words.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 12 + Math.random() * 15))
          currentContent += (i > 0 ? " " : "") + words[i]

          setMessages((prev) =>
            prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: currentContent } : msg)),
          )
        }

        const outputBlocks = config.outputFormat === "rich" ? generateOutputBlocks(topic) : undefined

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? {
                  ...msg,
                  status: "complete",
                  outputBlocks,
                  subAgents: [
                    { name: "Data Retrieval", status: "complete", duration: 0.8 },
                    { name: "Analysis Engine", status: "complete", duration: 0.6 },
                    { name: "Insight Generator", status: "complete", duration: 1.2 },
                  ],
                }
              : msg,
          ),
        )
      }
    } catch (error) {
      console.error('Chat API error:', error)
      // Fall back to local response on network error
      const topic = detectTopic(currentInput)
      const agentKey = config.selectedAgent
      const responsePool = agentResponses[agentKey] || agentResponses["audience-explorer"]
      const fallbackResponse = responsePool[topic] || responsePool.default

      let currentContent = ""
      const words = fallbackResponse.split(" ")

      for (let i = 0; i < words.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 12 + Math.random() * 15))
        currentContent += (i > 0 ? " " : "") + words[i]

        setMessages((prev) =>
          prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: currentContent } : msg)),
        )
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                status: "complete",
                subAgents: [
                  { name: "Data Retrieval", status: "complete", duration: 0.8 },
                  { name: "Analysis Engine", status: "complete", duration: 0.6 },
                  { name: "Insight Generator", status: "complete", duration: 1.2 },
                ],
              }
            : msg,
        ),
      )
    }

    setIsStreaming(false)
  }

  const handleFileAttach = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files))
    }
  }

  return (
    <div className={cn("flex-1 flex flex-col overflow-hidden", mode === "split" && "border-r border-border")}>
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onSelectTemplate={handleSelectTemplate}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-accent-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Start exploring human insights</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              Ask questions about consumers, build personas, track trends, or analyze brand relationships using GWI
              data.
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              {[
                "Analyze Gen Z sustainability preferences",
                "Build a persona for eco-conscious millennials",
                "Compare US vs UK consumer values",
                "What cultural trends are shaping 2025?",
              ].map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  className="text-xs bg-transparent"
                  onClick={() => setInput(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-6">
              Press <kbd className="px-1.5 py-0.5 rounded border bg-muted font-mono text-[10px]">⌘K</kbd> to open
              templates
            </p>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border bg-card/50">
        <div className="max-w-4xl mx-auto">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachments.map((file, i) => (
                <div key={i} className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-1 text-sm">
                  <Paperclip className="h-3 w-3" />
                  <span className="text-foreground">{file.name}</span>
                  <button
                    onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about audiences, personas, trends, or brand relationships..."
              className="min-h-[100px] pr-32 resize-none bg-background border-border"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                onChange={handleFileChange}
                accept=".csv,.xlsx,.json,.pdf"
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Output type">
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setInput(input + " [Generate chart]")}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Add Chart
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setInput(input + " [Generate table]")}>
                    <Table className="h-4 w-4 mr-2" />
                    Add Table
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setInput(input + " [Build persona]")}>
                    <Users className="h-4 w-4 mr-2" />
                    Build Persona
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setInput(input + " [Generate visual]")}>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Generate Visual
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleFileAttach} title="Attach file">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCommandPaletteOpen(true)}
                title="Templates (⌘K)"
              >
                <Command className="h-4 w-4" />
              </Button>
              {isStreaming ? (
                <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => setIsStreaming(false)}>
                  <StopCircle className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  className="h-8 w-8 bg-accent hover:bg-accent/90"
                  onClick={handleSubmit}
                  disabled={!input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press <kbd className="px-1 py-0.5 rounded border bg-muted font-mono text-[10px]">Enter</kbd> to send,{" "}
            <kbd className="px-1 py-0.5 rounded border bg-muted font-mono text-[10px]">Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  )
}
