"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Presentation,
  FileText,
  BarChart3,
  Download,
  ImageIcon,
  Sparkles,
  Loader2,
  Users,
  Globe,
  CheckCircle2,
  ChevronRight,
  Wand2,
  Settings2,
} from "lucide-react"

const reportTypes = [
  {
    id: "presentation",
    label: "Presentation",
    description: "Generate slide decks for stakeholder presentations",
    icon: Presentation,
  },
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Create interactive data visualizations",
    icon: BarChart3,
  },
  {
    id: "pdf",
    label: "PDF Report",
    description: "Generate detailed written reports with charts",
    icon: FileText,
  },
  {
    id: "export",
    label: "Data Export",
    description: "Export raw data segments and tables",
    icon: Download,
  },
  {
    id: "infographic",
    label: "Infographic",
    description: "Create visual summaries for social sharing",
    icon: ImageIcon,
  },
]

const agents = [
  { id: "audience", name: "Audience Explorer", description: "Deep audience analysis and segmentation" },
  { id: "persona", name: "Persona Architect", description: "Build detailed persona profiles" },
  { id: "trend", name: "Trend Forecaster", description: "Identify emerging trends" },
  { id: "competitive", name: "Competitive Tracker", description: "Competitive landscape analysis" },
  { id: "culture", name: "Culture Tracker", description: "Cultural shifts and movements" },
]

const dataSources = [
  { id: "core", name: "GWI Core", markets: 52, respondents: "2.8B" },
  { id: "usa", name: "GWI USA", markets: 1, respondents: "350M" },
  { id: "zeitgeist", name: "GWI Zeitgeist", markets: 15, respondents: "500M" },
  { id: "kids", name: "GWI Kids", markets: 12, respondents: "100M" },
  { id: "b2b", name: "GWI B2B", markets: 8, respondents: "50M" },
]

const markets = [
  "United States",
  "United Kingdom",
  "Germany",
  "France",
  "Japan",
  "China",
  "Brazil",
  "India",
  "Australia",
  "Canada",
]

const audiences = [
  { id: "gen-z", name: "Gen Z (16-24)", size: "2.1B" },
  { id: "millennials", name: "Millennials (25-40)", size: "1.8B" },
  { id: "gen-x", name: "Gen X (41-56)", size: "1.2B" },
  { id: "boomers", name: "Baby Boomers (57-75)", size: "900M" },
  { id: "tech-savvy", name: "Tech Enthusiasts", size: "450M" },
  { id: "eco-conscious", name: "Eco-Conscious Consumers", size: "380M" },
]

interface ReportBuilderProps {
  reportId?: string
}

