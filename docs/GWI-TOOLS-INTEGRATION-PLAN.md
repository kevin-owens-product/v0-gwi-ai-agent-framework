# GWI Tools Integration Plan

## Executive Summary

This document outlines a comprehensive plan to better integrate traditional GWI data tools with the agent, workflow, and template systems in the GWI AI Agent Framework. Currently, these systems operate in relative isolation - agents can generate insights through LLM calls, but they cannot programmatically interact with GWI's core data operations (audiences, crosstabs, charts, dashboards, brand tracking).

**Goal**: Enable agents and workflows to directly invoke GWI data operations as callable tools, creating a seamless bridge between AI reasoning and structured data operations.

---

## Current State Analysis

### What Exists Today

#### GWI Data Tools (Traditional)
| Tool | Location | Purpose | Integration Status |
|------|----------|---------|-------------------|
| Spark MCP Query | `/app/api/gwi/spark-mcp/query` | Conversational AI queries | Isolated API |
| Audience Creation | `/app/api/gwi/platform/audiences/create` | Create audience segments | Isolated API |
| Data Fetching | `/app/api/gwi/platform/data` | Fetch metrics for audiences | Isolated API |
| Crosstab Generation | `/app/api/gwi/platform/crosstab` | Cross-tabular analysis | Isolated API |
| Charts | `/app/api/v1/charts` | Data visualization | Manual creation only |
| Dashboards | `/app/api/v1/dashboards` | Widget composition | Manual creation only |
| Brand Tracking | `/app/api/v1/brand-tracking` | Brand health monitoring | No automated analysis |

#### Agent System
- 13 pre-built agents in marketplace (`lib/store-agents.ts`)
- Agent execution via LLM providers (Anthropic, OpenAI, GWI Spark)
- AgentRun tracking and history
- Memory system for context persistence
- **Limitation**: Agents generate text responses only; cannot invoke data operations

#### Workflow System
- Sequential agent orchestration
- Scheduling (hourly, daily, weekly, monthly)
- Context passing between agent steps
- Email notifications on completion
- **Limitation**: Cannot include data operation steps between agents

#### Template System
- 20+ prompt templates across categories
- Variable interpolation system
- Integration with reports, crosstabs, audiences
- **Limitation**: Templates are static prompts, not tool definitions

### Key Integration Gaps

```
┌─────────────────────────────────────────────────────────────────┐
│                    CURRENT ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐                    ┌──────────────┐          │
│  │   Agents     │                    │  GWI Tools   │          │
│  │  (LLM-only)  │    ══════╳═════    │  (APIs)      │          │
│  │              │    No Connection   │              │          │
│  └──────────────┘                    └──────────────┘          │
│         │                                    │                  │
│         ▼                                    ▼                  │
│  ┌──────────────┐                    ┌──────────────┐          │
│  │  Workflows   │    ══════╳═════    │   Data Ops   │          │
│  │  (Agents     │    No Orchestration│  (CRUD only) │          │
│  │   only)      │                    │              │          │
│  └──────────────┘                    └──────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Proposed Integration Architecture

### Target State

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROPOSED ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐         ┌──────────────┐                     │
│  │   Agents     │◄───────►│ Tool Registry │                    │
│  │  (Tool-     │         │  - GWI Tools   │                    │
│  │   enabled)   │         │  - Data Ops    │                    │
│  └──────────────┘         └──────────────┘                     │
│         │                        │                              │
│         ▼                        ▼                              │
│  ┌──────────────┐         ┌──────────────┐                     │
│  │  Workflows   │         │  Tool Memory  │                    │
│  │  (Mixed      │◄───────►│  (State Mgmt) │                    │
│  │   Steps)     │         │              │                     │
│  └──────────────┘         └──────────────┘                     │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────┐                  │
│  │           Output Layer                    │                  │
│  │  Crosstabs │ Charts │ Dashboards │ Reports│                  │
│  └──────────────────────────────────────────┘                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Tool Definition Layer

**Priority**: Critical
**Files to Create/Modify**:
- `lib/gwi-tools.ts` (new)
- `lib/tool-registry.ts` (new)
- `types/tools.ts` (new)

#### 1.1 Define Tool Interface

```typescript
// types/tools.ts
export interface GWITool {
  name: string
  description: string
  category: 'audience' | 'data' | 'visualization' | 'analysis' | 'reporting'
  parameters: {
    type: 'object'
    properties: Record<string, JSONSchemaProperty>
    required: string[]
  }
  returns: {
    type: string
    description: string
  }
  execute: (params: any, context: ToolExecutionContext) => Promise<ToolResult>
}

