/**
 * Section Component
 *
 * Provides a consistent content section with optional heading and description.
 *
 * @module components/layout/section
 *
 * @example
 * Basic section:
 * ```tsx
 * <Section title="Recent Activity">
 *   <ActivityList />
 * </Section>
 * ```
 *
 * @example
 * Section with description and actions:
 * ```tsx
 * <Section
 *   title="Team Members"
 *   description="Manage your team's access and permissions"
 *   actions={<Button variant="outline">Invite</Button>}
 * >
 *   <TeamMemberList />
 * </Section>
 * ```
 */

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Section title */
  title?: string
  /** Optional description text */
  description?: string
  /** Action buttons or elements */
  actions?: React.ReactNode
  /** Whether to add a border around the section */
  bordered?: boolean
  /** Whether to add a card-like background */
  card?: boolean
  /** Spacing between header and content */
  spacing?: "none" | "sm" | "md" | "lg"
}

export function Section({
  title,
  description,
  actions,
  bordered = false,
  card = false,
  spacing = "md",
  className,
  children,
  ...props
}: SectionProps) {
  const hasHeader = title || description || actions

  return (
    <section
      className={cn(
        bordered && "border rounded-lg",
        card && "bg-card border rounded-lg p-6",
        !card && !bordered && "space-y-4",
        className
      )}
      {...props}
    >
      {/* Section Header */}
      {hasHeader && (
        <div
          className={cn(
            "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between",
            spacing === "none" && "",
            spacing === "sm" && "mb-2",
            spacing === "md" && "mb-4",
            spacing === "lg" && "mb-6",
            (bordered || card) && !card && "px-6 py-4 border-b"
          )}
        >
          <div>
            {title && (
              <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0 mt-2 sm:mt-0">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Section Content */}
      <div className={cn((bordered && !card) && "px-6 py-4")}>{children}</div>
    </section>
  )
}
