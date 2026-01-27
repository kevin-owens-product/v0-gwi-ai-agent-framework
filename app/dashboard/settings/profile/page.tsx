"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Camera } from "lucide-react"
import { PageTracker } from "@/components/tracking/PageTracker"

export default function ProfileSettingsPage() {
  const t = useTranslations("settings.profile")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  return (
    <div className="p-6 max-w-3xl">
      <PageTracker pageName="Settings - Profile" />
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("personalInfo")}</CardTitle>
            <CardDescription>{t("updateProfileDetails")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder.svg?key=poh3o" />
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div>
                <Button variant="outline" size="sm">
                  {t("uploadPhoto")}
                </Button>
                <p className="mt-1 text-xs text-muted-foreground">{t("photoHint")}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first-name">{t("firstName")}</Label>
                <Input id="first-name" defaultValue="Sarah" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">{t("lastName")}</Label>
                <Input id="last-name" defaultValue="Chen" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("emailAddress")}</Label>
              <Input id="email" type="email" defaultValue="sarah.chen@acme.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-title">{t("jobTitle")}</Label>
              <Input id="job-title" defaultValue="Senior Insights Analyst" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">{t("bio")}</Label>
              <Textarea
                id="bio"
                defaultValue="10+ years experience in consumer research and data analysis. Passionate about uncovering actionable insights."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("contactInfo")}</CardTitle>
            <CardDescription>{t("contactDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">{t("phoneNumber")}</Label>
                <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">{t("location")}</Label>
                <Input id="location" defaultValue="New York, NY" />
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