export interface ToolExecutionContext {
  orgId: string
  userId: string
  agentId?: string
  workflowId?: string
  runId: string
  memory: MemoryItem[]
}

export interface ToolResult {
  success: boolean
  data?: any
  error?: string
  metadata?: {
    executionTimeMs: number
    resourcesCreated?: string[]
    tokensUsed?: number
  }
}
```

#### 1.2 Implement GWI Tool Definitions

```typescript
// lib/gwi-tools.ts
export const GWI_TOOLS: GWITool[] = [
  {
    name: 'create_audience',
    description: 'Create a new audience segment based on demographic, behavioral, or psychographic criteria',
    category: 'audience',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name for the audience' },
        description: { type: 'string', description: 'Description of the audience' },
        criteria: {
          type: 'array',
          description: 'Filter criteria for the audience',
          items: {
            type: 'object',
            properties: {
              dimension: { type: 'string' },
              operator: { type: 'string', enum: ['equals', 'contains', 'between', 'gt', 'lt'] },
              value: { type: 'string' }
            }
          }
        },
        markets: { type: 'array', items: { type: 'string' }, description: 'Target markets' }
      },
      required: ['name', 'criteria']
    },
    returns: { type: 'object', description: 'Created audience with ID and estimated size' },
    execute: async (params, context) => { /* implementation */ }
  },

  {
    name: 'fetch_audience_data',
    description: 'Retrieve metrics and data points for a specific audience',
    category: 'data',
    parameters: {
      type: 'object',
      properties: {
        audienceId: { type: 'string', description: 'ID of the audience to fetch data for' },
        metrics: { type: 'array', items: { type: 'string' }, description: 'Metrics to retrieve' },
        filters: { type: 'object', description: 'Optional filters to apply' }
      },
      required: ['audienceId', 'metrics']
    },
    returns: { type: 'object', description: 'Audience data with requested metrics' },
    execute: async (params, context) => { /* implementation */ }
  },

  {
    name: 'generate_crosstab',
    description: 'Generate a cross-tabular comparison across multiple audiences and metrics',
    category: 'analysis',
    parameters: {
      type: 'object',
      properties: {
        audiences: { type: 'array', items: { type: 'string' }, description: 'Audience IDs to compare' },
        metrics: { type: 'array', items: { type: 'string' }, description: 'Metrics to cross-tabulate' },
        name: { type: 'string', description: 'Name for the crosstab' }
      },
      required: ['audiences', 'metrics']
    },
    returns: { type: 'object', description: 'Crosstab results with statistical analysis' },
    execute: async (params, context) => { /* implementation */ }
  },

  {
    name: 'query_spark',
    description: 'Query GWI Spark MCP with a natural language question about consumer data',
    category: 'analysis',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Natural language query' },
        audienceContext: { type: 'string', description: 'Optional audience ID for context' }
      },
      required: ['query']
    },
    returns: { type: 'object', description: 'Spark response with insights and citations' },
    execute: async (params, context) => { /* implementation */ }
  },

  {
    name: 'create_chart',
    description: 'Create a data visualization chart from crosstab or audience data',
    category: 'visualization',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Chart name' },
        type: { type: 'string', enum: ['BAR', 'LINE', 'PIE', 'DONUT', 'AREA', 'SCATTER', 'HEATMAP'] },
        dataSource: { type: 'string', description: 'ID of crosstab or audience for data' },
        configuration: { type: 'object', description: 'Chart configuration options' }
      },
      required: ['name', 'type', 'dataSource']
    },
    returns: { type: 'object', description: 'Created chart with ID' },
    execute: async (params, context) => { /* implementation */ }
  },

  {
    name: 'update_dashboard',
    description: 'Add or update widgets on a dashboard',
    category: 'visualization',
    parameters: {
      type: 'object',
      properties: {
        dashboardId: { type: 'string', description: 'Dashboard ID to update' },
        widgets: { type: 'array', description: 'Widgets to add/update' }
      },
      required: ['dashboardId', 'widgets']
    },
    returns: { type: 'object', description: 'Updated dashboard' },
    execute: async (params, context) => { /* implementation */ }
  },

  {
    name: 'get_brand_health',
    description: 'Retrieve brand tracking metrics and health scores',
    category: 'analysis',
    parameters: {
      type: 'object',
      properties: {
        brandId: { type: 'string', description: 'Brand tracking ID' },
        includeHistory: { type: 'boolean', description: 'Include historical snapshots' },
        audienceBreakdown: { type: 'boolean', description: 'Include audience segment breakdown' }
      },
      required: ['brandId']
    },
    returns: { type: 'object', description: 'Brand health metrics with optional history' },
    execute: async (params, context) => { /* implementation */ }
  },

  {
    name: 'analyze_insights',
    description: 'Generate AI-powered insights from data analysis results',
    category: 'analysis',
    parameters: {
      type: 'object',
      properties: {
        dataType: { type: 'string', enum: ['crosstab', 'audience', 'brand_tracking'] },
        dataId: { type: 'string', description: 'ID of the data source to analyze' },
        focusAreas: { type: 'array', items: { type: 'string' }, description: 'Areas to focus analysis on' }
      },
      required: ['dataType', 'dataId']
    },
    returns: { type: 'object', description: 'Generated insights with confidence scores' },
    execute: async (params, context) => { /* implementation */ }
  }
]
```

#### 1.3 Create Tool Registry

```typescript
// lib/tool-registry.ts
export class ToolRegistry {
  private tools: Map<string, GWITool> = new Map()

