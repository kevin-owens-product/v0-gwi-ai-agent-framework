# Event Tracking & Analytics Guide

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Event Taxonomy](#event-taxonomy)
- [Implementation Guide](#implementation-guide)
- [Best Practices](#best-practices)
- [Analytics & Reporting](#analytics--reporting)
- [Testing](#testing)
- [Privacy & Compliance](#privacy--compliance)

---

## Overview

The GWI AI Agent Framework includes a comprehensive event tracking system that captures user interactions, performance metrics, and feature usage across the entire platform. This system provides real-time insights into how users interact with the application and enables data-driven product decisions.

### Key Features

- **Automatic batching**: Events are batched and sent to the server periodically to reduce network overhead
- **Rate limiting**: Built-in rate limiting prevents abuse and excessive data collection
- **Privacy-focused**: No personally identifiable information (PII) is collected without explicit consent
- **Performance tracking**: Automatic page load and API call performance monitoring
- **Error tracking**: Automatic error capture and reporting
- **Offline support**: Events are queued and sent when the connection is restored

### System Architecture

```
┌─────────────────┐
│  User Action    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Client Tracking        │
│  (client-tracking.ts)   │
│  - Event collection     │
│  - Batching             │
│  - Enrichment           │
└────────┬────────────────┘
         │ HTTP POST (batch)
         ▼
┌─────────────────────────┐
│  Tracking API           │
│  (/api/v1/tracking)     │
│  - Validation           │
│  - Rate limiting        │
│  - Mapping              │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Audit Log System       │
│  (lib/audit.ts)         │
│  - Storage              │
│  - Querying             │
│  - Reporting            │
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Analytics Dashboard    │
│  (/dashboard/analytics) │
│  - Visualizations       │
│  - Reports              │
│  - Insights             │
└─────────────────────────┘
```

---

## Event Taxonomy

All events follow a consistent structure with three primary components:

1. **Category**: High-level grouping (e.g., `agent`, `workflow`, `report`)
2. **Action**: Specific action taken (e.g., `create`, `view`, `delete`)
3. **Metadata**: Additional context about the event

### Event Categories

| Category | Description | Example Actions |
|----------|-------------|-----------------|
| `authentication` | User authentication flows | `login_success`, `signup_complete`, `logout` |
| `navigation` | Page navigation and routing | `page_view`, `route_change`, `sidebar_click` |
| `agent` | Agent lifecycle and operations | `agent_create`, `agent_run`, `agent_delete` |
| `workflow` | Workflow management | `workflow_create`, `workflow_run`, `workflow_step_add` |
| `report` | Report generation and viewing | `report_create`, `report_view`, `report_export` |
| `audience` | Audience building and management | `audience_create`, `audience_size_estimate` |
| `crosstab` | Crosstab operations | `crosstab_create`, `crosstab_export` |
| `chart` | Chart creation and editing | `chart_create`, `chart_type_change` |
| `dashboard` | Dashboard management | `dashboard_create`, `dashboard_widget_add` |
| `brand_tracking` | Brand tracking features | `brand_tracking_snapshot`, `brand_tracking_analyze` |
| `data_source` | Data source connections | `data_source_connect`, `data_source_sync` |
| `integration` | Third-party integrations | `integration_connect`, `integration_configure` |
| `team` | Team management | `team_member_invite`, `team_role_change` |
| `api_key` | API key management | `api_key_create`, `api_key_rotate` |
| `settings` | User settings | `settings_update`, `appearance_change` |
| `ui_interaction` | General UI interactions | `button_click`, `modal_open`, `tab_change` |
| `form` | Form interactions | `form_submit`, `form_error`, `form_field_change` |
| `search` | Search and filtering | `search_complete`, `filter_apply` |
| `export` | Data export operations | `export_csv`, `export_pdf` |
| `error` | Error tracking | `api_error`, `validation_error` |
| `performance` | Performance metrics | `page_load`, `api_call` |

### Event Structure

```typescript
interface TrackingEvent {
  category: EventCategory;        // Required: Event category
  action: EventAction;            // Required: Specific action
  label?: string;                 // Optional: Human-readable label
  value?: number;                 // Optional: Numeric value (e.g., duration)
  metadata?: EventMetadata;       // Optional: Additional context
  timestamp?: Date;               // Automatic: Event timestamp
}

interface EventMetadata {
  // Context
  path?: string;                  // Current page path
  referrer?: string;              // Previous page
  sessionId?: string;             // User session ID

  // Resource identifiers
  resourceId?: string;            // ID of resource being acted upon
  resourceType?: string;          // Type of resource

  // User interaction
  elementId?: string;             // DOM element ID
  elementType?: string;           // Element type (button, link, etc.)
  elementText?: string;           // Element text content

  // Performance
  duration?: number;              // Operation duration (ms)
  loadTime?: number;              // Page load time (ms)

  // Errors
  errorMessage?: string;          // Error message
  errorCode?: string;             // Error code

  // Custom fields
  [key: string]: any;             // Additional metadata
}
```

---

## Implementation Guide

### Basic Setup

1. **Import the tracking module**:

```typescript
import { track } from '@/lib/client-tracking';
```

2. **Track a simple event**:

```typescript
track({
  category: 'agent',
  action: 'agent_create_complete',
  label: 'Customer Insights Agent',
  metadata: {
    agentType: 'audience_strategist',
    resourceId: agent.id,
  },
});
```

### Using React Hooks

The easiest way to integrate tracking is using our custom React hooks:

#### 1. Page View Tracking

Automatically track when users visit a page:

```typescript
import { usePageViewTracking } from '@/hooks/useEventTracking';

export default function MyPage() {
  usePageViewTracking();

  return <div>Page content</div>;
}
```

#### 2. Button Click Tracking

Track button clicks throughout your application:

```typescript
import { useEventTracking } from '@/hooks/useEventTracking';

export function CreateButton() {
  const { trackButtonClick } = useEventTracking();

  return (
    <Button
      onClick={() => {
        trackButtonClick('create-agent-btn', 'Create Agent', {
          componentName: 'CreateButton',
        });
        // ... handle click
      }}
    >
      Create Agent
    </Button>
  );
}
```

#### 3. Form Tracking

Automatically track form interactions:

```typescript
import { useForm } from 'react-hook-form';
import { useFormTracking } from '@/hooks/useEventTracking';

export function AgentForm() {
  const { register, handleSubmit } = useForm();
  const { onFieldChange, onSubmit } = useFormTracking('agent-form');

  const handleFormSubmit = async (data) => {
    // ... form logic
  };

  return (
    <form onSubmit={onSubmit(handleFormSubmit)}>
      <input
        {...register('name')}
        onChange={onFieldChange('name')}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

#### 4. Agent Tracking

Track agent-specific actions:

```typescript
import { useAgentTracking } from '@/hooks/useEventTracking';

export function AgentBuilder() {
  const { trackAgentCreate, trackAgentRun } = useAgentTracking();

  const handleCreate = async (data) => {
    const agent = await createAgent(data);
    trackAgentCreate(agent.id, {
      agentType: data.type,
      promptLength: data.prompt.length,
    });
  };

  const handleRun = async (agentId) => {
    const startTime = Date.now();
    const result = await runAgent(agentId);
    const duration = Date.now() - startTime;

    trackAgentRun(agentId, duration, {
      tokensUsed: result.tokensUsed,
      success: result.success,
    });
  };

  return <div>...</div>;
}
```

#### 5. Workflow Tracking

Track workflow operations:

```typescript
import { useWorkflowTracking } from '@/hooks/useEventTracking';

export function WorkflowBuilder() {
  const { trackWorkflowCreate, trackWorkflowStepAdd } = useWorkflowTracking();

  const addStep = (workflowId, step) => {
    trackWorkflowStepAdd(workflowId, {
      stepType: step.type,
      totalSteps: workflow.steps.length + 1,
    });
    // ... add step logic
  };
}
```

#### 6. Report Tracking

Track report operations:

```typescript
import { useReportTracking } from '@/hooks/useEventTracking';

export function ReportViewer({ reportId }) {
  const { trackReportView, trackReportExport } = useReportTracking();

  useEffect(() => {
    trackReportView(reportId);
  }, [reportId]);

  const handleExport = (format: 'pdf' | 'csv') => {
    trackReportExport(reportId, format, {
      reportType: report.type,
      pageCount: report.pages.length,
    });
    // ... export logic
  };
}
```

#### 7. Search Tracking

Track search and filtering:

```typescript
import { useSearchTracking } from '@/hooks/useEventTracking';

export function SearchBar() {
  const { trackSearch, trackFilterApply } = useSearchTracking();

  const handleSearch = (query) => {
    const results = performSearch(query);
    trackSearch(query, results.length, {
      searchType: 'global',
    });
  };

  const handleFilterChange = (filters) => {
    trackFilterApply(filters, {
      filterCount: Object.keys(filters).length,
    });
  };
}
```

### Advanced Tracking

#### Track Performance Metrics

```typescript
import { trackApiCall } from '@/lib/client-tracking';

async function fetchData(endpoint: string) {
  const startTime = Date.now();

  try {
    const response = await fetch(endpoint);
    const duration = Date.now() - startTime;

    trackApiCall(endpoint, 'GET', duration, response.status, {
      cached: response.headers.get('x-cache-hit') === 'true',
    });

    return await response.json();
  } catch (error) {
    const duration = Date.now() - startTime;
    trackApiCall(endpoint, 'GET', duration, 0, {
      error: error.message,
    });
    throw error;
  }
}
```

#### Track Error Boundaries

```typescript
import { trackError } from '@/lib/client-tracking';

class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    trackError('api_error', error.message, {
      errorStack: error.stack,
      componentStack: errorInfo.componentStack,
      errorCode: error.code,
    });
  }

  render() {
    return this.props.children;
  }
}
```

#### Track Time on Page

```typescript
import { useTimeOnPage } from '@/hooks/useEventTracking';

export function ArticlePage() {
  useTimeOnPage('article-page', {
    articleId: article.id,
    articleTitle: article.title,
  });

  return <div>Article content</div>;
}
```

---

## Best Practices

### 1. Event Naming Conventions

- Use **snake_case** for all event names
- Use descriptive action names: `agent_create_complete` not `agent_created`
- Be consistent with past tense vs present tense
- Group related events by category

### 2. Metadata Guidelines

- Include relevant context but avoid excessive data
- Never include PII (passwords, credit cards, SSNs, etc.)
- Use consistent field names across similar events
- Document custom metadata fields

### 3. Performance Considerations

- Events are automatically batched - don't worry about individual calls
- Avoid tracking in tight loops or high-frequency events
- Use debouncing for rapid-fire events (e.g., input changes)
- Don't track sensitive or excessive form data

### 4. Testing

- Check browser console in development mode to see tracked events
- Use `debug: true` in tracking config during development
- Verify events appear in audit log
- Test both success and error scenarios

### 5. Privacy & Compliance

- Review tracked data regularly for PII
- Implement user consent mechanisms where required
- Provide opt-out mechanisms
- Document data retention policies
- Comply with GDPR, CCPA, and other regulations

---

## Analytics & Reporting

### Accessing Event Data

#### 1. Audit Log API

Query audit logs programmatically:

```typescript
import { getAuditLogs } from '@/lib/audit';

// Get all agent creation events in last 7 days
const logs = await getAuditLogs({
  action: 'create',
  resourceType: 'agent',
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
});
```

#### 2. Analytics Dashboard

Access the analytics dashboard at `/dashboard/analytics` to view:

- **Overview metrics**: Total events, unique users, active sessions
- **Usage charts**: Event trends over time
- **Top actions**: Most frequently tracked events
- **User activity**: Per-user event breakdown
- **Performance metrics**: Page load times, API response times
- **Error rates**: Error frequency and types

#### 3. Custom Analytics

Create custom reports using the analytics API:

```typescript
// Get comprehensive analytics
const analytics = await fetch('/api/v1/analytics/comprehensive?days=30');
const data = await analytics.json();

// data includes:
// - overview: High-level metrics
// - growth: Comparison to previous period
// - agentStats: Agent usage by type
// - workflowStats: Workflow execution metrics
// - usageMetrics: Resource consumption
// - insightStats: Insight generation metrics
```

### Event Analysis Patterns

#### 1. Funnel Analysis

Track user progression through multi-step flows:

```typescript
// Step 1: Start
track({ category: 'agent', action: 'agent_create_start' });

// Step 2: Configure
track({ category: 'agent', action: 'agent_configure' });

// Step 3: Test
track({ category: 'agent', action: 'agent_test' });

// Step 4: Complete
track({ category: 'agent', action: 'agent_create_complete' });
```

#### 2. Cohort Analysis

Track user behavior over time:

```typescript
track({
  category: 'user',
  action: 'feature_usage',
  metadata: {
    feature: 'workflow_builder',
    userCohort: user.signupMonth, // e.g., '2024-01'
    daysSinceSignup: getDaysSinceSignup(user),
  },
});
```

#### 3. A/B Testing

Track experiment variations:

```typescript
track({
  category: 'experiment',
  action: 'variant_view',
  metadata: {
    experimentId: 'new-onboarding-flow',
    variant: 'B',
  },
});
```

---

## Testing

### Manual Testing

1. **Enable debug mode**:

```typescript
import { getTracker } from '@/lib/client-tracking';

getTracker({ debug: true });
```

2. **Check browser console** for logged events

3. **Verify in audit log**:
   - Navigate to `/dashboard/settings/audit-log`
   - Filter by action, resource, or user
   - Verify event metadata

### Automated Testing

Test tracking in your unit tests:

```typescript
import { track } from '@/lib/client-tracking';

// Mock the tracking function
jest.mock('@/lib/client-tracking', () => ({
  track: jest.fn(),
}));

test('tracks agent creation', () => {
  const { getByText } = render(<AgentBuilder />);

  fireEvent.click(getByText('Create Agent'));

  expect(track).toHaveBeenCalledWith({
    category: 'agent',
    action: 'agent_create_start',
    metadata: expect.objectContaining({
      componentName: 'AgentBuilder',
    }),
  });
});
```

### End-to-End Testing

Use Playwright to test tracking in E2E tests:

```typescript
test('tracks complete agent creation flow', async ({ page }) => {
  // Intercept tracking requests
  const trackingRequests = [];
  await page.route('/api/v1/tracking', (route) => {
    trackingRequests.push(route.request().postDataJSON());
    route.continue();
  });

  // Perform actions
  await page.goto('/dashboard/agents/new');
  await page.fill('input[name="name"]', 'Test Agent');
  await page.click('button[type="submit"]');

  // Verify tracking
  expect(trackingRequests).toContainEqual(
    expect.objectContaining({
      events: expect.arrayContaining([
        expect.objectContaining({
          action: 'agent_create_complete',
        }),
      ]),
    })
  );
});
```

---

## Privacy & Compliance

### Data Collection Policies

1. **No PII without consent**: Never track passwords, credit cards, or sensitive personal information
2. **Anonymization**: Use hashed or anonymous identifiers where possible
3. **User consent**: Implement consent mechanisms for tracking
4. **Data retention**: Define and enforce data retention policies
5. **Right to deletion**: Provide mechanisms for users to request data deletion

### GDPR Compliance

- Obtain explicit consent before tracking in EU
- Provide clear privacy policy
- Allow users to opt out
- Implement data portability
- Honor deletion requests within 30 days

### Implementation Example

```typescript
import { getTracker } from '@/lib/client-tracking';
import { getUserConsent } from '@/lib/consent';

// Check user consent
const hasConsent = await getUserConsent();

// Initialize tracker with consent setting
const tracker = getTracker({
  enabled: hasConsent,
});

// Provide opt-out mechanism
export function OptOutButton() {
  const handleOptOut = async () => {
    await setUserConsent(false);
    tracker.destroy();
  };

  return <button onClick={handleOptOut}>Opt Out of Tracking</button>;
}
```

---

## Troubleshooting

### Events not appearing in audit log

1. **Check browser console** for errors
2. **Verify API endpoint** is accessible: `/api/v1/tracking`
3. **Check rate limiting**: Ensure you haven't exceeded 100 requests/minute
4. **Verify authentication**: Some events require authenticated users

### Performance issues

1. **Check batch size**: Default is 10 events per batch
2. **Adjust flush interval**: Default is 5 seconds
3. **Reduce metadata**: Don't include large objects in metadata
4. **Use debouncing**: For high-frequency events

### Missing metadata

1. **Verify enrichment**: Metadata is automatically enriched with session info
2. **Check custom fields**: Ensure custom metadata is properly formatted
3. **Review privacy filters**: Some fields may be filtered for privacy

---

## API Reference

### Client Tracking Functions

```typescript
// Track custom event
track(event: TrackingEvent): void

// Track navigation
trackNavigation(to: string, from?: string): void

// Track button click
trackClick(elementId: string, elementText?: string, metadata?: EventMetadata): void

// Track form interaction
trackForm(action: FormAction, formId: string, metadata?: EventMetadata): void

// Track error
trackError(errorType: ErrorType, errorMessage: string, metadata?: EventMetadata): void

// Track API call
trackApiCall(endpoint: string, method: string, duration: number, status: number, metadata?: EventMetadata): void

// Flush events immediately
flushEvents(): void
```

### React Hooks

```typescript
// Main tracking hook
useEventTracking(): TrackingMethods

// Auto track page views
usePageViewTracking(metadata?: EventMetadata): void

// Agent tracking
useAgentTracking(): AgentTrackingMethods

// Workflow tracking
useWorkflowTracking(): WorkflowTrackingMethods

// Report tracking
useReportTracking(): ReportTrackingMethods

// Audience tracking
useAudienceTracking(): AudienceTrackingMethods

// Search tracking
useSearchTracking(): SearchTrackingMethods

// Time on page
useTimeOnPage(pageId: string, metadata?: EventMetadata): void

// Form tracking
useFormTracking(formId: string, submitHandler?: any, metadata?: EventMetadata): FormTrackingHandlers
```

---

## Examples

### Complete Component with Tracking

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAgentTracking, useFormTracking, usePageViewTracking } from '@/hooks/useEventTracking';
import { Button } from '@/components/ui/button';

export default function AgentBuilderPage() {
  // Track page view
  usePageViewTracking({ pageName: 'Agent Builder' });

  // Agent tracking
  const { trackAgentCreate } = useAgentTracking();

  // Form setup
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { onFieldChange, onSubmit } = useFormTracking('agent-builder-form');

  const onFormSubmit = async (data: any) => {
    try {
      // Create agent
      const agent = await createAgent(data);

      // Track success
      trackAgentCreate(agent.id, {
        agentType: data.type,
        promptLength: data.prompt.length,
        includesDataSources: data.dataSources.length > 0,
      });

      // Redirect to agent page
      router.push(`/dashboard/agents/${agent.id}`);
    } catch (error) {
      // Error tracking is automatic
      console.error('Failed to create agent:', error);
    }
  };

  return (
    <div>
      <h1>Create Agent</h1>

      <form onSubmit={onSubmit(handleFormSubmit)}>
        <input
          {...register('name', { required: true })}
          onChange={onFieldChange('name')}
          placeholder="Agent name"
        />

        <textarea
          {...register('prompt', { required: true })}
          onChange={onFieldChange('prompt')}
          placeholder="Agent prompt"
        />

        <Button type="submit">Create Agent</Button>
      </form>
    </div>
  );
}
```

---

## Appendix

### Event Action Reference

Complete list of all tracked event actions organized by category:

**Authentication**
- `login_attempt`, `login_success`, `login_failure`
- `signup_start`, `signup_complete`, `signup_failure`
- `logout`, `password_reset_request`, `password_reset_complete`

**Navigation**
- `page_view`, `route_change`, `sidebar_click`, `breadcrumb_click`
- `command_palette_open`, `command_palette_select`

**Agent**
- `agent_view`, `agent_create_start`, `agent_create_complete`
- `agent_edit_start`, `agent_edit_complete`, `agent_delete`
- `agent_run_start`, `agent_run_complete`, `agent_run_error`
- `agent_publish`, `agent_test`, `agent_clone`

**Workflow**
- `workflow_view`, `workflow_create_start`, `workflow_create_complete`
- `workflow_edit_start`, `workflow_edit_complete`, `workflow_delete`
- `workflow_run_start`, `workflow_run_complete`, `workflow_run_error`
- `workflow_step_add`, `workflow_step_remove`, `workflow_step_reorder`

**Report**
- `report_view`, `report_create_start`, `report_create_complete`
- `report_edit`, `report_delete`, `report_export`, `report_share`
- `report_template_select`

[... and many more - see full list in client-tracking.ts]

### Metadata Field Reference

Common metadata fields used across events:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `sessionId` | string | Unique session identifier | `1234567890-abc123` |
| `path` | string | Current page path | `/dashboard/agents` |
| `referrer` | string | Previous page URL | `https://example.com/page` |
| `resourceId` | string | ID of affected resource | `agent-123` |
| `resourceType` | string | Type of resource | `agent` |
| `duration` | number | Operation duration (ms) | `1250` |
| `errorMessage` | string | Error description | `Failed to load data` |
| `errorCode` | string | Error code | `ERR_NETWORK` |
| `componentName` | string | React component name | `AgentBuilder` |

---

## Support

For questions or issues with event tracking:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review example implementations in this guide
3. Check the browser console for debug logs
4. Contact the development team

---

**Last Updated**: 2026-01-12
**Version**: 1.0.0
