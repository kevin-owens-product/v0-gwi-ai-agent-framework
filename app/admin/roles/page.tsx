"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Shield,
  Users,
  Plus,
  Loader2,
  RefreshCw,
  Copy,
  Lock,
  Building2,
} from "lucide-react"
import Link from "next/link"
import { useAdmin } from "@/components/providers/admin-provider"
import { AdminDataTable, Column, RowAction } from "@/components/admin/data-table"

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
  parentRole: { id: string; name: string; displayName: string } | null
  _count?: { superAdmins: number }
}

const scopeColors: Record<string, string> = {
  PLATFORM: "bg-purple-500",
  TENANT: "bg-blue-500",
}

export default function RolesPage() {
  const { admin: currentAdmin } = useAdmin()
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"PLATFORM" | "TENANT">("PLATFORM")
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false)
  const [roleToClone, setRoleToClone] = useState<Role | null>(null)
  const [cloneFormData, setCloneFormData] = useState({ name: "", displayName: "" })
  const [isCloning, setIsCloning] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchRoles = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/roles?scope=${activeTab}`)
      const data = await response.json()
      setRoles(data.roles || [])
    } catch (error) {
      console.error("Failed to fetch roles:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [activeTab])

  const handleCloneOpen = (role: Role) => {
    setRoleToClone(role)
    setCloneFormData({
      name: `${role.name}-copy`,
      displayName: `${role.displayName} (Copy)`,
    })
    setCloneDialogOpen(true)
  }

  const handleClone = async () => {
    if (!roleToClone) return
    setIsCloning(true)
    try {
      const response = await fetch(`/api/admin/roles/${roleToClone.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "clone",
          name: cloneFormData.name,
          displayName: cloneFormData.displayName,
        }),
      })
      if (response.ok) {
        setCloneDialogOpen(false)
        setRoleToClone(null)
        fetchRoles()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to clone role")
      }
    } catch (error) {
      console.error("Failed to clone role:", error)
    } finally {
      setIsCloning(false)
    }
  }

  const handleDeleteOpen = (role: Role) => {
    setRoleToDelete(role)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!roleToDelete) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/roles/${roleToDelete.id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setDeleteDialogOpen(false)
        setRoleToDelete(null)
        fetchRoles()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to delete role")
      }
    } catch (error) {
      console.error("Failed to delete role:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const canManageRoles = currentAdmin.role === "SUPER_ADMIN"

  const columns: Column<Role>[] = [
    {
      id: "role",
      header: "Role",
      cell: (role) => (
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: role.color ? `${role.color}20` : "var(--primary-10)" }}
          >
            {role.scope === "PLATFORM" ? (
              <Shield className="h-4 w-4" style={{ color: role.color || "var(--primary)" }} />
            ) : (
              <Building2 className="h-4 w-4" style={{ color: role.color || "var(--primary)" }} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{role.displayName}</p>
              {role.isSystem && (
                <Lock className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">{role.name}</p>
          </div>
        </div>
      ),
    },
    {
      id: "description",
      header: "Description",
      cell: (role) => (
        <span className="text-sm text-muted-foreground line-clamp-2">
          {role.description || "-"}
        </span>
      ),
    },
    {
      id: "permissions",
      header: "Permissions",
      headerClassName: "text-center",
      className: "text-center",
      cell: (role) => (
        <Badge variant="outline">
          {role.permissions.includes("super:*") || role.permissions.includes("admin:*")
            ? "All"
            : role.permissions.length}
        </Badge>
      ),
    },
    {
      id: "admins",
      header: "Assigned",
      headerClassName: "text-center",
      className: "text-center",
      cell: (role) => (
        <div className="flex items-center justify-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{role._count?.superAdmins || 0}</span>
        </div>
      ),
    },
    {
      id: "priority",
      header: "Priority",
      headerClassName: "text-center",
      className: "text-center",
      cell: (role) => (
        <Badge variant="secondary">{role.priority}</Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      headerClassName: "text-center",
      className: "text-center",
      cell: (role) =>
        role.isActive ? (
          <Badge variant="default" className="bg-green-500">Active</Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        ),
    },
  ]

  const rowActions: RowAction<Role>[] = canManageRoles
    ? [
        {
          label: "Clone",
          icon: <Copy className="h-4 w-4" />,
          onClick: handleCloneOpen,
        },
      ]
    : []

  const filteredRoles = roles.filter(role => role.scope === activeTab)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>
                Manage roles and their permissions for admins and organizations
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchRoles} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              {canManageRoles && (
                <Link href="/admin/roles/new">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Role
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "PLATFORM" | "TENANT")}>
            <TabsList className="mb-4">
              <TabsTrigger value="PLATFORM" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Platform Roles
              </TabsTrigger>
              <TabsTrigger value="TENANT" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Organization Roles
              </TabsTrigger>
            </TabsList>

            <TabsContent value="PLATFORM">
              <p className="text-sm text-muted-foreground mb-4">
                Platform roles control access for super admins managing the entire platform.
              </p>
              <AdminDataTable
                data={filteredRoles}
                columns={columns}
                getRowId={(role) => role.id}
                isLoading={isLoading}
                emptyMessage="No platform roles found"
                viewHref={(role) => `/admin/roles/${role.id}`}
                onDelete={
                  canManageRoles
                    ? (role) => {
                        if (!role.isSystem) {
                          handleDeleteOpen(role)
                        }
                      }
                    : undefined
                }
                deleteConfirmTitle="Delete Role"
                deleteConfirmDescription={(role) =>
                  `Are you sure you want to delete "${role.displayName}"? This action cannot be undone.`
                }
                rowActions={rowActions}
              />
            </TabsContent>

            <TabsContent value="TENANT">
              <p className="text-sm text-muted-foreground mb-4">
                Organization roles control access for users within individual organizations.
              </p>
              <AdminDataTable
                data={filteredRoles}
                columns={columns}
                getRowId={(role) => role.id}
                isLoading={isLoading}
                emptyMessage="No organization roles found"
                viewHref={(role) => `/admin/roles/${role.id}`}
                onDelete={
                  canManageRoles
                    ? (role) => {
                        if (!role.isSystem) {
                          handleDeleteOpen(role)
                        }
                      }
                    : undefined
                }
                deleteConfirmTitle="Delete Role"
                deleteConfirmDescription={(role) =>
                  `Are you sure you want to delete "${role.displayName}"? This action cannot be undone.`
                }
                rowActions={rowActions}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Clone Dialog */}
      <Dialog open={cloneDialogOpen} onOpenChange={setCloneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clone Role</DialogTitle>
            <DialogDescription>
              Create a copy of &quot;{roleToClone?.displayName}&quot; with a new name.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name (slug)</Label>
              <Input
                placeholder="custom-role"
                value={cloneFormData.name}
                onChange={(e) => setCloneFormData(prev => ({ ...prev, name: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Lowercase letters, numbers, and hyphens only
              </p>
            </div>
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input
                placeholder="Custom Role"
                value={cloneFormData.displayName}
                onChange={(e) => setCloneFormData(prev => ({ ...prev, displayName: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloneDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleClone}
              disabled={!cloneFormData.name || !cloneFormData.displayName || isCloning}
            >
              {isCloning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cloning...
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Clone Role
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{roleToDelete?.displayName}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {roleToDelete?._count?.superAdmins && roleToDelete._count.superAdmins > 0 && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              This role has {roleToDelete._count.superAdmins} admin(s) assigned. Please reassign them before deleting.
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || (roleToDelete?._count?.superAdmins || 0) > 0}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Role"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
