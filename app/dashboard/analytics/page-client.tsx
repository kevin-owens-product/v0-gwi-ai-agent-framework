/**
 * Client-side tracking wrapper for Analytics page
 */
'use client';

import { PageTracker } from "@/components/tracking/PageTracker";

interface AnalyticsPageTrackerProps {
  pageName?: string;
}

export function AnalyticsPageTracker({ pageName = "Analytics" }: AnalyticsPageTrackerProps) {
  return <PageTracker pageName={pageName} />;
}
