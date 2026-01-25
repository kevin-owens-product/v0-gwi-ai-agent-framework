"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, ExternalLink } from "lucide-react"
import {
  StatusBadge,
  StatusOverview,
  IncidentCard,
  StatusTimeline,
  SubscribeForm,
  type SystemStatus,
  type Incident,
} from "@/components/status"

interface StatusComponent {
  name: string
  status: SystemStatus
}

interface StatusData {
  status: SystemStatus
  components: StatusComponent[]
  activeIncidents: Incident[]
  lastUpdated: string
}

export default function StatusPage() {
  const [statusData, setStatusData] = useState<StatusData | null>(null)
  const [historicalIncidents, setHistoricalIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/status")
      const data = await response.json()
      setStatusData(data)
    } catch (error) {
      console.error("Failed to fetch status:", error)
    }
  }

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/status/incidents?days=30&limit=50")
      const data = await response.json()
      setHistoricalIncidents(data.incidents || [])
    } catch (error) {
      console.error("Failed to fetch incident history:", error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchStatus(), fetchHistory()])
    setRefreshing(false)
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchStatus(), fetchHistory()])
      setLoading(false)
    }

    loadData()

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
          <div className="text-center space-y-4">
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">System Status</h1>
          <p className="text-lg text-muted-foreground">
            Real-time status and incident history for our platform.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            {statusData?.lastUpdated && (
              <span className="text-sm text-muted-foreground">
                Last updated: {new Date(statusData.lastUpdated).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Current Status */}
        {statusData && (
          <StatusOverview
            overallStatus={statusData.status}
            components={statusData.components}
            lastUpdated={new Date(statusData.lastUpdated)}
          />
        )}

        {/* Active Incidents */}
        {statusData && statusData.activeIncidents.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Active Incidents</h2>
            {statusData.activeIncidents.map((incident) => (
              <IncidentCard
                key={incident.id}
                incident={incident}
                showUpdates={true}
                maxUpdates={5}
              />
            ))}
          </div>
        )}

        {/* Incident Timeline */}
        <StatusTimeline incidents={historicalIncidents} days={30} />

        {/* Incident History */}
        <Card>
          <CardHeader>
            <CardTitle>Incident History</CardTitle>
            <CardDescription>Past incidents from the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {historicalIncidents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No incidents in the last 30 days.
              </div>
            ) : (
              <div className="space-y-4">
                {historicalIncidents.map((incident) => (
                  <IncidentCard
                    key={incident.id}
                    incident={incident}
                    showUpdates={true}
                    maxUpdates={3}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscribe Form */}
        <SubscribeForm />

        {/* Footer */}
        <footer className="text-center py-8 border-t">
          <p className="text-sm text-muted-foreground">
            For urgent issues, please contact{" "}
            <a href="mailto:support@example.com" className="underline">
              support@example.com
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}
