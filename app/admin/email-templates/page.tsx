/**
 * @prompt-id forge-v4.1:feature:email-template-management:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Mail,
  Plus,
  Loader2,
  RefreshCw,
  Search,
  Lock,
  CheckCircle,
  XCircle,
  FileText,
  ShieldCheck,
  Bell,
  Megaphone,
  CreditCard,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { showErrorToast } from "@/lib/toast-utils"

interface EmailTemplate {
  id: string
  name: string
  slug: string
  subject: string
  description: string | null
  category: string
  isActive: boolean
  isSystem: boolean
  version: number
  lastEditedBy: string | null
  createdAt: string
  updatedAt: string
  _count: {
    versions: number
  }
}

interface GroupedTemplates {
  category: string
  templates: EmailTemplate[]
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  AUTHENTICATION: <ShieldCheck className="h-4 w-4" />,
  ONBOARDING: <FileText className="h-4 w-4" />,
  NOTIFICATION: <Bell className="h-4 w-4" />,
  MARKETING: <Megaphone className="h-4 w-4" />,
  TRANSACTIONAL: <CreditCard className="h-4 w-4" />,
  SYSTEM: <Settings className="h-4 w-4" />,
}

export default function EmailTemplatesPage() {
  const t = useTranslations("admin.emailTemplates")
  const tCommon = useTranslations("common")
  const [, setTemplates] = useState<EmailTemplate[]>([])
  const [grouped, setGrouped] = useState<GroupedTemplates[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  // Helper function to get category name
  const getCategoryName = (category: string): string => {
    const categoryLower = category.toLowerCase()
    const key = `categories.${categoryLower}`
    const translated = (t as any)(key)
    // If translation returns the key path (missing translation), return the category
    return translated === key ? category : translated
  }

  // Helper function to get category description
  const getCategoryDescription = (category: string): string => {
    const categoryLower = category.toLowerCase()
    const key = `categoryDescriptions.${categoryLower}`
    const translated = (t as any)(key)
    // If translation returns the key path (missing translation), return empty string
    return translated === key ? "" : translated
  }

  // Form state for new template
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    subject: "",
    description: "",
    category: "NOTIFICATION",
    htmlContent: "",
    textContent: "",
    isActive: true,
  })

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set("search", searchQuery)
      if (categoryFilter !== "all") params.set("category", categoryFilter)

      const response = await fetch(`/api/admin/email-templates?${params}`)
      const data = await response.json()
      setTemplates(data.templates || [])
      setGrouped(data.grouped || [])
    } catch (error) {
      console.error("Failed to fetch email templates:", error)
      setTemplates([])
      setGrouped([])
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, categoryFilter])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      subject: "",
      description: "",
      category: "NOTIFICATION",
      htmlContent: "",
      textContent: "",
      isActive: true,
    })
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
  }

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/admin/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setDialogOpen(false)
        resetForm()
        fetchTemplates()
      } else {
        const error = await response.json()
        showErrorToast(error.error || t("toast.createFailed"))
      }
    } catch (error) {
      console.error("Failed to create template:", error)
      showErrorToast(t("toast.createFailed"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = async (template: EmailTemplate) => {
    try {
      await fetch(`/api/admin/email-templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !template.isActive }),
      })
      fetchTemplates()
    } catch (error) {
      console.error("Failed to toggle template status:", error)
    }
  }

  // Filter templates for display
  const displayedGrouped = grouped.filter((group) => {
    if (categoryFilter !== "all" && group.category !== categoryFilter) {
      return false
    }
    return group.templates.length > 0
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                {t("title")}
              </CardTitle>
              <CardDescription>
                {t("description")}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchTemplates} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                {tCommon("refresh")}
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => resetForm()}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("newTemplate")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t("createTemplate")}</DialogTitle>
                    <DialogDescription>
                      {t("createTemplateDescription")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("form.templateName")}</Label>
                        <Input
                          placeholder={t("form.templateNamePlaceholder")}
                          value={formData.name}
                          onChange={(e) => handleNameChange(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("form.slug")}</Label>
                        <Input
                          placeholder={t("form.slugPlaceholder")}
                          value={formData.slug}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, slug: e.target.value }))
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          {t("form.slugDescription")}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("form.category")}</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(v) =>
                            setFormData((prev) => ({ ...prev, category: v }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AUTHENTICATION">{t("categories.authentication")}</SelectItem>
                            <SelectItem value="ONBOARDING">{t("categories.onboarding")}</SelectItem>
                            <SelectItem value="NOTIFICATION">{t("categories.notification")}</SelectItem>
                            <SelectItem value="MARKETING">{t("categories.marketing")}</SelectItem>
                            <SelectItem value="TRANSACTIONAL">{t("categories.transactional")}</SelectItem>
                            <SelectItem value="SYSTEM">{t("categories.system")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("form.subjectLine")}</Label>
                        <Input
                          placeholder={t("form.subjectLinePlaceholder")}
                          value={formData.subject}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, subject: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{tCommon("description")}</Label>
                      <Textarea
                        placeholder={t("form.descriptionPlaceholder")}
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, description: e.target.value }))
                        }
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("form.htmlContent")}</Label>
                      <Textarea
                        placeholder={t("form.htmlContentPlaceholder")}
                        value={formData.htmlContent}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, htmlContent: e.target.value }))
                        }
                        rows={8}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        {t("form.variableHint")}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("form.plainTextContent")}</Label>
                      <Textarea
                        placeholder={t("form.plainTextPlaceholder")}
                        value={formData.textContent}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, textContent: e.target.value }))
                        }
                        rows={4}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{tCommon("active")}</Label>
                        <p className="text-xs text-muted-foreground">
                          {t("form.activeDescription")}
                        </p>
                      </div>
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, isActive: checked }))
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      {tCommon("cancel")}
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={
                        !formData.name ||
                        !formData.slug ||
                        !formData.subject ||
                        !formData.htmlContent ||
                        isSubmitting
                      }
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {tCommon("creating")}
                        </>
                      ) : (
                        t("createTemplate")
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("filters.allCategories")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allCategories")}</SelectItem>
                <SelectItem value="AUTHENTICATION">{t("categories.authentication")}</SelectItem>
                <SelectItem value="ONBOARDING">{t("categories.onboarding")}</SelectItem>
                <SelectItem value="NOTIFICATION">{t("categories.notification")}</SelectItem>
                <SelectItem value="MARKETING">{t("categories.marketing")}</SelectItem>
                <SelectItem value="TRANSACTIONAL">{t("categories.transactional")}</SelectItem>
                <SelectItem value="SYSTEM">{t("categories.system")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Templates by Category */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : displayedGrouped.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t("noTemplatesFound")}
            </div>
          ) : (
            <Accordion type="multiple" defaultValue={displayedGrouped.map((g) => g.category)}>
              {displayedGrouped.map((group) => (
                <AccordionItem key={group.category} value={group.category}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        {CATEGORY_ICONS[group.category]}
                      </div>
                      <div className="text-left">
                        <p className="font-medium">
                          {getCategoryName(group.category)}
                        </p>
                        <p className="text-xs text-muted-foreground font-normal">
                          {getCategoryDescription(group.category)}
                        </p>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {group.templates.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-2">
                      {group.templates.map((template) => (
                        <div
                          key={template.id}
                          className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Mail className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/admin/email-templates/${template.id}`}
                                  className="font-medium hover:underline"
                                >
                                  {template.name}
                                </Link>
                                {template.isSystem && (
                                  <Badge variant="outline" className="text-xs">
                                    <Lock className="h-3 w-3 mr-1" />
                                    {t("system")}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <code className="text-xs bg-muted px-1 rounded">
                                  {template.slug}
                                </code>
                                <span>-</span>
                                <span>v{template.version}</span>
                                {template._count.versions > 1 && (
                                  <>
                                    <span>-</span>
                                    <span>{t("versions", { count: template._count.versions })}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {template.isActive ? (
                                <Badge variant="default" className="bg-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {tCommon("active")}
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  {tCommon("inactive")}
                                </Badge>
                              )}
                            </div>
                            <Switch
                              checked={template.isActive}
                              onCheckedChange={() => handleToggleActive(template)}
                            />
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/admin/email-templates/${template.id}`}>
                                {tCommon("edit")}
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
