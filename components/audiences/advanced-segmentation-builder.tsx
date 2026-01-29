"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, X, GripVertical, Trash2, Copy } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export interface FilterGroup {
  id: string
  logic: "AND" | "OR"
  conditions: FilterCondition[]
}

export interface FilterCondition {
  id: string
  dimension: string
  operator: string
  value: string | number | [number, number]
}

interface AdvancedSegmentationBuilderProps {
  onCriteriaChange: (groups: FilterGroup[]) => void
  initialGroups?: FilterGroup[]
}

const DIMENSION_OPTIONS = [
  { value: "age", label: "Age", type: "number" },
  { value: "gender", label: "Gender", type: "select" },
  { value: "income", label: "Income", type: "number" },
  { value: "education", label: "Education", type: "select" },
  { value: "location", label: "Location", type: "select" },
  { value: "interests", label: "Interests", type: "multi-select" },
  { value: "behaviors", label: "Behaviors", type: "multi-select" },
  { value: "lifestyle", label: "Lifestyle", type: "multi-select" },
  { value: "values", label: "Values", type: "multi-select" },
  { value: "purchase_behavior", label: "Purchase Behavior", type: "select" },
  { value: "media_consumption", label: "Media Consumption", type: "multi-select" },
  { value: "device_usage", label: "Device Usage", type: "multi-select" },
]

const OPERATOR_OPTIONS = {
  number: [
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Not equals" },
    { value: "greater_than", label: "Greater than" },
    { value: "less_than", label: "Less than" },
    { value: "between", label: "Between" },
  ],
  select: [
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Not equals" },
    { value: "in", label: "In" },
    { value: "not_in", label: "Not in" },
  ],
  "multi-select": [
    { value: "contains", label: "Contains" },
    { value: "not_contains", label: "Does not contain" },
    { value: "contains_all", label: "Contains all" },
    { value: "contains_any", label: "Contains any" },
  ],
}

