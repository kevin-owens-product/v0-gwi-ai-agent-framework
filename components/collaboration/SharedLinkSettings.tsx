"use client"

import { useState, useCallback } from 'react'
import { useTranslations } from "next-intl"
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Lock,
  Clock,
  Users,
  Eye,
  MessageSquare,
  Download,
  X,
  Plus,
} from 'lucide-react'
import type { SharedLinkPermission } from '@/hooks/use-shared-links'

interface SharedLinkSettingsProps {
  initialValues?: {
    password?: string
    expiresAt?: string
    maxViews?: number
    allowedEmails?: string[]
    permissions?: SharedLinkPermission
  }
  hasExistingPassword?: boolean
  onSave: (settings: {
    password?: string | null
    expiresAt?: string | null
    maxViews?: number | null
    allowedEmails?: string[]
    permissions?: SharedLinkPermission
    isActive?: boolean
  }) => Promise<void>
  onCancel: () => void
  isSaving?: boolean
  isEditing?: boolean
  className?: string
}

const PERMISSION_OPTIONS: { value: SharedLinkPermission; labelKey: string; icon: React.ReactNode }[] = [
  {
    value: 'VIEW',
    labelKey: 'permissionViewOnly',
    icon: <Eye className="h-4 w-4" />,
  },
  {
    value: 'COMMENT',
    labelKey: 'permissionCanComment',
    icon: <MessageSquare className="h-4 w-4" />,
  },
  {
    value: 'DOWNLOAD',
    labelKey: 'permissionCanDownload',
    icon: <Download className="h-4 w-4" />,
  },
]

const EXPIRATION_PRESETS = [
  { value: '', labelKey: 'neverExpires' },
  { value: '1h', labelKey: 'oneHour' },
  { value: '24h', labelKey: 'twentyFourHours' },
  { value: '7d', labelKey: 'sevenDays' },
  { value: '30d', labelKey: 'thirtyDays' },
  { value: 'custom', labelKey: 'customDate' },
]

function getExpirationDate(preset: string): string | null {
  if (!preset || preset === 'custom') return null

  const now = new Date()
  const match = preset.match(/^(\d+)(h|d)$/)

  if (!match) return null

  const [, amount, unit] = match
  const value = parseInt(amount)

  if (unit === 'h') {
    now.setHours(now.getHours() + value)
  } else if (unit === 'd') {
    now.setDate(now.getDate() + value)
  }

  return now.toISOString()
}