  registerTool(tool: GWITool): void
  getTool(name: string): GWITool | undefined
  getToolsByCategory(category: string): GWITool[]
  getAllTools(): GWITool[]
  getToolSchemas(): ToolSchema[] // For LLM function calling

  async executeTool(
    name: string,
    params: any,
    context: ToolExecutionContext
  ): Promise<ToolResult>
}
```

---

### Phase 2: Agent Tool Integration

**Priority**: Critical
**Files to Modify**:
- `lib/llm.ts`
- `app/api/v1/agents/[id]/run/route.ts`
- `types/index.ts`

#### 2.1 Extend Agent Configuration

```typescript
// In Agent configuration
{
  "tools": ["create_audience", "fetch_audience_data", "generate_crosstab"],
  "toolBehavior": "auto" | "confirm" | "disabled",
  "maxToolCalls": 5
}
```

#### 2.2 Modify LLM Execution for Tool Calling

```typescript
// lib/llm.ts - Extended execution function
export async function executeAgentWithTools(options: {
  agent: Agent
  input: string
  context: ToolExecutionContext
  tools: GWITool[]
}): Promise<AgentExecutionResult> {
  const { agent, input, context, tools } = options

  // Convert tools to Claude/OpenAI function schemas
  const toolSchemas = tools.map(tool => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.parameters
  }))

  // Execute with tool use capability
  let response = await anthropic.messages.create({
    model: agent.configuration.model || 'claude-3-5-sonnet-20241022',
    max_tokens: agent.configuration.maxTokens || 4096,
    system: agent.configuration.systemPrompt,
    tools: toolSchemas,
    messages: [{ role: 'user', content: input }]
  })

  // Handle tool calls in a loop
  const toolResults: ToolCallResult[] = []
  while (response.stop_reason === 'tool_use') {
    const toolUse = response.content.find(c => c.type === 'tool_use')

    // Execute the tool
    const toolResult = await toolRegistry.executeTool(
      toolUse.name,
      toolUse.input,
      context
    )

    toolResults.push({
      toolName: toolUse.name,
      input: toolUse.input,
      result: toolResult
    })

    // Continue conversation with tool result
    response = await anthropic.messages.create({
      // ... continue with tool result
    })
  }

  return {
    response: response.content[0].text,
    toolCalls: toolResults,
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens
  }
}
```

#### 2.3 Update Agent Run Tracking

```typescript
// Update AgentRun model to include tool calls
model AgentRun {
  // ... existing fields
  toolCalls Json? // Array of tool call records
}
```

---

### Phase 3: Workflow Data Operation Steps

**Priority**: High
**Files to Create/Modify**:
- `lib/workflow-steps.ts` (new)
- `app/api/v1/workflows/[id]/run/route.ts`
- `components/workflows/workflow-builder.tsx`

#### 3.1 Define Workflow Step Types

```typescript
// lib/workflow-steps.ts
export type WorkflowStepType =
  | 'agent'           // Execute an agent
  | 'tool'            // Execute a GWI tool directly
  | 'condition'       // Conditional branching
  | 'transform'       // Data transformation
  | 'parallel'        // Parallel execution

