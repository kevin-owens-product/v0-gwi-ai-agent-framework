"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { PageTracker } from "@/components/tracking/PageTracker"
import { showSuccessToast } from "@/lib/toast-utils"

type NotificationSetting = {
  id: string
  labelKey: string
  descriptionKey: string
  email: boolean
  push: boolean
  slack: boolean
}

type NotificationCategory = {
  categoryKey: string
  settings: NotificationSetting[]
}

const createNotificationSettings = (): NotificationCategory[] => [
  {
    categoryKey: "agentActivity",
    settings: [
      {
        id: "agent-complete",
        labelKey: "agentTaskCompleted",
        descriptionKey: "agentTaskCompletedDesc",
        email: true,
        push: true,
        slack: false,
      },
      {
        id: "agent-error",
        labelKey: "agentErrors",
        descriptionKey: "agentErrorsDesc",
        email: true,
        push: true,
        slack: true,
      },
      {
        id: "agent-approval",
        labelKey: "approvalRequests",
        descriptionKey: "approvalRequestsDesc",
        email: true,
        push: true,
        slack: true,
      },
    ],
  },
  {
    categoryKey: "reportsExports",
    settings: [
      {
        id: "report-ready",
        labelKey: "reportReady",
        descriptionKey: "reportReadyDesc",
        email: true,
        push: false,
        slack: true,
      },
      {
        id: "export-complete",
        labelKey: "exportComplete",
        descriptionKey: "exportCompleteDesc",
        email: true,
        push: false,
        slack: false,
      },
    ],
  },
  {
    categoryKey: "teamCollaboration",
    settings: [
      {
        id: "mention",
        labelKey: "mentions",
        descriptionKey: "mentionsDesc",
        email: true,
        push: true,
        slack: true,
      },
      {
        id: "share",
        labelKey: "sharedWithMe",
        descriptionKey: "sharedWithMeDesc",
        email: true,
        push: true,
        slack: false,
      },
      {
        id: "team-invite",
        labelKey: "teamInvitations",
        descriptionKey: "teamInvitationsDesc",
        email: true,
        push: false,
        slack: false,
      },
    ],
  },
  {
    categoryKey: "systemSecurity",
    settings: [
      {
        id: "login-alert",
        labelKey: "loginAlerts",
        descriptionKey: "loginAlertsDesc",
        email: true,
        push: true,
        slack: false,
      },
      {
        id: "maintenance",
        labelKey: "systemMaintenance",
        descriptionKey: "systemMaintenanceDesc",
        email: true,
        push: false,
        slack: false,
      },
    ],
  },
]

export default function NotificationsSettingsPage() {
  const t = useTranslations("notifications.settings")
  const tToast = useTranslations("toast")

  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState(createNotificationSettings)

  const toggleSetting = (categoryIndex: number, settingIndex: number, channel: "email" | "push" | "slack") => {
    const newSettings = [...settings]
    const setting = newSettings[categoryIndex].settings[settingIndex]
    setting[channel] = !setting[channel]
    setSettings(newSettings)
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    showSuccessToast(tToast("success.saved"))
  }

  return (
    <div className="p-6 max-w-3xl">
      <PageTracker pageName="Settings - Notifications" />
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <div className="space-y-6">
        {settings.map((category, categoryIndex) => (
          <Card key={category.categoryKey}>
            <CardHeader>
              <CardTitle>{t(`categories.${category.categoryKey}`)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Header row */}
              <div className="grid grid-cols-[1fr,80px,80px,80px] gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                <div></div>
                <div className="text-center">{t("channels.email")}</div>
                <div className="text-center">{t("channels.push")}</div>
                <div className="text-center">{t("channels.slack")}</div>
              </div>

              {category.settings.map((setting, settingIndex) => (
                <div key={setting.id} className="grid grid-cols-[1fr,80px,80px,80px] gap-4 items-center">
                  <div>
                    <p className="font-medium">{t(`items.${setting.labelKey}`)}</p>
                    <p className="text-sm text-muted-foreground">{t(`items.${setting.descriptionKey}`)}</p>
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={setting.email}
                      onCheckedChange={() => toggleSetting(categoryIndex, settingIndex, "email")}
                    />
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={setting.push}
                      onCheckedChange={() => toggleSetting(categoryIndex, settingIndex, "push")}
                    />
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={setting.slack}
                      onCheckedChange={() => toggleSetting(categoryIndex, settingIndex, "slack")}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("saving")}
              </>
            ) : (
              t("savePreferences")
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
