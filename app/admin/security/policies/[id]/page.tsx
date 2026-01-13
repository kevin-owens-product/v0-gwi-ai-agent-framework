"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Shield,
  Save,
  CheckCircle,
  XCircle,
  Trash2,
  AlertTriangle,
  Key,
  Clock,
  Smartphone,
  Globe,
  FileText,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"

interface SecurityViolation {
  id: string
  violationType: string
  severity: string
  description: string
  status: string
  createdAt: string
}

interface SecurityPolicy {
  id: string
  name: string
  description: string | null
  type: string
  scope: string
  isActive: boolean
  enforcementMode: string
  priority: number
  targetOrgs: string[]
  targetPlans: string[]
  settings: Record<string, unknown>
  violations: SecurityViolation[]
  _count: { violations: number }
  createdAt: string
  updatedAt: string
}

const policyTypeIcons: Record<string, React.ReactNode> = {
  PASSWORD: <Key className="h-4 w-4" />,
  SESSION: <Clock className="h-4 w-4" />,
  MFA: <Smartphone className="h-4 w-4" />,
  IP_ALLOWLIST: <Globe className="h-4 w-4" />,
  DLP: <FileText className="h-4 w-4" />,
  DEVICE_TRUST: <Smartphone className="h-4 w-4" />,
  API_ACCESS: <Key className="h-4 w-4" />,
  DEFAULT: <Shield className="h-4 w-4" />,
}

const policyTypes = [
  { value: "PASSWORD", label: "Password Policy" },
  { value: "SESSION", label: "Session Policy" },
  { value: "MFA", label: "MFA Requirements" },
  { value: "IP_ALLOWLIST", label: "IP Allowlist" },
  { value: "DATA_ACCESS", label: "Data Access" },
  { value: "FILE_SHARING", label: "File Sharing" },
  { value: "DLP", label: "Data Loss Prevention" },
  { value: "ENCRYPTION", label: "Encryption" },
  { value: "DEVICE_TRUST", label: "Device Trust" },
  { value: "API_ACCESS", label: "API Access" },
]

const scopeOptions = [
  { value: "PLATFORM", label: "Platform-wide" },
  { value: "ENTERPRISE_ONLY", label: "Enterprise Only" },
  { value: "SPECIFIC_ORGS", label: "Specific Organizations" },
  { value: "SPECIFIC_PLANS", label: "Specific Plans" },
]

const enforcementModes = [
  { value: "MONITOR", label: "Monitor Only" },
  { value: "WARN", label: "Warn" },
  { value: "ENFORCE", label: "Enforce" },
  { value: "STRICT", label: "Strict" },
]

