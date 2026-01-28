"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
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

// scopeColors removed - unused

export default function RolesPage() {
  const t = useTranslations("admin.roles")
  const tCommon = useTranslations("common")
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
        toast.error(data.error || t("cloneError"))
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
        toast.error(data.error || t("deleteError"))
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
      header: t("table.role"),
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
      header: t("table.description"),
      cell: (role) => (
        <span className="text-sm text-muted-foreground line-clamp-2">
          {role.description || "-"}
        </span>
      ),
    },
    {
      id: "permissions",
      header: t("table.permissions"),
      headerClassName: "text-center",
      className: "text-center",
      cell: (role) => (
        <Badge variant="outline">
          {role.permissions.includes("super:*") || role.permissions.includes("admin:*")
            ? t("all")
            : role.permissions.length}
        </Badge>
      ),
    },
    {
      id: "admins",
      header: t("table.assigned"),
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
      header: t("table.priority"),
      headerClassName: "text-center",
      className: "text-center",
      cell: (role) => (
        <Badge variant="secondary">{role.priority}</Badge>
      ),
    },
    {
      id: "status",
      header: t("table.status"),
      headerClassName: "text-center",
      className: "text-center",
      cell: (role) =>
        role.isActive ? (
          <Badge variant="default" className="bg-green-500">{t("status.active")}</Badge>
        ) : (
          <Badge variant="secondary">{t("status.inactive")}</Badge>
        ),
    },
  ]

  const rowActions: RowAction<Role>[] = canManageRoles
    ? [
        {
          label: t("clone"),
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
              <CardTitle>{t("title")}</CardTitle>
              <CardDescription>
                {t("description")}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchRoles} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                {tCommon("refresh")}
              </Button>
              {canManageRoles && (
                <Link href="/admin/roles/new">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    {t("newRole")}
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
                {t("tabs.platformRoles")}
              </TabsTrigger>
              <TabsTrigger value="TENANT" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {t("tabs.organizationRoles")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="PLATFORM">
              <p className="text-sm text-muted-foreground mb-4">
                {t("platformRolesDescription")}
              </p>
              <AdminDataTable
                data={filteredRoles}
                columns={columns}
                getRowId={(role) => role.id}
                isLoading={isLoading}
                emptyMessage={t("noPlatformRoles")}
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
                deleteConfirmTitle={t("deleteRole")}
                deleteConfirmDescription={(role) =>
                  t("confirmDelete", { name: role.displayName })
                }
                rowActions={rowActions}
              />
            </TabsContent>

            <TabsContent value="TENANT">
              <p className="text-sm text-muted-foreground mb-4">
                {t("organizationRolesDescription")}
              </p>
              <AdminDataTable
                data={filteredRoles}
                columns={columns}
                getRowId={(role) => role.id}
                isLoading={isLoading}
                emptyMessage={t("noOrganizationRoles")}
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
                deleteConfirmTitle={t("deleteRole")}
                deleteConfirmDescription={(role) =>
                  t("confirmDelete", { name: role.displayName })
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
            <DialogTitle>{t("cloneDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("cloneDialog.description", { name: roleToClone?.displayName || "" })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("form.nameSlug")}</Label>
              <Input
                placeholder={t("form.namePlaceholder")}
                value={cloneFormData.name}
                onChange={(e) => setCloneFormData(prev => ({ ...prev, name: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                {t("form.nameHint")}
              </p>
            </div>
            <div className="space-y-2">
              <Label>{t("form.displayName")}</Label>
              <Input
                placeholder={t("form.displayNamePlaceholder")}
                value={cloneFormData.displayName}
                onChange={(e) => setCloneFormData(prev => ({ ...prev, displayName: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloneDialogOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button
              onClick={handleClone}
              disabled={!cloneFormData.name || !cloneFormData.displayName || isCloning}
            >
              {isCloning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("cloning")}
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  {t("cloneRole")}
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
            <DialogTitle>{t("deleteRole")}</DialogTitle>
            <DialogDescription>
              {t("confirmDelete", { name: roleToDelete?.displayName || "" })}
            </DialogDescription>
          </DialogHeader>
          {roleToDelete?._count?.superAdmins && roleToDelete._count.superAdmins > 0 && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {t("roleHasAdmins", { count: roleToDelete._count.superAdmins })}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || (roleToDelete?._count?.superAdmins || 0) > 0}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("deleting")}
                </>
              ) : (
                t("deleteRole")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
