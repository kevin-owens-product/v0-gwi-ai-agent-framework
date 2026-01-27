"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  UsersRound,
  Plus,
  Search,
  Building,
  FolderKanban,
  Mail,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  avatarUrl: string | null
  status: string
  employmentType: string
  department: {
    id: string
    name: string
    code: string
  } | null
  role: {
    id: string
    name: string
    code: string
  } | null
  manager: {
    id: string
    firstName: string
    lastName: string
  } | null
  _count: {
    skills: number
    projectAssignments: number
    timeEntries: number
  }
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  ON_LEAVE: "bg-yellow-100 text-yellow-700",
  TERMINATED: "bg-red-100 text-red-700",
  CONTRACTOR: "bg-blue-100 text-blue-700",
}

const employmentTypeLabels: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERN: "Intern",
}

export default function TeamPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchEmployees()
  }, [statusFilter, search])

  const fetchEmployees = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (search) params.set("search", search)

      const res = await fetch(`/api/gwi/services/team/employees?${params}`)
      if (!res.ok) throw new Error("Failed to fetch employees")
      const data = await res.json()
      setEmployees(data)
    } catch (error) {
      console.error("Failed to fetch employees:", error)
      toast.error("Failed to load team members")
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.status === "ACTIVE").length,
    onProjects: employees.filter((e) => e._count.projectAssignments > 0).length,
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-muted-foreground">
            Manage your team members and their assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/gwi/services/team/departments">
              <Building className="h-4 w-4 mr-2" />
              Departments
            </Link>
          </Button>
          <Button asChild>
            <Link href="/gwi/services/team/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <UsersRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UsersRound className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.onProjects}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>View and manage all employees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search team members..."
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
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                <SelectItem value="TERMINATED">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-12">
              <UsersRound className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No team members found</h3>
              <p className="text-muted-foreground mb-4">
                {search || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Add your first team member to get started"}
              </p>
              {!search && statusFilter === "all" && (
                <Button asChild>
                  <Link href="/gwi/services/team/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Employment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Projects</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={employee.avatarUrl || undefined} />
                          <AvatarFallback>
                            {employee.firstName[0]}
                            {employee.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            href={`/gwi/services/team/${employee.id}`}
                            className="font-medium hover:underline"
                          >
                            {employee.firstName} {employee.lastName}
                          </Link>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {employee.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {employee.department?.name || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {employee.role?.name || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {employmentTypeLabels[employee.employmentType] ||
                        employee.employmentType}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[employee.status]}>
                        {employee.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                        {employee._count.projectAssignments}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/gwi/services/team/${employee.id}`}>View</Link>
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
