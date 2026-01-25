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
          toast.error('Rate limit exceeded', {
            description: data.message || 'You can only request one export per 24 hours',
          })
        } else if (response.status === 409) {
          toast.error('Export in progress', {
            description: 'An export request is already being processed',
          })
        } else {
          throw new Error(data.error || 'Failed to request export')
        }
        return
      }

      toast.success('Export requested', {
        description: 'Your data export has been queued and will be ready shortly',
      })

      setDialogOpen(false)
      onExportRequested?.()
    } catch (error) {
      toast.error('Failed to request export', {
        description: error instanceof Error ? error.message : 'Please try again later',
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
          <CardTitle>Request Data Export</CardTitle>
        </div>
        <CardDescription>
          Download a copy of your personal data in compliance with GDPR Article 20
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
          <h4 className="font-medium text-sm">What&apos;s included in your export:</h4>
          <ul className="grid gap-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Profile information (name, email, avatar)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Organization memberships and roles
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Created agents, reports, and dashboards
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Activity logs and audit history
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Preferences and settings
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="gap-1">
            <FileJson className="h-3 w-3" />
            JSON Format
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Shield className="h-3 w-3" />
            GDPR Compliant
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            30-Day Availability
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Request Export
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Data Export</DialogTitle>
              <DialogDescription>
                This will generate a complete export of your personal data in JSON format.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50 p-4">
                <h4 className="font-medium text-sm text-blue-800 dark:text-blue-200 mb-2">
                  GDPR Data Portability Rights
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Under GDPR Article 20, you have the right to receive your personal data in a
                  structured, commonly used, and machine-readable format. Your export will be
                  available for 30 days after processing.
                </p>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>Processing time:</strong> Most exports complete within a few minutes,
                  but complex requests may take up to 30 days as permitted by GDPR.
                </p>
                <p>
                  <strong>Rate limit:</strong> You may request one export per 24 hours.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRequestExport} disabled={requesting}>
                {requesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Requesting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Confirm Request
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
