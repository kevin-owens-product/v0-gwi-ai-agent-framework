/**
 * Page Header Component
 *
 * Provides a consistent page header with title, description, and action buttons.
 *
 * @module components/layout/page-header
 *
 * @example
 * Basic page header:
 * ```tsx
 * <PageHeader
 *   title="User Management"
 *   description="Manage all users and their permissions"
 * />
 * ```
 *
 * @example
 * Page header with actions:
 * ```tsx
 * <PageHeader
 *   title="Projects"
 *   description="View and manage your projects"
 *   actions={
 *     <Button>
 *       <Plus className="h-4 w-4 mr-2" />
 *       New Project
 *     </Button>
 *   }
 * />
 * ```
 *
 * @example
 * Page header with breadcrumb:
 * ```tsx
 * <PageHeader
 *   title="Edit User"
 *   breadcrumb={
 *     <Breadcrumb>
 *       <BreadcrumbItem href="/admin">Admin</BreadcrumbItem>
 *       <BreadcrumbItem href="/admin/users">Users</BreadcrumbItem>
 *       <BreadcrumbItem>Edit</BreadcrumbItem>
 *     </Breadcrumb>
 *   }
 * />
 * ```
 */

import * as React from "react"
import { cn } from "@/lib/utils"

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Page title */
  title: string
  /** Optional description text */
  description?: string
  /** Action buttons or elements */
  actions?: React.ReactNode
  /** Breadcrumb navigation */
  breadcrumb?: React.ReactNode
  /** Badge or status indicator */
  badge?: React.ReactNode
  /** Size variant */
  size?: "sm" | "default" | "lg"
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  badge,
  size = "default",
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        size === "sm" && "pb-4",
        size === "default" && "pb-6",
        size === "lg" && "pb-8",
        className
      )}
      {...props}
    >
      {/* Breadcrumb */}
      {breadcrumb && <div className="mb-2">{breadcrumb}</div>}

      {/* Title Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1
              className={cn(
                "font-semibold tracking-tight",
                size === "sm" && "text-xl",
                size === "default" && "text-2xl",
                size === "lg" && "text-3xl"
              )}
            >
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p
              className={cn(
                "text-muted-foreground",
                size === "sm" && "text-sm",
                size === "default" && "text-sm",
                size === "lg" && "text-base"
              )}
            >
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  )
}
