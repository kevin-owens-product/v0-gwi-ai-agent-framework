"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { useSearchParams } from "next/navigation"
import { PlaygroundChat } from "@/components/playground/chat"
import { PlaygroundSidebar } from "@/components/playground/sidebar"
import { PlaygroundHeader } from "@/components/playground/header"
import { PlaygroundCanvas } from "@/components/playground/canvas"
import { PlaygroundToolbar } from "@/components/playground/toolbar"
import { PlaygroundContextPanel } from "@/components/playground/context-panel"
import { WelcomeWizard } from "@/components/playground/welcome-wizard"
import { getStoreAgent, installAgent, type StoreAgent } from "@/lib/store-agents"
import { getAgentById, type SolutionAgent } from "@/lib/solution-agents"

export interface PlaygroundConfig {
  selectedAgent: string
  selectedSources: string[]
  temperature: number
  enableMemory: boolean
  enableCitations: boolean
  outputFormat: string
  maxTokens: number
  model: string
  reasoningMode: boolean
}

export interface Citation {
  id: string
  source: string
  confidence: number
  type: "survey" | "report" | "trend"
  date: string
  excerpt: string
  title: string
}

export interface OutputBlock {
  id: string
  type: "text" | "chart" | "table" | "image" | "slides" | "code" | "persona" | "comparison"
  content: any
  title?: string
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  citations?: Citation[]
  status?: "streaming" | "complete"
  subAgents?: { name: string; status: "running" | "complete" | "pending"; duration?: number }[]
  outputBlocks?: OutputBlock[]
  reasoning?: string
  toolCalls?: { name: string; args: any; result?: any }[]
}

interface CustomAgent {
  id: string
  name: string
  description: string | null
  isStoreAgent?: boolean
  storeAgent?: StoreAgent
  isSolutionAgent?: boolean
  solutionAgent?: SolutionAgent
}

interface PlaygroundContextType {
  config: PlaygroundConfig
  setConfig: React.Dispatch<React.SetStateAction<PlaygroundConfig>>
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  isStreaming: boolean
  setIsStreaming: React.Dispatch<React.SetStateAction<boolean>>
  resetChat: () => void
  mode: "chat" | "canvas" | "split"
  setMode: React.Dispatch<React.SetStateAction<"chat" | "canvas" | "split">>
  selectedBlocks: string[]
  setSelectedBlocks: React.Dispatch<React.SetStateAction<string[]>>
  contextPanelOpen: boolean
  setContextPanelOpen: React.Dispatch<React.SetStateAction<boolean>>
  activeVariables: Record<string, any>
  setActiveVariables: React.Dispatch<React.SetStateAction<Record<string, any>>>
  customAgent: CustomAgent | null
  setCustomAgent: React.Dispatch<React.SetStateAction<CustomAgent | null>>
  addOutput: (type: OutputBlock["type"]) => void
  showWelcome: boolean
  setShowWelcome: React.Dispatch<React.SetStateAction<boolean>>
}

const PlaygroundContext = createContext<PlaygroundContextType | null>(null)

export function usePlayground() {
  const context = useContext(PlaygroundContext)
  if (!context) throw new Error("usePlayground must be used within PlaygroundProvider")
  return context
}

const defaultConfig: PlaygroundConfig = {
  selectedAgent: "audience-explorer",
  selectedSources: ["gwi-core"],
  temperature: 0.7,
  enableMemory: true,
  enableCitations: true,
  outputFormat: "rich",
  maxTokens: 8192,
  model: "gpt-4o",
  reasoningMode: false,
}

