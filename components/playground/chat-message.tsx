"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ThumbsUp,
  ThumbsDown,
  Copy,
  RefreshCw,
  CheckCircle2,
  Loader2,
  Check,
  ExternalLink,
  Clock,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Users,
  TableIcon,
  Download,
} from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import { SourcePreview } from "./source-preview"

function exportBlockData(block: OutputBlock, format: "json" | "csv" = "json") {
  let content = ""
  let filename = `${block.type}-${block.id}-${new Date().toISOString().split("T")[0]}`
  let mimeType = "application/json"

  if (format === "json") {
    content = JSON.stringify(
      {
        type: block.type,
        title: block.title,
        content: block.content,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    )
    filename += ".json"
  } else if (format === "csv" && block.type === "table" && block.content?.headers && block.content?.rows) {
    const headers = block.content.headers.join(",")
    const rows = block.content.rows.map((row: string[]) => row.join(",")).join("\n")
    content = `${headers}\n${rows}`
    filename += ".csv"
    mimeType = "text/csv"
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function BlockExportButton({ block, showCsv = false }: { block: OutputBlock; showCsv?: boolean }) {
  return (
    <div className="flex items-center gap-1 ml-auto">
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => exportBlockData(block, "json")}
      >
        <Download className="h-3 w-3 mr-1" />
        JSON
      </Button>
      {showCsv && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => exportBlockData(block, "csv")}
        >
          <Download className="h-3 w-3 mr-1" />
          CSV
        </Button>
      )}
    </div>
  )
}

interface Citation {
  id?: string
  source: string
  confidence: number
  type?: "survey" | "report" | "trend"
  date?: string
  excerpt?: string
  title?: string
}

interface OutputBlock {
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
}

