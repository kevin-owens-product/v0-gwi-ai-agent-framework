"use client"

import { useState, useCallback, ReactNode } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
import {
  ChevronDown,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  MoreHorizontal,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Column definition
export interface Column<T> {
  id: string
  header: string | ReactNode
  cell: (item: T) => ReactNode
  className?: string
  headerClassName?: string
}

// Action definition
export interface RowAction<T> {
  label: string
  icon?: ReactNode
  onClick?: (item: T) => void
  href?: (item: T) => string
  variant?: "default" | "destructive"
  hidden?: (item: T) => boolean
  separator?: boolean
}

// Bulk action definition
export interface BulkAction {
  label: string
  icon?: ReactNode
  onClick: (selectedIds: string[]) => void | Promise<void>
  variant?: "default" | "destructive"
  separator?: boolean
  confirmTitle?: string
  confirmDescription?: string
}

interface AdminDataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  getRowId: (item: T) => string
  isLoading?: boolean
  emptyMessage?: string

  // Standard row actions (view, edit, delete)
  viewHref?: (item: T) => string
  editHref?: (item: T) => string
  onDelete?: (item: T) => void | Promise<void>
  deleteConfirmTitle?: string
  deleteConfirmDescription?: (item: T) => string

  // Custom row actions (in addition to standard)
  rowActions?: RowAction<T>[]

  // Bulk actions
  bulkActions?: BulkAction[]

  // Pagination
  page?: number
  totalPages?: number
  total?: number
  onPageChange?: (page: number) => void

  // Selection
  enableSelection?: boolean
  selectedIds?: Set<string>
  onSelectionChange?: (selectedIds: Set<string>) => void
}

