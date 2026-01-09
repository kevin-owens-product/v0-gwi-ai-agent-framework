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

  // Fetch agent from API if agent ID is in URL
  useEffect(() => {
    if (agentIdFromUrl && !agents[agentIdFromUrl]) {
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
    } else if (agentIdFromUrl && agents[agentIdFromUrl]) {
      // Use built-in agent
      setConfig((prev) => ({ ...prev, selectedAgent: agentIdFromUrl }))
      setMessages([
        {
          id: Date.now().toString(),
          role: "assistant",
          content: agents[agentIdFromUrl].greeting,
          status: "complete",
        },
      ])
    }
  }, [agentIdFromUrl])

  const resetChat = () => {
    let greeting = agents["audience-explorer"]?.greeting || "Hello! How can I help you today?"
    if (customAgent) {
      greeting = `Hello! I'm ${customAgent.name}. ${customAgent.description || "How can I help you today?"}`
    } else if (agents[config.selectedAgent]) {
      greeting = agents[config.selectedAgent].greeting
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
      }}
    >
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
