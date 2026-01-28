"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save, Loader2, Ban } from "lucide-react"
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"
import { useAdmin } from "@/components/providers/admin-provider"

export default function NewIPBlocklistPage() {
  const t = useTranslations("admin.security.ipBlocklist")
  const tCommon = useTranslations("common")

  const blockTypes = [
    { value: "MANUAL", label: t("types.manual"), description: t("types.manualDesc") },
    { value: "AUTOMATIC", label: t("types.automatic"), description: t("types.automaticDesc") },
    { value: "THREAT_INTEL", label: t("types.threatIntel"), description: t("types.threatIntelDesc") },
    { value: "BRUTE_FORCE", label: t("types.bruteForce"), description: t("types.bruteForceDesc") },
    { value: "GEOGRAPHIC", label: t("types.geographic"), description: t("types.geographicDesc") },
  ]
  const router = useRouter()
  const { admin: currentAdmin } = useAdmin()
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    ipAddress: "",
    ipRange: "",
    type: "MANUAL",
    reason: "",
    expiresAt: "",
    isActive: true,
    orgId: "",
  })

  const canCreate = currentAdmin.role === "SUPER_ADMIN" || currentAdmin.permissions.includes("security:write")

  const validateIPAddress = (ip: string): boolean => {
    // IPv4 validation
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
    // IPv6 validation (simplified)
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/

    if (ipv4Regex.test(ip)) {
      const parts = ip.split(".")
      return parts.every((part) => parseInt(part) >= 0 && parseInt(part) <= 255)
    }

    return ipv6Regex.test(ip)
  }

  const handleCreate = async () => {
    if (!formData.ipAddress || !formData.reason) {
      showErrorToast(t("validation.ipAndReasonRequired"))
      return
    }

    if (!validateIPAddress(formData.ipAddress)) {
      showErrorToast(t("validation.invalidIpFormat"))
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/security/ip-blocklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ipAddress: formData.ipAddress,
          ipRange: formData.ipRange || undefined,
          type: formData.type,
          reason: formData.reason,
          expiresAt: formData.expiresAt || undefined,
          isActive: formData.isActive,
          orgId: formData.orgId || undefined,
          metadata: {},
        }),
      })

      if (response.ok) {
        const data = await response.json()
        showSuccessToast(t("toast.addSuccess"))
        router.push(`/admin/security/ip-blocklist/${data.entry.id}`)
      } else {
        const data = await response.json()
        showErrorToast(data.error || t("toast.addError"))
      }
    } catch (error) {
      console.error("Failed to block IP:", error)
      showErrorToast(t("toast.addError"))
    } finally {
      setIsSaving(false)
    }
  }

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">{t("noPermission")}</p>
        <Link href="/admin/security/ip-blocklist">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backToBlocklist")}
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/security/ip-blocklist">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon("back")}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Ban className="h-6 w-6 text-destructive" />
              {t("new.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("new.description")}
            </p>
          </div>
        </div>
        <Button
          onClick={handleCreate}
          disabled={isSaving || !formData.ipAddress || !formData.reason}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("new.blocking")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t("blockIp")}
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t("new.ipDetailsTitle")}</CardTitle>
          <CardDescription>
            {t("new.ipDetailsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="ipAddress">{t("form.ipAddress")} *</Label>
              <Input
                id="ipAddress"
                placeholder={t("form.ipAddressPlaceholderFull")}
                value={formData.ipAddress}
                onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {t("form.ipAddressHint")}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ipRange">{t("form.cidrRangeOptional")}</Label>
              <Input
                id="ipRange"
                placeholder={t("form.cidrRangePlaceholder")}
                value={formData.ipRange}
                onChange={(e) => setFormData({ ...formData, ipRange: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {t("form.cidrRangeHint")}
              </p>
            </div>

            <div className="grid gap-2">
              <Label>{t("form.blockType")} *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {blockTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {blockTypes.find((bt) => bt.value === formData.type)?.description}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason">{t("form.reason")} *</Label>
              <Textarea
                id="reason"
                placeholder={t("form.reasonPlaceholder")}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Block Options */}
      <Card>
        <CardHeader>
          <CardTitle>{t("new.blockOptionsTitle")}</CardTitle>
          <CardDescription>
            {t("new.blockOptionsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="expiresAt">{t("form.expirationDate")}</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              {t("form.expirationHint")}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <div className="grid gap-0.5">
              <Label htmlFor="isActive">{t("form.blockImmediately")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("form.blockImmediatelyHint")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scope */}
      <Card>
        <CardHeader>
          <CardTitle>{t("new.scopeTitle")}</CardTitle>
          <CardDescription>
            {t("new.scopeDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Label htmlFor="orgId">{t("form.organizationId")}</Label>
            <Input
              id="orgId"
              placeholder={t("form.organizationIdPlaceholder")}
              value={formData.orgId}
              onChange={(e) => setFormData({ ...formData, orgId: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              {t("form.organizationIdHint")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
