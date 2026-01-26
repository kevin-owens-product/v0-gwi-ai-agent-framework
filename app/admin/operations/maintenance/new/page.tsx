"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  Loader2,
  Wrench,
  Calendar,
  Clock,
  Bell,
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

const typeOptions = [
  { value: "SCHEDULED", label: "Scheduled", description: "Planned maintenance window" },
  { value: "EMERGENCY", label: "Emergency", description: "Urgent maintenance required" },
  { value: "UPGRADE", label: "Upgrade", description: "System or component upgrade" },
  { value: "MIGRATION", label: "Migration", description: "Data or service migration" },
  { value: "SECURITY_PATCH", label: "Security Patch", description: "Security-related updates" },
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

const regionOptions = [
  "US East",
  "US West",
  "EU West",
  "EU Central",
  "Asia Pacific",
  "Global",
]

export default function NewMaintenancePage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "SCHEDULED",
    affectedServices: [] as string[],
    affectedRegions: [] as string[],
    scheduledStart: "",
    scheduledEnd: "",
    notifyBefore: 24,
  })

  const handleCreate = async () => {
    if (!formData.title || !formData.scheduledStart || !formData.scheduledEnd) {
      toast.error("Title, start time, and end time are required")
      return
    }

    if (new Date(formData.scheduledEnd) <= new Date(formData.scheduledStart)) {
      toast.error("End time must be after start time")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/operations/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          description: formData.description || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to schedule maintenance")
      }

      const data = await response.json()
      toast.success("Maintenance window scheduled")
      router.push(`/admin/operations/maintenance/${data.window.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to schedule maintenance")
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

  const toggleRegion = (region: string) => {
    setFormData(prev => ({
      ...prev,
      affectedRegions: prev.affectedRegions.includes(region)
        ? prev.affectedRegions.filter(r => r !== region)
        : [...prev.affectedRegions, region],
    }))
  }

  const calculateDuration = () => {
    if (!formData.scheduledStart || !formData.scheduledEnd) return null
    const start = new Date(formData.scheduledStart)
    const end = new Date(formData.scheduledEnd)
    const diff = end.getTime() - start.getTime()
    if (diff <= 0) return null
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  const duration = calculateDuration()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/operations/maintenance">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wrench className="h-6 w-6 text-primary" />
              Schedule Maintenance
            </h1>
            <p className="text-sm text-muted-foreground">
              Create a new scheduled maintenance window
            </p>
          </div>
        </div>
        <Button
          onClick={handleCreate}
          disabled={isSaving || !formData.title || !formData.scheduledStart || !formData.scheduledEnd}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Scheduling...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Schedule Maintenance
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Details</CardTitle>
            <CardDescription>
              Basic information about the maintenance window
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Database upgrade"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the maintenance work being performed..."
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
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

        {/* Scheduling */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule
            </CardTitle>
            <CardDescription>
              Set the maintenance window timing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledStart">Start Time *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="scheduledStart"
                    type="datetime-local"
                    className="pl-10"
                    value={formData.scheduledStart}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledStart: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledEnd">End Time *</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="scheduledEnd"
                    type="datetime-local"
                    className="pl-10"
                    value={formData.scheduledEnd}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledEnd: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {duration && (
              <div className="p-3 rounded-md bg-muted">
                <p className="text-sm">
                  <span className="font-medium">Duration:</span> {duration}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notifyBefore" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notify Before (hours)
              </Label>
              <Input
                id="notifyBefore"
                type="number"
                min="1"
                max="168"
                value={formData.notifyBefore}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notifyBefore: parseInt(e.target.value) || 24,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Users will be notified {formData.notifyBefore} hours before maintenance begins
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Affected Services */}
        <Card>
          <CardHeader>
            <CardTitle>Affected Services</CardTitle>
            <CardDescription>
              Select all services that will be affected
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

        {/* Affected Regions */}
        <Card>
          <CardHeader>
            <CardTitle>Affected Regions</CardTitle>
            <CardDescription>
              Select the geographic regions impacted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {regionOptions.map((region) => (
                <Badge
                  key={region}
                  variant={
                    formData.affectedRegions.includes(region)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => toggleRegion(region)}
                >
                  {region}
                </Badge>
              ))}
            </div>
            {formData.affectedRegions.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Click to select affected regions
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
