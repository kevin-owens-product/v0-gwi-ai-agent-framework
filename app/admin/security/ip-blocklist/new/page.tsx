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
import { ArrowLeft, Save, Loader2, Ban } from "lucide-react"
import { toast } from "sonner"
import { useAdmin } from "@/components/providers/admin-provider"

const blockTypes = [
  { value: "MANUAL", label: "Manual", description: "Manually blocked by administrator" },
  { value: "AUTOMATIC", label: "Automatic", description: "Blocked by automated security rules" },
  { value: "THREAT_INTEL", label: "Threat Intelligence", description: "Known malicious IP from threat feeds" },
  { value: "BRUTE_FORCE", label: "Brute Force", description: "Detected brute force attack" },
  { value: "GEOGRAPHIC", label: "Geographic", description: "Blocked based on geographic location" },
]

export default function NewIPBlocklistPage() {
  const router = useRouter()
  const { admin: currentAdmin } = useAdmin()
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    ipAddress: "",
    ipRange: "",
    type: "MANUAL",
    reason: "",
    expiresAt: "",
    isActive: true,
    orgId: "",
  })

  const canCreate = currentAdmin.role === "SUPER_ADMIN" || currentAdmin.permissions.includes("security:write")

  const validateIPAddress = (ip: string): boolean => {
    // IPv4 validation
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
    // IPv6 validation (simplified)
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/

    if (ipv4Regex.test(ip)) {
      const parts = ip.split(".")
      return parts.every((part) => parseInt(part) >= 0 && parseInt(part) <= 255)
    }

    return ipv6Regex.test(ip)
  }

  const handleCreate = async () => {
    if (!formData.ipAddress || !formData.reason) {
      toast.error("IP address and reason are required")
      return
    }

    if (!validateIPAddress(formData.ipAddress)) {
      toast.error("Invalid IP address format")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/security/ip-blocklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ipAddress: formData.ipAddress,
          ipRange: formData.ipRange || undefined,
          type: formData.type,
          reason: formData.reason,
          expiresAt: formData.expiresAt || undefined,
          isActive: formData.isActive,
          orgId: formData.orgId || undefined,
          metadata: {},
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success("IP address added to blocklist")
        router.push(`/admin/security/ip-blocklist/${data.entry.id}`)
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to add IP to blocklist")
      }
    } catch (error) {
      console.error("Failed to block IP:", error)
      toast.error("Failed to add IP to blocklist")
    } finally {
      setIsSaving(false)
    }
  }

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">You don&apos;t have permission to manage IP blocklist</p>
        <Link href="/admin/security/ip-blocklist">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blocklist
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
          <Link href="/admin/security/ip-blocklist">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Ban className="h-6 w-6 text-destructive" />
              Block IP Address
            </h1>
            <p className="text-sm text-muted-foreground">
              Add a new IP address to the platform blocklist
            </p>
          </div>
        </div>
        <Button
          onClick={handleCreate}
          disabled={isSaving || !formData.ipAddress || !formData.reason}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Blocking...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Block IP
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>IP Address Details</CardTitle>
          <CardDescription>
            Specify the IP address to block and the reason for blocking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="ipAddress">IP Address *</Label>
              <Input
                id="ipAddress"
                placeholder="e.g., 192.168.1.100 or 2001:0db8:85a3::8a2e:0370:7334"
                value={formData.ipAddress}
                onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Enter a valid IPv4 or IPv6 address
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ipRange">CIDR Range (Optional)</Label>
              <Input
                id="ipRange"
                placeholder="e.g., 192.168.1.0/24"
                value={formData.ipRange}
                onChange={(e) => setFormData({ ...formData, ipRange: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Optionally block an entire IP range using CIDR notation
              </p>
            </div>

            <div className="grid gap-2">
              <Label>Block Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {blockTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {blockTypes.find((t) => t.value === formData.type)?.description}
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Why is this IP being blocked?"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Block Options */}
      <Card>
        <CardHeader>
          <CardTitle>Block Options</CardTitle>
          <CardDescription>
            Configure when and how the block should be applied
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for a permanent block. Set a date for temporary blocks.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <div className="grid gap-0.5">
              <Label htmlFor="isActive">Block immediately</Label>
              <p className="text-xs text-muted-foreground">
                When enabled, this IP will be blocked as soon as you save
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scope */}
      <Card>
        <CardHeader>
          <CardTitle>Scope (Optional)</CardTitle>
          <CardDescription>
            Restrict this block to a specific organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Label htmlFor="orgId">Organization ID</Label>
            <Input
              id="orgId"
              placeholder="e.g., org_xxxxx (leave empty for platform-wide block)"
              value={formData.orgId}
              onChange={(e) => setFormData({ ...formData, orgId: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              If specified, this IP will only be blocked for the specified organization.
              Leave empty to block platform-wide.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
