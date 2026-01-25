/**
 * @prompt-id forge-v4.1:feature:feedback-nps:016
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  RefreshCw,
  Bug,
  Lightbulb,
  MessageSquare,
  AlertTriangle,
  ThumbsUp,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"
import { FeedbackTable } from "@/components/admin/feedback"

interface FeedbackItem {
  id: string
  type: string
  category: string | null
  title: string | null
  content: string
  rating: number | null
  sentiment: string | null
  status: string
  priority: string
  assignedTo: string | null
  createdAt: string
  user?: {
    id: string
    email: string
    name: string | null
  } | null
}

interface FeedbackStats {
  totalNew: number
  totalUnderReview: number
  totalInProgress: number
  byType: Record<string, number>
  bySentiment: Record<string, number>
}

export default function FeedbackPage() {
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Filters
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const fetchFeedback = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(typeFilter !== "all" && { type: typeFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(priorityFilter !== "all" && { priority: priorityFilter }),
        ...(searchQuery && { search: searchQuery }),
      })

      const response = await fetch(`/api/admin/feedback?${params}`)
      const data = await response.json()

      setFeedbackItems(data.feedbackItems)
      setTotal(data.total)
      setTotalPages(data.totalPages)
      setStats(data.stats)
    } catch (error) {
      console.error("Failed to fetch feedback:", error)
    } finally {
      setIsLoading(false)
    }
  }, [page, typeFilter, statusFilter, priorityFilter, searchQuery])

  useEffect(() => {
    fetchFeedback()
  }, [fetchFeedback])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      fetchFeedback()
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  const handlePriorityChange = async (id: string, priority: string) => {
    try {
      await fetch(`/api/admin/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority }),
      })
      fetchFeedback()
    } catch (error) {
      console.error("Failed to update priority:", error)
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "POSITIVE": return <TrendingUp className="h-4 w-4 text-green-500" />
      case "NEGATIVE": return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <Minus className="h-4 w-4 text-slate-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>New Feedback</CardDescription>
            <CardTitle className="text-3xl">{stats?.totalNew || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-blue-500">Needs attention</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Under Review</CardDescription>
            <CardTitle className="text-3xl">{stats?.totalUnderReview || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-amber-500">In progress</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sentiment</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              {stats?.bySentiment?.POSITIVE || 0}
              {getSentimentIcon("POSITIVE")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-sm text-muted-foreground">
              {stats?.bySentiment?.NEGATIVE || 0} negative
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>By Type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats?.byType?.BUG_REPORT !== undefined && stats.byType.BUG_REPORT > 0 && (
                <Badge variant="outline" className="text-red-500">
                  <Bug className="h-3 w-3 mr-1" />
                  {stats.byType.BUG_REPORT}
                </Badge>
              )}
              {stats?.byType?.FEATURE_REQUEST !== undefined && stats.byType.FEATURE_REQUEST > 0 && (
                <Badge variant="outline" className="text-amber-500">
                  <Lightbulb className="h-3 w-3 mr-1" />
                  {stats.byType.FEATURE_REQUEST}
                </Badge>
              )}
              {stats?.byType?.GENERAL !== undefined && stats.byType.GENERAL > 0 && (
                <Badge variant="outline" className="text-blue-500">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {stats.byType.GENERAL}
                </Badge>
              )}
              {stats?.byType?.COMPLAINT !== undefined && stats.byType.COMPLAINT > 0 && (
                <Badge variant="outline" className="text-orange-500">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {stats.byType.COMPLAINT}
                </Badge>
              )}
              {stats?.byType?.PRAISE !== undefined && stats.byType.PRAISE > 0 && (
                <Badge variant="outline" className="text-green-500">
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  {stats.byType.PRAISE}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Customer Feedback</CardTitle>
              <CardDescription>
                Manage and respond to customer feedback ({total} total)
              </CardDescription>
            </div>
            <Button onClick={fetchFeedback} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search feedback..."
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="BUG_REPORT">Bug Report</SelectItem>
                <SelectItem value="FEATURE_REQUEST">Feature Request</SelectItem>
                <SelectItem value="GENERAL">General</SelectItem>
                <SelectItem value="COMPLAINT">Complaint</SelectItem>
                <SelectItem value="PRAISE">Praise</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                <SelectItem value="PLANNED">Planned</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="WONT_DO">Won't Do</SelectItem>
                <SelectItem value="DUPLICATE">Duplicate</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <FeedbackTable
            feedbackItems={feedbackItems}
            isLoading={isLoading}
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
        </CardContent>
      </Card>
    </div>
  )
}
