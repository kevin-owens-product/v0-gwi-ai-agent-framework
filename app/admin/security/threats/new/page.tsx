"use client"

import { useState } from "react"
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
import { ArrowLeft, Save, Loader2, Zap } from "lucide-react"
import { toast } from "sonner"
import { useAdmin } from "@/components/providers/admin-provider"

const threatTypes = [
  { value: "BRUTE_FORCE", label: "Brute Force" },
  { value: "CREDENTIAL_STUFFING", label: "Credential Stuffing" },
  { value: "PHISHING_ATTEMPT", label: "Phishing Attempt" },
  { value: "ACCOUNT_TAKEOVER", label: "Account Takeover" },
  { value: "DATA_BREACH", label: "Data Breach" },
  { value: "MALWARE_DETECTED", label: "Malware Detected" },
  { value: "RANSOMWARE", label: "Ransomware" },
  { value: "DLP_VIOLATION", label: "DLP Violation" },
  { value: "INSIDER_THREAT", label: "Insider Threat" },
  { value: "API_ABUSE", label: "API Abuse" },
  { value: "BOT_ATTACK", label: "Bot Attack" },
  { value: "DDOS_ATTEMPT", label: "DDoS Attempt" },
  { value: "SUSPICIOUS_ACTIVITY", label: "Suspicious Activity" },
  { value: "COMPLIANCE_VIOLATION", label: "Compliance Violation" },
]

const severities = [
  { value: "INFO", label: "Info" },
  { value: "WARNING", label: "Warning" },
  { value: "CRITICAL", label: "Critical" },
]

const statuses = [
  { value: "ACTIVE", label: "Active" },
  { value: "CONTAINED", label: "Contained" },
  { value: "MITIGATED", label: "Mitigated" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "FALSE_POSITIVE", label: "False Positive" },
]

export default function NewThreatEventPage() {
  const router = useRouter()
  const { admin: currentAdmin } = useAdmin()
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    type: "SUSPICIOUS_ACTIVITY",
    severity: "WARNING",
    source: "",
    description: "",
    status: "ACTIVE",
    orgId: "",
    userId: "",
    indicators: "",
  })

  const canCreate = currentAdmin.role === "SUPER_ADMIN" || currentAdmin.permissions.includes("security:write")

  const handleCreate = async () => {
    if (!formData.type || !formData.source || !formData.description) {
      toast.error("Type, source, and description are required")
      return
    }

    setIsSaving(true)
    try {
      // Parse indicators from comma-separated string
      const indicatorsArray = formData.indicators
        ? formData.indicators.split(",").map((i) => i.trim()).filter(Boolean)
        : []

      const response = await fetch("/api/admin/security/threats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formData.type,
          severity: formData.severity,
          source: formData.source,
          description: formData.description,
          status: formData.status,
          orgId: formData.orgId || undefined,
          userId: formData.userId || undefined,
          indicators: indicatorsArray,
          details: {},
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success("Threat event created successfully")
        router.push(`/admin/security/threats/${data.threat.id}`)
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to create threat event")
      }
    } catch (error) {
      console.error("Failed to create threat:", error)
      toast.error("Failed to create threat event")
    } finally {
      setIsSaving(false)
    }
  }

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">You don&apos;t have permission to create threat events</p>
        <Link href="/admin/security/threats">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Threats
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
          <Link href="/admin/security/threats">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="h-6 w-6 text-orange-500" />
              Log Threat Event
            </h1>
            <p className="text-sm text-muted-foreground">
              Manually record a security threat or incident
            </p>
          </div>
        </div>
        <Button
          onClick={handleCreate}
          disabled={isSaving || !formData.source || !formData.description}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Log Threat
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Threat Details</CardTitle>
          <CardDescription>
            Provide information about the security threat or incident
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Threat Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {threatTypes.map((type) => (
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
              <Label htmlFor="source">Source *</Label>
              <Input
                id="source"
                placeholder="e.g., IP address, system name, or user agent"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                The origin of the threat (IP address, user agent, system, etc.)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the threat event in detail..."
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

            <div className="grid gap-2">
              <Label htmlFor="indicators">Indicators of Compromise (IOCs)</Label>
              <Textarea
                id="indicators"
                placeholder="Enter IOCs separated by commas (e.g., malicious-domain.com, 192.168.1.100, hash:abc123...)"
                value={formData.indicators}
                onChange={(e) => setFormData({ ...formData, indicators: e.target.value })}
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                IP addresses, domains, file hashes, or other threat indicators
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optional Context */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Context</CardTitle>
          <CardDescription>
            Optional information to associate this threat with specific resources
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
              <p className="text-xs text-muted-foreground">
                If this threat is related to a specific organization
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                placeholder="e.g., user_xxxxx"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                If this threat is related to a specific user
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
