"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Shield,
  Loader2,
  Edit,
  Save,
  X,
  FileText,
  Calendar,
  Building2,
  ClipboardList,
} from "lucide-react"
import Link from "next/link"

interface Attestation {
  id: string
  orgId: string
  status: string
  score: number | null
  attestedAt: string | null
  createdAt: string
}

interface Audit {
  id: string
  orgId: string | null
  type: string
  status: string
  scheduledDate: string
  score: number | null
}

interface Framework {
  id: string
  name: string
  code: string
  description: string | null
  version: string | null
  requirements: unknown[]
  controls: unknown[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  metadata: Record<string, unknown>
  attestations: Attestation[]
  audits: Audit[]
  _count: {
    attestations: number
    audits: number
  }
}

export default function FrameworkDetailPage() {
  const params = useParams()
  const router = useRouter()
  const frameworkId = params.id as string
  const t = useTranslations('admin.compliance.frameworks.detail')
  const tFrameworks = useTranslations('admin.compliance.frameworks')
  const tCommon = useTranslations('common')

  const [framework, setFramework] = useState<Framework | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    code: "",
    description: "",
    version: "",
    isActive: true,
  })
  const [isSaving, setIsSaving] = useState(false)

  const fetchFramework = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/compliance/frameworks/${frameworkId}`, {
        credentials: "include",
      })
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        throw new Error(t("errors.fetchFailed"))
      }
      const data = await response.json()
      setFramework(data.framework)
      setEditForm({
        name: data.framework.name,
        code: data.framework.code,
        description: data.framework.description || "",
        version: data.framework.version || "",
        isActive: data.framework.isActive,
      })
    } catch (error) {
      console.error("Failed to fetch framework:", error)
    } finally {
      setIsLoading(false)
    }
  }, [frameworkId, t])

  useEffect(() => {
    fetchFramework()
  }, [fetchFramework])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/compliance/frameworks/${frameworkId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (response.ok) {
        toast.success(t("messages.frameworkUpdated"))
        setIsEditing(false)
        fetchFramework()
      } else {
        const data = await response.json()
        toast.error(data.error || t("errors.updateFailed"))
      }
    } catch (error) {
      console.error("Failed to update framework:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLIANT":
        return <Badge className="bg-green-500">{tCommon('statuses.compliant')}</Badge>
      case "NON_COMPLIANT":
        return <Badge variant="destructive">{tCommon('statuses.nonCompliant')}</Badge>
      case "IN_PROGRESS":
        return <Badge className="bg-blue-500">{tCommon('statuses.inProgress')}</Badge>
      case "COMPLETED":
        return <Badge className="bg-green-500">{tCommon('completed')}</Badge>
      case "SCHEDULED":
        return <Badge variant="secondary">{tCommon('statuses.scheduled')}</Badge>
      case "PENDING":
        return <Badge variant="secondary">{tCommon('pending')}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!framework) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {tCommon('back')}
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">{tCommon('errors.frameworkNotFound')}</p>
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
            <Link href="/admin/compliance/frameworks">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon('back')}
            </Link>
          </Button>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {framework.name}
              <Badge variant="outline">{framework.code}</Badge>
            </h1>
            <p className="text-muted-foreground">
              {framework.version ? `${t("version")} ${framework.version}` : t("complianceFramework")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {framework.isActive ? (
            <Badge className="bg-green-500">{tCommon('active')}</Badge>
          ) : (
            <Badge variant="secondary">{tCommon('inactive')}</Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="requirements">
            <ClipboardList className="h-4 w-4 mr-1" />
            {t("tabs.requirements")} ({framework.requirements.length})
          </TabsTrigger>
          <TabsTrigger value="attestations">
            <FileText className="h-4 w-4 mr-1" />
            {t("tabs.attestations")} ({framework._count.attestations})
          </TabsTrigger>
          <TabsTrigger value="audits">
            <Calendar className="h-4 w-4 mr-1" />
            {t("tabs.audits")} ({framework._count.audits})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("stats.attestations")}</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{framework._count.attestations}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("stats.audits")}</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{framework._count.audits}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("stats.requirements")}</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{framework.requirements.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("stats.controls")}</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{framework.controls.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Framework Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t("sections.frameworkDetails")}</CardTitle>
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
                    <Label>{t("fields.name")}</Label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("fields.code")}</Label>
                      <Input
                        value={editForm.code}
                        onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("fields.version")}</Label>
                      <Input
                        value={editForm.version}
                        onChange={(e) => setEditForm({ ...editForm, version: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("fields.description")}</Label>
                    <Textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("fields.name")}</span>
                    <span className="font-medium">{framework.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("fields.code")}</span>
                    <Badge variant="outline">{framework.code}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("fields.version")}</span>
                    <span className="font-medium">{framework.version || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("fields.status")}</span>
                    {framework.isActive ? (
                      <Badge className="bg-green-500">{tFrameworks("status.active")}</Badge>
                    ) : (
                      <Badge variant="secondary">{tFrameworks("status.inactive")}</Badge>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("fields.created")}</span>
                    <span className="font-medium">
                      {new Date(framework.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {framework.description && (
                    <div className="pt-2 border-t">
                      <span className="text-muted-foreground text-sm">{t("fields.description")}</span>
                      <p className="mt-1">{framework.description}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements">
          <Card>
            <CardHeader>
              <CardTitle>{t("sections.requirements")}</CardTitle>
              <CardDescription>{t("sections.requirementsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {framework.requirements.length > 0 ? (
                <div className="space-y-3">
                  {framework.requirements.map((req, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <pre className="text-sm overflow-auto">
                        {JSON.stringify(req, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {t("empty.noRequirements")}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attestations">
          <Card>
            <CardHeader>
              <CardTitle>{t("sections.recentAttestations")}</CardTitle>
              <CardDescription>{t("sections.attestationsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {framework.attestations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("table.organization")}</TableHead>
                      <TableHead>{t("table.status")}</TableHead>
                      <TableHead>{t("table.score")}</TableHead>
                      <TableHead>{t("table.attested")}</TableHead>
                      <TableHead className="text-right">{t("table.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {framework.attestations.map((attestation) => (
                      <TableRow key={attestation.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-xs">{attestation.orgId.slice(0, 8)}...</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(attestation.status)}</TableCell>
                        <TableCell>
                          {attestation.score !== null ? (
                            <span className={attestation.score >= 80 ? "text-green-500" : attestation.score >= 60 ? "text-yellow-500" : "text-red-500"}>
                              {attestation.score}%
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {attestation.attestedAt
                            ? new Date(attestation.attestedAt).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/compliance/attestations/${attestation.id}`}>
                              {t("table.view")}
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {t("empty.noAttestations")}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audits">
          <Card>
            <CardHeader>
              <CardTitle>{t("sections.recentAudits")}</CardTitle>
              <CardDescription>{t("sections.auditsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {framework.audits.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("table.type")}</TableHead>
                      <TableHead>{t("table.status")}</TableHead>
                      <TableHead>{t("table.scheduled")}</TableHead>
                      <TableHead>{t("table.score")}</TableHead>
                      <TableHead className="text-right">{t("table.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {framework.audits.map((audit) => (
                      <TableRow key={audit.id}>
                        <TableCell>
                          <Badge variant="outline">{audit.type}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(audit.status)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(audit.scheduledDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {audit.score !== null ? (
                            <span className={audit.score >= 80 ? "text-green-500" : audit.score >= 60 ? "text-yellow-500" : "text-red-500"}>
                              {audit.score}%
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/compliance/audits/${audit.id}`}>
                              {tCommon('viewDetails')}
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {t("empty.noAudits")}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
