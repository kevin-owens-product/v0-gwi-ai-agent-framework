"use client"

import { useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import {
  Filter,
  Plus,
  Trash2,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  Save,
  Check,
  Calendar,
  Hash,
  Type,
  ToggleLeft,
  Layers,
  Star,
  ArrowUpDown,
} from "lucide-react"

// Types
export type FilterOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "starts_with"
  | "ends_with"
  | "greater_than"
  | "less_than"
  | "greater_or_equal"
  | "less_or_equal"
  | "between"
  | "not_between"
  | "in"
  | "not_in"
  | "is_null"
  | "is_not_null"
  | "top_n"
  | "bottom_n"
  | "above_average"
  | "below_average"

export type FilterType = "text" | "number" | "date" | "boolean" | "select" | "multi-select"

export interface FilterField {
  id: string
  name: string
  label: string
  type: FilterType
  options?: { value: string; label: string }[]
  min?: number
  max?: number
  category?: string
}

export interface FilterCondition {
  id: string
  fieldId: string
  operator: FilterOperator
  value: any
  value2?: any // For between operators
  enabled: boolean
}

export interface FilterGroup {
  id: string
  name: string
  conditions: FilterCondition[]
  logic: "and" | "or"
  enabled: boolean
}

export interface SavedFilter {
  id: string
  name: string
  description?: string
  groups: FilterGroup[]
  createdAt: Date
  updatedAt: Date
  isDefault?: boolean
  isFavorite?: boolean
}

interface AdvancedFiltersProps {
  fields: FilterField[]
  activeFilters: FilterGroup[]
  savedFilters?: SavedFilter[]
  onFiltersChange: (filters: FilterGroup[]) => void
  onFilterSave?: (filter: SavedFilter) => void
  onFilterDelete?: (id: string) => void
  onFilterApply?: (filters: FilterGroup[]) => void
  className?: string
}

const OPERATORS_BY_TYPE: Record<FilterType, { value: FilterOperator; label: string }[]> = {
  text: [
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Does not equal" },
    { value: "contains", label: "Contains" },
    { value: "not_contains", label: "Does not contain" },
    { value: "starts_with", label: "Starts with" },
    { value: "ends_with", label: "Ends with" },
    { value: "is_null", label: "Is empty" },
    { value: "is_not_null", label: "Is not empty" },
  ],
  number: [
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Does not equal" },
    { value: "greater_than", label: "Greater than" },
    { value: "less_than", label: "Less than" },
    { value: "greater_or_equal", label: "Greater or equal" },
    { value: "less_or_equal", label: "Less or equal" },
    { value: "between", label: "Between" },
    { value: "not_between", label: "Not between" },
    { value: "top_n", label: "Top N" },
    { value: "bottom_n", label: "Bottom N" },
    { value: "above_average", label: "Above average" },
    { value: "below_average", label: "Below average" },
    { value: "is_null", label: "Is empty" },
    { value: "is_not_null", label: "Is not empty" },
  ],
  date: [
    { value: "equals", label: "On" },
    { value: "not_equals", label: "Not on" },
    { value: "greater_than", label: "After" },
    { value: "less_than", label: "Before" },
    { value: "between", label: "Between" },
    { value: "is_null", label: "Is empty" },
    { value: "is_not_null", label: "Is not empty" },
  ],
  boolean: [
    { value: "equals", label: "Is" },
  ],
  select: [
    { value: "equals", label: "Is" },
    { value: "not_equals", label: "Is not" },
    { value: "in", label: "Is any of" },
    { value: "not_in", label: "Is none of" },
    { value: "is_null", label: "Is empty" },
    { value: "is_not_null", label: "Is not empty" },
  ],
  "multi-select": [
    { value: "in", label: "Includes any of" },
    { value: "not_in", label: "Excludes all of" },
    { value: "is_null", label: "Is empty" },
    { value: "is_not_null", label: "Is not empty" },
  ],
}

const FIELD_TYPE_ICONS: Record<FilterType, React.ReactNode> = {
  text: <Type className="h-3 w-3" />,
  number: <Hash className="h-3 w-3" />,
  date: <Calendar className="h-3 w-3" />,
  boolean: <ToggleLeft className="h-3 w-3" />,
  select: <ArrowUpDown className="h-3 w-3" />,
  "multi-select": <Layers className="h-3 w-3" />,
}

export function AdvancedFilters({
  fields,
  activeFilters,
  savedFilters = [],
  onFiltersChange,
  onFilterSave,
  onFilterApply,
  className,
}: AdvancedFiltersProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveFilterName, setSaveFilterName] = useState("")
  const [saveFilterDescription, setSaveFilterDescription] = useState("")
  const [showQuickFilter, setShowQuickFilter] = useState(false)
  const [quickFilterField, setQuickFilterField] = useState<FilterField | null>(null)

  // Group fields by category
  const groupedFields = useMemo(() => {
    const groups: Record<string, FilterField[]> = {}
    for (const field of fields) {
      const category = field.category || "General"
      if (!groups[category]) groups[category] = []
      groups[category].push(field)
    }
    return groups
  }, [fields])

  // Filter fields by search
  const filteredFields = useMemo(() => {
    if (!searchQuery) return groupedFields
    const query = searchQuery.toLowerCase()
    const filtered: Record<string, FilterField[]> = {}
    for (const [category, categoryFields] of Object.entries(groupedFields)) {
      const matches = categoryFields.filter(f =>
        f.name.toLowerCase().includes(query) ||
        f.label.toLowerCase().includes(query)
      )
      if (matches.length > 0) filtered[category] = matches
    }
    return filtered
  }, [groupedFields, searchQuery])

  // Count active conditions
  const activeConditionCount = useMemo(() => {
    return activeFilters.reduce((count, group) =>
      count + group.conditions.filter(c => c.enabled).length, 0)
  }, [activeFilters])

  // Add filter group
  const addFilterGroup = useCallback(() => {
    const newGroup: FilterGroup = {
      id: crypto.randomUUID(),
      name: `Filter Group ${activeFilters.length + 1}`,
      conditions: [],
      logic: "and",
      enabled: true,
    }
    onFiltersChange([...activeFilters, newGroup])
    setExpandedGroups(prev => new Set([...prev, newGroup.id]))
  }, [activeFilters, onFiltersChange])

  // Remove filter group
  const removeFilterGroup = useCallback((groupId: string) => {
    onFiltersChange(activeFilters.filter(g => g.id !== groupId))
  }, [activeFilters, onFiltersChange])

  // Update filter group
  const updateFilterGroup = useCallback((groupId: string, updates: Partial<FilterGroup>) => {
    onFiltersChange(activeFilters.map(g =>
      g.id === groupId ? { ...g, ...updates } : g
    ))
  }, [activeFilters, onFiltersChange])

  // Add condition to group
  const addCondition = useCallback((groupId: string, field: FilterField) => {
    const defaultOperator = OPERATORS_BY_TYPE[field.type][0].value
    const newCondition: FilterCondition = {
      id: crypto.randomUUID(),
      fieldId: field.id,
      operator: defaultOperator,
      value: field.type === "boolean" ? true : "",
      enabled: true,
    }

    onFiltersChange(activeFilters.map(g =>
      g.id === groupId
        ? { ...g, conditions: [...g.conditions, newCondition] }
        : g
    ))
  }, [activeFilters, onFiltersChange])

  // Remove condition
  const removeCondition = useCallback((groupId: string, conditionId: string) => {
    onFiltersChange(activeFilters.map(g =>
      g.id === groupId
        ? { ...g, conditions: g.conditions.filter(c => c.id !== conditionId) }
        : g
    ))
  }, [activeFilters, onFiltersChange])

  // Update condition
  const updateCondition = useCallback((
    groupId: string,
    conditionId: string,
    updates: Partial<FilterCondition>
  ) => {
    onFiltersChange(activeFilters.map(g =>
      g.id === groupId
        ? {
            ...g,
            conditions: g.conditions.map(c =>
              c.id === conditionId ? { ...c, ...updates } : c
            ),
          }
        : g
    ))
  }, [activeFilters, onFiltersChange])

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    onFiltersChange([])
  }, [onFiltersChange])

  // Apply saved filter
  const applySavedFilter = useCallback((saved: SavedFilter) => {
    onFiltersChange(saved.groups)
  }, [onFiltersChange])

  // Save current filters
  const saveCurrentFilters = useCallback(() => {
    if (!saveFilterName.trim()) return

    const savedFilter: SavedFilter = {
      id: crypto.randomUUID(),
      name: saveFilterName,
      description: saveFilterDescription,
      groups: activeFilters,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    onFilterSave?.(savedFilter)
    setShowSaveDialog(false)
    setSaveFilterName("")
    setSaveFilterDescription("")
  }, [activeFilters, saveFilterName, saveFilterDescription, onFilterSave])

  // Quick filter
  const handleQuickFilter = useCallback((field: FilterField) => {
    setQuickFilterField(field)
    setShowQuickFilter(true)
  }, [])

  // Apply quick filter
  const applyQuickFilter = useCallback((value: any, operator: FilterOperator = "equals") => {
    if (!quickFilterField) return

    // Find or create a group for quick filters
    let quickGroup = activeFilters.find(g => g.name === "Quick Filters")
    if (!quickGroup) {
      quickGroup = {
        id: crypto.randomUUID(),
        name: "Quick Filters",
        conditions: [],
        logic: "and",
        enabled: true,
      }
    }

    const newCondition: FilterCondition = {
      id: crypto.randomUUID(),
      fieldId: quickFilterField.id,
      operator,
      value,
      enabled: true,
    }

    const updatedGroups = activeFilters.some(g => g.name === "Quick Filters")
      ? activeFilters.map(g =>
          g.name === "Quick Filters"
            ? { ...g, conditions: [...g.conditions, newCondition] }
            : g
        )
      : [...activeFilters, { ...quickGroup, conditions: [newCondition] }]

    onFiltersChange(updatedGroups)
    setShowQuickFilter(false)
    setQuickFilterField(null)
  }, [quickFilterField, activeFilters, onFiltersChange])

  // Render value input based on field type and operator
  const renderValueInput = (
    condition: FilterCondition,
    field: FilterField,
    groupId: string
  ) => {
    if (condition.operator === "is_null" || condition.operator === "is_not_null") {
      return null
    }

    if (condition.operator === "above_average" || condition.operator === "below_average") {
      return null
    }

    switch (field.type) {
      case "number":
        if (condition.operator === "between" || condition.operator === "not_between") {
          return (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={condition.value ?? ""}
                onChange={(e) => updateCondition(groupId, condition.id, {
                  value: parseFloat(e.target.value) || ""
                })}
                placeholder="Min"
                className="h-8 w-24"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="number"
                value={condition.value2 ?? ""}
                onChange={(e) => updateCondition(groupId, condition.id, {
                  value2: parseFloat(e.target.value) || ""
                })}
                placeholder="Max"
                className="h-8 w-24"
              />
            </div>
          )
        }
        if (condition.operator === "top_n" || condition.operator === "bottom_n") {
          return (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                value={condition.value ?? 10}
                onChange={(e) => updateCondition(groupId, condition.id, {
                  value: parseInt(e.target.value) || 10
                })}
                className="h-8 w-20"
              />
              <span className="text-xs text-muted-foreground">items</span>
            </div>
          )
        }
        return (
          <Input
            type="number"
            value={condition.value ?? ""}
            onChange={(e) => updateCondition(groupId, condition.id, {
              value: parseFloat(e.target.value) || ""
            })}
            placeholder="Value"
            className="h-8 w-32"
          />
        )

      case "date":
        if (condition.operator === "between") {
          return (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={condition.value ?? ""}
                onChange={(e) => updateCondition(groupId, condition.id, {
                  value: e.target.value
                })}
                className="h-8"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="date"
                value={condition.value2 ?? ""}
                onChange={(e) => updateCondition(groupId, condition.id, {
                  value2: e.target.value
                })}
                className="h-8"
              />
            </div>
          )
        }
        return (
          <Input
            type="date"
            value={condition.value ?? ""}
            onChange={(e) => updateCondition(groupId, condition.id, {
              value: e.target.value
            })}
            className="h-8"
          />
        )

      case "boolean":
        return (
          <Select
            value={condition.value?.toString() ?? "true"}
            onValueChange={(v) => updateCondition(groupId, condition.id, {
              value: v === "true"
            })}
          >
            <SelectTrigger className="h-8 w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        )

      case "select":
        return (
          <Select
            value={condition.value ?? ""}
            onValueChange={(v) => updateCondition(groupId, condition.id, { value: v })}
          >
            <SelectTrigger className="h-8 w-40">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "multi-select":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 justify-start">
                {Array.isArray(condition.value) && condition.value.length > 0
                  ? `${condition.value.length} selected`
                  : "Select..."}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2">
              <ScrollArea className="h-48">
                <div className="space-y-1">
                  {field.options?.map(opt => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
                    >
                      <Checkbox
                        checked={Array.isArray(condition.value) && condition.value.includes(opt.value)}
                        onCheckedChange={(checked) => {
                          const currentValues = Array.isArray(condition.value) ? condition.value : []
                          const newValues = checked
                            ? [...currentValues, opt.value]
                            : currentValues.filter(v => v !== opt.value)
                          updateCondition(groupId, condition.id, { value: newValues })
                        }}
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        )

      default:
        return (
          <Input
            value={condition.value ?? ""}
            onChange={(e) => updateCondition(groupId, condition.id, {
              value: e.target.value
            })}
            placeholder="Value"
            className="h-8 w-40"
          />
        )
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h3 className="font-semibold">Advanced Filters</h3>
          {activeConditionCount > 0 && (
            <Badge variant="secondary">{activeConditionCount} active</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeConditionCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
          {savedFilters.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Star className="h-4 w-4 mr-2" />
                  Saved
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Saved Filters</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {savedFilters.map(saved => (
                  <DropdownMenuItem
                    key={saved.id}
                    className="flex items-center justify-between"
                    onClick={() => applySavedFilter(saved)}
                  >
                    <div>
                      <div className="font-medium text-sm">{saved.name}</div>
                      {saved.description && (
                        <div className="text-xs text-muted-foreground">{saved.description}</div>
                      )}
                    </div>
                    {saved.isDefault && (
                      <Badge variant="secondary" className="text-xs">Default</Badge>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {activeConditionCount > 0 && onFilterSave && (
            <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          )}
          <Button size="sm" onClick={addFilterGroup}>
            <Plus className="h-4 w-4 mr-2" />
            Add Group
          </Button>
        </div>
      </div>

      {/* Quick Filter Bar */}
      <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/30">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search fields to filter..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 border-0 bg-transparent focus-visible:ring-0"
        />
        <Separator orientation="vertical" className="h-6" />
        <div className="flex gap-1">
          {fields.slice(0, 5).map(field => (
            <Button
              key={field.id}
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => handleQuickFilter(field)}
            >
              {FIELD_TYPE_ICONS[field.type]}
              <span className="ml-1">{field.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Filter Groups */}
      {activeFilters.length > 0 ? (
        <div className="space-y-3">
          {activeFilters.map((group, groupIndex) => (
            <Card key={group.id}>
              <Collapsible
                open={expandedGroups.has(group.id)}
                onOpenChange={(open) => {
                  setExpandedGroups(prev => {
                    const newSet = new Set(prev)
                    if (open) newSet.add(group.id)
                    else newSet.delete(group.id)
                    return newSet
                  })
                }}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="py-2 px-4 cursor-pointer hover:bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {expandedGroups.has(group.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <Input
                          value={group.name}
                          onChange={(e) => {
                            e.stopPropagation()
                            updateFilterGroup(group.id, { name: e.target.value })
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="h-7 w-40 text-sm font-medium"
                        />
                        <Badge variant={group.enabled ? "default" : "secondary"} className="text-xs">
                          {group.conditions.filter(c => c.enabled).length} conditions
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={group.logic}
                          onValueChange={(v) => updateFilterGroup(group.id, { logic: v as "and" | "or" })}
                        >
                          <SelectTrigger className="h-7 w-20" onClick={(e) => e.stopPropagation()}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="and">AND</SelectItem>
                            <SelectItem value="or">OR</SelectItem>
                          </SelectContent>
                        </Select>
                        <Checkbox
                          checked={group.enabled}
                          onCheckedChange={(v) => updateFilterGroup(group.id, { enabled: !!v })}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFilterGroup(group.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0 px-4 pb-4">
                    {/* Conditions */}
                    <div className="space-y-2">
                      {group.conditions.map((condition, _condIndex) => {
                        const field = fields.find(f => f.id === condition.fieldId)
                        if (!field) return null

                        return (
                          <div
                            key={condition.id}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-lg border",
                              !condition.enabled && "opacity-50"
                            )}
                          >
                            <Checkbox
                              checked={condition.enabled}
                              onCheckedChange={(v) =>
                                updateCondition(group.id, condition.id, { enabled: !!v })
                              }
                            />

                            {/* Field selector */}
                            <Select
                              value={condition.fieldId}
                              onValueChange={(v) => {
                                const newField = fields.find(f => f.id === v)
                                if (newField) {
                                  updateCondition(group.id, condition.id, {
                                    fieldId: v,
                                    operator: OPERATORS_BY_TYPE[newField.type][0].value,
                                    value: newField.type === "boolean" ? true : "",
                                    value2: undefined,
                                  })
                                }
                              }}
                            >
                              <SelectTrigger className="h-8 w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(filteredFields).map(([category, categoryFields]) => (
                                  <div key={category}>
                                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                                      {category}
                                    </div>
                                    {categoryFields.map(f => (
                                      <SelectItem key={f.id} value={f.id}>
                                        <div className="flex items-center gap-2">
                                          {FIELD_TYPE_ICONS[f.type]}
                                          {f.label}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </div>
                                ))}
                              </SelectContent>
                            </Select>

                            {/* Operator selector */}
                            <Select
                              value={condition.operator}
                              onValueChange={(v) =>
                                updateCondition(group.id, condition.id, {
                                  operator: v as FilterOperator,
                                  value2: undefined,
                                })
                              }
                            >
                              <SelectTrigger className="h-8 w-36">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {OPERATORS_BY_TYPE[field.type].map(op => (
                                  <SelectItem key={op.value} value={op.value}>
                                    {op.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {/* Value input */}
                            {renderValueInput(condition, field, group.id)}

                            {/* Remove button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 ml-auto"
                              onClick={() => removeCondition(group.id, condition.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )
                      })}

                      {/* Add condition */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full border-dashed">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Condition
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64">
                          <div className="p-2">
                            <Input
                              placeholder="Search fields..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="h-8"
                            />
                          </div>
                          <ScrollArea className="h-64">
                            {Object.entries(filteredFields).map(([category, categoryFields]) => (
                              <div key={category}>
                                <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground sticky top-0 bg-popover">
                                  {category}
                                </div>
                                {categoryFields.map(field => (
                                  <DropdownMenuItem
                                    key={field.id}
                                    onClick={() => addCondition(group.id, field)}
                                  >
                                    <div className="flex items-center gap-2">
                                      {FIELD_TYPE_ICONS[field.type]}
                                      {field.label}
                                    </div>
                                  </DropdownMenuItem>
                                ))}
                              </div>
                            ))}
                          </ScrollArea>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Group connector */}
                    {groupIndex < activeFilters.length - 1 && (
                      <div className="flex justify-center -mb-4 relative z-10">
                        <Badge variant="secondary" className="bg-background">
                          {group.logic.toUpperCase()}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="font-medium mb-2">No filters applied</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Add filter groups to narrow down your data
          </p>
          <Button onClick={addFilterGroup}>
            <Plus className="h-4 w-4 mr-2" />
            Add Filter Group
          </Button>
        </Card>
      )}

      {/* Apply Button */}
      {activeConditionCount > 0 && (
        <div className="flex justify-end">
          <Button onClick={() => onFilterApply?.(activeFilters)}>
            <Check className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
        </div>
      )}

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Filter Name</Label>
              <Input
                value={saveFilterName}
                onChange={(e) => setSaveFilterName(e.target.value)}
                placeholder="e.g., High-Value Customers"
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                value={saveFilterDescription}
                onChange={(e) => setSaveFilterDescription(e.target.value)}
                placeholder="Describe what this filter does..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
            <Button onClick={saveCurrentFilters} disabled={!saveFilterName.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Save Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Filter Popover */}
      <Dialog open={showQuickFilter} onOpenChange={setShowQuickFilter}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Quick Filter: {quickFilterField?.label}</DialogTitle>
          </DialogHeader>
          {quickFilterField && (
            <div className="space-y-4 py-4">
              {quickFilterField.type === "number" && quickFilterField.min !== undefined && quickFilterField.max !== undefined ? (
                <div className="space-y-4">
                  <Label>Value Range</Label>
                  <Slider
                    defaultValue={[quickFilterField.min, quickFilterField.max]}
                    min={quickFilterField.min}
                    max={quickFilterField.max}
                    step={1}
                    onValueCommit={(value) => {
                      applyQuickFilter(value[0], "greater_or_equal")
                      applyQuickFilter(value[1], "less_or_equal")
                    }}
                  />
                </div>
              ) : quickFilterField.type === "select" || quickFilterField.type === "multi-select" ? (
                <div className="space-y-2">
                  {quickFilterField.options?.map(opt => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
                    >
                      <Checkbox
                        onCheckedChange={(checked) => {
                          if (checked) applyQuickFilter(opt.value)
                        }}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    type={quickFilterField.type === "number" ? "number" : quickFilterField.type === "date" ? "date" : "text"}
                    placeholder="Enter value..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        applyQuickFilter((e.target as HTMLInputElement).value)
                      }
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
