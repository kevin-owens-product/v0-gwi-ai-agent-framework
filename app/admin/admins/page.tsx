"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Shield,
  Plus,
  Loader2,
  RefreshCw,
  Pencil,
  Trash2,
  Key,
  Clock,
  Globe,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { useAdmin } from "@/components/providers/admin-provider"
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"

interface Admin {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
  twoFactorEnabled: boolean
  lastLoginAt: string | null
  lastLoginIp: string | null
  createdAt: string
}

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-500",
  ADMIN: "bg-blue-500",
  SUPPORT: "bg-green-500",
  ANALYST: "bg-slate-500",
}

export default function AdminsPage() {
  const t = useTranslations("admin.admins")
  const tCommon = useTranslations("common")
  const { admin: currentAdmin } = useAdmin()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    role: "ADMIN",
    isActive: true,
  })

  const fetchAdmins = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/admins")
      const data = await response.json()
      setAdmins(data.admins)
    } catch (error) {
      console.error("Failed to fetch admins:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  const resetForm = () => {
    setFormData({
      email: "",
      name: "",
      password: "",
      role: "ADMIN",
      isActive: true,
    })
    setEditingAdmin(null)
  }

  const handleOpenDialog = (admin?: Admin) => {
    if (admin) {
      setEditingAdmin(admin)
      setFormData({
        email: admin.email,
        name: admin.name,
        password: "",
        role: admin.role,
        isActive: admin.isActive,
      })
    } else {
      resetForm()
    }
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const url = editingAdmin
        ? `/api/admin/admins/${editingAdmin.id}`
        : "/api/admin/admins"
      const method = editingAdmin ? "PATCH" : "POST"

      const payload = editingAdmin
        ? {
            name: formData.name,
            role: formData.role,
            isActive: formData.isActive,
            ...(formData.password && { password: formData.password }),
          }
        : formData

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      setDialogOpen(false)
      resetForm()
      fetchAdmins()
    } catch (error) {
      console.error("Failed to save admin:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (admin: Admin) => {
    if (admin.id === currentAdmin.id) {
      toast.error(t("cannotDeleteSelf"))
      return
    }
    try {
      await fetch(`/api/admin/admins/${admin.id}`, { method: "DELETE" })
      fetchAdmins()
    } catch (error) {
      console.error("Failed to delete admin:", error)
    }
  }

  const handleBulkActivate = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map(id =>
          fetch(`/api/admin/admins/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: true }),
          })
        )
      )
      fetchAdmins()
    } catch (error) {
      console.error("Failed to activate admins:", error)
    }
  }

  const handleBulkDeactivate = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map(id =>
          fetch(`/api/admin/admins/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: false }),
          })
        )
      )
      fetchAdmins()
    } catch (error) {
      console.error("Failed to deactivate admins:", error)
    }
  }

  const isSuperAdmin = currentAdmin.role === "SUPER_ADMIN"

  // Define columns for AdminDataTable
  const columns: Column<Admin>[] = [
    {
      id: "admin",
      header: t("admin"),
      cell: (admin) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">
              {admin.name}
              {admin.id === currentAdmin.id && (
                <span className="ml-2 text-xs text-muted-foreground">({t("you")})</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">{admin.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: "role",
      header: t("role"),
      cell: (admin) => (
        <Badge className={`${roleColors[admin.role]} text-white`}>
          {admin.role.replace("_", " ")}
        </Badge>
      ),
    },
    {
      id: "status",
      header: tCommon("status"),
      headerClassName: "text-center",
      className: "text-center",
      cell: (admin) =>
        admin.isActive ? (
          <Badge variant="default" className="bg-green-500">{tCommon("active")}</Badge>
        ) : (
          <Badge variant="secondary">{tCommon("inactive")}</Badge>
        ),
    },
    {
      id: "2fa",
      header: t("twoFactor"),
      headerClassName: "text-center",
      className: "text-center",
      cell: (admin) =>
        admin.twoFactorEnabled ? (
          <Key className="h-4 w-4 text-green-500 mx-auto" />
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        ),
    },
    {
      id: "lastLogin",
      header: t("lastLogin"),
      cell: (admin) =>
        admin.lastLoginAt ? (
          <div>
            <div className="flex items-center gap-1 text-sm">
              <Clock className="h-3 w-3 text-muted-foreground" />
              {new Date(admin.lastLoginAt).toLocaleDateString()}
            </div>
            {admin.lastLoginIp && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Globe className="h-3 w-3" />
                {admin.lastLoginIp}
              </div>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">{t("never")}</span>
        ),
    },
    {
      id: "created",
      header: t("created"),
      cell: (admin) => (
        <span className="text-muted-foreground">
          {new Date(admin.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ]

  // Define row actions (only if super admin)
  const rowActions: RowAction<Admin>[] = isSuperAdmin
    ? [
        {
          label: tCommon("edit"),
          icon: <Pencil className="h-4 w-4" />,
          onClick: (admin) => handleOpenDialog(admin),
        },
      ]
    : []

  // Define bulk actions (only if super admin)
  const bulkActions: BulkAction[] = isSuperAdmin
    ? [
        {
          label: t("activateSelected"),
          icon: <CheckCircle className="h-4 w-4" />,
          onClick: handleBulkActivate,
          confirmTitle: t("activateAdmins"),
          confirmDescription: t("confirmActivate"),
        },
        {
          label: t("deactivateSelected"),
          icon: <XCircle className="h-4 w-4" />,
          onClick: handleBulkDeactivate,
          variant: "destructive",
          confirmTitle: t("deactivateAdmins"),
          confirmDescription: t("confirmDeactivate"),
        },
      ]
    : []

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
              <Button onClick={fetchAdmins} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                {tCommon("refresh")}
              </Button>
              {isSuperAdmin && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => handleOpenDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t("newAdmin")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingAdmin ? t("editAdmin") : t("createAdmin")}
                      </DialogTitle>
                      <DialogDescription>
                        {editingAdmin
                          ? t("updateAdminDetails")
                          : t("addNewAdmin")}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t("email")}</Label>
                        <Input
                          type="email"
                          placeholder={t("emailPlaceholder")}
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          disabled={!!editingAdmin}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{tCommon("name")}</Label>
                        <Input
                          placeholder={t("namePlaceholder")}
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{editingAdmin ? t("newPassword") : t("password")}</Label>
                        <Input
                          type="password"
                          placeholder={editingAdmin ? t("leaveEmptyToKeep") : t("password")}
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("role")}</Label>
                        <Select
                          value={formData.role}
                          onValueChange={(v) => setFormData(prev => ({ ...prev, role: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SUPER_ADMIN">{t("roles.superAdmin")}</SelectItem>
                            <SelectItem value="ADMIN">{t("roles.admin")}</SelectItem>
                            <SelectItem value="SUPPORT">{t("roles.support")}</SelectItem>
                            <SelectItem value="ANALYST">{t("roles.analyst")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>{tCommon("active")}</Label>
                          <p className="text-xs text-muted-foreground">{t("allowLogin")}</p>
                        </div>
                        <Switch
                          checked={formData.isActive}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        {tCommon("cancel")}
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={!formData.email || !formData.name || (!editingAdmin && !formData.password) || isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {t("saving")}
                          </>
                        ) : editingAdmin ? (
                          t("updateAdmin")
                        ) : (
                          t("createAdmin")
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AdminDataTable
            data={admins}
            columns={columns}
            getRowId={(admin) => admin.id}
            isLoading={isLoading}
            emptyMessage={t("noAdmins")}
            viewHref={isSuperAdmin ? (admin) => `/admin/admins/${admin.id}` : undefined}
            onDelete={
              isSuperAdmin
                ? (admin) => {
                    if (admin.id !== currentAdmin.id) {
                      handleDelete(admin)
                    }
                  }
                : undefined
            }
            deleteConfirmTitle={t("deleteAdmin")}
            deleteConfirmDescription={(admin) =>
              t("confirmDeleteAdmin", { name: admin.name })
            }
            rowActions={rowActions}
            bulkActions={bulkActions}
            enableSelection={isSuperAdmin}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </CardContent>
      </Card>
    </div>
  )
}
