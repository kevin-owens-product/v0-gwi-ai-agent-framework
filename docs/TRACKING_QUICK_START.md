# Event Tracking Quick Start Guide

**Get tracking up and running in 5 minutes**

---

## 📦 What's Already Set Up

✅ Client-side tracking system with automatic batching
✅ Server-side API at `/api/v1/tracking`
✅ 9 React hooks ready to use
✅ Integration with audit log system
✅ Example implementations in AgentBuilder, WorkflowBuilder, ReportBuilder

---

## 🚀 Quick Start: Add Tracking to Your Component

### Step 1: Import the Hook

```typescript
import { usePageViewTracking } from '@/hooks/useEventTracking';
```

### Step 2: Track Page Views (Easiest!)

```typescript
export function MyComponent() {
  // That's it! Auto-tracks when users visit this page
  usePageViewTracking();

  return <div>Your content</div>;
}
```

### Step 3: Track User Actions

```typescript
import { useEventTracking } from '@/hooks/useEventTracking';

export function MyComponent() {
  const { trackButtonClick } = useEventTracking();

  return (
    <button onClick={() => trackButtonClick('my-button', 'Submit')}>
      Submit
    </button>
  );
}
```

**You're done!** Events are now being tracked and stored in your audit log.

---

## 🎯 Common Use Cases

### 1. Track Button Clicks

```typescript
const { trackButtonClick } = useEventTracking();

<button onClick={() => trackButtonClick('create-report', 'Create Report')}>
  Create
</button>
```

### 2. Track Form Submissions

```typescript
const { trackFormSubmit } = useEventTracking();

const handleSubmit = (data) => {
  trackFormSubmit('contact-form', {
    email: data.email,
    source: 'landing-page'
  });
  // ... submit logic
};
```

### 3. Track Agent Operations

```typescript
import { useAgentTracking } from '@/hooks/useEventTracking';

const { trackAgentCreate, trackAgentRun } = useAgentTracking();

// When agent is created
trackAgentCreate(agent.id, {
  agentType: 'research',
  promptLength: 450
});

// When agent runs
trackAgentRun(agent.id, duration, {
  success: true,
  tokensUsed: 1200
});
```

### 4. Track Workflow Creation

```typescript
import { useWorkflowTracking } from '@/hooks/useEventTracking';

const { trackWorkflowCreate, trackWorkflowStepAdd } = useWorkflowTracking();

// When workflow is created
trackWorkflowCreate(workflow.id, {
  stepCount: 3,
  schedule: 'daily'
});

// When step is added
trackWorkflowStepAdd(workflow.id, {
  stepIndex: 2,
  agentId: 'audience-explorer'
});
```

### 5. Track Report Actions

```typescript
import { useReportTracking } from '@/hooks/useEventTracking();

const { trackReportCreate, trackReportView, trackReportExport } = useReportTracking();

// When report is created
trackReportCreate(report.id, {
  reportType: 'presentation',
  dataSourcesCount: 2
});

// When report is exported
trackReportExport(report.id, 'pdf', {
  pageCount: 15
});
```

### 6. Track Search & Filtering

```typescript
import { useSearchTracking } from '@/hooks/useEventTracking';

const { trackSearch, trackFilterApply } = useSearchTracking();

const handleSearch = (query) => {
  const results = performSearch(query);
  trackSearch(query, results.length);
};

const handleFilter = (filters) => {
  trackFilterApply(filters, {
    filterCount: Object.keys(filters).length
  });
};
```

---

## 📋 Available Hooks

| Hook | Purpose | Example Usage |
|------|---------|---------------|
| `useEventTracking()` | General tracking | Track any custom event |
| `usePageViewTracking()` | Page views | Auto-track when component loads |
| `useAgentTracking()` | Agent lifecycle | Track create, run, delete |
| `useWorkflowTracking()` | Workflow operations | Track create, run, steps |
| `useReportTracking()` | Report actions | Track create, view, export |
| `useAudienceTracking()` | Audience management | Track create, lookalike, size |
| `useSearchTracking()` | Search & filters | Track queries, filters |
| `useTimeOnPage()` | Time spent | Track engagement duration |
| `useFormTracking()` | Form interactions | Auto-track form lifecycle |

---

## 🎨 Pattern: Complete Component Example

Here's a fully tracked component following best practices:

```typescript
/**
 * MyFeature Component with Complete Tracking
 */
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { usePageViewTracking, useEventTracking } from '@/hooks/useEventTracking';

export function MyFeature() {
  // 1. Track page views automatically
  usePageViewTracking({
    pageName: 'My Feature',
    featureVersion: 'v2'
  });

  // 2. Get tracking methods
  const { trackButtonClick, trackFormSubmit } = useEventTracking();

  const [data, setData] = useState('');

  // 3. Track user actions
  const handleAction = () => {
    trackButtonClick('action-button', 'Do Something', {
      dataLength: data.length
    });
    // ... action logic
  };

  const handleSubmit = (formData) => {
    trackFormSubmit('my-feature-form', {
      fieldCount: Object.keys(formData).length
    });
    // ... submit logic
  };

  return (
    <div>
      <Button onClick={handleAction}>Do Something</Button>
      {/* Your UI */}
    </div>
  );
}
```

