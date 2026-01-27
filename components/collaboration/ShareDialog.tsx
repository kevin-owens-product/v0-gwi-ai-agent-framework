"use client"

import { useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Share2,
  Link2,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Eye,
  Lock,
  Clock,
  Users,
  Settings,
} from 'lucide-react'
import { useSharedLinks, type SharedLink, type SharedLinkPermission } from '@/hooks/use-shared-links'
import { SharedLinkSettings } from './SharedLinkSettings'
import { formatDistanceToNow } from 'date-fns'

interface ShareDialogProps {
  entityType: string
  entityId: string
  entityName?: string
  trigger?: React.ReactNode
  className?: string
}

interface LinkCardProps {
  link: SharedLink
  onCopy: (url: string) => void
  onDelete: (id: string) => void
  onEdit: (link: SharedLink) => void
}

function LinkCard({ link, onCopy, onDelete, onEdit }: LinkCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    onCopy(link.shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date()
  const isMaxedOut = link.maxViews && link.viewCount >= link.maxViews

  return (
    <div className={cn(
      'rounded-lg border p-4 space-y-3',
      (!link.isActive || isExpired || isMaxedOut) && 'bg-muted/50 opacity-75'
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={link.isActive ? 'default' : 'secondary'}>
              {link.permissions}
            </Badge>
            {!link.isActive && (
              <Badge variant="destructive">Revoked</Badge>
            )}
            {isExpired && (
              <Badge variant="secondary">Expired</Badge>
            )}
            {isMaxedOut && (
              <Badge variant="secondary">Max views reached</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate font-mono">
            {link.shareUrl}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => window.open(link.shareUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {link.viewCount} {link.viewCount === 1 ? 'view' : 'views'}
          {link.maxViews && ` / ${link.maxViews} max`}
        </span>
        {link.hasPassword && (
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Password protected
          </span>
        )}
        {link.expiresAt && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {isExpired
              ? 'Expired'
              : `Expires ${formatDistanceToNow(new Date(link.expiresAt), { addSuffix: true })}`
            }
          </span>
        )}
        {link.allowedEmails.length > 0 && (
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {link.allowedEmails.length} allowed
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t">
        <span className="text-xs text-muted-foreground">
          Created {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
        </span>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => onEdit(link)}
        >
          <Settings className="h-3 w-3 mr-1" />
          Settings
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-destructive hover:text-destructive"
          onClick={() => onDelete(link.id)}
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  )
}

export function ShareDialog({
  entityType,
  entityId,
  entityName,
  trigger,
  className,
}: ShareDialogProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create')
  const [copied, setCopied] = useState(false)
  const [editingLink, setEditingLink] = useState<SharedLink | null>(null)

  const {
    sharedLinks,
    isLoading,
    error,
    fetchSharedLinks,
    createSharedLink,
    updateSharedLink,
    deleteSharedLink,
  } = useSharedLinks()

  useEffect(() => {
    if (open) {
      fetchSharedLinks({ entityType, entityId })
    }
  }, [open, fetchSharedLinks, entityType, entityId])

  const handleCreateLink = useCallback(async (settings: {
    password?: string | null
    expiresAt?: string | null
    maxViews?: number | null
    allowedEmails?: string[]
    permissions?: SharedLinkPermission
    isActive?: boolean
  }) => {
    // Filter out null values to match CreateSharedLinkInput type
    const link = await createSharedLink({
      entityType,
      entityId,
      password: settings.password ?? undefined,
      expiresAt: settings.expiresAt ?? undefined,
      maxViews: settings.maxViews ?? undefined,
      allowedEmails: settings.allowedEmails,
      permissions: settings.permissions,
    })

    // Copy to clipboard
    await navigator.clipboard.writeText(link.shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    // Switch to manage tab
    setActiveTab('manage')
  }, [createSharedLink, entityType, entityId])

  const handleUpdateLink = useCallback(async (settings: {
    password?: string | null
    expiresAt?: string | null
    maxViews?: number | null
    allowedEmails?: string[]
    permissions?: SharedLinkPermission
    isActive?: boolean
  }) => {
    if (!editingLink) return
    await updateSharedLink(editingLink.id, settings)
    setEditingLink(null)
  }, [editingLink, updateSharedLink])

  const handleCopyLink = useCallback(async (url: string) => {
    await navigator.clipboard.writeText(url)
  }, [])

  const handleDeleteLink = useCallback(async (id: string) => {
    await deleteSharedLink(id)
  }, [deleteSharedLink])

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Share2 className="h-4 w-4 mr-2" />
      Share
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className={cn('sm:max-w-lg', className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share {entityName || entityType}
          </DialogTitle>
          <DialogDescription>
            Create a shareable link to give others access to this content.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={editingLink ? 'edit' : activeTab} onValueChange={(v) => {
          if (v !== 'edit') {
            setEditingLink(null)
            setActiveTab(v as 'create' | 'manage')
          }
        }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">
              <Link2 className="h-4 w-4 mr-2" />
              Create Link
            </TabsTrigger>
            <TabsTrigger value="manage">
              <Settings className="h-4 w-4 mr-2" />
              Manage ({sharedLinks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-4">
            <SharedLinkSettings
              onSave={handleCreateLink}
              onCancel={() => setOpen(false)}
              isSaving={isLoading}
            />
            {copied && (
              <div className="flex items-center gap-2 mt-4 p-3 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                <Check className="h-4 w-4" />
                <span className="text-sm">Link created and copied to clipboard!</span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="manage" className="mt-4">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                <p className="text-sm">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => fetchSharedLinks({ entityType, entityId })}
                >
                  Retry
                </Button>
              </div>
            ) : sharedLinks.length === 0 ? (
              <div className="text-center py-8">
                <Link2 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No shared links yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setActiveTab('create')}
                >
                  Create your first link
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {sharedLinks.map((link) => (
                  <LinkCard
                    key={link.id}
                    link={link}
                    onCopy={handleCopyLink}
                    onDelete={handleDeleteLink}
                    onEdit={setEditingLink}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {editingLink && (
            <TabsContent value="edit" className="mt-4">
              <div className="mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingLink(null)}
                >
                  Back to all links
                </Button>
              </div>
              <SharedLinkSettings
                initialValues={{
                  password: '',
                  expiresAt: editingLink.expiresAt || undefined,
                  maxViews: editingLink.maxViews || undefined,
                  allowedEmails: editingLink.allowedEmails,
                  permissions: editingLink.permissions,
                }}
                hasExistingPassword={editingLink.hasPassword}
                onSave={handleUpdateLink}
                onCancel={() => setEditingLink(null)}
                isSaving={isLoading}
                isEditing
              />
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
