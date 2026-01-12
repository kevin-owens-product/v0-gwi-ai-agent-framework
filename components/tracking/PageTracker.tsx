/**
 * PageTracker Component
 *
 * Automatic page view tracking component that should be included in every page.
 * Extracts page name from the URL and tracks the page view automatically.
 *
 * @component
 * @module components/tracking/PageTracker
 *
 * @example
 * ```tsx
 * export default function MyPage() {
 *   return (
 *     <>
 *       <PageTracker pageName="My Feature" />
 *       <div>Page content</div>
 *     </>
 *   );
 * }
 * ```
 */

'use client';

import { usePageViewTracking } from '@/hooks/useEventTracking';

interface PageTrackerProps {
  /**
   * Human-readable page name
   * @example "Dashboard", "Agent Builder", "Report Viewer"
   */
  pageName: string;

  /**
   * Additional metadata to track with the page view
   */
  metadata?: Record<string, any>;
}

/**
 * Component that automatically tracks page views.
 * Include this at the top of every page component.
 */
export function PageTracker({ pageName, metadata }: PageTrackerProps) {
  usePageViewTracking({ pageName, ...metadata });
  return null; // This component doesn't render anything
}
