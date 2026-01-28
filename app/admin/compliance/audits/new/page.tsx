"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  FileSearch,
} from "lucide-react"
import Link from "next/link"

interface Framework {
  id: string
  name: string
  code: string
}

interface Organization {
  id: string
  name: string
  slug: string
}

export default function NewAuditPage() {
  const t = useTranslations("admin.compliance")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [frameworks, setFrameworks] = useState<Framework[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [formData, setFormData] = useState({
    frameworkId: "",
    orgId: "",
    type: "INTERNAL",
    scheduledDate: "",
    auditor: "",
    notes: "",
  })

  const TYPE_OPTIONS = [
    { value: "INTERNAL", label: t("audits.types.internal") },
    { value: "EXTERNAL", label: t("audits.types.external") },
    { value: "SELF_ASSESSMENT", label: t("audits.types.selfAssessment") },
    { value: "CERTIFICATION", label: t("audits.types.certification") },
  ]

  useEffect(() => {
    async function fetchData() {
      try {
        const [frameworksRes, orgsRes] = await Promise.all([
          fetch("/api/admin/compliance/frameworks?limit=100&isActive=true", {
            credentials: "include",
          }),
          fetch("/api/admin/tenants?limit=100", {
            credentials: "include",
          }),
        ])

        if (frameworksRes.ok) {
          const data = await frameworksRes.json()
          setFrameworks(data.frameworks || [])
        }
        if (orgsRes.ok) {
          const data = await orgsRes.json()
          setOrganizations(data.tenants || [])
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      }
    }
    fetchData()
  }, [])

  const handleCreate = async () => {
    if (!formData.frameworkId || !formData.scheduledDate) {
      toast.error(t("audits.errors.frameworkAndDateRequired"))
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/compliance/audits", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frameworkId: formData.frameworkId,
          orgId: formData.orgId || null,
          type: formData.type,
          scheduledDate: formData.scheduledDate,
          auditor: formData.auditor || null,
          notes: formData.notes || null,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        const data = await response.json()
        throw new Error(data.error || t("audits.errors.scheduleFailed"))
      }

      const data = await response.json()
      router.push(`/admin/compliance/audits/${data.audit?.id || ""}`)
    } catch (error) {
      console.error("Failed to schedule audit:", error)
      toast.error(error instanceof Error ? error.message : t("audits.errors.scheduleFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/compliance/audits">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon("back")}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileSearch className="h-6 w-6 text-primary" />
              {t("audits.new.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("audits.new.description")}
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.frameworkId || !formData.scheduledDate}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("audits.new.scheduling")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t("audits.scheduleAudit")}
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t("audits.new.auditDetails")}</CardTitle>
          <CardDescription>
            {t("audits.new.configureAudit")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>{t("audits.fields.framework")} *</Label>
            <Select
              value={formData.frameworkId}
              onValueChange={(value) => setFormData({ ...formData, frameworkId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("audits.dialog.selectFramework")} />
              </SelectTrigger>
              <SelectContent>
                {frameworks.map((framework) => (
                  <SelectItem key={framework.id} value={framework.id}>
                    {framework.name} ({framework.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("audits.fields.organizationOptional")}</Label>
            <Select
              value={formData.orgId || "none"}
              onValueChange={(value) => setFormData({ ...formData, orgId: value === "none" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("audits.new.platformWideAudit")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("audits.new.platformWideAudit")}</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t("audits.new.leaveEmptyForPlatformWide")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>{t("audits.fields.auditType")}</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
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
              <Label htmlFor="scheduledDate">{t("audits.fields.scheduledDate")} *</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="auditor">{t("audits.fields.auditor")}</Label>
            <Input
              id="auditor"
              value={formData.auditor}
              onChange={(e) => setFormData({ ...formData, auditor: e.target.value })}
              placeholder={t("audits.dialog.auditorPlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("audits.fields.notes")}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t("audits.new.notesPlaceholder")}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
