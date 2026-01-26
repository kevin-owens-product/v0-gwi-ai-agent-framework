"use client"

import { useState, useEffect, useCallback } from "react"
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
  CheckCircle,
  AlertTriangle,
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
        throw new Error("Failed to fetch framework")
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
  }, [frameworkId])

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
        setIsEditing(false)
        fetchFramework()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to update framework")
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
        return <Badge className="bg-green-500">Compliant</Badge>
      case "NON_COMPLIANT":
        return <Badge variant="destructive">Non-Compliant</Badge>
      case "IN_PROGRESS":
        return <Badge className="bg-blue-500">In Progress</Badge>
      case "COMPLETED":
        return <Badge className="bg-green-500">Completed</Badge>
      case "SCHEDULED":
        return <Badge variant="secondary">Scheduled</Badge>
      case "PENDING":
        return <Badge variant="secondary">Pending</Badge>
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
          Back
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Framework not found</p>
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
              Back
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
              {framework.version ? `Version ${framework.version}` : "Compliance Framework"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {framework.isActive ? (
            <Badge className="bg-green-500">Active</Badge>
          ) : (
            <Badge variant="secondary">Inactive</Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requirements">
            <ClipboardList className="h-4 w-4 mr-1" />
            Requirements ({framework.requirements.length})
          </TabsTrigger>
          <TabsTrigger value="attestations">
            <FileText className="h-4 w-4 mr-1" />
            Attestations ({framework._count.attestations})
          </TabsTrigger>
          <TabsTrigger value="audits">
            <Calendar className="h-4 w-4 mr-1" />
            Audits ({framework._count.audits})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attestations</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{framework._count.attestations}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Audits</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{framework._count.audits}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Requirements</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{framework.requirements.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Controls</CardTitle>
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
                <CardTitle>Framework Details</CardTitle>
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
                    <Label>Name</Label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Code</Label>
                      <Input
                        value={editForm.code}
                        onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Version</Label>
                      <Input
                        value={editForm.version}
                        onChange={(e) => setEditForm({ ...editForm, version: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
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
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{framework.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Code</span>
                    <Badge variant="outline">{framework.code}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Version</span>
                    <span className="font-medium">{framework.version || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    {framework.isActive ? (
                      <Badge className="bg-green-500">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">
                      {new Date(framework.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {framework.description && (
                    <div className="pt-2 border-t">
                      <span className="text-muted-foreground text-sm">Description</span>
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
              <CardTitle>Framework Requirements</CardTitle>
              <CardDescription>Compliance requirements for this framework</CardDescription>
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
                  No requirements defined for this framework
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attestations">
          <Card>
            <CardHeader>
              <CardTitle>Recent Attestations</CardTitle>
              <CardDescription>Organization compliance attestations</CardDescription>
            </CardHeader>
            <CardContent>
              {framework.attestations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Attested</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No attestations for this framework
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audits">
          <Card>
            <CardHeader>
              <CardTitle>Recent Audits</CardTitle>
              <CardDescription>Compliance audits for this framework</CardDescription>
            </CardHeader>
            <CardContent>
              {framework.audits.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No audits for this framework
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
