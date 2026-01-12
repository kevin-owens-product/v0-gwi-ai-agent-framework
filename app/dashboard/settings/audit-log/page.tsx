"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Loader2,
  FileText,
  Plus,
  Trash2,
  Edit,
  Play,
  User,
  Key,
  Settings,
  Database,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"
import { PageTracker } from "@/components/tracking/PageTracker"

interface AuditLog {
  id: string
  action: string
  resourceType: string
  resourceId: string | null
  metadata: Record<string, unknown>
  ipAddress: string | null
  userAgent: string | null
  timestamp: string
  user: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  } | null
}

interface AuditFilters {
  actions: string[]
  resourceTypes: string[]
}

const actionIcons: Record<string, typeof Plus> = {
  create: Plus,
  update: Edit,
  delete: Trash2,
  execute: Play,
  login: User,
  logout: User,
}

const actionColors: Record<string, string> = {
  create: "bg-emerald-500/10 text-emerald-500",
  update: "bg-blue-500/10 text-blue-500",
  delete: "bg-red-500/10 text-red-500",
  execute: "bg-purple-500/10 text-purple-500",
  login: "bg-amber-500/10 text-amber-500",
  logout: "bg-gray-500/10 text-gray-500",
}

const resourceIcons: Record<string, typeof Database> = {
  agent: Settings,
  api_key: Key,
  team_member: User,
  invitation: User,
  data_source: Database,
  insight: FileText,
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState<AuditFilters>({ actions: [], resourceTypes: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [selectedAction, setSelectedAction] = useState<string>("")
  const [selectedResource, setSelectedResource] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const limit = 20

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('limit', limit.toString())
      params.append('offset', (page * limit).toString())
      if (selectedAction) params.append('action', selectedAction)
      if (selectedResource) params.append('resourceType', selectedResource)

      const response = await fetch(`/api/v1/audit-logs?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
        setTotal(data.total || 0)
        if (data.filters) {
          setFilters(data.filters)
        }
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
      toast.error('Failed to load audit logs')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [page, selectedAction, selectedResource])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getActionDescription = (log: AuditLog) => {
    const resourceName = log.metadata?.name || log.metadata?.email || log.resourceId?.slice(0, 8) || 'resource'
    const resourceType = log.resourceType.replace(/_/g, ' ')

    switch (log.action) {
      case 'create':
        return `Created ${resourceType}: ${resourceName}`
      case 'update':
        return `Updated ${resourceType}: ${resourceName}`
      case 'delete':
        return `Deleted ${resourceType}: ${resourceName}`
      case 'execute':
        return `Executed ${resourceType}: ${resourceName}`
      case 'login':
        return 'Logged in'
      case 'logout':
        return 'Logged out'
      default:
        return `${log.action} ${resourceType}`
    }
  }

  const totalPages = Math.ceil(total / limit)

  const filteredLogs = searchQuery
    ? logs.filter(
        (log) =>
          log.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.resourceType.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : logs

  return (
    <div className="p-6 max-w-5xl">
      <PageTracker pageName="Settings - Audit Log" metadata={{ total, currentPage: page, selectedAction, selectedResource }} />
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-muted-foreground">Track all actions and changes in your organization</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>{total} total events</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Actions</SelectItem>
                {filters.actions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedResource} onValueChange={setSelectedResource}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Resources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Resources</SelectItem>
                {filters.resourceTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, ' ').charAt(0).toUpperCase() + type.replace(/_/g, ' ').slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No audit logs found</p>
              <p className="text-sm">Activity will appear here as actions are taken</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => {
                const ActionIcon = actionIcons[log.action] || Settings
                const ResourceIcon = resourceIcons[log.resourceType] || Database
                const actionColor = actionColors[log.action] || "bg-muted text-muted-foreground"

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${actionColor}`}>
                      <ActionIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{getActionDescription(log)}</p>
                        <Badge variant="outline" className="text-xs">
                          <ResourceIcon className="h-3 w-3 mr-1" />
                          {log.resourceType.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        {log.user && (
                          <>
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={log.user.avatarUrl || undefined} />
                              <AvatarFallback className="text-[8px]">
                                {(log.user.name || log.user.email)[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>{log.user.name || log.user.email}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>{formatDate(log.timestamp)}</span>
                        {log.ipAddress && (
                          <>
                            <span>•</span>
                            <span>{log.ipAddress}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {page * limit + 1} to {Math.min((page + 1) * limit, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
