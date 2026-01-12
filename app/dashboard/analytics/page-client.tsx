/**
 * Client-side tracking wrapper for Analytics page
 */
'use client';

import { PageTracker } from "@/components/tracking/PageTracker";

export function AnalyticsPageTracker() {
  return <PageTracker pageName="Analytics" />;
}
