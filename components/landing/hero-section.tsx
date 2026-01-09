"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Command, Sparkles, LayoutGrid, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function HeroSection() {
  const [activeMode, setActiveMode] = useState<"chat" | "canvas" | "split">("chat")

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/30 rounded-full blur-[120px] opacity-20" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            Now with Advanced Playground, Inbox Agents & Report Builder
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1] text-balance">
            AI agents that
            <br />
            <span className="text-muted-foreground">understand people.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
            Build autonomous workflows that analyze human behavior, uncover audience motivations, and deliver strategic
            insights—all powered by the world&apos;s largest study of consumers.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2 px-8">
                Start Building
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="gap-2 px-8 bg-transparent">
              <Play className="h-4 w-4" />
              Watch Demo
            </Button>
          </div>

          <p className="mt-4 text-sm text-muted-foreground/60 flex items-center justify-center gap-2">
            <Command className="h-3 w-3" />
            <span>
              Press <kbd className="px-1.5 py-0.5 rounded bg-secondary text-xs">⌘K</kbd> anywhere to access templates
            </span>
          </p>
        </div>

        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-chart-3/60" />
                  <div className="w-3 h-3 rounded-full bg-chart-5/60" />
                </div>
                <span className="text-xs text-muted-foreground font-mono">GWI Insights Playground</span>
              </div>
              {/* Mode switcher */}
              <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
                <button
                  onClick={() => setActiveMode("chat")}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${
                    activeMode === "chat"
                      ? "bg-background text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <MessageSquare className="h-3 w-3" />
                  Chat
                </button>
                <button
                  onClick={() => setActiveMode("canvas")}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${
                    activeMode === "canvas"
                      ? "bg-background text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutGrid className="h-3 w-3" />
                  Canvas
                </button>
                <button
                  onClick={() => setActiveMode("split")}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${
                    activeMode === "split"
                      ? "bg-background text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sparkles className="h-3 w-3" />
                  Split
                </button>
              </div>
            </div>
            <div className="p-6 bg-card/50">
              {activeMode === "chat" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="rounded-lg border border-border bg-secondary/30 p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-accent">AI</span>
                        </div>
                        <div className="space-y-2 flex-1">
                          <p className="text-sm text-foreground">
                            Analyzing Gen Z motivations around sustainable fashion choices and brand loyalty drivers...
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                              <div className="h-full w-3/4 bg-accent rounded-full animate-pulse" />
                            </div>
                            <span className="text-xs text-muted-foreground">75%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-secondary/30 p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-chart-2/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-chart-2">PA</span>
                        </div>
                        <div className="space-y-2 flex-1">
                          <p className="text-sm text-muted-foreground">Persona Architect agent spawned</p>
                          <p className="text-xs text-muted-foreground/70">
                            Building detailed audience personas based on behavioral patterns and values
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <h4 className="text-sm font-medium text-foreground mb-3">Active Agents</h4>
                    <div className="space-y-3">
                      {["Audience Explorer", "Persona Architect", "Culture Tracker"].map((agent, i) => (
                        <div key={agent} className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${i === 0 ? "bg-chart-5 animate-pulse" : "bg-muted-foreground/30"}`}
                          />
                          <span className="text-xs text-muted-foreground">{agent}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {activeMode === "canvas" && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded bg-chart-1/20 flex items-center justify-center">
                        <span className="text-[10px] font-medium text-chart-1">P</span>
                      </div>
                      <span className="text-xs font-medium text-foreground">Persona Card</span>
                    </div>
                    <div className="text-center py-4">
                      <div className="w-12 h-12 rounded-full bg-chart-2/20 mx-auto mb-2" />
                      <p className="text-xs font-medium text-foreground">Eco-Conscious Emma</p>
                      <p className="text-[10px] text-muted-foreground">Gen Z, Urban, 18-24</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded bg-chart-3/20 flex items-center justify-center">
                        <span className="text-[10px] font-medium text-chart-3">C</span>
                      </div>
                      <span className="text-xs font-medium text-foreground">Chart</span>
                    </div>
                    <div className="h-20 flex items-end gap-1 px-2">
                      {[40, 65, 45, 80, 55, 70].map((h, i) => (
                        <div key={i} className="flex-1 bg-accent/60 rounded-t" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded bg-chart-5/20 flex items-center justify-center">
                        <span className="text-[10px] font-medium text-chart-5">I</span>
                      </div>
                      <span className="text-xs font-medium text-foreground">Insight</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      73% of Gen Z prioritize brand authenticity over price
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      <div className="h-1 flex-1 bg-chart-5/30 rounded-full">
                        <div className="h-full w-[73%] bg-chart-5 rounded-full" />
                      </div>
                      <span className="text-[10px] text-chart-5">73%</span>
                    </div>
                  </div>
                </div>
              )}
              {activeMode === "split" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="rounded-lg border border-border bg-secondary/30 p-3">
                      <p className="text-xs text-muted-foreground">
                        You: Compare sustainability attitudes between Gen Z and Millennials
                      </p>
                    </div>
                    <div className="rounded-lg border border-accent/30 bg-accent/5 p-3">
                      <p className="text-xs text-foreground">
                        Based on our analysis of 450K consumers across 12 markets, Gen Z shows 34% higher engagement
                        with sustainability messaging...
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-foreground">Comparison Chart</span>
                      <span className="text-[10px] text-muted-foreground">Live Preview</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground w-16">Gen Z</span>
                        <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-[78%] bg-chart-1 rounded-full" />
                        </div>
                        <span className="text-[10px] text-chart-1">78%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground w-16">Millennials</span>
                        <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-[58%] bg-chart-2 rounded-full" />
                        </div>
                        <span className="text-[10px] text-chart-2">58%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
