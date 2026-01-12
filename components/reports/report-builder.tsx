/**
 * ReportBuilder Component
 *
 * A multi-step wizard for creating and customizing research reports. Guides users
 * through report configuration including type selection, agent assignment, data sources,
 * audiences, and generation settings.
 *
 * Features:
 * - Multi-step wizard interface
 * - Report type selection (presentation, dashboard, PDF, export, infographic)
 * - AI agent selection for content generation
 * - Data source and market selection
 * - Audience targeting
 * - Real-time generation progress
 * - Template support
 * - Draft saving and editing
 * - Event tracking for analytics
 *
 * @component
 * @module components/reports/report-builder
 *
 * @example
 * ```tsx
 * // Create new report
 * <ReportBuilder />
 *
 * // Edit existing report
 * <ReportBuilder reportId="report-123" />
 *
 * // From template
 * <ReportBuilder
 *   templateId="template-456"
 *   templateTitle="Market Analysis"
 * />
 * ```
 *
 * @see Report
 * @see useReportForm
 */

"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Controller } from "react-hook-form"
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
  AlertCircle,
} from "lucide-react"
import { useReportForm } from "@/hooks/use-report-form"
import {
  REPORT_TYPE_OPTIONS,
  AGENT_OPTIONS,
  DATA_SOURCE_OPTIONS,
  MARKET_OPTIONS,
  AUDIENCE_OPTIONS,
  TIMEFRAME_OPTIONS,
} from "@/lib/schemas/report"
import { useReportTracking, usePageViewTracking } from "@/hooks/useEventTracking"

const reportTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  presentation: Presentation,
  dashboard: BarChart3,
  pdf: FileText,
  export: Download,
  infographic: ImageIcon,
}

interface ReportBuilderProps {
  reportId?: string
  templateId?: string
  templateTitle?: string
  templateDescription?: string
}

