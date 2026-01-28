"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, MoreVertical, Mail, UserMinus, Shield, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { PageTracker } from "@/components/tracking/PageTracker"

interface TeamMember {
  id: string
  userId: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
  joinedAt: string
  lastActive: string | null
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
}

interface Invitation {
  id: string
  email: string
  role: string
  status: string
  createdAt: string
  expiresAt: string
}

const roleColors: Record<string, string> = {
  OWNER: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  ADMIN: "bg-primary/10 text-primary border-primary/20",
  MEMBER: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  VIEWER: "bg-muted text-muted-foreground border-muted",
}

export default function TeamSettingsPage() {
  const t = useTranslations("settings.team")
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<string>("MEMBER")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [removeMember, setRemoveMember] = useState<TeamMember | null>(null)
  const [changingRole, setChangingRole] = useState<string | null>(null)

  const fetchTeamData = async () => {
    try {
      const [membersRes, invitationsRes] = await Promise.all([
        fetch('/api/v1/organization/team', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch('/api/v1/organization/team/invitations', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }),
      ])

      if (membersRes.ok) {
        const data = await membersRes.json()
        setMembers(data || [])
      }

      if (invitationsRes.ok) {
        const data = await invitationsRes.json()
        setInvitations(data || [])
      }
    } catch (error) {
      console.error('Failed to fetch team data:', error)
      toast.error(t('toast.loadFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTeamData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleInvite = async () => {
    if (!inviteEmail) return

    setIsInviting(true)
    try {
      const response = await fetch('/api/v1/organization/team/invite', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: [inviteEmail], role: inviteRole }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send invitation')
      }

      toast.success(t('toast.invitationSent'))
      setDialogOpen(false)
      setInviteEmail("")
      setInviteRole("MEMBER")
      fetchTeamData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.invitationFailed'))
    } finally {
      setIsInviting(false)
    }
  }

  const handleRoleChange = async (memberId: string, newRole: string) => {
    setChangingRole(memberId)
    try {
      const response = await fetch(`/api/v1/organization/team/members/${memberId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update role')
      }

      toast.success(t('toast.roleUpdated'))
      fetchTeamData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.roleUpdateFailed'))
    } finally {
      setChangingRole(null)
    }
  }

  const handleRemoveMember = async () => {
    if (!removeMember) return

    try {
      const response = await fetch(`/api/v1/organization/team/members/${removeMember.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to remove member')
      }

      toast.success(t('toast.memberRemoved'))
      setRemoveMember(null)
      fetchTeamData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.memberRemoveFailed'))
    }
  }

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/v1/organization/team/invitations/${invitationId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to revoke invitation')
      }

      toast.success(t('toast.invitationRevoked'))
      fetchTeamData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.revokeFailed'))
    }
  }

  const filteredMembers = members.filter(
    (member) =>
      member.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return t("never")
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return t("justNow")
    if (diffMins < 60) return t("minAgo", { count: diffMins })
    if (diffHours < 24) return diffHours > 1 ? t("hoursAgoPlural", { count: diffHours }) : t("hoursAgo", { count: diffHours })
    return diffDays > 1 ? t("daysAgoPlural", { count: diffDays }) : t("daysAgo", { count: diffDays })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl">
      <PageTracker pageName="Settings - Team" metadata={{ totalMembers: members.length, pendingInvitations: invitations.length }} />
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>{t("teamMembers")}</CardTitle>
                <CardDescription>{t("membersCount", { count: members.length })}</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("inviteMember")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("inviteTeamMember")}</DialogTitle>
                    <DialogDescription>{t("inviteDescription")}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="invite-email">{t("emailAddress")}</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invite-role">{t("role")}</Label>
                      <Select value={inviteRole} onValueChange={setInviteRole}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">{t("roles.admin")}</SelectItem>
                          <SelectItem value="MEMBER">{t("roles.member")}</SelectItem>
                          <SelectItem value="VIEWER">{t("roles.viewer")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleInvite} disabled={isInviting || !inviteEmail}>
                      {isInviting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("sending")}
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          {t("sendInvitation")}
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("searchMembers")}
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("tableHeaders.member")}</TableHead>
                  <TableHead>{t("tableHeaders.role")}</TableHead>
                  <TableHead>{t("tableHeaders.lastActive")}</TableHead>
                  <TableHead>{t("tableHeaders.joined")}</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.user.avatarUrl || undefined} />
                          <AvatarFallback>
                            {(member.user.name || member.user.email)
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.user.name || t("unknown")}</p>
                          <p className="text-sm text-muted-foreground">{member.user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={roleColors[member.role]}>
                        {t(`roles.${member.role.toLowerCase()}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatRelativeTime(member.lastActive)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {member.role !== 'OWNER' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              {changingRole === member.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreVertical className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'ADMIN')}>
                              <Shield className="mr-2 h-4 w-4" />
                              {t("actions.makeAdmin")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'MEMBER')}>
                              <Shield className="mr-2 h-4 w-4" />
                              {t("actions.makeMember")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'VIEWER')}>
                              <Shield className="mr-2 h-4 w-4" />
                              {t("actions.makeViewer")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setRemoveMember(member)}
                            >
                              <UserMinus className="mr-2 h-4 w-4" />
                              {t("actions.removeMember")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {invitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("pendingInvitations")}</CardTitle>
              <CardDescription>
                {invitations.length !== 1
                  ? t("pendingCountPlural", { count: invitations.length })
                  : t("pendingCount", { count: invitations.length })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("invitationHeaders.email")}</TableHead>
                    <TableHead>{t("invitationHeaders.role")}</TableHead>
                    <TableHead>{t("invitationHeaders.sent")}</TableHead>
                    <TableHead>{t("invitationHeaders.expires")}</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">{invitation.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={roleColors[invitation.role]}>
                          {t(`roles.${invitation.role.toLowerCase()}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatRelativeTime(invitation.createdAt)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(invitation.expiresAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleRevokeInvitation(invitation.id)}
                        >
                          {t("revoke")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t("rolePermissions")}</CardTitle>
            <CardDescription>{t("rolePermissionsDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Badge variant="outline" className={roleColors.OWNER}>{t("roles.owner")}</Badge>
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>{t("ownerPermissions.fullControl")}</li>
                  <li>{t("ownerPermissions.transferOwnership")}</li>
                  <li>{t("ownerPermissions.deleteOrg")}</li>
                </ul>
              </div>
              <div className="rounded-lg border p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Badge variant="outline" className={roleColors.ADMIN}>{t("roles.admin")}</Badge>
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>{t("adminPermissions.manageMembers")}</li>
                  <li>{t("adminPermissions.billing")}</li>
                  <li>{t("adminPermissions.allMemberPerms")}</li>
                </ul>
              </div>
              <div className="rounded-lg border p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Badge variant="outline" className={roleColors.MEMBER}>{t("roles.member")}</Badge>
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>{t("memberPermissions.createAgents")}</li>
                  <li>{t("memberPermissions.generateReports")}</li>
                  <li>{t("memberPermissions.useAgents")}</li>
                </ul>
              </div>
              <div className="rounded-lg border p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Badge variant="outline" className={roleColors.VIEWER}>{t("roles.viewer")}</Badge>
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>{t("viewerPermissions.viewReports")}</li>
                  <li>{t("viewerPermissions.viewDashboards")}</li>
                  <li>{t("viewerPermissions.readOnly")}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!removeMember} onOpenChange={() => setRemoveMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("removeDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("removeDialog.description", { name: removeMember?.user.name || removeMember?.user.email || "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("removeDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember} className="bg-destructive text-destructive-foreground">
              {t("removeDialog.remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
