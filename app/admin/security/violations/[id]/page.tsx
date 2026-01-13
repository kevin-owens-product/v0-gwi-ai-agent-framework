"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowLeft,
  Shield,
  Clock,
  User,
  Globe,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building,
  Monitor,
  Save,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface SecurityViolation {
  id: string
  policyId: string
  orgId: string | null
  userId: string | null
  violationType: string
  severity: string
  description: string
  details: Record<string, unknown>
  ipAddress: string | null
  userAgent: string | null
  resourceType: string | null
  resourceId: string | null
  status: string
  resolvedBy: string | null
  resolvedAt: string | null
  resolution: string | null
  createdAt: string
  policy: {
    id: string
    name: string
    type: string
    scope: string
    enforcementMode: string
  }
}

const statuses = [
  { value: "OPEN", label: "Open" },
  { value: "INVESTIGATING", label: "Investigating" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "FALSE_POSITIVE", label: "False Positive" },
  { value: "ESCALATED", label: "Escalated" },
]

export default function ViolationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [violation, setViolation] = useState<SecurityViolation | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState("")
  const [resolution, setResolution] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchViolation()
    }
  }, [params.id])

  const fetchViolation = async () => {
    try {
      const response = await fetch(`/api/admin/security/violations/${params.id}`)
      if (!response.ok) {
        throw new Error("Violation not found")
      }
      const data = await response.json()
      setViolation(data.violation)
      setStatus(data.violation.status)
      setResolution(data.violation.resolution || "")
    } catch (error) {
      console.error("Failed to fetch violation:", error)
      toast.error("Failed to fetch violation details")
      router.push("/admin/security/violations")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!violation) return

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/security/violations/${violation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          resolution: resolution || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update violation")
      }

      toast.success("Violation updated successfully")
      fetchViolation()
    } catch (error) {
      toast.error("Failed to update violation")
    } finally {
      setSaving(false)
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <Badge variant="destructive" className="text-lg px-3 py-1">{severity}</Badge>
      case "WARNING":
        return <Badge variant="default" className="bg-yellow-500 text-lg px-3 py-1">{severity}</Badge>
      case "INFO":
        return <Badge variant="secondary" className="text-lg px-3 py-1">{severity}</Badge>
      default:
        return <Badge variant="outline" className="text-lg px-3 py-1">{severity}</Badge>
    }
  }

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "OPEN":
        return <Badge variant="destructive">{s}</Badge>
      case "INVESTIGATING":
        return <Badge variant="default" className="bg-blue-500">{s}</Badge>
      case "RESOLVED":
        return <Badge variant="default" className="bg-green-500">{s}</Badge>
      case "FALSE_POSITIVE":
        return <Badge variant="secondary">{s.replace("_", " ")}</Badge>
      case "ESCALATED":
        return <Badge variant="destructive" className="bg-purple-500">{s}</Badge>
      default:
        return <Badge variant="outline">{s}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (!violation) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Violation not found</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/admin/security/violations")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Violations
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/admin/security/violations")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              Security Violation
            </h1>
            <p className="text-sm text-muted-foreground">ID: {violation.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getSeverityBadge(violation.severity)}
          {getStatusBadge(violation.status)}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Violation Details</CardTitle>
              <CardDescription>
                {violation.violationType.replace(/_/g, " ")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1">{violation.description}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    IP Address
                  </Label>
                  <p className="mt-1 font-mono">{violation.ipAddress || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    User Agent
                  </Label>
                  <p className="mt-1 text-sm truncate">{violation.userAgent || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    User ID
                  </Label>
                  <p className="mt-1 font-mono text-sm">{violation.userId || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Organization ID
                  </Label>
                  <p className="mt-1 font-mono text-sm">{violation.orgId || "Platform-wide"}</p>
                </div>
              </div>

              {violation.resourceType && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Resource Type
                      </Label>
                      <p className="mt-1">{violation.resourceType}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Resource ID</Label>
                      <p className="mt-1 font-mono text-sm">{violation.resourceId || "N/A"}</p>
                    </div>
                  </div>
                </>
              )}

              {violation.details && Object.keys(violation.details).length > 0 && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-muted-foreground">Additional Details</Label>
                    <pre className="mt-2 p-4 bg-muted rounded-lg text-sm overflow-auto">
                      {JSON.stringify(violation.details, null, 2)}
                    </pre>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Occurred at: {new Date(violation.createdAt).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          {/* Policy Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Related Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Policy Name</Label>
                  <p className="mt-1 font-medium">{violation.policy?.name || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Policy Type</Label>
                  <Badge variant="outline" className="mt-1">
                    {violation.policy?.type?.replace(/_/g, " ") || "N/A"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Scope</Label>
                  <Badge variant="secondary" className="mt-1">
                    {violation.policy?.scope?.replace(/_/g, " ") || "N/A"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Enforcement Mode</Label>
                  <Badge
                    variant={
                      violation.policy?.enforcementMode === "STRICT"
                        ? "destructive"
                        : violation.policy?.enforcementMode === "ENFORCE"
                        ? "default"
                        : "secondary"
                    }
                    className="mt-1"
                  >
                    {violation.policy?.enforcementMode || "N/A"}
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push(`/admin/security/policies`)}
              >
                View Policy
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Resolution Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resolution</CardTitle>
              <CardDescription>Update the violation status and add resolution notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Resolution Notes</Label>
                <Textarea
                  className="mt-2"
                  placeholder="Describe how this violation was resolved..."
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows={4}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {violation.resolvedAt && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-500">
                  <CheckCircle className="h-5 w-5" />
                  Resolution Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label className="text-muted-foreground">Resolved By</Label>
                  <p className="text-sm">{violation.resolvedBy || "System"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Resolved At</Label>
                  <p className="text-sm">
                    {new Date(violation.resolvedAt).toLocaleString()}
                  </p>
                </div>
                {violation.resolution && (
                  <div>
                    <Label className="text-muted-foreground">Notes</Label>
                    <p className="text-sm mt-1">{violation.resolution}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setStatus("INVESTIGATING")
                  handleSave()
                }}
                disabled={status === "INVESTIGATING"}
              >
                <Clock className="h-4 w-4 mr-2" />
                Start Investigation
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setStatus("RESOLVED")
                  handleSave()
                }}
                disabled={status === "RESOLVED"}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Resolved
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setStatus("FALSE_POSITIVE")
                  handleSave()
                }}
                disabled={status === "FALSE_POSITIVE"}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Mark as False Positive
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive"
                onClick={() => {
                  setStatus("ESCALATED")
                  handleSave()
                }}
                disabled={status === "ESCALATED"}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Escalate
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
