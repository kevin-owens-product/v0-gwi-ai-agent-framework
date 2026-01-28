"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Shield,
  Loader2,
  Calendar,
  Edit,
  Save,
  X,
  Globe,
  Clock,
  Key,
  Activity,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { useAdmin } from "@/components/providers/admin-provider"

interface Session {
  id: string
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  expiresAt: string
}

interface AuditLog {
  id: string
  action: string
  resourceType: string
  resourceId: string | null
  details: Record<string, unknown>
  ipAddress: string | null
  timestamp: string
}

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
  updatedAt: string
  sessions: Session[]
  auditLogs: AuditLog[]
  stats: {
    totalActions: number
    recentLogins: number
    ticketsHandled: number
  }
}

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-500",
  ADMIN: "bg-blue-500",
  SUPPORT: "bg-green-500",
  ANALYST: "bg-slate-500",
}

export default function AdminDetailPage() {
  const t = useTranslations("admin.admins")
  const tCommon = useTranslations("common")

  const getRolePermissions = (role: string): string[] => {
    const permissions: Record<string, string[]> = {
      SUPER_ADMIN: [t("permissions.fullPlatformAccess"), t("permissions.allPermissionsGranted")],
      ADMIN: [
        t("permissions.tenantManagement"),
        t("permissions.userManagement"),
        t("permissions.featureFlags"),
        t("permissions.systemRules"),
        t("permissions.supportTickets"),
        t("permissions.notifications"),
        t("permissions.viewAnalytics"),
      ],
      SUPPORT: [
        t("permissions.viewTenants"),
        t("permissions.viewUsers"),
        t("permissions.supportTicketsFullAccess"),
        t("permissions.viewAnalytics"),
        t("permissions.viewAuditLogs"),
      ],
      ANALYST: [
        t("permissions.viewTenantsReadOnly"),
        t("permissions.viewUsersReadOnly"),
        t("permissions.viewAnalytics"),
        t("permissions.exportData"),
        t("permissions.viewAuditLogs"),
      ],
    }
    return permissions[role] || []
  }

  const getRoleLabel = (role: string): string => {
    const roleLabels: Record<string, string> = {
      SUPER_ADMIN: t("roles.superAdmin"),
      ADMIN: t("roles.admin"),
      SUPPORT: t("roles.support"),
      ANALYST: t("roles.analyst"),
    }
    return roleLabels[role] || role
  }
  const params = useParams()
  const router = useRouter()
  const { admin: currentAdmin } = useAdmin()
  const adminId = params.id as string

  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: "", role: "", isActive: true })
  const [isSaving, setIsSaving] = useState(false)

  const fetchAdmin = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/admins/${adminId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch admin")
      }
      const data = await response.json()
      setAdmin(data.admin)
      setEditForm({
        name: data.admin.name,
        role: data.admin.role,
        isActive: data.admin.isActive,
      })
    } catch (error) {
      console.error("Failed to fetch admin:", error)
    } finally {
      setIsLoading(false)
    }
  }, [adminId])

  useEffect(() => {
    fetchAdmin()
  }, [fetchAdmin])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/admins/${adminId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (response.ok) {
        setIsEditing(false)
        fetchAdmin()
      }
    } catch (error) {
      console.error("Failed to update admin:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const isSuperAdmin = currentAdmin.role === "SUPER_ADMIN"
  const isOwnAccount = currentAdmin.id === adminId

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!admin) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {tCommon("back")}
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">{t("notFound")}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/admins">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon("back")}
            </Link>
          </Button>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {admin.name}
              {isOwnAccount && (
                <span className="text-sm font-normal text-muted-foreground">({t("you")})</span>
              )}
            </h1>
            <p className="text-muted-foreground">{admin.email}</p>
          </div>
        </div>
        <Badge className={`${roleColors[admin.role]} text-white`}>
          {getRoleLabel(admin.role)}
        </Badge>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="permissions">{t("tabs.permissions")}</TabsTrigger>
          <TabsTrigger value="sessions">{t("tabs.sessions", { count: admin.sessions.length })}</TabsTrigger>
          <TabsTrigger value="activity">{t("tabs.activity")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("stats.totalActions")}</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{admin.stats.totalActions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("stats.recentLogins")}</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{admin.stats.recentLogins}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("stats.ticketsHandled")}</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{admin.stats.ticketsHandled}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("stats.twoFactorStatus")}</CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge variant={admin.twoFactorEnabled ? "default" : "secondary"}>
                  {admin.twoFactorEnabled ? tCommon("enabled") : tCommon("disabled")}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Admin Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t("details.title")}</CardTitle>
                {isSuperAdmin && !isOwnAccount && (
                  isEditing ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label>{tCommon("name")}</Label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("role")}</Label>
                    <Select
                      value={editForm.role}
                      onValueChange={(value) => setEditForm({ ...editForm, role: value })}
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
                    <div>
                      <Label>{t("details.activeStatus")}</Label>
                      <p className="text-xs text-muted-foreground">{t("allowLogin")}</p>
                    </div>
                    <Switch
                      checked={editForm.isActive}
                      onCheckedChange={(checked) => setEditForm({ ...editForm, isActive: checked })}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{tCommon("name")}</span>
                    <span className="font-medium">{admin.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("email")}</span>
                    <span className="font-medium">{admin.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("role")}</span>
                    <Badge className={`${roleColors[admin.role]} text-white`}>
                      {getRoleLabel(admin.role)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{tCommon("status")}</span>
                    {admin.isActive ? (
                      <Badge variant="default" className="bg-green-500">{tCommon("active")}</Badge>
                    ) : (
                      <Badge variant="secondary">{tCommon("inactive")}</Badge>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("twoFactor")}</span>
                    {admin.twoFactorEnabled ? (
                      <Badge variant="default" className="bg-green-500">{tCommon("enabled")}</Badge>
                    ) : (
                      <Badge variant="secondary">{t("notEnabled")}</Badge>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("created")}</span>
                    <span className="font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {admin.lastLoginAt && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("lastLogin")}</span>
                        <span className="font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(admin.lastLoginAt).toLocaleString()}
                        </span>
                      </div>
                      {admin.lastLoginIp && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t("details.lastIp")}</span>
                          <span className="font-medium flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {admin.lastLoginIp}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>{t("permissionsTab.title")}</CardTitle>
              <CardDescription>
                {t("permissionsTab.description", { role: getRoleLabel(admin.role) })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getRolePermissions(admin.role).map((permission, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded-lg border">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>{permission}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>{t("sessionsTab.title")}</CardTitle>
              <CardDescription>{t("sessionsTab.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {admin.sessions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("sessionsTab.ipAddress")}</TableHead>
                      <TableHead>{t("sessionsTab.userAgent")}</TableHead>
                      <TableHead>{t("created")}</TableHead>
                      <TableHead>{t("sessionsTab.expires")}</TableHead>
                      <TableHead>{tCommon("status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admin.sessions.map((session) => {
                      const isExpired = new Date(session.expiresAt) < new Date()
                      return (
                        <TableRow key={session.id}>
                          <TableCell className="font-mono">
                            {session.ipAddress || tCommon("unknown")}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-muted-foreground">
                            {session.userAgent || tCommon("unknown")}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(session.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(session.expiresAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={isExpired ? "secondary" : "default"}>
                              {isExpired ? t("sessionsTab.expired") : tCommon("active")}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">{t("sessionsTab.noData")}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>{t("activityTab.title")}</CardTitle>
              <CardDescription>{t("activityTab.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {admin.auditLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("activityTab.action")}</TableHead>
                      <TableHead>{t("activityTab.resource")}</TableHead>
                      <TableHead>{t("sessionsTab.ipAddress")}</TableHead>
                      <TableHead>{t("activityTab.date")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admin.auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">{log.resourceType}</span>
                          {log.resourceId && (
                            <span className="ml-1 font-mono text-xs">({log.resourceId.slice(0, 8)}...)</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-muted-foreground">
                          {log.ipAddress || "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">{t("activityTab.noData")}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
