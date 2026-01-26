"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  User,
  Mail,
  Building2,
} from "lucide-react"
import Link from "next/link"
import { useAdmin } from "@/components/providers/admin-provider"

interface Organization {
  id: string
  name: string
  slug: string
}

export default function NewUserPage() {
  const router = useRouter()
  const { admin: currentAdmin } = useAdmin()
  const [isSaving, setIsSaving] = useState(false)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true)

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    orgId: "",
    role: "MEMBER",
    sendInvite: false,
  })

  const canCreate = currentAdmin.role === "SUPER_ADMIN" || currentAdmin.role === "ADMIN"

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const response = await fetch("/api/admin/tenants?limit=200", {
          credentials: "include",
        })
        if (response.ok) {
          const data = await response.json()
          setOrganizations(
            (data.tenants || []).map((t: Organization) => ({
              id: t.id,
              name: t.name,
              slug: t.slug,
            }))
          )
        }
      } catch (error) {
        console.error("Failed to fetch organizations:", error)
      } finally {
        setIsLoadingOrgs(false)
      }
    }
    fetchOrganizations()
  }, [])

  const handleCreate = async () => {
    if (!formData.email) {
      alert("Email is required")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name || undefined,
          password: formData.password || undefined,
          orgId: formData.orgId && formData.orgId !== "none" ? formData.orgId : undefined,
          role: formData.role,
          sendInvite: formData.sendInvite,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/admin/users/${data.user.id}`)
      } else {
        const data = await response.json()
        alert(data.error || "Failed to create user")
      }
    } catch (error) {
      console.error("Failed to create user:", error)
      alert("Failed to create user")
    } finally {
      setIsSaving(false)
    }
  }

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">You don&apos;t have permission to create users</p>
        <Link href="/admin/users">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
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
          <Link href="/admin/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Create New User</h1>
            <p className="text-sm text-muted-foreground">
              Add a new user to the platform
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.email}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create User
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
              User Details
            </CardTitle>
            <CardDescription>
              Basic information about the new user
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
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password (optional)</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Leave empty to require password reset"
              />
              <p className="text-xs text-muted-foreground">
                If left empty, the user will need to set a password via email link
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label>Send Invite Email</Label>
                <p className="text-xs text-muted-foreground">
                  Send a welcome email with login instructions
                </p>
              </div>
              <Switch
                checked={formData.sendInvite}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sendInvite: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization Assignment
            </CardTitle>
            <CardDescription>
              Optionally assign the user to an organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Organization</Label>
                <Select
                  value={formData.orgId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, orgId: value }))}
                  disabled={isLoadingOrgs}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingOrgs ? "Loading..." : "Select organization (optional)"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No organization</SelectItem>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name} ({org.slug})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  User can be added to organizations later
                </p>
              </div>

              {formData.orgId && formData.orgId !== "none" && (
                <div className="space-y-2">
                  <Label>Role in Organization</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OWNER">Owner</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="VIEWER">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    The role determines what actions the user can perform
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
