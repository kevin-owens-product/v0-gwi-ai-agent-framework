"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Users, GripVertical, Maximize2, Download, MoreHorizontal, Plus, Sparkles, BarChart3, Table as TableIcon } from "lucide-react"
import { usePlayground, type OutputBlock } from "@/app/dashboard/playground/page"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface CanvasBlock {
  id: string
  type: "persona" | "chart" | "insight" | "comparison" | "table"
  title: string
  data: any
  position: { x: number; y: number }
  size: { width: number; height: number }
}

// Convert OutputBlock from chat to CanvasBlock format
function outputBlockToCanvasBlock(outputBlock: OutputBlock, index: number): CanvasBlock {
  return {
    id: outputBlock.id,
    type: outputBlock.type as CanvasBlock["type"],
    title: outputBlock.title || `${outputBlock.type} output`,
    data: outputBlock.content,
    position: { x: (index % 3) * 300, y: Math.floor(index / 3) * 250 },
    size: {
      width: outputBlock.type === 'table' || outputBlock.type === 'comparison' ? 2 : 1,
      height: outputBlock.type === 'persona' ? 2 : 1
    },
  }
}

function PersonaBlock({ block }: { block: CanvasBlock }) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center overflow-hidden">
          <Users className="h-8 w-8 text-accent" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">{block.title}</h4>
          <p className="text-xs text-muted-foreground">
            {block.data.age} | {block.data.income}
          </p>
        </div>
      </div>
      <div className="space-y-3 flex-1">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">VALUES</p>
          <div className="flex flex-wrap gap-1.5">
            {block.data.values.map((value: string) => (
              <span key={value} className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs">
                {value}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">BEHAVIORS</p>
          <ul className="space-y-1">
            {block.data.behaviors.map((behavior: string) => (
              <li key={behavior} className="text-xs text-muted-foreground flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-accent" />
                {behavior}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function ChartBlock({ block }: { block: CanvasBlock }) {
  const maxValue = Math.max(...block.data.series.flatMap((s: any) => s.data))
  const colors = ["bg-accent", "bg-blue-500", "bg-emerald-500"]

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 mb-4">
        {block.data.series.map((series: any, i: number) => (
          <div key={series.name} className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-sm", colors[i])} />
            <span className="text-xs text-muted-foreground">{series.name}</span>
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col justify-between">
        {block.data.categories.map((cat: string, catIdx: number) => (
          <div key={cat} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-24 truncate">{cat}</span>
            <div className="flex-1 flex items-center gap-1">
              {block.data.series.map((series: any, seriesIdx: number) => (
                <div
                  key={series.name}
                  className={cn("h-5 rounded-sm transition-all", colors[seriesIdx])}
                  style={{ width: `${(series.data[catIdx] / maxValue) * 100}%`, opacity: 0.8 }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function InsightBlock({ block }: { block: CanvasBlock }) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <p className="text-lg font-semibold text-foreground leading-tight mb-2">{block.data.headline}</p>
        <p className="text-sm text-muted-foreground">{block.data.body}</p>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border mt-3">
        <span className="text-xs text-muted-foreground">{block.data.source}</span>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-emerald-500">{block.data.confidence}% confidence</span>
        </div>
      </div>
    </div>
  )
}

function ComparisonBlock({ block }: { block: CanvasBlock }) {
  // Handle different comparison data formats
  if (block.data.items) {
    // New format with items array
    return (
      <div className="h-full overflow-auto">
        <div className="space-y-3">
          {block.data.items.map((item: any) => (
            <div key={item.name} className="border border-border rounded-lg p-3">
              <h4 className="font-medium text-foreground text-sm mb-2">{item.name}</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(item.metrics || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground">{key}:</span>
                    <span className="font-medium text-foreground">{value as string}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Original format with markets and metrics
  return (
    <div className="h-full">
      <div className="grid grid-cols-3 gap-2 text-xs mb-3">
        <div />
        {block.data.markets?.map((market: string) => (
          <div key={market} className="text-center font-medium text-muted-foreground">
            {market}
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {block.data.metrics?.map((metric: any) => (
          <div key={metric.name} className="grid grid-cols-3 gap-2 items-center">
            <span className="text-xs text-muted-foreground">{metric.name}</span>
            {metric.values.map((value: number, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", idx === 0 ? "bg-accent" : "bg-blue-500")}
                    style={{ width: `${value}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-foreground w-8">{value}%</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function TableBlock({ block }: { block: CanvasBlock }) {
  const headers = block.data.headers || []
  const rows = block.data.rows || []

  return (
    <div className="h-full overflow-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            {headers.map((header: string, idx: number) => (
              <th key={idx} className="text-left py-2 px-2 font-medium text-muted-foreground">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: string[], rowIdx: number) => (
            <tr key={rowIdx} className="border-b border-border/50 hover:bg-secondary/30">
              {row.map((cell: string, cellIdx: number) => (
                <td key={cellIdx} className="py-2 px-2 text-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function PlaygroundCanvas() {
  const { selectedBlocks, setSelectedBlocks, messages, addOutput } = usePlayground()
  const [, setHoveredBlock] = useState<string | null>(null)
  const [removedBlockIds, setRemovedBlockIds] = useState<Set<string>>(new Set())

  // Extract all output blocks from messages and convert to canvas blocks
  const blocks = useMemo(() => {
    const allOutputBlocks: OutputBlock[] = []
    messages.forEach((message) => {
      if (message.outputBlocks) {
        message.outputBlocks.forEach((block) => {
          if (!removedBlockIds.has(block.id)) {
            allOutputBlocks.push(block)
          }
        })
      }
    })
    return allOutputBlocks.map((block, index) => outputBlockToCanvasBlock(block, index))
  }, [messages, removedBlockIds])

  const toggleSelect = (blockId: string) => {
    setSelectedBlocks((prev) => (prev.includes(blockId) ? prev.filter((id) => id !== blockId) : [...prev, blockId]))
  }

  const removeBlock = (blockId: string) => {
    setRemovedBlockIds((prev) => new Set([...prev, blockId]))
    setSelectedBlocks((prev) => prev.filter((id) => id !== blockId))
  }

  const renderBlockContent = (block: CanvasBlock) => {
    switch (block.type) {
      case "persona":
        return <PersonaBlock block={block} />
      case "chart":
        return <ChartBlock block={block} />
      case "insight":
        return <InsightBlock block={block} />
      case "comparison":
        return <ComparisonBlock block={block} />
      case "table":
        return <TableBlock block={block} />
      default:
        return null
    }
  }

  return (
    <div className="flex-1 overflow-auto p-6 bg-secondary/20">
      {blocks.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No blocks yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Use the chat to ask questions and generate insights. Output blocks like charts, personas, and comparisons will appear here for you to visualize and export.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => addOutput("chart")}
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                Add Chart
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => addOutput("table")}
              >
                <TableIcon className="h-3 w-3 mr-1" />
                Add Table
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => addOutput("persona")}
              >
                <Users className="h-3 w-3 mr-1" />
                Add Persona
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Or use the toolbar to add blocks manually.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 auto-rows-[200px]">
          {blocks.map((block) => (
            <Card
              key={block.id}
              className={cn(
                "relative p-4 transition-all cursor-pointer group",
                "border-border hover:border-muted-foreground/30",
                selectedBlocks.includes(block.id) && "ring-2 ring-accent border-accent",
                block.size.width === 2 && "col-span-2",
                block.size.height === 2 && "row-span-2",
              )}
              onClick={() => toggleSelect(block.id)}
              onMouseEnter={() => setHoveredBlock(block.id)}
              onMouseLeave={() => setHoveredBlock(null)}
            >
              {/* Drag Handle */}
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Actions */}
              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Maximize2 className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Download className="h-3 w-3" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuItem>Export</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => removeBlock(block.id)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Block Title */}
              <div className="mb-3 pr-20">
                <h3 className="text-sm font-medium text-foreground truncate">{block.title}</h3>
              </div>

              {/* Block Content */}
              <div className="h-[calc(100%-2rem)]">{renderBlockContent(block)}</div>
            </Card>
          ))}

          {/* Add Block Card */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Card className="flex items-center justify-center border-dashed border-2 border-border hover:border-muted-foreground/50 transition-colors cursor-pointer group">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mx-auto mb-2 group-hover:bg-accent/10 transition-colors">
                    <Plus className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    Add Block
                  </p>
                </div>
              </Card>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={() => addOutput("chart")}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Chart
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addOutput("table")}>
                <TableIcon className="h-4 w-4 mr-2" />
                Table
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addOutput("persona")}>
                <Users className="h-4 w-4 mr-2" />
                Persona
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addOutput("comparison")}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Comparison
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}
