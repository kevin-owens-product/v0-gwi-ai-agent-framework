"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Settings,
  Globe,
  Shield,
  Mail,
  Loader2,
  Save,
  RefreshCw,
} from "lucide-react"

interface SystemConfig {
  id: string
  key: string
  value: unknown
  description: string | null
  category: string
}

export default function SettingsPage() {
  const t = useTranslations("admin.settings")
  const tCommon = useTranslations("common")
  const [configs, setConfigs] = useState<SystemConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editedValues, setEditedValues] = useState<Record<string, unknown>>({})

  const fetchConfigs = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/settings")
      const data = await response.json()
      setConfigs(data.configs)
      const values: Record<string, unknown> = {}
      data.configs.forEach((c: SystemConfig) => {
        values[c.key] = c.value
      })
      setEditedValues(values)
    } catch (error) {
      console.error("Failed to fetch configs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchConfigs()
  }, [])

  const handleSave = async (key: string) => {
    setIsSaving(true)
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: editedValues[key] }),
      })
      fetchConfigs()
    } catch (error) {
      console.error("Failed to save config:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateValue = (key: string, value: unknown) => {
    setEditedValues(prev => ({ ...prev, [key]: value }))
  }

  const getConfigsByCategory = (category: string) => {
    return configs.filter(c => c.category === category)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            {t("tabs.general")}
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            {t("tabs.security")}
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4" />
            {t("tabs.email")}
          </TabsTrigger>
          <TabsTrigger value="platform" className="gap-2">
            <Globe className="h-4 w-4" />
            {t("tabs.platform")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("general.title")}</CardTitle>
              <CardDescription>
                {t("general.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>{t("general.platformName")}</Label>
                  <Input
                    value={(editedValues["platform.name"] as string) || "GWI Insights"}
                    onChange={(e) => updateValue("platform.name", e.target.value)}
                    placeholder={t("general.platformNamePlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("general.supportEmail")}</Label>
                  <Input
                    type="email"
                    value={(editedValues["platform.support_email"] as string) || ""}
                    onChange={(e) => updateValue("platform.support_email", e.target.value)}
                    placeholder="support@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("general.defaultTimezone")}</Label>
                  <Input
                    value={(editedValues["platform.timezone"] as string) || "UTC"}
                    onChange={(e) => updateValue("platform.timezone", e.target.value)}
                    placeholder="UTC"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("general.maintenanceMode")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("general.maintenanceModeDescription")}
                    </p>
                  </div>
                  <Switch
                    checked={(editedValues["platform.maintenance_mode"] as boolean) || false}
                    onCheckedChange={(checked) => updateValue("platform.maintenance_mode", checked)}
                  />
                </div>
              </div>
              <Button onClick={() => handleSave("platform.name")} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {tCommon("save")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("security.title")}</CardTitle>
              <CardDescription>
                {t("security.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("security.requireEmailVerification")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("security.requireEmailVerificationDesc")}
                    </p>
                  </div>
                  <Switch
                    checked={(editedValues["security.require_email_verification"] as boolean) ?? true}
                    onCheckedChange={(checked) => updateValue("security.require_email_verification", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("security.allowPublicRegistration")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("security.allowPublicRegistrationDesc")}
                    </p>
                  </div>
                  <Switch
                    checked={(editedValues["security.allow_public_registration"] as boolean) ?? true}
                    onCheckedChange={(checked) => updateValue("security.allow_public_registration", checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("security.sessionTimeout")}</Label>
                  <Input
                    type="number"
                    value={(editedValues["security.session_timeout_hours"] as number) || 24}
                    onChange={(e) => updateValue("security.session_timeout_hours", parseInt(e.target.value))}
                    placeholder="24"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("security.maxLoginAttempts")}</Label>
                  <Input
                    type="number"
                    value={(editedValues["security.max_login_attempts"] as number) || 5}
                    onChange={(e) => updateValue("security.max_login_attempts", parseInt(e.target.value))}
                    placeholder="5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("security.ipWhitelist")}</Label>
                  <Textarea
                    value={(editedValues["security.ip_whitelist"] as string) || ""}
                    onChange={(e) => updateValue("security.ip_whitelist", e.target.value)}
                    placeholder={t("security.ipWhitelistPlaceholder")}
                    rows={3}
                  />
                </div>
              </div>
              <Button onClick={() => handleSave("security.require_email_verification")} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {tCommon("save")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("email.title")}</CardTitle>
              <CardDescription>
                {t("email.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>{t("email.fromAddress")}</Label>
                  <Input
                    type="email"
                    value={(editedValues["email.from_address"] as string) || ""}
                    onChange={(e) => updateValue("email.from_address", e.target.value)}
                    placeholder="noreply@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("email.fromName")}</Label>
                  <Input
                    value={(editedValues["email.from_name"] as string) || ""}
                    onChange={(e) => updateValue("email.from_name", e.target.value)}
                    placeholder="GWI Insights"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("email.sendWelcome")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("email.sendWelcomeDesc")}
                    </p>
                  </div>
                  <Switch
                    checked={(editedValues["email.send_welcome"] as boolean) ?? true}
                    onCheckedChange={(checked) => updateValue("email.send_welcome", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("email.sendDigests")}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t("email.sendDigestsDesc")}
                    </p>
                  </div>
                  <Switch
                    checked={(editedValues["email.send_digests"] as boolean) ?? false}
                    onCheckedChange={(checked) => updateValue("email.send_digests", checked)}
                  />
                </div>
              </div>
              <Button onClick={() => handleSave("email.from_address")} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {tCommon("save")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platform" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("platform.title")}</CardTitle>
              <CardDescription>
                {t("platform.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("platform.rateLimit")}</Label>
                  <Input
                    type="number"
                    value={(editedValues["limits.default_rate_limit"] as number) || 100}
                    onChange={(e) => updateValue("limits.default_rate_limit", parseInt(e.target.value))}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("platform.maxFileSize")}</Label>
                  <Input
                    type="number"
                    value={(editedValues["limits.max_file_size_mb"] as number) || 10}
                    onChange={(e) => updateValue("limits.max_file_size_mb", parseInt(e.target.value))}
                    placeholder="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("platform.trialPeriod")}</Label>
                  <Input
                    type="number"
                    value={(editedValues["limits.trial_period_days"] as number) || 14}
                    onChange={(e) => updateValue("limits.trial_period_days", parseInt(e.target.value))}
                    placeholder="14"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("platform.maxTeamMembers")}</Label>
                  <Input
                    type="number"
                    value={(editedValues["limits.starter_max_members"] as number) || 3}
                    onChange={(e) => updateValue("limits.starter_max_members", parseInt(e.target.value))}
                    placeholder="3"
                  />
                </div>
              </div>
              <Button onClick={() => handleSave("limits.default_rate_limit")} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {tCommon("save")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
