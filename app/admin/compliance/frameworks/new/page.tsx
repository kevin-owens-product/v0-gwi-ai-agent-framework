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
  ArrowLeft,
  Save,
  Loader2,
  Shield,
} from "lucide-react"
import Link from "next/link"

export default function NewFrameworkPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    version: "",
    isActive: true,
  })

  const handleCreate = async () => {
    if (!formData.name || !formData.code) {
      toast.error("Name and code are required")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/compliance/frameworks", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          code: formData.code.toUpperCase(),
          description: formData.description || null,
          version: formData.version || null,
          isActive: formData.isActive,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        const data = await response.json()
        throw new Error(data.error || "Failed to create framework")
      }

      const data = await response.json()
      router.push(`/admin/compliance/frameworks/${data.framework?.id || ""}`)
    } catch (error) {
      console.error("Failed to create framework:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create framework")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/compliance/frameworks">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Create Compliance Framework
            </h1>
            <p className="text-sm text-muted-foreground">
              Add a new compliance standard (SOC2, HIPAA, GDPR, etc.)
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.name || !formData.code}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Framework
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Framework Details</CardTitle>
          <CardDescription>
            Define the compliance framework standards and requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Framework Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="SOC 2 Type II"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="SOC2"
              />
              <p className="text-xs text-muted-foreground">
                Short identifier code (e.g., SOC2, HIPAA, GDPR)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="version">Version</Label>
            <Input
              id="version"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              placeholder="2023"
            />
            <p className="text-xs text-muted-foreground">
              The version or year of the framework standard
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Service Organization Control 2 compliance framework for security, availability, processing integrity, confidentiality, and privacy..."
              rows={4}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Active Status</Label>
              <p className="text-sm text-muted-foreground">
                Enable this framework for attestations and audits
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
