/**
 * GWI Tools Type Definitions
 *
 * Defines the interface for tools that agents can invoke to interact
 * with GWI platform data operations.
 */

// JSON Schema types for tool parameters
export interface JSONSchemaProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  description?: string
  enum?: string[]
  items?: JSONSchemaProperty
  properties?: Record<string, JSONSchemaProperty>
  required?: string[]
  default?: unknown
  minimum?: number
  maximum?: number
}

export interface JSONSchema {
  type: 'object'
  properties: Record<string, JSONSchemaProperty>
  required: string[]
}

// Tool category types
export type ToolCategory =
  | 'audience'      // Audience creation and management
  | 'data'          // Data fetching and metrics
  | 'visualization' // Charts and dashboards
  | 'analysis'      // Crosstabs, insights, brand tracking
  | 'reporting'     // Report generation

// Execution context passed to tools
export interface ToolExecutionContext {
  orgId: string
  userId: string
  agentId?: string
  workflowId?: string
  runId: string
  sessionId?: string
  memory?: MemoryItem[]
}

// Memory item for context
export interface MemoryItem {
  key: string
  value: unknown
  type: string
  createdAt: Date
}

// Tool execution result
export interface ToolResult {
  success: boolean
  data?: unknown
  error?: string
  metadata?: {
    executionTimeMs: number
    resourcesCreated?: ResourceReference[]
    tokensUsed?: number
    cached?: boolean
  }
}

// Reference to created resources
export interface ResourceReference {
  type: 'audience' | 'crosstab' | 'chart' | 'dashboard' | 'insight'
  id: string
  name?: string
}

// Core tool interface
export interface GWITool {
  name: string
  description: string
  category: ToolCategory
  parameters: JSONSchema
  returns: {
    type: string
    description: string
  }
  execute: (params: Record<string, unknown>, context: ToolExecutionContext) => Promise<ToolResult>
}

// Tool call record for tracking
export interface ToolCallRecord {
  toolName: string
  input: Record<string, unknown>
  result: ToolResult
  startedAt: Date
  completedAt: Date
  context: {
    agentId?: string
    workflowId?: string
    runId: string
  }
}

// Schema format for Claude/OpenAI function calling
export interface LLMToolSchema {
  name: string
  description: string
  input_schema: JSONSchema
}

// Tool use block from Claude API
export interface ToolUseBlock {
  type: 'tool_use'
  id: string
  name: string
  input: Record<string, unknown>
}

// Tool result block for Claude API
export interface ToolResultBlock {
  type: 'tool_result'
  tool_use_id: string
  content: string
  is_error?: boolean
}

// Extended agent execution result with tools
export interface AgentExecutionWithToolsResult {
  response: string
  toolCalls: ToolCallRecord[]
  tokensUsed: number
  model: string
  provider: string
  resourcesCreated: ResourceReference[]
  metadata?: Record<string, unknown>
}

// Workflow step with tool support
export type WorkflowStepType =
  | 'agent'      // Execute an agent
  | 'tool'       // Execute a GWI tool directly
  | 'condition'  // Conditional branching
  | 'transform'  // Data transformation
  | 'parallel'   // Parallel execution of multiple steps

export interface WorkflowToolStepConfig {
  toolName: string
  parameters: Record<string, unknown>  // Can include template refs like "{{step-1.audienceId}}"
  outputMapping?: Record<string, string>
  continueOnError?: boolean
}

export interface WorkflowAgentStepConfig {
  agentId: string
  input: Record<string, unknown>
  enableTools?: boolean
  allowedTools?: string[]
}

export interface WorkflowConditionStepConfig {
  expression: string  // e.g., "{{step-1.data.size}} > 1000"
  trueStep: string
  falseStep: string
}

export interface WorkflowTransformStepConfig {
  inputMapping: Record<string, string>
  transformations: Array<{
    field: string
    operation: 'extract' | 'map' | 'filter' | 'aggregate' | 'format'
    config: Record<string, unknown>
  }>
  outputVariable: string
}

export interface WorkflowParallelStepConfig {
  steps: string[]  // Step IDs to execute in parallel
  waitForAll: boolean
}

export interface WorkflowStep {
  id: string
  type: WorkflowStepType
  name: string
  config:
    | WorkflowToolStepConfig
    | WorkflowAgentStepConfig
    | WorkflowConditionStepConfig
    | WorkflowTransformStepConfig
    | WorkflowParallelStepConfig
  onSuccess?: string  // Next step ID
  onError?: string    // Error handler step ID
  retryConfig?: {
    maxRetries: number
    backoffMs: number
  }
}

// Template with tool integration
export interface TemplateToolAction {
  toolName: string
  parameters: Record<string, unknown>
  storeAs?: string  // Variable name to store result
}

export interface TemplateToolIntegration {
  suggestedTools?: string[]
  preToolActions?: TemplateToolAction[]
  postToolActions?: TemplateToolAction[]
  outputToTool?: {
    toolName: string
    parameterMapping: Record<string, string>
  }
}

// Audience criteria types
export interface AudienceCriteria {
  dimension: string
  operator: 'equals' | 'contains' | 'between' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_in'
  value: string | number | string[] | number[]
}

// Chart configuration types
export interface ChartConfiguration {
  title?: string
  xAxis?: {
    label: string
    field: string
  }
  yAxis?: {
    label: string
    field: string
  }
  colors?: string[]
  legend?: boolean
  stacked?: boolean
}

// Dashboard widget types
export interface DashboardWidget {
  id: string
  type: 'chart' | 'metric' | 'table' | 'text' | 'crosstab'
  title: string
  dataSource?: string
  config: Record<string, unknown>
  position: {
    x: number
    y: number
    width: number
    height: number
  }
}

// Insight generation types
export interface InsightRequest {
  dataType: 'crosstab' | 'audience' | 'brand_tracking'
  dataId: string
  focusAreas?: string[]
}

export interface GeneratedInsight {
  title: string
  description: string
  type: 'trend' | 'anomaly' | 'comparison' | 'recommendation'
  confidence: number
  data?: Record<string, unknown>
  citations?: string[]
}
