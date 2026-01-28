"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  Loader2,
  Wrench,
  Calendar,
  Clock,
  Bell,
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
import { useTranslations } from "next-intl"
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"

export default function NewMaintenancePage() {
  const router = useRouter()
  const t = useTranslations("admin.operations.maintenance.new")
  const tMain = useTranslations("admin.operations.maintenance")
  const tOps = useTranslations("admin.operations")
  const tCommon = useTranslations("common")
  const [isSaving, setIsSaving] = useState(false)

  const typeOptions = [
    { value: "SCHEDULED", label: tMain("type.scheduled"), description: t("typeDescriptions.scheduled") },
    { value: "EMERGENCY", label: tMain("type.emergency"), description: t("typeDescriptions.emergency") },
    { value: "UPGRADE", label: tMain("type.upgrade"), description: t("typeDescriptions.upgrade") },
    { value: "MIGRATION", label: tMain("type.migration"), description: t("typeDescriptions.migration") },
    { value: "SECURITY_PATCH", label: tMain("type.securityPatch"), description: t("typeDescriptions.securityPatch") },
  ]

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

  const regionOptions = [
    t("regions.usEast"),
    t("regions.usWest"),
    t("regions.euWest"),
    t("regions.euCentral"),
    t("regions.asiaPacific"),
    t("regions.global"),
  ]

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "SCHEDULED",
    affectedServices: [] as string[],
    affectedRegions: [] as string[],
    scheduledStart: "",
    scheduledEnd: "",
    notifyBefore: 24,
  })

  const handleCreate = async () => {
    if (!formData.title || !formData.scheduledStart || !formData.scheduledEnd) {
      showErrorToast(t("validation.titleStartEndRequired"))
      return
    }

    if (new Date(formData.scheduledEnd) <= new Date(formData.scheduledStart)) {
      showErrorToast(t("validation.endAfterStart"))
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/operations/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          description: formData.description || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("toast.createFailed"))
      }

      const data = await response.json()
      showSuccessToast(t("toast.createSuccess"))
      router.push(`/admin/operations/maintenance/${data.window.id}`)
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

  const toggleRegion = (region: string) => {
    setFormData(prev => ({
      ...prev,
      affectedRegions: prev.affectedRegions.includes(region)
        ? prev.affectedRegions.filter(r => r !== region)
        : [...prev.affectedRegions, region],
    }))
  }

  const calculateDuration = () => {
    if (!formData.scheduledStart || !formData.scheduledEnd) return null
    const start = new Date(formData.scheduledStart)
    const end = new Date(formData.scheduledEnd)
    const diff = end.getTime() - start.getTime()
    if (diff <= 0) return null
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  const tDuration = useTranslations("admin.operations.maintenance.new")

  const duration = calculateDuration()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/operations/maintenance">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("back")}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wrench className="h-6 w-6 text-primary" />
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>
        <Button
          onClick={handleCreate}
          disabled={isSaving || !formData.title || !formData.scheduledStart || !formData.scheduledEnd}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("scheduling")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t("scheduleMaintenance")}
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t("sections.maintenanceDetails")}</CardTitle>
            <CardDescription>
              {t("sections.maintenanceDetailsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t("fields.title")} *</Label>
              <Input
                id="title"
                placeholder={t("placeholders.title")}
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("fields.description")}</Label>
              <Textarea
                id="description"
                placeholder={t("placeholders.description")}
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>{t("fields.type")}</Label>
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

        {/* Scheduling */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t("sections.schedule")}
            </CardTitle>
            <CardDescription>
              {t("sections.scheduleDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledStart">{t("fields.startTime")} *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="scheduledStart"
                    type="datetime-local"
                    className="pl-10"
                    value={formData.scheduledStart}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledStart: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledEnd">{t("fields.endTime")} *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="scheduledEnd"
                    type="datetime-local"
                    className="pl-10"
                    value={formData.scheduledEnd}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledEnd: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {duration && (
              <div className="p-3 rounded-md bg-muted">
                <p className="text-sm">
                  <span className="font-medium">{tCommon("duration")}:</span> {duration}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notifyBefore" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                {t("fields.notifyBefore")}
              </Label>
              <Input
                id="notifyBefore"
                type="number"
                min="1"
                max="168"
                value={formData.notifyBefore}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notifyBefore: parseInt(e.target.value) || 24,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                {t("hints.notifyBefore", { hours: formData.notifyBefore })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Affected Services */}
        <Card>
          <CardHeader>
            <CardTitle>{t("sections.affectedServices")}</CardTitle>
            <CardDescription>
              {t("sections.affectedServicesDescription")}
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
                {t("hints.selectServices")}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Affected Regions */}
        <Card>
          <CardHeader>
            <CardTitle>{t("sections.affectedRegions")}</CardTitle>
            <CardDescription>
              {t("sections.affectedRegionsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {regionOptions.map((region) => (
                <Badge
                  key={region}
                  variant={
                    formData.affectedRegions.includes(region)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => toggleRegion(region)}
                >
                  {region}
                </Badge>
              ))}
            </div>
            {formData.affectedRegions.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {t("hints.selectRegions")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
