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
import { useTranslations } from 'next-intl'
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
  const t = useTranslations("settings.security.dataExports")
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
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {t("refresh")}
        </Button>
      </div>

      {/* GDPR Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>{t("yourDataRights")}</AlertTitle>
        <AlertDescription>
          {t("yourDataRightsDescription")}
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
                <CardTitle>{t("noActiveExports")}</CardTitle>
              </div>
              <CardDescription>
                {t("noActiveExportsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Info className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">
                  {t("noActiveExportsHint")}
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
              <CardTitle>{t("exportHistory")}</CardTitle>
              <CardDescription>{t("exportHistoryDescription")}</CardDescription>
            </div>
            {stats && (
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{t("total")}: {stats.total}</span>
                {stats.pending > 0 && <span>{t("pending")}: {stats.pending}</span>}
                {stats.processing > 0 && <span>{t("processing")}: {stats.processing}</span>}
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
          <CardTitle>{t("aboutDataExports")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="included" className="w-full">
            <TabsList>
              <TabsTrigger value="included">{t("tabs.whatsIncluded")}</TabsTrigger>
              <TabsTrigger value="format">{t("tabs.exportFormat")}</TabsTrigger>
              <TabsTrigger value="faq">{t("tabs.faq")}</TabsTrigger>
            </TabsList>

            <TabsContent value="included" className="space-y-4 pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">{t("included.profileInfo")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("included.profileInfoDesc")}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">{t("included.orgMemberships")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("included.orgMembershipsDesc")}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">{t("included.createdContent")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("included.createdContentDesc")}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">{t("included.activityHistory")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("included.activityHistoryDesc")}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">{t("included.preferences")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("included.preferencesDesc")}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">{t("included.apiKeys")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("included.apiKeysDesc")}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="format" className="space-y-4 pt-4">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  {t("format.description")}
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>{t("format.machineReadable")}</li>
                  <li>{t("format.humanReadable")}</li>
                  <li>{t("format.compatible")}</li>
                  <li>{t("format.easyImport")}</li>
                </ul>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <p className="text-sm font-mono text-muted-foreground">
                    {t("format.exampleStructure")}
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
                  <h4 className="font-medium">{t("faq.howLong")}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("faq.howLongAnswer")}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">{t("faq.howLongAvailable")}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("faq.howLongAvailableAnswer")}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">{t("faq.howOften")}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("faq.howOftenAnswer")}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">{t("faq.isSecure")}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("faq.isSecureAnswer")}
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
