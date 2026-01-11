import { z } from 'zod'

// Enum values matching database schema
export const ReportType = {
  PRESENTATION: 'PRESENTATION',
  DASHBOARD: 'DASHBOARD',
  PDF: 'PDF',
  EXPORT: 'EXPORT',
  INFOGRAPHIC: 'INFOGRAPHIC',
} as const

export const ReportStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const

// Available options for form fields
export const REPORT_TYPE_OPTIONS = [
  {
    id: 'presentation',
    value: 'PRESENTATION',
    label: 'Presentation',
    description: 'Generate slide decks for stakeholder presentations',
  },
  {
    id: 'dashboard',
    value: 'DASHBOARD',
    label: 'Dashboard',
    description: 'Create interactive data visualizations',
  },
  {
    id: 'pdf',
    value: 'PDF',
    label: 'PDF Report',
    description: 'Generate detailed written reports with charts',
  },
  {
    id: 'export',
    value: 'EXPORT',
    label: 'Data Export',
    description: 'Export raw data segments and tables',
  },
  {
    id: 'infographic',
    value: 'INFOGRAPHIC',
    label: 'Infographic',
    description: 'Create visual summaries for social sharing',
  },
] as const

export const AGENT_OPTIONS = [
  { id: 'audience', name: 'Audience Explorer', description: 'Deep audience analysis and segmentation' },
  { id: 'persona', name: 'Persona Architect', description: 'Build detailed persona profiles' },
  { id: 'trend', name: 'Trend Forecaster', description: 'Identify emerging trends' },
  { id: 'competitive', name: 'Competitive Tracker', description: 'Competitive landscape analysis' },
  { id: 'culture', name: 'Culture Tracker', description: 'Cultural shifts and movements' },
] as const

export const DATA_SOURCE_OPTIONS = [
  { id: 'core', name: 'GWI Core', markets: 52, respondents: '2.8B' },
  { id: 'usa', name: 'GWI USA', markets: 1, respondents: '350M' },
  { id: 'zeitgeist', name: 'GWI Zeitgeist', markets: 15, respondents: '500M' },
  { id: 'kids', name: 'GWI Kids', markets: 12, respondents: '100M' },
  { id: 'b2b', name: 'GWI B2B', markets: 8, respondents: '50M' },
] as const

export const MARKET_OPTIONS = [
  'United States',
  'United Kingdom',
  'Germany',
  'France',
  'Japan',
  'China',
  'Brazil',
  'India',
  'Australia',
  'Canada',
] as const

export const AUDIENCE_OPTIONS = [
  { id: 'gen-z', name: 'Gen Z (16-24)', size: '2.1B' },
  { id: 'millennials', name: 'Millennials (25-40)', size: '1.8B' },
  { id: 'gen-x', name: 'Gen X (41-56)', size: '1.2B' },
  { id: 'boomers', name: 'Baby Boomers (57-75)', size: '900M' },
  { id: 'tech-savvy', name: 'Tech Enthusiasts', size: '450M' },
  { id: 'eco-conscious', name: 'Eco-Conscious Consumers', size: '380M' },
] as const

export const TIMEFRAME_OPTIONS = [
  { value: 'q4-2024', label: 'Q4 2024' },
  { value: 'q3-2024', label: 'Q3 2024' },
  { value: 'h2-2024', label: 'H2 2024' },
  { value: '2024', label: 'Full Year 2024' },
  { value: 'custom', label: 'Custom Range' },
] as const

// Content schema - what's stored inside the report's content JSON field
export const reportContentSchema = z.object({
  agent: z.string().optional(),
  prompt: z.string().optional(),
  dataSources: z.array(z.string()).min(1, 'Select at least one data source'),
  markets: z.array(z.string()).min(1, 'Select at least one market'),
  audiences: z.array(z.string()).min(1, 'Select at least one audience'),
  timeframe: z.string(),
})

// Form schema - used by React Hook Form on the client
export const reportFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().optional(),
  type: z.enum(['PRESENTATION', 'DASHBOARD', 'PDF', 'EXPORT', 'INFOGRAPHIC']),
  agent: z.string().optional(),
  prompt: z.string().optional(),
  dataSources: z.array(z.string()).min(1, 'Select at least one data source'),
  markets: z.array(z.string()).min(1, 'Select at least one market'),
  audiences: z.array(z.string()).min(1, 'Select at least one audience'),
  timeframe: z.string().min(1, 'Select a timeframe'),
})

// API create schema - matches what the API expects
export const createReportSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  type: z.enum(['PRESENTATION', 'DASHBOARD', 'PDF', 'EXPORT', 'INFOGRAPHIC']),
  content: reportContentSchema.optional(),
  thumbnail: z.string().optional(),
  agentId: z.string().optional(),
})

// API update schema - all fields optional
export const updateReportSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  type: z.enum(['PRESENTATION', 'DASHBOARD', 'PDF', 'EXPORT', 'INFOGRAPHIC']).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  content: reportContentSchema.optional(),
  thumbnail: z.string().optional(),
})

// Type exports
export type ReportFormData = z.infer<typeof reportFormSchema>
export type ReportContent = z.infer<typeof reportContentSchema>
export type CreateReportPayload = z.infer<typeof createReportSchema>
export type UpdateReportPayload = z.infer<typeof updateReportSchema>

// Default form values
export const DEFAULT_FORM_VALUES: ReportFormData = {
  title: '',
  description: '',
  type: 'PRESENTATION',
  agent: '',
  prompt: '',
  dataSources: ['core'],
  markets: ['United States', 'United Kingdom'],
  audiences: ['gen-z', 'millennials'],
  timeframe: 'q4-2024',
}

// Helper to transform form data to API payload
export function formDataToApiPayload(data: ReportFormData): CreateReportPayload {
  return {
    title: data.title,
    description: data.description,
    type: data.type,
    content: {
      agent: data.agent,
      prompt: data.prompt,
      dataSources: data.dataSources,
      markets: data.markets,
      audiences: data.audiences,
      timeframe: data.timeframe,
    },
    agentId: data.agent || undefined,
  }
}

// Helper to transform API response to form data
export function apiResponseToFormData(report: {
  title?: string
  description?: string
  type?: string
  agentId?: string
  content?: Record<string, unknown>
}): ReportFormData {
  const content = report.content || {}

  return {
    title: report.title || '',
    description: report.description || '',
    type: (report.type?.toUpperCase() as ReportFormData['type']) || 'PRESENTATION',
    agent: report.agentId || (content.agent as string) || '',
    prompt: (content.prompt as string) || (content.query as string) || '',
    dataSources: Array.isArray(content.dataSources) ? content.dataSources : ['core'],
    markets: Array.isArray(content.markets) ? content.markets : ['United States', 'United Kingdom'],
    audiences: Array.isArray(content.audiences) ? content.audiences : ['gen-z', 'millennials'],
    timeframe: (content.timeframe as string) || 'q4-2024',
  }
}
