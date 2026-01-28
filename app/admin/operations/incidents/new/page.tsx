"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"

export default function NewIncidentPage() {
  const router = useRouter()
  const t = useTranslations("admin.operations.incidents")
  const tCommon = useTranslations("common")
  const tOps = useTranslations("admin.operations")
  const [isSaving, setIsSaving] = useState(false)

  const serviceOptions = [
    tOps("services.apiGateway"),
    tOps("services.authentication"),
    tOps("services.database"),
    tOps("services.fileStorage"),
    tOps("services.messaging"),
    tOps("services.search"),
    tOps("services.analytics"),
    tOps("services.payments"),
    tOps("services.notifications"),
  ]

  const severityOptions = [
    { value: "MINOR", label: tOps("severity.minor"), color: "bg-blue-500", description: t("severityDescriptions.minor") },
    { value: "MODERATE", label: tOps("severity.moderate"), color: "bg-yellow-500", description: t("severityDescriptions.moderate") },
    { value: "MAJOR", label: tOps("severity.major"), color: "bg-orange-500", description: t("severityDescriptions.major") },
    { value: "CRITICAL", label: tOps("severity.critical"), color: "bg-red-500", description: t("severityDescriptions.critical") },
  ]

  const typeOptions = [
    { value: "OUTAGE", label: t("type.outage"), description: t("typeDescriptions.outage") },
    { value: "DEGRADATION", label: t("type.degradation"), description: t("typeDescriptions.degradation") },
    { value: "SECURITY", label: t("type.security"), description: t("typeDescriptions.security") },
    { value: "DATA_ISSUE", label: t("type.dataIssue"), description: t("typeDescriptions.dataIssue") },
    { value: "THIRD_PARTY", label: t("type.thirdParty"), description: t("typeDescriptions.thirdParty") },
    { value: "CAPACITY", label: t("type.capacity"), description: t("typeDescriptions.capacity") },
    { value: "NETWORK", label: t("type.network"), description: t("typeDescriptions.network") },
    { value: "DATABASE", label: t("type.database"), description: t("typeDescriptions.database") },
  ]

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "MODERATE",
    type: "OUTAGE",
    affectedServices: [] as string[],
    impact: "",
  })

  const handleCreate = async () => {
    if (!formData.title || !formData.description) {
      showErrorToast(t("validation.titleDescriptionRequired"))
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/operations/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          impact: formData.impact || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create incident")
      }

      await response.json()
      showSuccessToast(t("toast.incidentCreated"))
      router.push(`/admin/operations/incidents`)
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : t("toast.createFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  const toggleService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      affectedServices: prev.affectedServices.includes(service)
        ? prev.affectedServices.filter(s => s !== service)
        : [...prev.affectedServices, service],
    }))
  }

  const selectedSeverity = severityOptions.find(s => s.value === formData.severity)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/operations/incidents">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon("back")}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-primary" />
              {t("new.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("new.description")}
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.title || !formData.description}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("new.reporting")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t("reportIncident")}
            </>
          )}
        </Button>
      </div>

      {/* Warning Banner */}
      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <div>
              <h3 className="font-semibold">{t("new.warningTitle")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("new.warningDescription")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t("new.incidentDetails")}</CardTitle>
            <CardDescription>
              {t("new.incidentDetailsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t("form.incidentTitle")} *</Label>
              <Input
                id="title"
                placeholder={t("form.titlePlaceholder")}
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("form.description")} *</Label>
              <Textarea
                id="description"
                placeholder={t("form.descriptionPlaceholder")}
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="impact">{t("form.businessImpact")}</Label>
              <Textarea
                id="impact"
                placeholder={t("form.impactPlaceholder")}
                rows={2}
                value={formData.impact}
                onChange={(e) =>
                  setFormData({ ...formData, impact: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Classification */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("new.classification")}</CardTitle>
              <CardDescription>
                {t("new.classificationDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("form.severity")} *</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) =>
                    setFormData({ ...formData, severity: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {severityOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${opt.color}`} />
                          <div className="flex flex-col">
                            <span>{opt.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {opt.description}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedSeverity && (
                  <div className="flex items-center gap-2 mt-2 p-2 rounded-md bg-muted">
                    <div className={`h-3 w-3 rounded-full ${selectedSeverity.color}`} />
                    <span className="text-sm">{selectedSeverity.description}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t("form.incidentType")} *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex flex-col">
                          <span>{opt.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {opt.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("form.affectedServices")}</CardTitle>
              <CardDescription>
                {t("new.selectAffectedServices")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {serviceOptions.map((service) => (
                  <Badge
                    key={service}
                    variant={
                      formData.affectedServices.includes(service)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => toggleService(service)}
                  >
                    {service}
                  </Badge>
                ))}
              </div>
              {formData.affectedServices.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {t("new.clickToSelectServices")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
