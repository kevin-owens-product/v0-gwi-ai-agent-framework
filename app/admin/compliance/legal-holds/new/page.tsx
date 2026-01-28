"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { showErrorToast } from "@/lib/toast-utils"
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
  Gavel,
} from "lucide-react"
import Link from "next/link"

interface Organization {
  id: string
  name: string
  slug: string
}

export default function NewLegalHoldPage() {
  const router = useRouter()
  const t = useTranslations("admin.compliance.legalHolds.new")
  const [isSaving, setIsSaving] = useState(false)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    caseNumber: "",
    orgId: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    notes: "",
  })

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const response = await fetch("/api/admin/tenants?limit=100", {
          credentials: "include",
        })
        if (response.ok) {
          const data = await response.json()
          setOrganizations(data.tenants || [])
        }
      } catch (error) {
        console.error("Failed to fetch organizations:", error)
      }
    }
    fetchOrganizations()
  }, [])

  const handleCreate = async () => {
    if (!formData.name || !formData.startDate) {
      showErrorToast(t("validation.nameAndStartDateRequired"))
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/compliance/legal-holds", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          caseNumber: formData.caseNumber || null,
          orgId: formData.orgId || null,
          startDate: formData.startDate,
          endDate: formData.endDate || null,
          notes: formData.notes || null,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        const data = await response.json()
        throw new Error(data.error || t("errors.createFailed"))
      }

      const data = await response.json()
      router.push(`/admin/compliance/legal-holds/${data.legalHold?.id || ""}`)
    } catch (error) {
      console.error("Failed to create legal hold:", error)
      showErrorToast(error instanceof Error ? error.message : t("errors.createFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/compliance/legal-holds">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("back")}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Gavel className="h-6 w-6 text-red-500" />
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.name || !formData.startDate}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("creating")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t("createLegalHold")}
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sections.legalHoldDetails")}</CardTitle>
          <CardDescription>
            {t("sections.detailsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t("fields.legalHoldName")} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t("placeholders.name")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caseNumber">{t("fields.caseNumber")}</Label>
              <Input
                id="caseNumber"
                value={formData.caseNumber}
                onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                placeholder={t("placeholders.caseNumber")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("fields.organization")}</Label>
            <Select
              value={formData.orgId || "none"}
              onValueChange={(value) => setFormData({ ...formData, orgId: value === "none" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("placeholders.organization")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("placeholders.organization")}</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t("hints.organization")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t("fields.startDate")} *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">{t("fields.endDate")}</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {t("hints.endDate")}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("fields.description")}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t("placeholders.description")}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("fields.internalNotes")}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t("placeholders.notes")}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
