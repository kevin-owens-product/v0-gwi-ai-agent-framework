/**
 * @prompt-id forge-v4.1:feature:feature-usage-analytics:007
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4.5
 *
 * Feature Usage Table Component
 * Detailed table view of feature usage metrics
 */

"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronUp,
  ChevronDown,
  Search,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface FeatureMetric {
  featureKey: string
  featureName: string
  category?: string
  totalEvents: number
  activeUsers: number
  adoptionRate: number
  retentionRate: number
  avgTimeSpent: number
  uniqueSessions: number
}

interface FeatureUsageTableProps {
  data: FeatureMetric[]
  categories?: string[]
  title?: string
  description?: string
}

type SortField = "featureName" | "totalEvents" | "activeUsers" | "adoptionRate" | "retentionRate"
type SortOrder = "asc" | "desc"

function getTrendIcon(rate: number, threshold: number = 50) {
  if (rate >= threshold + 10) {
    return <TrendingUp className="h-4 w-4 text-green-500" />
  }
  if (rate <= threshold - 10) {
    return <TrendingDown className="h-4 w-4 text-red-500" />
  }
  return <Minus className="h-4 w-4 text-muted-foreground" />
}

function getAdoptionColor(rate: number): string {
  if (rate >= 60) return "text-green-500"
  if (rate >= 30) return "text-amber-500"
  return "text-red-500"
}

function getCategoryBadgeColor(category: string): string {
  const colors: Record<string, string> = {
    agents: "bg-purple-100 text-purple-800",
    audiences: "bg-green-100 text-green-800",
    dashboards: "bg-amber-100 text-amber-800",
    reports: "bg-orange-100 text-orange-800",
    workflows: "bg-teal-100 text-teal-800",
    charts: "bg-yellow-100 text-yellow-800",
    crosstabs: "bg-red-100 text-red-800",
    api: "bg-lime-100 text-lime-800",
    data: "bg-cyan-100 text-cyan-800",
    collaboration: "bg-blue-100 text-blue-800",
    settings: "bg-slate-100 text-slate-800",
  }
  return colors[category] || "bg-gray-100 text-gray-800"
}

export function FeatureUsageTable({
  data,
  categories = [],
  title,
  description,
}: FeatureUsageTableProps) {
  const tTable = useTranslations('ui.table')
  const tPagination = useTranslations('ui.pagination')
  const tCommon = useTranslations('common')

  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortField, setSortField] = useState<SortField>("adoptionRate")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  // Filter and sort data
  const filteredData = data
    .filter(item => {
      const matchesSearch = search === "" ||
        item.featureName.toLowerCase().includes(search.toLowerCase()) ||
        item.featureKey.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      const modifier = sortOrder === "asc" ? 1 : -1

      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue) * modifier
      }
      return ((aValue as number) - (bValue as number)) * modifier
    })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || "Feature Usage Details"}</CardTitle>
        <CardDescription>{description || "Detailed metrics for all tracked features"}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search features..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <Button
                    variant="ghost"
                    className="p-0 h-auto font-medium hover:bg-transparent"
                    onClick={() => handleSort("featureName")}
                  >
                    Feature
                    <SortIcon field="featureName" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">Category</TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    className="p-0 h-auto font-medium hover:bg-transparent"
                    onClick={() => handleSort("totalEvents")}
                  >
                    Total Events
                    <SortIcon field="totalEvents" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    className="p-0 h-auto font-medium hover:bg-transparent"
                    onClick={() => handleSort("activeUsers")}
                  >
                    Active Users
                    <SortIcon field="activeUsers" />
                  </Button>
                </TableHead>
                <TableHead className="text-center w-[150px]">
                  <Button
                    variant="ghost"
                    className="p-0 h-auto font-medium hover:bg-transparent"
                    onClick={() => handleSort("adoptionRate")}
                  >
                    Adoption
                    <SortIcon field="adoptionRate" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    className="p-0 h-auto font-medium hover:bg-transparent"
                    onClick={() => handleSort("retentionRate")}
                  >
                    Retention
                    <SortIcon field="retentionRate" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">Sessions</TableHead>
                <TableHead className="text-center">Avg Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {tTable('noResults')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map(item => (
                  <TableRow key={item.featureKey}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.featureName}</p>
                        <p className="text-xs text-muted-foreground">{item.featureKey}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className={cn("capitalize", getCategoryBadgeColor(item.category || ""))}
                      >
                        {item.category || "other"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {item.totalEvents.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {item.activeUsers.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                          <span className={cn("font-medium", getAdoptionColor(item.adoptionRate))}>
                            {item.adoptionRate.toFixed(1)}%
                          </span>
                          {getTrendIcon(item.adoptionRate)}
                        </div>
                        <Progress value={item.adoptionRate} className="w-20 h-1.5" />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className={cn("font-medium", getAdoptionColor(item.retentionRate))}>
                          {item.retentionRate.toFixed(1)}%
                        </span>
                        {getTrendIcon(item.retentionRate)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {item.uniqueSessions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {item.avgTimeSpent > 0
                        ? `${Math.floor(item.avgTimeSpent / 60)}m ${item.avgTimeSpent % 60}s`
                        : "-"
                      }
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="mt-4 text-sm text-muted-foreground">
          {tPagination('showingItems', { start: 1, end: filteredData.length, total: data.length })}
        </div>
      </CardContent>
    </Card>
  )
}
