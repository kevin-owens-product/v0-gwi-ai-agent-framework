"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, SlidersHorizontal, LayoutGrid, List } from "lucide-react"

const reportTypes = ["Presentation", "Dashboard", "PDF Report", "Data Export", "Infographic"]

const statuses = ["Published", "Draft", "Archived"]

interface ReportsFiltersProps {
  searchQuery?: string
  onSearchChange?: (query: string) => void
  selectedTypes?: string[]
  onTypesChange?: (types: string[]) => void
  selectedStatuses?: string[]
  onStatusesChange?: (statuses: string[]) => void
}

export function ReportsFilters({
  searchQuery = "",
  onSearchChange,
  selectedTypes: controlledTypes,
  onTypesChange,
  selectedStatuses: controlledStatuses,
  onStatusesChange,
}: ReportsFiltersProps) {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [internalTypes, setInternalTypes] = useState<string[]>([])
  const [internalStatuses, setInternalStatuses] = useState<string[]>([])

  // Use controlled state if provided, otherwise use internal state
  const selectedTypes = controlledTypes ?? internalTypes
  const selectedStatuses = controlledStatuses ?? internalStatuses

  const toggleType = (type: string) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type]
    if (onTypesChange) {
      onTypesChange(newTypes)
    } else {
      setInternalTypes(newTypes)
    }
  }

  const toggleStatus = (status: string) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status]
    if (onStatusesChange) {
      onStatusesChange(newStatuses)
    } else {
      setInternalStatuses(newStatuses)
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Type
              {selectedTypes.length > 0 && (
                <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                  {selectedTypes.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {reportTypes.map((type) => (
              <DropdownMenuCheckboxItem
                key={type}
                checked={selectedTypes.includes(type)}
                onCheckedChange={() => toggleType(type)}
              >
                {type}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Status
              {selectedStatuses.length > 0 && (
                <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                  {selectedStatuses.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {statuses.map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={selectedStatuses.includes(status)}
                onCheckedChange={() => toggleStatus(status)}
              >
                {status}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-1 rounded-lg border p-1">
        <Button variant={view === "grid" ? "secondary" : "ghost"} size="sm" onClick={() => setView("grid")}>
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button variant={view === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setView("list")}>
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