export interface WorkflowStep {
  id: string
  type: WorkflowStepType
  config: AgentStepConfig | ToolStepConfig | ConditionStepConfig | TransformStepConfig
  onSuccess?: string  // Next step ID
  onError?: string    // Error handler step ID
}

export interface ToolStepConfig {
  toolName: string
  parameters: Record<string, any>  // Can reference previous step outputs: "{{step-1.audienceId}}"
  outputMapping?: Record<string, string>
}
```

#### 3.2 Update Workflow Execution

```typescript
// Extended workflow execution to handle tool steps
async function executeWorkflowStep(
  step: WorkflowStep,
  context: WorkflowExecutionContext
): Promise<StepResult> {
  switch (step.type) {
    case 'agent':
      return executeAgentStep(step, context)

    case 'tool':
      const resolvedParams = resolveParameters(step.config.parameters, context.previousOutputs)
      return toolRegistry.executeTool(step.config.toolName, resolvedParams, context)

    case 'condition':
      return evaluateCondition(step, context)

    case 'transform':
      return transformData(step, context)

    case 'parallel':
      return executeParallelSteps(step, context)
  }
}
```

#### 3.3 Workflow Builder UI Updates

Add a tool step type to the workflow builder:
- Tool selection dropdown (filtered by category)
- Parameter configuration form (auto-generated from tool schema)
- Output variable naming
- Connection to next steps

---

### Phase 4: Template-Tool Integration

**Priority**: Medium
**Files to Modify**:
- `lib/template-library.ts`
- `app/api/v1/templates/route.ts`

#### 4.1 Extend Template Structure

```typescript
interface PromptTemplate {
  // ... existing fields

  // NEW: Tool integration fields
  suggestedTools?: string[]           // Tools commonly used with this template
  preToolActions?: ToolAction[]       // Tools to run before the prompt
  postToolActions?: ToolAction[]      // Tools to run after getting response
  outputToTool?: {                    // Map response to tool input
    toolName: string
    parameterMapping: Record<string, string>
  }
}

