"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import {
  ArrowLeft,
  Save,
  Loader2,
  Gavel,
} from "lucide-react"
import Link from "next/link"

interface Organization {
  id: string
  name: string
  slug: string
}

export default function NewLegalHoldPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    caseNumber: "",
    orgId: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    notes: "",
  })

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const response = await fetch("/api/admin/tenants?limit=100", {
          credentials: "include",
        })
        if (response.ok) {
          const data = await response.json()
          setOrganizations(data.tenants || [])
        }
      } catch (error) {
        console.error("Failed to fetch organizations:", error)
      }
    }
    fetchOrganizations()
  }, [])

  const handleCreate = async () => {
    if (!formData.name || !formData.startDate) {
      alert("Name and start date are required")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/compliance/legal-holds", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          caseNumber: formData.caseNumber || null,
          orgId: formData.orgId || null,
          startDate: formData.startDate,
          endDate: formData.endDate || null,
          notes: formData.notes || null,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        const data = await response.json()
        throw new Error(data.error || "Failed to create legal hold")
      }

      const data = await response.json()
      router.push(`/admin/compliance/legal-holds/${data.legalHold?.id || ""}`)
    } catch (error) {
      console.error("Failed to create legal hold:", error)
      alert(error instanceof Error ? error.message : "Failed to create legal hold")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/compliance/legal-holds">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Gavel className="h-6 w-6 text-red-500" />
              Create Legal Hold
            </h1>
            <p className="text-sm text-muted-foreground">
              Create a new data preservation order
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.name || !formData.startDate}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Legal Hold
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Legal Hold Details</CardTitle>
          <CardDescription>
            Define the scope and details of the data preservation order
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Legal Hold Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Investigation Q1 2024"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caseNumber">Case Number</Label>
              <Input
                id="caseNumber"
                value={formData.caseNumber}
                onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                placeholder="CASE-2024-001"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Organization (Optional)</Label>
            <Select
              value={formData.orgId || "none"}
              onValueChange={(value) => setFormData({ ...formData, orgId: value === "none" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Platform-wide (no specific org)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Platform-wide (no specific org)</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Leave empty for platform-wide legal holds
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for indefinite holds
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the purpose and scope of this legal hold..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Internal Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional internal notes or instructions..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