export function AdvancedSegmentationBuilder({
  onCriteriaChange,
  initialGroups = [],
}: AdvancedSegmentationBuilderProps) {
  const [groups, setGroups] = useState<FilterGroup[]>(
    initialGroups.length > 0
      ? initialGroups
      : [
          {
            id: `group-${Date.now()}`,
            logic: "AND",
            conditions: [],
          },
        ]
  )

  const updateGroups = useCallback(
    (newGroups: FilterGroup[]) => {
      setGroups(newGroups)
      onCriteriaChange(newGroups)
    },
    [onCriteriaChange]
  )

  const addGroup = useCallback(() => {
    const newGroup: FilterGroup = {
      id: `group-${Date.now()}`,
      logic: "AND",
      conditions: [],
    }
    updateGroups([...groups, newGroup])
  }, [groups, updateGroups])

  const removeGroup = useCallback(
    (groupId: string) => {
      if (groups.length > 1) {
        updateGroups(groups.filter((g) => g.id !== groupId))
      }
    },
    [groups, updateGroups]
  )

  const updateGroupLogic = useCallback(
    (groupId: string, logic: "AND" | "OR") => {
      updateGroups(
        groups.map((g) => (g.id === groupId ? { ...g, logic } : g))
      )
    },
    [groups, updateGroups]
  )

  const addCondition = useCallback(
    (groupId: string) => {
      const dimension = DIMENSION_OPTIONS[0]
      const operator = OPERATOR_OPTIONS[dimension.type as keyof typeof OPERATOR_OPTIONS][0]
      const newCondition: FilterCondition = {
        id: `condition-${Date.now()}`,
        dimension: dimension.value,
        operator: operator.value,
        value: "",
      }
      updateGroups(
        groups.map((g) =>
          g.id === groupId
            ? { ...g, conditions: [...g.conditions, newCondition] }
            : g
        )
      )
    },
    [groups, updateGroups]
  )

  const removeCondition = useCallback(
    (groupId: string, conditionId: string) => {
      updateGroups(
        groups.map((g) =>
          g.id === groupId
            ? {
                ...g,
                conditions: g.conditions.filter((c) => c.id !== conditionId),
              }
            : g
        )
      )
    },
    [groups, updateGroups]
  )

  const updateCondition = useCallback(
    (
      groupId: string,
      conditionId: string,
      field: keyof FilterCondition,
      value: string | number | [number, number]
    ) => {
      updateGroups(
        groups.map((g) =>
          g.id === groupId
            ? {
                ...g,
                conditions: g.conditions.map((c) =>
                  c.id === conditionId ? { ...c, [field]: value } : c
                ),
              }
            : g
        )
      )
    },
    [groups, updateGroups]
  )

  const duplicateGroup = useCallback(
    (groupId: string) => {
      const group = groups.find((g) => g.id === groupId)
      if (group) {
        const newGroup: FilterGroup = {
          id: `group-${Date.now()}`,
          logic: group.logic,
          conditions: group.conditions.map((c) => ({
            ...c,
            id: `condition-${Date.now()}-${Math.random()}`,
          })),
        }
        const index = groups.findIndex((g) => g.id === groupId)
        const newGroups = [...groups]
        newGroups.splice(index + 1, 0, newGroup)
        updateGroups(newGroups)
      }
    },
    [groups, updateGroups]
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Advanced Segmentation Builder</CardTitle>
            <CardDescription>
              Build complex audience criteria with nested logic groups
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addGroup}>
            <Plus className="h-4 w-4 mr-2" />
            Add Group
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {groups.map((group, groupIndex) => (
          <div key={group.id} className="space-y-3">
            {groupIndex > 0 && (
              <div className="flex items-center gap-2">
                <Separator className="flex-1" />
                <Select
                  value={groups[groupIndex - 1] ? "AND" : "AND"}
                  onValueChange={(value) => {
                    // This would control logic between groups
                    // For now, we'll use AND between groups
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">AND</SelectItem>
                    <SelectItem value="OR">OR</SelectItem>
                  </SelectContent>
                </Select>
                <Separator className="flex-1" />
              </div>
            )}

            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Group {groupIndex + 1}</Label>
                  <Select
                    value={group.logic}
                    onValueChange={(value: "AND" | "OR") =>
                      updateGroupLogic(group.id, value)
                    }
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">AND</SelectItem>
                      <SelectItem value="OR">OR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => duplicateGroup(group.id)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  {groups.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGroup(group.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {group.conditions.map((condition, conditionIndex) => {
                  const dimension = DIMENSION_OPTIONS.find(
                    (d) => d.value === condition.dimension
                  )
                  const operators =
                    OPERATOR_OPTIONS[
                      (dimension?.type || "select") as keyof typeof OPERATOR_OPTIONS
                    ] || OPERATOR_OPTIONS.select

                  return (
                    <div
                      key={condition.id}
                      className="flex items-center gap-2 p-2 border rounded bg-muted/30"
                    >
                      {conditionIndex > 0 && (
                        <span className="text-xs text-muted-foreground w-8 text-center">
                          {group.logic}
                        </span>
                      )}
                      <Select
                        value={condition.dimension}
                        onValueChange={(value) =>
                          updateCondition(group.id, condition.id, "dimension", value)
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DIMENSION_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={condition.operator}
                        onValueChange={(value) =>
                          updateCondition(group.id, condition.id, "operator", value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {operators.map((op) => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        className="flex-1"
                        placeholder="Value"
                        value={
                          Array.isArray(condition.value)
                            ? `${condition.value[0]}-${condition.value[1]}`
                            : String(condition.value || "")
                        }
                        onChange={(e) => {
                          const value = e.target.value
                          if (condition.operator === "between" && value.includes("-")) {
                            const [min, max] = value.split("-").map(Number)
                            updateCondition(group.id, condition.id, "value", [min, max])
                          } else {
                            updateCondition(group.id, condition.id, "value", value)
                          }
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCondition(group.id, condition.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => addCondition(group.id)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Condition
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