const agents: Record<string, { name: string; greeting: string; capabilities: string[] }> = {
  "audience-explorer": {
    name: "Audience Explorer",
    greeting:
      "Hello! I'm the Audience Explorer agent. I can help you discover and analyze consumer segments, build detailed personas, and uncover behavioral patterns. What audience would you like to explore today?",
    capabilities: ["Segment Analysis", "Persona Generation", "Behavioral Mapping", "Demographic Profiling"],
  },
  "persona-architect": {
    name: "Persona Architect",
    greeting:
      "Hi there! I'm the Persona Architect. I create rich, data-driven personas based on real consumer data. I can visualize motivations, pain points, and media habits. Who should we bring to life?",
    capabilities: ["Persona Creation", "Motivation Mapping", "Journey Mapping", "Archetype Definition"],
  },
  "motivation-decoder": {
    name: "Motivation Decoder",
    greeting:
      "Welcome! I'm the Motivation Decoder. I analyze the 'why' behind consumer behavior - values, beliefs, and emotional drivers. What consumer motivations shall we unpack?",
    capabilities: ["Value Analysis", "Emotional Drivers", "Decision Factors", "Need State Mapping"],
  },
  "culture-tracker": {
    name: "Culture Tracker",
    greeting:
      "Hello! I'm the Culture Tracker. I monitor cultural shifts, emerging movements, and societal trends that shape consumer behavior. What cultural phenomenon interests you?",
    capabilities: ["Trend Detection", "Cultural Analysis", "Movement Tracking", "Zeitgeist Mapping"],
  },
  "brand-analyst": {
    name: "Brand Relationship Analyst",
    greeting:
      "Hi! I'm the Brand Relationship Analyst. I examine how consumers connect with brands emotionally and functionally. Which brand relationships should we explore?",
    capabilities: ["Brand Perception", "Loyalty Analysis", "Competitive Position", "Affinity Mapping"],
  },
  "global-perspective": {
    name: "Global Perspective Agent",
    greeting:
      "Welcome! I'm the Global Perspective Agent. I compare consumer behaviors across markets and cultures to identify universal truths and local nuances. Which markets shall we compare?",
    capabilities: ["Cross-Market Analysis", "Cultural Comparison", "Global Trends", "Market Entry"],
  },
}

