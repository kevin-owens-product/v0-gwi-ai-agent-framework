/**
 * Appearance Settings Page
 *
 * Allows users to customize theme, accent colors, and display preferences.
 * Integrates with the ThemeProvider and preferences API.
 *
 * @prompt-id forge-v4.1:feature:dark-mode:006
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Sun, Moon, Monitor, Loader2, Check } from "lucide-react"
import { PageTracker } from "@/components/tracking/PageTracker"
import { useTheme, type Theme } from "@/components/providers/theme-provider"
import { usePreferences, type Theme as DbTheme } from "@/hooks/use-preferences"

const themes = [
  {
    id: "light" as const,
    dbValue: "LIGHT" as const,
    label: "Light",
    description: "Light background with dark text",
    icon: Sun,
  },
  {
    id: "dark" as const,
    dbValue: "DARK" as const,
    label: "Dark",
    description: "Dark background with light text",
    icon: Moon,
  },
  {
    id: "system" as const,
    dbValue: "SYSTEM" as const,
    label: "System",
    description: "Automatically match your system settings",
    icon: Monitor,
  },
]

const accentColors = [
  { id: "purple", color: "#8b5cf6", label: "Purple (Default)" },
  { id: "blue", color: "#3b82f6", label: "Blue" },
  { id: "green", color: "#22c55e", label: "Green" },
  { id: "orange", color: "#f97316", label: "Orange" },
  { id: "pink", color: "#ec4899", label: "Pink" },
]

/**
 * Convert theme name to database format
 */
function toDbTheme(theme: Theme): DbTheme {
  return theme.toUpperCase() as DbTheme
}

/**
 * Convert database theme to UI format
 */
function fromDbTheme(dbTheme: DbTheme): Theme {
  return dbTheme.toLowerCase() as Theme
}

export default function AppearanceSettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const {
    preferences,
    updatePreferences,
    isLoading,
    isUpdating,
    error
  } = usePreferences()

  // Sync theme from preferences on load
  useEffect(() => {
    if (preferences?.theme) {
      const uiTheme = fromDbTheme(preferences.theme)
      if (theme !== uiTheme) {
        setTheme(uiTheme)
      }
    }
  }, [preferences?.theme])

  /**
   * Handle theme change - update both UI and database
   */
  const handleThemeChange = useCallback(
    async (newTheme: Theme) => {
      // Update UI immediately
      setTheme(newTheme)

      // Persist to database
      await updatePreferences({ theme: toDbTheme(newTheme) })
    },
    [setTheme, updatePreferences]
  )

  /**
   * Handle compact mode toggle
   */
  const handleCompactModeChange = useCallback(
    async (enabled: boolean) => {
      await updatePreferences({ compactMode: enabled })
    },
    [updatePreferences]
  )

  /**
   * Handle sidebar collapsed toggle
   */
  const handleSidebarCollapsedChange = useCallback(
    async (collapsed: boolean) => {
      await updatePreferences({ sidebarCollapsed: collapsed })
    },
    [updatePreferences]
  )

  return (
    <div className="p-6 max-w-3xl">
      <PageTracker
        pageName="Settings - Appearance"
        metadata={{ theme, compactMode: preferences?.compactMode }}
      />
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Appearance</h1>
        <p className="text-muted-foreground">
          Customize how GWI Agents looks on your device
        </p>
      </div>

      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">
              Failed to load preferences. Some settings may not persist.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>
              Select your preferred color scheme. Changes apply immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={theme}
              onValueChange={(value) => handleThemeChange(value as Theme)}
              className="grid gap-4 md:grid-cols-3"
              disabled={isUpdating}
            >
              {themes.map((themeOption) => (
                <Label
                  key={themeOption.id}
                  htmlFor={themeOption.id}
                  className="cursor-pointer"
                >
                  <Card
                    className={`transition-all ${
                      theme === themeOption.id
                        ? "border-accent ring-2 ring-accent/20"
                        : "hover:border-muted-foreground/50"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={themeOption.id} id={themeOption.id} />
                        <themeOption.icon className="h-5 w-5" />
                        <div className="flex-1">
                          <p className="font-medium">{themeOption.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {themeOption.description}
                          </p>
                        </div>
                        {theme === themeOption.id && (
                          <Check className="h-4 w-4 text-accent" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accent Color</CardTitle>
            <CardDescription>
              Choose your preferred accent color for buttons and highlights
              (coming soon)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {accentColors.map((color) => (
                <button
                  key={color.id}
                  disabled
                  className={`h-10 w-10 rounded-full transition-transform opacity-50 cursor-not-allowed ${
                    color.id === "purple"
                      ? "ring-2 ring-offset-2 ring-offset-background"
                      : ""
                  }`}
                  style={{
                    backgroundColor: color.color,
                    ["--tw-ring-color" as string]: color.color,
                  }}
                  title={`${color.label} - Coming soon`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Custom accent colors will be available in a future update.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Display Options</CardTitle>
            <CardDescription>
              Adjust layout and display preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="compact-mode">Compact Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Reduce padding and spacing for a denser interface
                </p>
              </div>
              <Switch
                id="compact-mode"
                checked={preferences?.compactMode ?? false}
                onCheckedChange={handleCompactModeChange}
                disabled={isUpdating || isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sidebar-collapsed">Collapsed Sidebar</Label>
                <p className="text-xs text-muted-foreground">
                  Start with sidebar collapsed by default
                </p>
              </div>
              <Switch
                id="sidebar-collapsed"
                checked={preferences?.sidebarCollapsed ?? false}
                onCheckedChange={handleSidebarCollapsedChange}
                disabled={isUpdating || isLoading}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>See how your settings will look</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border p-6 space-y-4 bg-card">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center text-accent-foreground font-bold">
                  G
                </div>
                <div>
                  <h4 className="font-semibold">GWI Agents</h4>
                  <p className="text-sm text-muted-foreground">
                    AI-powered consumer intelligence
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm">Primary Button</Button>
                <Button size="sm" variant="outline">
                  Secondary
                </Button>
                <Button size="sm" variant="ghost">
                  Ghost
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Current theme:</span>
                <span className="font-medium capitalize">
                  {resolvedTheme || "loading..."}
                </span>
                {theme === "system" && (
                  <span className="text-xs text-muted-foreground">
                    (following system)
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {isUpdating && (
          <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Saving preferences...</span>
          </div>
        )}
      </div>
    </div>
  )
}
