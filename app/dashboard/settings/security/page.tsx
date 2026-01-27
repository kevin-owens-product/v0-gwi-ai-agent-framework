"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Shield, Smartphone, Monitor, Globe, AlertTriangle } from "lucide-react"
import { PageTracker } from "@/components/tracking/PageTracker"

const sessions = [
  {
    id: "1",
    device: "MacBook Pro",
    browser: "Chrome 120",
    location: "New York, US",
    ip: "192.168.1.1",
    current: true,
    lastActive: "Active now",
  },
  {
    id: "2",
    device: "iPhone 15 Pro",
    browser: "Safari",
    location: "New York, US",
    ip: "192.168.1.2",
    current: false,
    lastActive: "2 hours ago",
  },
  {
    id: "3",
    device: "Windows PC",
    browser: "Firefox 121",
    location: "Boston, US",
    ip: "10.0.0.1",
    current: false,
    lastActive: "3 days ago",
  },
]

export default function SecuritySettingsPage() {
  const t = useTranslations("settings.security")
  const [isSaving, setIsSaving] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  return (
    <div className="p-6 max-w-3xl">
      <PageTracker pageName="Settings - Security" metadata={{ twoFactorEnabled }} />
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <div className="space-y-6">
        {/* Password */}
        <Card>
          <CardHeader>
            <CardTitle>{t("changePassword")}</CardTitle>
            <CardDescription>{t("changePasswordDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">{t("currentPassword")}</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">{t("newPassword")}</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t("confirmNewPassword")}</Label>
              <Input id="confirm-password" type="password" />
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("updating")}
                </>
              ) : (
                t("updatePassword")
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {t("twoFactorAuth")}
                </CardTitle>
                <CardDescription>{t("twoFactorDescription")}</CardDescription>
              </div>
              <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
            </div>
          </CardHeader>
          {twoFactorEnabled && (
            <CardContent>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Shield className="h-8 w-8 text-emerald-500" />
                <div>
                  <p className="font-medium text-emerald-600">{t("twoFactorEnabled")}</p>
                  <p className="text-sm text-muted-foreground">{t("twoFactorProtected")}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button variant="outline" size="sm">
                  {t("changeMethod")}
                </Button>
                <Button variant="outline" size="sm">
                  {t("viewBackupCodes")}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("activeSessions")}</CardTitle>
                <CardDescription>{t("activeSessionsDescription")}</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="text-destructive bg-transparent">
                {t("signOutAll")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  {session.device.includes("iPhone") ? (
                    <Smartphone className="h-8 w-8 text-muted-foreground" />
                  ) : (
                    <Monitor className="h-8 w-8 text-muted-foreground" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{session.device}</p>
                      {session.current && (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                          {t("current")}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {session.browser} • {session.location}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {session.ip} • {session.lastActive}
                    </p>
                  </div>
                </div>
                {!session.current && (
                  <Button variant="ghost" size="sm" className="text-destructive">
                    {t("revoke")}
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {t("dangerZone")}
            </CardTitle>
            <CardDescription>{t("dangerZoneDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20">
              <div>
                <p className="font-medium">{t("deleteAccount")}</p>
                <p className="text-sm text-muted-foreground">{t("deleteAccountDescription")}</p>
              </div>
              <Button variant="destructive">{t("deleteAccount")}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
