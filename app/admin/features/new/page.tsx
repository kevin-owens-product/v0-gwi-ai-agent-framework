"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
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
  Flag,
  Settings,
  Percent,
  CreditCard,
} from "lucide-react"
import Link from "next/link"
import { useAdmin } from "@/components/providers/admin-provider"

const FLAG_TYPES = [
  { value: "BOOLEAN", label: "Boolean", description: "Simple on/off toggle" },
  { value: "STRING", label: "String", description: "Text value" },
  { value: "NUMBER", label: "Number", description: "Numeric value" },
  { value: "JSON", label: "JSON", description: "Complex configuration" },
]

const PLAN_OPTIONS = ["STARTER", "PROFESSIONAL", "ENTERPRISE"]

export default function NewFeatureFlagPage() {
  const router = useRouter()
  const { admin: currentAdmin } = useAdmin()
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    key: "",
    name: "",
    description: "",
    type: "BOOLEAN",
    isEnabled: false,
    rolloutPercentage: 100,
    allowedPlans: [] as string[],
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

  const togglePlan = (plan: string) => {
    setFormData(prev => ({
      ...prev,
      allowedPlans: prev.allowedPlans.includes(plan)
        ? prev.allowedPlans.filter(p => p !== plan)
        : [...prev.allowedPlans, plan],
    }))
  }

  const handleCreate = async () => {
    if (!formData.key || !formData.name) {
      alert("Key and name are required")
      return
    }

    // Validate key format
    if (!/^[a-z][a-z0-9_]*$/.test(formData.key)) {
      alert("Key must be lowercase letters, numbers, and underscores only, starting with a letter")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/features", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: formData.key,
          name: formData.name,
          description: formData.description || undefined,
          type: formData.type,
          isEnabled: formData.isEnabled,
          rolloutPercentage: formData.rolloutPercentage,
          allowedPlans: formData.allowedPlans.length > 0 ? formData.allowedPlans : undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/admin/features/${data.flag.id}`)
      } else {
        const data = await response.json()
        alert(data.error || "Failed to create feature flag")
      }
    } catch (error) {
      console.error("Failed to create feature flag:", error)
      alert("Failed to create feature flag")
    } finally {
      setIsSaving(false)
    }
  }

  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">You don&apos;t have permission to create feature flags</p>
        <Link href="/admin/features">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feature Flags
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
          <Link href="/admin/features">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Create Feature Flag</h1>
            <p className="text-sm text-muted-foreground">
              Create a new feature flag for controlled rollout
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
              Create Flag
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Flag Details
            </CardTitle>
            <CardDescription>
              Basic information about the feature flag
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
                  placeholder="New Dashboard"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="key">Flag Key *</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                  placeholder="new_dashboard"
                />
                <p className="text-xs text-muted-foreground">
                  Lowercase letters, numbers, and underscores only
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this feature flag controls..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Flag Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FLAG_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span>{type.label}</span>
                        <span className="text-xs text-muted-foreground">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Rollout Configuration
            </CardTitle>
            <CardDescription>
              Configure how this feature is rolled out
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enabled</Label>
                <p className="text-xs text-muted-foreground">
                  Turn this feature on or off globally
                </p>
              </div>
              <Switch
                checked={formData.isEnabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isEnabled: checked }))}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Rollout Percentage
                </Label>
                <span className="text-sm font-medium">{formData.rolloutPercentage}%</span>
              </div>
              <Slider
                value={[formData.rolloutPercentage]}
                onValueChange={([value]) => setFormData(prev => ({ ...prev, rolloutPercentage: value }))}
                max={100}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                Percentage of users who will see this feature when enabled
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Plan Restrictions
            </CardTitle>
            <CardDescription>
              Limit this feature to specific subscription plans
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Allowed Plans</Label>
              <div className="flex gap-6">
                {PLAN_OPTIONS.map((plan) => (
                  <div key={plan} className="flex items-center gap-2">
                    <Checkbox
                      id={plan}
                      checked={formData.allowedPlans.includes(plan)}
                      onCheckedChange={() => togglePlan(plan)}
                    />
                    <label htmlFor={plan} className="text-sm cursor-pointer">
                      {plan}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Leave empty to allow all plans. Select specific plans to restrict access.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
