"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { showErrorToast } from "@/lib/toast-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  Mail,
  Building2,
} from "lucide-react"
import Link from "next/link"
import { useAdmin } from "@/components/providers/admin-provider"

interface Organization {
  id: string
  name: string
  slug: string
}

export default function NewUserPage() {
  const t = useTranslations("admin.users")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const { admin: currentAdmin } = useAdmin()
  const [isSaving, setIsSaving] = useState(false)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true)

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    orgId: "",
    role: "MEMBER",
    sendInvite: false,
  })

  const canCreate = currentAdmin.role === "SUPER_ADMIN" || currentAdmin.role === "ADMIN"

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const response = await fetch("/api/admin/tenants?limit=200", {
          credentials: "include",
        })
        if (response.ok) {
          const data = await response.json()
          setOrganizations(
            (data.tenants || []).map((t: Organization) => ({
              id: t.id,
              name: t.name,
              slug: t.slug,
            }))
          )
        }
      } catch (error) {
        console.error("Failed to fetch organizations:", error)
      } finally {
        setIsLoadingOrgs(false)
      }
    }
    fetchOrganizations()
  }, [])

  const handleCreate = async () => {
    if (!formData.email) {
      showErrorToast(t("emailRequired"))
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name || undefined,
          password: formData.password || undefined,
          orgId: formData.orgId && formData.orgId !== "none" ? formData.orgId : undefined,
          role: formData.role,
          sendInvite: formData.sendInvite,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/admin/users/${data.user.id}`)
      } else {
        const data = await response.json()
        showErrorToast(data.error || t("failedToCreateUser"))
      }
    } catch (error) {
      console.error("Failed to create user:", error)
      showErrorToast(t("failedToCreateUser"))
    } finally {
      setIsSaving(false)
    }
  }

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">{t("noPermissionToCreate")}</p>
        <Link href="/admin/users">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backToUsers")}
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
          <Link href="/admin/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("back")}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{t("createNewUser")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("addNewUserDescription")}
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.email}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("creating")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t("createUser")}
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("userDetails")}
            </CardTitle>
            <CardDescription>
              {t("basicUserInfo")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {t("emailAddress")} *
                  </div>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder={t("emailPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">{t("fullName")}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t("fullNamePlaceholder")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("passwordOptional")}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder={t("passwordResetPlaceholder")}
              />
              <p className="text-xs text-muted-foreground">
                {t("passwordHint")}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label>{t("sendInviteEmail")}</Label>
                <p className="text-xs text-muted-foreground">
                  {t("sendInviteEmailDescription")}
                </p>
              </div>
              <Switch
                checked={formData.sendInvite}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sendInvite: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t("organizationAssignment")}
            </CardTitle>
            <CardDescription>
              {t("organizationAssignmentDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>{t("organization")}</Label>
                <Select
                  value={formData.orgId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, orgId: value }))}
                  disabled={isLoadingOrgs}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingOrgs ? tCommon("loading") : t("selectOrganizationOptional")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("noOrganization")}</SelectItem>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name} ({org.slug})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t("organizationLaterHint")}
                </p>
              </div>

              {formData.orgId && formData.orgId !== "none" && (
                <div className="space-y-2">
                  <Label>{t("roleInOrganization")}</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OWNER">{t("owner")}</SelectItem>
                      <SelectItem value="ADMIN">{t("admin")}</SelectItem>
                      <SelectItem value="MEMBER">{t("member")}</SelectItem>
                      <SelectItem value="VIEWER">{t("viewer")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {t("roleHint")}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
