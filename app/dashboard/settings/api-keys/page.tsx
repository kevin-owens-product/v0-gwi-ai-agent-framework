"use client"

import { useState, useEffect } from "react"
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
      toast.error('Failed to load API keys')
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
        throw new Error(data.error || 'Failed to create API key')
      }

      const data = await response.json()
      setNewlyCreatedKey(data.apiKey.key)
      setNewKeyName("")
      fetchApiKeys()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create API key')
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
        throw new Error(data.error || 'Failed to delete API key')
      }

      toast.success('API key deleted')
      setDeleteKey(null)
      fetchApiKeys()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete API key')
    }
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold">API Keys</h1>
        <p className="text-muted-foreground">Manage API keys for programmatic access</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your API Keys</CardTitle>
                <CardDescription>Use these keys to authenticate API requests</CardDescription>
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
                    Create Key
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  {newlyCreatedKey ? (
                    <>
                      <DialogHeader>
                        <DialogTitle>API Key Created</DialogTitle>
                        <DialogDescription>
                          Copy this key now. You won't be able to see it again!
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
                            Make sure to copy your API key now. For security reasons, we won't show it again.
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={() => setDialogOpen(false)}>Done</Button>
                      </DialogFooter>
                    </>
                  ) : (
                    <>
                      <DialogHeader>
                        <DialogTitle>Create New API Key</DialogTitle>
                        <DialogDescription>
                          Give your key a name to help you remember what it's for
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="key-name">Key Name</Label>
                          <Input
                            id="key-name"
                            placeholder="e.g., Production API Key"
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
                              Creating...
                            </>
                          ) : (
                            <>
                              <Key className="mr-2 h-4 w-4" />
                              Create Key
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
                <p>No API keys yet</p>
                <p className="text-sm">Create your first API key to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
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
                              Expired
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                              Active
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
            <CardTitle>API Documentation</CardTitle>
            <CardDescription>Learn how to use the GWI Agents API</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-mono mb-2">Example Request:</p>
              <pre className="text-sm overflow-x-auto">
                {`curl -X POST ${typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/agents \\
  -H "Authorization: Bearer gwi_sk_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "My Agent", "type": "RESEARCH"}'`}
              </pre>
            </div>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>Available endpoints:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><code className="bg-muted px-1 rounded">GET /api/v1/agents</code> - List agents</li>
                <li><code className="bg-muted px-1 rounded">POST /api/v1/agents</code> - Create agent</li>
                <li><code className="bg-muted px-1 rounded">POST /api/v1/agents/:id/run</code> - Run agent</li>
                <li><code className="bg-muted px-1 rounded">GET /api/v1/insights</code> - List insights</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteKey} onOpenChange={() => setDeleteKey(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteKey?.name}"? Any applications using this key will no longer be able to authenticate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
