/**
 * @prompt-id forge-v4.1:feature:data-export:011
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4.5
 *
 * GDPR-Compliant Data Exports Page
 *
 * Allows users to request and download exports of their personal data
 * in compliance with GDPR Article 20 (Right to data portability)
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, RefreshCw, Shield, Info, FileJson } from 'lucide-react'
import { DataExportRequest, ExportStatusCard, ExportHistoryTable } from '@/components/data-export'

interface ExportRecord {
  id: string
  type: string
  status: string
  format: string
  fileSize: number | null
  createdAt: string
  startedAt: string | null
  completedAt: string | null
  expiresAt: string | null
  error: string | null
  downloadAvailable: boolean
}

interface ExportStats {
  total: number
  pending: number
  processing: number
  completed: number
  failed: number
  expired: number
}

export default function DataExportsPage() {
  const [exports, setExports] = useState<ExportRecord[]>([])
  const [stats, setStats] = useState<ExportStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchExports = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true)
    }

    try {
      const response = await fetch('/api/v1/data-export/status')
      if (response.ok) {
        const data = await response.json()
        setExports(data.exports)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch exports:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchExports()

    // Poll for updates if there are pending/processing exports
    const interval = setInterval(() => {
      if (exports.some((e) => ['PENDING', 'PROCESSING'].includes(e.status))) {
        fetchExports()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [fetchExports, exports])

  const handleExportRequested = () => {
    fetchExports(true)
  }

  const handleRefresh = () => {
    fetchExports(true)
  }

  // Get the most recent active export (for the status card)
  const activeExport = exports.find((e) => ['PENDING', 'PROCESSING', 'COMPLETED'].includes(e.status))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Data Exports</h1>
          <p className="text-muted-foreground">
            Request exports of your personal data for GDPR compliance
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* GDPR Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Your Data Rights</AlertTitle>
        <AlertDescription>
          Under GDPR Article 20, you have the right to receive your personal data in a structured,
          commonly used, and machine-readable format. Exports are processed within 30 days and
          remain available for download for 30 days after completion.
        </AlertDescription>
      </Alert>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Request Export Card */}
        <DataExportRequest onExportRequested={handleExportRequested} />

        {/* Active Export Status */}
        {activeExport && (
          <ExportStatusCard export={activeExport} />
        )}

        {/* Empty state for status card */}
        {!activeExport && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileJson className="h-5 w-5 text-muted-foreground" />
                <CardTitle>No Active Exports</CardTitle>
              </div>
              <CardDescription>
                Request an export to see its status here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Info className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">
                  Your export status will appear here after you request a data export
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Export History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Export History</CardTitle>
              <CardDescription>View and download your previous data exports</CardDescription>
            </div>
            {stats && (
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Total: {stats.total}</span>
                {stats.pending > 0 && <span>Pending: {stats.pending}</span>}
                {stats.processing > 0 && <span>Processing: {stats.processing}</span>}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ExportHistoryTable exports={exports} onRefresh={handleRefresh} />
        </CardContent>
      </Card>

      {/* Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>About Data Exports</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="included" className="w-full">
            <TabsList>
              <TabsTrigger value="included">What&apos;s Included</TabsTrigger>
              <TabsTrigger value="format">Export Format</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            <TabsContent value="included" className="space-y-4 pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Profile Information</h4>
                  <p className="text-sm text-muted-foreground">
                    Your name, email, avatar, and account settings
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Organization Memberships</h4>
                  <p className="text-sm text-muted-foreground">
                    All organizations you belong to and your roles
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Created Content</h4>
                  <p className="text-sm text-muted-foreground">
                    Agents, reports, dashboards, and other content you&apos;ve created
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Activity History</h4>
                  <p className="text-sm text-muted-foreground">
                    Audit logs and activity records associated with your account
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Preferences</h4>
                  <p className="text-sm text-muted-foreground">
                    Your theme, language, notification, and other settings
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">API Keys</h4>
                  <p className="text-sm text-muted-foreground">
                    API key metadata (keys themselves are not exported for security)
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="format" className="space-y-4 pt-4">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Your data is exported in JSON (JavaScript Object Notation) format, which is:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Machine-readable and portable as required by GDPR</li>
                  <li>Human-readable when opened in a text editor</li>
                  <li>Compatible with most data processing tools</li>
                  <li>Easy to import into other services</li>
                </ul>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <p className="text-sm font-mono text-muted-foreground">
                    Example structure:
                  </p>
                  <pre className="mt-2 text-xs overflow-x-auto">
{`{
  "exportMetadata": {
    "exportId": "...",
    "exportedAt": "2026-01-25T...",
    "gdprCompliant": true
  },
  "profile": { ... },
  "preferences": { ... },
  "organizationMemberships": [ ... ],
  "createdAgents": [ ... ],
  ...
}`}
                  </pre>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="faq" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">How long does an export take?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Most exports complete within a few minutes. Complex requests with large amounts
                    of data may take longer, but GDPR allows up to 30 days for processing.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">How long is an export available?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Completed exports are available for download for 30 days. After this period,
                    you&apos;ll need to request a new export.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">How often can I request an export?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    You can request one export per 24 hours. This helps ensure system resources
                    are available for all users.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Is my export secure?</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Yes. Exports are only accessible to you and require authentication to download.
                    Sensitive data like passwords and API key secrets are never included in exports.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
