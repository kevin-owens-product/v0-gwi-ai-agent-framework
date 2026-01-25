/**
 * @prompt-id forge-v4.1:feature:custom-alerts:009
 * @generated-at 2024-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertConditionBuilder } from "./AlertConditionBuilder"
import type {
  CustomAlert,
  CreateAlertInput,
  UpdateAlertInput,
  AlertChannel,
  AlertEntityType,
  AlertCondition,
} from "@/hooks/use-alerts"
import { cn } from "@/lib/utils"
import { Loader2, Mail, MessageSquare, Globe, Bell, Smartphone } from "lucide-react"

interface AlertFormProps<T extends CreateAlertInput | UpdateAlertInput = CreateAlertInput | UpdateAlertInput> {
  alert?: CustomAlert | null
  onSubmit: (data: T) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  className?: string
}

const ENTITY_TYPES: Array<{ value: AlertEntityType; label: string; description: string }> = [
  { value: 'metric', label: 'Metric', description: 'Monitor key performance metrics' },
  { value: 'audience', label: 'Audience', description: 'Track audience changes' },
  { value: 'brand', label: 'Brand', description: 'Brand tracking alerts' },
  { value: 'report', label: 'Report', description: 'Report-related alerts' },
  { value: 'agent', label: 'Agent', description: 'AI agent performance' },
  { value: 'workflow', label: 'Workflow', description: 'Workflow execution alerts' },
]

const CHANNELS: Array<{ value: AlertChannel; label: string; icon: React.ReactNode }> = [
  { value: 'EMAIL', label: 'Email', icon: <Mail className="h-4 w-4" /> },
  { value: 'SLACK', label: 'Slack', icon: <MessageSquare className="h-4 w-4" /> },
  { value: 'WEBHOOK', label: 'Webhook', icon: <Globe className="h-4 w-4" /> },
  { value: 'IN_APP', label: 'In-App', icon: <Bell className="h-4 w-4" /> },
  { value: 'SMS', label: 'SMS', icon: <Smartphone className="h-4 w-4" /> },
]

const COOLDOWN_OPTIONS = [
  { value: 5, label: '5 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 360, label: '6 hours' },
  { value: 720, label: '12 hours' },
  { value: 1440, label: '24 hours' },
]

const DEFAULT_CONDITION: AlertCondition = {
  metric: 'sentiment',
  operator: 'lt',
  value: 60,
  unit: '%',
}

export function AlertForm({
  alert,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: AlertFormProps) {
  const isEditing = !!alert

  // Form state
  const [name, setName] = useState(alert?.name || '')
  const [description, setDescription] = useState(alert?.description || '')
  const [entityType, setEntityType] = useState<AlertEntityType>(
    (alert?.entityType as AlertEntityType) || 'metric'
  )
  const [entityId, setEntityId] = useState(alert?.entityId || '')
  const [condition, setCondition] = useState<AlertCondition>(
    alert?.condition || DEFAULT_CONDITION
  )
  const [channels, setChannels] = useState<AlertChannel[]>(
    alert?.channels || ['IN_APP']
  )
  const [recipients, setRecipients] = useState<string[]>(alert?.recipients || [])
  const [recipientInput, setRecipientInput] = useState('')
  const [webhookUrl, setWebhookUrl] = useState(alert?.webhookUrl || '')
  const [cooldownMinutes, setCooldownMinutes] = useState(alert?.cooldownMinutes || 60)
  const [isActive, setIsActive] = useState(alert?.isActive ?? true)

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Name is required'
    } else if (name.length > 100) {
      newErrors.name = 'Name must be 100 characters or less'
    }

    if (description && description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less'
    }

    if (channels.length === 0) {
      newErrors.channels = 'At least one notification channel is required'
    }

    if (channels.includes('EMAIL') && recipients.length === 0) {
      newErrors.recipients = 'At least one email recipient is required when Email channel is selected'
    }

    if (channels.includes('WEBHOOK') && !webhookUrl) {
      newErrors.webhookUrl = 'Webhook URL is required when Webhook channel is selected'
    }

    if (webhookUrl && !isValidUrl(webhookUrl)) {
      newErrors.webhookUrl = 'Please enter a valid URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleChannelToggle = (channel: AlertChannel) => {
    setChannels(prev =>
      prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    )
  }

  const addRecipient = () => {
    const email = recipientInput.trim()
    if (email && isValidEmail(email) && !recipients.includes(email)) {
      setRecipients(prev => [...prev, email])
      setRecipientInput('')
    }
  }

  const removeRecipient = (email: string) => {
    setRecipients(prev => prev.filter(r => r !== email))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const formData: CreateAlertInput | UpdateAlertInput = {
      name,
      description: description || undefined,
      entityType,
      entityId: entityId || undefined,
      condition,
      channels,
      recipients: channels.includes('EMAIL') ? recipients : undefined,
      webhookUrl: channels.includes('WEBHOOK') ? webhookUrl : undefined,
      cooldownMinutes,
      ...(isEditing && { isActive }),
    }

    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Alert Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Low Sentiment Alert"
              className={cn(errors.name && "border-red-500")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this alert monitors..."
              rows={2}
              className={cn(errors.description && "border-red-500")}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {isEditing && (
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label>Alert Status</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable this alert
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Condition */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alert Condition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Entity Type</Label>
            <Select
              value={entityType}
              onValueChange={(v) => setEntityType(v as AlertEntityType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select entity type" />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex flex-col">
                      <span>{type.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {type.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="entityId">Entity ID (optional)</Label>
            <Input
              id="entityId"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              placeholder="Leave empty to monitor all entities of this type"
            />
            <p className="text-xs text-muted-foreground">
              Specify an ID to monitor a specific entity, or leave empty to monitor all.
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Condition</Label>
            <AlertConditionBuilder
              value={condition}
              onChange={setCondition}
              entityType={entityType}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Notification Channels *</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {CHANNELS.map((channel) => (
                <div
                  key={channel.value}
                  className={cn(
                    "flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors",
                    channels.includes(channel.value)
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50"
                  )}
                  onClick={() => handleChannelToggle(channel.value)}
                >
                  <Checkbox
                    checked={channels.includes(channel.value)}
                    onCheckedChange={() => handleChannelToggle(channel.value)}
                  />
                  <div className="flex items-center gap-2">
                    {channel.icon}
                    <span className="text-sm">{channel.label}</span>
                  </div>
                </div>
              ))}
            </div>
            {errors.channels && (
              <p className="text-sm text-red-500">{errors.channels}</p>
            )}
          </div>

          {/* Email Recipients */}
          {channels.includes('EMAIL') && (
            <div className="space-y-2">
              <Label>Email Recipients</Label>
              <div className="flex gap-2">
                <Input
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  placeholder="Enter email address"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addRecipient()
                    }
                  }}
                />
                <Button type="button" onClick={addRecipient} variant="outline">
                  Add
                </Button>
              </div>
              {recipients.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {recipients.map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={() => removeRecipient(email)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {errors.recipients && (
                <p className="text-sm text-red-500">{errors.recipients}</p>
              )}
            </div>
          )}

          {/* Webhook URL */}
          {channels.includes('WEBHOOK') && (
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://api.example.com/webhook"
                className={cn(errors.webhookUrl && "border-red-500")}
              />
              {errors.webhookUrl && (
                <p className="text-sm text-red-500">{errors.webhookUrl}</p>
              )}
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <Label>Alert Cooldown</Label>
            <Select
              value={cooldownMinutes.toString()}
              onValueChange={(v) => setCooldownMinutes(parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cooldown period" />
              </SelectTrigger>
              <SelectContent>
                {COOLDOWN_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Minimum time between alert notifications to prevent spam.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? 'Saving...' : 'Creating...'}
            </>
          ) : (
            isEditing ? 'Save Changes' : 'Create Alert'
          )}
        </Button>
      </div>
    </form>
  )
}

export default AlertForm
