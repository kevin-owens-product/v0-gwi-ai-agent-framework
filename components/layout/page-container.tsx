/**
 * Page Container Component
 *
 * Provides consistent page layout with proper padding and max-width constraints.
 *
 * @module components/layout/page-container
 *
 * @example
 * Basic page container:
 * ```tsx
 * <PageContainer>
 *   <PageHeader title="Dashboard" />
 *   <YourContent />
 * </PageContainer>
 * ```
 *
 * @example
 * Full-width page:
 * ```tsx
 * <PageContainer maxWidth="full">
 *   <YourContent />
 * </PageContainer>
 * ```
 */

import * as React from "react"
import { cn } from "@/lib/utils"

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum width of the container */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  /** Padding size */
  padding?: "none" | "sm" | "md" | "lg"
  /** Whether to center the container */
  centered?: boolean
}

const maxWidthClasses = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  "2xl": "max-w-[1536px]",
  full: "max-w-full",
}

const paddingClasses = {
  none: "",
  sm: "px-4 py-4",
  md: "px-6 py-6",
  lg: "px-8 py-8",
}

export function PageContainer({
  maxWidth = "xl",
  padding = "md",
  centered = true,
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "w-full",
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        centered && "mx-auto",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