export default function PlaygroundPage() {
  const searchParams = useSearchParams()
  const agentIdFromUrl = searchParams.get("agent")

  const [config, setConfig] = useState<PlaygroundConfig>(defaultConfig)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: agents[defaultConfig.selectedAgent]?.greeting || "Hello! How can I help you today?",
      status: "complete",
    },
  ])
  const [isStreaming, setIsStreaming] = useState(false)
  const [mode, setMode] = useState<"chat" | "canvas" | "split">("chat")
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([])
  const [contextPanelOpen, setContextPanelOpen] = useState(false)
  const [activeVariables, setActiveVariables] = useState<Record<string, any>>({
    audience: null,
    market: "Global",
    timeframe: "Last 12 months",
  })
  const [customAgent, setCustomAgent] = useState<CustomAgent | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)

  // Check if this is first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem("playground-visited")
    if (!hasVisited) {
      setShowWelcome(true)
      localStorage.setItem("playground-visited", "true")
    }
  }, [])

  const handleExampleSelect = (example: { prompt: string; agent: string }) => {
    // Set the agent
    setConfig((prev) => ({ ...prev, selectedAgent: example.agent }))

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: example.prompt,
      status: "complete",
    }

    setMessages((prev) => [...prev, userMessage])

    // Would trigger AI response here in production
  }

  // Fetch agent from API if agent ID is in URL
  useEffect(() => {
    if (agentIdFromUrl) {
      // First check if it's a built-in playground agent
      if (agents[agentIdFromUrl]) {
        setCustomAgent(null)
        setConfig((prev) => ({ ...prev, selectedAgent: agentIdFromUrl }))
        setMessages([
          {
            id: Date.now().toString(),
            role: "assistant",
            content: agents[agentIdFromUrl].greeting,
            status: "complete",
          },
        ])
        return
      }

      // Check if it's a solution agent
      const solutionAgent = getAgentById(agentIdFromUrl)
      if (solutionAgent) {
        setCustomAgent({
          id: solutionAgent.id,
          name: solutionAgent.name,
          description: solutionAgent.description,
          isSolutionAgent: true,
          solutionAgent: solutionAgent,
        })
        setConfig((prev) => ({ ...prev, selectedAgent: solutionAgent.id }))
        // Create greeting from solution agent's example prompts
        const greeting = `Hello! I'm the ${solutionAgent.name}. ${solutionAgent.description}\n\nHere are some things I can help you with:\n${solutionAgent.capabilities.slice(0, 3).map(c => `• ${c}`).join('\n')}\n\nTry asking me something like: "${solutionAgent.examplePrompts[0]}"`
        setMessages([
          {
            id: Date.now().toString(),
            role: "assistant",
            content: greeting,
            status: "complete",
          },
        ])
        return
      }

      // Then check if it's a store agent
      const storeAgent = getStoreAgent(agentIdFromUrl)
      if (storeAgent) {
        // Auto-install store agent when opened in playground
        installAgent(agentIdFromUrl)
        setCustomAgent({
          id: storeAgent.id,
          name: storeAgent.name,
          description: storeAgent.description,
          isStoreAgent: true,
          storeAgent: storeAgent,
        })
        setConfig((prev) => ({ ...prev, selectedAgent: storeAgent.id }))
        setMessages([
          {
            id: Date.now().toString(),
            role: "assistant",
            content: storeAgent.greeting,
            status: "complete",
          },
        ])
        return
      }

      // Finally, try to fetch from API (custom agent)
      fetch(`/api/v1/agents/${agentIdFromUrl}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.data) {
            const agent = data.data
            setCustomAgent(agent)
            setConfig((prev) => ({ ...prev, selectedAgent: agent.id }))
            setMessages([
              {
                id: Date.now().toString(),
                role: "assistant",
                content: `Hello! I'm ${agent.name}. ${agent.description || "How can I help you today?"}`,
                status: "complete",
              },
            ])
          }
        })
        .catch((err) => console.error("Failed to fetch agent:", err))
    }
  }, [agentIdFromUrl])

  const resetChat = () => {
    let greeting = agents["audience-explorer"]?.greeting || "Hello! How can I help you today?"

    // Check for solution agent first
    if (customAgent?.isSolutionAgent && customAgent.solutionAgent) {
      const sa = customAgent.solutionAgent
      greeting = `Hello! I'm the ${sa.name}. ${sa.description}\n\nHere are some things I can help you with:\n${sa.capabilities.slice(0, 3).map(c => `• ${c}`).join('\n')}\n\nTry asking me something like: "${sa.examplePrompts[0]}"`
    } else if (customAgent?.isStoreAgent && customAgent.storeAgent) {
      greeting = customAgent.storeAgent.greeting
    } else if (customAgent) {
      greeting = `Hello! I'm ${customAgent.name}. ${customAgent.description || "How can I help you today?"}`
    } else if (agents[config.selectedAgent]) {
      greeting = agents[config.selectedAgent].greeting
    } else {
      // Check if selected agent is a solution agent
      const solutionAgent = getAgentById(config.selectedAgent)
      if (solutionAgent) {
        greeting = `Hello! I'm the ${solutionAgent.name}. ${solutionAgent.description}\n\nHere are some things I can help you with:\n${solutionAgent.capabilities.slice(0, 3).map(c => `• ${c}`).join('\n')}\n\nTry asking me something like: "${solutionAgent.examplePrompts[0]}"`
      } else {
        // Check if selected agent is a store agent
        const storeAgent = getStoreAgent(config.selectedAgent)
        if (storeAgent) {
          greeting = storeAgent.greeting
        }
      }
    }

    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: greeting,
        status: "complete",
      },
    ])
    setIsStreaming(false)
    setSelectedBlocks([])
  }

  // Generate sample output block based on type
  const generateSampleOutput = (type: OutputBlock["type"]): OutputBlock => {
    const id = `${type}-${Date.now()}`
    switch (type) {
      case "chart":
        return {
          id,
          type: "chart",
          title: "Purchase Drivers by Generation",
          content: {
            chartType: "bar",
            categories: ["Price", "Quality", "Sustainability", "Brand Trust", "Convenience"],
            series: [
              { name: "Gen Z", data: [65, 72, 89, 45, 71], color: "#8b5cf6" },
              { name: "Millennials", data: [72, 78, 76, 52, 68], color: "#3b82f6" },
              { name: "Gen X", data: [85, 82, 58, 61, 74], color: "#10b981" },
            ],
          },
        }
      case "table":
        return {
          id,
          type: "table",
          title: "Consumer Segment Analysis",
          content: {
            headers: ["Segment", "Size", "Growth", "Engagement", "Value Index"],
            rows: [
              ["Eco-Warriors", "18%", "+24%", "High", "142"],
              ["Conscious Mainstream", "34%", "+12%", "Medium", "118"],
              ["Passive Supporters", "28%", "+5%", "Low", "95"],
              ["Price-Focused", "20%", "-2%", "Medium", "87"],
            ],
          },
        }
      case "persona":
        return {
          id,
          type: "persona",
          title: "Eco-Conscious Millennial",
          content: {
            name: "Eco-Conscious Millennial",
            age: "28-35",
            income: "$65K-$95K",
            location: "Urban/suburban areas",
            values: ["Sustainability", "Authenticity", "Work-life balance", "Social impact"],
            behaviors: [
              "Researches brand ethics before purchasing",
              "Willing to pay 20% premium for sustainable products",
              "Shares brand experiences on social media",
              "Prefers direct-to-consumer brands",
            ],
            mediaHabits: ["Instagram (2.1h/day)", "LinkedIn (1.2h/day)", "Podcasts (45min/day)", "YouTube (1.5h/day)"],
          },
        }
      case "comparison":
        return {
          id,
          type: "comparison",
          title: "US vs UK Market Comparison",
          content: {
            items: [
              { name: "United States", metrics: { "Market Size": "$2.1B", "YoY Growth": "+15%", "Digital Adoption": "78%", "Sustainability Focus": "64%" } },
              { name: "United Kingdom", metrics: { "Market Size": "$0.8B", "YoY Growth": "+18%", "Digital Adoption": "82%", "Sustainability Focus": "74%" } },
            ],
          },
        }
      case "slides":
        return {
          id,
          type: "slides",
          title: "Consumer Insights Presentation",
          content: {
            slides: [
              { title: "Executive Summary", content: "Key findings from Q4 2024 consumer research across 15 markets" },
              { title: "Audience Overview", content: "Primary demographic: 25-34 year olds with high digital engagement" },
              { title: "Key Trends", content: "Sustainability concerns driving 67% of purchase decisions in target segment" },
              { title: "Behavioral Insights", content: "Mobile-first discovery with 78% researching products on smartphones" },
              { title: "Market Comparison", content: "US leads in adoption at 42%, followed by UK at 28% and Germany at 18%" },
              { title: "Competitive Landscape", content: "Brand loyalty declining, with 54% open to switching for better values alignment" },
              { title: "Recommendations", content: "Focus on authentic storytelling and mobile-optimized experiences" },
              { title: "Next Steps", content: "Deep-dive into Gen Z segment and expand to APAC markets in Q1" },
            ],
          },
        }
      case "image":
        return {
          id,
          type: "image",
          title: "Consumer Journey Infographic",
          content: {
            placeholder: true,
            description: "Visual infographic showing the consumer decision journey from awareness to purchase, highlighting key touchpoints and conversion rates at each stage"
          },
        }
      case "code":
        return {
          id,
          type: "code",
          title: "Data Export - Consumer Insights",
          content: {
            format: "json",
            data: {
              segments: [
                { name: "Gen Z", size: "2.1B", engagement: "high", sustainability_index: 89 },
                { name: "Millennials", size: "1.8B", engagement: "high", sustainability_index: 76 },
                { name: "Gen X", size: "1.2B", engagement: "medium", sustainability_index: 58 }
              ],
              markets: ["US", "UK", "Germany", "France", "Japan"],
              metrics: { total_reach: "5.1B", avg_engagement: 4.2, confidence: 0.94 }
            }
          },
        }
      default:
        return {
          id,
          type: "text",
          title: "Output",
          content: "Generated content",
        }
    }
  }

  const addOutput = (type: OutputBlock["type"]) => {
    if (isStreaming) return

    const outputBlock = generateSampleOutput(type)
    const outputNames: Record<string, string> = {
      chart: "chart",
      table: "data table",
      persona: "persona",
      comparison: "comparison",
      slides: "presentation",
      image: "visual",
      code: "data export",
      text: "output",
    }

    const newMessage = {
      id: Date.now().toString(),
      role: "assistant" as const,
      content: `I've generated a ${outputNames[type] || type} based on the current context. You can interact with it below or ask me to modify it.`,
      status: "complete" as const,
      outputBlocks: [outputBlock],
    }

    setMessages((prev) => [...prev, newMessage])
  }

  return (
    <PlaygroundContext.Provider
      value={{
        config,
        setConfig,
        messages,
        setMessages,
        isStreaming,
        setIsStreaming,
        resetChat,
        mode,
        setMode,
        selectedBlocks,
        setSelectedBlocks,
        contextPanelOpen,
        setContextPanelOpen,
        activeVariables,
        setActiveVariables,
        customAgent,
        setCustomAgent,
        addOutput,
        showWelcome,
        setShowWelcome,
      }}
    >
      <WelcomeWizard
        open={showWelcome}
        onClose={() => setShowWelcome(false)}
        onExampleSelect={handleExampleSelect}
      />
      <div className="-m-6 flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
        <PlaygroundSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <PlaygroundHeader />
          <PlaygroundToolbar />
          <div className="flex-1 flex overflow-hidden">
            {mode === "chat" && <PlaygroundChat />}
            {mode === "canvas" && <PlaygroundCanvas />}
            {mode === "split" && (
              <>
                <div className="w-1/2 border-r border-border">
                  <PlaygroundChat />
                </div>
                <div className="w-1/2">
                  <PlaygroundCanvas />
                </div>
              </>
            )}
          </div>
        </div>
        {contextPanelOpen && <PlaygroundContextPanel />}
      </div>
    </PlaygroundContext.Provider>
  )
}
