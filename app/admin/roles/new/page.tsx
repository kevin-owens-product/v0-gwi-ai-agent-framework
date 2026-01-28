"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
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
  Shield,
  Building2,
} from "lucide-react"
import Link from "next/link"
import { showErrorToast } from "@/lib/toast-utils"
import { useAdmin } from "@/components/providers/admin-provider"
import { PermissionMatrix } from "@/components/admin/roles/permission-matrix"

interface ExistingRole {
  id: string
  name: string
  displayName: string
  scope: string
}

// colorOptions moved inside component to use translations

export default function NewRolePage() {
  const t = useTranslations("admin.roles")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const { admin: currentAdmin } = useAdmin()
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [allRoles, setAllRoles] = useState<ExistingRole[]>([])
  const [parentPermissions, setParentPermissions] = useState<string[]>([])

  const colorOptions = [
    { value: "#8B5CF6", label: t("colors.purple") },
    { value: "#3B82F6", label: t("colors.blue") },
    { value: "#10B981", label: t("colors.green") },
    { value: "#F59E0B", label: t("colors.amber") },
    { value: "#EF4444", label: t("colors.red") },
    { value: "#6B7280", label: t("colors.gray") },
    { value: "#EC4899", label: t("colors.pink") },
    { value: "#14B8A6", label: t("colors.teal") },
  ]

  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    scope: "PLATFORM" as "PLATFORM" | "TENANT",
    permissions: [] as string[],
    parentRoleId: "" as string | null,
    color: "",
    priority: 50,
  })

  const canCreate = currentAdmin.role === "SUPER_ADMIN"

  useEffect(() => {
    async function fetchRoles() {
      try {
        const response = await fetch(`/api/admin/roles?scope=${formData.scope}`)
        if (response.ok) {
          const data = await response.json()
          setAllRoles(data.roles || [])
        }
      } catch (error) {
        console.error("Failed to fetch roles:", error)
      }
    }
    fetchRoles()
  }, [formData.scope])

  useEffect(() => {
    async function fetchParentPermissions() {
      if (!formData.parentRoleId) {
        setParentPermissions([])
        return
      }
      try {
        const response = await fetch(`/api/admin/roles/${formData.parentRoleId}?includeEffectivePermissions=true`)
        if (response.ok) {
          const data = await response.json()
          setParentPermissions(data.effectivePermissions || data.role?.permissions || [])
        }
      } catch (error) {
        console.error("Failed to fetch parent permissions:", error)
      }
    }
    fetchParentPermissions()
  }, [formData.parentRoleId])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  const handleDisplayNameChange = (displayName: string) => {
    setFormData(prev => ({
      ...prev,
      displayName,
      name: prev.name || generateSlug(displayName),
    }))
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.displayName) {
      showErrorToast(t("validation.required"))
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          displayName: formData.displayName,
          description: formData.description || null,
          scope: formData.scope,
          permissions: formData.permissions,
          parentRoleId: formData.parentRoleId || null,
          color: formData.color || null,
          priority: formData.priority,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/admin/roles/${data.role.id}`)
      } else {
        const data = await response.json()
        showErrorToast(data.error || t("createError"))
      }
    } catch (error) {
      console.error("Failed to create role:", error)
      showErrorToast(t("createError"))
    } finally {
      setIsSaving(false)
    }
  }

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">{t("noPermissionCreate")}</p>
        <Link href="/admin/roles">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backToRoles")}
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
          <Link href="/admin/roles">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon("back")}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{t("createNewRole")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("createNewRoleDescription")}
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.name || !formData.displayName}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("creating")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t("createRole")}
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">{t("tabs.details")}</TabsTrigger>
          <TabsTrigger value="permissions">{t("tabs.permissions")}</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("details.title")}</CardTitle>
              <CardDescription>
                {t("details.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{t("form.displayNameRequired")}</Label>
                  <Input
                    value={formData.displayName}
                    onChange={(e) => handleDisplayNameChange(e.target.value)}
                    placeholder={t("form.displayNamePlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("form.slugRequired")}</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t("form.slugPlaceholder")}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("form.nameHint")}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("form.scopeRequired")}</Label>
                <Select
                  value={formData.scope}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, scope: v as "PLATFORM" | "TENANT", parentRoleId: null }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLATFORM">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        {t("scopes.platform")}
                      </div>
                    </SelectItem>
                    <SelectItem value="TENANT">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {t("scopes.organization")}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {formData.scope === "PLATFORM"
                    ? t("platformRolesDescription")
                    : t("organizationRolesDescription")
                  }
                </p>
              </div>

              <div className="space-y-2">
                <Label>{t("form.description")}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t("form.descriptionPlaceholder")}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{t("form.parentRole")}</Label>
                  <Select
                    value={formData.parentRoleId || "none"}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, parentRoleId: v === "none" ? null : v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("form.noParentRole")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t("form.noParentRole")}</SelectItem>
                      {allRoles
                        .filter(r => r.scope === formData.scope)
                        .map(r => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.displayName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {t("form.parentRoleHint")}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>{t("form.priority")}</Label>
                  <Input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("form.priorityHint")}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("form.color")}</Label>
                <Select
                  value={formData.color || "none"}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, color: v === "none" ? "" : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("form.selectColor")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("form.default")}</SelectItem>
                    {colorOptions.map(color => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded"
                            style={{ backgroundColor: color.value }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("permissions.title")}</CardTitle>
              <CardDescription>
                {t("permissions.description")}
                {parentPermissions.length > 0 && (
                  <span className="block mt-1">
                    {t("permissions.inheritedCount", { count: parentPermissions.length })}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PermissionMatrix
                scope={formData.scope}
                selectedPermissions={formData.permissions}
                onPermissionsChange={(permissions) => setFormData(prev => ({ ...prev, permissions }))}
                inheritedPermissions={parentPermissions}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
