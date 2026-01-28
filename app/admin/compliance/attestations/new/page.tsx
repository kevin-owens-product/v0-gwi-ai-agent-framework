"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  FileText,
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

export default function NewAttestationPage() {
  const t = useTranslations("admin.compliance")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [frameworks, setFrameworks] = useState<Framework[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [formData, setFormData] = useState({
    frameworkId: "",
    orgId: "",
    status: "NOT_STARTED",
    validUntil: "",
    attestedBy: "",
  })

  const STATUS_OPTIONS = [
    { value: "NOT_STARTED", label: t("attestations.status.notStarted") },
    { value: "IN_PROGRESS", label: t("attestations.status.inProgress") },
    { value: "COMPLIANT", label: t("attestations.status.compliant") },
    { value: "NON_COMPLIANT", label: t("attestations.status.nonCompliant") },
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
    if (!formData.frameworkId || !formData.orgId) {
      toast.error(t("attestations.errors.frameworkAndOrgRequired"))
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/compliance/attestations", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frameworkId: formData.frameworkId,
          orgId: formData.orgId,
          status: formData.status,
          validUntil: formData.validUntil || null,
          attestedBy: formData.attestedBy || null,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        const data = await response.json()
        throw new Error(data.error || t("attestations.errors.createFailed"))
      }

      const data = await response.json()
      router.push(`/admin/compliance/attestations/${data.attestation?.id || ""}`)
    } catch (error) {
      console.error("Failed to create attestation:", error)
      toast.error(error instanceof Error ? error.message : t("attestations.errors.createFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/compliance/attestations">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon("back")}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              {t("attestations.new.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("attestations.new.description")}
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.frameworkId || !formData.orgId}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {tCommon("creating")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t("attestations.new.createAttestation")}
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t("attestations.new.attestationDetails")}</CardTitle>
          <CardDescription>
            {t("attestations.new.configureAttestation")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>{t("attestations.fields.organization")} *</Label>
            <Select
              value={formData.orgId}
              onValueChange={(value) => setFormData({ ...formData, orgId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("attestations.new.selectOrganization")} />
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

          <div className="space-y-2">
            <Label>{t("attestations.fields.framework")} *</Label>
            <Select
              value={formData.frameworkId}
              onValueChange={(value) => setFormData({ ...formData, frameworkId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("attestations.new.selectFramework")} />
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

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>{t("attestations.fields.initialStatus")}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="validUntil">{t("attestations.fields.validUntilOptional")}</Label>
              <Input
                id="validUntil"
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {t("attestations.new.expirationDateHint")}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="attestedBy">{t("attestations.fields.attestedByOptional")}</Label>
            <Input
              id="attestedBy"
              value={formData.attestedBy}
              onChange={(e) => setFormData({ ...formData, attestedBy: e.target.value })}
              placeholder={t("attestations.new.attestedByPlaceholder")}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
