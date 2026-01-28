"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
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
import { useDebounce } from "@/hooks/use-debounce"

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
  const t = useTranslations("gwi.services.invoicing")
  const tCommon = useTranslations("common")
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (statusFilter !== "all") params.set("status", statusFilter)
        if (debouncedSearch) params.set("search", debouncedSearch)

        const res = await fetch(`/api/gwi/services/invoicing/invoices?${params}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.error || "Failed to fetch invoices")
        }
        const data = await res.json()
        // Ensure all amount fields are strings
        const normalizedData = Array.isArray(data) ? data.map((inv: Invoice) => ({
          ...inv,
          subtotal: typeof inv.subtotal === 'string' ? inv.subtotal : String(inv.subtotal || '0'),
          taxAmount: typeof inv.taxAmount === 'string' ? inv.taxAmount : String(inv.taxAmount || '0'),
          total: typeof inv.total === 'string' ? inv.total : String(inv.total || '0'),
          amountPaid: typeof inv.amountPaid === 'string' ? inv.amountPaid : String(inv.amountPaid || '0'),
          amountDue: typeof inv.amountDue === 'string' ? inv.amountDue : String(inv.amountDue || '0'),
        })) : []
        setInvoices(normalizedData)
      } catch (error) {
        console.error("Failed to fetch invoices:", error)
        toast.error(t("failedToLoad"))
        setInvoices([]) // Set empty array on error
      } finally {
        setLoading(false)
      }
    }
    
    fetchInvoices()
  }, [statusFilter, debouncedSearch, t])

  const totalOutstanding = invoices
    .filter((i) => ["SENT", "VIEWED", "PARTIAL", "OVERDUE"].includes(i.status))
    .reduce((sum, i) => sum + parseFloat(i.amountDue || "0"), 0)
  const overdueCount = invoices.filter((i) => i.status === "OVERDUE").length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <Button asChild>
          <Link href="/gwi/services/invoicing/new">
            <Plus className="h-4 w-4 mr-2" />
            {t("newInvoice")}
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalInvoices")}</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("outstanding")}</CardTitle>
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
            <CardTitle className="text-sm font-medium">{t("paid")}</CardTitle>
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
            <CardTitle className="text-sm font-medium">{t("overdue")}</CardTitle>
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
          <CardTitle>{t("invoiceList")}</CardTitle>
          <CardDescription>{t("invoiceListDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("filterByStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatuses")}</SelectItem>
                <SelectItem value="DRAFT">{t("statuses.draft")}</SelectItem>
                <SelectItem value="PENDING">{t("statuses.pending")}</SelectItem>
                <SelectItem value="SENT">{t("statuses.sent")}</SelectItem>
                <SelectItem value="VIEWED">{t("statuses.viewed")}</SelectItem>
                <SelectItem value="PARTIAL">{t("statuses.partial")}</SelectItem>
                <SelectItem value="PAID">{t("statuses.paid")}</SelectItem>
                <SelectItem value="OVERDUE">{t("statuses.overdue")}</SelectItem>
                <SelectItem value="VOID">{t("statuses.void")}</SelectItem>
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
              <h3 className="text-lg font-medium">{t("noInvoicesFound")}</h3>
              <p className="text-muted-foreground mb-4">
                {search || statusFilter !== "all"
                  ? t("tryAdjustingFilters")
                  : t("createFirstInvoice")}
              </p>
              {!search && statusFilter === "all" && (
                <Button asChild>
                  <Link href="/gwi/services/invoicing/new">
                    <Plus className="h-4 w-4 mr-2" />
                    {t("newInvoice")}
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.invoice")}</TableHead>
                  <TableHead>{t("table.client")}</TableHead>
                  <TableHead>{tCommon("status")}</TableHead>
                  <TableHead>{t("table.issueDate")}</TableHead>
                  <TableHead>{t("table.dueDate")}</TableHead>
                  <TableHead className="text-right">{t("table.total")}</TableHead>
                  <TableHead className="text-right">{t("table.amountDue")}</TableHead>
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
                        {t(`statuses.${invoice.status.toLowerCase()}`)}
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
                          {tCommon("viewDetails")}
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
