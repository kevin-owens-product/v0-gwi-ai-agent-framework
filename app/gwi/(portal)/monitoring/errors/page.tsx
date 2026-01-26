import { Suspense } from "react"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertTriangle, Search, Eye, CheckCircle, Clock, RefreshCw } from "lucide-react"

async function getErrorLogs() {
  const errors = await prisma.gWIErrorLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  const unresolvedCount = await prisma.gWIErrorLog.count({
    where: { resolvedAt: null },
  })

  return { errors, unresolvedCount }
}

async function ErrorLogsContent() {
  const { errors, unresolvedCount } = await getErrorLogs()

  const sourceColors: Record<string, string> = {
    pipeline: "bg-blue-100 text-blue-700",
    llm: "bg-purple-100 text-purple-700",
    agent: "bg-orange-100 text-orange-700",
    data_source: "bg-green-100 text-green-700",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Error Logs</h1>
          <p className="text-muted-foreground">
            View and resolve system errors
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{unresolvedCount}</p>
                <p className="text-sm text-muted-foreground">Unresolved Errors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {errors.filter((e) => e.resolvedAt).length}
                </p>
                <p className="text-sm text-muted-foreground">Resolved Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{errors.length}</p>
                <p className="text-sm text-muted-foreground">Total Errors (24h)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search errors..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="pipeline">Pipeline</SelectItem>
                <SelectItem value="llm">LLM</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="data_source">Data Source</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="unresolved">Unresolved</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Errors Table */}
      <Card>
        <CardContent className="p-0">
          {errors.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Error</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errors.map((error) => (
                  <TableRow key={error.id}>
                    <TableCell>
                      <p className="font-medium truncate max-w-sm">
                        {error.message}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge className={sourceColors[error.source] || "bg-gray-100"}>
                        {error.source}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="px-2 py-1 bg-slate-100 rounded text-xs">
                        {error.errorType}
                      </code>
                    </TableCell>
                    <TableCell>
                      {new Date(error.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {error.resolvedAt ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Resolved
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Open
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Error Details</DialogTitle>
                            <DialogDescription>
                              {error.errorType} - {error.source}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium">Message</p>
                              <p className="text-sm text-muted-foreground">
                                {error.message}
                              </p>
                            </div>
                            {error.stackTrace && (
                              <div>
                                <p className="text-sm font-medium">Stack Trace</p>
                                <pre className="text-xs bg-slate-100 p-3 rounded overflow-auto max-h-48">
                                  {error.stackTrace}
                                </pre>
                              </div>
                            )}
                            {error.context && (
                              <div>
                                <p className="text-sm font-medium">Context</p>
                                <pre className="text-xs bg-slate-100 p-3 rounded overflow-auto max-h-32">
                                  {JSON.stringify(error.context, null, 2)}
                                </pre>
                              </div>
                            )}
                            {!error.resolvedAt && (
                              <Button className="w-full">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Resolved
                              </Button>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium">No errors found</h3>
              <p className="text-muted-foreground">
                All systems are running smoothly
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ErrorLogsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Error Logs</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <ErrorLogsContent />
    </Suspense>
  )
}
