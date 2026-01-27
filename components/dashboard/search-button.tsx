"use client"

/**
 * Search Button Component
 *
 * A button that opens the command palette when clicked.
 * Shows the keyboard shortcut hint in the tooltip.
 *
 * @module components/dashboard/search-button
 */

import { useTranslations } from "next-intl"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ShortcutKey } from "@/components/ui/shortcut-key"
import { useCommandPalette } from "@/components/providers/keyboard-shortcuts-provider"

interface SearchButtonProps {
  variant?: "icon" | "default"
  className?: string
}

/**
 * Button that triggers the command palette
 *
 * @example
 * ```tsx
 * <SearchButton />
 * // or
 * <SearchButton variant="default" />
 * ```
 */
export function SearchButton({ variant = "icon", className }: SearchButtonProps) {
  const t = useTranslations("common")
  const { open } = useCommandPalette()

  if (variant === "icon") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={className || "h-9 w-9 shrink-0 bg-transparent"}
            onClick={open}
          >
            <Search className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          <span>{t("search")}</span>
          <ShortcutKey binding="mod+k" size="sm" variant="ghost" />
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Button
      variant="outline"
      className={className || "w-full justify-start text-muted-foreground"}
      onClick={open}
    >
      <Search className="mr-2 h-4 w-4" />
      <span className="flex-1 text-left">{t("searchPlaceholder")}</span>
      <ShortcutKey binding="mod+k" size="sm" variant="ghost" />
    </Button>
  )
}
