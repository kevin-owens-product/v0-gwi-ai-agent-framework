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
  Truck,
  Plus,
  Search,
  Receipt,
  Users,
  Mail,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/use-debounce"

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

export default function VendorsPage() {
  const t = useTranslations("gwi.services.vendors")
  const tCommon = useTranslations("common")
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  
  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (statusFilter !== "all") params.set("status", statusFilter)
        if (typeFilter !== "all") params.set("type", typeFilter)
        if (debouncedSearch) params.set("search", debouncedSearch)

        const res = await fetch(`/api/gwi/services/vendors?${params}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.error || "Failed to fetch vendors")
        }
        const data = await res.json()
        setVendors(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Failed to fetch vendors:", error)
        toast.error(t("failedToLoad"))
        setVendors([]) // Set empty array on error
      } finally {
        setLoading(false)
      }
    }
    
    fetchVendors()
  }, [statusFilter, typeFilter, debouncedSearch, t])

  const stats = {
    total: vendors.length,
    active: vendors.filter((v) => v.status === "ACTIVE").length,
    contractors: vendors.filter((v) => v.type === "CONTRACTOR").length,
  }

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
          <Link href="/gwi/services/vendors/new">
            <Plus className="h-4 w-4 mr-2" />
            {t("addVendor")}
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalVendors")}</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("activeVendors")}</CardTitle>
            <Truck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("contractors")}</CardTitle>
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
          <CardTitle>{t("vendorList")}</CardTitle>
          <CardDescription>{t("vendorListDescription")}</CardDescription>
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
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={tCommon("type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allTypes")}</SelectItem>
                <SelectItem value="CONTRACTOR">{t("types.contractor")}</SelectItem>
                <SelectItem value="FREELANCER">{t("types.freelancer")}</SelectItem>
                <SelectItem value="AGENCY">{t("types.agency")}</SelectItem>
                <SelectItem value="SUPPLIER">{t("types.supplier")}</SelectItem>
                <SelectItem value="CONSULTANT">{t("types.consultant")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={tCommon("status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatuses")}</SelectItem>
                <SelectItem value="ACTIVE">{tCommon("active")}</SelectItem>
                <SelectItem value="INACTIVE">{tCommon("inactive")}</SelectItem>
                <SelectItem value="PENDING_APPROVAL">{tCommon("pending")}</SelectItem>
                <SelectItem value="SUSPENDED">{t("statuses.suspended")}</SelectItem>
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
              <h3 className="text-lg font-medium">{t("noVendorsFound")}</h3>
              <p className="text-muted-foreground mb-4">
                {search || statusFilter !== "all" || typeFilter !== "all"
                  ? t("tryAdjustingFilters")
                  : t("addFirstVendor")}
              </p>
              {!search && statusFilter === "all" && typeFilter === "all" && (
                <Button asChild>
                  <Link href="/gwi/services/vendors/new">
                    <Plus className="h-4 w-4 mr-2" />
                    {t("addVendor")}
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.vendor")}</TableHead>
                  <TableHead>{tCommon("type")}</TableHead>
                  <TableHead>{t("table.contact")}</TableHead>
                  <TableHead>{tCommon("status")}</TableHead>
                  <TableHead className="text-center">{t("table.invoices")}</TableHead>
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
                    <TableCell>{t(`types.${vendor.type.toLowerCase()}`)}</TableCell>
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
                        <span className="text-muted-foreground">{t("noContact")}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[vendor.status]}>
                        {t(`statuses.${vendor.status.toLowerCase()}`)}
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
                        <Link href={`/gwi/services/vendors/${vendor.id}`}>{tCommon("viewDetails")}</Link>
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