interface ToolAction {
  toolName: string
  parameters: Record<string, any>
  storeAs?: string  // Variable name to store result
}
```

#### 4.2 Template Execution with Tools

```typescript
// Template execution flow
async function executeTemplate(
  template: PromptTemplate,
  variables: Record<string, any>,
  context: ExecutionContext
): Promise<TemplateResult> {
  let enrichedVariables = { ...variables }

  // 1. Execute pre-tool actions
  for (const action of template.preToolActions || []) {
    const result = await toolRegistry.executeTool(action.toolName, action.parameters, context)
    if (action.storeAs) {
      enrichedVariables[action.storeAs] = result.data
    }
  }

  // 2. Interpolate and execute prompt
  const prompt = interpolateTemplate(template.prompt, enrichedVariables)
  const response = await executePrompt(prompt, context)

  // 3. Execute post-tool actions
  for (const action of template.postToolActions || []) {
    const params = resolveParameters(action.parameters, { ...enrichedVariables, response })
    await toolRegistry.executeTool(action.toolName, params, context)
  }

  // 4. Optionally map output to another tool
  if (template.outputToTool) {
    const mappedParams = mapResponseToToolParams(response, template.outputToTool.parameterMapping)
    await toolRegistry.executeTool(template.outputToTool.toolName, mappedParams, context)
  }

  return { response, toolResults }
}
```

---

### Phase 5: Automated Insights Generation

**Priority**: Medium
**Files to Create/Modify**:
- `app/api/v1/crosstabs/[id]/insights/route.ts`
- `lib/insight-generator.ts` (new)
- `app/api/v1/brand-tracking/[id]/analyze/route.ts` (new)

#### 5.1 Implement Crosstab Insights Endpoint

```typescript
// app/api/v1/crosstabs/[id]/insights/route.ts
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const crosstab = await prisma.crosstab.findUnique({ where: { id: params.id } })

  // Use the analyze_insights tool
  const insightResult = await toolRegistry.executeTool('analyze_insights', {
    dataType: 'crosstab',
    dataId: params.id,
    focusAreas: ['statistical_significance', 'anomalies', 'key_differentiators']
  }, context)

  // Store insights
  await prisma.crosstab.update({
    where: { id: params.id },
    data: { insights: insightResult.data }
  })

  return Response.json(insightResult.data)
}
```

#### 5.2 Implement Brand Tracking Analysis

```typescript
// app/api/v1/brand-tracking/[id]/analyze/route.ts
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const brandTracking = await prisma.brandTracking.findUnique({
    where: { id: params.id },
    include: { snapshots: { orderBy: { createdAt: 'desc' }, take: 10 } }
  })

  // Analyze trends and generate insights
  const analysis = await toolRegistry.executeTool('analyze_insights', {
    dataType: 'brand_tracking',
    dataId: params.id,
    focusAreas: ['trend_analysis', 'threshold_alerts', 'audience_breakdown']
  }, context)

  // Check alert thresholds
  if (analysis.data.thresholdBreaches?.length > 0) {
    await sendAlertNotifications(brandTracking, analysis.data.thresholdBreaches)
  }

  // Store as new snapshot insight
  await prisma.brandTrackingSnapshot.update({
    where: { id: brandTracking.snapshots[0].id },
    data: { insights: analysis.data.insights }
  })

  return Response.json(analysis.data)
}
```

---

### Phase 6: Tool Memory & State Management

**Priority**: Medium
**Files to Create/Modify**:
- `lib/tool-memory.ts` (new)
- `prisma/schema.prisma`

#### 6.1 Extend Memory Model for Tools

```typescript
// Add to prisma/schema.prisma
model ToolMemory {
  id          String    @id @default(cuid())
  orgId       String
  sessionId   String    // Workflow run or agent session
  toolName    String
  inputHash   String    // Hash of input params for deduplication
  output      Json
  resourceIds String[]  // IDs of created resources
  createdAt   DateTime  @default(now())
  expiresAt   DateTime?

  @@index([orgId, sessionId])
  @@index([toolName, inputHash])
}
```

#### 6.2 Tool Memory Service

```typescript
// lib/tool-memory.ts
export class ToolMemoryService {
  // Check if same tool call was made recently (deduplication)
  async findPreviousResult(
    toolName: string,
    params: any,
    sessionId: string
  ): Promise<ToolMemoryEntry | null>

  // Store tool execution result
  async storeResult(
    toolName: string,
    params: any,
    result: ToolResult,
    sessionId: string
  ): Promise<void>

  // Get all resources created in a session
  async getSessionResources(sessionId: string): Promise<ResourceReference[]>

