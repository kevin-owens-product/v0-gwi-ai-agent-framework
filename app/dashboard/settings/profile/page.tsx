"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Camera } from "lucide-react"
import { PageTracker } from "@/components/tracking/PageTracker"

// Helper function to get user initials
function getUserInitials(name: string | undefined | null): string {
  if (!name) return ""
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Helper to split name into first and last
function splitName(fullName: string | undefined | null): { firstName: string; lastName: string } {
  if (!fullName) return { firstName: "", lastName: "" }
  const parts = fullName.trim().split(" ")
  if (parts.length === 1) return { firstName: parts[0], lastName: "" }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  }
}

export default function ProfileSettingsPage() {
  const t = useTranslations("settings.profile")
  const { data: session, status } = useSession()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const { firstName, lastName } = splitName(session?.user?.name)
  const userInitials = getUserInitials(session?.user?.name)

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
                  <AvatarImage src={session?.user?.image || undefined} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
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
                <Input
                  id="first-name"
                  defaultValue={firstName}
                  placeholder={t("placeholders.firstName")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">{t("lastName")}</Label>
                <Input
                  id="last-name"
                  defaultValue={lastName}
                  placeholder={t("placeholders.lastName")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("emailAddress")}</Label>
              <Input
                id="email"
                type="email"
                defaultValue={session?.user?.email || ""}
                placeholder={t("placeholders.email")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-title">{t("jobTitle")}</Label>
              <Input
                id="job-title"
                defaultValue=""
                placeholder={t("placeholders.jobTitle")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">{t("bio")}</Label>
              <Textarea
                id="bio"
                defaultValue=""
                placeholder={t("placeholders.bio")}
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
                <Input
                  id="phone"
                  type="tel"
                  defaultValue=""
                  placeholder={t("placeholders.phone")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">{t("location")}</Label>
                <Input
                  id="location"
                  defaultValue=""
                  placeholder={t("placeholders.location")}
                />
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
