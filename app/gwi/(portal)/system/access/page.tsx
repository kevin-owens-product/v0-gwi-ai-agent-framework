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
  Trash2,
  MoreHorizontal,
  Lock,
  UserCheck,
  UserX,
  Settings,
  Crown,
} from "lucide-react"

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Access Control</h1>
          <p className="text-muted-foreground">
            Manage user access, roles, and permissions
          </p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Invite User
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
                <p className="text-sm text-muted-foreground">Total Users</p>
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
                <p className="text-sm text-muted-foreground">Active Users</p>
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
                <p className="text-sm text-muted-foreground">Roles</p>
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
                <p className="text-sm text-muted-foreground">Active API Keys</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>GWI portal users and their roles</CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-9 w-[250px]" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
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
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Joined</TableHead>
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
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700">
                            <UserX className="mr-1 h-3 w-3" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {admin.lastLoginAt
                          ? new Date(admin.lastLoginAt).toLocaleDateString()
                          : "Never"}
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
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="mr-2 h-4 w-4" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Lock className="mr-2 h-4 w-4" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <UserX className="mr-2 h-4 w-4" />
                              Deactivate
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
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Roles */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Roles & Permissions</CardTitle>
            <CardDescription>Define what each role can access</CardDescription>
          </div>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Configure Roles
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
                    {role._count.superAdmins} users
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {role.description || "No description"}
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
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Active API keys for programmatic access</CardDescription>
          </div>
          <Button variant="outline" asChild>
            <a href="/gwi/system/api-keys">Manage API Keys</a>
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
                        {key.keyPrefix}... - Created by {key.createdBy.name}
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
                    {key.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No API keys created</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AccessControlPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Access Control</h1>
            <p className="text-muted-foreground">Loading access data...</p>
          </div>
        </div>
      }
    >
      <AccessControlContent />
    </Suspense>
  )
}
