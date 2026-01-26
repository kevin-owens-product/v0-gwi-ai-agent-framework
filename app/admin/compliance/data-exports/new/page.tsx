"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  Download,
} from "lucide-react"
import Link from "next/link"

interface Organization {
  id: string
  name: string
  slug: string
}

interface User {
  id: string
  name: string | null
  email: string
}

interface LegalHold {
  id: string
  name: string
  caseNumber: string | null
}

const TYPE_OPTIONS = [
  { value: "USER_DATA", label: "User Data Export" },
  { value: "ORG_DATA", label: "Organization Data Export" },
  { value: "GDPR_EXPORT", label: "GDPR Data Export" },
  { value: "LEGAL_HOLD", label: "Legal Hold Export" },
  { value: "BACKUP", label: "Backup Export" },
]

const FORMAT_OPTIONS = [
  { value: "json", label: "JSON" },
  { value: "csv", label: "CSV" },
  { value: "zip", label: "ZIP Archive" },
]

export default function NewDataExportPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [legalHolds, setLegalHolds] = useState<LegalHold[]>([])
  const [formData, setFormData] = useState({
    type: "USER_DATA",
    format: "json",
    orgId: "",
    userId: "",
    legalHoldId: "",
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [orgsRes, usersRes, legalHoldsRes] = await Promise.all([
          fetch("/api/admin/tenants?limit=100", { credentials: "include" }),
          fetch("/api/admin/users?limit=100", { credentials: "include" }),
          fetch("/api/admin/compliance/legal-holds?limit=100&status=ACTIVE", { credentials: "include" }),
        ])

        if (orgsRes.ok) {
          const data = await orgsRes.json()
          setOrganizations(data.tenants || [])
        }
        if (usersRes.ok) {
          const data = await usersRes.json()
          setUsers(data.users || [])
        }
        if (legalHoldsRes.ok) {
          const data = await legalHoldsRes.json()
          setLegalHolds(data.legalHolds || [])
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      }
    }
    fetchData()
  }, [])

  const handleCreate = async () => {
    if (!formData.type) {
      alert("Export type is required")
      return
    }

    // Validate subject based on type
    if (formData.type === "USER_DATA" && !formData.userId) {
      alert("Please select a user for user data export")
      return
    }
    if (formData.type === "ORG_DATA" && !formData.orgId) {
      alert("Please select an organization for org data export")
      return
    }
    if (formData.type === "LEGAL_HOLD" && !formData.legalHoldId) {
      alert("Please select a legal hold")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/compliance/data-exports", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formData.type,
          format: formData.format,
          orgId: formData.orgId || null,
          userId: formData.userId || null,
          legalHoldId: formData.legalHoldId || null,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        const data = await response.json()
        throw new Error(data.error || "Failed to create data export")
      }

      const data = await response.json()
      router.push(`/admin/compliance/data-exports/${data.export?.id || ""}`)
    } catch (error) {
      console.error("Failed to create data export:", error)
      alert(error instanceof Error ? error.message : "Failed to create data export")
    } finally {
      setIsSaving(false)
    }
  }

  const showUserSelect = formData.type === "USER_DATA" || formData.type === "GDPR_EXPORT"
  const showOrgSelect = formData.type === "ORG_DATA"
  const showLegalHoldSelect = formData.type === "LEGAL_HOLD"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/compliance/data-exports">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Download className="h-6 w-6 text-green-500" />
              Create Data Export
            </h1>
            <p className="text-sm text-muted-foreground">
              Request a new data export for compliance purposes
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Export
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Export Configuration</CardTitle>
          <CardDescription>
            Configure the data export request. The export will be processed asynchronously.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Export Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({
                  ...formData,
                  type: value,
                  userId: "",
                  orgId: "",
                  legalHoldId: "",
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Format *</Label>
              <Select
                value={formData.format}
                onValueChange={(value) => setFormData({ ...formData, format: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMAT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {showUserSelect && (
            <div className="space-y-2">
              <Label>User {formData.type === "USER_DATA" ? "*" : "(Optional)"}</Label>
              <Select
                value={formData.userId || "none"}
                onValueChange={(value) => setFormData({ ...formData, userId: value === "none" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific user</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showOrgSelect && (
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
          )}

          {showLegalHoldSelect && (
            <div className="space-y-2">
              <Label>Legal Hold *</Label>
              <Select
                value={formData.legalHoldId}
                onValueChange={(value) => setFormData({ ...formData, legalHoldId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a legal hold" />
                </SelectTrigger>
                <SelectContent>
                  {legalHolds.map((hold) => (
                    <SelectItem key={hold.id} value={hold.id}>
                      {hold.name} {hold.caseNumber ? `(${hold.caseNumber})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="rounded-lg border p-4 bg-muted/50">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Data exports are processed asynchronously. You will be notified
              when the export is ready for download. Exports typically expire after 7 days.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
