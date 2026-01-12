"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { PageTracker } from "@/components/tracking/PageTracker"

const notificationSettings = [
  {
    category: "Agent Activity",
    settings: [
      {
        id: "agent-complete",
        label: "Agent task completed",
        description: "Get notified when an agent finishes a task",
        email: true,
        push: true,
        slack: false,
      },
      {
        id: "agent-error",
        label: "Agent errors",
        description: "Alert when an agent encounters an error",
        email: true,
        push: true,
        slack: true,
      },
      {
        id: "agent-approval",
        label: "Approval requests",
        description: "When an agent needs human approval to proceed",
        email: true,
        push: true,
        slack: true,
      },
    ],
  },
  {
    category: "Reports & Exports",
    settings: [
      {
        id: "report-ready",
        label: "Report ready",
        description: "When a new report is generated",
        email: true,
        push: false,
        slack: true,
      },
      {
        id: "export-complete",
        label: "Export complete",
        description: "When data exports are ready for download",
        email: true,
        push: false,
        slack: false,
      },
    ],
  },
  {
    category: "Team & Collaboration",
    settings: [
      {
        id: "mention",
        label: "Mentions",
        description: "When someone mentions you in a comment",
        email: true,
        push: true,
        slack: true,
      },
      {
        id: "share",
        label: "Shared with me",
        description: "When someone shares a report or workflow with you",
        email: true,
        push: true,
        slack: false,
      },
      {
        id: "team-invite",
        label: "Team invitations",
        description: "New team member joins or invitation sent",
        email: true,
        push: false,
        slack: false,
      },
    ],
  },
  {
    category: "System & Security",
    settings: [
      {
        id: "login-alert",
        label: "Login alerts",
        description: "Notify about new device logins",
        email: true,
        push: true,
        slack: false,
      },
      {
        id: "maintenance",
        label: "System maintenance",
        description: "Scheduled downtime and updates",
        email: true,
        push: false,
        slack: false,
      },
    ],
  },
]

export default function NotificationsSettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState(notificationSettings)

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
  }

  return (
    <div className="p-6 max-w-3xl">
      <PageTracker pageName="Settings - Notifications" />
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Notification Preferences</h1>
        <p className="text-muted-foreground">Choose how and when you want to be notified</p>
      </div>

      <div className="space-y-6">
        {settings.map((category, categoryIndex) => (
          <Card key={category.category}>
            <CardHeader>
              <CardTitle>{category.category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Header row */}
              <div className="grid grid-cols-[1fr,80px,80px,80px] gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                <div></div>
                <div className="text-center">Email</div>
                <div className="text-center">Push</div>
                <div className="text-center">Slack</div>
              </div>

              {category.settings.map((setting, settingIndex) => (
                <div key={setting.id} className="grid grid-cols-[1fr,80px,80px,80px] gap-4 items-center">
                  <div>
                    <p className="font-medium">{setting.label}</p>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
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
                Saving...
              </>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
