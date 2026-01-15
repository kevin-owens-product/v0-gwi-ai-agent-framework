/**
 * Grid Component
 *
 * Provides consistent responsive grid layouts for cards and content.
 *
 * @module components/layout/grid
 *
 * @example
 * Basic responsive grid:
 * ```tsx
 * <Grid>
 *   <Card>Card 1</Card>
 *   <Card>Card 2</Card>
 *   <Card>Card 3</Card>
 * </Grid>
 * ```
 *
 * @example
 * Custom column configuration:
 * ```tsx
 * <Grid cols={{ sm: 1, md: 2, lg: 4 }} gap="lg">
 *   {items.map(item => <ItemCard key={item.id} item={item} />)}
 * </Grid>
 * ```
 */

import * as React from "react"
import { cn } from "@/lib/utils"

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns at different breakpoints */
  cols?: {
    default?: 1 | 2 | 3 | 4 | 5 | 6 | 12
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 12
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 12
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 12
    xl?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  }
  /** Gap size between grid items */
  gap?: "none" | "sm" | "md" | "lg" | "xl"
}

const colClasses = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  12: "grid-cols-12",
}

const smColClasses = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
  6: "sm:grid-cols-6",
  12: "sm:grid-cols-12",
}

const mdColClasses = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
  12: "md:grid-cols-12",
}

const lgColClasses = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
  12: "lg:grid-cols-12",
}

const xlColClasses = {
  1: "xl:grid-cols-1",
  2: "xl:grid-cols-2",
  3: "xl:grid-cols-3",
  4: "xl:grid-cols-4",
  5: "xl:grid-cols-5",
  6: "xl:grid-cols-6",
  12: "xl:grid-cols-12",
}

const gapClasses = {
  none: "gap-0",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
}

export function Grid({
  cols = { default: 1, sm: 2, lg: 3 },
  gap = "md",
  className,
  children,
  ...props
}: GridProps) {
  return (
    <div
      className={cn(
        "grid",
        cols.default && colClasses[cols.default],
        cols.sm && smColClasses[cols.sm],
        cols.md && mdColClasses[cols.md],
        cols.lg && lgColClasses[cols.lg],
        cols.xl && xlColClasses[cols.xl],
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Stack Component
 *
 * Vertical stack layout for consistent spacing.
 */
export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Gap size between items */
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl"
  /** Whether to divide items with borders */
  divider?: boolean
}

const stackGapClasses = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
}

export function Stack({
  gap = "md",
  divider = false,
  className,
  children,
  ...props
}: StackProps) {
  return (
    <div
      className={cn(
        "flex flex-col",
        stackGapClasses[gap],
        divider && "divide-y",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Flex Component
 *
 * Flexible row/column layout with common patterns.
 */
export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Flex direction */
  direction?: "row" | "col"
  /** Alignment */
  align?: "start" | "center" | "end" | "stretch" | "baseline"
  /** Justification */
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly"
  /** Gap size */
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl"
  /** Whether to wrap items */
  wrap?: boolean
}

const alignClasses = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
}

const justifyClasses = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
}

export function Flex({
  direction = "row",
  align = "center",
  justify = "start",
  gap = "md",
  wrap = false,
  className,
  children,
  ...props
}: FlexProps) {
  return (
    <div
      className={cn(
        "flex",
        direction === "col" ? "flex-col" : "flex-row",
        alignClasses[align],
        justifyClasses[justify],
        stackGapClasses[gap],
        wrap && "flex-wrap",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
