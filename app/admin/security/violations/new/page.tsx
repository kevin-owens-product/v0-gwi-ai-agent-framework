"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { ArrowLeft, Save, Loader2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { useAdmin } from "@/components/providers/admin-provider"

interface SecurityPolicy {
  id: string
  name: string
  type: string
}

const violationTypes = [
  { value: "WEAK_PASSWORD", label: "Weak Password" },
  { value: "FAILED_MFA", label: "Failed MFA" },
  { value: "SUSPICIOUS_LOGIN", label: "Suspicious Login" },
  { value: "IP_BLOCKED", label: "IP Blocked" },
  { value: "UNAUTHORIZED_ACCESS", label: "Unauthorized Access" },
  { value: "DATA_EXFILTRATION", label: "Data Exfiltration" },
  { value: "FILE_POLICY_VIOLATION", label: "File Policy Violation" },
  { value: "EXTERNAL_SHARING_BLOCKED", label: "External Sharing Blocked" },
  { value: "SESSION_VIOLATION", label: "Session Violation" },
  { value: "DEVICE_NOT_COMPLIANT", label: "Device Not Compliant" },
  { value: "API_ABUSE", label: "API Abuse" },
  { value: "RATE_LIMIT_EXCEEDED", label: "Rate Limit Exceeded" },
  { value: "BRUTE_FORCE_DETECTED", label: "Brute Force Detected" },
  { value: "IMPOSSIBLE_TRAVEL", label: "Impossible Travel" },
  { value: "ANOMALOUS_BEHAVIOR", label: "Anomalous Behavior" },
]

const severities = [
  { value: "INFO", label: "Info" },
  { value: "WARNING", label: "Warning" },
  { value: "CRITICAL", label: "Critical" },
]

const statuses = [
  { value: "OPEN", label: "Open" },
  { value: "INVESTIGATING", label: "Investigating" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "FALSE_POSITIVE", label: "False Positive" },
  { value: "ESCALATED", label: "Escalated" },
]

export default function NewSecurityViolationPage() {
  const router = useRouter()
  const { admin: currentAdmin } = useAdmin()
  const [isSaving, setIsSaving] = useState(false)
  const [policies, setPolicies] = useState<SecurityPolicy[]>([])
  const [loadingPolicies, setLoadingPolicies] = useState(true)

  const [formData, setFormData] = useState({
    policyId: "",
    violationType: "SUSPICIOUS_LOGIN",
    severity: "WARNING",
    description: "",
    status: "OPEN",
    ipAddress: "",
    userAgent: "",
    orgId: "",
    userId: "",
    resourceType: "",
    resourceId: "",
  })

  const canCreate = currentAdmin.role === "SUPER_ADMIN" || currentAdmin.permissions.includes("security:write")

  useEffect(() => {
    async function fetchPolicies() {
      try {
        const response = await fetch("/api/admin/security/policies")
        if (response.ok) {
          const data = await response.json()
          setPolicies(data.policies || [])
        }
      } catch (error) {
        console.error("Failed to fetch policies:", error)
        toast.error("Failed to load security policies")
      } finally {
        setLoadingPolicies(false)
      }
    }
    fetchPolicies()
  }, [])

  const handleCreate = async () => {
    if (!formData.policyId || !formData.violationType || !formData.description) {
      toast.error("Policy, violation type, and description are required")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/security/violations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policyId: formData.policyId,
          violationType: formData.violationType,
          severity: formData.severity,
          description: formData.description,
          status: formData.status,
          ipAddress: formData.ipAddress || undefined,
          userAgent: formData.userAgent || undefined,
          orgId: formData.orgId || undefined,
          userId: formData.userId || undefined,
          resourceType: formData.resourceType || undefined,
          resourceId: formData.resourceId || undefined,
          details: {},
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success("Security violation recorded successfully")
        router.push(`/admin/security/violations/${data.violation.id}`)
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to create security violation")
      }
    } catch (error) {
      console.error("Failed to create violation:", error)
      toast.error("Failed to create security violation")
    } finally {
      setIsSaving(false)
    }
  }

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">You don&apos;t have permission to create violation records</p>
        <Link href="/admin/security/violations">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Violations
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/security/violations">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              Record Security Violation
            </h1>
            <p className="text-sm text-muted-foreground">
              Manually log a security policy violation
            </p>
          </div>
        </div>
        <Button
          onClick={handleCreate}
          disabled={isSaving || !formData.policyId || !formData.description}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Record Violation
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Violation Details</CardTitle>
          <CardDescription>
            Specify the policy violation and associated information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Security Policy *</Label>
              <Select
                value={formData.policyId}
                onValueChange={(value) => setFormData({ ...formData, policyId: value })}
                disabled={loadingPolicies}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingPolicies ? "Loading policies..." : "Select a policy"} />
                </SelectTrigger>
                <SelectContent>
                  {policies.map((policy) => (
                    <SelectItem key={policy.id} value={policy.id}>
                      {policy.name} ({policy.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The security policy that was violated
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Violation Type *</Label>
                <Select
                  value={formData.violationType}
                  onValueChange={(value) => setFormData({ ...formData, violationType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {violationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Severity *</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) => setFormData({ ...formData, severity: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {severities.map((severity) => (
                      <SelectItem key={severity.value} value={severity.value}>
                        {severity.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the violation in detail..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label>Initial Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Source Information */}
      <Card>
        <CardHeader>
          <CardTitle>Source Information</CardTitle>
          <CardDescription>
            Details about where the violation originated
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="ipAddress">IP Address</Label>
              <Input
                id="ipAddress"
                placeholder="e.g., 192.168.1.100"
                value={formData.ipAddress}
                onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="userAgent">User Agent</Label>
              <Input
                id="userAgent"
                placeholder="e.g., Mozilla/5.0..."
                value={formData.userAgent}
                onChange={(e) => setFormData({ ...formData, userAgent: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Context */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Context</CardTitle>
          <CardDescription>
            Optional information to associate this violation with specific resources
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="orgId">Organization ID</Label>
              <Input
                id="orgId"
                placeholder="e.g., org_xxxxx"
                value={formData.orgId}
                onChange={(e) => setFormData({ ...formData, orgId: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                placeholder="e.g., user_xxxxx"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="resourceType">Resource Type</Label>
              <Input
                id="resourceType"
                placeholder="e.g., file, api_endpoint, document"
                value={formData.resourceType}
                onChange={(e) => setFormData({ ...formData, resourceType: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="resourceId">Resource ID</Label>
              <Input
                id="resourceId"
                placeholder="e.g., file_xxxxx"
                value={formData.resourceId}
                onChange={(e) => setFormData({ ...formData, resourceId: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
