"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Loader2,
  Edit,
  Save,
  X,
  FileSearch,
  Shield,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  PlayCircle,
  AlertTriangle,
  FileText,
  ExternalLink,
  Lightbulb,
} from "lucide-react"
import Link from "next/link"

interface Framework {
  id: string
  name: string
  code: string
  description: string | null
  version: string | null
}

interface Organization {
  id: string
  name: string
  slug: string
}

interface Finding {
  id?: string
  title: string
  severity: string
  description: string
  status: string
}

interface Recommendation {
  id?: string
  title: string
  priority: string
  description: string
  status: string
}

interface Audit {
  id: string
  frameworkId: string
  orgId: string | null
  type: string
  status: string
  scheduledDate: string
  startedAt: string | null
  completedAt: string | null
  auditor: string | null
  score: number | null
  findings: Finding[]
  recommendations: Recommendation[]
  reportUrl: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  metadata: Record<string, unknown>
  framework: Framework
  organization: Organization | null
}

export default function AuditDetailPage() {
  const t = useTranslations("admin.compliance")
  const tCommon = useTranslations("common")
  const params = useParams()
  const router = useRouter()
  const auditId = params.id as string

  const [audit, setAudit] = useState<Audit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    status: "",
    type: "",
    score: "",
    auditor: "",
    reportUrl: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  const STATUS_OPTIONS = [
    { value: "SCHEDULED", label: t("audits.status.scheduled") },
    { value: "IN_PROGRESS", label: t("audits.status.inProgress") },
    { value: "COMPLETED", label: t("audits.status.completed") },
    { value: "CANCELLED", label: t("audits.status.cancelled") },
  ]

  const TYPE_OPTIONS = [
    { value: "INTERNAL", label: t("audits.types.internal") },
    { value: "EXTERNAL", label: t("audits.types.external") },
    { value: "SELF_ASSESSMENT", label: t("audits.types.selfAssessment") },
    { value: "CERTIFICATION", label: t("audits.types.certification") },
  ]

  const fetchAudit = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/compliance/audits/${auditId}`, {
        credentials: "include",
      })
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        throw new Error(t("audits.errors.fetchFailed"))
      }
      const data = await response.json()
      setAudit(data.audit)
      setEditForm({
        status: data.audit.status,
        type: data.audit.type,
        score: data.audit.score?.toString() || "",
        auditor: data.audit.auditor || "",
        reportUrl: data.audit.reportUrl || "",
      })
    } catch (error) {
      console.error("Failed to fetch audit:", error)
    } finally {
      setIsLoading(false)
    }
  }, [auditId, t])

  useEffect(() => {
    fetchAudit()
  }, [fetchAudit])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/compliance/audits/${auditId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editForm.status,
          type: editForm.type,
          score: editForm.score ? parseInt(editForm.score) : null,
          auditor: editForm.auditor || null,
          reportUrl: editForm.reportUrl || null,
        }),
      })
      if (response.ok) {
        setIsEditing(false)
        fetchAudit()
      } else {
        const data = await response.json()
        toast.error(data.error || t("audits.errors.updateFailed"))
      }
    } catch (error) {
      console.error("Failed to update audit:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />{t("audits.status.completed")}</Badge>
      case "IN_PROGRESS":
        return <Badge className="bg-blue-500"><PlayCircle className="h-3 w-3 mr-1" />{t("audits.status.inProgress")}</Badge>
      case "SCHEDULED":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />{t("audits.status.scheduled")}</Badge>
      case "CANCELLED":
        return <Badge variant="outline" className="text-muted-foreground">{t("audits.status.cancelled")}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "INTERNAL":
        return <Badge variant="outline">{t("audits.types.internal")}</Badge>
      case "EXTERNAL":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">{t("audits.types.external")}</Badge>
      case "SELF_ASSESSMENT":
        return <Badge variant="outline" className="border-purple-500 text-purple-500">{t("audits.types.selfAssessment")}</Badge>
      case "CERTIFICATION":
        return <Badge variant="outline" className="border-green-500 text-green-500">{t("audits.types.certification")}</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return <Badge variant="destructive">{t("severity.critical")}</Badge>
      case "high":
        return <Badge className="bg-orange-500">{t("severity.high")}</Badge>
      case "medium":
        return <Badge className="bg-yellow-500">{t("severity.medium")}</Badge>
      case "low":
        return <Badge variant="secondary">{t("severity.low")}</Badge>
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "critical":
        return <Badge variant="destructive">{t("priority.critical")}</Badge>
      case "high":
        return <Badge className="bg-orange-500">{t("priority.high")}</Badge>
      case "medium":
        return <Badge className="bg-yellow-500">{t("priority.medium")}</Badge>
      case "low":
        return <Badge variant="secondary">{t("priority.low")}</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!audit) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {tCommon("back")}
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">{t("audits.notFound")}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/compliance/audits">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon("back")}
            </Link>
          </Button>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileSearch className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {t("audits.detail.frameworkAudit", { framework: audit.framework.name })}
              {getTypeBadge(audit.type)}
            </h1>
            <p className="text-muted-foreground">
              {t("audits.detail.scheduledFor", { date: new Date(audit.scheduledDate).toLocaleDateString() })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(audit.status)}
        </div>
      </div>

      {/* Score Banner */}
      {audit.status === "COMPLETED" && audit.score !== null && (
        <Card className={`border-l-4 ${
          audit.score >= 80 ? "border-l-green-500 bg-green-500/5" :
          audit.score >= 60 ? "border-l-yellow-500 bg-yellow-500/5" :
          "border-l-red-500 bg-red-500/5"
        }`}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("audits.detail.auditScore")}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className={`text-4xl font-bold ${
                    audit.score >= 80 ? "text-green-500" :
                    audit.score >= 60 ? "text-yellow-500" :
                    "text-red-500"
                  }`}>
                    {audit.score}%
                  </span>
                  {audit.score >= 80 ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-8 w-8 text-yellow-500" />
                  )}
                </div>
              </div>
              {audit.reportUrl && (
                <Button variant="outline" asChild>
                  <a href={audit.reportUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-4 w-4 mr-2" />
                    {t("audits.detail.viewReport")}
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="findings">
            <AlertTriangle className="h-4 w-4 mr-1" />
            {t("audits.tabs.findings")} ({audit.findings.length})
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Lightbulb className="h-4 w-4 mr-1" />
            {t("audits.tabs.recommendations")} ({audit.recommendations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Audit Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("audits.detail.auditDetails")}</CardTitle>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("audits.fields.status")}</Label>
                        <Select
                          value={editForm.status}
                          onValueChange={(value) => setEditForm({ ...editForm, status: value })}
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
                        <Label>{t("audits.fields.type")}</Label>
                        <Select
                          value={editForm.type}
                          onValueChange={(value) => setEditForm({ ...editForm, type: value })}
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
                    </div>
                    <div className="space-y-2">
                      <Label>{t("audits.fields.scorePercent")}</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={editForm.score}
                        onChange={(e) => setEditForm({ ...editForm, score: e.target.value })}
                        placeholder="0-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("audits.fields.auditor")}</Label>
                      <Input
                        value={editForm.auditor}
                        onChange={(e) => setEditForm({ ...editForm, auditor: e.target.value })}
                        placeholder={t("audits.dialog.auditorPlaceholder")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("audits.fields.reportUrl")}</Label>
                      <Input
                        value={editForm.reportUrl}
                        onChange={(e) => setEditForm({ ...editForm, reportUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("audits.fields.status")}</span>
                      {getStatusBadge(audit.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("audits.fields.type")}</span>
                      {getTypeBadge(audit.type)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("audits.fields.score")}</span>
                      <span className="font-bold">
                        {audit.score !== null ? `${audit.score}%` : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("audits.fields.auditor")}</span>
                      <span className="font-medium">{audit.auditor || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("audits.fields.scheduled")}</span>
                      <span className="font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(audit.scheduledDate).toLocaleDateString()}
                      </span>
                    </div>
                    {audit.startedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("audits.fields.started")}</span>
                        <span className="font-medium">
                          {new Date(audit.startedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {audit.completedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("audits.fields.completed")}</span>
                        <span className="font-medium">
                          {new Date(audit.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Framework & Organization */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {t("audits.detail.framework")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("fields.name")}</span>
                    <span className="font-medium">{audit.framework.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("fields.code")}</span>
                    <Badge variant="outline">{audit.framework.code}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("fields.version")}</span>
                    <span className="font-medium">{audit.framework.version || "-"}</span>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/admin/compliance/frameworks/${audit.frameworkId}`}>
                      {t("audits.actions.viewFramework")}
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {audit.organization ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {t("audits.detail.organization")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("fields.name")}</span>
                      <span className="font-medium">{audit.organization.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("fields.slug")}</span>
                      <span className="font-mono text-sm">{audit.organization.slug}</span>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/admin/tenants/${audit.orgId}`}>
                        {t("audits.actions.viewOrganization")}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {t("audits.detail.scope")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {t("audits.detail.platformWideAudit")}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="findings">
          <Card>
            <CardHeader>
              <CardTitle>{t("audits.detail.auditFindings")}</CardTitle>
              <CardDescription>{t("audits.detail.auditFindingsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {audit.findings.length > 0 ? (
                <div className="space-y-4">
                  {audit.findings.map((finding, index) => (
                    <div key={finding.id || index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{finding.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {finding.description}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {getSeverityBadge(finding.severity)}
                          <Badge variant="outline">{finding.status}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {t("audits.detail.noFindings")}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>{t("audits.detail.recommendations")}</CardTitle>
              <CardDescription>{t("audits.detail.recommendationsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {audit.recommendations.length > 0 ? (
                <div className="space-y-4">
                  {audit.recommendations.map((rec, index) => (
                    <div key={rec.id || index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                            {rec.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {rec.description}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {getPriorityBadge(rec.priority)}
                          <Badge variant="outline">{rec.status}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {t("audits.detail.noRecommendations")}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
