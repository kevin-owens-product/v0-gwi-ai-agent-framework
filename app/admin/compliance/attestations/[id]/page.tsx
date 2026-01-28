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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Loader2,
  Edit,
  Save,
  X,
  FileText,
  Shield,
  Building2,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileCheck,
} from "lucide-react"
import Link from "next/link"

interface Framework {
  id: string
  name: string
  code: string
  description: string | null
  version: string | null
  requirements: unknown[]
  controls: unknown[]
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

interface Evidence {
  id?: string
  name: string
  type: string
  url?: string
  uploadedAt?: string
}

interface Attestation {
  id: string
  frameworkId: string
  orgId: string
  status: string
  score: number | null
  findings: Finding[]
  evidence: Evidence[]
  attestedBy: string | null
  attestedAt: string | null
  validUntil: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  metadata: Record<string, unknown>
  framework: Framework
  organization: Organization | null
}

export default function AttestationDetailPage() {
  const t = useTranslations("admin.compliance")
  const tCommon = useTranslations("common")
  const params = useParams()
  const router = useRouter()
  const attestationId = params.id as string

  const [attestation, setAttestation] = useState<Attestation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    status: "",
    score: "",
    notes: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  const STATUS_OPTIONS = [
    { value: "NOT_STARTED", label: t("attestations.status.notStarted") },
    { value: "IN_PROGRESS", label: t("attestations.status.inProgress") },
    { value: "COMPLIANT", label: t("attestations.status.compliant") },
    { value: "NON_COMPLIANT", label: t("attestations.status.nonCompliant") },
    { value: "EXPIRED", label: t("attestations.status.expired") },
  ]

  const fetchAttestation = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/compliance/attestations/${attestationId}`, {
        credentials: "include",
      })
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        throw new Error(t("attestations.errors.fetchFailed"))
      }
      const data = await response.json()
      setAttestation(data.attestation)
      setEditForm({
        status: data.attestation.status,
        score: data.attestation.score?.toString() || "",
        notes: data.attestation.notes || "",
      })
    } catch (error) {
      console.error("Failed to fetch attestation:", error)
    } finally {
      setIsLoading(false)
    }
  }, [attestationId, t])

  useEffect(() => {
    fetchAttestation()
  }, [fetchAttestation])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/compliance/attestations/${attestationId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editForm.status,
          score: editForm.score ? parseInt(editForm.score) : null,
          notes: editForm.notes || null,
        }),
      })
      if (response.ok) {
        setIsEditing(false)
        fetchAttestation()
      } else {
        const data = await response.json()
        toast.error(data.error || t("attestations.errors.updateFailed"))
      }
    } catch (error) {
      console.error("Failed to update attestation:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLIANT":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />{t("attestations.status.compliant")}</Badge>
      case "NON_COMPLIANT":
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />{t("attestations.status.nonCompliant")}</Badge>
      case "IN_PROGRESS":
        return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" />{t("attestations.status.inProgress")}</Badge>
      case "NOT_STARTED":
        return <Badge variant="secondary">{t("attestations.status.notStarted")}</Badge>
      case "EXPIRED":
        return <Badge variant="outline" className="text-orange-500 border-orange-500">{t("attestations.status.expired")}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!attestation) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {tCommon("back")}
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">{t("attestations.notFound")}</p>
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
            <Link href="/admin/compliance/attestations">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon("back")}
            </Link>
          </Button>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {attestation.organization?.name || t("attestations.unknownOrganization")}
              <Badge variant="outline">{attestation.framework.code}</Badge>
            </h1>
            <p className="text-muted-foreground">
              {t("attestations.detail.frameworkAttestation", { framework: attestation.framework.name })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(attestation.status)}
        </div>
      </div>

      {/* Score Banner */}
      {attestation.score !== null && (
        <Card className={`border-l-4 ${
          attestation.score >= 90 ? "border-l-green-500 bg-green-500/5" :
          attestation.score >= 70 ? "border-l-yellow-500 bg-yellow-500/5" :
          "border-l-red-500 bg-red-500/5"
        }`}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("attestations.detail.complianceScore")}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className={`text-4xl font-bold ${
                    attestation.score >= 90 ? "text-green-500" :
                    attestation.score >= 70 ? "text-yellow-500" :
                    "text-red-500"
                  }`}>
                    {attestation.score}%
                  </span>
                  {attestation.score >= 90 ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-8 w-8 text-yellow-500" />
                  )}
                </div>
              </div>
              <div className="w-64">
                <Progress value={attestation.score} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="findings">
            <AlertTriangle className="h-4 w-4 mr-1" />
            {t("attestations.tabs.findings")} ({attestation.findings.length})
          </TabsTrigger>
          <TabsTrigger value="evidence">
            <FileCheck className="h-4 w-4 mr-1" />
            {t("attestations.tabs.evidence")} ({attestation.evidence.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Attestation Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("attestations.detail.attestationDetails")}</CardTitle>
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
                    <div className="space-y-2">
                      <Label>{t("attestations.fields.status")}</Label>
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
                      <Label>{t("attestations.fields.scorePercent")}</Label>
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
                      <Label>{t("attestations.fields.notes")}</Label>
                      <Textarea
                        value={editForm.notes}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("attestations.fields.status")}</span>
                      {getStatusBadge(attestation.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("attestations.fields.score")}</span>
                      <span className="font-bold">
                        {attestation.score !== null ? `${attestation.score}%` : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("attestations.fields.attestedBy")}</span>
                      <span className="font-medium">{attestation.attestedBy || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("attestations.fields.attestedDate")}</span>
                      <span className="font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {attestation.attestedAt
                          ? new Date(attestation.attestedAt).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("attestations.fields.validUntil")}</span>
                      <span className="font-medium">
                        {attestation.validUntil
                          ? new Date(attestation.validUntil).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>
                    {attestation.notes && (
                      <div className="pt-2 border-t">
                        <span className="text-muted-foreground text-sm">{t("attestations.fields.notes")}</span>
                        <p className="mt-1">{attestation.notes}</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Organization & Framework */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {t("attestations.detail.organization")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("fields.name")}</span>
                    <span className="font-medium">
                      {attestation.organization?.name || t("attestations.unknown")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("fields.slug")}</span>
                    <span className="font-mono text-sm">
                      {attestation.organization?.slug || "-"}
                    </span>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/admin/tenants/${attestation.orgId}`}>
                      {t("attestations.actions.viewOrganization")}
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {t("attestations.detail.framework")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("fields.name")}</span>
                    <span className="font-medium">{attestation.framework.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("fields.code")}</span>
                    <Badge variant="outline">{attestation.framework.code}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("fields.version")}</span>
                    <span className="font-medium">{attestation.framework.version || "-"}</span>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/admin/compliance/frameworks/${attestation.frameworkId}`}>
                      {t("attestations.actions.viewFramework")}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="findings">
          <Card>
            <CardHeader>
              <CardTitle>{t("attestations.detail.complianceFindings")}</CardTitle>
              <CardDescription>{t("attestations.detail.complianceFindingsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {attestation.findings.length > 0 ? (
                <div className="space-y-4">
                  {attestation.findings.map((finding, index) => (
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
                  {t("attestations.detail.noFindings")}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence">
          <Card>
            <CardHeader>
              <CardTitle>{t("attestations.detail.evidenceDocuments")}</CardTitle>
              <CardDescription>{t("attestations.detail.evidenceDocumentsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {attestation.evidence.length > 0 ? (
                <div className="space-y-3">
                  {attestation.evidence.map((doc, index) => (
                    <div key={doc.id || index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileCheck className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.type}
                            {doc.uploadedAt && ` - ${t("attestations.detail.uploaded")} ${new Date(doc.uploadedAt).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      {doc.url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            {tCommon("view")}
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {t("attestations.detail.noEvidence")}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
