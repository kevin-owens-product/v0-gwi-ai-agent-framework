"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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

const messageTypes = [
  { value: "ANNOUNCEMENT", label: "Announcement", description: "General platform announcements" },
  { value: "PRODUCT_UPDATE", label: "Product Update", description: "New features and improvements" },
  { value: "MAINTENANCE", label: "Maintenance", description: "Scheduled maintenance notices" },
  { value: "SECURITY_ALERT", label: "Security Alert", description: "Security-related notifications" },
  { value: "MARKETING", label: "Marketing", description: "Promotional content" },
  { value: "SURVEY", label: "Survey", description: "User feedback requests" },
]

const priorityOptions = [
  { value: "LOW", label: "Low", description: "Non-urgent, informational" },
  { value: "NORMAL", label: "Normal", description: "Standard priority" },
  { value: "HIGH", label: "High", description: "Important, time-sensitive" },
  { value: "URGENT", label: "Urgent", description: "Critical, immediate attention required" },
]

const targetOptions = [
  { value: "ALL", label: "All Users", icon: Users, description: "Send to all active users" },
  { value: "SPECIFIC_ORGS", label: "Specific Organizations", icon: Building2, description: "Target specific organizations" },
  { value: "SPECIFIC_PLANS", label: "Specific Plans", icon: Crown, description: "Target users on specific plans" },
]

const channelOptions = [
  { value: "IN_APP", label: "In-App", icon: Bell, description: "Show in the application" },
  { value: "EMAIL", label: "Email", icon: Mail, description: "Send via email" },
  { value: "PUSH", label: "Push", icon: Smartphone, description: "Send push notification" },
  { value: "SMS", label: "SMS", icon: MessageSquare, description: "Send SMS message" },
  { value: "SLACK", label: "Slack", icon: MessageSquare, description: "Post to Slack" },
]

const planOptions = [
  { value: "STARTER", label: "Starter" },
  { value: "PROFESSIONAL", label: "Professional" },
  { value: "ENTERPRISE", label: "Enterprise" },
]

export default function NewBroadcastMessagePage() {
  const router = useRouter()
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

  const handleContentChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      content: value,
      // Convert plain text to simple HTML
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
      setError("Title is required")
      return false
    }
    if (!formData.content.trim()) {
      setError("Content is required")
      return false
    }
    if (formData.channels.length === 0) {
      setError("At least one channel is required")
      return false
    }
    if (formData.targetType === "SPECIFIC_PLANS" && formData.targetPlans.length === 0) {
      setError("Please select at least one plan tier")
      return false
    }
    return true
  }

  const handleSaveDraft = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/broadcast/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save draft")
      }

      const data = await response.json()
      toast.success("Broadcast message saved as draft")
      router.push(`/admin/broadcast/messages/${data.message.id}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save draft")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendNow = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    setError(null)

    try {
      // First create the message
      const createResponse = await fetch("/api/admin/broadcast/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!createResponse.ok) {
        const data = await createResponse.json()
        throw new Error(data.error || "Failed to create message")
      }

      const { message } = await createResponse.json()

      // Then send it
      const sendResponse = await fetch(`/api/admin/broadcast/messages/${message.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })

      if (!sendResponse.ok) {
        const data = await sendResponse.json()
        throw new Error(data.error || "Failed to send message")
      }

      toast.success("Broadcast message sent successfully")
      router.push("/admin/broadcast/messages")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to send message")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSchedule = async () => {
    if (!validateForm()) return
    if (!scheduledDate || !scheduledTime) {
      setError("Please select a date and time")
      return
    }

    const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`)
    if (scheduledFor <= new Date()) {
      setError("Scheduled time must be in the future")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      // First create the message
      const createResponse = await fetch("/api/admin/broadcast/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!createResponse.ok) {
        const data = await createResponse.json()
        throw new Error(data.error || "Failed to create message")
      }

      const { message } = await createResponse.json()

      // Then schedule it
      const sendResponse = await fetch(`/api/admin/broadcast/messages/${message.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledFor: scheduledFor.toISOString() }),
      })

      if (!sendResponse.ok) {
        const data = await sendResponse.json()
        throw new Error(data.error || "Failed to schedule message")
      }

      toast.success("Broadcast message scheduled")
      setScheduleDialogOpen(false)
      router.push("/admin/broadcast/messages")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to schedule message")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/broadcast/messages">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Megaphone className="h-6 w-6" />
              New Broadcast Message
            </h1>
            <p className="text-sm text-muted-foreground">
              Create a new broadcast message to send to your users
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Draft
          </Button>
          <Button variant="outline" onClick={() => setScheduleDialogOpen(true)} disabled={isSaving}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
          <Button onClick={handleSendNow} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send Now
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
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="targeting">Targeting</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Message Content</CardTitle>
              <CardDescription>Compose your broadcast message</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Message Type</Label>
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
                  <Label>Priority</Label>
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
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Enter a clear, concise title..."
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.title.length}/200
                </p>
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <div className="border rounded-lg">
                  {/* Simple formatting toolbar */}
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
                    placeholder="Write your message content..."
                    rows={10}
                    className="border-0 rounded-none focus-visible:ring-0"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  {formData.content.length} characters
                </p>
              </div>

              <div className="space-y-2">
                <Label>Expiration (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData((p) => ({ ...p, expiresAt: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  The message will no longer be displayed after this date
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Targeting Tab */}
        <TabsContent value="targeting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Target Audience</CardTitle>
              <CardDescription>Choose who will receive this broadcast</CardDescription>
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
                  <Label>Select Plan Tiers</Label>
                  <div className="flex flex-wrap gap-4">
                    {planOptions.map((plan) => (
                      <div key={plan.value} className="flex items-center gap-2">
                        <Checkbox
                          id={plan.value}
                          checked={formData.targetPlans.includes(plan.value)}
                          onCheckedChange={() => togglePlan(plan.value)}
                        />
                        <label htmlFor={plan.value} className="text-sm font-medium cursor-pointer">
                          {plan.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.targetType === "SPECIFIC_ORGS" && (
                <div className="space-y-4 pt-4 border-t">
                  <Label>Organization IDs</Label>
                  <Textarea
                    placeholder="Enter organization IDs, one per line..."
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
                    Enter one organization ID per line
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
              <CardTitle>Delivery Channels</CardTitle>
              <CardDescription>Select how this message will be delivered</CardDescription>
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
              <CardTitle>Message Preview</CardTitle>
              <CardDescription>Preview how your message will appear</CardDescription>
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
                          {formData.title || "Message Title"}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm whitespace-pre-wrap">
                      {formData.content || "Your message content will appear here..."}
                    </p>
                  </div>
                  <div className="px-4 pb-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Just now</span>
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
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium">{formData.type.replace("_", " ")}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground">Priority</p>
                  <p className="font-medium">{formData.priority}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground">Target</p>
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
            <DialogTitle>Schedule Broadcast</DialogTitle>
            <DialogDescription>
              Choose when this message should be sent
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSchedule} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
