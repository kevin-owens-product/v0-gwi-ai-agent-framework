/**
 * Client-side tracking wrapper for Memory page
 */
'use client';

import { PageTracker } from "@/components/tracking/PageTracker";

export function MemoryPageTracker() {
  return <PageTracker pageName="Memory" />;
}