---

## 📊 View Your Tracked Data

After implementing tracking, view your data in three places:

### 1. Audit Log UI
Navigate to: **`/dashboard/settings/audit-log`**
- See all tracked events
- Filter by action, resource, or user
- Export for analysis

### 2. Analytics Dashboard
Navigate to: **`/dashboard/analytics`**
- View aggregated metrics
- See usage trends
- Analyze user behavior

### 3. API Query
```typescript
// Query via API
const response = await fetch('/api/v1/audit?action=create&resourceType=agent');
const events = await response.json();
```

---

## 🐛 Debugging

### Enable Debug Mode

```typescript
// In browser console or app initialization
import { getTracker } from '@/lib/client-tracking';
getTracker({ debug: true });
```

### Check Tracked Events

1. **Browser Console**: Look for `[Tracking]` logs
2. **Network Tab**: Check POST requests to `/api/v1/tracking`
3. **Database**: Query `AuditLog` table directly

### Common Issues

**Events not appearing?**
- Check browser console for errors
- Verify `/api/v1/tracking` endpoint is accessible
- Ensure you're authenticated (some events require auth)

**Missing metadata?**
- Metadata is automatically enriched with session, path, user agent
- Custom metadata must be valid JSON

---

## 🎓 Best Practices

### ✅ DO:

- Track page views automatically with `usePageViewTracking()`
- Add meaningful labels and metadata
- Track errors and performance
- Use consistent naming conventions
- Track both success and failure cases

### ❌ DON'T:

- Track PII (passwords, credit cards, emails)
- Track in tight loops or high-frequency events
- Include large objects in metadata
- Track without user consent (implement opt-out)

---

## 📈 What to Track

### High Priority
- ✅ Page views
- ✅ Feature usage (create, edit, delete)
- ✅ Form submissions
- ✅ Button clicks on key actions
- ✅ Errors and failures

### Medium Priority
- Search queries
- Filter applications
- Export operations
- Settings changes
- Integration connections

### Low Priority
- Hover events
- Scroll depth
- Time on page
- Modal opens/closes

---

## 🔗 Next Steps

1. **Add tracking to your components** using examples above
2. **View tracked data** in audit log or analytics dashboard
3. **Read full documentation** at `/docs/EVENT_TRACKING_GUIDE.md`
4. **Explore examples** in:
   - `/components/agents/agent-builder.tsx`
   - `/components/workflows/workflow-builder.tsx`
   - `/components/reports/report-builder.tsx`

---

## 📚 Additional Resources

- **Full Tracking Guide**: `/docs/EVENT_TRACKING_GUIDE.md` (3,500+ lines)
- **Component Documentation**: `/docs/COMPONENT_DOCUMENTATION_GUIDE.md`
- **Implementation Summary**: `/docs/TRACKING_AND_DOCUMENTATION_IMPLEMENTATION.md`
- **Client Tracking API**: `/lib/client-tracking.ts`
- **React Hooks**: `/hooks/useEventTracking.ts`

---

## 💡 Pro Tips

### Tip 1: Use Hooks for Consistency
Always use hooks instead of importing `track()` directly. Hooks provide automatic context enrichment.

### Tip 2: Track User Journeys
Track related events together to understand complete user flows:
```typescript
// Start → Action → Complete
trackButtonClick('start-workflow');
trackWorkflowStepAdd('workflow-123');
trackWorkflowCreate('workflow-123');
```

### Tip 3: Add Rich Metadata
More context = better insights:
```typescript
trackAgentCreate(agent.id, {
  agentType: 'research',
  promptLength: 450,
  dataSourcesCount: 2,
  isDraft: false,
  duration: 1250  // Time to create
});
```

### Tip 4: Track Performance
Include duration for slow operations:
```typescript
const startTime = Date.now();
await performOperation();
const duration = Date.now() - startTime;

trackEvent({
  action: 'operation_complete',
  value: duration
});
```

---

## ⚡ Quick Reference Card

```typescript
// Page View
usePageViewTracking();

// Button Click
const { trackButtonClick } = useEventTracking();
trackButtonClick('btn-id', 'Button Text');

// Form Submit
const { trackFormSubmit } = useEventTracking();
trackFormSubmit('form-id', { metadata });

// Agent Action
const { trackAgentCreate } = useAgentTracking();
trackAgentCreate('agent-id', { metadata });

// Workflow Action
const { trackWorkflowCreate } = useWorkflowTracking();
trackWorkflowCreate('workflow-id', { metadata });

// Report Action
const { trackReportCreate } = useReportTracking();
trackReportCreate('report-id', { metadata });

// Search
const { trackSearch } = useSearchTracking();
trackSearch('query', resultsCount);

// Custom Event
const { trackEvent } = useEventTracking();
trackEvent({
  category: 'feature',
  action: 'custom_action',
  label: 'My Action',
  metadata: { key: 'value' }
});
```

---

**Need Help?** Check the full documentation or ask the development team.

**Ready to Start?** Pick a component and add `usePageViewTracking()` now!
