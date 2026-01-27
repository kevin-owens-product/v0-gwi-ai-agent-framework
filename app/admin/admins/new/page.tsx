"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  ArrowLeft,
  Save,
  Loader2,
  Shield,
  Mail,
  User,
  Key,
} from "lucide-react"
import Link from "next/link"
import { useAdmin } from "@/components/providers/admin-provider"

const roleOptions = [
  { value: "SUPER_ADMIN", label: "Super Admin", description: "Full platform access" },
  { value: "ADMIN", label: "Admin", description: "Manage users and tenants" },
  { value: "SUPPORT", label: "Support", description: "Handle support tickets and user issues" },
  { value: "ANALYST", label: "Analyst", description: "View analytics and reports only" },
]

export default function NewAdminPage() {
  const router = useRouter()
  const { admin: currentAdmin } = useAdmin()
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
    role: "ADMIN",
    isActive: true,
  })

  const canCreate = currentAdmin.role === "SUPER_ADMIN"

  const handleCreate = async () => {
    if (!formData.email || !formData.name || !formData.password) {
      toast.error("Email, name, and password are required")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/admins", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          password: formData.password,
          role: formData.role,
          isActive: formData.isActive,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/admin/admins/${data.admin.id}`)
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to create admin")
      }
    } catch (error) {
      console.error("Failed to create admin:", error)
      toast.error("Failed to create admin")
    } finally {
      setIsSaving(false)
    }
  }

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">You don&apos;t have permission to create admins</p>
        <Link href="/admin/admins">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admins
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/admins">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Create New Admin</h1>
            <p className="text-sm text-muted-foreground">
              Add a new administrator to the platform
            </p>
          </div>
        </div>
        <Button
          onClick={handleCreate}
          disabled={isSaving || !formData.email || !formData.name || !formData.password}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Admin
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Admin Details
            </CardTitle>
            <CardDescription>
              Basic information about the new administrator
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address *
                  </div>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="admin@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Jane Smith"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="password">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Password *
                  </div>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Minimum 8 characters"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Re-enter password"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role & Permissions
            </CardTitle>
            <CardDescription>
              Configure the admin role and access level
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Admin Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex flex-col">
                        <span>{role.label}</span>
                        <span className="text-xs text-muted-foreground">{role.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The role determines what actions the admin can perform on the platform
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label>Active Status</Label>
                <p className="text-xs text-muted-foreground">
                  Inactive admins cannot log in to the admin portal
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
