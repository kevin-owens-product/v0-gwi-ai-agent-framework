"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Loader2,
  Edit,
  Save,
  X,
  Download,
  Building2,
  User,
  Gavel,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
  FileText,
  Calendar,
  HardDrive,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"

interface Organization {
  id: string
  name: string
  slug: string
}

interface DataUser {
  id: string
  name: string | null
  email: string
}

interface LegalHold {
  id: string
  name: string
  caseNumber: string | null
  status: string
}

interface DataExport {
  id: string
  type: string
  requestedBy: string
  orgId: string | null
  userId: string | null
  legalHoldId: string | null
  status: string
  scope: Record<string, unknown>
  format: string
  fileUrl: string | null
  fileSize: number | null
  expiresAt: string | null
  error: string | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  metadata: Record<string, unknown>
  organization: Organization | null
  user: DataUser | null
  requestedByUser: DataUser | null
  legalHold: LegalHold | null
}

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "EXPIRED", label: "Expired" },
]

export default function DataExportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const exportId = params.id as string

  const [dataExport, setDataExport] = useState<DataExport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    status: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  const fetchDataExport = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/compliance/data-exports/${exportId}`, {
        credentials: "include",
      })
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        throw new Error("Failed to fetch data export")
      }
      const data = await response.json()
      setDataExport(data.export)
      setEditForm({
        status: data.export.status,
      })
    } catch (error) {
      console.error("Failed to fetch data export:", error)
    } finally {
      setIsLoading(false)
    }
  }, [exportId])

  useEffect(() => {
    fetchDataExport()
  }, [fetchDataExport])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/compliance/data-exports/${exportId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editForm.status,
        }),
      })
      if (response.ok) {
        setIsEditing(false)
        fetchDataExport()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to update data export")
      }
    } catch (error) {
      console.error("Failed to update data export:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case "PROCESSING":
        return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" />Processing</Badge>
      case "PENDING":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "FAILED":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      case "EXPIRED":
        return <Badge variant="outline" className="text-muted-foreground">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "GDPR_EXPORT":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">GDPR</Badge>
      case "USER_DATA":
        return <Badge variant="outline">User Data</Badge>
      case "ORG_DATA":
        return <Badge variant="outline">Org Data</Badge>
      case "LEGAL_HOLD":
        return <Badge variant="outline" className="border-red-500 text-red-500">Legal Hold</Badge>
      case "BACKUP":
        return <Badge variant="outline" className="border-purple-500 text-purple-500">Backup</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
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

  if (!dataExport) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Data export not found</p>
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
            <Link href="/admin/compliance/data-exports">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Download className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Data Export
              {getTypeBadge(dataExport.type)}
            </h1>
            <p className="text-muted-foreground font-mono text-sm">
              {dataExport.id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(dataExport.status)}
          {dataExport.fileUrl && dataExport.status === "COMPLETED" && (
            <Button asChild>
              <a href={dataExport.fileUrl} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Download
                <ExternalLink className="h-3 w-3 ml-2" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {dataExport.status === "FAILED" && dataExport.error && (
        <Card className="border-l-4 border-l-red-500 bg-red-500/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium text-red-500">Export Failed</p>
                <p className="text-sm text-muted-foreground">{dataExport.error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expiry Warning */}
      {dataExport.expiresAt && new Date(dataExport.expiresAt) < new Date() && (
        <Card className="border-l-4 border-l-yellow-500 bg-yellow-500/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium text-yellow-500">Export Expired</p>
                <p className="text-sm text-muted-foreground">
                  This export expired on {new Date(dataExport.expiresAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scope">
            <FileText className="h-4 w-4 mr-1" />
            Scope
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {getStatusBadge(dataExport.status)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">File Size</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatFileSize(dataExport.fileSize)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Format</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold uppercase">{dataExport.format}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Type</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {getTypeBadge(dataExport.type)}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Export Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Export Details</CardTitle>
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
                      <Label>Status</Label>
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
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      {getStatusBadge(dataExport.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      {getTypeBadge(dataExport.type)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Format</span>
                      <Badge variant="outline" className="uppercase">{dataExport.format}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File Size</span>
                      <span className="font-medium">{formatFileSize(dataExport.fileSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Requested</span>
                      <span className="font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(dataExport.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {dataExport.startedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Started</span>
                        <span className="font-medium">
                          {new Date(dataExport.startedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {dataExport.completedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Completed</span>
                        <span className="font-medium">
                          {new Date(dataExport.completedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {dataExport.expiresAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expires</span>
                        <span className={`font-medium ${
                          new Date(dataExport.expiresAt) < new Date() ? "text-red-500" : ""
                        }`}>
                          {new Date(dataExport.expiresAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Subject & Requester */}
            <div className="space-y-6">
              {/* Requested By */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Requested By
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dataExport.requestedByUser ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium">
                          {dataExport.requestedByUser.name || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-medium">{dataExport.requestedByUser.email}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground">Unknown requester</p>
                  )}
                </CardContent>
              </Card>

              {/* Subject */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {dataExport.user ? (
                      <><User className="h-5 w-5" /> Subject User</>
                    ) : dataExport.organization ? (
                      <><Building2 className="h-5 w-5" /> Subject Organization</>
                    ) : dataExport.legalHold ? (
                      <><Gavel className="h-5 w-5" /> Legal Hold</>
                    ) : (
                      <><FileText className="h-5 w-5" /> Export Subject</>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dataExport.user ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium">{dataExport.user.name || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-medium">{dataExport.user.email}</span>
                      </div>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/admin/users/${dataExport.userId}`}>
                          View User
                        </Link>
                      </Button>
                    </>
                  ) : dataExport.organization ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium">{dataExport.organization.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Slug</span>
                        <span className="font-mono text-sm">{dataExport.organization.slug}</span>
                      </div>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/admin/tenants/${dataExport.orgId}`}>
                          View Organization
                        </Link>
                      </Button>
                    </>
                  ) : dataExport.legalHold ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hold Name</span>
                        <span className="font-medium">{dataExport.legalHold.name}</span>
                      </div>
                      {dataExport.legalHold.caseNumber && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Case Number</span>
                          <Badge variant="outline" className="font-mono">
                            {dataExport.legalHold.caseNumber}
                          </Badge>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={dataExport.legalHold.status === "ACTIVE" ? "destructive" : "secondary"}>
                          {dataExport.legalHold.status}
                        </Badge>
                      </div>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/admin/compliance/legal-holds/${dataExport.legalHoldId}`}>
                          View Legal Hold
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <p className="text-muted-foreground">No specific subject for this export</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scope">
          <Card>
            <CardHeader>
              <CardTitle>Export Scope</CardTitle>
              <CardDescription>Data types and parameters included in this export</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(dataExport.scope).length > 0 ? (
                <pre className="p-4 bg-muted rounded-lg overflow-auto text-sm">
                  {JSON.stringify(dataExport.scope, null, 2)}
                </pre>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No specific scope configuration defined - all relevant data included
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
