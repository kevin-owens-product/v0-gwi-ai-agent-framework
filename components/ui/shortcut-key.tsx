"use client"

/**
 * ShortcutKey Component
 *
 * Displays a styled keyboard shortcut key or key combination.
 * Automatically detects platform for proper modifier display.
 *
 * @module components/ui/shortcut-key
 */

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { formatKeyBinding } from "@/lib/keyboard-shortcuts"

interface ShortcutKeyProps {
  /** Key binding string (e.g., "mod+k" or "g d") */
  binding: string
  /** Additional CSS classes */
  className?: string
  /** Size variant */
  size?: "sm" | "default" | "lg"
  /** Visual variant */
  variant?: "default" | "ghost" | "outline"
}

/**
 * Displays a single key in the shortcut
 */
function KeyBadge({
  children,
  className,
  size = "default",
  variant = "default",
}: {
  children: React.ReactNode
  className?: string
  size?: "sm" | "default" | "lg"
  variant?: "default" | "ghost" | "outline"
}) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center font-mono font-medium rounded",
        // Size variants
        size === "sm" && "min-w-5 h-5 px-1 text-[10px]",
        size === "default" && "min-w-6 h-6 px-1.5 text-xs",
        size === "lg" && "min-w-7 h-7 px-2 text-sm",
        // Visual variants
        variant === "default" &&
          "bg-muted border border-border text-muted-foreground shadow-sm",
        variant === "ghost" && "bg-muted/50 text-muted-foreground",
        variant === "outline" &&
          "border border-border text-muted-foreground",
        className
      )}
    >
      {children}
    </kbd>
  )
}

/**
 * Component that displays a keyboard shortcut with proper styling
 *
 * @example
 * ```tsx
 * // Single key with modifier
 * <ShortcutKey binding="mod+k" />
 *
 * // Key sequence
 * <ShortcutKey binding="g d" />
 *
 * // Custom styling
 * <ShortcutKey binding="escape" size="sm" variant="ghost" />
 * ```
 */
export function ShortcutKey({
  binding,
  className,
  size = "default",
  variant = "default",
}: ShortcutKeyProps) {
  const t = useTranslations("ui.shortcutKey")
  const [platform, setPlatform] = useState<"mac" | "other">("mac")

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setPlatform(navigator.platform.includes("Mac") ? "mac" : "other")
    }
  }, [])

  const formatted = formatKeyBinding(binding, platform)

  // Split for sequences like "G then D"
  if (formatted.includes(" then ")) {
    const parts = formatted.split(" then ")
    return (
      <span className={cn("inline-flex items-center gap-1", className)}>
        {parts.map((part, index) => (
          <span key={index} className="inline-flex items-center gap-1">
            {index > 0 && (
              <span className="text-muted-foreground text-xs mx-0.5">{t("then")}</span>
            )}
            <KeyBadge size={size} variant={variant}>
              {part}
            </KeyBadge>
          </span>
        ))}
      </span>
    )
  }

  // For Mac platform, show as individual keys for combinations like Cmd+K
  if (platform === "mac" && formatted.length > 1 && !formatted.includes("+")) {
    // Split modifier symbols from the key
    const chars = formatted.split("")
    const modifiers = chars.slice(0, -1)
    const key = chars[chars.length - 1]

    return (
      <span className={cn("inline-flex items-center gap-0.5", className)}>
        {modifiers.map((mod, index) => (
          <KeyBadge key={index} size={size} variant={variant}>
            {mod}
          </KeyBadge>
        ))}
        <KeyBadge size={size} variant={variant}>
          {key}
        </KeyBadge>
      </span>
    )
  }

  // For Windows/Linux or simple keys
  if (formatted.includes("+")) {
    const parts = formatted.split("+")
    return (
      <span className={cn("inline-flex items-center gap-0.5", className)}>
        {parts.map((part, index) => (
          <span key={index} className="inline-flex items-center gap-0.5">
            {index > 0 && (
              <span className="text-muted-foreground text-xs">+</span>
            )}
            <KeyBadge size={size} variant={variant}>
              {part}
            </KeyBadge>
          </span>
        ))}
      </span>
    )
  }

  // Single key
  return (
    <span className={className}>
      <KeyBadge size={size} variant={variant}>
        {formatted}
      </KeyBadge>
    </span>
  )
}

/**
 * Inline shortcut display for use in menus and lists
 */
export function ShortcutInline({
  binding,
  className,
}: {
  binding: string
  className?: string
}) {
  return (
    <ShortcutKey
      binding={binding}
      size="sm"
      variant="ghost"
      className={cn("ml-auto", className)}
    />
  )
}

export { KeyBadge }
