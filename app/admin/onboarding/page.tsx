/**
 * @prompt-id forge-v4.1:feature:onboarding-checklist:011
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import {
  ClipboardList,
  Plus,
  Loader2,
  RefreshCw,
  MoreHorizontal,
  Edit,
  Trash2,
  Star,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
} from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  action: string
  estimatedTime: number
  order: number
}

interface OnboardingTemplate {
  id: string
  name: string
  description: string | null
  targetUserType: string | null
  targetPlanTier: string | null
  steps: OnboardingStep[]
  isActive: boolean
  isDefault: boolean
  estimatedTime: number | null
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
  completionRate?: number
  totalUsers?: number
  completedUsers?: number
}

interface CompletionRate {
  templateId: string
  templateName: string
  total: number
  completed: number
  rate: number
}

const defaultStep: OnboardingStep = {
  id: '',
  title: '',
  description: '',
  action: '',
  estimatedTime: 5,
  order: 0,
}

export default function OnboardingAdminPage() {
  const [templates, setTemplates] = useState<OnboardingTemplate[]>([])
  const [completionRates, setCompletionRates] = useState<CompletionRate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] =
    useState<OnboardingTemplate | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetUserType: '',
    targetPlanTier: '',
    steps: [{ ...defaultStep, id: 'step-1', order: 1 }] as OnboardingStep[],
    isDefault: false,
    isActive: true,
  })

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        '/api/admin/onboarding/templates?includeRates=true'
      )
      const data = await response.json()
      setTemplates(data.templates || [])
      setCompletionRates(data.completionRates || [])
    } catch (error) {
      console.error('Failed to fetch templates:', error)
      setTemplates([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      targetUserType: '',
      targetPlanTier: '',
      steps: [{ ...defaultStep, id: 'step-1', order: 1 }],
      isDefault: false,
      isActive: true,
    })
    setEditingTemplate(null)
  }

  const handleOpenDialog = (template?: OnboardingTemplate) => {
    if (template) {
      setEditingTemplate(template)
      setFormData({
        name: template.name,
        description: template.description || '',
        targetUserType: template.targetUserType || '',
        targetPlanTier: template.targetPlanTier || '',
        steps: template.steps,
        isDefault: template.isDefault,
        isActive: template.isActive,
      })
    } else {
      resetForm()
    }
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const url = editingTemplate
        ? `/api/admin/onboarding/templates/${editingTemplate.id}`
        : '/api/admin/onboarding/templates'
      const method = editingTemplate ? 'PATCH' : 'POST'

      const payload = {
        ...formData,
        targetUserType: formData.targetUserType || undefined,
        targetPlanTier: formData.targetPlanTier || undefined,
      }

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      setDialogOpen(false)
      resetForm()
      fetchTemplates()
    } catch (error) {
      console.error('Failed to save template:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (template: OnboardingTemplate) => {
    if (template.isDefault) {
      alert('Cannot delete the default template')
      return
    }

    if (!confirm(`Are you sure you want to delete "${template.name}"?`)) {
      return
    }

    try {
      await fetch(`/api/admin/onboarding/templates/${template.id}`, {
        method: 'DELETE',
      })
      fetchTemplates()
    } catch (error) {
      console.error('Failed to delete template:', error)
    }
  }

  const handleToggleActive = async (template: OnboardingTemplate) => {
    try {
      await fetch(`/api/admin/onboarding/templates/${template.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !template.isActive }),
      })
      fetchTemplates()
    } catch (error) {
      console.error('Failed to toggle template:', error)
    }
  }

  const handleSetDefault = async (template: OnboardingTemplate) => {
    try {
      await fetch(`/api/admin/onboarding/templates/${template.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      })
      fetchTemplates()
    } catch (error) {
      console.error('Failed to set default:', error)
    }
  }

  const addStep = () => {
    const newOrder = formData.steps.length + 1
    setFormData((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        { ...defaultStep, id: `step-${newOrder}`, order: newOrder },
      ],
    }))
  }

  const removeStep = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps
        .filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, order: i + 1 })),
    }))
  }

  const updateStep = (
    index: number,
    field: keyof OnboardingStep,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((step, i) =>
        i === index ? { ...step, [field]: value } : step
      ),
    }))
  }

  // Calculate totals
  const totalUsers = completionRates.reduce((acc, r) => acc + r.total, 0)
  const totalCompleted = completionRates.reduce((acc, r) => acc + r.completed, 0)
  const overallRate = totalUsers > 0 ? Math.round((totalCompleted / totalUsers) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{templates.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Users in Onboarding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{totalUsers}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Onboarding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-chart-5" />
              <span className="text-2xl font-bold">{totalCompleted}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold">{overallRate}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completion Rates by Template */}
      {completionRates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completion Rates by Template</CardTitle>
            <CardDescription>
              Track how users progress through each onboarding template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completionRates.map((rate) => (
                <div key={rate.templateId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {rate.templateName}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {rate.completed} / {rate.total} users ({rate.rate}%)
                    </span>
                  </div>
                  <Progress value={rate.rate} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Onboarding Templates</CardTitle>
              <CardDescription>
                Manage onboarding flows for different user types
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchTemplates} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingTemplate
                        ? 'Edit Onboarding Template'
                        : 'Create Onboarding Template'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingTemplate
                        ? 'Update the template configuration and steps'
                        : 'Create a new onboarding template with custom steps'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          placeholder="e.g., New User Onboarding"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Target User Type</Label>
                        <Select
                          value={formData.targetUserType}
                          onValueChange={(v) =>
                            setFormData((prev) => ({
                              ...prev,
                              targetUserType: v,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All users" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Users</SelectItem>
                            <SelectItem value="new_user">New User</SelectItem>
                            <SelectItem value="new_admin">New Admin</SelectItem>
                            <SelectItem value="invited_user">
                              Invited User
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Target Plan Tier</Label>
                        <Select
                          value={formData.targetPlanTier}
                          onValueChange={(v) =>
                            setFormData((prev) => ({
                              ...prev,
                              targetPlanTier: v,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All plans" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Plans</SelectItem>
                            <SelectItem value="STARTER">Starter</SelectItem>
                            <SelectItem value="PROFESSIONAL">
                              Professional
                            </SelectItem>
                            <SelectItem value="ENTERPRISE">
                              Enterprise
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-4 pt-6">
                        <div className="flex items-center gap-2">
                          <Switch
                            id="isActive"
                            checked={formData.isActive}
                            onCheckedChange={(checked) =>
                              setFormData((prev) => ({
                                ...prev,
                                isActive: checked,
                              }))
                            }
                          />
                          <Label htmlFor="isActive">Active</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            id="isDefault"
                            checked={formData.isDefault}
                            onCheckedChange={(checked) =>
                              setFormData((prev) => ({
                                ...prev,
                                isDefault: checked,
                              }))
                            }
                          />
                          <Label htmlFor="isDefault">Default</Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Describe this onboarding template..."
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        rows={2}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Onboarding Steps</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addStep}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Step
                        </Button>
                      </div>

                      {formData.steps.map((step, index) => (
                        <Card key={step.id || index} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary flex-shrink-0 mt-1">
                              {index + 1}
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <Input
                                  placeholder="Step ID (e.g., complete-profile)"
                                  value={step.id}
                                  onChange={(e) =>
                                    updateStep(index, 'id', e.target.value)
                                  }
                                />
                                <Input
                                  placeholder="Title"
                                  value={step.title}
                                  onChange={(e) =>
                                    updateStep(index, 'title', e.target.value)
                                  }
                                />
                              </div>
                              <Input
                                placeholder="Description"
                                value={step.description}
                                onChange={(e) =>
                                  updateStep(
                                    index,
                                    'description',
                                    e.target.value
                                  )
                                }
                              />
                              <div className="grid grid-cols-2 gap-3">
                                <Input
                                  placeholder="Action URL (e.g., /dashboard/settings/profile)"
                                  value={step.action}
                                  onChange={(e) =>
                                    updateStep(index, 'action', e.target.value)
                                  }
                                />
                                <Input
                                  type="number"
                                  placeholder="Est. time (min)"
                                  value={step.estimatedTime}
                                  onChange={(e) =>
                                    updateStep(
                                      index,
                                      'estimatedTime',
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                />
                              </div>
                            </div>
                            {formData.steps.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => removeStep(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={
                        !formData.name ||
                        formData.steps.length === 0 ||
                        isSubmitting
                      }
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : editingTemplate ? (
                        'Update Template'
                      ) : (
                        'Create Template'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No onboarding templates configured
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead className="text-center">Steps</TableHead>
                  <TableHead className="text-center">Completion</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <ClipboardList className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{template.name}</p>
                            {template.isDefault && (
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          {template.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {template.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {template.targetUserType && (
                          <Badge variant="outline" className="text-xs">
                            {template.targetUserType}
                          </Badge>
                        )}
                        {template.targetPlanTier && (
                          <Badge variant="secondary" className="text-xs">
                            {template.targetPlanTier}
                          </Badge>
                        )}
                        {!template.targetUserType &&
                          !template.targetPlanTier && (
                            <span className="text-xs text-muted-foreground">
                              All users
                            </span>
                          )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {template.steps.length}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {template.totalUsers !== undefined ? (
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-medium">
                            {template.completionRate}%
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({template.completedUsers}/{template.totalUsers})
                          </span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={template.isActive}
                        onCheckedChange={() => handleToggleActive(template)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleOpenDialog(template)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {!template.isDefault && (
                            <DropdownMenuItem
                              onClick={() => handleSetDefault(template)}
                            >
                              <Star className="h-4 w-4 mr-2" />
                              Set as Default
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(template)}
                            className="text-destructive focus:text-destructive"
                            disabled={template.isDefault}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
