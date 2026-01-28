/**
 * @prompt-id forge-v4.1:feature:custom-alerts:009
 * @generated-at 2024-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
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

const ENTITY_TYPE_VALUES: AlertEntityType[] = ['metric', 'audience', 'brand', 'report', 'agent', 'workflow']

const CHANNEL_VALUES: AlertChannel[] = ['EMAIL', 'SLACK', 'WEBHOOK', 'IN_APP', 'SMS']

const COOLDOWN_VALUES = [5, 15, 30, 60, 120, 360, 720, 1440]

const CHANNEL_ICONS: Record<AlertChannel, React.ReactNode> = {
  EMAIL: <Mail className="h-4 w-4" />,
  SLACK: <MessageSquare className="h-4 w-4" />,
  WEBHOOK: <Globe className="h-4 w-4" />,
  IN_APP: <Bell className="h-4 w-4" />,
  SMS: <Smartphone className="h-4 w-4" />,
}

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
  const t = useTranslations("alerts")
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
      newErrors.name = t("form.validation.nameRequired")
    } else if (name.length > 100) {
      newErrors.name = t("form.validation.nameTooLong")
    }

    if (description && description.length > 500) {
      newErrors.description = t("form.validation.descriptionTooLong")
    }

    if (channels.length === 0) {
      newErrors.channels = t("form.validation.channelRequired")
    }

    if (channels.includes('EMAIL') && recipients.length === 0) {
      newErrors.recipients = t("form.validation.recipientRequired")
    }

    if (channels.includes('WEBHOOK') && !webhookUrl) {
      newErrors.webhookUrl = t("form.validation.webhookRequired")
    }

    if (webhookUrl && !isValidUrl(webhookUrl)) {
      newErrors.webhookUrl = t("form.validation.invalidUrl")
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
          <CardTitle className="text-lg">{t("form.basicInformation")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("form.alertName")} *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("form.alertNamePlaceholder")}
              className={cn(errors.name && "border-red-500")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("form.description")}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("form.descriptionPlaceholder")}
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
                <Label>{t("form.alertStatus")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("form.alertStatusDescription")}
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
          <CardTitle className="text-lg">{t("form.alertCondition")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("form.entityType")}</Label>
            <Select
              value={entityType}
              onValueChange={(v) => setEntityType(v as AlertEntityType)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("form.selectEntityType")} />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_TYPE_VALUES.map((type) => (
                  <SelectItem key={type} value={type}>
                    <div className="flex flex-col">
                      <span>{t(`form.entityTypes.${type}.label`)}</span>
                      <span className="text-xs text-muted-foreground">
                        {t(`form.entityTypes.${type}.description`)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="entityId">{t("form.entityId")}</Label>
            <Input
              id="entityId"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              placeholder={t("form.entityIdPlaceholder")}
            />
            <p className="text-xs text-muted-foreground">
              {t("form.entityIdHelp")}
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>{t("form.condition")}</Label>
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
          <CardTitle className="text-lg">{t("form.notificationSettings")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("form.notificationChannels")} *</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {CHANNEL_VALUES.map((channel) => (
                <div
                  key={channel}
                  className={cn(
                    "flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors",
                    channels.includes(channel)
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50"
                  )}
                  onClick={() => handleChannelToggle(channel)}
                >
                  <Checkbox
                    checked={channels.includes(channel)}
                    onCheckedChange={() => handleChannelToggle(channel)}
                  />
                  <div className="flex items-center gap-2">
                    {CHANNEL_ICONS[channel]}
                    <span className="text-sm">{t(`form.channels.${channel}`)}</span>
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
              <Label>{t("form.emailRecipients")}</Label>
              <div className="flex gap-2">
                <Input
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  placeholder={t("form.emailPlaceholder")}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addRecipient()
                    }
                  }}
                />
                <Button type="button" onClick={addRecipient} variant="outline">
                  {t("form.add")}
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
              <Label htmlFor="webhookUrl">{t("form.webhookUrl")}</Label>
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
            <Label>{t("form.alertCooldown")}</Label>
            <Select
              value={cooldownMinutes.toString()}
              onValueChange={(v) => setCooldownMinutes(parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("form.selectCooldown")} />
              </SelectTrigger>
              <SelectContent>
                {COOLDOWN_VALUES.map((value) => (
                  <SelectItem key={value} value={value.toString()}>
                    {t(`form.cooldownOptions.${value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t("form.cooldownHelp")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("form.cancel")}
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? t("form.saving") : t("form.creating")}
            </>
          ) : (
            isEditing ? t("form.saveChanges") : t("form.createAlert")
          )}
        </Button>
      </div>
    </form>
  )
}

export default AlertForm
