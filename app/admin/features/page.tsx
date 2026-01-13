"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
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
  Flag,
  Plus,
  Loader2,
  RefreshCw,
  Pencil,
  Trash2,
  ToggleLeft,
  Percent,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"

interface FeatureFlag {
  id: string
  key: string
  name: string
  description: string | null
  type: string
  isEnabled: boolean
  rolloutPercentage: number
  allowedOrgs: string[]
  blockedOrgs: string[]
  allowedPlans: string[]
  createdAt: string
  updatedAt: string
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    key: "",
    name: "",
    description: "",
    type: "BOOLEAN",
    isEnabled: false,
    rolloutPercentage: 100,
    allowedPlans: [] as string[],
  })

  const fetchFlags = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/features")
      const data = await response.json()
      setFlags(data.flags)
    } catch (error) {
      console.error("Failed to fetch feature flags:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFlags()
  }, [])

  const resetForm = () => {
    setFormData({
      key: "",
      name: "",
      description: "",
      type: "BOOLEAN",
      isEnabled: false,
      rolloutPercentage: 100,
      allowedPlans: [],
    })
    setEditingFlag(null)
  }

  const handleOpenDialog = (flag?: FeatureFlag) => {
    if (flag) {
      setEditingFlag(flag)
      setFormData({
        key: flag.key,
        name: flag.name,
        description: flag.description || "",
        type: flag.type,
        isEnabled: flag.isEnabled,
        rolloutPercentage: flag.rolloutPercentage,
        allowedPlans: flag.allowedPlans,
      })
    } else {
      resetForm()
    }
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const url = editingFlag
        ? `/api/admin/features/${editingFlag.id}`
        : "/api/admin/features"
      const method = editingFlag ? "PATCH" : "POST"

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      setDialogOpen(false)
      resetForm()
      fetchFlags()
    } catch (error) {
      console.error("Failed to save feature flag:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggle = async (flag: FeatureFlag) => {
    try {
      await fetch(`/api/admin/features/${flag.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !flag.isEnabled }),
      })
      fetchFlags()
    } catch (error) {
      console.error("Failed to toggle feature flag:", error)
    }
  }

  const handleDelete = async (flagId: string) => {
    if (!confirm("Are you sure you want to delete this feature flag?")) return
    try {
      await fetch(`/api/admin/features/${flagId}`, { method: "DELETE" })
      fetchFlags()
    } catch (error) {
      console.error("Failed to delete feature flag:", error)
    }
  }

  const togglePlan = (plan: string) => {
    setFormData(prev => ({
      ...prev,
      allowedPlans: prev.allowedPlans.includes(plan)
        ? prev.allowedPlans.filter(p => p !== plan)
        : [...prev.allowedPlans, plan],
    }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>
                Manage feature rollouts and A/B testing across the platform
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchFlags} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Flag
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>
                      {editingFlag ? "Edit Feature Flag" : "Create Feature Flag"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingFlag
                        ? "Update the feature flag configuration"
                        : "Create a new feature flag to control feature rollout"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Key</Label>
                        <Input
                          placeholder="e.g., new_dashboard"
                          value={formData.key}
                          onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                          disabled={!!editingFlag}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BOOLEAN">Boolean</SelectItem>
                            <SelectItem value="STRING">String</SelectItem>
                            <SelectItem value="NUMBER">Number</SelectItem>
                            <SelectItem value="JSON">JSON</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        placeholder="Feature display name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="What does this feature flag control?"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={2}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enabled</Label>
                        <p className="text-xs text-muted-foreground">Turn this feature on or off</p>
                      </div>
                      <Switch
                        checked={formData.isEnabled}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isEnabled: checked }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Rollout Percentage</Label>
                        <span className="text-sm font-medium">{formData.rolloutPercentage}%</span>
                      </div>
                      <Slider
                        value={[formData.rolloutPercentage]}
                        onValueChange={([value]) => setFormData(prev => ({ ...prev, rolloutPercentage: value }))}
                        max={100}
                        step={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Allowed Plans</Label>
                      <div className="flex gap-4">
                        {["STARTER", "PROFESSIONAL", "ENTERPRISE"].map((plan) => (
                          <div key={plan} className="flex items-center gap-2">
                            <Checkbox
                              id={plan}
                              checked={formData.allowedPlans.includes(plan)}
                              onCheckedChange={() => togglePlan(plan)}
                            />
                            <label htmlFor={plan} className="text-sm">
                              {plan}
                            </label>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Leave empty to allow all plans
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!formData.key || !formData.name || isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : editingFlag ? (
                        "Update Flag"
                      ) : (
                        "Create Flag"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flag</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Rollout</TableHead>
                  <TableHead>Allowed Plans</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : flags.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No feature flags configured
                    </TableCell>
                  </TableRow>
                ) : (
                  flags.map((flag) => (
                    <TableRow key={flag.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Flag className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{flag.name}</p>
                            <code className="text-xs text-muted-foreground bg-muted px-1 rounded">
                              {flag.key}
                            </code>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{flag.type}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <Switch
                            checked={flag.isEnabled}
                            onCheckedChange={() => handleToggle(flag)}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Percent className="h-3 w-3 text-muted-foreground" />
                          {flag.rolloutPercentage}%
                        </div>
                      </TableCell>
                      <TableCell>
                        {flag.allowedPlans.length === 0 ? (
                          <span className="text-xs text-muted-foreground">All Plans</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {flag.allowedPlans.map((plan) => (
                              <Badge key={plan} variant="secondary" className="text-xs">
                                {plan}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(flag.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/features/${flag.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(flag)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(flag.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
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
