"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"
import { useAdmin } from "@/components/providers/admin-provider"

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
  const { admin: currentAdmin } = useAdmin()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleDelete = async (adminId: string) => {
    if (adminId === currentAdmin.id) {
      alert("You cannot delete your own account")
      return
    }
    if (!confirm("Are you sure you want to delete this admin?")) return
    try {
      await fetch(`/api/admin/admins/${adminId}`, { method: "DELETE" })
      fetchAdmins()
    } catch (error) {
      console.error("Failed to delete admin:", error)
    }
  }

  const isSuperAdmin = currentAdmin.role === "SUPER_ADMIN"

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Admin Management</CardTitle>
              <CardDescription>
                Manage platform administrators and their permissions
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchAdmins} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              {isSuperAdmin && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => handleOpenDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Admin
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingAdmin ? "Edit Admin" : "Create Admin"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingAdmin
                          ? "Update administrator details"
                          : "Add a new platform administrator"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          placeholder="admin@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          disabled={!!editingAdmin}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          placeholder="Full name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{editingAdmin ? "New Password (leave empty to keep current)" : "Password"}</Label>
                        <Input
                          type="password"
                          placeholder={editingAdmin ? "Leave empty to keep current" : "Password"}
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select
                          value={formData.role}
                          onValueChange={(v) => setFormData(prev => ({ ...prev, role: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="SUPPORT">Support</SelectItem>
                            <SelectItem value="ANALYST">Analyst</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Active</Label>
                          <p className="text-xs text-muted-foreground">Allow login to admin portal</p>
                        </div>
                        <Switch
                          checked={formData.isActive}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={!formData.email || !formData.name || (!editingAdmin && !formData.password) || isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : editingAdmin ? (
                          "Update Admin"
                        ) : (
                          "Create Admin"
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">2FA</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  {isSuperAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : admins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No admins found
                    </TableCell>
                  </TableRow>
                ) : (
                  admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Shield className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {admin.name}
                              {admin.id === currentAdmin.id && (
                                <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">{admin.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${roleColors[admin.role]} text-white`}>
                          {admin.role.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {admin.isActive ? (
                          <Badge variant="default" className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {admin.twoFactorEnabled ? (
                          <Key className="h-4 w-4 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {admin.lastLoginAt ? (
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
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(admin.createdAt).toLocaleDateString()}
                      </TableCell>
                      {isSuperAdmin && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(admin)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {admin.id !== currentAdmin.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDelete(admin.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
