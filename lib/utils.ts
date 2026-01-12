/**
 * Utility functions for common operations
 *
 * @module lib/utils
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines CSS class names using clsx and tailwind-merge.
 *
 * Merges Tailwind CSS classes intelligently, resolving conflicts by keeping
 * the last conflicting class. This is essential for component composition
 * where you want to allow prop-based class overrides.
 *
 * @param inputs - Variable number of class values (strings, objects, arrays)
 * @returns Merged and deduplicated className string
 *
 * @example
 * Basic usage
 * ```tsx
 * cn('px-2 py-1', 'px-4') // Returns: 'py-1 px-4'
 * ```
 *
 * @example
 * Conditional classes
 * ```tsx
 * cn('base-class', {
 *   'active-class': isActive,
 *   'disabled-class': isDisabled
 * })
 * ```
 *
 * @example
 * Component with overridable styles
 * ```tsx
 * function Button({ className, ...props }) {
 *   return (
 *     <button
 *       className={cn('px-4 py-2 bg-blue-500', className)}
 *       {...props}
 *     />
 *   )
 * }
 * // Usage: <Button className="bg-red-500" /> renders with bg-red-500
 * ```
 *
 * @see https://github.com/lukeed/clsx
 * @see https://github.com/dcastil/tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
