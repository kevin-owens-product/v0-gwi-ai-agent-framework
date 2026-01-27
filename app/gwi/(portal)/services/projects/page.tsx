"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
  FolderKanban,
  Plus,
  Search,
  Building2,
  Users,
  Clock,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

interface Project {
  id: string
  name: string
  code: string
  status: string
  billingType: string
  startDate: string | null
  endDate: string | null
  completionPercent: number
  client: {
    id: string
    name: string
  }
  _count: {
    teamMembers: number
    deliverables: number
    timeEntries: number
  }
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  PROPOSED: "bg-blue-100 text-blue-700",
  APPROVED: "bg-purple-100 text-purple-700",
  IN_PROGRESS: "bg-emerald-100 text-emerald-700",
  ON_HOLD: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  ARCHIVED: "bg-gray-100 text-gray-700",
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchProjects()
  }, [statusFilter, search])

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (search) params.set("search", search)

      const res = await fetch(`/api/gwi/services/projects?${params}`)
      if (!res.ok) throw new Error("Failed to fetch projects")
      const data = await res.json()
      setProjects(data)
    } catch (error) {
      console.error("Failed to fetch projects:", error)
      toast.error("Failed to load projects")
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    total: projects.length,
    inProgress: projects.filter((p) => p.status === "IN_PROGRESS").length,
    completed: projects.filter((p) => p.status === "COMPLETED").length,
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage your project engagements and deliverables
          </p>
        </div>
        <Button asChild>
          <Link href="/gwi/services/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <FolderKanban className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <CardTitle>Project List</CardTitle>
          <CardDescription>View and manage all your projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PROPOSED">Proposed</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No projects found</h3>
              <p className="text-muted-foreground mb-4">
                {search || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by creating your first project"}
              </p>
              {!search && statusFilter === "all" && (
                <Button asChild>
                  <Link href="/gwi/services/projects/new">
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-center">Team</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <Link
                          href={`/gwi/services/projects/${project.id}`}
                          className="font-medium hover:underline"
                        >
                          {project.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{project.code}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/gwi/services/clients/${project.client.id}`}
                        className="flex items-center gap-2 hover:underline"
                      >
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {project.client.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[project.status]}>
                        {project.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="w-24">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>{project.completionPercent}%</span>
                        </div>
                        <Progress value={project.completionPercent} className="h-1.5" />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {project._count.teamMembers}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {project.startDate
                          ? new Date(project.startDate).toLocaleDateString()
                          : "Not set"}
                        {project.endDate && (
                          <>
                            {" - "}
                            {new Date(project.endDate).toLocaleDateString()}
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/gwi/services/projects/${project.id}`}>View</Link>
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
