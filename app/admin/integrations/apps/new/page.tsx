"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  Loader2,
  Puzzle,
  Building2,
  Star,
  Shield,
  ImageIcon,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTranslations } from "next-intl"
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"

export default function NewIntegrationAppPage() {
  const router = useRouter()
  const t = useTranslations("admin.integrations.apps.new")
  const tMain = useTranslations("admin.integrations.apps")
  const tCommon = useTranslations("common")
  const [isSaving, setIsSaving] = useState(false)

  const categories = [
    { value: "PRODUCTIVITY", label: tMain("categories.productivity"), description: t("categoryDescriptions.productivity") },
    { value: "COMMUNICATION", label: tMain("categories.communication"), description: t("categoryDescriptions.communication") },
    { value: "PROJECT_MANAGEMENT", label: tMain("categories.projectManagement"), description: t("categoryDescriptions.projectManagement") },
    { value: "CRM", label: tMain("categories.crm"), description: t("categoryDescriptions.crm") },
    { value: "ANALYTICS", label: tMain("categories.analytics"), description: t("categoryDescriptions.analytics") },
    { value: "SECURITY", label: tMain("categories.security"), description: t("categoryDescriptions.security") },
    { value: "DEVELOPER_TOOLS", label: tMain("categories.developerTools"), description: t("categoryDescriptions.developerTools") },
    { value: "HR", label: tMain("categories.hr"), description: t("categoryDescriptions.hr") },
    { value: "FINANCE", label: tMain("categories.finance"), description: t("categoryDescriptions.finance") },
    { value: "MARKETING", label: tMain("categories.marketing"), description: t("categoryDescriptions.marketing") },
    { value: "CUSTOMER_SUPPORT", label: tMain("categories.customerSupport"), description: t("categoryDescriptions.customerSupport") },
    { value: "OTHER", label: tMain("categories.other"), description: t("categoryDescriptions.other") },
  ]

  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    description: "",
    category: "OTHER",
    developer: "",
    developerUrl: "",
    iconUrl: "",
    websiteUrl: "",
    documentationUrl: "",
    supportEmail: "",
    isOfficial: false,
    isFeatured: false,
  })

  const handleCreate = async () => {
    if (!formData.name || !formData.developer) {
      showErrorToast(t("validation.nameAndDeveloperRequired"))
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/integrations/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          shortDescription: formData.shortDescription || null,
          description: formData.description || null,
          developerUrl: formData.developerUrl || null,
          iconUrl: formData.iconUrl || null,
          websiteUrl: formData.websiteUrl || null,
          documentationUrl: formData.documentationUrl || null,
          supportEmail: formData.supportEmail || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("toast.createFailed"))
      }

      const data = await response.json()
      showSuccessToast(t("toast.createSuccess"))
      router.push(`/admin/integrations/apps/${data.app.id}`)
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : t("toast.createFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/integrations/apps">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("back")}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Puzzle className="h-6 w-6 text-primary" />
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.name || !formData.developer}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("creating")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t("createApp")}
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t("sections.appDetails")}</CardTitle>
            <CardDescription>
              {t("sections.appDetailsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("fields.appName")} *</Label>
              <Input
                id="name"
                placeholder={t("placeholders.appName")}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">{t("fields.shortDescription")}</Label>
              <Input
                id="shortDescription"
                placeholder={t("placeholders.shortDescription")}
                value={formData.shortDescription}
                onChange={(e) =>
                  setFormData({ ...formData, shortDescription: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                {t("hints.shortDescription")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("fields.fullDescription")}</Label>
              <Textarea
                id="description"
                placeholder={t("placeholders.fullDescription")}
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>{t("fields.category")}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex flex-col">
                        <span>{cat.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {cat.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Developer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t("sections.developerInformation")}
            </CardTitle>
            <CardDescription>
              {t("sections.developerInformationDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="developer">{t("fields.developerName")} *</Label>
              <Input
                id="developer"
                placeholder={t("placeholders.developerName")}
                value={formData.developer}
                onChange={(e) =>
                  setFormData({ ...formData, developer: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="developerUrl">{t("fields.developerWebsite")}</Label>
              <Input
                id="developerUrl"
                type="url"
                placeholder={t("placeholders.developerWebsite")}
                value={formData.developerUrl}
                onChange={(e) =>
                  setFormData({ ...formData, developerUrl: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportEmail">{t("fields.supportEmail")}</Label>
              <Input
                id="supportEmail"
                type="email"
                placeholder={t("placeholders.supportEmail")}
                value={formData.supportEmail}
                onChange={(e) =>
                  setFormData({ ...formData, supportEmail: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Assets & URLs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              {t("sections.assetsLinks")}
            </CardTitle>
            <CardDescription>
              {t("sections.assetsLinksDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="iconUrl">{t("fields.iconUrl")}</Label>
              <Input
                id="iconUrl"
                type="url"
                placeholder={t("placeholders.iconUrl")}
                value={formData.iconUrl}
                onChange={(e) =>
                  setFormData({ ...formData, iconUrl: e.target.value })
                }
              />
              {formData.iconUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{tCommon("preview")}:</span>
                  <img
                    src={formData.iconUrl}
                    alt={t("fields.iconUrl")}
                    className="h-10 w-10 rounded-lg object-cover border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none"
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteUrl">{t("fields.appWebsite")}</Label>
              <Input
                id="websiteUrl"
                type="url"
                placeholder={t("placeholders.appWebsite")}
                value={formData.websiteUrl}
                onChange={(e) =>
                  setFormData({ ...formData, websiteUrl: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentationUrl">{t("fields.documentationUrl")}</Label>
              <Input
                id="documentationUrl"
                type="url"
                placeholder={t("placeholders.documentationUrl")}
                value={formData.documentationUrl}
                onChange={(e) =>
                  setFormData({ ...formData, documentationUrl: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Flags */}
        <Card>
          <CardHeader>
            <CardTitle>{t("sections.appStatus")}</CardTitle>
            <CardDescription>
              {t("sections.appStatusDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2 p-4 rounded-md border">
              <Checkbox
                id="isOfficial"
                checked={formData.isOfficial}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isOfficial: checked as boolean })
                }
              />
              <div className="flex-1">
                <Label htmlFor="isOfficial" className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  {t("fields.officialApp")}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t("hints.officialApp")}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-4 rounded-md border">
              <Checkbox
                id="isFeatured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isFeatured: checked as boolean })
                }
              />
              <div className="flex-1">
                <Label htmlFor="isFeatured" className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  {t("fields.featuredApp")}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t("hints.featuredApp")}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-md bg-muted">
              <p className="text-sm text-muted-foreground">
                {t("hints.draftStatus")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