export function ReportBuilder({
  reportId,
  templateId,
  templateTitle,
  templateDescription,
}: ReportBuilderProps) {
  const router = useRouter()
  const isTemplateMode = !!templateId

  // Event tracking
  usePageViewTracking({
    pageName: 'Report Builder',
    reportId,
    templateId,
    isEditMode: !!reportId,
  })
  const { trackReportCreate } = useReportTracking()

  const {
    form,
    isEditMode,
    isLoading,
    isSaving,
    loadError,
    saveError,
    step,
    setStep,
    totalSteps,
    generationProgress,
    generationComplete,
    handleSubmit,
    handleViewReport,
    resetErrors,
    getStepValidation,
  } = useReportForm({
    mode: reportId ? "edit" : "create",
    reportId,
    templateTitle,
    templateDescription,
  })

  const { control, watch, setValue, formState: { errors } } = form
  const watchedType = watch("type")
  const watchedDataSources = watch("dataSources")
  const watchedMarkets = watch("markets")
  const watchedAudiences = watch("audiences")

  /**
   * Track report creation when generation completes
   */
  useEffect(() => {
    if (generationComplete && reportId) {
      trackReportCreate(reportId, {
        reportType: watchedType,
        dataSourcesCount: watchedDataSources?.length || 0,
        marketsCount: watchedMarkets?.length || 0,
        audiencesCount: watchedAudiences?.length || 0,
        fromTemplate: isTemplateMode,
        templateId,
      })
    }
  }, [generationComplete, reportId, watchedType, watchedDataSources, watchedMarkets, watchedAudiences, isTemplateMode, templateId, trackReportCreate])

  const handleDownloadReport = () => {
    const title = form.getValues("title")
    const blob = new Blob([`Report: ${title || "Generated Report"}\n\nGenerated successfully.`], {
      type: "text/plain",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title || "report"}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleNextStep = () => {
    const validation = getStepValidation(step)
    if (validation.isValid && step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1)
      resetErrors()
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  // Load error state
  if (loadError) {
    return (
      <div className="flex-1 p-6 max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Error Loading Report</p>
              <p className="text-sm text-muted-foreground">{loadError}</p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/reports">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Reports
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/reports">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Edit Report" : isTemplateMode ? `Create ${templateTitle}` : "Create New Report"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode
              ? "Modify your report settings"
              : isTemplateMode
                ? "Customize your template and generate insights"
                : "Generate insights powered by AI agents"}
          </p>
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
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                >
                  {REPORT_TYPE_OPTIONS.map((type) => {
                    const Icon = reportTypeIcons[type.id]
                    return (
                      <Label key={type.id} htmlFor={type.id} className="cursor-pointer">
                        <Card
                          className={`transition-all h-full ${
                            field.value === type.value
                              ? "border-primary ring-2 ring-primary/20"
                              : "hover:border-muted-foreground/50"
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <RadioGroupItem value={type.value} id={type.id} className="mt-1" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {Icon && <Icon className="h-4 w-4 text-primary" />}
                                  <span className="font-medium">{type.label}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{type.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Label>
                    )
                  })}
                </RadioGroup>
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleNextStep}>
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
            {/* Data Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Data Sources
                </CardTitle>
                <CardDescription>Select which GWI datasets to include</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {DATA_SOURCE_OPTIONS.map((source) => (
                  <label
                    key={source.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer"
                  >
                    <Checkbox
                      checked={watchedDataSources.includes(source.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setValue("dataSources", [...watchedDataSources, source.id], { shouldValidate: true })
                        } else {
                          setValue(
                            "dataSources",
                            watchedDataSources.filter((d) => d !== source.id),
                            { shouldValidate: true }
                          )
                        }
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{source.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {source.markets} markets &bull; {source.respondents} respondents
                      </p>
                    </div>
                  </label>
                ))}
                {errors.dataSources && (
                  <p className="text-sm text-destructive">{errors.dataSources.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Markets */}
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
                  {MARKET_OPTIONS.map((market) => (
                    <Badge
                      key={market}
                      variant={watchedMarkets.includes(market) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (watchedMarkets.includes(market)) {
                          setValue(
                            "markets",
                            watchedMarkets.filter((m) => m !== market),
                            { shouldValidate: true }
                          )
                        } else {
                          setValue("markets", [...watchedMarkets, market], { shouldValidate: true })
                        }
                      }}
                    >
                      {market}
                    </Badge>
                  ))}
                </div>
                {errors.markets && (
                  <p className="text-sm text-destructive mt-2">{errors.markets.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Audiences */}
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
                  {AUDIENCE_OPTIONS.map((audience) => (
                    <label
                      key={audience.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer"
                    >
                      <Checkbox
                        checked={watchedAudiences.includes(audience.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setValue("audiences", [...watchedAudiences, audience.id], { shouldValidate: true })
                          } else {
                            setValue(
                              "audiences",
                              watchedAudiences.filter((a) => a !== audience.id),
                              { shouldValidate: true }
                            )
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
                {errors.audiences && (
                  <p className="text-sm text-destructive mt-2">{errors.audiences.message}</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePrevStep}>
              Back
            </Button>
            <Button onClick={handleNextStep}>
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
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="title"
                      placeholder="e.g., Q4 2024 Consumer Insights Report"
                    />
                  )}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id="description"
                      placeholder="Brief description of what this report should cover..."
                    />
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Agent */}
                <div className="space-y-2">
                  <Label htmlFor="agent">AI Agent</Label>
                  <Controller
                    name="agent"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an agent" />
                        </SelectTrigger>
                        <SelectContent>
                          {AGENT_OPTIONS.map((agent) => (
                            <SelectItem key={agent.id} value={agent.id}>
                              <div>
                                <div className="font-medium">{agent.name}</div>
                                <div className="text-xs text-muted-foreground">{agent.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Timeframe */}
                <div className="space-y-2">
                  <Label htmlFor="timeframe">Timeframe</Label>
                  <Controller
                    name="timeframe"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIMEFRAME_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              {/* Prompt */}
              <div className="space-y-2">
                <Label htmlFor="prompt">What would you like to learn?</Label>
                <Controller
                  name="prompt"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id="prompt"
                      placeholder="Describe the insights you're looking for. Be specific about topics, comparisons, or questions you want answered..."
                      className="min-h-32"
                    />
                  )}
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setValue(
                        "prompt",
                        "What are the key differences in media consumption between Gen Z and Millennials in the US and UK markets?"
                      )
                    }
                  >
                    <Wand2 className="mr-1 h-3 w-3" />
                    Media habits comparison
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setValue(
                        "prompt",
                        "Identify emerging consumer trends around sustainability and eco-conscious purchasing behavior."
                      )
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
            <Button variant="outline" onClick={handlePrevStep}>
              Back
            </Button>
            <Button onClick={handleNextStep}>
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
              {/* Summary Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Output Type</p>
                  <p className="font-medium">
                    {REPORT_TYPE_OPTIONS.find((t) => t.value === watchedType)?.label || watchedType}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">AI Agent</p>
                  <p className="font-medium">
                    {AGENT_OPTIONS.find((a) => a.id === form.getValues("agent"))?.name || "Not selected"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Data Sources</p>
                  <p className="font-medium">{watchedDataSources.length} selected</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Markets</p>
                  <p className="font-medium">{watchedMarkets.length} selected</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Audiences</p>
                  <p className="font-medium">{watchedAudiences.length} selected</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Timeframe</p>
                  <p className="font-medium">
                    {TIMEFRAME_OPTIONS.find((t) => t.value === form.getValues("timeframe"))?.label ||
                      form.getValues("timeframe")}
                  </p>
                </div>
              </div>

              {form.getValues("title") && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-medium">{form.getValues("title")}</p>
                </div>
              )}

              {form.getValues("prompt") && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Query</p>
                  <p className="text-sm">{form.getValues("prompt")}</p>
                </div>
              )}

              {/* Generation Progress */}
              {isSaving && (
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

              {/* Success State */}
              {generationComplete && !isSaving && !saveError && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    <div>
                      <p className="font-medium text-emerald-500">
                        {isEditMode ? "Report Updated Successfully!" : "Report Generated Successfully!"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Your {REPORT_TYPE_OPTIONS.find((t) => t.value === watchedType)?.label?.toLowerCase() || "report"} is ready to view and download.
                      </p>
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

              {/* Error State */}
              {saveError && !isSaving && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                    <div>
                      <p className="font-medium text-destructive">
                        {isEditMode ? "Failed to Update Report" : "Failed to Generate Report"}
                      </p>
                      <p className="text-sm text-muted-foreground">{saveError}</p>
                    </div>
                  </div>
                  <Button onClick={handleSubmit} className="w-full">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                handlePrevStep()
                resetErrors()
              }}
              disabled={isSaving || generationComplete}
            >
              Back
            </Button>
            <div className="flex gap-2">
              {!generationComplete && !saveError && (
                <>
                  <Button variant="outline" disabled={isSaving}>
                    <Settings2 className="mr-2 h-4 w-4" />
                    Advanced Options
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEditMode ? "Updating..." : "Generating..."}
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {isEditMode ? "Update Report" : "Generate Report"}
                      </>
                    )}
                  </Button>
                </>
              )}
              {(generationComplete || saveError) && !isSaving && (
                <Button variant="outline" onClick={() => router.push("/dashboard/reports")}>
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
