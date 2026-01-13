"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Building2,
  Loader2,
  Ban,
  CheckCircle,
  Activity,
  Calendar,
  AlertTriangle,
  Edit,
  Save,
  X,
  Shield,
  Mail,
  Clock,
} from "lucide-react"
import Link from "next/link"

interface Membership {
  id: string
  role: string
  joinedAt: string
  organization: {
    id: string
    name: string
    slug: string
    planTier: string
  }
}

interface Session {
  id: string
  expires: string
  ipAddress: string | null
  userAgent: string | null
}

interface Ban {
  id: string
  reason: string
  banType: string
  createdAt: string
  expiresAt: string | null
  bannedBy: string // Super admin ID
}

interface AuditLog {
  id: string
  action: string
  resourceType: string
  details: Record<string, unknown>
  createdAt: string
}

interface User {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  createdAt: string
  emailVerified: string | null
  isBanned: boolean
  activeBan: Ban | null
  banHistory: Ban[]
  memberships: Membership[]
  sessions: Session[]
  _count: {
    sessions: number
  }
  stats: {
    activeSessions: number
    agentRunsLast30Days: number
  }
  auditLogs: AuditLog[]
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: "", email: "" })
  const [isSaving, setIsSaving] = useState(false)

  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [banReason, setBanReason] = useState("")
  const [banType, setBanType] = useState("TEMPORARY")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchUser = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch user")
      }
      const data = await response.json()
      setUser(data.user)
      setEditForm({ name: data.user.name || "", email: data.user.email })
    } catch (error) {
      console.error("Failed to fetch user:", error)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (response.ok) {
        setIsEditing(false)
        fetchUser()
      }
    } catch (error) {
      console.error("Failed to update user:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleBan = async () => {
    if (!banReason) return
    setIsSubmitting(true)
    try {
      await fetch(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: banReason,
          banType: banType,
        }),
      })
      setBanDialogOpen(false)
      setBanReason("")
      fetchUser()
    } catch (error) {
      console.error("Failed to ban user:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLiftBan = async () => {
    if (!user?.activeBan) return
    try {
      await fetch(`/api/admin/users/${userId}/ban/${user.activeBan.id}`, {
        method: "DELETE",
      })
      fetchUser()
    } catch (error) {
      console.error("Failed to lift ban:", error)
    }
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">User not found</p>
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
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatarUrl || undefined} />
            <AvatarFallback>{getInitials(user.name, user.email)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.name || "No name"}</h1>
            <p className="text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user.isBanned ? (
            <Button onClick={handleLiftBan}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Lift Ban
            </Button>
          ) : (
            <Button variant="destructive" onClick={() => setBanDialogOpen(true)}>
              <Ban className="h-4 w-4 mr-2" />
              Ban User
            </Button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      {user.isBanned && user.activeBan && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">User Banned</p>
                <p className="text-sm text-muted-foreground">
                  {user.activeBan.banType} ban - {user.activeBan.reason}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="organizations">Organizations ({user.memberships.length})</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Organizations</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.memberships.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessions</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user._count.sessions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.stats.activeSessions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Agent Runs (30d)</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.stats.agentRunsLast30Days}</div>
              </CardContent>
            </Card>
          </div>

          {/* User Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User Details</CardTitle>
                {isEditing ? (
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
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Enter name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      type="email"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{user.name || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email Verified</span>
                    {user.emailVerified ? (
                      <Badge variant="default" className="bg-green-500">Verified</Badge>
                    ) : (
                      <Badge variant="secondary">Unverified</Badge>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    {user.isBanned ? (
                      <Badge variant="destructive">Banned</Badge>
                    ) : (
                      <Badge variant="default" className="bg-green-500">Active</Badge>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Joined</span>
                    <span className="font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organizations">
          <Card>
            <CardHeader>
              <CardTitle>Organization Memberships</CardTitle>
              <CardDescription>Organizations this user belongs to</CardDescription>
            </CardHeader>
            <CardContent>
              {user.memberships.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.memberships.map((membership) => (
                      <TableRow key={membership.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{membership.organization.name}</p>
                              <p className="text-xs text-muted-foreground">{membership.organization.slug}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            membership.organization.planTier === "ENTERPRISE" ? "default" :
                            membership.organization.planTier === "PROFESSIONAL" ? "secondary" : "outline"
                          }>
                            {membership.organization.planTier}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={membership.role === "OWNER" ? "default" : "secondary"}>
                            {membership.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(membership.joinedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/tenants/${membership.organization.id}`}>
                              View Org
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">No organization memberships</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>Active and recent login sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {user.sessions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Session ID</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.sessions.map((session) => {
                      const isExpired = new Date(session.expires) < new Date()
                      return (
                        <TableRow key={session.id}>
                          <TableCell className="font-mono text-xs">
                            {session.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(session.expires).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {session.ipAddress || "Unknown"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={isExpired ? "secondary" : "default"}>
                              {isExpired ? "Expired" : "Active"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">No session data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* Ban History */}
          <Card>
            <CardHeader>
              <CardTitle>Ban History</CardTitle>
              <CardDescription>Past and current bans for this user</CardDescription>
            </CardHeader>
            <CardContent>
              {user.banHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Expires</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.banHistory.map((ban) => (
                      <TableRow key={ban.id}>
                        <TableCell>
                          <Badge variant="outline">{ban.banType}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {ban.reason}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {ban.bannedBy.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(ban.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {ban.expiresAt ? new Date(ban.expiresAt).toLocaleDateString() : "Never"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">No ban history</p>
              )}
            </CardContent>
          </Card>

          {/* Audit Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>Recent admin actions related to this user</CardDescription>
            </CardHeader>
            <CardContent>
              {user.auditLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {log.resourceType}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">No audit logs</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ban Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Ban {user.name || user.email}. They will be unable to access the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ban Type</Label>
              <Select value={banType} onValueChange={setBanType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEMPORARY">Temporary</SelectItem>
                  <SelectItem value="PERMANENT">Permanent</SelectItem>
                  <SelectItem value="SHADOW">Shadow Ban</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                placeholder="Enter the reason for banning..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBan}
              disabled={!banReason || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Banning...
                </>
              ) : (
                "Ban User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
