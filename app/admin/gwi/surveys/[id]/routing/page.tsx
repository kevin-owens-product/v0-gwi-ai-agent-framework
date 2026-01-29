"use client"
/* eslint-disable local/no-hardcoded-strings */

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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
import { Plus, Trash2, Edit } from "lucide-react"

interface RoutingRule {
  id: string
  sourceQuestionId: string | null
  sourceQuestion: { id: string; code: string; text: string } | null
  condition: Record<string, unknown>
  targetQuestionId: string | null
  targetQuestion: { id: string; code: string; text: string } | null
  action: string
  priority: number
  isActive: boolean
}

interface Question {
  id: string
  code: string
  text: string
  order: number
}

export default function SurveyRoutingPage() {
  const params = useParams()
  const surveyId = params.id as string

  const [routingRules, setRoutingRules] = useState<RoutingRule[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<RoutingRule | null>(null)

  const [formData, setFormData] = useState({
    sourceQuestionId: "",
    conditionType: "equals",
    conditionField: "",
    conditionValue: "",
    targetQuestionId: "",
    action: "skip_to",
    priority: 0,
    isActive: true,
  })

  useEffect(() => {
    if (surveyId) {
      fetchRoutingRules()
      fetchQuestions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surveyId])

  const fetchRoutingRules = async () => {
    try {
      const response = await fetch(`/api/gwi/surveys/${surveyId}/routing`)
      if (response.ok) {
        const data = await response.json()
        setRoutingRules(data)
      }
    } catch (error) {
      console.error("Failed to fetch routing rules:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/gwi/surveys/${surveyId}/questions`)
      if (response.ok) {
        const data = await response.json()
        setQuestions(data)
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const condition = {
      type: formData.conditionType,
      field: formData.conditionField,
      value: formData.conditionValue,
    }

    const url = editingRule
      ? `/api/gwi/surveys/${surveyId}/routing/${editingRule.id}`
      : `/api/gwi/surveys/${surveyId}/routing`
    const method = editingRule ? "PATCH" : "POST"

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceQuestionId: formData.sourceQuestionId || null,
          condition,
          targetQuestionId: formData.targetQuestionId || null,
          action: formData.action,
          priority: formData.priority,
          isActive: formData.isActive,
        }),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        setEditingRule(null)
        setFormData({
          sourceQuestionId: "",
          conditionType: "equals",
          conditionField: "",
          conditionValue: "",
          targetQuestionId: "",
          action: "skip_to",
          priority: 0,
          isActive: true,
        })
        fetchRoutingRules()
      }
    } catch (error) {
      console.error("Failed to save routing rule:", error)
    }
  }

  const handleDelete = async (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this routing rule?")) {
      return
    }

    try {
      const response = await fetch(
        `/api/gwi/surveys/${surveyId}/routing/${ruleId}`,
        { method: "DELETE" }
      )

      if (response.ok) {
        fetchRoutingRules()
      }
    } catch (error) {
      console.error("Failed to delete routing rule:", error)
    }
  }

  const handleEdit = (rule: RoutingRule) => {
    setEditingRule(rule)
    const condition = rule.condition as Record<string, unknown>
    setFormData({
      sourceQuestionId: rule.sourceQuestionId || "",
      conditionType: (condition.type as string) || "equals",
      conditionField: (condition.field as string) || "",
      conditionValue: String(condition.value || ""),
      targetQuestionId: rule.targetQuestionId || "",
      action: rule.action,
      priority: rule.priority,
      isActive: rule.isActive,
    })
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Survey Routing</h1>
          <p className="text-muted-foreground">
            Configure skip logic and conditional question display
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingRule(null)
              setFormData({
                sourceQuestionId: "",
                conditionType: "equals",
                conditionField: "",
                conditionValue: "",
                targetQuestionId: "",
                action: "skip_to",
                priority: 0,
                isActive: true,
              })
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Routing Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingRule ? "Edit" : "Create"} Routing Rule
              </DialogTitle>
              <DialogDescription>
                Configure when and how to route respondents through the survey
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Source Question</Label>
                  <Select
                    value={formData.sourceQuestionId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, sourceQuestionId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select question" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None (Always applies)</SelectItem>
                      {questions.map((q) => (
                        <SelectItem key={q.id} value={q.id}>
                          {q.code}: {q.text.substring(0, 50)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Action</Label>
                  <Select
                    value={formData.action}
                    onValueChange={(value) =>
                      setFormData({ ...formData, action: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skip_to">Skip To</SelectItem>
                      <SelectItem value="show_if">Show If</SelectItem>
                      <SelectItem value="hide_if">Hide If</SelectItem>
                      <SelectItem value="end_survey">End Survey</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Condition</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Select
                    value={formData.conditionType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, conditionType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="not_equals">Not Equals</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="greater">Greater Than</SelectItem>
                      <SelectItem value="less">Less Than</SelectItem>
                      <SelectItem value="in">In</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Field (e.g., Q1)"
                    value={formData.conditionField}
                    onChange={(e) =>
                      setFormData({ ...formData, conditionField: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Value"
                    value={formData.conditionValue}
                    onChange={(e) =>
                      setFormData({ ...formData, conditionValue: e.target.value })
                    }
                  />
                </div>
              </div>

              {formData.action === "skip_to" && (
                <div>
                  <Label>Target Question</Label>
                  <Select
                    value={formData.targetQuestionId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, targetQuestionId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target question" />
                    </SelectTrigger>
                    <SelectContent>
                      {questions.map((q) => (
                        <SelectItem key={q.id} value={q.id}>
                          {q.code}: {q.text.substring(0, 50)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Priority</Label>
                  <Input
                    type="number"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="flex items-center gap-2 pt-8">
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

      <Card>
        <CardHeader>
          <CardTitle>Routing Rules</CardTitle>
          <CardDescription>
            {routingRules.length} rule{routingRules.length !== 1 ? "s" : ""} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading routing rules...</div>
          ) : routingRules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No routing rules configured. Click "Add Routing Rule" to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routingRules.map((rule) => {
                  const condition = rule.condition as Record<string, unknown>
                  return (
                    <TableRow key={rule.id}>
                      <TableCell>
                        {rule.sourceQuestion
                          ? `${rule.sourceQuestion.code}`
                          : "Always"}
                      </TableCell>
                      <TableCell>
                        {condition.field && (
                          <span className="text-sm">
                            {condition.field} {condition.type} {String(condition.value)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{rule.action}</Badge>
                      </TableCell>
                      <TableCell>
                        {rule.targetQuestion
                          ? `${rule.targetQuestion.code}`
                          : rule.action === "end_survey"
                          ? "End"
                          : "-"}
                      </TableCell>
                      <TableCell>{rule.priority}</TableCell>
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
