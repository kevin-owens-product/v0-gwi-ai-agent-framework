/**
 * Client-side tracking wrapper for Workflows page
 */
'use client';

import { PageTracker } from "@/components/tracking/PageTracker";

export function WorkflowsPageTracker() {
  return <PageTracker pageName="Workflows List" />;
}
