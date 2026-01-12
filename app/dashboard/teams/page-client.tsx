/**
 * Client-side tracking wrapper for Teams page
 */
'use client';

import { PageTracker } from "@/components/tracking/PageTracker";

export function TeamsPageTracker() {
  return <PageTracker pageName="Teams" />;
}
