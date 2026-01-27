"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  Truck,
  Plus,
  Search,
  Receipt,
  Users,
  Mail,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

interface Vendor {
  id: string
  name: string
  slug: string
  type: string
  status: string
  email: string | null
  phone: string | null
  website: string | null
  createdAt: string
  contacts: Array<{
    firstName: string
    lastName: string
    email: string
  }>
  _count: {
    invoices: number
    contacts: number
  }
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-gray-100 text-gray-700",
  PENDING_APPROVAL: "bg-blue-100 text-blue-700",
  SUSPENDED: "bg-red-100 text-red-700",
}

const typeLabels: Record<string, string> = {
  CONTRACTOR: "Contractor",
  FREELANCER: "Freelancer",
  AGENCY: "Agency",
  SUPPLIER: "Supplier",
  CONSULTANT: "Consultant",
  OTHER: "Other",
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  useEffect(() => {
    fetchVendors()
  }, [statusFilter, typeFilter, search])

  const fetchVendors = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (typeFilter !== "all") params.set("type", typeFilter)
      if (search) params.set("search", search)

      const res = await fetch(`/api/gwi/services/vendors?${params}`)
      if (!res.ok) throw new Error("Failed to fetch vendors")
      const data = await res.json()
      setVendors(data)
    } catch (error) {
      console.error("Failed to fetch vendors:", error)
      toast.error("Failed to load vendors")
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    total: vendors.length,
    active: vendors.filter((v) => v.status === "ACTIVE").length,
    contractors: vendors.filter((v) => v.type === "CONTRACTOR").length,
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vendors</h1>
          <p className="text-muted-foreground">
            Manage contractors, freelancers, and suppliers
          </p>
        </div>
        <Button asChild>
          <Link href="/gwi/services/vendors/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Vendor
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
            <Truck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contractors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contractors}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor List</CardTitle>
          <CardDescription>View and manage all vendors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                <SelectItem value="FREELANCER">Freelancer</SelectItem>
                <SelectItem value="AGENCY">Agency</SelectItem>
                <SelectItem value="SUPPLIER">Supplier</SelectItem>
                <SelectItem value="CONSULTANT">Consultant</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="PENDING_APPROVAL">Pending</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No vendors found</h3>
              <p className="text-muted-foreground mb-4">
                {search || statusFilter !== "all" || typeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Add your first vendor to get started"}
              </p>
              {!search && statusFilter === "all" && typeFilter === "all" && (
                <Button asChild>
                  <Link href="/gwi/services/vendors/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Vendor
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Invoices</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Truck className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <Link
                            href={`/gwi/services/vendors/${vendor.id}`}
                            className="font-medium hover:underline"
                          >
                            {vendor.name}
                          </Link>
                          {vendor.email && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {vendor.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{typeLabels[vendor.type] || vendor.type}</TableCell>
                    <TableCell>
                      {vendor.contacts.length > 0 ? (
                        <div>
                          <p className="text-sm">
                            {vendor.contacts[0].firstName} {vendor.contacts[0].lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {vendor.contacts[0].email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No contact</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[vendor.status]}>
                        {vendor.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        {vendor._count.invoices}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/gwi/services/vendors/${vendor.id}`}>View</Link>
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
