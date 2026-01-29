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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2, Edit, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface QualityRule {
  id: string
  name: string
  field: string
  ruleType: string
  ruleConfig: Record<string, unknown>
  severity: string
  isActive: boolean
  createdAt: string
}

interface QualityData {
  qualityRules: QualityRule[]
  qualityScore: number
  metrics: {
    totalRules: number
    errorRules: number
    warningRules: number
  }
}

export default function DataSourceQualityPage() {
  const params = useParams()
  const dataSourceId = params.id as string

  const [qualityData, setQualityData] = useState<QualityData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<QualityRule | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    field: "",
    ruleType: "required",
    ruleConfig: "",
    severity: "error",
    isActive: true,
  })

  useEffect(() => {
    if (dataSourceId) {
      fetchQualityData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSourceId])

  const fetchQualityData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/gwi/data-sources/${dataSourceId}/quality`)
      if (response.ok) {
        const data = await response.json()
        setQualityData(data)
      }
    } catch (error) {
      console.error("Failed to fetch quality data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let ruleConfig = {}
    if (formData.ruleConfig) {
      try {
        ruleConfig = JSON.parse(formData.ruleConfig)
      } catch {
        alert("Invalid JSON in rule config")
        return
      }
    }

    const url = editingRule
      ? `/api/gwi/data-sources/${dataSourceId}/quality/${editingRule.id}`
      : `/api/gwi/data-sources/${dataSourceId}/quality`
    const method = editingRule ? "PATCH" : "POST"

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          field: formData.field,
          ruleType: formData.ruleType,
          ruleConfig,
          severity: formData.severity,
          isActive: formData.isActive,
        }),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        setEditingRule(null)
        setFormData({
          name: "",
          field: "",
          ruleType: "required",
          ruleConfig: "",
          severity: "error",
          isActive: true,
        })
        fetchQualityData()
      }
    } catch (error) {
      console.error("Failed to save quality rule:", error)
    }
  }

  const handleDelete = async (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this quality rule?")) {
      return
    }

    try {
      const response = await fetch(
        `/api/gwi/data-sources/${dataSourceId}/quality/${ruleId}`,
        { method: "DELETE" }
      )

      if (response.ok) {
        fetchQualityData()
      }
    } catch (error) {
      console.error("Failed to delete quality rule:", error)
    }
  }

  const handleEdit = (rule: QualityRule) => {
    setEditingRule(rule)
    setFormData({
      name: rule.name,
      field: rule.field,
      ruleType: rule.ruleType,
      ruleConfig: JSON.stringify(rule.ruleConfig, null, 2),
      severity: rule.severity,
      isActive: rule.isActive,
    })
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Quality Rules</h1>
          <p className="text-muted-foreground">
            Configure data quality validation rules
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingRule(null)
                setFormData({
                  name: "",
                  field: "",
                  ruleType: "required",
                  ruleConfig: "",
                  severity: "error",
                  isActive: true,
                })
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Quality Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingRule ? "Edit" : "Create"} Quality Rule
              </DialogTitle>
              <DialogDescription>
                Define validation rules to ensure data quality
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Rule Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Email Format Validation"
                    required
                  />
                </div>
                <div>
                  <Label>Field</Label>
                  <Input
                    value={formData.field}
                    onChange={(e) =>
                      setFormData({ ...formData, field: e.target.value })
                    }
                    placeholder="field_name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Rule Type</Label>
                  <Select
                    value={formData.ruleType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, ruleType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="required">Required</SelectItem>
                      <SelectItem value="format">Format</SelectItem>
                      <SelectItem value="range">Range</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Severity</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value) =>
                      setFormData({ ...formData, severity: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Rule Configuration (JSON)</Label>
                <Textarea
                  value={formData.ruleConfig}
                  onChange={(e) =>
                    setFormData({ ...formData, ruleConfig: e.target.value })
                  }
                  placeholder='{"pattern": "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$"}'
                  rows={4}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  JSON configuration for the rule (e.g., pattern, min, max, etc.)
                </p>
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

      {qualityData && (
        <Card>
          <CardHeader>
            <CardTitle>Quality Score</CardTitle>
            <CardDescription>Overall data quality metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Quality Score</p>
                  <p className="text-4xl font-bold">{qualityData.qualityScore}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Rules</p>
                    <p className="text-2xl font-bold">
                      {qualityData.metrics.totalRules}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Errors</p>
                    <p className="text-2xl font-bold text-red-500">
                      {qualityData.metrics.errorRules}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Warnings</p>
                    <p className="text-2xl font-bold text-yellow-500">
                      {qualityData.metrics.warningRules}
                    </p>
                  </div>
                </div>
              </div>
              <Progress value={qualityData.qualityScore} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quality Rules</CardTitle>
          <CardDescription>
            {qualityData?.qualityRules.length || 0} rule
            {(qualityData?.qualityRules.length || 0) !== 1 ? "s" : ""} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading quality rules...</div>
          ) : !qualityData || qualityData.qualityRules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No quality rules configured. Click "Add Quality Rule" to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qualityData.qualityRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell className="font-mono text-sm">{rule.field}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{rule.ruleType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={rule.severity === "error" ? "destructive" : "default"}
                      >
                        {rule.severity === "error" ? (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        )}
                        {rule.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.isActive ? "default" : "secondary"}>
                        {rule.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(rule)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(rule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
