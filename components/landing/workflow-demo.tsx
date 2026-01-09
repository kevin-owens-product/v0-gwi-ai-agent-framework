"use client"

import { useState } from "react"
import { CheckCircle2, Circle, ChevronRight, ArrowRight } from "lucide-react"

const steps = [
  { id: 1, name: "Define Objective", description: "Set your research goal and target audience" },
  { id: 2, name: "Select Agents", description: "Choose specialized agents for your workflow" },
  { id: 3, name: "Configure Pipeline", description: "Connect agents and define data flows" },
  { id: 4, name: "Execute & Monitor", description: "Run workflow with real-time progress" },
  { id: 5, name: "Review & Export", description: "Verify insights and export deliverables" },
]

export function WorkflowDemo() {
  const [activeStep, setActiveStep] = useState(2)

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Build workflows in minutes,
              <br />
              <span className="text-muted-foreground">not weeks</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Our visual workflow builder lets you connect agents, define triggers, and orchestrate complex research
              pipelines without writing code.
            </p>
            <div className="space-y-3">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left ${
                    activeStep === step.id
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  {step.id < activeStep ? (
                    <CheckCircle2 className="h-5 w-5 text-chart-5 flex-shrink-0" />
                  ) : step.id === activeStep ? (
                    <div className="h-5 w-5 rounded-full border-2 border-accent flex items-center justify-center flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-accent" />
                    </div>
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/40 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium ${activeStep === step.id ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {step.name}
                    </p>
                    <p className="text-sm text-muted-foreground/70 truncate">{step.description}</p>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 flex-shrink-0 ${activeStep === step.id ? "text-accent" : "text-muted-foreground/40"}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-medium text-foreground">Workflow Preview</h4>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                Step {activeStep} of 5
              </span>
            </div>
            <div className="space-y-4">
              {/* Visual workflow representation */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                  <span className="text-xs font-medium text-accent">IN</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="w-12 h-12 rounded-lg bg-chart-1/20 flex items-center justify-center">
                  <span className="text-xs font-medium text-chart-1">AS</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="w-12 h-12 rounded-lg bg-chart-2/20 flex items-center justify-center">
                  <span className="text-xs font-medium text-chart-2">CB</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="w-12 h-12 rounded-lg bg-chart-5/20 flex items-center justify-center">
                  <span className="text-xs font-medium text-chart-5">OUT</span>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <p className="text-sm text-muted-foreground">
                  {activeStep === 1 &&
                    "Research objective: Identify Gen Z consumers interested in sustainable fashion across EU markets"}
                  {activeStep === 2 &&
                    "Selected agents: Audience Strategist → Creative Brief Builder → Trend Forecaster"}
                  {activeStep === 3 && "Pipeline configured with automatic handoffs and quality checkpoints"}
                  {activeStep === 4 && "Executing workflow... Processing 2.4M consumer records across 8 markets"}
                  {activeStep === 5 && "Analysis complete. 12 insights generated with 94% confidence score."}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-chart-5" />
                  <span className="text-muted-foreground">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-muted-foreground">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                  <span className="text-muted-foreground">Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
