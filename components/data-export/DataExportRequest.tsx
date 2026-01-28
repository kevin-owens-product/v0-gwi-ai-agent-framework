/**
 * @prompt-id forge-v4.1:feature:data-export:007
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4.5
 *
 * Data Export Request Component
 *
 * Provides UI for users to request a GDPR-compliant export of their personal data
 */

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Download, FileJson, Loader2, Shield, Clock, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface DataExportRequestProps {
  onExportRequested?: () => void
}

export function DataExportRequest({ onExportRequested }: DataExportRequestProps) {
  const t = useTranslations('dataExport.request')
  const tCommon = useTranslations('common')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [requesting, setRequesting] = useState(false)

  const handleRequestExport = async () => {
    setRequesting(true)
    try {
      const response = await fetch('/api/v1/data-export/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'GDPR_REQUEST' }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          toast.error(t('errors.rateLimitTitle'), {
            description: data.message || t('errors.rateLimitDescription'),
          })
        } else if (response.status === 409) {
          toast.error(t('errors.inProgressTitle'), {
            description: t('errors.inProgressDescription'),
          })
        } else {
          throw new Error(data.error || t('errors.failedRequest'))
        }
        return
      }

      toast.success(t('success.title'), {
        description: t('success.description'),
      })

      setDialogOpen(false)
      onExportRequested?.()
    } catch (error) {
      toast.error(t('errors.failedTitle'), {
        description: error instanceof Error ? error.message : t('errors.tryAgain'),
      })
    } finally {
      setRequesting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          <CardTitle>{t('title')}</CardTitle>
        </div>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
          <h4 className="font-medium text-sm">{t('included.title')}</h4>
          <ul className="grid gap-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {t('included.profile')}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {t('included.organizations')}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {t('included.content')}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {t('included.activityLogs')}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {t('included.preferences')}
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="gap-1">
            <FileJson className="h-3 w-3" />
            {t('badges.jsonFormat')}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Shield className="h-3 w-3" />
            {t('badges.gdprCompliant')}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {t('badges.availability')}
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              {t('requestButton')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('dialog.title')}</DialogTitle>
              <DialogDescription>
                {t('dialog.description')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50 p-4">
                <h4 className="font-medium text-sm text-blue-800 dark:text-blue-200 mb-2">
                  {t('dialog.gdprTitle')}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {t('dialog.gdprDescription')}
                </p>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>{t('dialog.processingTimeLabel')}</strong> {t('dialog.processingTimeValue')}
                </p>
                <p>
                  <strong>{t('dialog.rateLimitLabel')}</strong> {t('dialog.rateLimitValue')}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {tCommon('cancel')}
              </Button>
              <Button onClick={handleRequestExport} disabled={requesting}>
                {requesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('requesting')}
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    {t('confirmButton')}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}