export default function SecurityPolicyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [policy, setPolicy] = useState<SecurityPolicy | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    scope: "",
    enforcementMode: "",
    priority: 0,
    isActive: true,
  })

  useEffect(() => {
    if (params.id) {
      fetchPolicy()
    }
  }, [params.id])

  const fetchPolicy = async () => {
    try {
      const response = await fetch(`/api/admin/security/policies/${params.id}`)
      if (!response.ok) {
        throw new Error("Policy not found")
      }
      const data = await response.json()
      setPolicy(data.policy)
      setFormData({
        name: data.policy.name,
        description: data.policy.description || "",
        type: data.policy.type,
        scope: data.policy.scope,
        enforcementMode: data.policy.enforcementMode,
        priority: data.policy.priority,
        isActive: data.policy.isActive,
      })
    } catch (error) {
      console.error("Failed to fetch policy:", error)
      toast.error("Failed to fetch security policy")
      router.push("/admin/security/policies")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!policy) return

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/security/policies/${policy.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update policy")
      }

      toast.success("Security policy updated successfully")
      fetchPolicy()
    } catch (error) {
      toast.error("Failed to update security policy")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!policy || !confirm("Are you sure you want to delete this security policy?")) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/admin/security/policies/${policy.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete policy")
      }

      toast.success("Security policy deleted")
      router.push("/admin/security/policies")
    } catch (error) {
      toast.error("Failed to delete security policy")
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleActive = async () => {
    if (!policy) return

    try {
      const response = await fetch(`/api/admin/security/policies/${policy.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !policy.isActive }),
      })

      if (!response.ok) {
        throw new Error("Failed to update policy status")
      }

      toast.success(`Policy ${policy.isActive ? "disabled" : "enabled"} successfully`)
      fetchPolicy()
    } catch (error) {
      toast.error("Failed to update policy status")
    }
  }

  const getPolicyIcon = (type: string) => policyTypeIcons[type] || policyTypeIcons.DEFAULT

  const getEnforcementBadge = (mode: string) => {
    switch (mode) {
      case "STRICT":
        return <Badge variant="destructive">{mode}</Badge>
      case "ENFORCE":
        return <Badge>{mode}</Badge>
      case "WARN":
        return <Badge variant="default" className="bg-yellow-500">{mode}</Badge>
      case "MONITOR":
        return <Badge variant="secondary">{mode}</Badge>
      default:
        return <Badge variant="outline">{mode}</Badge>
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <Badge variant="destructive">{severity}</Badge>
      case "WARNING":
        return <Badge variant="default" className="bg-yellow-500">{severity}</Badge>
      case "INFO":
        return <Badge variant="secondary">{severity}</Badge>
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return <Badge variant="destructive">{status}</Badge>
      case "RESOLVED":
        return <Badge variant="default" className="bg-green-500">{status}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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

  if (!policy) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Security policy not found</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/admin/security/policies")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Policies
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/admin/security/policies")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              {getPolicyIcon(policy.type)}
              {policy.name}
            </h1>
            <p className="text-sm text-muted-foreground">ID: {policy.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getEnforcementBadge(policy.enforcementMode)}
          {policy.isActive ? (
            <Badge className="bg-green-500">Active</Badge>
          ) : (
            <Badge variant="secondary">Inactive</Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Details / Edit Form */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Policy Configuration</CardTitle>
              <CardDescription>
                Configure the security policy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Policy Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Policy Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {policyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Scope</Label>
                  <Select
                    value={formData.scope}
                    onValueChange={(value) => setFormData({ ...formData, scope: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {scopeOptions.map((scope) => (
                        <SelectItem key={scope.value} value={scope.value}>
                          {scope.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Enforcement Mode</Label>
                  <Select
                    value={formData.enforcementMode}
                    onValueChange={(value) => setFormData({ ...formData, enforcementMode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {enforcementModes.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          {mode.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Policy Active</Label>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Violations */}
          {policy.violations && policy.violations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Recent Violations ({policy._count?.violations || 0} total)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policy.violations.map((violation) => (
                      <TableRow
                        key={violation.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/admin/security/violations/${violation.id}`)}
                      >
                        <TableCell>{violation.violationType.replace(/_/g, " ")}</TableCell>
                        <TableCell>{getSeverityBadge(violation.severity)}</TableCell>
                        <TableCell>{getStatusBadge(violation.status)}</TableCell>
                        <TableCell>{new Date(violation.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => router.push("/admin/security/violations")}
                >
                  View All Violations
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Policy Settings JSON */}
          {policy.settings && Object.keys(policy.settings).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Policy Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-muted rounded-lg text-sm overflow-auto">
                  {JSON.stringify(policy.settings, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleToggleActive}
              >
                {policy.isActive ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Disable Policy
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Enable Policy
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? "Deleting..." : "Delete Policy"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Violations</span>
                <Badge variant={policy._count?.violations > 0 ? "destructive" : "secondary"}>
                  {policy._count?.violations || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Priority Level</span>
                <Badge variant="outline">{policy.priority}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Policy Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p>{new Date(policy.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Last Updated</Label>
                <p>{new Date(policy.updatedAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
