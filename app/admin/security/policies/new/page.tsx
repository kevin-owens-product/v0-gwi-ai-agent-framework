"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Save, Loader2, Lock } from "lucide-react"
import { toast } from "sonner"
import { useAdmin } from "@/components/providers/admin-provider"

const policyTypes = [
  { value: "PASSWORD", label: "Password Policy" },
  { value: "SESSION", label: "Session Policy" },
  { value: "MFA", label: "MFA Requirements" },
  { value: "IP_ALLOWLIST", label: "IP Allowlist" },
  { value: "DATA_ACCESS", label: "Data Access" },
  { value: "FILE_SHARING", label: "File Sharing" },
  { value: "EXTERNAL_SHARING", label: "External Sharing" },
  { value: "DLP", label: "Data Loss Prevention" },
  { value: "ENCRYPTION", label: "Encryption" },
  { value: "DEVICE_TRUST", label: "Device Trust" },
  { value: "API_ACCESS", label: "API Access" },
  { value: "RETENTION", label: "Data Retention" },
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

export default function NewSecurityPolicyPage() {
  const router = useRouter()
  const { admin: currentAdmin } = useAdmin()
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "PASSWORD",
    scope: "PLATFORM",
    enforcementMode: "ENFORCE",
    priority: 0,
    isActive: true,
  })

  const canCreate = currentAdmin.role === "SUPER_ADMIN" || currentAdmin.permissions.includes("security:write")

  const handleCreate = async () => {
    if (!formData.name) {
      toast.error("Policy name is required")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/security/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success("Security policy created successfully")
        router.push(`/admin/security/policies/${data.policy.id}`)
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to create security policy")
      }
    } catch (error) {
      console.error("Failed to create policy:", error)
      toast.error("Failed to create security policy")
    } finally {
      setIsSaving(false)
    }
  }

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">You don&apos;t have permission to create security policies</p>
        <Link href="/admin/security/policies">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Policies
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
          <Link href="/admin/security/policies">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              Create Security Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              Define a new security enforcement rule for the platform
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.name}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Policy
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Policy Details</CardTitle>
          <CardDescription>
            Configure the security policy settings and enforcement rules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Policy Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Enterprise Password Policy"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this policy enforces..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Policy Type *</Label>
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

              <div className="grid gap-2">
                <Label>Scope *</Label>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Enforcement Mode *</Label>
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
                <p className="text-xs text-muted-foreground">
                  {formData.enforcementMode === "MONITOR" && "Only log violations, no enforcement"}
                  {formData.enforcementMode === "WARN" && "Warn users but allow actions"}
                  {formData.enforcementMode === "ENFORCE" && "Block violations with grace period"}
                  {formData.enforcementMode === "STRICT" && "Immediately block all violations"}
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  placeholder="0"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">
                  Higher priority policies are evaluated first
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Enable policy immediately</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
