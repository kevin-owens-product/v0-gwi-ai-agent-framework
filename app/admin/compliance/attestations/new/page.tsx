"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  FileText,
} from "lucide-react"
import Link from "next/link"

interface Framework {
  id: string
  name: string
  code: string
}

interface Organization {
  id: string
  name: string
  slug: string
}

const STATUS_OPTIONS = [
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLIANT", label: "Compliant" },
  { value: "NON_COMPLIANT", label: "Non-Compliant" },
]

export default function NewAttestationPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [frameworks, setFrameworks] = useState<Framework[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [formData, setFormData] = useState({
    frameworkId: "",
    orgId: "",
    status: "NOT_STARTED",
    validUntil: "",
    attestedBy: "",
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [frameworksRes, orgsRes] = await Promise.all([
          fetch("/api/admin/compliance/frameworks?limit=100&isActive=true", {
            credentials: "include",
          }),
          fetch("/api/admin/tenants?limit=100", {
            credentials: "include",
          }),
        ])

        if (frameworksRes.ok) {
          const data = await frameworksRes.json()
          setFrameworks(data.frameworks || [])
        }
        if (orgsRes.ok) {
          const data = await orgsRes.json()
          setOrganizations(data.tenants || [])
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      }
    }
    fetchData()
  }, [])

  const handleCreate = async () => {
    if (!formData.frameworkId || !formData.orgId) {
      alert("Framework and organization are required")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/compliance/attestations", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frameworkId: formData.frameworkId,
          orgId: formData.orgId,
          status: formData.status,
          validUntil: formData.validUntil || null,
          attestedBy: formData.attestedBy || null,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        const data = await response.json()
        throw new Error(data.error || "Failed to create attestation")
      }

      const data = await response.json()
      router.push(`/admin/compliance/attestations/${data.attestation?.id || ""}`)
    } catch (error) {
      console.error("Failed to create attestation:", error)
      alert(error instanceof Error ? error.message : "Failed to create attestation")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/compliance/attestations">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Create Attestation
            </h1>
            <p className="text-sm text-muted-foreground">
              Create a new compliance attestation for an organization
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.frameworkId || !formData.orgId}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Attestation
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Attestation Details</CardTitle>
          <CardDescription>
            Configure the compliance attestation for an organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Organization *</Label>
            <Select
              value={formData.orgId}
              onValueChange={(value) => setFormData({ ...formData, orgId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Framework *</Label>
            <Select
              value={formData.frameworkId}
              onValueChange={(value) => setFormData({ ...formData, frameworkId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a framework" />
              </SelectTrigger>
              <SelectContent>
                {frameworks.map((framework) => (
                  <SelectItem key={framework.id} value={framework.id}>
                    {framework.name} ({framework.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Initial Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid Until (Optional)</Label>
              <Input
                id="validUntil"
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Expiration date for the attestation
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="attestedBy">Attested By (Optional)</Label>
            <Input
              id="attestedBy"
              value={formData.attestedBy}
              onChange={(e) => setFormData({ ...formData, attestedBy: e.target.value })}
              placeholder="Name of the person attesting"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
