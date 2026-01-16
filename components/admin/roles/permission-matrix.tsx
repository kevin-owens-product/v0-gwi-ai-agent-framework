"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Search, CheckSquare, Square, Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Permission {
  key: string
  displayName: string
  description?: string
  category: string
  scope: string
  sortOrder?: number
}

interface PermissionMatrixProps {
  scope: "PLATFORM" | "TENANT"
  selectedPermissions: string[]
  onPermissionsChange: (permissions: string[]) => void
  inheritedPermissions?: string[]
  disabled?: boolean
}

export function PermissionMatrix({
  scope,
  selectedPermissions,
  onPermissionsChange,
  inheritedPermissions = [],
  disabled = false,
}: PermissionMatrixProps) {
  const [permissions, setPermissions] = useState<Record<string, Permission[]>>({})
  const [categories, setCategories] = useState<Record<string, string>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  useEffect(() => {
    async function fetchPermissions() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/admin/permissions?scope=${scope}&grouped=true`)
        const data = await response.json()
        setPermissions(data.permissions || {})
        setCategories(data.categories || {})
        // Expand all categories by default
        setExpandedCategories(Object.keys(data.permissions || {}))
      } catch (error) {
        console.error("Failed to fetch permissions:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPermissions()
  }, [scope])

  const handleTogglePermission = (permissionKey: string) => {
    if (disabled) return
    if (inheritedPermissions.includes(permissionKey)) return

    const newPermissions = selectedPermissions.includes(permissionKey)
      ? selectedPermissions.filter(p => p !== permissionKey)
      : [...selectedPermissions, permissionKey]
    onPermissionsChange(newPermissions)
  }

  const handleSelectAllCategory = (category: string) => {
    if (disabled) return
    const categoryPermissions = permissions[category] || []
    const categoryKeys = categoryPermissions.map(p => p.key)
    const allSelected = categoryKeys.every(
      key => selectedPermissions.includes(key) || inheritedPermissions.includes(key)
    )

    if (allSelected) {
      // Deselect all non-inherited
      const newPermissions = selectedPermissions.filter(
        p => !categoryKeys.includes(p) || inheritedPermissions.includes(p)
      )
      onPermissionsChange(newPermissions)
    } else {
      // Select all non-inherited
      const newPermissions = [...selectedPermissions]
      categoryKeys.forEach(key => {
        if (!newPermissions.includes(key) && !inheritedPermissions.includes(key)) {
          newPermissions.push(key)
        }
      })
      onPermissionsChange(newPermissions)
    }
  }

  const handleSelectAll = () => {
    if (disabled) return
    const allKeys = Object.values(permissions)
      .flat()
      .map(p => p.key)
      .filter(key => !inheritedPermissions.includes(key))
    const allSelected = allKeys.every(key => selectedPermissions.includes(key))

    if (allSelected) {
      onPermissionsChange([])
    } else {
      onPermissionsChange(allKeys)
    }
  }

  const filteredPermissions = Object.entries(permissions).reduce(
    (acc, [category, perms]) => {
      if (!searchQuery) {
        acc[category] = perms
        return acc
      }
      const filtered = perms.filter(
        p =>
          p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      if (filtered.length > 0) {
        acc[category] = filtered
      }
      return acc
    },
    {} as Record<string, Permission[]>
  )

  const totalPermissions = Object.values(permissions).flat().length
  const selectedCount = selectedPermissions.length
  const inheritedCount = inheritedPermissions.length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search permissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{selectedCount} selected</Badge>
            {inheritedCount > 0 && (
              <Badge variant="secondary">{inheritedCount} inherited</Badge>
            )}
            <span>of {totalPermissions} total</span>
          </div>
        </div>
        {!disabled && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
          >
            {Object.values(permissions)
              .flat()
              .filter(p => !inheritedPermissions.includes(p.key))
              .every(p => selectedPermissions.includes(p.key)) ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Deselect All
              </>
            ) : (
              <>
                <CheckSquare className="h-4 w-4 mr-2" />
                Select All
              </>
            )}
          </Button>
        )}
      </div>

      {/* Permission Categories */}
      <Accordion
        type="multiple"
        value={expandedCategories}
        onValueChange={setExpandedCategories}
        className="space-y-2"
      >
        {Object.entries(filteredPermissions).map(([category, perms]) => {
          const categoryKeys = perms.map(p => p.key)
          const selectedInCategory = categoryKeys.filter(
            key => selectedPermissions.includes(key) || inheritedPermissions.includes(key)
          ).length
          const allSelected = selectedInCategory === categoryKeys.length

          return (
            <AccordionItem
              key={category}
              value={category}
              className="border rounded-lg px-4"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{category}</span>
                    <Badge variant="outline" className="text-xs">
                      {selectedInCategory}/{categoryKeys.length}
                    </Badge>
                  </div>
                  {!disabled && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectAllCategory(category)
                      }}
                    >
                      {allSelected ? "Deselect All" : "Select All"}
                    </Button>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2 pt-2 pb-4">
                  {perms.map((permission) => {
                    const isSelected = selectedPermissions.includes(permission.key)
                    const isInherited = inheritedPermissions.includes(permission.key)
                    const isChecked = isSelected || isInherited

                    return (
                      <div
                        key={permission.key}
                        className={`flex items-start gap-3 p-3 rounded-md border transition-colors ${
                          isChecked
                            ? isInherited
                              ? "bg-secondary/50 border-secondary"
                              : "bg-primary/5 border-primary/20"
                            : "hover:bg-muted/50"
                        } ${disabled || isInherited ? "opacity-75" : ""}`}
                      >
                        <Checkbox
                          id={permission.key}
                          checked={isChecked}
                          disabled={disabled || isInherited}
                          onCheckedChange={() => handleTogglePermission(permission.key)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <label
                              htmlFor={permission.key}
                              className={`text-sm font-medium ${
                                disabled || isInherited
                                  ? "cursor-default"
                                  : "cursor-pointer"
                              }`}
                            >
                              {permission.displayName}
                            </label>
                            {isInherited && (
                              <Badge variant="secondary" className="text-xs">
                                Inherited
                              </Badge>
                            )}
                            {permission.description && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="max-w-xs">
                                    {permission.description}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {permission.key}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>

      {Object.keys(filteredPermissions).length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery
            ? "No permissions match your search"
            : "No permissions available"}
        </div>
      )}
    </div>
  )
}
