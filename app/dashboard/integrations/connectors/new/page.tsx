/**
 * @prompt-id forge-v4.1:feature:data-connectors:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { Suspense } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ConnectorForm } from '@/components/connectors/ConnectorForm'
import { PageTracker } from '@/components/tracking/PageTracker'

export default function NewConnectorPage() {
  return (
    <div className="space-y-6">
      <PageTracker pageName="New Connector" />

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/integrations/connectors">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add Data Connector</h1>
          <p className="text-muted-foreground">
            Connect a new data source to your organization
          </p>
        </div>
      </div>

      {/* Form */}
      <Suspense fallback={<FormSkeleton />}>
        <ConnectorForm mode="create" />
      </Suspense>
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-60 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}
