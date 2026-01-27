"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
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
import {
  ArrowLeft,
  Save,
  Loader2,
  Calendar,
} from "lucide-react"
import Link from "next/link"

const DATA_TYPE_OPTIONS = [
  { value: "AGENT_RUNS", label: "Agent Runs" },
  { value: "AUDIT_LOGS", label: "Audit Logs" },
  { value: "USER_SESSIONS", label: "User Sessions" },
  { value: "TEMP_FILES", label: "Temp Files" },
  { value: "NOTIFICATIONS", label: "Notifications" },
  { value: "ANALYTICS", label: "Analytics" },
]

const SCOPE_OPTIONS = [
  { value: "PLATFORM", label: "Platform-wide" },
  { value: "ORGANIZATION", label: "Organization" },
  { value: "PLAN", label: "By Plan" },
]

const DELETE_ACTION_OPTIONS = [
  { value: "SOFT_DELETE", label: "Soft Delete" },
  { value: "HARD_DELETE", label: "Hard Delete" },
  { value: "ARCHIVE", label: "Archive" },
]

export default function NewRetentionPolicyPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dataType: "AGENT_RUNS",
    retentionDays: 90,
    scope: "PLATFORM",
    deleteAction: "SOFT_DELETE",
    isActive: true,
  })

  const handleCreate = async () => {
    if (!formData.name || !formData.dataType) {
      toast.error("Name and data type are required")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/compliance/retention-policies", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          dataType: formData.dataType,
          retentionDays: formData.retentionDays,
          scope: formData.scope,
          deleteAction: formData.deleteAction,
          isActive: formData.isActive,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        const data = await response.json()
        throw new Error(data.error || "Failed to create retention policy")
      }

      const data = await response.json()
      router.push(`/admin/compliance/retention-policies/${data.policy?.id || ""}`)
    } catch (error) {
      console.error("Failed to create retention policy:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create retention policy")
    } finally {
      setIsSaving(false)
    }
  }

  const getRetentionPeriodLabel = (days: number) => {
    if (days === -1) return "Forever"
    if (days === 0) return "Immediate"
    if (days < 30) return `${days} days`
    if (days < 365) return `${Math.round(days / 30)} months`
    return `${Math.round(days / 365)} years`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/compliance/retention-policies">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Create Retention Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure data retention rules and automatic cleanup
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.name || !formData.dataType}>
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
            Define the data retention rules for automatic cleanup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Policy Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Agent Runs 90 Day Retention"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Data Type *</Label>
              <Select
                value={formData.dataType}
                onValueChange={(value) => setFormData({ ...formData, dataType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATA_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="retentionDays">Retention Days *</Label>
              <Input
                id="retentionDays"
                type="number"
                min="-1"
                value={formData.retentionDays}
                onChange={(e) => setFormData({ ...formData, retentionDays: parseInt(e.target.value) || 0 })}
                placeholder="90"
              />
              <p className="text-xs text-muted-foreground">
                Use -1 for forever. Current: {getRetentionPeriodLabel(formData.retentionDays)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
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
                  {SCOPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Delete Action</Label>
              <Select
                value={formData.deleteAction}
                onValueChange={(value) => setFormData({ ...formData, deleteAction: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DELETE_ACTION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
              placeholder="Describe the purpose of this retention policy..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Active Status</Label>
              <p className="text-sm text-muted-foreground">
                Enable this policy for automatic data cleanup
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>

          <div className="rounded-lg border p-4 bg-muted/50">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Retention policies run automatically based on a scheduled job.
              Data matching the criteria will be processed according to the delete action selected.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
