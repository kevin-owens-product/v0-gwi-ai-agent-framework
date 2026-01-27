import { Suspense } from "react"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Shield,
  Users,
  Key,
  Plus,
  Search,
  Edit,
  MoreHorizontal,
  Lock,
  UserCheck,
  UserX,
  Settings,
  Crown,
} from "lucide-react"
import { getTranslations } from "@/lib/i18n/server"

const roleConfig: Record<string, { color: string; label: string }> = {
  SUPER_ADMIN: { color: "bg-red-100 text-red-700", label: "Super Admin" },
  GWI_ADMIN: { color: "bg-purple-100 text-purple-700", label: "GWI Admin" },
  DATA_ENGINEER: { color: "bg-blue-100 text-blue-700", label: "Data Engineer" },
  TAXONOMY_MANAGER: { color: "bg-green-100 text-green-700", label: "Taxonomy Manager" },
  ML_ENGINEER: { color: "bg-orange-100 text-orange-700", label: "ML Engineer" },
  ADMIN: { color: "bg-slate-100 text-slate-700", label: "Admin" },
}

async function getAccessData() {
  const [admins, roles, apiKeys] = await Promise.all([
    prisma.superAdmin.findMany({
      include: {
        adminRole: { select: { name: true, displayName: true, description: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.adminRole.findMany({
      include: {
        _count: { select: { superAdmins: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.gWIApiKey.findMany({
      include: {
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ])

  const activeUsers = admins.filter((a) => a.isActive).length
  const activeKeys = apiKeys.filter((k) => k.isActive).length

  return { admins, roles, apiKeys, activeUsers, activeKeys }
}

async function AccessControlContent() {
  const { admins, roles, apiKeys, activeUsers, activeKeys } = await getAccessData()
  const t = await getTranslations('gwi.system.access')
  const tCommon = await getTranslations('common')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          {t('inviteUser')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{admins.length}</p>
                <p className="text-sm text-muted-foreground">{t('totalUsers')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeUsers}</p>
                <p className="text-sm text-muted-foreground">{t('activeUsers')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{roles.length}</p>
                <p className="text-sm text-muted-foreground">{t('roles')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Key className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeKeys}</p>
                <p className="text-sm text-muted-foreground">{t('activeApiKeys')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('users')}</CardTitle>
            <CardDescription>{t('usersDescription')}</CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder={t('searchUsersPlaceholder')} className="pl-9 w-[250px]" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t('role')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allRoles')}</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {admins.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('user')}</TableHead>
                  <TableHead>{t('role')}</TableHead>
                  <TableHead>{tCommon('status')}</TableHead>
                  <TableHead>{t('lastLogin')}</TableHead>
                  <TableHead>{t('joined')}</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => {
                  const roleKey = admin.role || "ADMIN"
                  const role = roleConfig[roleKey] || roleConfig.ADMIN
                  return (
                    <TableRow key={admin.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white font-medium">
                            {admin.name?.charAt(0) || admin.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{admin.name || "Unnamed"}</p>
                            <p className="text-sm text-muted-foreground">
                              {admin.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={role.color}>
                          {roleKey === "SUPER_ADMIN" && (
                            <Crown className="mr-1 h-3 w-3" />
                          )}
                          {role.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {admin.isActive ? (
                          <Badge className="bg-green-100 text-green-700">
                            <UserCheck className="mr-1 h-3 w-3" />
                            {tCommon('active')}
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700">
                            <UserX className="mr-1 h-3 w-3" />
                            {tCommon('inactive')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {admin.lastLoginAt
                          ? new Date(admin.lastLoginAt).toLocaleDateString()
                          : t('never')}
                      </TableCell>
                      <TableCell>
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              {t('editUser')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="mr-2 h-4 w-4" />
                              {t('changeRole')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Lock className="mr-2 h-4 w-4" />
                              {t('resetPassword')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <UserX className="mr-2 h-4 w-4" />
                              {t('deactivate')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">{t('noUsersFound')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Roles */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('rolesAndPermissions')}</CardTitle>
            <CardDescription>{t('rolesDescription')}</CardDescription>
          </div>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            {t('configureRoles')}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <div
                key={role.id}
                className="p-4 border rounded-lg hover:bg-slate-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{role.displayName || role.name}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {t('usersCount', { count: role._count.superAdmins })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {role.description || t('noDescription')}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Keys Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('apiKeys')}</CardTitle>
            <CardDescription>{t('apiKeysDescription')}</CardDescription>
          </div>
          <Button variant="outline" asChild>
            <a href="/gwi/system/api-keys">{t('manageApiKeys')}</a>
          </Button>
        </CardHeader>
        <CardContent>
          {apiKeys.length > 0 ? (
            <div className="space-y-3">
              {apiKeys.slice(0, 5).map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-orange-100 flex items-center justify-center">
                      <Key className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">{key.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {key.keyPrefix}... - {t('createdBy', { name: key.createdBy.name })}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={
                      key.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-700"
                    }
                  >
                    {key.isActive ? tCommon('active') : tCommon('inactive')}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">{t('noApiKeys')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default async function AccessControlPage() {
  const t = await getTranslations('gwi.system.access')

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        </div>
      }
    >
      <AccessControlContent />
    </Suspense>
  )
}
