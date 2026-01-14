import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useState, ReactNode } from 'react'

// Mock types
interface TestItem {
  id: string
  name: string
  email: string
  status: string
}

interface Column<T> {
  id: string
  header: string | ReactNode
  cell: (item: T) => ReactNode
  className?: string
  headerClassName?: string
}

interface RowAction<T> {
  label: string
  icon?: ReactNode
  onClick?: (item: T) => void
  href?: (item: T) => string
  variant?: "default" | "destructive"
  hidden?: (item: T) => boolean
  separator?: boolean
}

interface BulkAction {
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
  viewHref?: (item: T) => string
  editHref?: (item: T) => string
  onDelete?: (item: T) => void | Promise<void>
  deleteConfirmTitle?: string
  deleteConfirmDescription?: (item: T) => string
  rowActions?: RowAction<T>[]
  bulkActions?: BulkAction[]
  page?: number
  totalPages?: number
  total?: number
  onPageChange?: (page: number) => void
  enableSelection?: boolean
  selectedIds?: Set<string>
  onSelectionChange?: (selectedIds: Set<string>) => void
}

// Mock AdminDataTable component that mimics the real component's behavior
function AdminDataTable<T>({
  data,
  columns,
  getRowId,
  isLoading = false,
  emptyMessage = "No items found",
  viewHref,
  editHref,
  onDelete,
  deleteConfirmTitle = "Delete Item",
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
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(new Set())
  const selectedIds = controlledSelectedIds ?? internalSelectedIds
  const setSelectedIds = onSelectionChange ?? setInternalSelectedIds

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<T | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [pendingBulkAction, setPendingBulkAction] = useState<BulkAction | null>(null)
  const [isBulkProcessing, setIsBulkProcessing] = useState(false)

  const selectAll = selectedIds.size === data.length && data.length > 0

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(data.map(getRowId)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }

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
    <div data-testid="admin-data-table">
      {/* Bulk Actions Bar */}
      {showBulkActions && selectedIds.size > 0 && (
        <div data-testid="bulk-actions-bar">
          <span data-testid="selected-count">
            {selectedIds.size} item{selectedIds.size !== 1 ? "s" : ""} selected
          </span>
          <div>
            {bulkActions.map((action, index) => (
              <button
                key={index}
                data-testid={`bulk-action-${index}`}
                onClick={() => executeBulkAction(action)}
              >
                {action.label}
              </button>
            ))}
            <button
              data-testid="clear-selection"
              onClick={() => setSelectedIds(new Set())}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <table data-testid="data-table">
        <thead>
          <tr>
            {enableSelection && (
              <th>
                <input
                  type="checkbox"
                  data-testid="select-all"
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  aria-label="Select all"
                />
              </th>
            )}
            {columns.map((column) => (
              <th key={column.id} data-testid={`header-${column.id}`}>
                {column.header}
              </th>
            ))}
            {hasActions && <th data-testid="actions-header">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr data-testid="loading-row">
              <td colSpan={columns.length + (enableSelection ? 1 : 0) + (hasActions ? 1 : 0)}>
                <span data-testid="loading-spinner">Loading...</span>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr data-testid="empty-row">
              <td
                colSpan={columns.length + (enableSelection ? 1 : 0) + (hasActions ? 1 : 0)}
                data-testid="empty-message"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => {
              const id = getRowId(item)
              const isSelected = selectedIds.has(id)
              return (
                <tr key={id} data-testid={`row-${id}`} data-selected={isSelected}>
                  {enableSelection && (
                    <td>
                      <input
                        type="checkbox"
                        data-testid={`select-${id}`}
                        checked={isSelected}
                        onChange={(e) => handleSelectOne(id, e.target.checked)}
                        aria-label={`Select row ${id}`}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.id} data-testid={`cell-${id}-${column.id}`}>
                      {column.cell(item)}
                    </td>
                  ))}
                  {hasActions && (
                    <td data-testid={`actions-${id}`}>
                      {viewHref && (
                        <a href={viewHref(item)} data-testid={`view-${id}`}>
                          View
                        </a>
                      )}
                      {editHref && (
                        <a href={editHref(item)} data-testid={`edit-${id}`}>
                          Edit
                        </a>
                      )}
                      {onDelete && (
                        <button
                          data-testid={`delete-${id}`}
                          onClick={() => {
                            setItemToDelete(item)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          Delete
                        </button>
                      )}
                      {rowActions.length > 0 && (
                        <div data-testid={`row-actions-menu-${id}`}>
                          {rowActions.map((action, index) => {
                            if (action.hidden?.(item)) return null
                            return (
                              <button
                                key={index}
                                data-testid={`row-action-${id}-${index}`}
                                onClick={() => action.onClick?.(item)}
                              >
                                {action.label}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              )
            })
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div data-testid="pagination">
          <span data-testid="page-info">
            Page {page} of {totalPages}
            {total !== undefined && ` (${total} total)`}
          </span>
          <button
            data-testid="prev-page"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <button
            data-testid="next-page"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div data-testid="delete-dialog" role="dialog">
          <h2 data-testid="delete-dialog-title">{deleteConfirmTitle}</h2>
          <p data-testid="delete-dialog-description">
            {itemToDelete && deleteConfirmDescription
              ? deleteConfirmDescription(itemToDelete)
              : "Are you sure you want to delete this item? This action cannot be undone."}
          </p>
          <button
            data-testid="delete-cancel"
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            data-testid="delete-confirm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      )}

      {/* Bulk Action Confirmation Dialog */}
      {bulkDialogOpen && (
        <div data-testid="bulk-dialog" role="dialog">
          <h2 data-testid="bulk-dialog-title">
            {pendingBulkAction?.confirmTitle || "Confirm Action"}
          </h2>
          <p data-testid="bulk-dialog-description">
            {pendingBulkAction?.confirmDescription ||
              `This action will affect ${selectedIds.size} item${selectedIds.size !== 1 ? "s" : ""}. Are you sure you want to continue?`}
          </p>
          <button
            data-testid="bulk-cancel"
            onClick={() => setBulkDialogOpen(false)}
            disabled={isBulkProcessing}
          >
            Cancel
          </button>
          <button
            data-testid="bulk-confirm"
            onClick={handleBulkAction}
            disabled={isBulkProcessing}
          >
            {isBulkProcessing ? "Processing..." : "Confirm"}
          </button>
        </div>
      )}
    </div>
  )
}

describe('AdminDataTable Component', () => {
  const mockData: TestItem[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
    { id: '3', name: 'Bob Wilson', email: 'bob@example.com', status: 'active' },
  ]

  const mockColumns: Column<TestItem>[] = [
    { id: 'name', header: 'Name', cell: (item) => item.name },
    { id: 'email', header: 'Email', cell: (item) => item.email },
    { id: 'status', header: 'Status', cell: (item) => item.status },
  ]

  const getRowId = (item: TestItem) => item.id

  describe('Basic Rendering', () => {
    it('should render the data table', () => {
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
        />
      )
      expect(screen.getByTestId('admin-data-table')).toBeDefined()
      expect(screen.getByTestId('data-table')).toBeDefined()
    })

    it('should render column headers', () => {
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
        />
      )
      expect(screen.getByTestId('header-name')).toBeDefined()
      expect(screen.getByTestId('header-email')).toBeDefined()
      expect(screen.getByTestId('header-status')).toBeDefined()
    })

    it('should render data rows', () => {
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
        />
      )
      expect(screen.getByTestId('row-1')).toBeDefined()
      expect(screen.getByTestId('row-2')).toBeDefined()
      expect(screen.getByTestId('row-3')).toBeDefined()
    })

    it('should render cell content correctly', () => {
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
        />
      )
      expect(screen.getByTestId('cell-1-name').textContent).toBe('John Doe')
      expect(screen.getByTestId('cell-1-email').textContent).toBe('john@example.com')
      expect(screen.getByTestId('cell-2-name').textContent).toBe('Jane Smith')
    })
  })

  describe('Loading State', () => {
    it('should display loading state when isLoading is true', () => {
      render(
        <AdminDataTable
          data={[]}
          columns={mockColumns}
          getRowId={getRowId}
          isLoading={true}
        />
      )
      expect(screen.getByTestId('loading-row')).toBeDefined()
      expect(screen.getByTestId('loading-spinner')).toBeDefined()
    })

    it('should not display data rows when loading', () => {
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          isLoading={true}
        />
      )
      expect(screen.queryByTestId('row-1')).toBeNull()
    })
  })

  describe('Empty State', () => {
    it('should display default empty message when no data', () => {
      render(
        <AdminDataTable
          data={[]}
          columns={mockColumns}
          getRowId={getRowId}
        />
      )
      expect(screen.getByTestId('empty-row')).toBeDefined()
      expect(screen.getByTestId('empty-message').textContent).toBe('No items found')
    })

    it('should display custom empty message', () => {
      render(
        <AdminDataTable
          data={[]}
          columns={mockColumns}
          getRowId={getRowId}
          emptyMessage="No users available"
        />
      )
      expect(screen.getByTestId('empty-message').textContent).toBe('No users available')
    })
  })

  describe('Row Selection', () => {
    it('should render selection checkboxes when enabled', () => {
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          enableSelection={true}
        />
      )
      expect(screen.getByTestId('select-all')).toBeDefined()
      expect(screen.getByTestId('select-1')).toBeDefined()
      expect(screen.getByTestId('select-2')).toBeDefined()
    })

    it('should not render selection checkboxes when disabled', () => {
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          enableSelection={false}
        />
      )
      expect(screen.queryByTestId('select-all')).toBeNull()
      expect(screen.queryByTestId('select-1')).toBeNull()
    })

    it('should select individual row', () => {
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
        />
      )
      const checkbox = screen.getByTestId('select-1') as HTMLInputElement
      fireEvent.click(checkbox)
      expect(checkbox.checked).toBe(true)
    })

    it('should deselect individual row', () => {
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
        />
      )
      const checkbox = screen.getByTestId('select-1') as HTMLInputElement
      fireEvent.click(checkbox)
      fireEvent.click(checkbox)
      expect(checkbox.checked).toBe(false)
    })

    it('should select all rows', () => {
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
        />
      )
      const selectAll = screen.getByTestId('select-all') as HTMLInputElement
      fireEvent.click(selectAll)

      const checkbox1 = screen.getByTestId('select-1') as HTMLInputElement
      const checkbox2 = screen.getByTestId('select-2') as HTMLInputElement
      const checkbox3 = screen.getByTestId('select-3') as HTMLInputElement

      expect(checkbox1.checked).toBe(true)
      expect(checkbox2.checked).toBe(true)
      expect(checkbox3.checked).toBe(true)
    })

    it('should deselect all rows', () => {
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
        />
      )
      const selectAll = screen.getByTestId('select-all') as HTMLInputElement

      // Select all first
      fireEvent.click(selectAll)
      // Then deselect all
      fireEvent.click(selectAll)

      const checkbox1 = screen.getByTestId('select-1') as HTMLInputElement
      const checkbox2 = screen.getByTestId('select-2') as HTMLInputElement

      expect(checkbox1.checked).toBe(false)
      expect(checkbox2.checked).toBe(false)
    })

    it('should call onSelectionChange when controlled', () => {
      const onSelectionChange = vi.fn()
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          selectedIds={new Set()}
          onSelectionChange={onSelectionChange}
        />
      )
      const checkbox = screen.getByTestId('select-1')
      fireEvent.click(checkbox)

      expect(onSelectionChange).toHaveBeenCalledWith(new Set(['1']))
    })
  })

  describe('Row Actions', () => {
    it('should render actions column when viewHref provided', () => {
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          viewHref={(item) => `/items/${item.id}`}
        />
      )
      expect(screen.getByTestId('actions-header')).toBeDefined()
      expect(screen.getByTestId('view-1')).toBeDefined()
    })

    it('should render edit link with correct href', () => {
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          editHref={(item) => `/items/${item.id}/edit`}
        />
      )
      const editLink = screen.getByTestId('edit-1')
      expect(editLink.getAttribute('href')).toBe('/items/1/edit')
    })

    it('should render view link with correct href', () => {
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          viewHref={(item) => `/items/${item.id}`}
        />
      )
      const viewLink = screen.getByTestId('view-1')
      expect(viewLink.getAttribute('href')).toBe('/items/1')
    })

    it('should render delete button when onDelete provided', () => {
      const onDelete = vi.fn()
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          onDelete={onDelete}
        />
      )
      expect(screen.getByTestId('delete-1')).toBeDefined()
    })

    it('should render custom row actions', () => {
      const customAction = vi.fn()
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          rowActions={[
            { label: 'Custom Action', onClick: customAction }
          ]}
        />
      )
      expect(screen.getByTestId('row-action-1-0')).toBeDefined()
    })

    it('should call custom row action onClick', () => {
      const customAction = vi.fn()
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          rowActions={[
            { label: 'Custom Action', onClick: customAction }
          ]}
        />
      )
      fireEvent.click(screen.getByTestId('row-action-1-0'))
      expect(customAction).toHaveBeenCalledWith(mockData[0])
    })

    it('should hide row action when hidden returns true', () => {
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          rowActions={[
            {
              label: 'Hidden Action',
              onClick: vi.fn(),
              hidden: (item) => item.status === 'inactive'
            }
          ]}
        />
      )
      // Row 2 (Jane Smith) has inactive status
      expect(screen.queryByTestId('row-action-2-0')).toBeNull()
      // Row 1 (John Doe) has active status
      expect(screen.getByTestId('row-action-1-0')).toBeDefined()
    })
  })

  describe('Delete Confirmation Dialog', () => {
    it('should open delete dialog when delete button clicked', () => {
      const onDelete = vi.fn()
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          onDelete={onDelete}
        />
      )
      fireEvent.click(screen.getByTestId('delete-1'))
      expect(screen.getByTestId('delete-dialog')).toBeDefined()
    })

    it('should display custom delete confirm title', () => {
      const onDelete = vi.fn()
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          onDelete={onDelete}
          deleteConfirmTitle="Remove User"
        />
      )
      fireEvent.click(screen.getByTestId('delete-1'))
      expect(screen.getByTestId('delete-dialog-title').textContent).toBe('Remove User')
    })

    it('should display custom delete confirm description', () => {
      const onDelete = vi.fn()
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          onDelete={onDelete}
          deleteConfirmDescription={(item) => `Delete ${item.name}?`}
        />
      )
      fireEvent.click(screen.getByTestId('delete-1'))
      expect(screen.getByTestId('delete-dialog-description').textContent).toBe('Delete John Doe?')
    })

    it('should close dialog when cancel clicked', () => {
      const onDelete = vi.fn()
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          onDelete={onDelete}
        />
      )
      fireEvent.click(screen.getByTestId('delete-1'))
      fireEvent.click(screen.getByTestId('delete-cancel'))
      expect(screen.queryByTestId('delete-dialog')).toBeNull()
    })

    it('should call onDelete when confirm clicked', async () => {
      const onDelete = vi.fn()
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          onDelete={onDelete}
        />
      )
      fireEvent.click(screen.getByTestId('delete-1'))
      fireEvent.click(screen.getByTestId('delete-confirm'))

      await waitFor(() => {
        expect(onDelete).toHaveBeenCalledWith(mockData[0])
      })
    })

    it('should close dialog after successful delete', async () => {
      const onDelete = vi.fn().mockResolvedValue(undefined)
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          onDelete={onDelete}
        />
      )
      fireEvent.click(screen.getByTestId('delete-1'))
      fireEvent.click(screen.getByTestId('delete-confirm'))

      await waitFor(() => {
        expect(screen.queryByTestId('delete-dialog')).toBeNull()
      })
    })
  })

  describe('Bulk Actions', () => {
    const mockBulkActions: BulkAction[] = [
      { label: 'Export', onClick: vi.fn() },
      {
        label: 'Delete Selected',
        onClick: vi.fn(),
        variant: 'destructive',
        confirmTitle: 'Delete Items',
        confirmDescription: 'Are you sure?'
      }
    ]

    it('should not show bulk actions bar when no items selected', () => {
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          bulkActions={mockBulkActions}
        />
      )
      expect(screen.queryByTestId('bulk-actions-bar')).toBeNull()
    })

    it('should show bulk actions bar when items selected', () => {
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          bulkActions={mockBulkActions}
        />
      )
      fireEvent.click(screen.getByTestId('select-1'))
      expect(screen.getByTestId('bulk-actions-bar')).toBeDefined()
    })

    it('should display selected count', () => {
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          bulkActions={mockBulkActions}
        />
      )
      fireEvent.click(screen.getByTestId('select-1'))
      expect(screen.getByTestId('selected-count').textContent).toBe('1 item selected')

      fireEvent.click(screen.getByTestId('select-2'))
      expect(screen.getByTestId('selected-count').textContent).toBe('2 items selected')
    })

    it('should clear selection when clear button clicked', () => {
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          bulkActions={mockBulkActions}
        />
      )
      fireEvent.click(screen.getByTestId('select-1'))
      fireEvent.click(screen.getByTestId('clear-selection'))
      expect(screen.queryByTestId('bulk-actions-bar')).toBeNull()
    })

    it('should execute bulk action without confirmation', () => {
      const exportAction = vi.fn()
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          bulkActions={[{ label: 'Export', onClick: exportAction }]}
        />
      )
      fireEvent.click(screen.getByTestId('select-1'))
      fireEvent.click(screen.getByTestId('select-2'))
      fireEvent.click(screen.getByTestId('bulk-action-0'))

      expect(exportAction).toHaveBeenCalledWith(['1', '2'])
    })

    it('should show confirmation dialog for bulk action with confirmTitle', () => {
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          bulkActions={mockBulkActions}
        />
      )
      fireEvent.click(screen.getByTestId('select-1'))
      fireEvent.click(screen.getByTestId('bulk-action-1'))

      expect(screen.getByTestId('bulk-dialog')).toBeDefined()
      expect(screen.getByTestId('bulk-dialog-title').textContent).toBe('Delete Items')
    })

    it('should close bulk dialog on cancel', () => {
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          bulkActions={mockBulkActions}
        />
      )
      fireEvent.click(screen.getByTestId('select-1'))
      fireEvent.click(screen.getByTestId('bulk-action-1'))
      fireEvent.click(screen.getByTestId('bulk-cancel'))

      expect(screen.queryByTestId('bulk-dialog')).toBeNull()
    })

    it('should execute bulk action on confirm', async () => {
      const deleteAction = vi.fn().mockResolvedValue(undefined)
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          bulkActions={[
            {
              label: 'Delete',
              onClick: deleteAction,
              confirmTitle: 'Delete?'
            }
          ]}
        />
      )
      fireEvent.click(screen.getByTestId('select-1'))
      fireEvent.click(screen.getByTestId('bulk-action-0'))
      fireEvent.click(screen.getByTestId('bulk-confirm'))

      await waitFor(() => {
        expect(deleteAction).toHaveBeenCalledWith(['1'])
      })
    })
  })

  describe('Pagination', () => {
    it('should not show pagination when totalPages is 1', () => {
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          page={1}
          totalPages={1}
          onPageChange={vi.fn()}
        />
      )
      expect(screen.queryByTestId('pagination')).toBeNull()
    })

    it('should show pagination when totalPages is greater than 1', () => {
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          page={1}
          totalPages={5}
          onPageChange={vi.fn()}
        />
      )
      expect(screen.getByTestId('pagination')).toBeDefined()
    })

    it('should display page info', () => {
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          page={2}
          totalPages={5}
          total={50}
          onPageChange={vi.fn()}
        />
      )
      expect(screen.getByTestId('page-info').textContent).toBe('Page 2 of 5 (50 total)')
    })

    it('should disable previous button on first page', () => {
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          page={1}
          totalPages={5}
          onPageChange={vi.fn()}
        />
      )
      const prevButton = screen.getByTestId('prev-page') as HTMLButtonElement
      expect(prevButton.disabled).toBe(true)
    })

    it('should disable next button on last page', () => {
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          page={5}
          totalPages={5}
          onPageChange={vi.fn()}
        />
      )
      const nextButton = screen.getByTestId('next-page') as HTMLButtonElement
      expect(nextButton.disabled).toBe(true)
    })

    it('should call onPageChange with previous page', () => {
      const onPageChange = vi.fn()
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          page={3}
          totalPages={5}
          onPageChange={onPageChange}
        />
      )
      fireEvent.click(screen.getByTestId('prev-page'))
      expect(onPageChange).toHaveBeenCalledWith(2)
    })

    it('should call onPageChange with next page', () => {
      const onPageChange = vi.fn()
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          page={3}
          totalPages={5}
          onPageChange={onPageChange}
        />
      )
      fireEvent.click(screen.getByTestId('next-page'))
      expect(onPageChange).toHaveBeenCalledWith(4)
    })

    it('should not go below page 1', () => {
      const onPageChange = vi.fn()
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          page={1}
          totalPages={5}
          onPageChange={onPageChange}
        />
      )
      // Button is disabled, but let's ensure logic is correct
      const prevButton = screen.getByTestId('prev-page') as HTMLButtonElement
      expect(prevButton.disabled).toBe(true)
    })

    it('should not go above totalPages', () => {
      const onPageChange = vi.fn()
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          page={5}
          totalPages={5}
          onPageChange={onPageChange}
        />
      )
      const nextButton = screen.getByTestId('next-page') as HTMLButtonElement
      expect(nextButton.disabled).toBe(true)
    })
  })

  describe('No Actions Column', () => {
    it('should not render actions column when no actions provided', () => {
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
        />
      )
      expect(screen.queryByTestId('actions-header')).toBeNull()
    })
  })

  describe('Custom Column Rendering', () => {
    it('should render custom cell content', () => {
      const customColumns: Column<TestItem>[] = [
        {
          id: 'custom',
          header: 'Custom',
          cell: (item) => <span data-testid={`custom-${item.id}`}>Custom: {item.name}</span>
        }
      ]
      render(
        <AdminDataTable
          data={mockData}
          columns={customColumns}
          getRowId={getRowId}
        />
      )
      expect(screen.getByTestId('custom-1').textContent).toBe('Custom: John Doe')
    })

    it('should render custom header content', () => {
      const customColumns: Column<TestItem>[] = [
        {
          id: 'custom',
          header: <span data-testid="custom-header">Custom Header</span>,
          cell: (item) => item.name
        }
      ]
      render(
        <AdminDataTable
          data={mockData}
          columns={customColumns}
          getRowId={getRowId}
        />
      )
      expect(screen.getByTestId('custom-header')).toBeDefined()
    })
  })

  describe('Controlled Selection', () => {
    it('should use controlled selectedIds', () => {
      const selectedIds = new Set(['1', '2'])
      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          selectedIds={selectedIds}
          onSelectionChange={vi.fn()}
        />
      )
      const checkbox1 = screen.getByTestId('select-1') as HTMLInputElement
      const checkbox2 = screen.getByTestId('select-2') as HTMLInputElement
      const checkbox3 = screen.getByTestId('select-3') as HTMLInputElement

      expect(checkbox1.checked).toBe(true)
      expect(checkbox2.checked).toBe(true)
      expect(checkbox3.checked).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should handle delete error gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      const onDelete = vi.fn().mockRejectedValue(new Error('Delete failed'))

      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          onDelete={onDelete}
        />
      )
      fireEvent.click(screen.getByTestId('delete-1'))
      fireEvent.click(screen.getByTestId('delete-confirm'))

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('Delete failed:', expect.any(Error))
      })

      consoleError.mockRestore()
    })

    it('should handle bulk action error gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      const bulkAction = vi.fn().mockRejectedValue(new Error('Bulk failed'))

      render(
        <AdminDataTable
          data={mockData}
          columns={mockColumns}
          getRowId={getRowId}
          bulkActions={[
            { label: 'Fail', onClick: bulkAction, confirmTitle: 'Confirm' }
          ]}
        />
      )
      fireEvent.click(screen.getByTestId('select-1'))
      fireEvent.click(screen.getByTestId('bulk-action-0'))
      fireEvent.click(screen.getByTestId('bulk-confirm'))

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith('Bulk action failed:', expect.any(Error))
      })

      consoleError.mockRestore()
    })
  })
})
