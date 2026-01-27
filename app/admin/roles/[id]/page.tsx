"use client"

import { useState, useEffect, use } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
  Lock,
  Users,
  History,
  Settings,
  Key,
} from "lucide-react"
import Link from "next/link"
import { useAdmin } from "@/components/providers/admin-provider"
import { PermissionMatrix } from "@/components/admin/roles/permission-matrix"

interface Role {
  id: string
  name: string
  displayName: string
  description: string | null
  scope: "PLATFORM" | "TENANT"
  permissions: string[]
  isSystem: boolean
  isActive: boolean
  priority: number
  color: string | null
  icon: string | null
  createdAt: string
  updatedAt: string
  parentRole: { id: string; name: string; displayName: string; permissions: string[] } | null
  childRoles: { id: string; name: string; displayName: string }[]
  superAdmins: { id: string; email: string; name: string }[]
  creator: { id: string; email: string; name: string } | null
}

interface AuditLog {
  id: string
  action: string
  createdAt: string
  changes: Record<string, unknown> | null
  performedBy: { id: string; email: string; name: string }
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

export default function RoleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  useRouter()
  const { admin: currentAdmin } = useAdmin()
  const [role, setRole] = useState<Role | null>(null)
  const [, setEffectivePermissions] = useState<string[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [allRoles, setAllRoles] = useState<{ id: string; name: string; displayName: string }[]>([])

  const [formData, setFormData] = useState({
    displayName: "",
    description: "",
    permissions: [] as string[],
    parentRoleId: "" as string | null,
    color: "",
    isActive: true,
    priority: 0,
  })

  const canEdit = currentAdmin.role === "SUPER_ADMIN"

  useEffect(() => {
    async function fetchRole() {
      setIsLoading(true)
      try {
        const [roleResponse, auditResponse] = await Promise.all([
          fetch(`/api/admin/roles/${id}?includeEffectivePermissions=true`),
          fetch(`/api/admin/roles/${id}/audit?limit=10`),
        ])

        if (roleResponse.ok) {
          const roleData = await roleResponse.json()
          setRole(roleData.role)
          setEffectivePermissions(roleData.effectivePermissions || [])
          setFormData({
            displayName: roleData.role.displayName,
            description: roleData.role.description || "",
            permissions: roleData.role.permissions,
            parentRoleId: roleData.role.parentRole?.id || null,
            color: roleData.role.color || "",
            isActive: roleData.role.isActive,
            priority: roleData.role.priority,
          })
        }

        if (auditResponse.ok) {
          const auditData = await auditResponse.json()
          setAuditLogs(auditData.logs || [])
        }
      } catch (error) {
        console.error("Failed to fetch role:", error)
      } finally {
        setIsLoading(false)
      }
    }

    async function fetchAllRoles() {
      try {
        const response = await fetch("/api/admin/roles")
        if (response.ok) {
          const data = await response.json()
          setAllRoles(data.roles || [])
        }
      } catch (error) {
        console.error("Failed to fetch roles:", error)
      }
    }

    fetchRole()
    fetchAllRoles()
  }, [id])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/roles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: formData.displayName,
          description: formData.description || null,
          permissions: formData.permissions,
          parentRoleId: formData.parentRoleId || null,
          color: formData.color || null,
          isActive: formData.isActive,
          priority: formData.priority,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setRole(data.role)
        // Refresh effective permissions
        const refreshResponse = await fetch(`/api/admin/roles/${id}?includeEffectivePermissions=true`)
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json()
          setEffectivePermissions(refreshData.effectivePermissions || [])
        }
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to save role")
      }
    } catch (error) {
      console.error("Failed to save role:", error)
      toast.error("Failed to save role")
    } finally {
      setIsSaving(false)
    }
  }

  const inheritedPermissions = role?.parentRole?.permissions || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Role not found</p>
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
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: role.color ? `${role.color}20` : "var(--primary-10)" }}
            >
              {role.scope === "PLATFORM" ? (
                <Shield className="h-5 w-5" style={{ color: role.color || "var(--primary)" }} />
              ) : (
                <Building2 className="h-5 w-5" style={{ color: role.color || "var(--primary)" }} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{role.displayName}</h1>
                {role.isSystem && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    System
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{role.name}</p>
            </div>
          </div>
        </div>
        {canEdit && (
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        )}
      </div>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Assigned Admins
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Audit Log
          </TabsTrigger>
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
                  <Label>Display Name</Label>
                  <Input
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    disabled={!canEdit}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Scope</Label>
                  <Input
                    value={role.scope === "PLATFORM" ? "Platform (Super Admin)" : "Organization (Tenant)"}
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this role is for..."
                  disabled={!canEdit}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Parent Role (Inherits Permissions)</Label>
                  <Select
                    value={formData.parentRoleId || "none"}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, parentRoleId: v === "none" ? null : v }))}
                    disabled={!canEdit}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No parent role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No parent role</SelectItem>
                      {allRoles
                        .filter(r => r.id !== id)
                        .map(r => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.displayName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                    disabled={!canEdit}
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher priority roles have more privileges in the hierarchy
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Select
                    value={formData.color || "none"}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, color: v === "none" ? "" : v }))}
                    disabled={!canEdit}
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
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="font-medium">Active</p>
                      <p className="text-xs text-muted-foreground">
                        Allow this role to be assigned
                      </p>
                    </div>
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                      disabled={!canEdit}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-6 text-sm text-muted-foreground">
                <div>
                  <p>Created: {new Date(role.createdAt).toLocaleString()}</p>
                  {role.creator && (
                    <p>By: {role.creator.name} ({role.creator.email})</p>
                  )}
                </div>
                <div>
                  <p>Last Updated: {new Date(role.updatedAt).toLocaleString()}</p>
                </div>
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
                {inheritedPermissions.length > 0 && (
                  <span className="block mt-1">
                    This role inherits {inheritedPermissions.length} permission(s) from its parent role.
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PermissionMatrix
                scope={role.scope}
                selectedPermissions={formData.permissions}
                onPermissionsChange={(permissions) => setFormData(prev => ({ ...prev, permissions }))}
                inheritedPermissions={inheritedPermissions}
                disabled={!canEdit}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Admins</CardTitle>
              <CardDescription>
                Admins currently assigned to this role
              </CardDescription>
            </CardHeader>
            <CardContent>
              {role.superAdmins.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No admins assigned to this role
                </p>
              ) : (
                <div className="space-y-2">
                  {role.superAdmins.map(admin => (
                    <div
                      key={admin.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{admin.name}</p>
                          <p className="text-sm text-muted-foreground">{admin.email}</p>
                        </div>
                      </div>
                      <Link href={`/admin/admins/${admin.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>
                Recent changes to this role
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No audit logs found
                </p>
              ) : (
                <div className="space-y-4">
                  {auditLogs.map(log => (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 p-3 border rounded-lg"
                    >
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <History className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{log.action}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm mt-1">
                          By {log.performedBy.name} ({log.performedBy.email})
                        </p>
                        {log.changes && (
                          <pre className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded overflow-auto">
                            {JSON.stringify(log.changes, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
