"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { useParams, useRouter } from "next/navigation"
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
  Gavel,
  Building2,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Users,
  Download,
  User,
  Mail,
  FileText,
} from "lucide-react"
import Link from "next/link"

interface Organization {
  id: string
  name: string
  slug: string
}

interface CustodianDetail {
  id: string
  name: string | null
  email: string
}

interface DataExport {
  id: string
  type: string
  status: string
  format: string
  createdAt: string
  fileSize: number | null
}

interface LegalHold {
  id: string
  name: string
  description: string | null
  caseNumber: string | null
  orgId: string | null
  custodians: string[]
  startDate: string
  endDate: string | null
  status: string
  scope: Record<string, unknown>
  notes: string | null
  createdBy: string
  releasedBy: string | null
  releasedAt: string | null
  createdAt: string
  updatedAt: string
  metadata: Record<string, unknown>
  organization: Organization | null
  custodianDetails: CustodianDetail[]
  exports: DataExport[]
}

export default function LegalHoldDetailPage() {
  const params = useParams()
  const router = useRouter()
  const holdId = params.id as string
  const t = useTranslations("admin.compliance.legalHolds.detail")
  const tCommon = useTranslations("common")
  
  const STATUS_OPTIONS = [
    { value: "ACTIVE", label: t("statuses.active") },
    { value: "RELEASED", label: t("statuses.released") },
    { value: "EXPIRED", label: t("statuses.expired") },
  ]

  const [legalHold, setLegalHold] = useState<LegalHold | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    caseNumber: "",
    status: "",
    notes: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  const fetchLegalHold = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/compliance/legal-holds/${holdId}`, {
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
      setLegalHold(data.legalHold)
      setEditForm({
        name: data.legalHold.name,
        description: data.legalHold.description || "",
        caseNumber: data.legalHold.caseNumber || "",
        status: data.legalHold.status,
        notes: data.legalHold.notes || "",
      })
    } catch (error) {
      console.error("Failed to fetch legal hold:", error)
    } finally {
      setIsLoading(false)
    }
  }, [holdId, t])

  useEffect(() => {
    fetchLegalHold()
  }, [fetchLegalHold])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/compliance/legal-holds/${holdId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description || null,
          caseNumber: editForm.caseNumber || null,
          status: editForm.status,
          notes: editForm.notes || null,
        }),
      })
      if (response.ok) {
        toast.success(t("messages.legalHoldUpdated"))
        setIsEditing(false)
        fetchLegalHold()
      } else {
        const data = await response.json()
        toast.error(data.error || t("errors.updateFailed"))
      }
    } catch (error) {
      console.error("Failed to update legal hold:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />{t("statuses.active")}</Badge>
      case "RELEASED":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />{t("statuses.released")}</Badge>
      case "EXPIRED":
        return <Badge variant="secondary">{t("statuses.expired")}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getExportStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-500">{t("statuses.completed")}</Badge>
      case "PROCESSING":
        return <Badge className="bg-blue-500">{t("statuses.processing")}</Badge>
      case "PENDING":
        return <Badge variant="secondary">{t("statuses.pending")}</Badge>
      case "FAILED":
        return <Badge variant="destructive">{t("statuses.failed")}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (bytes === null) return "-"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!legalHold) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("back")}
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">{t("notFound")}</p>
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
            <Link href="/admin/compliance/legal-holds">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("back")}
            </Link>
          </Button>
          <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
            <Gavel className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {legalHold.name}
              {legalHold.caseNumber && (
                <Badge variant="outline" className="font-mono">
                  {legalHold.caseNumber}
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">
              {t("legalHold")} - {t("started")} {new Date(legalHold.startDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(legalHold.status)}
        </div>
      </div>

      {/* Alert Banner for Active Holds */}
      {legalHold.status === "ACTIVE" && (
        <Card className="border-l-4 border-l-red-500 bg-red-500/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium text-red-500">{t("activeBanner.title")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("activeBanner.description")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="custodians">
            <Users className="h-4 w-4 mr-1" />
            {t("tabs.custodians")} ({legalHold.custodianDetails.length})
          </TabsTrigger>
          <TabsTrigger value="exports">
            <Download className="h-4 w-4 mr-1" />
            {t("tabs.exports")} ({legalHold.exports.length})
          </TabsTrigger>
          <TabsTrigger value="scope">
            <FileText className="h-4 w-4 mr-1" />
            {t("tabs.scope")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("stats.status")}</CardTitle>
                <Gavel className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {getStatusBadge(legalHold.status)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("stats.custodians")}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{legalHold.custodianDetails.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("stats.dataExports")}</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{legalHold.exports.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("stats.duration")}</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.ceil((Date.now() - new Date(legalHold.startDate).getTime()) / (1000 * 60 * 60 * 24))} {t("stats.days")}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Hold Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("sections.legalHoldDetails")}</CardTitle>
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
                        <Label>{t("fields.caseNumber")}</Label>
                        <Input
                          value={editForm.caseNumber}
                          onChange={(e) => setEditForm({ ...editForm, caseNumber: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("fields.status")}</Label>
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
                    </div>
                    <div className="space-y-2">
                      <Label>{t("fields.description")}</Label>
                      <Textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("fields.notes")}</Label>
                      <Textarea
                        value={editForm.notes}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        rows={2}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("fields.name")}</span>
                      <span className="font-medium">{legalHold.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("fields.caseNumber")}</span>
                      {legalHold.caseNumber ? (
                        <Badge variant="outline" className="font-mono">
                          {legalHold.caseNumber}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("fields.status")}</span>
                      {getStatusBadge(legalHold.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("fields.startDate")}</span>
                      <span className="font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(legalHold.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    {legalHold.endDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("fields.endDate")}</span>
                        <span className="font-medium">
                          {new Date(legalHold.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {legalHold.releasedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("fields.released")}</span>
                        <span className="font-medium">
                          {new Date(legalHold.releasedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {legalHold.description && (
                      <div className="pt-2 border-t">
                        <span className="text-muted-foreground text-sm">{t("fields.description")}</span>
                        <p className="mt-1">{legalHold.description}</p>
                      </div>
                    )}
                    {legalHold.notes && (
                      <div className="pt-2 border-t">
                        <span className="text-muted-foreground text-sm">{t("fields.notes")}</span>
                        <p className="mt-1">{legalHold.notes}</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Organization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {t("sections.organization")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {legalHold.organization ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("fields.organizationName")}</span>
                      <span className="font-medium">{legalHold.organization.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("fields.slug")}</span>
                      <span className="font-mono text-sm">{legalHold.organization.slug}</span>
                    </div>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/admin/tenants/${legalHold.orgId}`}>
                        {t("actions.viewOrganization")}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    {t("empty.platformWide")}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="custodians">
          <Card>
            <CardHeader>
              <CardTitle>{t("sections.custodians")}</CardTitle>
              <CardDescription>{t("sections.custodiansDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {legalHold.custodianDetails.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("table.user")}</TableHead>
                      <TableHead>{t("table.email")}</TableHead>
                      <TableHead className="text-right">{t("table.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {legalHold.custodianDetails.map((custodian) => (
                      <TableRow key={custodian.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{custodian.name || tCommon("unknown")}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{custodian.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/users/${custodian.id}`}>
                              {t("table.viewUser")}
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {t("empty.noCustodians")}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exports">
          <Card>
            <CardHeader>
              <CardTitle>{t("sections.dataExports")}</CardTitle>
              <CardDescription>{t("sections.exportsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {legalHold.exports.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("table.type")}</TableHead>
                      <TableHead>{t("table.status")}</TableHead>
                      <TableHead>{t("table.format")}</TableHead>
                      <TableHead>{t("table.size")}</TableHead>
                      <TableHead>{t("table.created")}</TableHead>
                      <TableHead className="text-right">{t("table.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {legalHold.exports.map((exp) => (
                      <TableRow key={exp.id}>
                        <TableCell>
                          <Badge variant="outline">{exp.type}</Badge>
                        </TableCell>
                        <TableCell>{getExportStatusBadge(exp.status)}</TableCell>
                        <TableCell className="text-muted-foreground uppercase">
                          {exp.format}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatFileSize(exp.fileSize)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(exp.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/compliance/data-exports/${exp.id}`}>
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
                  {t("empty.noExports")}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scope">
          <Card>
            <CardHeader>
              <CardTitle>{t("sections.scopeConfiguration")}</CardTitle>
              <CardDescription>{t("sections.scopeDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(legalHold.scope).length > 0 ? (
                <pre className="p-4 bg-muted rounded-lg overflow-auto text-sm">
                  {JSON.stringify(legalHold.scope, null, 2)}
                </pre>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {t("empty.noScope")}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
