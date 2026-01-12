# Tracking Coverage Report

## Summary

**Total Pages with Tracking: 30**
- Main Dashboard Pages: 21
- Settings Sub-Pages: 9
- Coverage: 100% of dashboard pages

## Implementation Details

### Component Used
All pages use the `PageTracker` component from `/components/tracking/PageTracker.tsx`, which wraps the `usePageViewTracking()` hook for automatic page view tracking.

### Main Dashboard Pages (21)

| Page | Path | Tracking Type | Metadata |
|------|------|---------------|----------|
| Agents List | `/app/dashboard/agents/page.tsx` | Client | activeTab |
| Workflows List | `/app/dashboard/workflows/page.tsx` | Server (via client wrapper) | None |
| Reports List | `/app/dashboard/reports/page.tsx` | Client | activeTab |
| Audiences List | `/app/dashboard/audiences/page.tsx` | Client | activeTab, searchQuery |
| Crosstabs List | `/app/dashboard/crosstabs/page.tsx` | Client | activeTab |
| Charts List | `/app/dashboard/charts/page.tsx` | Client | activeTab |
| Dashboards List | `/app/dashboard/dashboards/page.tsx` | Client | activeTab |
| Insights List | `/app/dashboard/insights/page.tsx` | Client | typeFilter, searchQuery |
| Templates List | `/app/dashboard/templates/page.tsx` | Client | selectedCategory, searchQuery |
| Brand Tracking | `/app/dashboard/brand-tracking/page.tsx` | Server (via client wrapper) | None |
| Analytics | `/app/dashboard/analytics/page.tsx` | Server (via client wrapper) | None |
| Playground | `/app/dashboard/playground/page.tsx` | Client | mode, selectedAgent, hasCustomAgent |
| Projects List | `/app/dashboard/projects/page.tsx` | Client | searchQuery, totalProjects |
| Integrations | `/app/dashboard/integrations/page.tsx` | Server (via client wrapper) | None |
| Teams | `/app/dashboard/teams/page.tsx` | Server (via client wrapper) | None |
| Settings | `/app/dashboard/settings/page.tsx` | Client | None |
| Inbox | `/app/dashboard/inbox/page.tsx` | Client | selectedTab, searchQuery |
| Notifications | `/app/dashboard/notifications/page.tsx` | Client | unreadCount |
| Memory | `/app/dashboard/memory/page.tsx` | Server (via client wrapper) | None |
| Help Center | `/app/dashboard/help/page.tsx` | Client | searchQuery |
| Agent Store | `/app/dashboard/store/page.tsx` | Client | selectedCategory, sortBy, searchQuery |

### Settings Sub-Pages (9)

| Page | Path | Tracking Type | Metadata |
|------|------|---------------|----------|
| Profile | `/app/dashboard/settings/profile/page.tsx` | Client | None |
| Security | `/app/dashboard/settings/security/page.tsx` | Client | twoFactorEnabled |
| Billing | `/app/dashboard/settings/billing/page.tsx` | Client | None |
| API Keys | `/app/dashboard/settings/api-keys/page.tsx` | Client | totalKeys |
| General | `/app/dashboard/settings/general/page.tsx` | Client | None |
| Team | `/app/dashboard/settings/team/page.tsx` | Client | totalMembers, pendingInvitations |
| Appearance | `/app/dashboard/settings/appearance/page.tsx` | Client | theme, accentColor |
| Notifications | `/app/dashboard/settings/notifications/page.tsx` | Client | None |
| Audit Log | `/app/dashboard/settings/audit-log/page.tsx` | Client | total, currentPage, selectedAction, selectedResource |

## Client Wrappers for Server Components

For server components that couldn't directly use hooks, we created dedicated client wrappers:

1. `/app/dashboard/workflows/page-client.tsx` - WorkflowsPageTracker
2. `/app/dashboard/brand-tracking/page-client.tsx` - BrandTrackingPageTracker
3. `/app/dashboard/analytics/page-client.tsx` - AnalyticsPageTracker
4. `/app/dashboard/integrations/page-client.tsx` - IntegrationsPageTracker
5. `/app/dashboard/teams/page-client.tsx` - TeamsPageTracker
6. `/app/dashboard/memory/page-client.tsx` - MemoryPageTracker

## Data Captured

Each page view tracks:
- **Page Name**: Human-readable page identifier
- **Timestamp**: Automatic via tracking system
- **User ID**: From session (if authenticated)
- **Session ID**: Unique session identifier
- **Custom Metadata**: Page-specific context (tabs, filters, counts, etc.)
- **User Agent**: Browser and device information
- **Referrer**: Navigation source
- **Duration**: Time spent on page (via useTimeOnPage)

## Benefits

1. **Complete Visibility**: Track user journeys across all dashboard pages
2. **Contextual Insights**: Metadata provides rich context about user interactions
3. **Performance Monitoring**: Identify slow pages and optimize user experience
4. **Feature Usage**: Understand which features are most/least used
5. **User Behavior**: Analyze navigation patterns and drop-off points
6. **A/B Testing**: Foundation for testing different UX approaches
7. **Compliance**: Audit trail for user activity

## Next Steps

1. ✅ Add tracking to all dashboard pages (21 pages)
2. ✅ Add tracking to all settings sub-pages (9 pages)
3. ⏳ Add tracking to public pages (landing, pricing, about, etc.)
4. ⏳ Add tracking to modal dialogs and flyouts
5. ⏳ Add tracking to feature-specific flows (agent creation, report generation, etc.)
6. ⏳ Verify tracking in development environment
7. ⏳ Create analytics dashboard for viewing tracked events
8. ⏳ Set up alerts for tracking anomalies

## Files Changed

### New Files (8)
- `components/tracking/PageTracker.tsx` - Reusable page tracker component
- `scripts/add-tracking-to-pages.js` - Automation script for future tracking
- 6 x client wrapper files for server components

### Modified Files (30)
- 21 main dashboard pages
- 9 settings sub-pages

### Total Lines Changed
- **396 insertions, 7 deletions**
- Average: ~13 lines per page (imports + tracker component)

## Testing Recommendations

1. **Manual Testing**: Visit each page and verify events appear in audit log
2. **Automated Tests**: Update E2E tests to verify tracking calls
3. **Performance**: Measure impact on page load times (should be negligible)
4. **Privacy**: Ensure no PII is inadvertently tracked in metadata
5. **Data Quality**: Verify metadata is accurate and useful

## Maintenance

To add tracking to a new page:

```tsx
import { PageTracker } from "@/components/tracking/PageTracker"

export default function YourPage() {
  return (
    <div>
      <PageTracker pageName="Your Page Name" metadata={{ customField: value }} />
      {/* Your page content */}
    </div>
  )
}
```

For server components, create a client wrapper:

```tsx
// app/your-page/page-client.tsx
'use client';

import { PageTracker } from "@/components/tracking/PageTracker";

export function YourPageTracker() {
  return <PageTracker pageName="Your Page Name" />;
}
```

Then import in server component:

```tsx
import { YourPageTracker } from "./page-client"

export default function YourPage() {
  return (
    <div>
      <YourPageTracker />
      {/* Your page content */}
    </div>
  )
}
```

---

**Last Updated**: 2026-01-12
**Author**: Claude
**Status**: ✅ Complete - All dashboard pages tracked
