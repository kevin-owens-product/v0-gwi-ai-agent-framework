/**
 * Client-side tracking wrapper for Brand Tracking page
 */
'use client';

import { PageTracker } from "@/components/tracking/PageTracker";

export function BrandTrackingPageTracker() {
  return <PageTracker pageName="Brand Tracking" />;
}
