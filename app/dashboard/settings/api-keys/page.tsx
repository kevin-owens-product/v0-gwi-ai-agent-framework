"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Copy, Trash2, Key, Loader2, Check, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { PageTracker } from "@/components/tracking/PageTracker"

interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  key?: string // Only present on creation
  permissions: string[]
  rateLimit: number
  lastUsed: string | null
  expiresAt: string | null
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
}

export default function ApiKeysSettingsPage() {
  const t = useTranslations("settings.apiKeys")
  const tCommon = useTranslations("common")
  const tToast = useTranslations("toast")
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)
  const [deleteKey, setDeleteKey] = useState<ApiKey | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/v1/api-keys')
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data.apiKeys || [])
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error)
      toast.error(t("errors.loadFailed"))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const handleCreate = async () => {
    if (!newKeyName) return

    setIsCreating(true)
    try {
      const response = await fetch('/api/v1/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("errors.createFailed"))
      }

      const data = await response.json()
      setNewlyCreatedKey(data.apiKey.key)
      setNewKeyName("")
      fetchApiKeys()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.createFailed"))
      setDialogOpen(false)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteKey) return

    try {
      const response = await fetch(`/api/v1/api-keys?id=${deleteKey.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("errors.deleteFailed"))
      }

      toast.success(t("keyDeleted"))
      setDeleteKey(null)
      fetchApiKeys()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.deleteFailed"))
    }
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success(tToast("success.copied"))
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t("never")
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return t("never")
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return t("relativeTime.justNow")
    if (diffMins < 60) return t("relativeTime.minAgo", { count: diffMins })
    if (diffHours < 24) return t("relativeTime.hoursAgo", { count: diffHours })
    return t("relativeTime.daysAgo", { count: diffDays })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl">
      <PageTracker pageName="Settings - API Keys" metadata={{ totalKeys: apiKeys.length }} />
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("yourApiKeys")}</CardTitle>
                <CardDescription>{t("yourApiKeysDescription")}</CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open)
                if (!open) {
                  setNewlyCreatedKey(null)
                  setNewKeyName("")
                }
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("createKey")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  {newlyCreatedKey ? (
                    <>
                      <DialogHeader>
                        <DialogTitle>{t("keyCreated")}</DialogTitle>
                        <DialogDescription>
                          {t("copyKeyNow")}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                          <code className="text-sm flex-1 break-all">{newlyCreatedKey}</code>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(newlyCreatedKey)}
                          >
                            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                        <div className="flex items-start gap-2 text-amber-500 bg-amber-500/10 p-3 rounded-lg">
                          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <p className="text-sm">
                            {t("securityWarning")}
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={() => setDialogOpen(false)}>{t("done")}</Button>
                      </DialogFooter>
                    </>
                  ) : (
                    <>
                      <DialogHeader>
                        <DialogTitle>{t("createNewKey")}</DialogTitle>
                        <DialogDescription>
                          {t("createNewKeyDescription")}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="key-name">{t("keyName")}</Label>
                          <Input
                            id="key-name"
                            placeholder={t("keyNamePlaceholder")}
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleCreate} disabled={isCreating || !newKeyName}>
                          {isCreating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t("creating")}
                            </>
                          ) : (
                            <>
                              <Key className="mr-2 h-4 w-4" />
                              {t("createKey")}
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("noKeysYet")}</p>
                <p className="text-sm">{t("createFirstKey")}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tCommon("name")}</TableHead>
                    <TableHead>{t("key")}</TableHead>
                    <TableHead>{t("lastUsed")}</TableHead>
                    <TableHead>{t("created")}</TableHead>
                    <TableHead>{tCommon("status")}</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey) => {
                    const isExpired = apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()
                    return (
                      <TableRow key={apiKey.id}>
                        <TableCell className="font-medium">{apiKey.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {apiKey.keyPrefix}...
                            </code>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatRelativeTime(apiKey.lastUsed)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(apiKey.createdAt)}
                        </TableCell>
                        <TableCell>
                          {isExpired ? (
                            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                              {t("status.expired")}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                              {t("status.active")}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => setDeleteKey(apiKey)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("documentation.title")}</CardTitle>
            <CardDescription>{t("documentation.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-mono mb-2">{t("documentation.exampleRequest")}:</p>
              <pre className="text-sm overflow-x-auto">
                {`curl -X POST ${typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/agents \\
  -H "Authorization: Bearer gwi_sk_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "My Agent", "type": "RESEARCH"}'`}
              </pre>
            </div>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>{t("documentation.availableEndpoints")}:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><code className="bg-muted px-1 rounded">GET /api/v1/agents</code> - {t("documentation.endpoints.listAgents")}</li>
                <li><code className="bg-muted px-1 rounded">POST /api/v1/agents</code> - {t("documentation.endpoints.createAgent")}</li>
                <li><code className="bg-muted px-1 rounded">POST /api/v1/agents/:id/run</code> - {t("documentation.endpoints.runAgent")}</li>
                <li><code className="bg-muted px-1 rounded">GET /api/v1/insights</code> - {t("documentation.endpoints.listInsights")}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteKey} onOpenChange={() => setDeleteKey(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteKey")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteKeyConfirmation", { name: deleteKey?.name ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {t("deleteKey")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