export function AdminDataTable<T>({
  data,
  columns,
  getRowId,
  isLoading = false,
  emptyMessage,
  viewHref,
  editHref,
  onDelete,
  deleteConfirmTitle,
  deleteConfirmDescription,
  rowActions = [],
  bulkActions = [],
  page = 1,
  totalPages = 1,
  total,
  onPageChange,
  enableSelection = true,
  selectedIds: controlledSelectedIds,
  onSelectionChange,
}: AdminDataTableProps<T>) {
  const tTable = useTranslations('ui.table')
  const tPagination = useTranslations('ui.pagination')
  const tCommon = useTranslations('common')
  const tDialog = useTranslations('ui.dialog')
  const tAlert = useTranslations('ui.alert')

  // Internal selection state (if not controlled)
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(new Set())
  const selectedIds = controlledSelectedIds ?? internalSelectedIds
  const setSelectedIds = onSelectionChange ?? setInternalSelectedIds

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<T | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Bulk action confirmation state
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [pendingBulkAction, setPendingBulkAction] = useState<BulkAction | null>(null)
  const [isBulkProcessing, setIsBulkProcessing] = useState(false)

  const selectAll = selectedIds.size === data.length && data.length > 0

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(data.map(getRowId)))
    } else {
      setSelectedIds(new Set())
    }
  }, [data, getRowId, setSelectedIds])

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }, [selectedIds, setSelectedIds])

  const handleDelete = async () => {
    if (!itemToDelete || !onDelete) return
    setIsDeleting(true)
    try {
      await onDelete(itemToDelete)
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    } catch (error) {
      console.error("Delete failed:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkAction = async () => {
    if (!pendingBulkAction || selectedIds.size === 0) return
    setIsBulkProcessing(true)
    try {
      await pendingBulkAction.onClick(Array.from(selectedIds))
      setBulkDialogOpen(false)
      setPendingBulkAction(null)
      setSelectedIds(new Set())
    } catch (error) {
      console.error("Bulk action failed:", error)
    } finally {
      setIsBulkProcessing(false)
    }
  }

  const executeBulkAction = (action: BulkAction) => {
    if (action.confirmTitle) {
      setPendingBulkAction(action)
      setBulkDialogOpen(true)
    } else {
      action.onClick(Array.from(selectedIds))
      setSelectedIds(new Set())
    }
  }

  const hasActions = viewHref || editHref || onDelete || rowActions.length > 0
  const showBulkActions = enableSelection && bulkActions.length > 0

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Bulk Actions Bar */}
        {showBulkActions && selectedIds.size > 0 && (
          <div className="flex items-center gap-4 p-3 bg-muted rounded-lg border">
            <span className="text-sm font-medium">
              {selectedIds.size} item{selectedIds.size !== 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {tCommon('actions')}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {bulkActions.map((action, index) => (
                    <div key={index}>
                      {action.separator && index > 0 && <DropdownMenuSeparator />}
                      <DropdownMenuItem
                        onClick={() => executeBulkAction(action)}
                        className={action.variant === "destructive" ? "text-destructive" : ""}
                      >
                        {action.icon && <span className="mr-2">{action.icon}</span>}
                        {action.label}
                      </DropdownMenuItem>
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
              >
                {tTable('deselectAll')}
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {enableSelection && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead key={column.id} className={column.headerClassName}>
                    {column.header}
                  </TableHead>
                ))}
                {hasActions && (
                  <TableHead className="w-[120px] text-right">{tCommon('actions')}</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (enableSelection ? 1 : 0) + (hasActions ? 1 : 0)}
                    className="text-center py-8"
                  >
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (enableSelection ? 1 : 0) + (hasActions ? 1 : 0)}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {emptyMessage || tTable('noResults')}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => {
                  const id = getRowId(item)
                  const isSelected = selectedIds.has(id)
                  return (
                    <TableRow
                      key={id}
                      className={cn(isSelected && "bg-muted/50")}
                    >
                      {enableSelection && (
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleSelectOne(id, checked as boolean)
                            }
                            aria-label={`Select row ${id}`}
                          />
                        </TableCell>
                      )}
                      {columns.map((column) => (
                        <TableCell key={column.id} className={column.className}>
                          {column.cell(item)}
                        </TableCell>
                      ))}
                      {hasActions && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Standard View Icon */}
                            {viewHref && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    asChild
                                  >
                                    <Link href={viewHref(item)}>
                                      <Eye className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{tCommon('viewDetails')}</TooltipContent>
                              </Tooltip>
                            )}

                            {/* Standard Edit Icon */}
                            {editHref && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    asChild
                                  >
                                    <Link href={editHref(item)}>
                                      <Pencil className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{tCommon('edit')}</TooltipContent>
                              </Tooltip>
                            )}

                            {/* Standard Delete Icon */}
                            {onDelete && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => {
                                      setItemToDelete(item)
                                      setDeleteDialogOpen(true)
                                    }}
                                    className="text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{tCommon('delete')}</TooltipContent>
                              </Tooltip>
                            )}

                            {/* Additional Row Actions Dropdown */}
                            {rowActions.length > 0 && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon-sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {rowActions.map((action, index) => {
                                    if (action.hidden?.(item)) return null
                                    return (
                                      <div key={index}>
                                        {action.separator && index > 0 && (
                                          <DropdownMenuSeparator />
                                        )}
                                        {action.href ? (
                                          <DropdownMenuItem asChild>
                                            <Link
                                              href={action.href(item)}
                                              className={
                                                action.variant === "destructive"
                                                  ? "text-destructive"
                                                  : ""
                                              }
                                            >
                                              {action.icon && (
                                                <span className="mr-2">{action.icon}</span>
                                              )}
                                              {action.label}
                                            </Link>
                                          </DropdownMenuItem>
                                        ) : (
                                          <DropdownMenuItem
                                            onClick={() => action.onClick?.(item)}
                                            className={
                                              action.variant === "destructive"
                                                ? "text-destructive"
                                                : ""
                                            }
                                          >
                                            {action.icon && (
                                              <span className="mr-2">{action.icon}</span>
                                            )}
                                            {action.label}
                                          </DropdownMenuItem>
                                        )}
                                      </div>
                                    )
                                  })}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && onPageChange && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {tPagination('page', { current: page, total: totalPages })}
              {total !== undefined && ` (${total} total)`}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                {tPagination('previous')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                {tPagination('next')}
              </Button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{deleteConfirmTitle || tCommon('delete')}</AlertDialogTitle>
              <AlertDialogDescription>
                {itemToDelete && deleteConfirmDescription
                  ? deleteConfirmDescription(itemToDelete)
                  : tAlert('deleteConfirm')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>{tDialog('cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {tCommon('loading')}
                  </>
                ) : (
                  tCommon('delete')
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Action Confirmation Dialog */}
        <AlertDialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {pendingBulkAction?.confirmTitle || tDialog('confirm')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {pendingBulkAction?.confirmDescription ||
                  tAlert('areYouSure')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isBulkProcessing}>{tDialog('cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkAction}
                disabled={isBulkProcessing}
                className={cn(
                  pendingBulkAction?.variant === "destructive" &&
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                )}
              >
                {isBulkProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {tCommon('loading')}
                  </>
                ) : (
                  tDialog('confirm')
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}
