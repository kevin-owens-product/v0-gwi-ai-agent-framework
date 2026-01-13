"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  FileText,
  Loader2,
  Save,
  AlertCircle,
  X,
  Plus,
} from "lucide-react"
import Link from "next/link"

const REPORT_TYPES = [
  { value: "USAGE", label: "Usage", description: "Track platform usage metrics like agent runs, tokens, API calls" },
  { value: "REVENUE", label: "Revenue", description: "Financial metrics including MRR, ARR, and revenue by plan" },
  { value: "SECURITY", label: "Security", description: "Security violations, threats, and blocked IPs" },
  { value: "COMPLIANCE", label: "Compliance", description: "Compliance frameworks, attestations, and audits" },
  { value: "USER_ACTIVITY", label: "User Activity", description: "User engagement, sessions, and activity trends" },
  { value: "CUSTOM_SQL", label: "Custom SQL", description: "Advanced reports with custom SQL queries" },
]

const SCHEDULES = [
  { value: "", label: "On-demand (no schedule)" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
]

const FORMATS = [
  { value: "csv", label: "CSV" },
  { value: "json", label: "JSON" },
  { value: "pdf", label: "PDF" },
  { value: "xlsx", label: "Excel (XLSX)" },
]

export default function NewReportPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "USAGE",
    schedule: "",
    format: "csv",
    isActive: true,
    recipients: [] as string[],
    query: {
      days: 30,
    },
  })

  const [newRecipient, setNewRecipient] = useState("")

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError("Report name is required")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/analytics/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          schedule: formData.schedule || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create report")
      }

      const data = await response.json()
      router.push(`/admin/analytics/reports/${data.report.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create report")
    } finally {
      setIsSaving(false)
    }
  }

  const addRecipient = () => {
    if (newRecipient && !formData.recipients.includes(newRecipient)) {
      setFormData(prev => ({
        ...prev,
        recipients: [...prev.recipients, newRecipient],
      }))
      setNewRecipient("")
    }
  }

  const removeRecipient = (email: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email),
    }))
  }

  const selectedType = REPORT_TYPES.find(t => t.value === formData.type)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/analytics/reports">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reports
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Create New Report
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure a new custom analytics report
            </p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Report
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Configure the report name and description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Report Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Monthly Usage Summary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this report contains..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">Enable this report for execution</p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Report Type */}
        <Card>
          <CardHeader>
            <CardTitle>Report Type</CardTitle>
            <CardDescription>Select the type of data to include</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedType && (
                <p className="text-xs text-muted-foreground">{selectedType.description}</p>
              )}
            </div>

            {formData.type !== "CUSTOM_SQL" && (
              <div className="space-y-2">
                <Label>Report Period (days)</Label>
                <Input
                  type="number"
                  value={formData.query.days}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    query: { ...prev.query, days: parseInt(e.target.value) || 30 },
                  }))}
                  min={1}
                  max={365}
                />
                <p className="text-xs text-muted-foreground">
                  Number of days of data to include in the report
                </p>
              </div>
            )}

            {formData.type === "CUSTOM_SQL" && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Custom SQL reports require manual configuration. After creating the report,
                  you can edit the query in the report detail page.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schedule & Delivery */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule & Delivery</CardTitle>
            <CardDescription>Configure when and how the report runs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Schedule</Label>
              <Select
                value={formData.schedule}
                onValueChange={(v) => setFormData(prev => ({ ...prev, schedule: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select schedule" />
                </SelectTrigger>
                <SelectContent>
                  {SCHEDULES.map((schedule) => (
                    <SelectItem key={schedule.value} value={schedule.value}>
                      {schedule.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Output Format</Label>
              <Select
                value={formData.format}
                onValueChange={(v) => setFormData(prev => ({ ...prev, format: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMATS.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Recipients */}
        <Card>
          <CardHeader>
            <CardTitle>Recipients</CardTitle>
            <CardDescription>Email addresses to send the report to</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="email"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                placeholder="email@example.com"
                onKeyDown={(e) => e.key === "Enter" && addRecipient()}
              />
              <Button variant="outline" onClick={addRecipient}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.recipients.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {formData.recipients.map((email) => (
                  <Badge key={email} variant="secondary" className="flex items-center gap-1">
                    {email}
                    <button
                      onClick={() => removeRecipient(email)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recipients added. Reports will only be accessible from the dashboard.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Report Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{formData.name || "Untitled Report"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium">{selectedType?.label || formData.type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Schedule</p>
              <p className="font-medium">
                {SCHEDULES.find(s => s.value === formData.schedule)?.label || "On-demand"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recipients</p>
              <p className="font-medium">{formData.recipients.length || "None"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