export function ReportBuilder({ reportId }: ReportBuilderProps) {
  const router = useRouter()
  const isEditMode = !!reportId
  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationComplete, setGenerationComplete] = useState(false)
  const [selectedType, setSelectedType] = useState("presentation")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    agent: "",
    prompt: "",
    dataSources: ["core"],
    markets: ["United States", "United Kingdom"],
    audiences: ["gen-z", "millennials"],
    timeframe: "q4-2024",
  })

  // Load existing report data when editing
  useEffect(() => {
    if (reportId) {
      async function loadReport() {
        try {
          const response = await fetch(`/api/v1/reports/${reportId}`)
          if (response.ok) {
            const data = await response.json()
            const report = data.data || data
            if (report) {
              setFormData({
                title: report.name || report.title || "",
                description: report.description || "",
                agent: report.agent || "",
                prompt: report.prompt || report.query || "",
                dataSources: report.dataSources || ["core"],
                markets: report.markets || ["United States", "United Kingdom"],
                audiences: report.audiences || ["gen-z", "millennials"],
                timeframe: report.timeframe || "q4-2024",
              })
              setSelectedType(report.type?.toLowerCase() || "presentation")
            }
          }
        } catch (error) {
          console.error("Failed to load report:", error)
        } finally {
          setIsLoading(false)
        }
      }
      loadReport()
    }
  }, [reportId])

  const handleGenerate = async () => {
    setIsGenerating(true)
    setGenerationProgress(0)
    setGenerationComplete(false)

    const steps = [
      { progress: 15, label: "Analyzing data sources..." },
      { progress: 35, label: "Processing audience segments..." },
      { progress: 55, label: "Generating insights..." },
      { progress: 75, label: "Creating visualizations..." },
      { progress: 90, label: "Formatting output..." },
      { progress: 100, label: "Complete!" },
    ]

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 800))
      setGenerationProgress(step.progress)
    }

    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsGenerating(false)
    setGenerationComplete(true)
  }

  const handleViewReport = () => {
    // Generate a report ID and navigate to it
    const reportId = `report-${Date.now()}`
    router.push(`/dashboard/reports/${reportId}`)
  }

  const handleDownloadReport = () => {
    // Simulate download - in real app would generate file
    const blob = new Blob([`Report: ${formData.title || 'Generated Report'}\n\nGenerated successfully.`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${formData.title || 'report'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalSteps = 4

  if (isLoading) {
    return (
      <div className="flex-1 p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/reports">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{isEditMode ? "Edit Report" : "Create New Report"}</h1>
          <p className="text-muted-foreground">{isEditMode ? "Modify your report settings" : "Generate insights powered by AI agents"}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          Step {step} of {totalSteps}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                s < step
                  ? "bg-primary text-primary-foreground"
                  : s === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {s < step ? <CheckCircle2 className="h-5 w-5" /> : s}
            </div>
            <span className={`text-sm hidden sm:block ${s === step ? "font-medium" : "text-muted-foreground"}`}>
              {s === 1 && "Output Type"}
              {s === 2 && "Data Sources"}
              {s === 3 && "Configure"}
              {s === 4 && "Generate"}
            </span>
            {s < 4 && <div className={`flex-1 h-0.5 ${s < step ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Report Type */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="space-y-4">
            <Label className="text-lg font-semibold">What type of output do you need?</Label>
            <RadioGroup
              value={selectedType}
              onValueChange={setSelectedType}
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {reportTypes.map((type) => (
                <Label key={type.id} htmlFor={type.id} className="cursor-pointer">
                  <Card
                    className={`transition-all h-full ${
                      selectedType === type.id
                        ? "border-primary ring-2 ring-primary/20"
                        : "hover:border-muted-foreground/50"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value={type.id} id={type.id} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <type.icon className="h-4 w-4 text-primary" />
                            <span className="font-medium">{type.label}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setStep(2)}>
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Data Sources */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Data Sources
                </CardTitle>
                <CardDescription>Select which GWI datasets to include</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dataSources.map((source) => (
                  <label
                    key={source.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer"
                  >
                    <Checkbox
                      checked={formData.dataSources.includes(source.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({ ...formData, dataSources: [...formData.dataSources, source.id] })
                        } else {
                          setFormData({ ...formData, dataSources: formData.dataSources.filter((d) => d !== source.id) })
                        }
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{source.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {source.markets} markets • {source.respondents} respondents
                      </p>
                    </div>
                  </label>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Markets
                </CardTitle>
                <CardDescription>Choose geographic markets to analyze</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {markets.map((market) => (
                    <Badge
                      key={market}
                      variant={formData.markets.includes(market) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (formData.markets.includes(market)) {
                          setFormData({ ...formData, markets: formData.markets.filter((m) => m !== market) })
                        } else {
                          setFormData({ ...formData, markets: [...formData.markets, market] })
                        }
                      }}
                    >
                      {market}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Target Audiences
                </CardTitle>
                <CardDescription>Select audience segments to analyze</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {audiences.map((audience) => (
                    <label
                      key={audience.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer"
                    >
                      <Checkbox
                        checked={formData.audiences.includes(audience.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, audiences: [...formData.audiences, audience.id] })
                          } else {
                            setFormData({ ...formData, audiences: formData.audiences.filter((a) => a !== audience.id) })
                          }
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{audience.name}</p>
                        <p className="text-xs text-muted-foreground">{audience.size} represented</p>
                      </div>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={() => setStep(3)}>
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Configure */}
      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
              <CardDescription>Provide information about your report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Q4 2024 Consumer Insights Report"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of what this report should cover..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="agent">AI Agent</Label>
                  <Select value={formData.agent} onValueChange={(value) => setFormData({ ...formData, agent: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          <div>
                            <div className="font-medium">{agent.name}</div>
                            <div className="text-xs text-muted-foreground">{agent.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeframe">Timeframe</Label>
                  <Select
                    value={formData.timeframe}
                    onValueChange={(value) => setFormData({ ...formData, timeframe: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="q4-2024">Q4 2024</SelectItem>
                      <SelectItem value="q3-2024">Q3 2024</SelectItem>
                      <SelectItem value="h2-2024">H2 2024</SelectItem>
                      <SelectItem value="2024">Full Year 2024</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">What would you like to learn?</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe the insights you're looking for. Be specific about topics, comparisons, or questions you want answered..."
                  className="min-h-32"
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        prompt:
                          "What are the key differences in media consumption between Gen Z and Millennials in the US and UK markets?",
                      })
                    }
                  >
                    <Wand2 className="mr-1 h-3 w-3" />
                    Media habits comparison
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        prompt:
                          "Identify emerging consumer trends around sustainability and eco-conscious purchasing behavior.",
                      })
                    }
                  >
                    <Wand2 className="mr-1 h-3 w-3" />
                    Sustainability trends
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button onClick={() => setStep(4)}>
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Generate */}
      {step === 4 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review & Generate</CardTitle>
              <CardDescription>Review your configuration before generating</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Output Type</p>
                  <p className="font-medium capitalize">{selectedType}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">AI Agent</p>
                  <p className="font-medium">{agents.find((a) => a.id === formData.agent)?.name || "Not selected"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Data Sources</p>
                  <p className="font-medium">{formData.dataSources.length} selected</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Markets</p>
                  <p className="font-medium">{formData.markets.length} selected</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Audiences</p>
                  <p className="font-medium">{formData.audiences.length} selected</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Timeframe</p>
                  <p className="font-medium">{formData.timeframe.replace("-", " ").toUpperCase()}</p>
                </div>
              </div>

              {formData.title && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-medium">{formData.title}</p>
                </div>
              )}

              {formData.prompt && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Query</p>
                  <p className="text-sm">{formData.prompt}</p>
                </div>
              )}

              {isGenerating && (
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span>Generating report...</span>
                    <span className="text-muted-foreground">{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} />
                  <p className="text-sm text-muted-foreground">
                    {generationProgress < 20 && "Analyzing data sources..."}
                    {generationProgress >= 20 && generationProgress < 40 && "Processing audience segments..."}
                    {generationProgress >= 40 && generationProgress < 60 && "Generating insights..."}
                    {generationProgress >= 60 && generationProgress < 80 && "Creating visualizations..."}
                    {generationProgress >= 80 && generationProgress < 100 && "Formatting output..."}
                    {generationProgress === 100 && "Complete!"}
                  </p>
                </div>
              )}

              {generationComplete && !isGenerating && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    <div>
                      <p className="font-medium text-emerald-500">Report Generated Successfully!</p>
                      <p className="text-sm text-muted-foreground">Your {selectedType} is ready to view and download.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleViewReport} className="flex-1">
                      <FileText className="mr-2 h-4 w-4" />
                      View Report
                    </Button>
                    <Button variant="outline" onClick={handleDownloadReport} className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)} disabled={isGenerating || generationComplete}>
              Back
            </Button>
            <div className="flex gap-2">
              {!generationComplete && (
                <>
                  <Button variant="outline" disabled={isGenerating}>
                    <Settings2 className="mr-2 h-4 w-4" />
                    Advanced Options
                  </Button>
                  <Button onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </>
              )}
              {generationComplete && (
                <Button variant="outline" onClick={() => router.push('/dashboard/reports')}>
                  Back to Reports
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
