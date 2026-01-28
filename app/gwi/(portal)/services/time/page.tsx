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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Clock,
  Plus,
  Search,
  FolderKanban,
  Calendar,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

interface TimeEntry {
  id: string
  date: string
  hours: string
  description: string
  category: string | null
  isBillable: boolean
  status: string
  employee: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  project: {
    id: string
    name: string
    code: string
  } | null
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  BILLED: "bg-purple-100 text-purple-700",
  PAID: "bg-green-100 text-green-700",
}

export default function TimeTrackingPage() {
  const t = useTranslations('gwi.services.time')
  const tCommon = useTranslations('common')
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    hours: "",
    description: "",
    category: "",
    isBillable: true,
    projectId: "",
    employeeId: "",
  })

  useEffect(() => {
    fetchEntries()
  }, [statusFilter])

  const fetchEntries = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)

      const res = await fetch(`/api/gwi/services/time/entries?${params}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to fetch time entries")
      }
      const data = await res.json()
      // Ensure hours is a string
      const normalizedData = Array.isArray(data) ? data.map((entry: TimeEntry) => ({
        ...entry,
        hours: typeof entry.hours === 'string' ? entry.hours : String(entry.hours || '0'),
      })) : []
      setEntries(normalizedData)
    } catch (error) {
      console.error("Failed to fetch time entries:", error)
      toast.error("Failed to load time entries")
      setEntries([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const totalHours = entries.reduce(
    (sum, e) => sum + parseFloat(e.hours || "0"),
    0
  )
  const billableHours = entries
    .filter((e) => e.isBillable)
    .reduce((sum, e) => sum + parseFloat(e.hours || "0"), 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/gwi/services/time/timesheet">
              <Calendar className="h-4 w-4 mr-2" />
              {t('timesheetView')}
            </Link>
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('logTime')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('logTimeEntry')}</DialogTitle>
                <DialogDescription>
                  {t('logTimeDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t('date')}</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('hours')}</Label>
                    <Input
                      type="number"
                      step="0.25"
                      min="0"
                      max="24"
                      placeholder="0.00"
                      value={formData.hours}
                      onChange={(e) =>
                        setFormData({ ...formData, hours: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('descriptionField')}</Label>
                  <Textarea
                    placeholder={t('descriptionPlaceholder')}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('category')}</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectCategory')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">{t('categories.development')}</SelectItem>
                      <SelectItem value="design">{t('categories.design')}</SelectItem>
                      <SelectItem value="meetings">{t('categories.meetings')}</SelectItem>
                      <SelectItem value="planning">{t('categories.planning')}</SelectItem>
                      <SelectItem value="testing">{t('categories.testing')}</SelectItem>
                      <SelectItem value="documentation">{t('categories.documentation')}</SelectItem>
                      <SelectItem value="support">{t('categories.support')}</SelectItem>
                      <SelectItem value="other">{t('categories.other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  {tCommon('cancel')}
                </Button>
                <Button onClick={() => {
                  toast.info(t('featureComingSoon'))
                  setDialogOpen(false)
                }}>
                  {t('saveEntry')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalEntries')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalHours')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('billableHours')}</CardTitle>
            <Clock className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billableHours.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('timeEntries')}</CardTitle>
          <CardDescription>{t('timeEntriesDescription')}</CardDescription>
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
                <SelectItem value="DRAFT">{t('statuses.draft')}</SelectItem>
                <SelectItem value="SUBMITTED">{t('statuses.submitted')}</SelectItem>
                <SelectItem value="APPROVED">{t('statuses.approved')}</SelectItem>
                <SelectItem value="REJECTED">{t('statuses.rejected')}</SelectItem>
                <SelectItem value="BILLED">{t('statuses.billed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">{t('noTimeEntriesFound')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('startLoggingTime')}
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('logTime')}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('date')}</TableHead>
                  <TableHead>{t('employee')}</TableHead>
                  <TableHead>{t('project')}</TableHead>
                  <TableHead>{t('descriptionField')}</TableHead>
                  <TableHead className="text-right">{t('hours')}</TableHead>
                  <TableHead>{t('billable')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {new Date(entry.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {entry.employee.firstName} {entry.employee.lastName}
                    </TableCell>
                    <TableCell>
                      {entry.project ? (
                        <Link
                          href={`/gwi/services/projects/${entry.project.id}`}
                          className="flex items-center gap-2 hover:underline"
                        >
                          <FolderKanban className="h-4 w-4 text-muted-foreground" />
                          {entry.project.name}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">{t('noProject')}</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {entry.description}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {parseFloat(entry.hours).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {entry.isBillable ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[entry.status]}>
                        {entry.status}
                      </Badge>
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
