"use client"
/* eslint-disable local/no-hardcoded-strings */

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2, Edit, CheckCircle2 } from "lucide-react"

interface Quota {
  id: string
  name: string
  targetCount: number
  currentCount: number
  conditions: Record<string, unknown>
  isActive: boolean
  createdAt: string
}

interface QuotaStatus {
  quotas: Array<{
    id: string
    name: string
    targetCount: number
    currentCount: number
    remaining: number
    percentage: number
    isComplete: boolean
  }>
  summary: {
    totalQuotas: number
    totalTarget: number
    totalCurrent: number
    totalRemaining: number
    overallPercentage: number
    completedQuotas: number
  }
}

export default function SurveyQuotasPage() {
  const params = useParams()
  const surveyId = params.id as string

  const [quotas, setQuotas] = useState<Quota[]>([])
  const [status, setStatus] = useState<QuotaStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingQuota, setEditingQuota] = useState<Quota | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    targetCount: 100,
    conditions: {} as Record<string, unknown>,
    isActive: true,
  })

  useEffect(() => {
    if (surveyId) {
      fetchQuotas()
      fetchStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surveyId])

  const fetchQuotas = async () => {
    try {
      const response = await fetch(`/api/gwi/surveys/${surveyId}/quotas`)
      if (response.ok) {
        const data = await response.json()
        setQuotas(data)
      }
    } catch (error) {
      console.error("Failed to fetch quotas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/gwi/surveys/${surveyId}/quotas/status`)
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error("Failed to fetch quota status:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const url = editingQuota
      ? `/api/gwi/surveys/${surveyId}/quotas/${editingQuota.id}`
      : `/api/gwi/surveys/${surveyId}/quotas`
    const method = editingQuota ? "PATCH" : "POST"

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        setEditingQuota(null)
        setFormData({
          name: "",
          targetCount: 100,
          conditions: {},
          isActive: true,
        })
        fetchQuotas()
        fetchStatus()
      }
    } catch (error) {
      console.error("Failed to save quota:", error)
    }
  }

  const handleDelete = async (quotaId: string) => {
    if (!confirm("Are you sure you want to delete this quota?")) {
      return
    }

    try {
      const response = await fetch(
        `/api/gwi/surveys/${surveyId}/quotas/${quotaId}`,
        { method: "DELETE" }
      )

      if (response.ok) {
        fetchQuotas()
        fetchStatus()
      }
    } catch (error) {
      console.error("Failed to delete quota:", error)
    }
  }

  const handleEdit = (quota: Quota) => {
    setEditingQuota(quota)
    setFormData({
      name: quota.name,
      targetCount: quota.targetCount,
      conditions: quota.conditions,
      isActive: quota.isActive,
    })
    setIsDialogOpen(true)
  }

  const addCondition = () => {
    setFormData({
      ...formData,
      conditions: { ...formData.conditions, "": "" },
    })
  }

  const updateCondition = (key: string, value: string) => {
    const newConditions = { ...formData.conditions }
    if (value === "") {
      delete newConditions[key]
    } else {
      newConditions[key] = value
    }
    setFormData({ ...formData, conditions: newConditions })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Survey Quotas</h1>
          <p className="text-muted-foreground">
            Manage response quotas and track completion
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingQuota(null)
                setFormData({
                  name: "",
                  targetCount: 100,
                  conditions: {},
                  isActive: true,
                })
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Quota
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingQuota ? "Edit" : "Create"} Quota
              </DialogTitle>
              <DialogDescription>
                Set target response counts for specific respondent segments
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Quota Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Male 25-34"
                  required
                />
              </div>

              <div>
                <Label>Target Count</Label>
                <Input
                  type="number"
                  value={formData.targetCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetCount: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Conditions</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCondition}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Condition
                  </Button>
                </div>
                <div className="space-y-2 border rounded-md p-4">
                  {Object.keys(formData.conditions).length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No conditions set. This quota will apply to all respondents.
                    </p>
                  ) : (
                    Object.entries(formData.conditions).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <Input
                          placeholder="Question code (e.g., Q1)"
                          value={key}
                          onChange={(e) => {
                            const oldValue = formData.conditions[key]
                            updateCondition(key, "")
                            updateCondition(e.target.value, String(oldValue))
                          }}
                        />
                        <Input
                          placeholder="Value"
                          value={String(value)}
                          onChange={(e) => updateCondition(key, e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => updateCondition(key, "")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {status && (
        <Card>
          <CardHeader>
            <CardTitle>Quota Status</CardTitle>
            <CardDescription>Overall completion summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Target</p>
                  <p className="text-2xl font-bold">{status.summary.totalTarget}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current</p>
                  <p className="text-2xl font-bold">{status.summary.totalCurrent}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className="text-2xl font-bold">{status.summary.totalRemaining}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-2xl font-bold">
                    {status.summary.overallPercentage}%
                  </p>
                </div>
              </div>
              <Progress value={status.summary.overallPercentage} />
              <div className="flex items-center gap-4 text-sm">
                <span>
                  {status.summary.completedQuotas} of {status.summary.totalQuotas}{" "}
                  quotas completed
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quotas</CardTitle>
          <CardDescription>
            {quotas.length} quota{quotas.length !== 1 ? "s" : ""} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading quotas...</div>
          ) : quotas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No quotas configured. Click "Add Quota" to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Conditions</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotas.map((quota) => {
                  const percentage =
                    quota.targetCount > 0
                      ? Math.round((quota.currentCount / quota.targetCount) * 100)
                      : 0
                  const isComplete = quota.currentCount >= quota.targetCount

                  return (
                    <TableRow key={quota.id}>
                      <TableCell className="font-medium">{quota.name}</TableCell>
                      <TableCell>
                        {Object.keys(quota.conditions).length === 0 ? (
                          <span className="text-sm text-muted-foreground">
                            All respondents
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(quota.conditions).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="text-xs">
                                {key}={String(value)}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>
                              {quota.currentCount} / {quota.targetCount}
                            </span>
                            <span className="text-muted-foreground">{percentage}%</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        {isComplete ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Complete
                          </Badge>
                        ) : (
                          <Badge variant={quota.isActive ? "default" : "secondary"}>
                            {quota.isActive ? "Active" : "Inactive"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(quota)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(quota.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
