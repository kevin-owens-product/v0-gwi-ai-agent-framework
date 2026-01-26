"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const severityOptions = [
  { value: "MINOR", label: "Minor", color: "bg-blue-500", description: "Low impact, workaround available" },
  { value: "MODERATE", label: "Moderate", color: "bg-yellow-500", description: "Medium impact, some users affected" },
  { value: "MAJOR", label: "Major", color: "bg-orange-500", description: "High impact, many users affected" },
  { value: "CRITICAL", label: "Critical", color: "bg-red-500", description: "Service down, all users affected" },
]

const typeOptions = [
  { value: "OUTAGE", label: "Outage", description: "Complete service unavailability" },
  { value: "DEGRADATION", label: "Degradation", description: "Reduced performance or functionality" },
  { value: "SECURITY", label: "Security", description: "Security-related incident" },
  { value: "DATA_ISSUE", label: "Data Issue", description: "Data integrity or availability issue" },
  { value: "THIRD_PARTY", label: "Third Party", description: "External dependency failure" },
  { value: "CAPACITY", label: "Capacity", description: "Resource constraints" },
  { value: "NETWORK", label: "Network", description: "Network connectivity issues" },
  { value: "DATABASE", label: "Database", description: "Database-related issues" },
]

const serviceOptions = [
  "API Gateway",
  "Authentication",
  "Database",
  "File Storage",
  "Messaging",
  "Search",
  "Analytics",
  "Payments",
  "Notifications",
]

export default function NewIncidentPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "MODERATE",
    type: "OUTAGE",
    affectedServices: [] as string[],
    impact: "",
  })

  const handleCreate = async () => {
    if (!formData.title || !formData.description) {
      toast.error("Title and description are required")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/operations/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          impact: formData.impact || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create incident")
      }

      const data = await response.json()
      toast.success("Incident reported and team notified")
      router.push(`/admin/operations/incidents`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create incident")
    } finally {
      setIsSaving(false)
    }
  }

  const toggleService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      affectedServices: prev.affectedServices.includes(service)
        ? prev.affectedServices.filter(s => s !== service)
        : [...prev.affectedServices, service],
    }))
  }

  const selectedSeverity = severityOptions.find(s => s.value === formData.severity)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/operations/incidents">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-primary" />
              Report New Incident
            </h1>
            <p className="text-sm text-muted-foreground">
              Log a new incident to track and communicate with users
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.title || !formData.description}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Reporting...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Report Incident
            </>
          )}
        </Button>
      </div>

      {/* Warning Banner */}
      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <div>
              <h3 className="font-semibold">Incident Reporting</h3>
              <p className="text-sm text-muted-foreground">
                Reporting an incident will notify the on-call team and may trigger status page updates.
                Please ensure all information is accurate.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Incident Details</CardTitle>
            <CardDescription>
              Describe the incident and its impact
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Incident Title *</Label>
              <Input
                id="title"
                placeholder="Brief description of the incident"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Detailed description of the incident, what is happening, and what is being done..."
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="impact">Business Impact</Label>
              <Textarea
                id="impact"
                placeholder="Describe the business impact (optional)..."
                rows={2}
                value={formData.impact}
                onChange={(e) =>
                  setFormData({ ...formData, impact: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Classification */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Classification</CardTitle>
              <CardDescription>
                Categorize the incident severity and type
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Severity *</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) =>
                    setFormData({ ...formData, severity: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {severityOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${opt.color}`} />
                          <div className="flex flex-col">
                            <span>{opt.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {opt.description}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedSeverity && (
                  <div className="flex items-center gap-2 mt-2 p-2 rounded-md bg-muted">
                    <div className={`h-3 w-3 rounded-full ${selectedSeverity.color}`} />
                    <span className="text-sm">{selectedSeverity.description}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Incident Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex flex-col">
                          <span>{opt.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {opt.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Affected Services</CardTitle>
              <CardDescription>
                Select all services impacted by this incident
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {serviceOptions.map((service) => (
                  <Badge
                    key={service}
                    variant={
                      formData.affectedServices.includes(service)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => toggleService(service)}
                  >
                    {service}
                  </Badge>
                ))}
              </div>
              {formData.affectedServices.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Click to select affected services
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
