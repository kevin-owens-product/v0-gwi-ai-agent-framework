/**
 * Client-side tracking wrapper for Brand Tracking page
 */
'use client';

import { PageTracker } from "@/components/tracking/PageTracker";

interface BrandTrackingPageTrackerProps {
  pageName?: string;
}

export function BrandTrackingPageTracker({ pageName = "Brand Tracking" }: BrandTrackingPageTrackerProps) {
  return <PageTracker pageName={pageName} />;
}
