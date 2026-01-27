"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Sparkles,
  Settings,
  Tag,
} from "lucide-react"
import Link from "next/link"
import { useAdmin } from "@/components/providers/admin-provider"

const CATEGORIES = [
  { value: "CORE", label: "Core" },
  { value: "ANALYTICS", label: "Analytics" },
  { value: "AGENTS", label: "Agents" },
  { value: "INTEGRATIONS", label: "Integrations" },
  { value: "SECURITY", label: "Security" },
  { value: "SUPPORT", label: "Support" },
  { value: "CUSTOMIZATION", label: "Customization" },
  { value: "API", label: "API" },
  { value: "ADVANCED", label: "Advanced" },
]

const VALUE_TYPES = [
  { value: "BOOLEAN", label: "Boolean (on/off)", defaultValue: false },
  { value: "NUMBER", label: "Number", defaultValue: 0 },
  { value: "STRING", label: "String", defaultValue: "" },
  { value: "JSON", label: "JSON", defaultValue: {} },
]

export default function NewEntitlementFeaturePage() {
  const router = useRouter()
  const { admin: currentAdmin } = useAdmin()
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    key: "",
    name: "",
    description: "",
    category: "CORE",
    valueType: "BOOLEAN",
    defaultValue: false as unknown,
    isActive: true,
    sortOrder: 0,
  })

  const canCreate = currentAdmin.role === "SUPER_ADMIN" || currentAdmin.role === "ADMIN"

  const generateKey = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      key: prev.key || generateKey(name),
    }))
  }

  const handleValueTypeChange = (valueType: string) => {
    const typeInfo = VALUE_TYPES.find(t => t.value === valueType)
    setFormData(prev => ({
      ...prev,
      valueType,
      defaultValue: typeInfo?.defaultValue ?? false,
    }))
  }

  const handleCreate = async () => {
    if (!formData.key || !formData.name) {
      toast.error("Key and name are required")
      return
    }

    // Validate key format
    if (!/^[a-z][a-z0-9_]*$/.test(formData.key)) {
      toast.error("Key must be in snake_case format (lowercase letters, numbers, underscores, starting with a letter)")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/entitlement-features", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: formData.key,
          name: formData.name,
          description: formData.description || undefined,
          category: formData.category,
          valueType: formData.valueType,
          defaultValue: formData.defaultValue,
          isActive: formData.isActive,
          sortOrder: formData.sortOrder,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/admin/entitlement-features/${data.feature.id}`)
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to create feature")
      }
    } catch (error) {
      console.error("Failed to create feature:", error)
      toast.error("Failed to create feature")
    } finally {
      setIsSaving(false)
    }
  }

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">You don&apos;t have permission to create entitlement features</p>
        <Link href="/admin/entitlement-features">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Features
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
          <Link href="/admin/entitlement-features">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Create Entitlement Feature</h1>
            <p className="text-sm text-muted-foreground">
              Define a new feature that can be assigned to subscription plans
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.key || !formData.name}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Feature
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Feature Details
            </CardTitle>
            <CardDescription>
              Basic information about the entitlement feature
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Advanced Analytics"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="key">Feature Key *</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value.toLowerCase().replace(/\s+/g, "_") }))}
                  placeholder="advanced_analytics"
                />
                <p className="text-xs text-muted-foreground">
                  snake_case format: lowercase letters, numbers, underscores
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this feature enables for subscribers..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Category & Classification
            </CardTitle>
            <CardDescription>
              Organize the feature for easier management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                />
                <p className="text-xs text-muted-foreground">
                  Lower numbers appear first in lists
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Value Configuration
            </CardTitle>
            <CardDescription>
              Configure the feature value type and default
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Value Type</Label>
                <Select
                  value={formData.valueType}
                  onValueChange={handleValueTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VALUE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Default Value</Label>
                {formData.valueType === "BOOLEAN" ? (
                  <div className="flex items-center gap-2 h-10">
                    <Switch
                      checked={formData.defaultValue === true}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, defaultValue: checked }))}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.defaultValue ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                ) : formData.valueType === "NUMBER" ? (
                  <Input
                    type="number"
                    value={formData.defaultValue as number}
                    onChange={(e) => setFormData(prev => ({ ...prev, defaultValue: parseInt(e.target.value) || 0 }))}
                  />
                ) : (
                  <Input
                    value={String(formData.defaultValue)}
                    onChange={(e) => setFormData(prev => ({ ...prev, defaultValue: e.target.value }))}
                    placeholder={formData.valueType === "JSON" ? '{}' : ""}
                  />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">
                  Inactive features are not available for plan assignment
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
