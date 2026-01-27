"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { PageTracker } from "@/components/tracking/PageTracker"

export default function GeneralSettingsPage() {
  const t = useTranslations("settings.general")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  return (
    <div className="p-6 max-w-3xl">
      <PageTracker pageName="Settings - General" />
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("organizationDetails")}</CardTitle>
            <CardDescription>{t("updateOrgInfo")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center text-2xl font-bold">
                AC
              </div>
              <Button variant="outline">{t("changeLogo")}</Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="org-name">{t("organizationName")}</Label>
                <Input id="org-name" defaultValue="Acme Corporation" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-slug">{t("organizationSlug")}</Label>
                <Input id="org-slug" defaultValue="acme-corp" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-description">{t("orgDescription")}</Label>
              <Textarea
                id="org-description"
                defaultValue="Leading consumer goods company focused on sustainable products."
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="industry">{t("industry")}</Label>
                <Select defaultValue="consumer-goods">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consumer-goods">{t("consumerGoods")}</SelectItem>
                    <SelectItem value="technology">{t("technology")}</SelectItem>
                    <SelectItem value="finance">{t("finance")}</SelectItem>
                    <SelectItem value="healthcare">{t("healthcare")}</SelectItem>
                    <SelectItem value="retail">{t("retail")}</SelectItem>
                    <SelectItem value="media">{t("mediaEntertainment")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">{t("companySize")}</Label>
                <Select defaultValue="1000-5000">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-50">{t("employees1to50")}</SelectItem>
                    <SelectItem value="50-200">{t("employees50to200")}</SelectItem>
                    <SelectItem value="200-1000">{t("employees200to1000")}</SelectItem>
                    <SelectItem value="1000-5000">{t("employees1000to5000")}</SelectItem>
                    <SelectItem value="5000+">{t("employees5000plus")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("regionalSettings")}</CardTitle>
            <CardDescription>{t("regionalDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="timezone">{t("timezone")}</Label>
                <Select defaultValue="america-new-york">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="america-new-york">America/New York (EST)</SelectItem>
                    <SelectItem value="america-los-angeles">America/Los Angeles (PST)</SelectItem>
                    <SelectItem value="europe-london">Europe/London (GMT)</SelectItem>
                    <SelectItem value="europe-paris">Europe/Paris (CET)</SelectItem>
                    <SelectItem value="asia-tokyo">Asia/Tokyo (JST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-format">{t("dateFormat")}</Label>
                <Select defaultValue="mdy">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("saving")}
              </>
            ) : (
              t("saveChanges")
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
