"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  FolderKanban,
  Receipt,
  Users,
  Loader2,
  Edit,
  Trash2,
  Plus,
  Mail,
  Phone,
} from "lucide-react"
import { toast } from "sonner"

interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  title: string | null
  department: string | null
  isPrimary: boolean
  isActive: boolean
}

interface Project {
  id: string
  name: string
  code: string
  status: string
  startDate: string | null
  endDate: string | null
}

interface Invoice {
  id: string
  invoiceNumber: string
  status: string
  issueDate: string
  dueDate: string
  total: string
}

interface Client {
  id: string
  name: string
  slug: string
  industry: string | null
  website: string | null
  logoUrl: string | null
  status: string
  billingAddress: Record<string, unknown> | null
  taxId: string | null
  paymentTerms: number
  currency: string
  notes: string | null
  tags: string[]
  createdAt: string
  contacts: Contact[]
  projects: Project[]
  invoices: Invoice[]
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

const projectStatusColors: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  PROPOSED: "bg-blue-100 text-blue-700",
  APPROVED: "bg-purple-100 text-purple-700",
  IN_PROGRESS: "bg-emerald-100 text-emerald-700",
  ON_HOLD: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
}

const invoiceStatusColors: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  PENDING: "bg-blue-100 text-blue-700",
  SENT: "bg-purple-100 text-purple-700",
  VIEWED: "bg-cyan-100 text-cyan-700",
  PARTIAL: "bg-yellow-100 text-yellow-700",
  PAID: "bg-emerald-100 text-emerald-700",
  OVERDUE: "bg-red-100 text-red-700",
  VOID: "bg-gray-100 text-gray-700",
}

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const t = useTranslations("gwi.services.clients")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    website: "",
    status: "",
    taxId: "",
    paymentTerms: "30",
    currency: "USD",
    notes: "",
  })

  useEffect(() => {
    fetchClient()
  }, [id])

  const fetchClient = async () => {
    try {
      const res = await fetch(`/api/gwi/services/clients/${id}`)
      if (!res.ok) throw new Error("Failed to fetch client")
      const data = await res.json()
      setClient(data)
      setFormData({
        name: data.name,
        industry: data.industry || "",
        website: data.website || "",
        status: data.status,
        taxId: data.taxId || "",
        paymentTerms: data.paymentTerms.toString(),
        currency: data.currency,
        notes: data.notes || "",
      })
    } catch (error) {
      console.error("Failed to fetch client:", error)
      toast.error(t("failedToLoad"))
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/gwi/services/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          paymentTerms: parseInt(formData.paymentTerms),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update client")
      }

      const updated = await res.json()
      setClient(updated)
      setEditing(false)
      toast.success(t("clientUpdated"))
    } catch (error) {
      console.error("Failed to update client:", error)
      toast.error(error instanceof Error ? error.message : t("failedToUpdate"))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/gwi/services/clients/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete client")
      }

      toast.success(t("clientDeleted"))
      router.push("/gwi/services/clients")
    } catch (error) {
      console.error("Failed to delete client:", error)
      toast.error(error instanceof Error ? error.message : t("failedToDelete"))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">{t("clientNotFound")}</h3>
          <Button asChild className="mt-4">
            <Link href="/gwi/services/clients">{t("backToClients")}</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/gwi/services/clients"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backToClients")}
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-lg bg-slate-100 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                {client.name}
                <Badge className={statusColors[client.status]}>
                  {t(`statuses.${client.status.toLowerCase()}`)}
                </Badge>
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {client.industry && <span>{client.industry}</span>}
                {client.website && (
                  <a
                    href={client.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    {client.website.replace(/^https?:\/\//, "")}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setEditing(!editing)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("deleteClient")}</DialogTitle>
                <DialogDescription>
                  {t("deleteClientConfirmation", { name: client.name })}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  {tCommon("cancel")}
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  {tCommon("delete")}
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
            <CardTitle className="text-sm font-medium">{t("projects")}</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client._count.projects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("invoices")}</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client._count.invoices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("contacts")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client._count.contacts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="contacts">{t("tabs.contacts")}</TabsTrigger>
          <TabsTrigger value="projects">{t("tabs.projects")}</TabsTrigger>
          <TabsTrigger value="invoices">{t("tabs.invoices")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("detail.clientDetails")}</CardTitle>
              <CardDescription>
                {editing ? t("detail.editClientInformation") : t("detail.basicClientInformation")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{t("form.companyName")}</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("form.industry")}</Label>
                      <Input
                        value={formData.industry}
                        onChange={(e) =>
                          setFormData({ ...formData, industry: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("form.website")}</Label>
                      <Input
                        value={formData.website}
                        onChange={(e) =>
                          setFormData({ ...formData, website: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{tCommon("status")}</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LEAD">{t("statuses.lead")}</SelectItem>
                          <SelectItem value="PROSPECT">{t("statuses.prospect")}</SelectItem>
                          <SelectItem value="ACTIVE">{tCommon("active")}</SelectItem>
                          <SelectItem value="ON_HOLD">{t("statuses.onHold")}</SelectItem>
                          <SelectItem value="INACTIVE">{tCommon("inactive")}</SelectItem>
                          <SelectItem value="CHURNED">{t("statuses.churned")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("form.notes")}</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setEditing(false)}
                    >
                      {tCommon("cancel")}
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {tCommon("saving")}
                        </>
                      ) : (
                        tCommon("saveChanges")
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("form.industry")}</p>
                    <p className="font-medium">{client.industry || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("detail.paymentTerms")}</p>
                    <p className="font-medium">{t("detail.net", { days: client.paymentTerms })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("form.currency")}</p>
                    <p className="font-medium">{client.currency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("form.taxId")}</p>
                    <p className="font-medium">{client.taxId || "-"}</p>
                  </div>
                  {client.notes && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">{t("form.notes")}</p>
                      <p className="font-medium whitespace-pre-wrap">{client.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("contacts")}</CardTitle>
                <CardDescription>
                  {t("detail.peopleAt", { name: client.name })}
                </CardDescription>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t("addContact")}
              </Button>
            </CardHeader>
            <CardContent>
              {client.contacts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t("noContactsYet")}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{tCommon("name")}</TableHead>
                      <TableHead>{t("detail.title")}</TableHead>
                      <TableHead>{tCommon("email")}</TableHead>
                      <TableHead>{t("detail.phone")}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {client.contacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {contact.firstName} {contact.lastName}
                            {contact.isPrimary && (
                              <Badge variant="outline" className="text-xs">{t("detail.primary")}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{contact.title || "-"}</TableCell>
                        <TableCell>
                          <a
                            href={`mailto:${contact.email}`}
                            className="flex items-center gap-1 hover:underline"
                          >
                            <Mail className="h-3 w-3" />
                            {contact.email}
                          </a>
                        </TableCell>
                        <TableCell>
                          {contact.phone ? (
                            <a
                              href={`tel:${contact.phone}`}
                              className="flex items-center gap-1 hover:underline"
                            >
                              <Phone className="h-3 w-3" />
                              {contact.phone}
                            </a>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("projects")}</CardTitle>
                <CardDescription>
                  {t("detail.engagementsWith", { name: client.name })}
                </CardDescription>
              </div>
              <Button size="sm" asChild>
                <Link href={`/gwi/services/projects/new?clientId=${client.id}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("newProject")}
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {client.projects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t("noProjectsYet")}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("detail.project")}</TableHead>
                      <TableHead>{tCommon("status")}</TableHead>
                      <TableHead>{t("detail.startDate")}</TableHead>
                      <TableHead>{t("detail.endDate")}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {client.projects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{project.name}</p>
                            <p className="text-xs text-muted-foreground">{project.code}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={projectStatusColors[project.status]}>
                            {t(`projectStatuses.${project.status.toLowerCase()}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {project.startDate
                            ? new Date(project.startDate).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {project.endDate
                            ? new Date(project.endDate).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/gwi/services/projects/${project.id}`}>
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
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("invoices")}</CardTitle>
                <CardDescription>
                  {t("detail.billingHistory", { name: client.name })}
                </CardDescription>
              </div>
              <Button size="sm" asChild>
                <Link href={`/gwi/services/invoicing/new?clientId=${client.id}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("newInvoice")}
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {client.invoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {t("noInvoicesYet")}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("detail.invoice")}</TableHead>
                      <TableHead>{tCommon("status")}</TableHead>
                      <TableHead>{t("detail.issueDate")}</TableHead>
                      <TableHead>{t("detail.dueDate")}</TableHead>
                      <TableHead className="text-right">{t("detail.amount")}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {client.invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell>
                          <Badge className={invoiceStatusColors[invoice.status]}>
                            {t(`invoiceStatuses.${invoice.status.toLowerCase()}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(invoice.issueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          ${parseFloat(invoice.total).toLocaleString()}
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
