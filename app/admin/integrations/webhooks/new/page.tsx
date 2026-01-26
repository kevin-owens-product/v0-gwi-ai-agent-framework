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
import { toast } from "sonner"

const webhookEvents = [
  { value: "user.created", label: "User Created", category: "Users" },
  { value: "user.updated", label: "User Updated", category: "Users" },
  { value: "user.deleted", label: "User Deleted", category: "Users" },
  { value: "organization.created", label: "Organization Created", category: "Organizations" },
  { value: "organization.updated", label: "Organization Updated", category: "Organizations" },
  { value: "agent.run.completed", label: "Agent Run Completed", category: "Agents" },
  { value: "agent.run.failed", label: "Agent Run Failed", category: "Agents" },
  { value: "workflow.completed", label: "Workflow Completed", category: "Workflows" },
  { value: "workflow.failed", label: "Workflow Failed", category: "Workflows" },
  { value: "report.generated", label: "Report Generated", category: "Reports" },
  { value: "subscription.changed", label: "Subscription Changed", category: "Billing" },
  { value: "subscription.cancelled", label: "Subscription Cancelled", category: "Billing" },
]

const eventCategories = [...new Set(webhookEvents.map(e => e.category))]

interface Organization {
  id: string
  name: string
}

export default function NewWebhookPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [showSecret, setShowSecret] = useState<string | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loadingOrgs, setLoadingOrgs] = useState(true)

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
      toast.error("URL and organization are required")
      return
    }

    if (formData.events.length === 0) {
      toast.error("Please select at least one event to subscribe to")
      return
    }

    // Validate URL
    try {
      new URL(formData.url)
    } catch {
      toast.error("Please enter a valid URL")
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
          throw new Error("Invalid JSON format for custom headers")
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
        throw new Error(data.error || "Failed to create webhook")
      }

      const data = await response.json()

      // Show the signing secret
      if (data.secret) {
        setShowSecret(data.secret)
      } else {
        toast.success("Webhook created successfully")
        router.push("/admin/integrations/webhooks")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create webhook")
    } finally {
      setIsSaving(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
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
            <DialogTitle>Webhook Signing Secret</DialogTitle>
            <DialogDescription>
              Copy this secret now - it will not be shown again! Use this to verify webhook signatures.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-muted rounded-lg font-mono text-sm break-all">
            {showSecret}
          </div>
          <DialogFooter>
            <Button onClick={() => copyToClipboard(showSecret!)}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Secret
            </Button>
            <Button variant="outline" onClick={handleSecretClose}>
              Done
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
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Webhook className="h-6 w-6 text-primary" />
              Create Webhook
            </h1>
            <p className="text-sm text-muted-foreground">
              Create a new webhook endpoint to receive event notifications
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.url || !formData.orgId || formData.events.length === 0}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Webhook
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Endpoint Details</CardTitle>
            <CardDescription>
              Configure the webhook endpoint
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Webhook Name</Label>
              <Input
                id="name"
                placeholder="My Webhook"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Endpoint URL *</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/webhooks"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Must be a valid HTTPS URL that can receive POST requests
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What is this webhook used for?"
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
                Organization *
              </Label>
              <Select
                value={formData.orgId}
                onValueChange={(value) =>
                  setFormData({ ...formData, orgId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingOrgs ? "Loading..." : "Select organization"} />
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
              Settings
            </CardTitle>
            <CardDescription>
              Configure timeout and retry behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeout" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Timeout (seconds)
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
                <Label htmlFor="retryCount">Retry Count</Label>
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
              <Label htmlFor="headers">Custom Headers (JSON)</Label>
              <Textarea
                id="headers"
                placeholder={'{\n  "X-Custom-Header": "value"\n}'}
                rows={4}
                className="font-mono text-sm"
                value={formData.headers}
                onChange={(e) =>
                  setFormData({ ...formData, headers: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Optional custom headers to include with webhook requests
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Events */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Event Subscriptions</CardTitle>
            <CardDescription>
              Select the events this webhook should receive ({formData.events.length} selected)
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
                        {allSelected ? "Deselect All" : "Select All"}
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
                Please select at least one event to subscribe to
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
