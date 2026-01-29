"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Plug, Plus, Settings, Trash2, RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface DataSource {
  id: string
  name: string
  type: "api" | "database" | "file" | "gwi-platform"
  connectionString?: string
  apiKey?: string
  status: "connected" | "disconnected" | "error"
  lastSync?: Date
  syncFrequency?: "realtime" | "hourly" | "daily" | "weekly" | "manual"
  description?: string
}

interface DataSourceManagerProps {
  sources?: DataSource[]
  onSourceAdd?: (source: Omit<DataSource, "id" | "status">) => void
  onSourceUpdate?: (id: string, updates: Partial<DataSource>) => void
  onSourceDelete?: (id: string) => void
  onSourceSync?: (id: string) => void
  className?: string
}

export function DataSourceManager({
  sources = [],
  onSourceAdd,
  onSourceUpdate,
  onSourceDelete,
  onSourceSync,
  className,
}: DataSourceManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newSource, setNewSource] = useState<Partial<DataSource>>({
    type: "api",
    syncFrequency: "daily",
  })

  const handleAddSource = () => {
    if (!newSource.name || !newSource.type) return
    if (onSourceAdd) {
      onSourceAdd({
        name: newSource.name,
        type: newSource.type,
        connectionString: newSource.connectionString,
        apiKey: newSource.apiKey,
        syncFrequency: newSource.syncFrequency || "daily",
        description: newSource.description,
      })
    }
    setShowAddDialog(false)
    setNewSource({ type: "api", syncFrequency: "daily" })
  }

  const getStatusBadge = (status: DataSource["status"]) => {
    const variants = {
      connected: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      disconnected: "bg-muted text-muted-foreground",
      error: "bg-red-500/10 text-red-500 border-red-500/20",
    }
    return (
      <Badge variant="outline" className={cn("text-xs", variants[status])}>
        {status === "connected" ? (
          <CheckCircle2 className="h-3 w-3 mr-1" />
        ) : status === "error" ? (
          <XCircle className="h-3 w-3 mr-1" />
        ) : (
          <Clock className="h-3 w-3 mr-1" />
        )}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Plug className="h-5 w-5" />
                Data Sources
              </CardTitle>
              <CardDescription>
                Manage data source connections and synchronization
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Source
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Plug className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No data sources configured</p>
              <p className="text-xs mt-2">Add a data source to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sources.map((source) => (
                <Card key={source.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{source.name}</h4>
                        {getStatusBadge(source.status)}
                        <Badge variant="outline" className="text-xs">
                          {source.type}
                        </Badge>
                      </div>
                      {source.description && (
                        <p className="text-sm text-muted-foreground">{source.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {source.lastSync && (
                          <span>Last sync: {new Date(source.lastSync).toLocaleString()}</span>
                        )}
                        {source.syncFrequency && (
                          <span>Frequency: {source.syncFrequency}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onSourceSync?.(source.id)}
                        disabled={source.status === "connected"}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onSourceUpdate?.(source.id, {})}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onSourceDelete?.(source.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Source Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Data Source</DialogTitle>
            <DialogDescription>
              Configure a new data source connection
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Source Name</Label>
              <Input
                placeholder="e.g., GWI Platform API"
                value={newSource.name || ""}
                onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Source Type</Label>
              <Select
                value={newSource.type}
                onValueChange={(v) => setNewSource({ ...newSource, type: v as DataSource["type"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="api">API Endpoint</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="file">File Upload</SelectItem>
                  <SelectItem value="gwi-platform">GWI Platform</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newSource.type === "api" && (
              <>
                <div className="space-y-2">
                  <Label>API Endpoint URL</Label>
                  <Input
                    placeholder="https://api.example.com/data"
                    value={newSource.connectionString || ""}
                    onChange={(e) => setNewSource({ ...newSource, connectionString: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>API Key (optional)</Label>
                  <Input
                    type="password"
                    placeholder="Enter API key"
                    value={newSource.apiKey || ""}
                    onChange={(e) => setNewSource({ ...newSource, apiKey: e.target.value })}
                  />
                </div>
              </>
            )}
            {newSource.type === "database" && (
              <div className="space-y-2">
                <Label>Connection String</Label>
                <Input
                  placeholder="postgresql://user:pass@host:5432/db"
                  value={newSource.connectionString || ""}
                  onChange={(e) => setNewSource({ ...newSource, connectionString: e.target.value })}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Sync Frequency</Label>
              <Select
                value={newSource.syncFrequency}
                onValueChange={(v) => setNewSource({ ...newSource, syncFrequency: v as DataSource["syncFrequency"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                placeholder="Brief description of this data source"
                value={newSource.description || ""}
                onChange={(e) => setNewSource({ ...newSource, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSource} disabled={!newSource.name || !newSource.type}>
              Add Source
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
