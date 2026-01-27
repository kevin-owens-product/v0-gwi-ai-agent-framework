/**
 * @prompt-id forge-v4.1:feature:email-template-management:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Mail,
  Loader2,
  Save,
  Eye,
  Send,
  History,
  Code,
  Lock,
  Trash2,
  RefreshCw,
  Plus,
  Variable,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import { TemplateEditor } from "@/components/admin/email-templates/TemplateEditor"
import { TemplatePreview } from "@/components/admin/email-templates/TemplatePreview"
import { VariableInserter } from "@/components/admin/email-templates/VariableInserter"
import { VersionHistory } from "@/components/admin/email-templates/VersionHistory"
import { toast } from "sonner"

interface TemplateVariable {
  name: string
  description: string
  required: boolean
  defaultValue?: string
}

interface TemplateVersion {
  id: string
  version: number
  subject: string
  htmlContent: string
  textContent: string | null
  changedBy: string | null
  changeNote: string | null
  createdAt: string
}

interface AuditLog {
  id: string
  action: string
  details: Record<string, unknown>
  timestamp: string
}

interface EmailTemplate {
  id: string
  name: string
  slug: string
  subject: string
  description: string | null
  category: string
  htmlContent: string
  textContent: string | null
  variables: TemplateVariable[]
  previewData: Record<string, string>
  isActive: boolean
  isSystem: boolean
  version: number
  lastEditedBy: string | null
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
  versions: TemplateVersion[]
  auditLogs: AuditLog[]
}

export default function EmailTemplateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const templateId = params.id as string

  const [template, setTemplate] = useState<EmailTemplate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [testDialogOpen, setTestDialogOpen] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [testData, setTestData] = useState<Record<string, string>>({})
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [activeTab, setActiveTab] = useState("editor")

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    subject: "",
    description: "",
    category: "",
    htmlContent: "",
    textContent: "",
    isActive: true,
    changeNote: "",
  })

  // Preview state
  const [previewData, setPreviewData] = useState<Record<string, string>>({})
  const [previewHtml, setPreviewHtml] = useState("")

  const fetchTemplate = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/email-templates/${templateId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch template")
      }
      const data = await response.json()
      setTemplate(data.template)
      setEditForm({
        name: data.template.name,
        subject: data.template.subject,
        description: data.template.description || "",
        category: data.template.category,
        htmlContent: data.template.htmlContent,
        textContent: data.template.textContent || "",
        isActive: data.template.isActive,
        changeNote: "",
      })
      setPreviewData(data.template.previewData || {})
      setTestData(data.template.previewData || {})
    } catch (error) {
      console.error("Failed to fetch template:", error)
    } finally {
      setIsLoading(false)
    }
  }, [templateId])

  useEffect(() => {
    fetchTemplate()
  }, [fetchTemplate])

  // Generate preview when content or preview data changes
  useEffect(() => {
    const generatePreview = async () => {
      if (!template) return

      try {
        const response = await fetch(`/api/admin/email-templates/${templateId}/preview`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: previewData }),
        })
        const data = await response.json()
        setPreviewHtml(data.html)
      } catch (error) {
        console.error("Failed to generate preview:", error)
      }
    }

    const timeoutId = setTimeout(generatePreview, 500)
    return () => clearTimeout(timeoutId)
  }, [template, templateId, previewData, editForm.htmlContent])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/email-templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          previewData,
        }),
      })

      if (response.ok) {
        fetchTemplate()
        setEditForm((prev) => ({ ...prev, changeNote: "" }))
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to save template")
      }
    } catch (error) {
      console.error("Failed to save template:", error)
      toast.error("Failed to save template")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/email-templates/${templateId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/admin/email-templates")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to delete template")
      }
    } catch (error) {
      console.error("Failed to delete template:", error)
      toast.error("Failed to delete template")
    }
  }

  const handleSendTest = async () => {
    if (!testEmail) {
      toast.error("Please enter an email address")
      return
    }

    setIsSendingTest(true)
    setTestResult(null)
    try {
      const response = await fetch(`/api/admin/email-templates/${templateId}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmail,
          data: testData,
        }),
      })

      const result = await response.json()
      setTestResult({
        success: result.success,
        message: result.success ? result.message : result.error,
      })
    } catch (error) {
      console.error("Failed to send test email:", error)
      setTestResult({
        success: false,
        message: "Failed to send test email",
      })
    } finally {
      setIsSendingTest(false)
    }
  }

  const handleInsertVariable = (variableName: string) => {
    const variable = `{{${variableName}}}`
    setEditForm((prev) => ({
      ...prev,
      htmlContent: prev.htmlContent + variable,
    }))
  }

  const handleRestoreVersion = async (version: TemplateVersion) => {
    setEditForm((prev) => ({
      ...prev,
      subject: version.subject,
      htmlContent: version.htmlContent,
      textContent: version.textContent || "",
      changeNote: `Restored from version ${version.version}`,
    }))
    setActiveTab("editor")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!template) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Template not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/email-templates">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{template.name}</h1>
              {template.isSystem && (
                <Badge variant="outline">
                  <Lock className="h-3 w-3 mr-1" />
                  System
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <code className="bg-muted px-2 py-0.5 rounded">{template.slug}</code>
              <span>-</span>
              <span>Version {template.version}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={template.isActive ? "default" : "secondary"}>
            {template.isActive ? "Active" : "Inactive"}
          </Badge>
          <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Send className="h-4 w-4 mr-2" />
                Send Test
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Test Email</DialogTitle>
                <DialogDescription>
                  Send a test email to verify the template renders correctly
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Recipient Email</Label>
                  <Input
                    type="email"
                    placeholder="test@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Test Data</Label>
                  <div className="space-y-2">
                    {template.variables.map((variable) => (
                      <div key={variable.name} className="flex items-center gap-2">
                        <Label className="w-32 text-sm font-mono">
                          {variable.name}
                          {variable.required && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                          value={testData[variable.name] || ""}
                          onChange={(e) =>
                            setTestData((prev) => ({
                              ...prev,
                              [variable.name]: e.target.value,
                            }))
                          }
                          placeholder={variable.defaultValue || variable.description}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                {testResult && (
                  <div
                    className={`p-3 rounded-lg ${
                      testResult.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                    }`}
                  >
                    {testResult.success ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        {testResult.message}
                      </div>
                    ) : (
                      testResult.message
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendTest} disabled={!testEmail || isSendingTest}>
                  {isSendingTest ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Test Email
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          {!template.isSystem && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Template</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this template? This action cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="editor">
            <Code className="h-4 w-4 mr-2" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="variables">
            <Variable className="h-4 w-4 mr-2" />
            Variables
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Editor Section */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Template Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Template Name</Label>
                      <Input
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={editForm.category}
                        onValueChange={(v) =>
                          setEditForm((prev) => ({ ...prev, category: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                          <SelectItem value="ONBOARDING">Onboarding</SelectItem>
                          <SelectItem value="NOTIFICATION">Notification</SelectItem>
                          <SelectItem value="MARKETING">Marketing</SelectItem>
                          <SelectItem value="TRANSACTIONAL">Transactional</SelectItem>
                          <SelectItem value="SYSTEM">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, description: e.target.value }))
                      }
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Subject Line</Label>
                    <Input
                      value={editForm.subject}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, subject: e.target.value }))
                      }
                    />
                  </div>

                  <TemplateEditor
                    value={editForm.htmlContent}
                    onChange={(value) =>
                      setEditForm((prev) => ({ ...prev, htmlContent: value }))
                    }
                    onInsertVariable={handleInsertVariable}
                    variables={template.variables}
                  />

                  <div className="space-y-2">
                    <Label>Plain Text Version (Optional)</Label>
                    <Textarea
                      value={editForm.textContent}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, textContent: e.target.value }))
                      }
                      rows={6}
                      className="font-mono text-sm"
                      placeholder="Plain text fallback for email clients that don't support HTML"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Change Note (for version history)</Label>
                    <Input
                      value={editForm.changeNote}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, changeNote: e.target.value }))
                      }
                      placeholder="Describe the changes made..."
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="space-y-0.5">
                      <Label>Active</Label>
                      <p className="text-xs text-muted-foreground">
                        Template can be used for sending emails
                      </p>
                    </div>
                    <Switch
                      checked={editForm.isActive}
                      onCheckedChange={(checked) =>
                        setEditForm((prev) => ({ ...prev, isActive: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <VariableInserter
                variables={template.variables}
                onInsert={handleInsertVariable}
                previewData={previewData}
                onPreviewDataChange={setPreviewData}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <TemplatePreview
            html={previewHtml}
            subject={editForm.subject}
            previewData={previewData}
            onPreviewDataChange={setPreviewData}
            variables={template.variables}
          />
        </TabsContent>

        <TabsContent value="variables">
          <Card>
            <CardHeader>
              <CardTitle>Template Variables</CardTitle>
              <CardDescription>
                Variables available in this template. Use {"{{variableName}}"} syntax in the
                content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Variable Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Default Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {template.variables.map((variable) => (
                    <TableRow key={variable.name}>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded">
                          {`{{${variable.name}}}`}
                        </code>
                      </TableCell>
                      <TableCell>{variable.description || "-"}</TableCell>
                      <TableCell>
                        {variable.required ? (
                          <Badge variant="default">Required</Badge>
                        ) : (
                          <Badge variant="secondary">Optional</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {variable.defaultValue ? (
                          <code className="text-sm">{variable.defaultValue}</code>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <VersionHistory
            versions={template.versions}
            currentVersion={template.version}
            onRestore={handleRestoreVersion}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
