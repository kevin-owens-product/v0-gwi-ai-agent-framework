'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import {
  reportFormSchema,
  ReportFormData,
  DEFAULT_FORM_VALUES,
  formDataToApiPayload,
  apiResponseToFormData,
} from '@/lib/schemas/report'

interface UseReportFormOptions {
  mode: 'create' | 'edit'
  reportId?: string
  templateTitle?: string
  templateDescription?: string
}

interface UseReportFormReturn {
  form: UseFormReturn<ReportFormData>
  isEditMode: boolean
  isLoading: boolean
  isSaving: boolean
  loadError: string | null
  saveError: string | null
  step: number
  setStep: (step: number) => void
  totalSteps: number
  generationProgress: number
  generationComplete: boolean
  handleSubmit: () => Promise<void>
  handleViewReport: () => void
  resetErrors: () => void
  canProceedToNextStep: () => boolean
  getStepValidation: (stepNumber: number) => { isValid: boolean; errors: string[] }
}

export function useReportForm({
  mode,
  reportId,
  templateTitle,
  templateDescription,
}: UseReportFormOptions): UseReportFormReturn {
  const router = useRouter()
  const isEditMode = mode === 'edit'
  const totalSteps = 4

  // State
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(isEditMode && !!reportId)
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationComplete, setGenerationComplete] = useState(false)
  const [savedReportId, setSavedReportId] = useState<string | null>(reportId || null)

  // Initialize form with React Hook Form
  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      ...DEFAULT_FORM_VALUES,
      title: templateTitle || '',
      description: templateDescription || '',
    },
    mode: 'onChange',
  })

  // Load existing report data when in edit mode
  useEffect(() => {
    if (!isEditMode || !reportId) return

    async function loadReport() {
      try {
        setIsLoading(true)
        setLoadError(null)

        const response = await fetch(`/api/v1/reports/${reportId}`)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to load report')
        }

        const data = await response.json()
        const report = data.data || data

        if (report) {
          const formData = apiResponseToFormData(report)
          form.reset(formData)
        }
      } catch (error) {
        console.error('Failed to load report:', error)
        setLoadError(error instanceof Error ? error.message : 'Failed to load report. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadReport()
  }, [isEditMode, reportId, form])

  // Reset form when switching between create/edit modes
  useEffect(() => {
    if (!isEditMode && !reportId) {
      form.reset({
        ...DEFAULT_FORM_VALUES,
        title: templateTitle || '',
        description: templateDescription || '',
      })
    }
  }, [isEditMode, reportId, templateTitle, templateDescription, form])

  // Simulate generation progress
  const simulateProgress = useCallback(async () => {
    const steps = [
      { progress: 15, delay: 600 },
      { progress: 35, delay: 600 },
      { progress: 55, delay: 600 },
      { progress: 75, delay: 600 },
      { progress: 90, delay: 600 },
      { progress: 100, delay: 300 },
    ]

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, step.delay))
      setGenerationProgress(step.progress)
    }
  }, [])

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    setSaveError(null)
    setGenerationProgress(0)
    setGenerationComplete(false)

    // Validate form
    const isValid = await form.trigger()
    if (!isValid) {
      const errors = form.formState.errors
      const errorMessages = Object.values(errors)
        .map((e) => e?.message)
        .filter(Boolean)
      setSaveError(errorMessages[0] as string || 'Please fix validation errors')
      return
    }

    setIsSaving(true)

    // Start progress simulation
    const progressPromise = simulateProgress()

    try {
      const formData = form.getValues()
      const payload = formDataToApiPayload(formData)

      let response: Response

      if (isEditMode && reportId) {
        // Update existing report
        response = await fetch(`/api/v1/reports/${reportId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        // Create new report
        response = await fetch('/api/v1/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      // Wait for progress animation to complete
      await progressPromise

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to ${isEditMode ? 'update' : 'create'} report`)
      }

      const result = await response.json()
      const newReportId = result.id || result.data?.id || reportId
      setSavedReportId(newReportId)

      setGenerationComplete(true)
    } catch (error) {
      console.error('Error saving report:', error)
      setSaveError(
        error instanceof Error
          ? error.message
          : `Failed to ${isEditMode ? 'update' : 'create'} report. Please try again.`
      )
      setGenerationProgress(0)
    } finally {
      setIsSaving(false)
    }
  }, [form, isEditMode, reportId, simulateProgress])

  // Navigate to view the report
  const handleViewReport = useCallback(() => {
    const targetId = savedReportId || reportId || `report-${Date.now()}`
    router.push(`/dashboard/reports/${targetId}`)
  }, [savedReportId, reportId, router])

  // Reset errors
  const resetErrors = useCallback(() => {
    setSaveError(null)
    setLoadError(null)
  }, [])

  // Step validation - checks if current step fields are valid
  const getStepValidation = useCallback(
    (stepNumber: number): { isValid: boolean; errors: string[] } => {
      const errors: string[] = []
      const formErrors = form.formState.errors

      switch (stepNumber) {
        case 1:
          // Type selection - always valid as it has a default
          return { isValid: true, errors: [] }

        case 2:
          // Data sources, markets, audiences
          if (formErrors.dataSources?.message) errors.push(formErrors.dataSources.message)
          if (formErrors.markets?.message) errors.push(formErrors.markets.message)
          if (formErrors.audiences?.message) errors.push(formErrors.audiences.message)

          // Also check if arrays are empty
          const values = form.getValues()
          if (values.dataSources.length === 0) errors.push('Select at least one data source')
          if (values.markets.length === 0) errors.push('Select at least one market')
          if (values.audiences.length === 0) errors.push('Select at least one audience')

          return { isValid: errors.length === 0, errors }

        case 3:
          // Title, description, agent, timeframe, prompt
          if (formErrors.title?.message) errors.push(formErrors.title.message)
          if (formErrors.timeframe?.message) errors.push(formErrors.timeframe.message)

          // Title is required
          const titleValue = form.getValues('title')
          if (!titleValue || titleValue.trim() === '') errors.push('Title is required')

          return { isValid: errors.length === 0, errors }

        case 4:
          // Final review - check all fields
          return { isValid: form.formState.isValid, errors: [] }

        default:
          return { isValid: true, errors: [] }
      }
    },
    [form]
  )

  // Check if can proceed to next step
  const canProceedToNextStep = useCallback(() => {
    return getStepValidation(step).isValid
  }, [step, getStepValidation])

  return {
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
    canProceedToNextStep,
    getStepValidation,
  }
}
