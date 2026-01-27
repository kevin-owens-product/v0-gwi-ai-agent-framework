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
  Receipt,
  Plus,
  Search,
  Building2,
  DollarSign,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

interface Invoice {
  id: string
  invoiceNumber: string
  status: string
  issueDate: string
  dueDate: string
  currency: string
  subtotal: string
  taxAmount: string
  total: string
  amountPaid: string
  amountDue: string
  client: {
    id: string
    name: string
  }
  _count: {
    lineItems: number
  }
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  PENDING: "bg-blue-100 text-blue-700",
  SENT: "bg-purple-100 text-purple-700",
  VIEWED: "bg-cyan-100 text-cyan-700",
  PARTIAL: "bg-yellow-100 text-yellow-700",
  PAID: "bg-emerald-100 text-emerald-700",
  OVERDUE: "bg-red-100 text-red-700",
  VOID: "bg-gray-100 text-gray-700",
}

export default function InvoicingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchInvoices()
  }, [statusFilter, search])

  const fetchInvoices = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (search) params.set("search", search)

      const res = await fetch(`/api/gwi/services/invoicing/invoices?${params}`)
      if (!res.ok) throw new Error("Failed to fetch invoices")
      const data = await res.json()
      setInvoices(data)
    } catch (error) {
      console.error("Failed to fetch invoices:", error)
      toast.error("Failed to load invoices")
    } finally {
      setLoading(false)
    }
  }

  const totalOutstanding = invoices
    .filter((i) => ["SENT", "VIEWED", "PARTIAL", "OVERDUE"].includes(i.status))
    .reduce((sum, i) => sum + parseFloat(i.amountDue || "0"), 0)
  const overdueCount = invoices.filter((i) => i.status === "OVERDUE").length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoicing</h1>
          <p className="text-muted-foreground">
            Create and manage client invoices
          </p>
        </div>
        <Button asChild>
          <Link href="/gwi/services/invoicing/new">
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalOutstanding.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <Receipt className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices.filter((i) => i.status === "PAID").length}
            </div>
          </CardContent>
        </Card>
        <Card className={overdueCount > 0 ? "border-destructive/50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className={`h-4 w-4 ${overdueCount > 0 ? "text-destructive" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${overdueCount > 0 ? "text-destructive" : ""}`}>
              {overdueCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
          <CardDescription>View and manage all invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
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
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="VIEWED">Viewed</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
                <SelectItem value="VOID">Void</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No invoices found</h3>
              <p className="text-muted-foreground mb-4">
                {search || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first invoice to get started"}
              </p>
              {!search && statusFilter === "all" && (
                <Button asChild>
                  <Link href="/gwi/services/invoicing/new">
                    <Plus className="h-4 w-4 mr-2" />
                    New Invoice
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Amount Due</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Link
                        href={`/gwi/services/invoicing/${invoice.id}`}
                        className="font-medium hover:underline"
                      >
                        {invoice.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/gwi/services/clients/${invoice.client.id}`}
                        className="flex items-center gap-2 hover:underline"
                      >
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {invoice.client.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[invoice.status]}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.issueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${parseFloat(invoice.total).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${parseFloat(invoice.amountDue).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/gwi/services/invoicing/${invoice.id}`}>
                          View
                        </Link>
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
