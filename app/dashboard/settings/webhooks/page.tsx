'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Webhook, Plus, Loader2, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

export default function WebhooksPage() {
  const t = useTranslations("settings.webhooks")

  const WEBHOOK_EVENTS = [
    { value: 'agent.run.started', label: t("eventTypes.agentRunStarted") },
    { value: 'agent.run.completed', label: t("eventTypes.agentRunCompleted") },
    { value: 'agent.run.failed', label: t("eventTypes.agentRunFailed") },
    { value: 'workflow.run.started', label: t("eventTypes.workflowRunStarted") },
    { value: 'workflow.run.completed', label: t("eventTypes.workflowRunCompleted") },
    { value: 'workflow.run.failed', label: t("eventTypes.workflowRunFailed") },
    { value: 'report.generated', label: t("eventTypes.reportGenerated") },
    { value: 'member.added', label: t("eventTypes.memberAdded") },
    { value: 'member.removed', label: t("eventTypes.memberRemoved") },
  ]
interface Webhook {
    id: string
    url: string
    events: string[]
    description?: string
    enabled: boolean
    secret: string
    createdAt: string
  }

  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [copiedSecret, setCopiedSecret] = useState<string | null>(null)

  useEffect(() => {
    fetchWebhooks()
  }, [])

  const fetchWebhooks = async () => {
    try {
      const response = await fetch('/api/v1/webhooks')
      if (response.ok) {
        const data = await response.json()
        setWebhooks(data)
      }
    } catch (error) {
      console.error('Failed to fetch webhooks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!url || selectedEvents.length === 0) {
      toast.error(t('toast.urlAndEventRequired'))
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/v1/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, events: selectedEvents, description }),
      })

      if (!response.ok) throw new Error('Failed to create webhook')

      toast.success(t('toast.webhookCreated'))
      setDialogOpen(false)
      setUrl('')
      setDescription('')
      setSelectedEvents([])
      fetchWebhooks()
    } catch {
      toast.error(t('toast.createFailed'))
    } finally {
      setCreating(false)
    }
  }

  const copySecret = (secret: string, id: string) => {
    navigator.clipboard.writeText(secret)
    setCopiedSecret(id)
    toast.success(t('toast.secretCopied'))
    setTimeout(() => setCopiedSecret(null), 2000)
  }

  const toggleEvent = (event: string) => {
    setSelectedEvents(prev =>
      prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("webhookEndpoints")}</CardTitle>
              <CardDescription>{t("endpointsDescription")}</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("addWebhook")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t("addWebhookEndpoint")}</DialogTitle>
                  <DialogDescription>
                    {t("addWebhookDescription")}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{t("endpointUrl")}</Label>
                    <Input
                      placeholder={t("endpointUrlPlaceholder")}
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("descriptionOptional")}</Label>
                    <Textarea
                      placeholder={t("descriptionPlaceholder")}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("events")}</Label>
                    <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                      {WEBHOOK_EVENTS.map(event => (
                        <div key={event.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={event.value}
                            checked={selectedEvents.includes(event.value)}
                            onCheckedChange={() => toggleEvent(event.value)}
                          />
                          <label
                            htmlFor={event.value}
                            className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {event.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreate} disabled={creating}>
                    {creating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("creating")}
                      </>
                    ) : (
                      <>
                        <Webhook className="mr-2 h-4 w-4" />
                        {t("createWebhook")}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <div className="text-center py-12">
              <Webhook className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t("noWebhooks")}</p>
              <p className="text-sm text-muted-foreground">{t("addWebhookToStart")}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("tableHeaders.endpoint")}</TableHead>
                  <TableHead>{t("tableHeaders.events")}</TableHead>
                  <TableHead>{t("tableHeaders.status")}</TableHead>
                  <TableHead>{t("tableHeaders.secret")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map((webhook: Webhook) => (
                  <TableRow key={webhook.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium truncate max-w-xs">{webhook.url}</p>
                        {webhook.description && (
                          <p className="text-sm text-muted-foreground">{webhook.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{t("eventsCount", { count: webhook.events?.length || 0 })}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={webhook.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {webhook.enabled ? t("active") : t("disabled")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copySecret(webhook.secret, webhook.id)}
                      >
                        {copiedSecret === webhook.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("webhookSecurity")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            {t("securityDescription")}
          </p>
          <p>
            {t("signatureDescription")}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