  // Enable referencing previous outputs
  async resolveReference(reference: string, sessionId: string): Promise<any>
}
```

---

## Implementation Timeline

### Phase 1: Tool Definition Layer (Foundation)
- Define tool interface and types
- Implement 8 core GWI tools
- Create tool registry with execution capability
- Add tool documentation

### Phase 2: Agent Tool Integration (Core Feature)
- Extend LLM execution for tool calling
- Update agent configuration schema
- Modify agent run tracking
- Test with Audience Strategist and Brand Tracker agents

### Phase 3: Workflow Data Operation Steps
- Define workflow step types
- Implement tool step execution
- Update workflow builder UI
- Add parameter resolution (referencing previous steps)

### Phase 4: Template-Tool Integration
- Extend template schema
- Implement pre/post tool actions
- Add output-to-tool mapping
- Update template library with tool suggestions

### Phase 5: Automated Insights Generation
- Implement crosstab insights endpoint
- Implement brand tracking analysis
- Add threshold-based alerting
- Create insight visualization components

### Phase 6: Tool Memory & State Management
- Add ToolMemory database model
- Implement memory service
- Add deduplication logic
- Enable cross-step references

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Agent-initiated data operations | 0 | 100+ daily |
| Workflow tool steps executed | 0 | 50+ daily |
| Automated insights generated | 0 | 200+ daily |
| Average workflow completion time | N/A | < 30 seconds |
| Tool call success rate | N/A | > 95% |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Tool execution failures | Retry logic, error handling, fallback responses |
| LLM hallucinating tool calls | Strict parameter validation, schema enforcement |
| Performance degradation | Caching, async execution, rate limiting |
| Security concerns | Tool permission scoping, audit logging, input sanitization |
| Cost overruns | Token tracking, usage limits, tool call budgets |

---

## Appendix A: Tool Schema Examples

### Create Audience Tool Schema (Claude Format)

```json
{
  "name": "create_audience",
  "description": "Create a new audience segment based on demographic, behavioral, or psychographic criteria. Use this when you need to define a target audience for analysis.",
  "input_schema": {
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "A descriptive name for the audience segment"
      },
      "description": {
        "type": "string",
        "description": "Detailed description of who this audience represents"
      },
      "criteria": {
        "type": "array",
        "description": "Filter criteria defining the audience",
        "items": {
          "type": "object",
          "properties": {
            "dimension": {
              "type": "string",
              "description": "The dimension to filter on (e.g., age, income, interests)"
            },
            "operator": {
              "type": "string",
              "enum": ["equals", "contains", "between", "gt", "lt", "in"]
            },
            "value": {
              "type": "string",
              "description": "The value or values to match"
            }
          },
          "required": ["dimension", "operator", "value"]
        }
      },
      "markets": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Target markets (e.g., ['US', 'UK', 'DE'])"
      }
    },
    "required": ["name", "criteria"]
  }
}
```

---

## Appendix B: Example Agent with Tools

### Audience Strategist Pro (Enhanced)

```typescript
{
  name: "Audience Strategist Pro",
  type: "RESEARCH",
  configuration: {
    systemPrompt: `You are an expert audience strategist with access to GWI consumer data tools.

When asked to analyze or create audiences:
1. Use create_audience to define segments based on the user's requirements
2. Use fetch_audience_data to retrieve relevant metrics
3. Use generate_crosstab to compare multiple audiences
4. Use analyze_insights to generate actionable recommendations

Always cite the data sources and provide statistical context for your findings.`,

    tools: [
      "create_audience",
      "fetch_audience_data",
      "generate_crosstab",
      "analyze_insights"
    ],
    toolBehavior: "auto",
    maxToolCalls: 10,

    temperature: 0.3,
    maxTokens: 4096,
    model: "claude-3-5-sonnet-20241022"
  }
}
```

---

## Appendix C: Example Workflow with Tool Steps

```json
{
  "name": "Competitive Audience Analysis",
  "description": "Analyze audience overlap and differentiation between competitors",
  "steps": [
    {
      "id": "step-1",
      "type": "tool",
      "config": {
        "toolName": "create_audience",
        "parameters": {
          "name": "{{brand}} Customers",
          "criteria": [
            { "dimension": "brand_usage", "operator": "contains", "value": "{{brand}}" }
          ]
        },
        "outputMapping": { "audienceId": "brandAudienceId" }
      }
    },
    {
      "id": "step-2",
      "type": "tool",
      "config": {
        "toolName": "create_audience",
        "parameters": {
          "name": "{{competitor}} Customers",
          "criteria": [
            { "dimension": "brand_usage", "operator": "contains", "value": "{{competitor}}" }
          ]
        },
        "outputMapping": { "audienceId": "competitorAudienceId" }
      }
    },
    {
      "id": "step-3",
      "type": "tool",
      "config": {
        "toolName": "generate_crosstab",
        "parameters": {
          "audiences": ["{{step-1.brandAudienceId}}", "{{step-2.competitorAudienceId}}"],
          "metrics": ["demographics", "interests", "media_consumption", "purchase_behavior"],
          "name": "{{brand}} vs {{competitor}} Comparison"
        }
      }
    },
    {
      "id": "step-4",
      "type": "agent",
      "config": {
        "agentId": "competitive-radar",
        "input": "Analyze this competitive comparison and identify key differentiators: {{step-3.results}}"
      }
    }
  ]
}
```

---

## Next Steps

1. Review and approve this integration plan
2. Begin Phase 1 implementation (Tool Definition Layer)
3. Set up test fixtures for tool execution
4. Create API documentation for new tool endpoints
5. Update agent marketplace with tool-enabled agents
