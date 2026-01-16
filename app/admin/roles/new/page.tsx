"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
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
  Shield,
  Building2,
} from "lucide-react"
import Link from "next/link"
import { useAdmin } from "@/components/providers/admin-provider"
import { PermissionMatrix } from "@/components/admin/roles/permission-matrix"

interface ExistingRole {
  id: string
  name: string
  displayName: string
  scope: string
}

const colorOptions = [
  { value: "#8B5CF6", label: "Purple" },
  { value: "#3B82F6", label: "Blue" },
  { value: "#10B981", label: "Green" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#EF4444", label: "Red" },
  { value: "#6B7280", label: "Gray" },
  { value: "#EC4899", label: "Pink" },
  { value: "#14B8A6", label: "Teal" },
]

export default function NewRolePage() {
  const router = useRouter()
  const { admin: currentAdmin } = useAdmin()
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [allRoles, setAllRoles] = useState<ExistingRole[]>([])
  const [parentPermissions, setParentPermissions] = useState<string[]>([])

  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    scope: "PLATFORM" as "PLATFORM" | "TENANT",
    permissions: [] as string[],
    parentRoleId: "" as string | null,
    color: "",
    priority: 50,
  })

  const canCreate = currentAdmin.role === "SUPER_ADMIN"

  useEffect(() => {
    async function fetchRoles() {
      try {
        const response = await fetch(`/api/admin/roles?scope=${formData.scope}`)
        if (response.ok) {
          const data = await response.json()
          setAllRoles(data.roles || [])
        }
      } catch (error) {
        console.error("Failed to fetch roles:", error)
      }
    }
    fetchRoles()
  }, [formData.scope])

  useEffect(() => {
    async function fetchParentPermissions() {
      if (!formData.parentRoleId) {
        setParentPermissions([])
        return
      }
      try {
        const response = await fetch(`/api/admin/roles/${formData.parentRoleId}?includeEffectivePermissions=true`)
        if (response.ok) {
          const data = await response.json()
          setParentPermissions(data.effectivePermissions || data.role?.permissions || [])
        }
      } catch (error) {
        console.error("Failed to fetch parent permissions:", error)
      }
    }
    fetchParentPermissions()
  }, [formData.parentRoleId])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  const handleDisplayNameChange = (displayName: string) => {
    setFormData(prev => ({
      ...prev,
      displayName,
      name: prev.name || generateSlug(displayName),
    }))
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.displayName) {
      alert("Name and display name are required")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          displayName: formData.displayName,
          description: formData.description || null,
          scope: formData.scope,
          permissions: formData.permissions,
          parentRoleId: formData.parentRoleId || null,
          color: formData.color || null,
          priority: formData.priority,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/admin/roles/${data.role.id}`)
      } else {
        const data = await response.json()
        alert(data.error || "Failed to create role")
      }
    } catch (error) {
      console.error("Failed to create role:", error)
      alert("Failed to create role")
    } finally {
      setIsSaving(false)
    }
  }

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">You don&apos;t have permission to create roles</p>
        <Link href="/admin/roles">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Roles
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
          <Link href="/admin/roles">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Create New Role</h1>
            <p className="text-sm text-muted-foreground">
              Define a new role with custom permissions
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.name || !formData.displayName}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Role
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role Details</CardTitle>
              <CardDescription>
                Basic information about this role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Display Name *</Label>
                  <Input
                    value={formData.displayName}
                    onChange={(e) => handleDisplayNameChange(e.target.value)}
                    placeholder="Custom Admin Role"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug (Name) *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="custom-admin-role"
                  />
                  <p className="text-xs text-muted-foreground">
                    Lowercase letters, numbers, and hyphens only
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Scope *</Label>
                <Select
                  value={formData.scope}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, scope: v as "PLATFORM" | "TENANT", parentRoleId: null }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLATFORM">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Platform (Super Admin)
                      </div>
                    </SelectItem>
                    <SelectItem value="TENANT">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Organization (Tenant)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {formData.scope === "PLATFORM"
                    ? "Platform roles are for super admins managing the entire platform"
                    : "Organization roles are for users within individual organizations"
                  }
                </p>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this role is for..."
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Parent Role (Inherits Permissions)</Label>
                  <Select
                    value={formData.parentRoleId || "none"}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, parentRoleId: v === "none" ? null : v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No parent role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No parent role</SelectItem>
                      {allRoles
                        .filter(r => r.scope === formData.scope)
                        .map(r => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.displayName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    The new role will inherit all permissions from the parent role
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher priority roles have more privileges in the hierarchy (0-100)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <Select
                  value={formData.color || "none"}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, color: v === "none" ? "" : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Default</SelectItem>
                    {colorOptions.map(color => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded"
                            style={{ backgroundColor: color.value }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                Select which permissions this role should have.
                {parentPermissions.length > 0 && (
                  <span className="block mt-1">
                    This role will inherit {parentPermissions.length} permission(s) from its parent role.
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PermissionMatrix
                scope={formData.scope}
                selectedPermissions={formData.permissions}
                onPermissionsChange={(permissions) => setFormData(prev => ({ ...prev, permissions }))}
                inheritedPermissions={parentPermissions}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
