"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Building2,
  Ban,
  CheckCircle,
  ExternalLink,
  Loader2,
  RefreshCw,
  Shield,
  Mail,
  Plus,
  Trash2,
  KeyRound,
  LogOut,
  BadgeCheck,
} from "lucide-react"
import { AdminDataTable, Column, RowAction, BulkAction } from "@/components/admin/data-table"

interface User {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  createdAt: string
  emailVerified: string | null
  isBanned: boolean
  memberships: {
    role: string
    organization: {
      id: string
      name: string
      slug: string
    }
  }[]
  _count: {
    sessions: number
  }
  ban?: {
    id: string
    reason: string
    banType: string
    expiresAt: string | null
  }
}

export default function UsersPage() {
  const t = useTranslations("admin.users")
  const tCommon = useTranslations("common")
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [banReason, setBanReason] = useState("")
  const [banType, setBanType] = useState("TEMPORARY")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Create user state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    password: "",
    orgId: "",
    role: "MEMBER",
  })

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      })
      const response = await fetch(`/api/admin/users?${params}`, {
        credentials: "include",
      })

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        throw new Error(`HTTP error: ${response.status}`)
      }

      const data = await response.json()
      setUsers(data.users || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
      setSelectedIds(new Set())
    } catch (error) {
      console.error("Failed to fetch users:", error)
      setUsers([])
      setTotalPages(1)
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchUsers()
    }, 300)
    return () => clearTimeout(debounce)
  }, [fetchUsers])

  const handleBan = async () => {
    if (!selectedUser || !banReason) return
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/ban`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: banReason,
          banType: banType,
        }),
      })
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        const data = await response.json()
        throw new Error(data.error || t("toast.banFailed"))
      }
      setBanDialogOpen(false)
      setBanReason("")
      showSuccessToast(t("toast.userBanned"))
      fetchUsers()
    } catch (error) {
      console.error("Failed to ban user:", error)
      showErrorToast(error instanceof Error ? error.message : t("toast.banFailed"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLiftBan = async (userId: string, banId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/ban/${banId}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        const data = await response.json()
        throw new Error(data.error || t("toast.liftBanFailed"))
      }
      showSuccessToast(t("toast.banLifted"))
      fetchUsers()
    } catch (error) {
      console.error("Failed to lift ban:", error)
      showErrorToast(error instanceof Error ? error.message : t("toast.liftBanFailed"))
    }
  }

  const handleDeleteUser = async (user: User) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        const data = await response.json()
        throw new Error(data.error || t("toast.deleteFailed"))
      }
      showSuccessToast(t("toast.userDeleted"))
      fetchUsers()
    } catch (error) {
      console.error("Failed to delete user:", error)
      showErrorToast(error instanceof Error ? error.message : t("toast.deleteFailed"))
    }
  }

  const handleBulkBan = async (ids: string[]) => {
    try {
      const response = await fetch("/api/admin/users/bulk", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ban",
          userIds: ids,
          data: { reason: t("bulkActions.banReason"), banType: "PERMANENT" },
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("toast.bulkBanFailed"))
      }
      showSuccessToast(t("toast.bulkBanSuccess", { count: ids.length }))
      fetchUsers()
    } catch (error) {
      console.error("Bulk ban failed:", error)
      showErrorToast(error instanceof Error ? error.message : t("toast.bulkBanFailed"))
    }
  }

  const handleBulkUnban = async (ids: string[]) => {
    try {
      const response = await fetch("/api/admin/users/bulk", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "unban",
          userIds: ids,
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("toast.bulkUnbanFailed"))
      }
      showSuccessToast(t("toast.bulkUnbanSuccess", { count: ids.length }))
      fetchUsers()
    } catch (error) {
      console.error("Bulk unban failed:", error)
      showErrorToast(error instanceof Error ? error.message : t("toast.bulkUnbanFailed"))
    }
  }

  const handleBulkDelete = async (ids: string[]) => {
    try {
      const response = await fetch("/api/admin/users/bulk", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          userIds: ids,
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("toast.bulkDeleteFailed"))
      }
      showSuccessToast(t("toast.bulkDeleteSuccess", { count: ids.length }))
      fetchUsers()
    } catch (error) {
      console.error("Bulk delete failed:", error)
      showErrorToast(error instanceof Error ? error.message : t("toast.bulkDeleteFailed"))
    }
  }

  const handleBulkVerifyEmail = async (ids: string[]) => {
    try {
      const response = await fetch("/api/admin/users/bulk", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verifyEmail",
          userIds: ids,
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("toast.bulkVerifyFailed"))
      }
      showSuccessToast(t("toast.bulkVerifySuccess", { count: ids.length }))
      fetchUsers()
    } catch (error) {
      console.error("Bulk verify failed:", error)
      showErrorToast(error instanceof Error ? error.message : t("toast.bulkVerifyFailed"))
    }
  }

  const handleBulkResetPassword = async (ids: string[]) => {
    try {
      const response = await fetch("/api/admin/users/bulk", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resetPassword",
          userIds: ids,
          data: { sendEmail: true },
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("toast.bulkResetPasswordFailed"))
      }
      showSuccessToast(t("toast.bulkResetPasswordSuccess", { count: ids.length }))
      fetchUsers()
    } catch (error) {
      console.error("Bulk reset password failed:", error)
      showErrorToast(error instanceof Error ? error.message : t("toast.bulkResetPasswordFailed"))
    }
  }

  const handleBulkRevokeSessions = async (ids: string[]) => {
    try {
      const response = await fetch("/api/admin/users/bulk", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "revokeAllSessions",
          userIds: ids,
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("toast.bulkRevokeSessionsFailed"))
      }
      showSuccessToast(t("toast.bulkRevokeSessionsSuccess", { count: ids.length }))
      fetchUsers()
    } catch (error) {
      console.error("Bulk revoke sessions failed:", error)
      showErrorToast(error instanceof Error ? error.message : t("toast.bulkRevokeSessionsFailed"))
    }
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  const fetchOrganizations = async () => {
    try {
      const response = await fetch("/api/admin/tenants?limit=100", {
        credentials: "include",
      })
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        throw new Error(`HTTP error: ${response.status}`)
      }
      const data = await response.json()
      setOrganizations((data.tenants || []).map((t: { id: string; name: string; slug: string }) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
      })))
    } catch (error) {
      console.error("Failed to fetch organizations:", error)
      setOrganizations([])
    }
  }

  const handleCreateUser = async () => {
    if (!newUser.email) return
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newUser,
          orgId: newUser.orgId && newUser.orgId !== "none" ? newUser.orgId : undefined,
          password: newUser.password || undefined,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = "/login?type=admin"
          return
        }
        const data = await response.json()
        throw new Error(data.error || t("toast.createFailed"))
      }

      setCreateDialogOpen(false)
      setNewUser({
        email: "",
        name: "",
        password: "",
        orgId: "",
        role: "MEMBER",
      })
      showSuccessToast(t("toast.userCreated"))
      fetchUsers()
    } catch (error) {
      console.error("Failed to create user:", error)
      showErrorToast(error instanceof Error ? error.message : t("toast.createFailed"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const openCreateDialog = () => {
    fetchOrganizations()
    setCreateDialogOpen(true)
  }

  // Define columns for the data table
  const columns: Column<User>[] = [
    {
      id: "user",
      header: t("user"),
      cell: (user) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatarUrl || undefined} />
            <AvatarFallback>{getInitials(user.name, user.email)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.name || t("noName")}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              {user.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "organizations",
      header: t("organizations"),
      cell: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.memberships.slice(0, 2).map((m) => (
            <Badge key={m.organization.id} variant="secondary" className="text-xs">
              <Building2 className="h-3 w-3 mr-1" />
              {m.organization.name}
              <span className="ml-1 opacity-60">({m.role})</span>
            </Badge>
          ))}
          {user.memberships.length > 2 && (
            <Badge variant="outline" className="text-xs">
              {t("moreOrgs", { count: user.memberships.length - 2 })}
            </Badge>
          )}
          {user.memberships.length === 0 && (
            <span className="text-xs text-muted-foreground">{t("noOrganizations")}</span>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: t("status"),
      cell: (user) => (
        user.isBanned ? (
          <Badge variant="destructive">{t("banned")}</Badge>
        ) : user.emailVerified ? (
          <Badge variant="default" className="bg-green-500">{t("verified")}</Badge>
        ) : (
          <Badge variant="secondary">{t("unverified")}</Badge>
        )
      ),
    },
    {
      id: "sessions",
      header: t("sessions"),
      headerClassName: "text-center",
      className: "text-center",
      cell: (user) => (
        <div className="flex items-center justify-center gap-1">
          <Shield className="h-3 w-3 text-muted-foreground" />
          {user._count.sessions}
        </div>
      ),
    },
    {
      id: "joined",
      header: t("joined"),
      cell: (user) => (
        <span className="text-muted-foreground">
          {new Date(user.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ]

  // Define row actions
  const rowActions: RowAction<User>[] = [
    {
      label: t("impersonate"),
      icon: <ExternalLink className="h-4 w-4" />,
      onClick: (user) => {
        // Impersonate logic
        console.log("Impersonate", user.id)
      },
    },
    {
      label: t("liftBan"),
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (user) => {
        if (user.ban) {
          handleLiftBan(user.id, user.ban.id)
        }
      },
      hidden: (user) => !user.isBanned,
      separator: true,
    },
    {
      label: t("banUser"),
      icon: <Ban className="h-4 w-4" />,
      onClick: (user) => {
        setSelectedUser(user)
        setBanDialogOpen(true)
      },
      variant: "destructive",
      hidden: (user) => user.isBanned,
      separator: true,
    },
  ]

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      label: t("banSelected"),
      icon: <Ban className="h-4 w-4" />,
      onClick: handleBulkBan,
      confirmTitle: t("banUserTitle"),
      confirmDescription: t("confirmBan"),
    },
    {
      label: t("unbanSelected"),
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: handleBulkUnban,
      confirmTitle: t("unbanSelected"),
      confirmDescription: t("confirmUnban"),
    },
    {
      label: t("verifyEmails"),
      icon: <BadgeCheck className="h-4 w-4" />,
      onClick: handleBulkVerifyEmail,
      separator: true,
      confirmTitle: t("verifyEmails"),
      confirmDescription: t("confirmVerify"),
    },
    {
      label: t("resetPasswords"),
      icon: <KeyRound className="h-4 w-4" />,
      onClick: handleBulkResetPassword,
      confirmTitle: t("resetPasswords"),
      confirmDescription: t("confirmResetPassword"),
    },
    {
      label: t("revokeSessions"),
      icon: <LogOut className="h-4 w-4" />,
      onClick: handleBulkRevokeSessions,
      confirmTitle: t("revokeSessions"),
      confirmDescription: t("confirmRevokeSessions"),
    },
    {
      label: t("deleteSelected"),
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleBulkDelete,
      variant: "destructive",
      separator: true,
      confirmTitle: t("deleteUser"),
      confirmDescription: t("confirmDeleteAll"),
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("title")}</CardTitle>
              <CardDescription>
                {t("description", { total })}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchUsers} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("refresh")}
              </Button>
              <Button onClick={openCreateDialog} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t("addUser")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allUsers")}</SelectItem>
                <SelectItem value="active">{t("active")}</SelectItem>
                <SelectItem value="banned">{t("banned")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Table */}
          <AdminDataTable
            data={users}
            columns={columns}
            getRowId={(user) => user.id}
            isLoading={isLoading}
            emptyMessage={t("noUsers")}
            viewHref={(user) => `/admin/users/${user.id}`}
            editHref={(user) => `/admin/users/${user.id}/edit`}
            onDelete={handleDeleteUser}
            deleteConfirmTitle={t("deleteUser")}
            deleteConfirmDescription={(user) =>
              t("confirmDelete", { name: user.name || user.email })
            }
            rowActions={rowActions}
            bulkActions={bulkActions}
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </CardContent>
      </Card>

      {/* Ban Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("banUserTitle")}</DialogTitle>
            <DialogDescription>
              {t("banDescription", { name: selectedUser?.name || selectedUser?.email || "" })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("banType")}</Label>
              <Select value={banType} onValueChange={setBanType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEMPORARY">{t("temporary")}</SelectItem>
                  <SelectItem value="PERMANENT">{t("permanent")}</SelectItem>
                  <SelectItem value="SHADOW">{t("shadowBan")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("reasonLabel")}</Label>
              <Textarea
                placeholder={t("reasonPlaceholder")}
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleBan}
              disabled={!banReason || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("banning")}
                </>
              ) : (
                t("banUser")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("createNewUser")}</DialogTitle>
            <DialogDescription>
              {t("addNewUserDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")} *</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userName">{t("name")}</Label>
              <Input
                id="userName"
                placeholder={t("namePlaceholder")}
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("passwordPlaceholder")}
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </div>

            <div className="border-t pt-4 mt-2">
              <h4 className="text-sm font-medium mb-3">{t("organizationAssignment")}</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("organizations")}</Label>
                  <Select
                    value={newUser.orgId}
                    onValueChange={(value) => setNewUser({ ...newUser, orgId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectOrganization")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t("noOrganization")}</SelectItem>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name} ({org.slug})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {newUser.orgId && newUser.orgId !== "none" && (
                  <div className="space-y-2">
                    <Label>{t("role")}</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OWNER">{t("owner")}</SelectItem>
                        <SelectItem value="ADMIN">{t("admin")}</SelectItem>
                        <SelectItem value="MEMBER">{t("member")}</SelectItem>
                        <SelectItem value="VIEWER">{t("viewer")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={!newUser.email || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("creating")}
                </>
              ) : (
                t("createUser")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
