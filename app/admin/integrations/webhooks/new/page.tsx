"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  Loader2,
  Webhook,
  Building2,
  Copy,
  Clock,
  Shield,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTranslations } from "next-intl"
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"

interface Organization {
  id: string
  name: string
}

export default function NewWebhookPage() {
  const router = useRouter()
  const t = useTranslations("admin.integrations.webhooks.new")
  const tCommon = useTranslations("common")
  const [isSaving, setIsSaving] = useState(false)
  const [showSecret, setShowSecret] = useState<string | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loadingOrgs, setLoadingOrgs] = useState(true)

  const webhookEvents = [
    { value: "user.created", label: t("eventLabels.userCreated"), category: t("events.users") },
    { value: "user.updated", label: t("eventLabels.userUpdated"), category: t("events.users") },
    { value: "user.deleted", label: t("eventLabels.userDeleted"), category: t("events.users") },
    { value: "organization.created", label: t("eventLabels.organizationCreated"), category: t("events.organizations") },
    { value: "organization.updated", label: t("eventLabels.organizationUpdated"), category: t("events.organizations") },
    { value: "agent.run.completed", label: t("eventLabels.agentRunCompleted"), category: t("events.agents") },
    { value: "agent.run.failed", label: t("eventLabels.agentRunFailed"), category: t("events.agents") },
    { value: "workflow.completed", label: t("eventLabels.workflowCompleted"), category: t("events.workflows") },
    { value: "workflow.failed", label: t("eventLabels.workflowFailed"), category: t("events.workflows") },
    { value: "report.generated", label: t("eventLabels.reportGenerated"), category: t("events.reports") },
    { value: "subscription.changed", label: t("eventLabels.subscriptionChanged"), category: t("events.billing") },
    { value: "subscription.cancelled", label: t("eventLabels.subscriptionCancelled"), category: t("events.billing") },
  ]

  const eventCategories = [...new Set(webhookEvents.map(e => e.category))]

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    url: "",
    orgId: "",
    events: [] as string[],
    timeout: 30,
    retryCount: 3,
    headers: "",
  })

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      const response = await fetch("/api/admin/organizations?limit=100")
      const data = await response.json()
      setOrganizations(data.organizations || [])
    } catch (error) {
      console.error("Failed to fetch organizations:", error)
    } finally {
      setLoadingOrgs(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.url || !formData.orgId) {
      showErrorToast(t("validation.urlAndOrgRequired"))
      return
    }

    if (formData.events.length === 0) {
      showErrorToast(t("validation.atLeastOneEvent"))
      return
    }

    // Validate URL
    try {
      new URL(formData.url)
    } catch {
      showErrorToast(t("validation.invalidUrl"))
      return
    }

    setIsSaving(true)
    try {
      // Parse custom headers
      let headers: Record<string, string> = {}
      if (formData.headers.trim()) {
        try {
          headers = JSON.parse(formData.headers)
        } catch {
          throw new Error(t("validation.invalidJsonHeaders"))
        }
      }

      const response = await fetch("/api/admin/integrations/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          name: formData.name || null,
          description: formData.description || null,
          headers: Object.keys(headers).length > 0 ? headers : undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("toast.createFailed"))
      }

      const data = await response.json()

      // Show the signing secret
      if (data.secret) {
        setShowSecret(data.secret)
      } else {
        showSuccessToast(t("toast.createSuccess"))
        router.push("/admin/integrations/webhooks")
      }
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : t("toast.createFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showSuccessToast(t("toast.copied"))
  }

  const handleSecretClose = () => {
    setShowSecret(null)
    router.push("/admin/integrations/webhooks")
  }

  const toggleEvent = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event],
    }))
  }

  const toggleCategory = (category: string) => {
    const categoryEvents = webhookEvents.filter(e => e.category === category).map(e => e.value)
    const allSelected = categoryEvents.every(e => formData.events.includes(e))

    setFormData(prev => ({
      ...prev,
      events: allSelected
        ? prev.events.filter(e => !categoryEvents.includes(e))
        : [...new Set([...prev.events, ...categoryEvents])],
    }))
  }

  return (
    <div className="space-y-6">
      {/* Secret Display Dialog */}
      <Dialog open={!!showSecret} onOpenChange={handleSecretClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dialog.secretTitle")}</DialogTitle>
            <DialogDescription>
              {t("dialog.secretDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-muted rounded-lg font-mono text-sm break-all">
            {showSecret}
          </div>
          <DialogFooter>
            <Button onClick={() => copyToClipboard(showSecret!)}>
              <Copy className="h-4 w-4 mr-2" />
              {t("dialog.copySecret")}
            </Button>
            <Button variant="outline" onClick={handleSecretClose}>
              {t("dialog.done")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/integrations/webhooks">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("back")}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Webhook className="h-6 w-6 text-primary" />
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.url || !formData.orgId || formData.events.length === 0}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("creating")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t("createWebhook")}
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t("sections.endpointDetails")}</CardTitle>
            <CardDescription>
              {t("sections.endpointDetailsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("fields.webhookName")}</Label>
              <Input
                id="name"
                placeholder={t("placeholders.webhookName")}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">{t("fields.endpointUrl")} *</Label>
              <Input
                id="url"
                type="url"
                placeholder={t("placeholders.endpointUrl")}
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                {t("hints.endpointUrl")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("fields.description")}</Label>
              <Textarea
                id="description"
                placeholder={t("placeholders.description")}
                rows={2}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {t("fields.organization")} *
              </Label>
              <Select
                value={formData.orgId}
                onValueChange={(value) =>
                  setFormData({ ...formData, orgId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingOrgs ? t("placeholders.loading") : t("placeholders.selectOrganization")} />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t("sections.settings")}
            </CardTitle>
            <CardDescription>
              {t("sections.settingsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeout" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {t("fields.timeout")}
                </Label>
                <Input
                  id="timeout"
                  type="number"
                  min="5"
                  max="60"
                  value={formData.timeout}
                  onChange={(e) =>
                    setFormData({ ...formData, timeout: parseInt(e.target.value) || 30 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="retryCount">{t("fields.retryCount")}</Label>
                <Input
                  id="retryCount"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.retryCount}
                  onChange={(e) =>
                    setFormData({ ...formData, retryCount: parseInt(e.target.value) || 3 })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="headers">{t("fields.customHeaders")}</Label>
              <Textarea
                id="headers"
                placeholder={t("placeholders.customHeaders")}
                rows={4}
                className="font-mono text-sm"
                value={formData.headers}
                onChange={(e) =>
                  setFormData({ ...formData, headers: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                {t("hints.customHeaders")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Events */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t("sections.eventSubscriptions")}</CardTitle>
            <CardDescription>
              {t("sections.eventSubscriptionsDescription", { count: formData.events.length })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {eventCategories.map((category) => {
                const categoryEvents = webhookEvents.filter(e => e.category === category)
                const selectedCount = categoryEvents.filter(e => formData.events.includes(e.value)).length
                const allSelected = selectedCount === categoryEvents.length

                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        className="text-sm font-medium cursor-pointer"
                        onClick={() => toggleCategory(category)}
                      >
                        {category}
                        <span className="ml-2 text-muted-foreground">
                          ({selectedCount}/{categoryEvents.length})
                        </span>
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCategory(category)}
                      >
                        {allSelected ? t("actions.deselectAll") : t("actions.selectAll")}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {categoryEvents.map((event) => (
                        <Badge
                          key={event.value}
                          variant={formData.events.includes(event.value) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleEvent(event.value)}
                        >
                          {event.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {formData.events.length === 0 && (
              <p className="text-sm text-muted-foreground mt-4">
                {t("hints.selectEvents")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
