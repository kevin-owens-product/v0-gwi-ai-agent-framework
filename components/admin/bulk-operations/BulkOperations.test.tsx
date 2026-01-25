/**
 * @prompt-id forge-v4.1:feature:bulk-operations:008
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BulkSelectCheckbox } from "./BulkSelectCheckbox"
import { BulkActionBar, BulkAction } from "./BulkActionBar"
import { BulkActionButton } from "./BulkActionButton"
import { BulkProgressDialog, BulkOperationProgress } from "./BulkProgressDialog"

describe("BulkSelectCheckbox", () => {
  it("should render unchecked state", () => {
    render(
      <BulkSelectCheckbox
        checked={false}
        onCheckedChange={vi.fn()}
        aria-label="Select all"
      />
    )

    const checkbox = screen.getByRole("checkbox", { name: "Select all" })
    expect(checkbox).not.toBeChecked()
  })

  it("should render checked state", () => {
    render(
      <BulkSelectCheckbox
        checked={true}
        onCheckedChange={vi.fn()}
        aria-label="Select all"
      />
    )

    const checkbox = screen.getByRole("checkbox", { name: "Select all" })
    expect(checkbox).toHaveAttribute("data-state", "checked")
  })

  it("should render indeterminate state", () => {
    render(
      <BulkSelectCheckbox
        checked={false}
        indeterminate={true}
        onCheckedChange={vi.fn()}
        aria-label="Select all"
      />
    )

    const checkbox = screen.getByRole("checkbox", { name: "Select all" })
    expect(checkbox).toHaveAttribute("data-state", "indeterminate")
  })

  it("should call onCheckedChange when clicked", async () => {
    const onCheckedChange = vi.fn()
    const user = userEvent.setup()

    render(
      <BulkSelectCheckbox
        checked={false}
        onCheckedChange={onCheckedChange}
        aria-label="Select all"
      />
    )

    await user.click(screen.getByRole("checkbox"))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it("should uncheck when clicked in indeterminate state", async () => {
    const onCheckedChange = vi.fn()
    const user = userEvent.setup()

    render(
      <BulkSelectCheckbox
        checked={false}
        indeterminate={true}
        onCheckedChange={onCheckedChange}
        aria-label="Select all"
      />
    )

    await user.click(screen.getByRole("checkbox"))
    expect(onCheckedChange).toHaveBeenCalledWith(false)
  })
})

describe("BulkActionBar", () => {
  const mockActions: BulkAction[] = [
    {
      id: "ban",
      label: "Ban Selected",
      onClick: vi.fn().mockResolvedValue({ success: 2, failed: 0 }),
      requiresConfirmation: true,
      confirmTitle: "Ban Users",
      confirmDescription: "Are you sure?",
    },
    {
      id: "delete",
      label: "Delete Selected",
      onClick: vi.fn().mockResolvedValue({ success: 2, failed: 0 }),
      variant: "destructive",
    },
  ]

  const defaultProps = {
    selectedCount: 2,
    selectedIds: ["1", "2"],
    actions: mockActions,
    onClearSelection: vi.fn(),
  }

  it("should not render when no items selected", () => {
    render(
      <BulkActionBar {...defaultProps} selectedCount={0} selectedIds={[]} />
    )

    expect(screen.queryByText("selected")).not.toBeInTheDocument()
  })

  it("should render with correct selection count", () => {
    render(<BulkActionBar {...defaultProps} />)

    expect(screen.getByText(/2 items selected/)).toBeInTheDocument()
  })

  it("should show singular form for one item", () => {
    render(<BulkActionBar {...defaultProps} selectedCount={1} selectedIds={["1"]} />)

    expect(screen.getByText(/1 item selected/)).toBeInTheDocument()
  })

  it("should open actions dropdown", async () => {
    const user = userEvent.setup()
    render(<BulkActionBar {...defaultProps} />)

    await user.click(screen.getByRole("button", { name: /actions/i }))

    expect(screen.getByText("Ban Selected")).toBeInTheDocument()
    expect(screen.getByText("Delete Selected")).toBeInTheDocument()
  })

  it("should call onClearSelection when Clear is clicked", async () => {
    const user = userEvent.setup()
    render(<BulkActionBar {...defaultProps} />)

    await user.click(screen.getByRole("button", { name: /clear/i }))

    expect(defaultProps.onClearSelection).toHaveBeenCalled()
  })

  it("should show confirmation dialog for actions that require it", async () => {
    const user = userEvent.setup()
    render(<BulkActionBar {...defaultProps} />)

    await user.click(screen.getByRole("button", { name: /actions/i }))
    await user.click(screen.getByText("Ban Selected"))

    expect(screen.getByText("Ban Users")).toBeInTheDocument()
    expect(screen.getByText("Are you sure?")).toBeInTheDocument()
  })

  it("should show select all option when totalItems > selectedCount", () => {
    render(
      <BulkActionBar
        {...defaultProps}
        totalItems={100}
        onSelectAll={vi.fn()}
      />
    )

    expect(screen.getByText("Select all 100")).toBeInTheDocument()
  })
})

describe("BulkActionButton", () => {
  it("should render with label", () => {
    render(
      <BulkActionButton
        label="Ban Selected"
        selectedCount={2}
        selectedIds={["1", "2"]}
        onClick={vi.fn()}
      />
    )

    expect(screen.getByRole("button", { name: /ban selected/i })).toBeInTheDocument()
  })

  it("should show count badge", () => {
    render(
      <BulkActionButton
        label="Ban Selected"
        selectedCount={5}
        selectedIds={["1", "2", "3", "4", "5"]}
        onClick={vi.fn()}
      />
    )

    expect(screen.getByText("(5)")).toBeInTheDocument()
  })

  it("should be disabled when no items selected", () => {
    render(
      <BulkActionButton
        label="Ban Selected"
        selectedCount={0}
        selectedIds={[]}
        onClick={vi.fn()}
      />
    )

    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("should call onClick directly when no confirmation required", async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()

    render(
      <BulkActionButton
        label="Ban Selected"
        selectedCount={2}
        selectedIds={["1", "2"]}
        onClick={onClick}
      />
    )

    await user.click(screen.getByRole("button"))
    expect(onClick).toHaveBeenCalledWith(["1", "2"])
  })

  it("should show confirmation dialog when requiresConfirmation is true", async () => {
    const user = userEvent.setup()

    render(
      <BulkActionButton
        label="Delete Selected"
        selectedCount={2}
        selectedIds={["1", "2"]}
        onClick={vi.fn()}
        requiresConfirmation
        confirmTitle="Delete Items"
        confirmDescription="This cannot be undone"
      />
    )

    await user.click(screen.getByRole("button"))

    expect(screen.getByText("Delete Items")).toBeInTheDocument()
    expect(screen.getByText("This cannot be undone")).toBeInTheDocument()
  })

  it("should show loading state during action", async () => {
    const onClick = vi.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )
    const user = userEvent.setup()

    render(
      <BulkActionButton
        label="Ban Selected"
        selectedCount={2}
        selectedIds={["1", "2"]}
        onClick={onClick}
      />
    )

    await user.click(screen.getByRole("button"))

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeDisabled()
    })
  })
})

describe("BulkProgressDialog", () => {
  const defaultProgress: BulkOperationProgress = {
    total: 10,
    processed: 5,
    succeeded: 4,
    failed: 1,
    status: "processing",
  }

  it("should not render when progress is null", () => {
    render(
      <BulkProgressDialog
        open={true}
        onOpenChange={vi.fn()}
        progress={null}
      />
    )

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("should render progress percentage", () => {
    render(
      <BulkProgressDialog
        open={true}
        onOpenChange={vi.fn()}
        progress={defaultProgress}
      />
    )

    expect(screen.getByText("50%")).toBeInTheDocument()
  })

  it("should show processed count", () => {
    render(
      <BulkProgressDialog
        open={true}
        onOpenChange={vi.fn()}
        progress={defaultProgress}
        itemLabel="user"
      />
    )

    expect(screen.getByText(/5 of 10 users processed/)).toBeInTheDocument()
  })

  it("should show success and failure badges", () => {
    render(
      <BulkProgressDialog
        open={true}
        onOpenChange={vi.fn()}
        progress={defaultProgress}
      />
    )

    expect(screen.getByText(/4 succeeded/)).toBeInTheDocument()
    expect(screen.getByText(/1 failed/)).toBeInTheDocument()
  })

  it("should show completed status", () => {
    const completedProgress: BulkOperationProgress = {
      ...defaultProgress,
      processed: 10,
      succeeded: 10,
      failed: 0,
      status: "completed",
    }

    render(
      <BulkProgressDialog
        open={true}
        onOpenChange={vi.fn()}
        progress={completedProgress}
      />
    )

    expect(screen.getByText("Operation completed successfully")).toBeInTheDocument()
  })

  it("should show error details when there are errors", () => {
    const progressWithErrors: BulkOperationProgress = {
      ...defaultProgress,
      status: "completed_with_errors",
      errors: ["User 1: Not found", "User 2: Permission denied"],
    }

    render(
      <BulkProgressDialog
        open={true}
        onOpenChange={vi.fn()}
        progress={progressWithErrors}
      />
    )

    expect(screen.getByText(/error details/i)).toBeInTheDocument()
  })

  it("should disable Done button while processing", () => {
    render(
      <BulkProgressDialog
        open={true}
        onOpenChange={vi.fn()}
        progress={defaultProgress}
      />
    )

    expect(screen.getByRole("button", { name: /please wait/i })).toBeDisabled()
  })

  it("should enable Done button when completed", () => {
    const completedProgress: BulkOperationProgress = {
      ...defaultProgress,
      status: "completed",
    }

    render(
      <BulkProgressDialog
        open={true}
        onOpenChange={vi.fn()}
        progress={completedProgress}
      />
    )

    expect(screen.getByRole("button", { name: /done/i })).not.toBeDisabled()
  })
})
