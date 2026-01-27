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
import { useOrganization } from "@/hooks/useOrganization"

// Helper function to get organization initials
function getOrgInitials(name: string | undefined | null): string {
  if (!name) return ""
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function GeneralSettingsPage() {
  const t = useTranslations("settings.general")
  const { organization, isLoading } = useOrganization()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Extract organization settings for industry and company size
  const orgSettings = organization?.settings as Record<string, unknown> | undefined
  const orgIndustry = (orgSettings?.industry as string) || organization?.industry || ""
  const orgCompanySize = (orgSettings?.companySize as string) || ""
  const orgDescription = (orgSettings?.description as string) || ""

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
                {getOrgInitials(organization?.name)}
              </div>
              <Button variant="outline">{t("changeLogo")}</Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="org-name">{t("organizationName")}</Label>
                <Input
                  id="org-name"
                  defaultValue={organization?.name || ""}
                  placeholder={t("placeholders.organizationName")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-slug">{t("organizationSlug")}</Label>
                <Input
                  id="org-slug"
                  defaultValue={organization?.slug || ""}
                  placeholder={t("placeholders.organizationSlug")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-description">{t("orgDescription")}</Label>
              <Textarea
                id="org-description"
                defaultValue={orgDescription}
                placeholder={t("placeholders.orgDescription")}
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="industry">{t("industry")}</Label>
                <Select defaultValue={orgIndustry || undefined}>
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
                <Select defaultValue={orgCompanySize || undefined}>
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
                <Select defaultValue={organization?.timezone || "america-new-york"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="america-new-york">{t("timezones.americaNewYork")}</SelectItem>
                    <SelectItem value="america-los-angeles">{t("timezones.americaLosAngeles")}</SelectItem>
                    <SelectItem value="europe-london">{t("timezones.europeLondon")}</SelectItem>
                    <SelectItem value="europe-paris">{t("timezones.europeParis")}</SelectItem>
                    <SelectItem value="asia-tokyo">{t("timezones.asiaTokyo")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-format">{t("dateFormat")}</Label>
                <Select defaultValue={(orgSettings?.dateFormat as string) || "mdy"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mdy">{t("dateFormats.mdy")}</SelectItem>
                    <SelectItem value="dmy">{t("dateFormats.dmy")}</SelectItem>
                    <SelectItem value="ymd">{t("dateFormats.ymd")}</SelectItem>
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
