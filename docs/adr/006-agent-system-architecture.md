# ADR-006: Agent System Architecture

## Status
Accepted

## Date
2024-01-15

## Context
GWI requires AI agents to automate complex tasks including survey analysis, open-end coding, data quality assessment, and report generation. Agents must:
- Execute multi-step workflows autonomously
- Use multiple tools with appropriate permissions
- Be configurable and reusable
- Track execution for debugging and improvement

## Decision
We implement a template-based agent system with configurable tools and permission controls.

### Data Model

```
SystemAgentTemplate ---> (N) SystemToolConfiguration (via defaultTools)
SystemAgentTemplate ---> (N) PromptTemplate (via defaultPrompts)
```

### Key Design Decisions

1. **Agent Templates**:
   - Reusable agent configurations
   - Publishable when ready for production
   - Versioned for change tracking
   - Categories: `analysis`, `classification`, `data_quality`, `reporting`, `taxonomy`, `orchestration`

2. **Template Configuration**:
   ```json
   {
     "model": "gpt-4-turbo",
     "temperature": 0.3,
     "maxIterations": 10,
     "capabilities": ["data_analysis", "pattern_recognition", "insight_generation"]
   }
   ```

3. **Tool System**:
   - Tools are independent, reusable components
   - Each tool has its own configuration
   - Tools require specific permissions/roles
   - Tool types:
     - `data_access` - Query databases and APIs
     - `ai_service` - Invoke LLM models
     - `orchestration` - Trigger pipelines
     - `reporting` - Generate outputs
     - `communication` - Send notifications
     - `validation` - Check data quality

4. **Permission Model**:
   - Tools specify required roles
   - Agent execution checks user's role
   - Prevents unauthorized data access
   ```json
   {
     "requiredRoles": ["DATA_ENGINEER", "ML_ENGINEER", "GWI_ADMIN"]
   }
   ```

5. **Capability Declaration**:
   Agents declare capabilities for matching to tasks:
   - `data_analysis` - Statistical analysis
   - `pattern_recognition` - Trend identification
   - `insight_generation` - Business insights
   - `text_classification` - Category assignment
   - `sentiment_analysis` - Tone detection
   - `theme_extraction` - Topic identification
   - `anomaly_detection` - Outlier finding
   - `quality_scoring` - Data quality assessment
   - `report_writing` - Document generation

6. **Iteration Limits**:
   - `maxIterations` prevents infinite loops
   - Agent stops when limit reached
   - Default varies by task complexity

7. **Publishing Workflow**:
   ```
   DRAFT (isPublished: false) -> PUBLISHED (isPublished: true)
   ```
   - Templates must be validated before publishing
   - Published templates used in production
   - Draft templates for testing/development

## Consequences

### Positive
- Reusable templates reduce configuration effort
- Tool permission system ensures data security
- Capability matching enables task routing
- Version control supports safe iteration

### Negative
- Tool configuration complexity
- No built-in execution engine (uses external orchestrator)
- Limited debugging for multi-step executions

### Mitigation
- Default tool configurations for common patterns
- Comprehensive logging of agent actions
- Testing mode for validation before publishing

## Agent Template Examples

### Survey Analysis Agent
```json
{
  "name": "Survey Analysis Agent",
  "category": "analysis",
  "configuration": {
    "model": "gpt-4-turbo",
    "temperature": 0.3,
    "maxIterations": 10,
    "capabilities": ["data_analysis", "pattern_recognition", "insight_generation"]
  },
  "defaultTools": ["survey_query", "llm_invoke", "report_generator"],
  "defaultPrompts": {
    "system": "You are an expert survey analyst.",
    "analysis_template": "Survey Analysis Summary"
  },
  "isPublished": true,
  "version": 2
}
```

### Open-End Coding Agent
```json
{
  "name": "Open-End Coding Agent",
  "category": "classification",
  "configuration": {
    "model": "gpt-3.5-turbo",
    "temperature": 0.1,
    "batchSize": 50,
    "capabilities": ["text_classification", "sentiment_analysis", "theme_extraction"]
  },
  "defaultTools": ["survey_query", "llm_invoke", "taxonomy_lookup"],
  "defaultPrompts": {
    "system": "You are an expert at coding survey responses.",
    "coding_template": "Open-End Response Coding"
  },
  "isPublished": true,
  "version": 3
}
```

## Tool Configuration Examples

### Data Access Tool
```json
{
  "name": "survey_query",
  "type": "data_access",
  "configuration": {
    "allowedOperations": ["select", "filter", "aggregate"],
    "maxRows": 10000,
    "allowedTables": ["SurveyResponse", "Survey", "SurveyQuestion"],
    "rateLimit": { "requestsPerMinute": 100 }
  },
  "permissions": {
    "requiredRoles": ["DATA_ENGINEER", "ML_ENGINEER", "TAXONOMY_MANAGER", "GWI_ADMIN"]
  }
}
```

### AI Service Tool
```json
{
  "name": "llm_invoke",
  "type": "ai_service",
  "configuration": {
    "allowedModels": ["gpt-4-turbo", "gpt-3.5-turbo", "claude-3-opus"],
    "maxTokens": 4096,
    "requirePromptTemplate": true
  },
  "permissions": {
    "requiredRoles": ["ML_ENGINEER", "GWI_ADMIN"]
  }
}
```

## Implementation Notes
- Agent templates: `app/api/gwi/agents/templates/route.ts`
- Tool configurations: `app/api/gwi/agents/tools/route.ts`
- Agent execution: External orchestrator with API integration
- Capability matching: `lib/agent-capabilities.ts`
