import { Suspense } from "react"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Database,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  LineChart,
} from "lucide-react"

const syncStatusColors: Record<string, { color: string; icon: typeof CheckCircle }> = {
  synced: { color: "bg-green-100 text-green-700", icon: CheckCircle },
  syncing: { color: "bg-blue-100 text-blue-700", icon: RefreshCw },
  pending: { color: "bg-yellow-100 text-yellow-700", icon: Clock },
  error: { color: "bg-red-100 text-red-700", icon: XCircle },
}

async function getDataSources() {
  const dataSources = await prisma.gWIDataSourceConnection.findMany({
    include: {
      createdBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return dataSources
}

async function DataSourcesContent() {
  const dataSources = await getDataSources()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Sources</h1>
          <p className="text-muted-foreground">
            Manage external data connections and integrations
          </p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" asChild>
          <Link href="/gwi/data-sources/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Data Source
          </Link>
        </Button>
      </div>

      {/* Quick Links */}
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link href="/gwi/data-sources/schemas">
            <FileText className="mr-2 h-4 w-4" />
            Schema Browser
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/gwi/data-sources/sync">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Status
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/gwi/data-sources/quality">
            <LineChart className="mr-2 h-4 w-4" />
            Data Quality
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search data sources..." className="pl-9" />
          </div>
        </CardContent>
      </Card>

      {/* Data Sources Table */}
      <Card>
        <CardContent className="p-0">
          {dataSources.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Sync Status</TableHead>
                  <TableHead>Last Sync</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataSources.map((ds) => {
                  const statusConfig = syncStatusColors[ds.syncStatus] || syncStatusColors.pending
                  const StatusIcon = statusConfig.icon

                  return (
                    <TableRow key={ds.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Database className="h-5 w-5 text-slate-600" />
                          </div>
                          <div>
                            <p className="font-medium">{ds.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Created by {ds.createdBy.name}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ds.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusConfig.color} gap-1`}>
                          <StatusIcon
                            className={`h-3 w-3 ${
                              ds.syncStatus === "syncing" ? "animate-spin" : ""
                            }`}
                          />
                          {ds.syncStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ds.lastSyncAt
                          ? new Date(ds.lastSyncAt).toLocaleString()
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        <Switch checked={ds.isActive} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-blue-600">
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Sync Now
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/gwi/data-sources/${ds.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Database className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No data sources configured</h3>
              <p className="text-muted-foreground mb-4">
                Connect external data sources to your platform
              </p>
              <Button asChild>
                <Link href="/gwi/data-sources/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Data Source
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function DataSourcesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Data Sources</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <DataSourcesContent />
    </Suspense>
  )
}
