"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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
  Download,
} from "lucide-react"
import Link from "next/link"

interface Organization {
  id: string
  name: string
  slug: string
}

interface User {
  id: string
  name: string | null
  email: string
}

interface LegalHold {
  id: string
  name: string
  caseNumber: string | null
}

export default function NewDataExportPage() {
  const t = useTranslations("admin.compliance")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [legalHolds, setLegalHolds] = useState<LegalHold[]>([])
  const [formData, setFormData] = useState({
    type: "USER_DATA",
    format: "json",
    orgId: "",
    userId: "",
    legalHoldId: "",
  })

  const TYPE_OPTIONS = [
    { value: "USER_DATA", label: t("dataExports.new.types.userData") },
    { value: "ORG_DATA", label: t("dataExports.new.types.orgData") },
    { value: "GDPR_EXPORT", label: t("dataExports.new.types.gdprExport") },
    { value: "LEGAL_HOLD", label: t("dataExports.new.types.legalHold") },
    { value: "BACKUP", label: t("dataExports.new.types.backup") },
  ]

  const FORMAT_OPTIONS = [
    { value: "json", label: t("dataExports.formats.json") },
    { value: "csv", label: t("dataExports.formats.csv") },
    { value: "zip", label: t("dataExports.formats.zip") },
  ]

  useEffect(() => {
    async function fetchData() {
      try {
        const [orgsRes, usersRes, legalHoldsRes] = await Promise.all([
          fetch("/api/admin/tenants?limit=100", { credentials: "include" }),
          fetch("/api/admin/users?limit=100", { credentials: "include" }),
          fetch("/api/admin/compliance/legal-holds?limit=100&status=ACTIVE", { credentials: "include" }),
        ])

        if (orgsRes.ok) {
          const data = await orgsRes.json()
          setOrganizations(data.tenants || [])
        }
        if (usersRes.ok) {
          const data = await usersRes.json()
          setUsers(data.users || [])
        }
        if (legalHoldsRes.ok) {
          const data = await legalHoldsRes.json()
          setLegalHolds(data.legalHolds || [])
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      }
    }
    fetchData()
  }, [])

  const handleCreate = async () => {
    if (!formData.type) {
      toast.error(t("dataExports.errors.typeRequired"))
      return
    }

    // Validate subject based on type
    if (formData.type === "USER_DATA" && !formData.userId) {
      toast.error(t("dataExports.errors.userRequired"))
      return
    }
    if (formData.type === "ORG_DATA" && !formData.orgId) {
      toast.error(t("dataExports.errors.orgRequired"))
      return
    }
    if (formData.type === "LEGAL_HOLD" && !formData.legalHoldId) {
      toast.error(t("dataExports.errors.legalHoldRequired"))
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/compliance/data-exports", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formData.type,
          format: formData.format,
          orgId: formData.orgId || null,
          userId: formData.userId || null,
          legalHoldId: formData.legalHoldId || null,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        const data = await response.json()
        throw new Error(data.error || t("dataExports.errors.createFailed"))
      }

      const data = await response.json()
      router.push(`/admin/compliance/data-exports/${data.export?.id || ""}`)
    } catch (error) {
      console.error("Failed to create data export:", error)
      toast.error(error instanceof Error ? error.message : t("dataExports.errors.createFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  const showUserSelect = formData.type === "USER_DATA" || formData.type === "GDPR_EXPORT"
  const showOrgSelect = formData.type === "ORG_DATA"
  const showLegalHoldSelect = formData.type === "LEGAL_HOLD"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/compliance/data-exports">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon("back")}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Download className="h-6 w-6 text-green-500" />
              {t("dataExports.new.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("dataExports.new.description")}
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {tCommon("creating")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t("dataExports.createExport")}
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dataExports.new.exportConfiguration")}</CardTitle>
          <CardDescription>
            {t("dataExports.new.configureDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>{t("dataExports.fields.exportType")} *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({
                  ...formData,
                  type: value,
                  userId: "",
                  orgId: "",
                  legalHoldId: "",
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("dataExports.fields.format")} *</Label>
              <Select
                value={formData.format}
                onValueChange={(value) => setFormData({ ...formData, format: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMAT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {showUserSelect && (
            <div className="space-y-2">
              <Label>{t("dataExports.fields.user")} {formData.type === "USER_DATA" ? "*" : t("dataExports.new.optional")}</Label>
              <Select
                value={formData.userId || "none"}
                onValueChange={(value) => setFormData({ ...formData, userId: value === "none" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("dataExports.new.selectUser")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("dataExports.new.noSpecificUser")}</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showOrgSelect && (
            <div className="space-y-2">
              <Label>{t("dataExports.fields.organization")} *</Label>
              <Select
                value={formData.orgId}
                onValueChange={(value) => setFormData({ ...formData, orgId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("dataExports.new.selectOrganization")} />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showLegalHoldSelect && (
            <div className="space-y-2">
              <Label>{t("dataExports.fields.legalHold")} *</Label>
              <Select
                value={formData.legalHoldId}
                onValueChange={(value) => setFormData({ ...formData, legalHoldId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("dataExports.new.selectLegalHold")} />
                </SelectTrigger>
                <SelectContent>
                  {legalHolds.map((hold) => (
                    <SelectItem key={hold.id} value={hold.id}>
                      {hold.name} {hold.caseNumber ? `(${hold.caseNumber})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="rounded-lg border p-4 bg-muted/50">
            <p className="text-sm text-muted-foreground">
              <strong>{t("dataExports.new.note")}:</strong> {t("dataExports.new.noteDescription")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
