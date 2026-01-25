"use client"

/**
 * @prompt-id forge-v4.1:feature:bulk-operations:002
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon, MinusIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BulkSelectCheckboxProps
  extends Omit<React.ComponentProps<typeof CheckboxPrimitive.Root>, "checked" | "onCheckedChange"> {
  /** Whether the checkbox is checked */
  checked: boolean
  /** Whether the checkbox is in indeterminate state (some selected) */
  indeterminate?: boolean
  /** Callback when checked state changes */
  onCheckedChange: (checked: boolean) => void
  /** Label for accessibility */
  "aria-label"?: string
}

/**
 * A checkbox component with support for indeterminate (partially selected) state.
 * Used for "select all" checkboxes in bulk operations.
 *
 * @example
 * ```tsx
 * <BulkSelectCheckbox
 *   checked={isAllSelected}
 *   indeterminate={isIndeterminate}
 *   onCheckedChange={(checked) => {
 *     if (checked) selectAll()
 *     else deselectAll()
 *   }}
 *   aria-label="Select all items"
 * />
 * ```
 */
export function BulkSelectCheckbox({
  className,
  checked,
  indeterminate = false,
  onCheckedChange,
  ...props
}: BulkSelectCheckboxProps) {
  // Determine the visual state
  const visualState = indeterminate ? "indeterminate" : checked ? true : false

  return (
    <CheckboxPrimitive.Root
      data-slot="bulk-checkbox"
      className={cn(
        "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=indeterminate]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:text-primary-foreground dark:data-[state=checked]:bg-primary dark:data-[state=indeterminate]:bg-primary data-[state=checked]:border-primary data-[state=indeterminate]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      checked={visualState}
      onCheckedChange={(newChecked) => {
        // When clicking an indeterminate checkbox, treat it as unchecking all
        if (indeterminate) {
          onCheckedChange(false)
        } else {
          onCheckedChange(newChecked === true)
        }
      }}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="bulk-checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        {indeterminate ? (
          <MinusIcon className="size-3.5" />
        ) : (
          <CheckIcon className="size-3.5" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export default BulkSelectCheckbox
