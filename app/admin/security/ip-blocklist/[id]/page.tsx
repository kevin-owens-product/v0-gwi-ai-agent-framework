"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Globe,
  Save,
  Trash2,
  Shield,
  Clock,
  AlertTriangle,
  Ban,
  CheckCircle,
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
import { toast } from "sonner"

interface IPBlocklistEntry {
  id: string
  ipAddress: string
  cidrRange: string | null
  type: string
  reason: string
  source: string
  isActive: boolean
  expiresAt: string | null
  blockedCount: number
  lastBlockedAt: string | null
  metadata: Record<string, unknown>
  createdBy: string
  createdAt: string
  updatedAt: string
}

const BLOCK_TYPES = [
  { value: "MANUAL", label: "Manual Block" },
  { value: "AUTOMATIC", label: "Automatic Detection" },
  { value: "THREAT_INTEL", label: "Threat Intelligence" },
  { value: "GEOGRAPHIC", label: "Geographic Block" },
]

const SOURCES = [
  { value: "ADMIN", label: "Admin Action" },
  { value: "SYSTEM", label: "System Detection" },
  { value: "THREAT_FEED", label: "Threat Feed" },
  { value: "USER_REPORT", label: "User Report" },
]

export default function IPBlocklistDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [entry, setEntry] = useState<IPBlocklistEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [formData, setFormData] = useState({
    ipAddress: "",
    cidrRange: "",
    type: "",
    reason: "",
    source: "",
    isActive: true,
    expiresAt: "",
  })

  useEffect(() => {
    if (params.id) {
      fetchEntry()
    }
  }, [params.id])

  const fetchEntry = async () => {
    try {
      const response = await fetch(`/api/admin/security/ip-blocklist/${params.id}`)
      if (!response.ok) {
        throw new Error("Entry not found")
      }
      const data = await response.json()
      setEntry(data.entry)
      setFormData({
        ipAddress: data.entry.ipAddress,
        cidrRange: data.entry.cidrRange || "",
        type: data.entry.type,
        reason: data.entry.reason,
        source: data.entry.source,
        isActive: data.entry.isActive,
        expiresAt: data.entry.expiresAt ? new Date(data.entry.expiresAt).toISOString().slice(0, 16) : "",
      })
    } catch (error) {
      console.error("Failed to fetch entry:", error)
      toast.error("Failed to fetch IP blocklist entry")
      router.push("/admin/security/ip-blocklist")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!entry) return

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/security/ip-blocklist/${entry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cidrRange: formData.cidrRange || null,
          expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update entry")
      }

      toast.success("IP blocklist entry updated successfully")
      fetchEntry()
    } catch (error) {
      toast.error("Failed to update IP blocklist entry")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!entry || !confirm("Are you sure you want to remove this IP from the blocklist?")) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/admin/security/ip-blocklist/${entry.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete entry")
      }

      toast.success("IP removed from blocklist")
      router.push("/admin/security/ip-blocklist")
    } catch (error) {
      toast.error("Failed to remove IP from blocklist")
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleActive = async () => {
    if (!entry) return

    try {
      const response = await fetch(`/api/admin/security/ip-blocklist/${entry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !entry.isActive }),
      })

      if (!response.ok) {
        throw new Error("Failed to update entry status")
      }

      toast.success(`IP block ${entry.isActive ? "deactivated" : "activated"} successfully`)
      fetchEntry()
    } catch (error) {
      toast.error("Failed to update entry status")
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "MANUAL":
        return <Badge variant="outline">Manual</Badge>
      case "AUTOMATIC":
        return <Badge variant="secondary">Automatic</Badge>
      case "THREAT_INTEL":
        return <Badge variant="destructive">Threat Intel</Badge>
      case "GEOGRAPHIC":
        return <Badge variant="default" className="bg-purple-500">Geographic</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getSourceBadge = (source: string) => {
    switch (source) {
      case "ADMIN":
        return <Badge variant="outline">Admin</Badge>
      case "SYSTEM":
        return <Badge variant="secondary">System</Badge>
      case "THREAT_FEED":
        return <Badge variant="destructive">Threat Feed</Badge>
      case "USER_REPORT":
        return <Badge variant="default" className="bg-blue-500">User Report</Badge>
      default:
        return <Badge variant="outline">{source}</Badge>
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

  if (!entry) {
    return (
      <div className="text-center py-12">
        <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">IP blocklist entry not found</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/admin/security/ip-blocklist")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to IP Blocklist
        </Button>
      </div>
    )
  }

  const isExpired = entry.expiresAt && new Date(entry.expiresAt) < new Date()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/admin/security/ip-blocklist")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Ban className="h-6 w-6 text-destructive" />
              {entry.ipAddress}
              {entry.cidrRange && <span className="text-muted-foreground">/{entry.cidrRange}</span>}
            </h1>
            <p className="text-sm text-muted-foreground">ID: {entry.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getTypeBadge(entry.type)}
          {entry.isActive ? (
            isExpired ? (
              <Badge variant="secondary">Expired</Badge>
            ) : (
              <Badge variant="destructive">Blocked</Badge>
            )
          ) : (
            <Badge variant="outline">Inactive</Badge>
          )}
        </div>
      </div>

      {isExpired && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <div>
            <p className="font-medium text-yellow-500">This block has expired</p>
            <p className="text-sm text-muted-foreground">
              The block expired on {new Date(entry.expiresAt!).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Details / Edit Form */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Block Details</CardTitle>
              <CardDescription>
                Configure the IP block settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ipAddress">IP Address</Label>
                  <Input
                    id="ipAddress"
                    value={formData.ipAddress}
                    onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                    placeholder="192.168.1.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidrRange">CIDR Range (optional)</Label>
                  <Input
                    id="cidrRange"
                    value={formData.cidrRange}
                    onChange={(e) => setFormData({ ...formData, cidrRange: e.target.value })}
                    placeholder="24"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Block</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                  placeholder="Describe why this IP was blocked..."
                />
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Block Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOCK_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Source</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(value) => setFormData({ ...formData, source: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCES.map((source) => (
                        <SelectItem key={source.value} value={source.value}>
                          {source.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expires At (optional)</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
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
                  <Label htmlFor="isActive">Block Active</Label>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          {entry.metadata && Object.keys(entry.metadata).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-muted rounded-lg text-sm overflow-auto">
                  {JSON.stringify(entry.metadata, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
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
                {entry.isActive ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Deactivate Block
                  </>
                ) : (
                  <>
                    <Ban className="h-4 w-4 mr-2" />
                    Activate Block
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
                {deleting ? "Removing..." : "Remove from Blocklist"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Block Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Times Blocked</span>
                <Badge variant="destructive">{entry.blockedCount}</Badge>
              </div>
              {entry.lastBlockedAt && (
                <div>
                  <Label className="text-muted-foreground">Last Blocked</Label>
                  <p className="text-sm">{new Date(entry.lastBlockedAt).toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Entry Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <Label className="text-muted-foreground">Source</Label>
                <div className="mt-1">{getSourceBadge(entry.source)}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p>{new Date(entry.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Last Updated</Label>
                <p>{new Date(entry.updatedAt).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Created By</Label>
                <p className="font-mono text-xs">{entry.createdBy}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
