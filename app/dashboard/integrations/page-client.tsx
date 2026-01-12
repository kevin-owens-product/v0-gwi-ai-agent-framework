/**
 * Client-side tracking wrapper for Integrations page
 */
'use client';

import { PageTracker } from "@/components/tracking/PageTracker";

export function IntegrationsPageTracker() {
  return <PageTracker pageName="Integrations" />;
}
