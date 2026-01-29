"use client"
/* eslint-disable local/no-hardcoded-strings */

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2, RefreshCw, CheckCircle2, XCircle } from "lucide-react"

interface SyncSchedule {
  id: string
  schedule: string
  isActive: boolean
  lastRunAt: string | null
  nextRunAt: string | null
  createdAt: string
}

interface SyncStatus {
  syncStatus: string
  lastSyncAt: string | null
  schedules: SyncSchedule[]
}

export default function DataSourceSyncPage() {
  const params = useParams()
  const dataSourceId = params.id as string

  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    schedule: "0 0 * * *", // Daily at midnight
    isActive: true,
  })

  useEffect(() => {
    if (dataSourceId) {
      fetchSyncStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSourceId])

  const fetchSyncStatus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/gwi/data-sources/${dataSourceId}/sync`)
      if (response.ok) {
        const data = await response.json()
        setSyncStatus(data)
      }
    } catch (error) {
      console.error("Failed to fetch sync status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTriggerSync = async () => {
    try {
      const response = await fetch(`/api/gwi/data-sources/${dataSourceId}/sync`, {
        method: "POST",
      })

      if (response.ok) {
        setTimeout(() => {
          fetchSyncStatus()
        }, 1000)
      }
    } catch (error) {
      console.error("Failed to trigger sync:", error)
    }
  }

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch(
        `/api/gwi/data-sources/${dataSourceId}/sync/schedule`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      )

      if (response.ok) {
        setIsDialogOpen(false)
        setFormData({
          schedule: "0 0 * * *",
          isActive: true,
        })
        fetchSyncStatus()
      }
    } catch (error) {
      console.error("Failed to create schedule:", error)
    }
  }

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) {
      return
    }

    // Note: This endpoint would need to be created
    try {
      const response = await fetch(
        `/api/gwi/data-sources/${dataSourceId}/sync/schedule/${scheduleId}`,
        { method: "DELETE" }
      )

      if (response.ok) {
        fetchSyncStatus()
      }
    } catch (error) {
      console.error("Failed to delete schedule:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      syncing: "default",
      success: "default",
      error: "destructive",
    }
    const icons: Record<string, React.ReactNode> = {
      success: <CheckCircle2 className="h-3 w-3 mr-1" />,
      error: <XCircle className="h-3 w-3 mr-1" />,
    }

    return (
      <Badge variant={variants[status] || "default"}>
        {icons[status]}
        {status}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Source Sync</h1>
          <p className="text-muted-foreground">
            Manage sync schedules and trigger manual syncs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleTriggerSync} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Trigger Sync
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setFormData({
                    schedule: "0 0 * * *",
                    isActive: true,
                  })
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Sync Schedule</DialogTitle>
                <DialogDescription>
                  Configure automatic sync schedule using cron expression
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSchedule} className="space-y-4">
                <div>
                  <Label>Cron Expression</Label>
                  <Input
                    value={formData.schedule}
                    onChange={(e) =>
                      setFormData({ ...formData, schedule: e.target.value })
                    }
                    placeholder="0 0 * * *"
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Format: minute hour day month weekday (e.g., "0 0 * * *" = daily at
                    midnight)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Schedule</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {syncStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Sync Status</CardTitle>
            <CardDescription>Current synchronization status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(syncStatus.syncStatus)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Sync</p>
                  <p className="mt-1">
                    {syncStatus.lastSyncAt
                      ? new Date(syncStatus.lastSyncAt).toLocaleString()
                      : "Never"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Sync Schedules</CardTitle>
          <CardDescription>
            {syncStatus?.schedules.length || 0} schedule
            {(syncStatus?.schedules.length || 0) !== 1 ? "s" : ""} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading schedules...</div>
          ) : !syncStatus || syncStatus.schedules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No sync schedules configured. Click "Add Schedule" to create one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cron Expression</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead>Next Run</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {syncStatus.schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-mono text-sm">
                      {schedule.schedule}
                    </TableCell>
                    <TableCell>
                      {schedule.lastRunAt
                        ? new Date(schedule.lastRunAt).toLocaleString()
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      {schedule.nextRunAt
                        ? new Date(schedule.nextRunAt).toLocaleString()
                        : "Not scheduled"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={schedule.isActive ? "default" : "secondary"}>
                        {schedule.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
