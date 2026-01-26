/**
 * Theme Toggle Component
 *
 * A dropdown component for switching between Light, Dark, and System theme modes.
 * Features animated icon transitions and accessibility support.
 *
 * @prompt-id forge-v4.1:feature:dark-mode:002
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 *
 * @module components/ui/theme-toggle
 */

"use client"

import * as React from "react"
import { Moon, Sun, Monitor, Check } from "lucide-react"
import { useTheme as useNextTheme } from "next-themes"

type Theme = "light" | "dark" | "system"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

/**
 * Theme option configuration
 */
interface ThemeOption {
  value: Theme
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

/**
 * Available theme options
 */
const themeOptions: ThemeOption[] = [
  {
    value: "light",
    label: "Light",
    icon: Sun,
    description: "Light background with dark text",
  },
  {
    value: "dark",
    label: "Dark",
    icon: Moon,
    description: "Dark background with light text",
  },
  {
    value: "system",
    label: "System",
    icon: Monitor,
    description: "Match your system settings",
  },
]

/**
 * Props for the ThemeToggle component
 */
interface ThemeToggleProps {
  /** Additional class names */
  className?: string
  /** Button size variant */
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg"
  /** Button variant */
  variant?: "default" | "ghost" | "outline" | "secondary"
  /** Show label next to icon */
  showLabel?: boolean
  /** Alignment of dropdown menu */
  align?: "start" | "center" | "end"
  /** Callback when theme changes */
  onThemeChange?: (theme: Theme) => void
}

/**
 * ThemeToggle component providing a dropdown menu to switch themes.
 *
 * Features:
 * - Animated icon transition between sun/moon
 * - Dropdown with Light/Dark/System options
 * - Check mark indicator for current theme
 * - Accessible keyboard navigation
 *
 * @component
 *
 * @example
 * Basic usage
 * ```tsx
 * <ThemeToggle />
 * ```
 *
 * @example
 * With label and outline variant
 * ```tsx
 * <ThemeToggle showLabel variant="outline" />
 * ```
 *
 * @example
 * In header with callback
 * ```tsx
 * <ThemeToggle
 *   align="end"
 *   onThemeChange={(theme) => console.log('Theme changed to:', theme)}
 * />
 * ```
 */
export function ThemeToggle({
  className,
  size = "icon",
  variant = "ghost",
  showLabel = false,
  align = "end",
  onThemeChange,
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useNextTheme()
  const [mounted, setMounted] = React.useState(false)

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeChange = React.useCallback(
    (newTheme: Theme) => {
      setTheme(newTheme)
      onThemeChange?.(newTheme)
    },
    [setTheme, onThemeChange]
  )

  // Get current icon based on resolved theme
  const CurrentIcon = React.useMemo(() => {
    if (!mounted) return Sun
    return resolvedTheme === "dark" ? Moon : Sun
  }, [mounted, resolvedTheme])

  // Get label for current theme
  const currentLabel = React.useMemo(() => {
    const option = themeOptions.find((opt) => opt.value === theme)
    return option?.label || "Theme"
  }, [theme])

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn("relative", className)}
        disabled
      >
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        {showLabel && <span className="ml-2">Theme</span>}
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn("relative", className)}
        >
          <div className="relative h-[1.2rem] w-[1.2rem]">
            <Sun
              className={cn(
                "absolute h-[1.2rem] w-[1.2rem] transition-all duration-300",
                resolvedTheme === "dark"
                  ? "rotate-90 scale-0 opacity-0"
                  : "rotate-0 scale-100 opacity-100"
              )}
            />
            <Moon
              className={cn(
                "absolute h-[1.2rem] w-[1.2rem] transition-all duration-300",
                resolvedTheme === "dark"
                  ? "rotate-0 scale-100 opacity-100"
                  : "-rotate-90 scale-0 opacity-0"
              )}
            />
          </div>
          {showLabel && <span className="ml-2">{currentLabel}</span>}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-40">
        {themeOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleThemeChange(option.value)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <option.icon className="h-4 w-4" />
              <span>{option.label}</span>
            </div>
            {theme === option.value && (
              <Check className="h-4 w-4 text-accent" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Simple theme toggle button that cycles through themes
 *
 * @component
 *
 * @example
 * ```tsx
 * <ThemeToggleSimple />
 * ```
 */
export function ThemeToggleSimple({
  className,
  size = "icon",
  variant = "ghost",
}: Pick<ThemeToggleProps, "className" | "size" | "variant">) {
  const { theme, setTheme, resolvedTheme } = useNextTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const cycleTheme = React.useCallback(() => {
    const themes: Theme[] = ["light", "dark", "system"]
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }, [theme, setTheme])

  if (!mounted) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={cycleTheme}
    >
      <div className="relative h-[1.2rem] w-[1.2rem]">
        <Sun
          className={cn(
            "absolute h-[1.2rem] w-[1.2rem] transition-all duration-300",
            resolvedTheme === "dark"
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          )}
        />
        <Moon
          className={cn(
            "absolute h-[1.2rem] w-[1.2rem] transition-all duration-300",
            resolvedTheme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          )}
        />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

export { themeOptions }
export type { ThemeOption, ThemeToggleProps }