function ChartBlock({ block }: { block: OutputBlock }) {
  const { content } = block
  if (!content?.series) return null
  const maxValue = Math.max(...content.series.flatMap((s: any) => s.data))

  return (
    <Card className="p-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-4 w-4 text-accent" />
        <h4 className="text-sm font-medium">{block.title}</h4>
        <BlockExportButton block={block} />
      </div>
      <div className="flex items-center gap-4 mb-4">
        {content.series.map((series: any) => (
          <div key={series.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: series.color }} />
            <span className="text-xs text-muted-foreground">{series.name}</span>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {content.categories?.map((cat: string, catIdx: number) => (
          <div key={cat} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-28 truncate">{cat}</span>
            <div className="flex-1 flex items-center gap-1 h-6">
              {content.series.map((series: any) => (
                <div
                  key={series.name}
                  className="h-full rounded-sm transition-all"
                  style={{
                    width: `${(series.data[catIdx] / maxValue) * 100}%`,
                    backgroundColor: series.color,
                    opacity: 0.85,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function PersonaBlock({ block }: { block: OutputBlock }) {
  const { content } = block
  if (!content) return null

  return (
    <Card className="p-4 mt-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center">
          <Users className="h-6 w-6 text-purple-500" />
        </div>
        <div>
          <h4 className="text-sm font-medium">{content.name}</h4>
          <p className="text-xs text-muted-foreground">
            {content.age} | {content.income} | {content.location}
          </p>
        </div>
        <BlockExportButton block={block} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">{t("values")}</p>
          <div className="flex flex-wrap gap-1">
            {content.values?.map((value: string) => (
              <Badge key={value} variant="secondary" className="text-xs">
                {value}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">{t("mediaHabits")}</p>
          <ul className="space-y-1">
            {content.mediaHabits?.slice(0, 3).map((habit: string) => (
              <li key={habit} className="text-xs text-muted-foreground flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-accent" />
                {habit}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {content.behaviors && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">{t("keyBehaviors")}</p>
          <ul className="space-y-1">
            {content.behaviors.map((behavior: string) => (
              <li key={behavior} className="text-xs text-foreground flex items-center gap-2">
                <Check className="h-3 w-3 text-emerald-500" />
                {behavior}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}

function TableBlock({ block }: { block: OutputBlock }) {
  const { content } = block
  if (!content?.headers) return null

  return (
    <Card className="p-4 mt-4 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <TableIcon className="h-4 w-4 text-accent" />
        <h4 className="text-sm font-medium">{block.title}</h4>
        <BlockExportButton block={block} showCsv />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {content.headers.map((header: string) => (
                <th key={header} className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {content.rows?.map((row: string[], i: number) => (
              <tr key={i} className="border-b border-border/50 last:border-0">
                {row.map((cell, j) => (
                  <td key={j} className="py-2 px-3 text-xs">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function ComparisonBlock({ block }: { block: OutputBlock }) {
  const { content } = block
  if (!content?.items) return null

  return (
    <Card className="p-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 3h5v5M8 3H3v5M3 16v5h5M21 16v5h-5M12 8v8M8 12h8" />
        </svg>
        <h4 className="text-sm font-medium">{block.title}</h4>
        <BlockExportButton block={block} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {content.items.map((item: any, index: number) => (
          <div key={index} className="p-3 rounded-lg bg-secondary/50 border border-border">
            <h5 className="text-sm font-medium mb-2">{item.name}</h5>
            {item.metrics && (
              <div className="space-y-1">
                {Object.entries(item.metrics).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-muted-foreground capitalize">{key}</span>
                    <span className="font-medium">{value as string}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

function SlidesBlock({ block }: { block: OutputBlock }) {
  const { content } = block
  if (!content?.slides) return null

  return (
    <Card className="p-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
        <h4 className="text-sm font-medium">{block.title}</h4>
        <Badge variant="secondary" className="text-[10px]">{t("slides", { count: content.slides.length })}</Badge>
        <BlockExportButton block={block} />
      </div>
      <div className="space-y-2">
        {content.slides.map((slide: any, index: number) => (
          <div key={index} className="p-3 rounded-lg bg-secondary/30 border border-border flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-accent/20 flex items-center justify-center text-xs font-medium text-accent">
              {index + 1}
            </div>
            <div>
              <p className="text-sm font-medium">{slide.title}</p>
              <p className="text-xs text-muted-foreground">{slide.content}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function ImageBlock({ block }: { block: OutputBlock }) {
  const { content } = block

  return (
    <Card className="p-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        <h4 className="text-sm font-medium">{block.title}</h4>
        <BlockExportButton block={block} />
      </div>
      <div className="aspect-video rounded-lg bg-secondary/50 border border-dashed border-border flex items-center justify-center">
        <div className="text-center">
          <svg className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <p className="text-sm text-muted-foreground">{content?.description || "Visual generated from data"}</p>
        </div>
      </div>
    </Card>
  )
}

function CodeBlock({ block }: { block: OutputBlock }) {
  const { content } = block
  const codeContent = content?.data ? JSON.stringify(content.data, null, 2) : "{}"

  return (
    <Card className="p-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="16,18 22,12 16,6" />
          <polyline points="8,6 2,12 8,18" />
        </svg>
        <h4 className="text-sm font-medium">{block.title}</h4>
        <Badge variant="secondary" className="text-[10px]">{content?.format || 'json'}</Badge>
        <BlockExportButton block={block} />
      </div>
      <div className="rounded-lg bg-[#1e1e1e] p-4 overflow-x-auto">
        <pre className="text-xs text-green-400 font-mono">
          <code>{codeContent}</code>
        </pre>
      </div>
    </Card>
  )
}

export function ChatMessage({ message }: { message: Message }) {
  const t = useTranslations("playground.chatMessage")
  const isUser = message.role === "user"
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null)
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null)
  const [sourcePreviewOpen, setSourcePreviewOpen] = useState(false)
  const [showReasoning, setShowReasoning] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFeedback = (type: "up" | "down") => {
    setFeedback(type)
  }

  const handleCitationClick = (citation: Citation) => {
    setSelectedCitation({
      ...citation,
      id: citation.id || citation.source,
      title: citation.title || citation.source,
      type: citation.type || "survey",
      date: citation.date || "2024",
      excerpt: citation.excerpt || "Data from this source was used to generate the response.",
    })
    setSourcePreviewOpen(true)
  }

  const renderOutputBlock = (block: OutputBlock) => {
    switch (block.type) {
      case "chart":
        return <ChartBlock key={block.id} block={block} />
      case "persona":
        return <PersonaBlock key={block.id} block={block} />
      case "table":
        return <TableBlock key={block.id} block={block} />
      case "comparison":
        return <ComparisonBlock key={block.id} block={block} />
      case "slides":
        return <SlidesBlock key={block.id} block={block} />
      case "image":
        return <ImageBlock key={block.id} block={block} />
      case "code":
        return <CodeBlock key={block.id} block={block} />
      default:
        return null
    }
  }

  return (
    <div className={cn("flex gap-4", isUser && "justify-end")}>
      <SourcePreview open={sourcePreviewOpen} onOpenChange={setSourcePreviewOpen} citation={selectedCitation as any} />

      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-medium text-accent">AI</span>
        </div>
      )}

      <div className={cn("max-w-3xl space-y-3", isUser && "order-first")}>
        {!isUser && message.subAgents && message.subAgents.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.subAgents.map((agent) => (
              <div
                key={agent.name}
                className={cn(
                  "flex items-center gap-2 text-xs rounded-full px-3 py-1",
                  agent.status === "complete" && "bg-emerald-500/10 text-emerald-500",
                  agent.status === "running" && "bg-accent/10 text-accent",
                  agent.status === "pending" && "bg-secondary text-muted-foreground",
                )}
              >
                {agent.status === "running" && <Loader2 className="h-3 w-3 animate-spin" />}
                {agent.status === "complete" && <CheckCircle2 className="h-3 w-3" />}
                {agent.status === "pending" && <Clock className="h-3 w-3" />}
                {agent.name}
                {agent.duration && <span className="text-[10px] opacity-70">{agent.duration}s</span>}
              </div>
            ))}
          </div>
        )}

        {!isUser && message.reasoning && (
          <Card className="bg-secondary/30 border-dashed">
            <button
              className="w-full flex items-center justify-between p-3 text-left"
              onClick={() => setShowReasoning(!showReasoning)}
            >
              <span className="text-xs font-medium text-muted-foreground">{t("reasoningProcess")}</span>
              {showReasoning ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {showReasoning && (
              <div className="px-3 pb-3">
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">{message.reasoning}</p>
              </div>
            )}
          </Card>
        )}

        <div
          className={cn(
            "rounded-lg p-4",
            isUser ? "bg-primary text-primary-foreground" : "bg-secondary/50 border border-border",
          )}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-lg font-bold text-foreground mt-4 mb-3 first:mt-0">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-semibold text-foreground mt-4 mb-2 first:mt-0">{children}</h2>
                  ),
                  h3: ({ children }) => <h3 className="text-sm font-semibold text-foreground mt-3 mb-1">{children}</h3>,
                  p: ({ children }) => <p className="text-sm text-foreground/90 mb-2 last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90 mb-2">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-1 text-sm text-foreground/90 mb-2">{children}</ol>
                  ),
                  li: ({ children }) => <li className="text-foreground/90">{children}</li>,
                  code: ({ children }) => (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-3">
                      <table className="w-full border-collapse text-sm">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-secondary/50">{children}</thead>,
                  tbody: ({ children }) => <tbody>{children}</tbody>,
                  tr: ({ children }) => <tr className="border-b border-border">{children}</tr>,
                  th: ({ children }) => <th className="text-left p-2 font-medium text-foreground">{children}</th>,
                  td: ({ children }) => <td className="p-2 text-foreground/90">{children}</td>,
                  hr: () => <hr className="my-4 border-border" />,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-accent pl-4 italic text-foreground/80 my-2">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
              {message.status === "streaming" && <span className="inline-block w-2 h-4 bg-accent animate-pulse ml-1" />}
            </div>
          )}
        </div>

        {!isUser && message.outputBlocks && message.outputBlocks.length > 0 && (
          <div className="space-y-4">{message.outputBlocks.map(renderOutputBlock)}</div>
        )}

        {!isUser && message.citations && message.status === "complete" && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{t("sourcesLabel")}</p>
            <div className="flex flex-wrap gap-2">
              {message.citations.map((citation, i) => (
                <button
                  key={i}
                  onClick={() => handleCitationClick(citation)}
                  className="flex items-center gap-2 text-xs bg-secondary/50 rounded-lg px-3 py-1.5 border border-border hover:border-accent/50 hover:bg-secondary transition-colors cursor-pointer group"
                >
                  <span className="text-foreground">{citation.source}</span>
                  <span className="text-chart-5 font-medium">{citation.confidence}%</span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}

        {!isUser && message.status === "complete" && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground hover:text-foreground"
              onClick={handleCopy}
            >
              {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
              {copied ? t("copied") : t("copy")}
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground hover:text-foreground">
              <RefreshCw className="h-3 w-3 mr-1" />
              {t("regenerate")}
            </Button>
            <div className="flex items-center ml-2">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7",
                  feedback === "up" ? "text-chart-5" : "text-muted-foreground hover:text-chart-5",
                )}
                onClick={() => handleFeedback("up")}
              >
                <ThumbsUp className={cn("h-3 w-3", feedback === "up" && "fill-current")} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7",
                  feedback === "down" ? "text-destructive" : "text-muted-foreground hover:text-destructive",
                )}
                onClick={() => handleFeedback("down")}
              >
                <ThumbsDown className={cn("h-3 w-3", feedback === "down" && "fill-current")} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-medium text-primary-foreground">JD</span>
        </div>
      )}
    </div>
  )
}
