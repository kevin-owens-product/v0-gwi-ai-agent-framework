"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
import {
  ArrowLeft,
  Megaphone,
  Save,
  Send,
  Calendar,
  Loader2,
  AlertCircle,
  Users,
  Building2,
  Crown,
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface BroadcastMessage {
  id: string
  title: string
  content: string
  contentHtml: string | null
  type: string
  priority: string
  status: string
  targetType: string
  targetOrgs: string[]
  targetPlans: string[]
  targetRoles: string[]
  channels: string[]
  expiresAt: string | null
}

export default function EditBroadcastMessagePage() {
  const t = useTranslations("admin.broadcast")
  const tCommon = useTranslations("common")

  const params = useParams()
  const router = useRouter()
  const messageId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    contentHtml: "",
    type: "ANNOUNCEMENT",
    priority: "NORMAL",
    targetType: "ALL",
    targetOrgs: [] as string[],
    targetPlans: [] as string[],
    channels: ["IN_APP"],
    expiresAt: "",
  })

  const messageTypes = [
    { value: "ANNOUNCEMENT", label: t("types.announcement"), description: t("typeDescriptions.announcement") },
    { value: "PRODUCT_UPDATE", label: t("types.productUpdate"), description: t("typeDescriptions.productUpdate") },
    { value: "MAINTENANCE", label: t("types.maintenance"), description: t("typeDescriptions.maintenance") },
    { value: "SECURITY_ALERT", label: t("types.securityAlert"), description: t("typeDescriptions.securityAlert") },
    { value: "MARKETING", label: t("types.marketing"), description: t("typeDescriptions.marketing") },
    { value: "SURVEY", label: t("types.survey"), description: t("typeDescriptions.survey") },
  ]

  const priorityOptions = [
    { value: "LOW", label: t("priority.low"), description: t("priorityDescriptions.low") },
    { value: "NORMAL", label: t("priority.normal"), description: t("priorityDescriptions.normal") },
    { value: "HIGH", label: t("priority.high"), description: t("priorityDescriptions.high") },
    { value: "URGENT", label: t("priority.urgent"), description: t("priorityDescriptions.urgent") },
  ]

  const targetOptions = [
    { value: "ALL", label: t("target.allUsers"), icon: Users, description: t("targetDescriptions.allUsers") },
    { value: "SPECIFIC_ORGS", label: t("target.specificOrgs"), icon: Building2, description: t("targetDescriptions.specificOrgs") },
    { value: "SPECIFIC_PLANS", label: t("target.specificPlans"), icon: Crown, description: t("targetDescriptions.specificPlans") },
  ]

  const channelOptions = [
    { value: "IN_APP", label: t("channels.inApp"), icon: Bell, description: t("channelDescriptions.inApp") },
    { value: "EMAIL", label: t("channels.email"), icon: Mail, description: t("channelDescriptions.email") },
    { value: "PUSH", label: t("channels.push"), icon: Smartphone, description: t("channelDescriptions.push") },
    { value: "SMS", label: t("channels.sms"), icon: MessageSquare, description: t("channelDescriptions.sms") },
    { value: "SLACK", label: t("channels.slack"), icon: MessageSquare, description: t("channelDescriptions.slack") },
  ]

  const planOptions = [
    { value: "STARTER", label: t("plans.starter") },
    { value: "PROFESSIONAL", label: t("plans.professional") },
    { value: "ENTERPRISE", label: t("plans.enterprise") },
  ]

  const fetchMessage = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/broadcast/messages/${messageId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch message")
      }
      const data = await response.json()
      const msg: BroadcastMessage = data.message

      // Only allow editing drafts
      if (msg.status !== "DRAFT") {
        toast.error(t("validation.onlyDraftsEditable"))
        router.push(`/admin/broadcast/messages/${messageId}`)
        return
      }

      setFormData({
        title: msg.title,
        content: msg.content,
        contentHtml: msg.contentHtml || "",
        type: msg.type,
        priority: msg.priority,
        targetType: msg.targetType,
        targetOrgs: msg.targetOrgs,
        targetPlans: msg.targetPlans,
        channels: msg.channels,
        expiresAt: msg.expiresAt ? new Date(msg.expiresAt).toISOString().slice(0, 16) : "",
      })
    } catch (error) {
      console.error("Failed to fetch message:", error)
      toast.error(t("toast.loadFailed"))
      router.push("/admin/broadcast/messages")
    } finally {
      setIsLoading(false)
    }
  }, [messageId, router, t])

  useEffect(() => {
    fetchMessage()
  }, [fetchMessage])

  const handleContentChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      content: value,
      contentHtml: value
        .split("\n")
        .map((line) => (line ? `<p>${line}</p>` : "<p><br></p>"))
        .join(""),
    }))
  }

  const toggleChannel = (channel: string) => {
    setFormData((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }))
  }

  const togglePlan = (plan: string) => {
    setFormData((prev) => ({
      ...prev,
      targetPlans: prev.targetPlans.includes(plan)
        ? prev.targetPlans.filter((p) => p !== plan)
        : [...prev.targetPlans, plan],
    }))
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError(t("validation.titleRequired"))
      return false
    }
    if (!formData.content.trim()) {
      setError(t("validation.contentRequired"))
      return false
    }
    if (formData.channels.length === 0) {
      setError(t("validation.channelRequired"))
      return false
    }
    if (formData.targetType === "SPECIFIC_PLANS" && formData.targetPlans.length === 0) {
      setError(t("validation.planRequired"))
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/broadcast/messages/${messageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          expiresAt: formData.expiresAt || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save changes")
      }

      toast.success(t("toast.messageUpdated"))
      router.push(`/admin/broadcast/messages/${messageId}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : t("toast.saveFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendNow = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    setError(null)

    try {
      // First save the changes
      const saveResponse = await fetch(`/api/admin/broadcast/messages/${messageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          expiresAt: formData.expiresAt || null,
        }),
      })

      if (!saveResponse.ok) {
        const data = await saveResponse.json()
        throw new Error(data.error || "Failed to save changes")
      }

      // Then send it
      const sendResponse = await fetch(`/api/admin/broadcast/messages/${messageId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })

      if (!sendResponse.ok) {
        const data = await sendResponse.json()
        throw new Error(data.error || "Failed to send message")
      }

      toast.success(t("toast.messageSent"))
      router.push("/admin/broadcast/messages")
    } catch (error) {
      setError(error instanceof Error ? error.message : t("toast.sendFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  const handleSchedule = async () => {
    if (!validateForm()) return
    if (!scheduledDate || !scheduledTime) {
      setError(t("validation.selectDateTime"))
      return
    }

    const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`)
    if (scheduledFor <= new Date()) {
      setError(t("validation.futureTime"))
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      // First save the changes
      const saveResponse = await fetch(`/api/admin/broadcast/messages/${messageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          expiresAt: formData.expiresAt || null,
        }),
      })

      if (!saveResponse.ok) {
        const data = await saveResponse.json()
        throw new Error(data.error || "Failed to save changes")
      }

      // Then schedule it
      const sendResponse = await fetch(`/api/admin/broadcast/messages/${messageId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledFor: scheduledFor.toISOString() }),
      })

      if (!sendResponse.ok) {
        const data = await sendResponse.json()
        throw new Error(data.error || "Failed to schedule message")
      }

      toast.success(t("toast.messageScheduled"))
      setScheduleDialogOpen(false)
      router.push("/admin/broadcast/messages")
    } catch (error) {
      setError(error instanceof Error ? error.message : t("toast.scheduleFailed"))
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/broadcast/messages/${messageId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon("back")}
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Megaphone className="h-6 w-6" />
              {t("editTitle")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("editDescription")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {t("actions.saveChanges")}
          </Button>
          <Button variant="outline" onClick={() => setScheduleDialogOpen(true)} disabled={isSaving}>
            <Calendar className="h-4 w-4 mr-2" />
            {t("actions.schedule")}
          </Button>
          <Button onClick={handleSendNow} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {t("actions.sendNow")}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList>
          <TabsTrigger value="content">{t("tabs.content")}</TabsTrigger>
          <TabsTrigger value="targeting">{t("tabs.targeting")}</TabsTrigger>
          <TabsTrigger value="delivery">{t("tabs.delivery")}</TabsTrigger>
          <TabsTrigger value="preview">{t("tabs.preview")}</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("content.title")}</CardTitle>
              <CardDescription>{t("content.editDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{t("form.messageType")}</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => setFormData((p) => ({ ...p, type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {messageTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <p>{type.label}</p>
                            <p className="text-xs text-muted-foreground">{type.description}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("form.priority")}</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(v) => setFormData((p) => ({ ...p, priority: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <p>{option.label}</p>
                            <p className="text-xs text-muted-foreground">{option.description}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("form.title")}</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  placeholder={t("form.titlePlaceholder")}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.title.length}/200
                </p>
              </div>

              <div className="space-y-2">
                <Label>{t("form.content")}</Label>
                <div className="border rounded-lg">
                  <div className="flex items-center gap-1 p-2 border-b bg-muted/50">
                    <Button variant="ghost" size="sm" type="button">
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" type="button">
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" type="button">
                      <List className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" type="button">
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" type="button">
                      <Link2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder={t("form.contentPlaceholder")}
                    rows={10}
                    className="border-0 rounded-none focus-visible:ring-0"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  {t("form.characters", { count: formData.content.length })}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{t("form.expiration")}</Label>
                <Input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData((p) => ({ ...p, expiresAt: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  {t("form.expirationHint")}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Targeting Tab */}
        <TabsContent value="targeting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("targeting.title")}</CardTitle>
              <CardDescription>{t("targeting.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {targetOptions.map((option) => {
                  const Icon = option.icon
                  const isSelected = formData.targetType === option.value
                  return (
                    <div
                      key={option.value}
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                        isSelected ? "border-primary bg-primary/5" : "hover:border-primary/50"
                      }`}
                      onClick={() => setFormData((p) => ({ ...p, targetType: option.value }))}
                    >
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border-2 ${
                          isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                        }`}
                      >
                        {isSelected && (
                          <div className="h-full w-full flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {formData.targetType === "SPECIFIC_PLANS" && (
                <div className="space-y-4 pt-4 border-t">
                  <Label>{t("targeting.selectPlanTiers")}</Label>
                  <div className="flex flex-wrap gap-4">
                    {planOptions.map((plan) => (
                      <div key={plan.value} className="flex items-center gap-2">
                        <Checkbox
                          id={`edit-${plan.value}`}
                          checked={formData.targetPlans.includes(plan.value)}
                          onCheckedChange={() => togglePlan(plan.value)}
                        />
                        <label htmlFor={`edit-${plan.value}`} className="text-sm font-medium cursor-pointer">
                          {plan.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.targetType === "SPECIFIC_ORGS" && (
                <div className="space-y-4 pt-4 border-t">
                  <Label>{t("targeting.organizationIds")}</Label>
                  <Textarea
                    placeholder={t("targeting.organizationIdsPlaceholder")}
                    value={formData.targetOrgs.join("\n")}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        targetOrgs: e.target.value.split("\n").filter((id) => id.trim()),
                      }))
                    }
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("targeting.organizationIdsHint")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Tab */}
        <TabsContent value="delivery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("delivery.title")}</CardTitle>
              <CardDescription>{t("delivery.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {channelOptions.map((channel) => {
                const Icon = channel.icon
                const isSelected = formData.channels.includes(channel.value)
                return (
                  <div
                    key={channel.value}
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                      isSelected ? "border-primary bg-primary/5" : "hover:border-primary/50"
                    }`}
                    onClick={() => toggleChannel(channel.value)}
                  >
                    <Checkbox checked={isSelected} />
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{channel.label}</p>
                      <p className="text-sm text-muted-foreground">{channel.description}</p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("preview.title")}</CardTitle>
              <CardDescription>{t("preview.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6">
                <div className="max-w-lg mx-auto bg-background rounded-lg shadow-lg border">
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Megaphone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <Badge variant="outline" className="mb-1">
                          {formData.type.replace("_", " ")}
                        </Badge>
                        <h3 className="font-semibold">
                          {formData.title || t("preview.messageTitlePlaceholder")}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm whitespace-pre-wrap">
                      {formData.content || t("preview.contentPlaceholder")}
                    </p>
                  </div>
                  <div className="px-4 pb-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("preview.justNow")}</span>
                    <div className="flex gap-2">
                      {formData.channels.map((channel) => {
                        const Icon = channelOptions.find((c) => c.value === channel)?.icon || Bell
                        return (
                          <div key={channel} className="flex items-center gap-1">
                            <Icon className="h-3 w-3" />
                            {channel.replace("_", " ")}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground">{t("table.type")}</p>
                  <p className="font-medium">{formData.type.replace("_", " ")}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground">{t("table.priority")}</p>
                  <p className="font-medium">{formData.priority}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground">{t("table.target")}</p>
                  <p className="font-medium">{formData.targetType.replace(/_/g, " ")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("scheduleDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("scheduleDialog.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t("scheduleDialog.date")}</Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("scheduleDialog.time")}</Label>
              <Input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button onClick={handleSchedule} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("scheduleDialog.scheduling")}
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  {t("actions.schedule")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
