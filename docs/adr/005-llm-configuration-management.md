# ADR-005: LLM Configuration Management

## Status
Accepted

## Date
2024-01-15

## Context
GWI uses multiple LLM providers and models for various tasks including survey analysis, open-end coding, report generation, and insight extraction. The system must:
- Support multiple LLM providers (OpenAI, Anthropic, etc.)
- Manage API keys securely
- Track usage and costs
- Enable prompt template versioning
- Support testing without production impact

## Decision
We implement a centralized LLM configuration system with usage tracking and prompt management.

### Data Model

```
LLMConfiguration (1) ---> (N) LLMUsageRecord
PromptTemplate (1) ---> (1) SuperAdmin (creator)
```

### Key Design Decisions

1. **Provider Abstraction**:
   - Configurations tied to provider + model combination
   - Unique constraint on (provider, model)
   - Supported providers: `openai`, `anthropic`, `google`, `cohere`, `azure`

2. **Secure API Key Management**:
   - API keys stored as references, not values
   - `apiKeyRef` points to environment variable or secrets manager
   - Never expose actual keys in API responses
   - Example: `apiKeyRef: "OPENAI_API_KEY"`

3. **Default Parameters as JSON**:
   ```json
   {
     "temperature": 0.7,
     "max_tokens": 4096,
     "top_p": 0.95
   }
   ```
   - Overridable at invocation time
   - Validated against provider constraints

4. **Rate Limiting Configuration**:
   ```json
   {
     "requestsPerMinute": 500,
     "tokensPerMinute": 150000
   }
   ```
   - Tracked at application level
   - Prevents API quota exhaustion
   - Queue requests when limited

5. **Usage Tracking**:
   - Per-request tracking: tokens, cost, latency
   - Aggregation by provider, model, time period
   - Cost calculation using provider pricing
   - Metadata for categorization (use case, agent, etc.)

6. **Prompt Templates**:
   - Versioned templates with change history
   - Variables using `{{variable_name}}` syntax
   - Auto-extraction of variables from template
   - Categories: `analysis`, `classification`, `reporting`, `data_quality`, `taxonomy`, `insights`

7. **Testing Mode**:
   - Test endpoint for prompt validation
   - Results not persisted to usage analytics
   - `dryRun` flag prevents billing impact

## Consequences

### Positive
- Centralized control over LLM access
- Comprehensive usage tracking for cost management
- Secure credential management via references
- Versioned prompts enable A/B testing

### Negative
- Single point of failure for LLM access
- Rate limiting logic in application layer
- No real-time cost alerts

### Mitigation
- Configuration caching reduces database load
- Monitoring alerts on high usage patterns
- Fallback configurations for provider outages

## Cost Calculation

Usage cost calculated per request:
```
totalCost = (promptTokens / 1000 * inputPrice) +
            (completionTokens / 1000 * outputPrice)
```

Provider pricing stored in configuration or derived from provider APIs.

## Prompt Template Example

```
Name: Survey Analysis Summary
Category: analysis
Version: 2

Template:
Analyze the following survey results and provide an executive summary:

Survey: {{survey_name}}
Sample Size: {{sample_size}}
Date Range: {{date_range}}

Key Metrics:
{{metrics}}

Please provide:
1. Key findings (3-5 bullet points)
2. Notable trends or patterns
3. Demographic insights
4. Recommendations for stakeholders
```

Variables: `survey_name`, `sample_size`, `date_range`, `metrics`

## Implementation Notes
- LLM configurations: `app/api/gwi/llm/configurations/route.ts`
- Prompt templates: `app/api/gwi/llm/prompts/route.ts`
- Usage analytics: `app/api/gwi/llm/usage/route.ts`
- Testing endpoint: `app/api/gwi/llm/test/route.ts`
