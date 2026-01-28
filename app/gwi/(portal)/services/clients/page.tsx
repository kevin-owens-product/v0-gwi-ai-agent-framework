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
  Building2,
  Plus,
  Search,
  ExternalLink,
  FolderKanban,
  Receipt,
  Users,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { useDebounce } from "@/hooks/use-debounce"

interface Client {
  id: string
  name: string
  slug: string
  industry: string | null
  website: string | null
  status: string
  createdAt: string
  contacts: Array<{
    firstName: string
    lastName: string
    email: string
  }>
  _count: {
    projects: number
    invoices: number
    contacts: number
  }
}

const statusColors: Record<string, string> = {
  LEAD: "bg-slate-100 text-slate-700",
  PROSPECT: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  ON_HOLD: "bg-yellow-100 text-yellow-700",
  INACTIVE: "bg-gray-100 text-gray-700",
  CHURNED: "bg-red-100 text-red-700",
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const t = useTranslations('gwi.services.clients')
  const tCommon = useTranslations('common')
  
  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (statusFilter !== "all") params.set("status", statusFilter)
        if (debouncedSearch) params.set("search", debouncedSearch)

        const res = await fetch(`/api/gwi/services/clients?${params}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.error || "Failed to fetch clients")
        }
        const data = await res.json()
        setClients(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Failed to fetch clients:", error)
        toast.error(t('loadError'))
        setClients([]) // Set empty array on error
      } finally {
        setLoading(false)
      }
    }
    
    fetchClients()
  }, [statusFilter, debouncedSearch, t])

  const stats = {
    total: clients.length,
    active: clients.filter((c) => c.status === "ACTIVE").length,
    leads: clients.filter((c) => c.status === "LEAD" || c.status === "PROSPECT").length,
    projects: clients.reduce((sum, c) => sum + c._count.projects, 0),
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <Button asChild>
          <Link href="/gwi/services/clients/new">
            <Plus className="h-4 w-4 mr-2" />
            {t('addClient')}
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalClients')}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('activeClients')}</CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('leadsAndProspects')}</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalProjects')}</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.projects}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t('clientList')}</CardTitle>
          <CardDescription>
            {t('clientListDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatuses')}</SelectItem>
                <SelectItem value="LEAD">{t('statuses.lead')}</SelectItem>
                <SelectItem value="PROSPECT">{t('statuses.prospect')}</SelectItem>
                <SelectItem value="ACTIVE">{t('statuses.active')}</SelectItem>
                <SelectItem value="ON_HOLD">{t('statuses.onHold')}</SelectItem>
                <SelectItem value="INACTIVE">{t('statuses.inactive')}</SelectItem>
                <SelectItem value="CHURNED">{t('statuses.churned')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">{t('noClientsFound')}</h3>
              <p className="text-muted-foreground mb-4">
                {search || statusFilter !== "all"
                  ? t('tryAdjustingFilters')
                  : t('getStarted')}
              </p>
              {!search && statusFilter === "all" && (
                <Button asChild>
                  <Link href="/gwi/services/clients/new">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('addClient')}
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('client')}</TableHead>
                  <TableHead>{t('industry')}</TableHead>
                  <TableHead>{t('primaryContact')}</TableHead>
                  <TableHead>{tCommon('status')}</TableHead>
                  <TableHead className="text-center">{t('projects')}</TableHead>
                  <TableHead className="text-center">{t('invoices')}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <Link
                            href={`/gwi/services/clients/${client.id}`}
                            className="font-medium hover:underline"
                          >
                            {client.name}
                          </Link>
                          {client.website && (
                            <a
                              href={client.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                            >
                              {client.website.replace(/^https?:\/\//, "")}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{client.industry || "-"}</TableCell>
                    <TableCell>
                      {client.contacts.length > 0 ? (
                        <div>
                          <p className="text-sm">
                            {client.contacts[0].firstName} {client.contacts[0].lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {client.contacts[0].email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">{t('noContact')}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[client.status] || ""}>
                        {client.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                        {client._count.projects}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        {client._count.invoices}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/gwi/services/clients/${client.id}`}>
                          {tCommon('view')}
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
