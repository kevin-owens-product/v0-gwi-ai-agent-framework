/**
 * @prompt-id forge-v4.1:feature:admin-activity:005
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState } from "react"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar, Filter, X } from "lucide-react"

interface Admin {
  id: string
  name: string
  email: string
  role: string
}

interface ActivityFiltersProps {
  admins: Admin[]
  onFilterChange: (filters: FilterState) => void
}

export interface FilterState {
  adminId: string
  action: string
  resourceType: string
  startDate: string
  endDate: string
}

const actionOptions = [
  { value: "all", label: "All Actions" },
  { value: "user.create", label: "User Create" },
  { value: "user.update", label: "User Update" },
  { value: "user.delete", label: "User Delete" },
  { value: "user.ban", label: "User Ban" },
  { value: "user.unban", label: "User Unban" },
  { value: "tenant.create", label: "Tenant Create" },
  { value: "tenant.update", label: "Tenant Update" },
  { value: "tenant.suspend", label: "Tenant Suspend" },
  { value: "tenant.unsuspend", label: "Tenant Unsuspend" },
  { value: "security.policy.create", label: "Security Policy Create" },
  { value: "security.policy.update", label: "Security Policy Update" },
  { value: "security.ip.block", label: "IP Block" },
  { value: "security.ip.unblock", label: "IP Unblock" },
  { value: "admin.create", label: "Admin Create" },
  { value: "admin.update", label: "Admin Update" },
  { value: "admin.delete", label: "Admin Delete" },
  { value: "admin.login", label: "Admin Login" },
  { value: "feature_flag.create", label: "Feature Flag Create" },
  { value: "feature_flag.update", label: "Feature Flag Update" },
  { value: "config.update", label: "Config Update" },
]

const resourceTypeOptions = [
  { value: "all", label: "All Resources" },
  { value: "user", label: "User" },
  { value: "tenant", label: "Tenant" },
  { value: "admin", label: "Admin" },
  { value: "security_policy", label: "Security Policy" },
  { value: "ip_blocklist", label: "IP Blocklist" },
  { value: "session", label: "Session" },
  { value: "config", label: "Config" },
  { value: "feature_flag", label: "Feature Flag" },
  { value: "compliance_audit", label: "Compliance Audit" },
  { value: "data_export", label: "Data Export" },
  { value: "maintenance", label: "Maintenance" },
  { value: "incident", label: "Incident" },
  { value: "release", label: "Release" },
]

const datePresets = [
  { value: "today", label: "Today", days: 0 },
  { value: "yesterday", label: "Yesterday", days: 1 },
  { value: "7days", label: "Last 7 days", days: 7 },
  { value: "30days", label: "Last 30 days", days: 30 },
  { value: "90days", label: "Last 90 days", days: 90 },
]

export function ActivityFilters({ admins, onFilterChange }: ActivityFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    adminId: "all",
    action: "all",
    resourceType: "all",
    startDate: "",
    endDate: "",
  })

  const [isOpen, setIsOpen] = useState(false)

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleDatePreset = (days: number) => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const newFilters = {
      ...filters,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      adminId: "all",
      action: "all",
      resourceType: "all",
      startDate: "",
      endDate: "",
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters =
    filters.adminId !== "all" ||
    filters.action !== "all" ||
    filters.resourceType !== "all" ||
    filters.startDate ||
    filters.endDate

  const activeFilterCount = [
    filters.adminId !== "all",
    filters.action !== "all",
    filters.resourceType !== "all",
    filters.startDate || filters.endDate,
  ].filter(Boolean).length

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Quick filters */}
      <div className="flex-1 flex flex-wrap gap-2">
        <Select
          value={filters.adminId}
          onValueChange={(value) => handleFilterChange("adminId", value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Admins" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Admins</SelectItem>
            {admins.map((admin) => (
              <SelectItem key={admin.id} value={admin.id}>
                {admin.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.action}
          onValueChange={(value) => handleFilterChange("action", value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Actions" />
          </SelectTrigger>
          <SelectContent>
            {actionOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.resourceType}
          onValueChange={(value) => handleFilterChange("resourceType", value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Resources" />
          </SelectTrigger>
          <SelectContent>
            {resourceTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Advanced filters */}
      <div className="flex gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              Date Range
              {(filters.startDate || filters.endDate) && (
                <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  1
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Quick Select
                </Label>
                <div className="flex flex-wrap gap-2">
                  {datePresets.map((preset) => (
                    <Button
                      key={preset.value}
                      variant="outline"
                      size="sm"
                      onClick={() => handleDatePreset(preset.days)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Custom Range
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Start Date</Label>
                    <Input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) =>
                        handleFilterChange("startDate", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">End Date</Label>
                    <Input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) =>
                        handleFilterChange("endDate", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                {activeFilterCount}
              </span>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