export function SharedLinkSettings({
  initialValues = {},
  hasExistingPassword = false,
  onSave,
  onCancel,
  isSaving = false,
  isEditing = false,
  className,
}: SharedLinkSettingsProps) {
  const t = useTranslations("collaboration")
  const [usePassword, setUsePassword] = useState(hasExistingPassword || !!initialValues.password)
  const [password, setPassword] = useState(initialValues.password || '')
  const [removePassword, setRemovePassword] = useState(false)

  const [useExpiration, setUseExpiration] = useState(!!initialValues.expiresAt)
  const [expirationPreset, setExpirationPreset] = useState('')
  const [customExpiration, setCustomExpiration] = useState(initialValues.expiresAt?.split('T')[0] || '')

  const [useMaxViews, setUseMaxViews] = useState(!!initialValues.maxViews)
  const [maxViews, setMaxViews] = useState(initialValues.maxViews?.toString() || '100')

  const [useEmailRestriction, setUseEmailRestriction] = useState((initialValues.allowedEmails?.length || 0) > 0)
  const [allowedEmails, setAllowedEmails] = useState<string[]>(initialValues.allowedEmails || [])
  const [emailInput, setEmailInput] = useState('')

  const [permissions, setPermissions] = useState<SharedLinkPermission>(initialValues.permissions || 'VIEW')

  const addEmail = useCallback(() => {
    const email = emailInput.trim().toLowerCase()
    if (email && email.includes('@') && !allowedEmails.includes(email)) {
      setAllowedEmails([...allowedEmails, email])
      setEmailInput('')
    }
  }, [emailInput, allowedEmails])

  const removeEmail = useCallback((email: string) => {
    setAllowedEmails(allowedEmails.filter(e => e !== email))
  }, [allowedEmails])

  const handleSubmit = async () => {
    const settings: any = {
      permissions,
    }

    // Handle password
    if (usePassword && password) {
      settings.password = password
    } else if (isEditing && removePassword) {
      settings.password = null
    }

    // Handle expiration
    if (useExpiration) {
      if (expirationPreset === 'custom' && customExpiration) {
        settings.expiresAt = new Date(customExpiration).toISOString()
      } else if (expirationPreset && expirationPreset !== 'custom') {
        settings.expiresAt = getExpirationDate(expirationPreset)
      }
    } else if (isEditing) {
      settings.expiresAt = null
    }

    // Handle max views
    if (useMaxViews && maxViews) {
      settings.maxViews = parseInt(maxViews)
    } else if (isEditing) {
      settings.maxViews = null
    }

    // Handle email restriction
    if (useEmailRestriction) {
      settings.allowedEmails = allowedEmails
    } else if (isEditing) {
      settings.allowedEmails = []
    }

    await onSave(settings)
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Permissions */}
      <div className="space-y-3">
        <Label>{t("permissions")}</Label>
        <div className="grid grid-cols-3 gap-2">
          {PERMISSION_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPermissions(option.value)}
              className={cn(
                'flex flex-col items-center gap-1 p-3 rounded-lg border text-center transition-colors',
                permissions === option.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:border-primary/50'
              )}
            >
              {option.icon}
              <span className="text-xs font-medium">{t(option.labelKey)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Password Protection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="use-password">{t("passwordProtection")}</Label>
          </div>
          <Switch
            id="use-password"
            checked={usePassword}
            onCheckedChange={(checked) => {
              setUsePassword(checked)
              if (!checked && hasExistingPassword) {
                setRemovePassword(true)
              } else {
                setRemovePassword(false)
              }
            }}
          />
        </div>
        {usePassword && (
          <Input
            type="password"
            placeholder={hasExistingPassword ? t("enterNewPasswordToChange") : t("enterPassword")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}
      </div>

      {/* Expiration */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="use-expiration">{t("setExpiration")}</Label>
          </div>
          <Switch
            id="use-expiration"
            checked={useExpiration}
            onCheckedChange={setUseExpiration}
          />
        </div>
        {useExpiration && (
          <div className="space-y-2">
            <Select value={expirationPreset} onValueChange={setExpirationPreset}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectExpiration")} />
              </SelectTrigger>
              <SelectContent>
                {EXPIRATION_PRESETS.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {t(preset.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {expirationPreset === 'custom' && (
              <Input
                type="date"
                value={customExpiration}
                onChange={(e) => setCustomExpiration(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            )}
          </div>
        )}
      </div>

      {/* Max Views */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="use-max-views">{t("limitViews")}</Label>
          </div>
          <Switch
            id="use-max-views"
            checked={useMaxViews}
            onCheckedChange={setUseMaxViews}
          />
        </div>
        {useMaxViews && (
          <Input
            type="number"
            placeholder={t("maximumViews")}
            value={maxViews}
            onChange={(e) => setMaxViews(e.target.value)}
            min={1}
          />
        )}
      </div>

      {/* Email Restriction */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="use-email">{t("restrictToSpecificEmails")}</Label>
          </div>
          <Switch
            id="use-email"
            checked={useEmailRestriction}
            onCheckedChange={setUseEmailRestriction}
          />
        </div>
        {useEmailRestriction && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder={t("enterEmailAddress")}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addEmail()
                  }
                }}
              />
              <Button type="button" variant="outline" size="icon" onClick={addEmail}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {allowedEmails.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {allowedEmails.map((email) => (
                  <Badge key={email} variant="secondary" className="gap-1">
                    {email}
                    <button
                      type="button"
                      onClick={() => removeEmail(email)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          {t("cancel")}
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? t("saving") : isEditing ? t("updateLink") : t("createLink")}
        </Button>
      </div>
    </div>
  )
}
