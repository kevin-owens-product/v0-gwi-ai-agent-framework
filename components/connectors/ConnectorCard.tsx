/**
 * @prompt-id forge-v4.1:feature:data-connectors:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  MoreHorizontal,
  Play,
  Pause,
  RefreshCw,
  Settings,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
  Plug,
} from 'lucide-react'
import Link from 'next/link'
import type { Connector } from '@/hooks/use-connectors'
import type { DataSyncStatus } from '@prisma/client'
import { formatDistanceToNow } from 'date-fns'

interface ConnectorCardProps {
  connector: Connector
  onSync?: (id: string) => Promise<void>
  onToggle?: (id: string, isActive: boolean) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  onTest?: (id: string) => Promise<void>
}

const STATUS_CONFIG: Record<DataSyncStatus | 'NEVER', {
  icon: React.ComponentType<{ className?: string }>
  labelKey: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  className: string
}> = {
  COMPLETED: {
    icon: CheckCircle2,
    labelKey: 'synced',
    variant: 'outline',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  RUNNING: {
    icon: Loader2,
    labelKey: 'syncing',
    variant: 'outline',
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  PENDING: {
    icon: Clock,
    labelKey: 'pending',
    variant: 'outline',
    className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  },
  FAILED: {
    icon: XCircle,
    labelKey: 'failed',
    variant: 'destructive',
    className: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
  CANCELLED: {
    icon: AlertTriangle,
    labelKey: 'cancelled',
    variant: 'outline',
    className: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  },
  NEVER: {
    icon: Clock,
    labelKey: 'neverSynced',
    variant: 'secondary',
    className: '',
  },
}

export function ConnectorCard({
  connector,
  onSync,
  onToggle,
  onDelete,
  onTest,
}: ConnectorCardProps) {
  const t = useTranslations('connectors')
  const tCommon = useTranslations('common')
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  const status = connector.lastSyncStatus || 'NEVER'
  const statusConfig = STATUS_CONFIG[status]
  const StatusIcon = statusConfig.icon

  const handleSync = async () => {
    if (!onSync) return
    setIsSyncing(true)
    try {
      await onSync(connector.id)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleToggle = async () => {
    if (!onToggle) return
    setIsToggling(true)
    try {
      await onToggle(connector.id, !connector.isActive)
    } finally {
      setIsToggling(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    setIsDeleting(true)
    try {
      await onDelete(connector.id)
      setShowDeleteDialog(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleTest = async () => {
    if (!onTest) return
    setIsTesting(true)
    try {
      await onTest(connector.id)
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <>
      <Card className={`group transition-all hover:shadow-md ${!connector.isActive ? 'opacity-60' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                {connector.providerMeta?.icon ? (
                  <img
                    src={connector.providerMeta.icon}
                    alt={connector.providerMeta.name}
                    className="h-8 w-8 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <Plug className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <CardTitle className="text-base">
                  <Link
                    href={`/dashboard/integrations/connectors/${connector.id}`}
                    className="hover:underline"
                  >
                    {connector.name}
                  </Link>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {connector.providerMeta?.name || connector.provider}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/integrations/connectors/${connector.id}`}>
                    <Settings className="mr-2 h-4 w-4" />
                    {t('card.configure')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleTest} disabled={isTesting}>
                  {isTesting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plug className="mr-2 h-4 w-4" />
                  )}
                  {t('card.testConnection')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleSync}
                  disabled={isSyncing || !connector.isActive}
                >
                  {isSyncing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  {t('card.syncNow')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleToggle} disabled={isToggling}>
                  {isToggling ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : connector.isActive ? (
                    <Pause className="mr-2 h-4 w-4" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  {connector.isActive ? t('card.disable') : t('card.enable')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {tCommon('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {connector.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {connector.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <Badge className={statusConfig.className} variant={statusConfig.variant}>
              <StatusIcon className={`mr-1 h-3 w-3 ${status === 'RUNNING' ? 'animate-spin' : ''}`} />
              {t(`card.status.${statusConfig.labelKey}`)}
            </Badge>

            {connector.lastSyncAt && (
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(connector.lastSyncAt), { addSuffix: true })}
              </span>
            )}
          </div>

          {connector.errorCount > 0 && (
            <div className="mt-3 flex items-center gap-1 text-xs text-destructive">
              <AlertTriangle className="h-3 w-3" />
              {t('card.errorCount', { count: connector.errorCount })}
            </div>
          )}

          {connector.syncSchedule && connector.isActive && (
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {t('card.autoSyncEnabled')}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('card.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('card.deleteDialog.description', { name: connector.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('card.deleting')}
                </>
              ) : (
                tCommon('delete')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
