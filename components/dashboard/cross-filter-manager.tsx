"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Filter, X, Link2, LinkOff } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FilterConfig {
  field: string
  operator: "equals" | "contains" | "greater_than" | "less_than" | "between"
  value: string | number | [number, number]
}

export interface WidgetFilter {
  widgetId: string
  filters: FilterConfig[]
  enabled: boolean
}

interface CrossFilterManagerProps {
  widgets: Array<{ id: string; title: string; type: string }>
  activeFilters: Record<string, WidgetFilter>
  onFiltersChange: (filters: Record<string, WidgetFilter>) => void
  className?: string
}

export function CrossFilterManager({
  widgets,
  activeFilters,
  onFiltersChange,
  className,
}: CrossFilterManagerProps) {
  const [selectedWidget, setSelectedWidget] = useState<string>("")
  const [filterField, setFilterField] = useState<string>("")
  const [filterOperator, setFilterOperator] = useState<FilterConfig["operator"]>("equals")
  const [filterValue, setFilterValue] = useState<string>("")

  const handleAddFilter = () => {
    if (!selectedWidget || !filterField) return

    const newFilter: FilterConfig = {
      field: filterField,
      operator: filterOperator,
      value: filterValue,
    }

    const currentWidgetFilter = activeFilters[selectedWidget] || {
      widgetId: selectedWidget,
      filters: [],
      enabled: true,
    }

    const updatedFilters = {
      ...activeFilters,
      [selectedWidget]: {
        ...currentWidgetFilter,
        filters: [...currentWidgetFilter.filters, newFilter],
      },
    }

    onFiltersChange(updatedFilters)
    setFilterField("")
    setFilterValue("")
  }

  const handleRemoveFilter = (widgetId: string, filterIndex: number) => {
    const widgetFilter = activeFilters[widgetId]
    if (!widgetFilter) return

    const updatedFilters = {
      ...activeFilters,
      [widgetId]: {
        ...widgetFilter,
        filters: widgetFilter.filters.filter((_, i) => i !== filterIndex),
      },
    }

    if (updatedFilters[widgetId].filters.length === 0) {
      delete updatedFilters[widgetId]
    }

    onFiltersChange(updatedFilters)
  }

  const handleToggleFilter = (widgetId: string) => {
    const widgetFilter = activeFilters[widgetId]
    if (!widgetFilter) return

    const updatedFilters = {
      ...activeFilters,
      [widgetId]: {
        ...widgetFilter,
        enabled: !widgetFilter.enabled,
      },
    }

    onFiltersChange(updatedFilters)
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Cross-Widget Filtering
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Filter */}
        <div className="space-y-3 p-3 border rounded-lg bg-muted/50">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Widget</Label>
              <Select value={selectedWidget} onValueChange={setSelectedWidget}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select widget" />
                </SelectTrigger>
                <SelectContent>
                  {widgets.map((widget) => (
                    <SelectItem key={widget.id} value={widget.id}>
                      {widget.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Field</Label>
              <Input
                className="h-8"
                placeholder="Field name"
                value={filterField}
                onChange={(e) => setFilterField(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Operator</Label>
              <Select value={filterOperator} onValueChange={(v) => setFilterOperator(v as FilterConfig["operator"])}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="greater_than">Greater Than</SelectItem>
                  <SelectItem value="less_than">Less Than</SelectItem>
                  <SelectItem value="between">Between</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Value</Label>
              <Input
                className="h-8"
                placeholder="Filter value"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleAddFilter} size="sm" className="w-full" disabled={!selectedWidget || !filterField}>
            Add Filter
          </Button>
        </div>

        {/* Active Filters */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Active Filters</Label>
          {Object.keys(activeFilters).length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No filters configured. Add filters to enable cross-widget filtering.
            </p>
          ) : (
            <div className="space-y-2">
              {Object.entries(activeFilters).map(([widgetId, widgetFilter]) => {
                const widget = widgets.find((w) => w.id === widgetId)
                return (
                  <div key={widgetId} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {widgetFilter.enabled ? (
                          <Link2 className="h-3 w-3 text-primary" />
                        ) : (
                          <LinkOff className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className="text-sm font-medium">{widget?.title || widgetId}</span>
                        <Badge variant="outline" className="text-xs">
                          {widgetFilter.filters.length} filter{widgetFilter.filters.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs">Enabled</Label>
                        <Switch
                          checked={widgetFilter.enabled}
                          onCheckedChange={() => handleToggleFilter(widgetId)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1 pl-5">
                      {widgetFilter.filters.map((filter, index) => (
                        <div key={index} className="flex items-center justify-between text-xs bg-background p-2 rounded">
                          <span className="text-muted-foreground">
                            {filter.field} {filter.operator} {String(filter.value)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => handleRemoveFilter(widgetId, index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
