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
import { useTranslations } from "next-intl"
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
  const t = useTranslations("reports")
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
              <p className="font-medium text-destructive">{t("builder.errorLoadingReport")}</p>
              <p className="text-sm text-muted-foreground">{loadError}</p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/reports">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("builder.backToReports")}
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
            {isEditMode ? t("builder.editReport") : isTemplateMode ? t("builder.createTemplate", { title: templateTitle || "" }) : t("builder.createNewReport")}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode
              ? t("builder.modifySettings")
              : isTemplateMode
                ? t("builder.customizeTemplate")
                : t("builder.generateInsights")}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {t("builder.stepOf", { step, totalSteps })}
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
              {s === 1 && t("builder.steps.outputType")}
              {s === 2 && t("builder.steps.dataSources")}
              {s === 3 && t("builder.steps.configure")}
              {s === 4 && t("builder.steps.generate")}
            </span>
            {s < 4 && <div className={`flex-1 h-0.5 ${s < step ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Report Type */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="space-y-4">
            <Label className="text-lg font-semibold">{t("builder.whatOutputType")}</Label>
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
              {t("builder.continue")}
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
                  {t("builder.dataSources")}
                </CardTitle>
                <CardDescription>{t("builder.selectDatasets")}</CardDescription>
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
                  {t("builder.markets")}
                </CardTitle>
                <CardDescription>{t("builder.chooseMarkets")}</CardDescription>
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
                  {t("builder.targetAudiences")}
                </CardTitle>
                <CardDescription>{t("builder.selectAudiences")}</CardDescription>
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
              {t("builder.back")}
            </Button>
            <Button onClick={handleNextStep}>
              {t("builder.continue")}
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
              <CardTitle>{t("builder.reportDetails")}</CardTitle>
              <CardDescription>{t("builder.provideInformation")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  {t("builder.title")} <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="title"
                      placeholder={t("builder.titlePlaceholder")}
                    />
                  )}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">{t("builder.descriptionOptional")}</Label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id="description"
                      placeholder={t("builder.descriptionPlaceholder")}
                    />
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Agent */}
                <div className="space-y-2">
                  <Label htmlFor="agent">{t("builder.aiAgent")}</Label>
                  <Controller
                    name="agent"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("builder.selectAgent")} />
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
                  <Label htmlFor="timeframe">{t("builder.timeframe")}</Label>
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
                <Label htmlFor="prompt">{t("builder.whatToLearn")}</Label>
                <Controller
                  name="prompt"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id="prompt"
                      placeholder={t("builder.promptPlaceholder")}
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
                    {t("builder.mediaHabitsComparison")}
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
                    {t("builder.sustainabilityTrends")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePrevStep}>
              {t("builder.back")}
            </Button>
            <Button onClick={handleNextStep}>
              {t("builder.continue")}
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
              <CardTitle>{t("builder.reviewAndGenerate")}</CardTitle>
              <CardDescription>{t("builder.reviewConfiguration")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t("builder.summary.outputType")}</p>
                  <p className="font-medium">
                    {REPORT_TYPE_OPTIONS.find((rt) => rt.value === watchedType)?.label || watchedType}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t("builder.summary.aiAgent")}</p>
                  <p className="font-medium">
                    {AGENT_OPTIONS.find((a) => a.id === form.getValues("agent"))?.name || t("builder.notSelected")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t("builder.summary.dataSources")}</p>
                  <p className="font-medium">{t("builder.selected", { count: watchedDataSources.length })}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t("builder.summary.markets")}</p>
                  <p className="font-medium">{t("builder.selected", { count: watchedMarkets.length })}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t("builder.summary.audiences")}</p>
                  <p className="font-medium">{t("builder.selected", { count: watchedAudiences.length })}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t("builder.summary.timeframe")}</p>
                  <p className="font-medium">
                    {TIMEFRAME_OPTIONS.find((tf) => tf.value === form.getValues("timeframe"))?.label ||
                      form.getValues("timeframe")}
                  </p>
                </div>
              </div>

              {form.getValues("title") && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t("builder.summary.title")}</p>
                  <p className="font-medium">{form.getValues("title")}</p>
                </div>
              )}

              {form.getValues("prompt") && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t("builder.summary.query")}</p>
                  <p className="text-sm">{form.getValues("prompt")}</p>
                </div>
              )}

              {/* Generation Progress */}
              {isSaving && (
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span>{t("builder.progress.generating")}</span>
                    <span className="text-muted-foreground">{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} />
                  <p className="text-sm text-muted-foreground">
                    {generationProgress < 20 && t("builder.progress.analyzingData")}
                    {generationProgress >= 20 && generationProgress < 40 && t("builder.progress.processingAudiences")}
                    {generationProgress >= 40 && generationProgress < 60 && t("builder.progress.generatingInsights")}
                    {generationProgress >= 60 && generationProgress < 80 && t("builder.progress.creatingVisualizations")}
                    {generationProgress >= 80 && generationProgress < 100 && t("builder.progress.formattingOutput")}
                    {generationProgress === 100 && t("builder.progress.complete")}
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
                        {isEditMode ? t("builder.success.reportUpdated") : t("builder.success.reportGenerated")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("builder.success.readyToView", { type: REPORT_TYPE_OPTIONS.find((rt) => rt.value === watchedType)?.label?.toLowerCase() || "report" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleViewReport} className="flex-1">
                      <FileText className="mr-2 h-4 w-4" />
                      {t("builder.viewReport")}
                    </Button>
                    <Button variant="outline" onClick={handleDownloadReport} className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      {t("builder.download")}
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
                        {isEditMode ? t("builder.error.failedToUpdate") : t("builder.error.failedToGenerate")}
                      </p>
                      <p className="text-sm text-muted-foreground">{saveError}</p>
                    </div>
                  </div>
                  <Button onClick={handleSubmit} className="w-full">
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t("builder.tryAgain")}
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
              {t("builder.back")}
            </Button>
            <div className="flex gap-2">
              {!generationComplete && !saveError && (
                <>
                  <Button variant="outline" disabled={isSaving}>
                    <Settings2 className="mr-2 h-4 w-4" />
                    {t("builder.advancedOptions")}
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEditMode ? t("builder.updating") : t("builder.generatingButton")}
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {isEditMode ? t("builder.updateReport") : t("builder.generateReport")}
                      </>
                    )}
                  </Button>
                </>
              )}
              {(generationComplete || saveError) && !isSaving && (
                <Button variant="outline" onClick={() => router.push("/dashboard/reports")}>
                  {t("builder.backToReports")}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
