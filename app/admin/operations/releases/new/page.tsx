"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  Loader2,
  Rocket,
  Calendar,
  Tag,
  Plus,
  X,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const typeOptions = [
  { value: "MAJOR", label: "Major", description: "Breaking changes, significant new features" },
  { value: "MINOR", label: "Minor", description: "New features, backward compatible" },
  { value: "PATCH", label: "Patch", description: "Bug fixes, minor improvements" },
  { value: "HOTFIX", label: "Hotfix", description: "Critical bug fixes" },
]

const strategyOptions = [
  { value: "BIG_BANG", label: "Big Bang", description: "Deploy to all users at once" },
  { value: "STAGED", label: "Staged", description: "Deploy in stages by percentage" },
  { value: "CANARY", label: "Canary", description: "Deploy to small group first" },
  { value: "BLUE_GREEN", label: "Blue-Green", description: "Switch between environments" },
  { value: "RING", label: "Ring", description: "Deploy by user rings" },
]

export default function NewReleasePage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [newFeature, setNewFeature] = useState("")
  const [newBugFix, setNewBugFix] = useState("")

  const [formData, setFormData] = useState({
    version: "",
    name: "",
    description: "",
    type: "MINOR",
    rolloutStrategy: "STAGED",
    plannedDate: "",
    changelogUrl: "",
    features: [] as string[],
    bugFixes: [] as string[],
  })

  const handleCreate = async () => {
    if (!formData.version) {
      toast.error("Version is required")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/operations/releases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          plannedDate: formData.plannedDate || null,
          changelogUrl: formData.changelogUrl || null,
          name: formData.name || null,
          description: formData.description || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create release")
      }

      const data = await response.json()
      toast.success("Release created successfully")
      router.push(`/admin/operations/releases/${data.release.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create release")
    } finally {
      setIsSaving(false)
    }
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }))
      setNewFeature("")
    }
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }))
  }

  const addBugFix = () => {
    if (newBugFix.trim()) {
      setFormData(prev => ({
        ...prev,
        bugFixes: [...prev.bugFixes, newBugFix.trim()],
      }))
      setNewBugFix("")
    }
  }

  const removeBugFix = (index: number) => {
    setFormData(prev => ({
      ...prev,
      bugFixes: prev.bugFixes.filter((_, i) => i !== index),
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/operations/releases">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Rocket className="h-6 w-6 text-primary" />
              Create New Release
            </h1>
            <p className="text-sm text-muted-foreground">
              Plan and schedule a new platform release
            </p>
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isSaving || !formData.version}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Release
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Release Details</CardTitle>
            <CardDescription>
              Basic information about this release
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="version">Version *</Label>
                <Input
                  id="version"
                  placeholder="e.g., 2.5.0"
                  value={formData.version}
                  onChange={(e) =>
                    setFormData({ ...formData, version: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name (optional)</Label>
                <Input
                  id="name"
                  placeholder="e.g., Phoenix"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the release..."
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex flex-col">
                          <span>{opt.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {opt.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rollout Strategy</Label>
                <Select
                  value={formData.rolloutStrategy}
                  onValueChange={(value) =>
                    setFormData({ ...formData, rolloutStrategy: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {strategyOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex flex-col">
                          <span>{opt.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {opt.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plannedDate">Planned Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="plannedDate"
                    type="date"
                    className="pl-10"
                    value={formData.plannedDate}
                    onChange={(e) =>
                      setFormData({ ...formData, plannedDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="changelogUrl">Changelog URL</Label>
                <Input
                  id="changelogUrl"
                  placeholder="https://..."
                  value={formData.changelogUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, changelogUrl: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features & Bug Fixes */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Features
              </CardTitle>
              <CardDescription>
                New features included in this release
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a feature..."
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addFeature()}
                />
                <Button onClick={addFeature} size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {feature}
                    <button onClick={() => removeFeature(index)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {formData.features.length === 0 && (
                  <p className="text-sm text-muted-foreground">No features added yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Bug Fixes
              </CardTitle>
              <CardDescription>
                Bug fixes included in this release
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a bug fix..."
                  value={newBugFix}
                  onChange={(e) => setNewBugFix(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addBugFix()}
                />
                <Button onClick={addBugFix} size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.bugFixes.map((fix, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {fix}
                    <button onClick={() => removeBugFix(index)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {formData.bugFixes.length === 0 && (
                  <p className="text-sm text-muted-foreground">No bug fixes added yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
