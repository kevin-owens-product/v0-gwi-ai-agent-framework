"use client"
/* eslint-disable local/no-hardcoded-strings */

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Database, Settings, LineChart } from "lucide-react"
import Link from "next/link"

interface DataSource {
  id: string
  name: string
  type: string
  isActive: boolean
  syncStatus: string
  lastSyncAt: string | null
  createdAt: string
}

export default function AdminGWIDataSourcesPage() {
  const router = useRouter()
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchDataSources()
  }, [])

  const fetchDataSources = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/gwi/data-sources")
      if (response.ok) {
        const data = await response.json()
        setDataSources(data)
      }
    } catch (error) {
      console.error("Failed to fetch data sources:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredDataSources = dataSources.filter((ds) =>
    ds.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ds.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      syncing: "default",
      success: "default",
      error: "destructive",
    }
    return <Badge variant={variants[status] || "default"}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">GWI Data Sources</h1>
          <p className="text-muted-foreground">
            Manage data source connections, sync schedules, and quality rules
          </p>
        </div>
        <Button onClick={() => router.push("/gwi/data-sources/new")}>
          New Data Source
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Data Sources</CardTitle>
              <CardDescription>
                {filteredDataSources.length} data source
                {filteredDataSources.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search data sources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading data sources...</div>
          ) : filteredDataSources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No data sources found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sync Status</TableHead>
                  <TableHead>Last Sync</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDataSources.map((dataSource) => (
                  <TableRow key={dataSource.id}>
                    <TableCell className="font-medium">{dataSource.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{dataSource.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={dataSource.isActive ? "default" : "secondary"}>
                        {dataSource.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(dataSource.syncStatus)}</TableCell>
                    <TableCell>
                      {dataSource.lastSyncAt
                        ? new Date(dataSource.lastSyncAt).toLocaleString()
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/gwi/data-sources/${dataSource.id}/sync`}>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/gwi/data-sources/${dataSource.id}/quality`}>
                          <Button variant="outline" size="sm">
                            <LineChart className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/gwi/data-sources/${dataSource.id}`}>
                          <Button variant="outline" size="sm">
                            <Database className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
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
