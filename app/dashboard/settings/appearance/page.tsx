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
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Sun, Moon, Monitor, Loader2, Check } from "lucide-react"
import { PageTracker } from "@/components/tracking/PageTracker"
import { useTheme, type Theme } from "@/components/providers/theme-provider"
import { usePreferences, type Theme as DbTheme } from "@/hooks/use-preferences"

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

const accentColorValues = [
  { id: "purple", color: "#8b5cf6" },
  { id: "blue", color: "#3b82f6" },
  { id: "green", color: "#22c55e" },
  { id: "orange", color: "#f97316" },
  { id: "pink", color: "#ec4899" },
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
  const t = useTranslations("settings.appearance")
  const tTheme = useTranslations("ui.theme")
  const { theme, setTheme, resolvedTheme } = useTheme()
  const {
    preferences,
    updatePreferences,
    isLoading,
    isUpdating,
    error
  } = usePreferences()

  const themes = [
    {
      id: "light" as const,
      dbValue: "LIGHT" as const,
      label: tTheme("light"),
      description: tTheme("lightDesc"),
      icon: themeIcons.light,
    },
    {
      id: "dark" as const,
      dbValue: "DARK" as const,
      label: tTheme("dark"),
      description: tTheme("darkDesc"),
      icon: themeIcons.dark,
    },
    {
      id: "system" as const,
      dbValue: "SYSTEM" as const,
      label: tTheme("system"),
      description: tTheme("systemDesc"),
      icon: themeIcons.system,
    },
  ]

  const accentColors = accentColorValues.map(c => ({
    ...c,
    label: t(`accentColors.${c.id}`),
  }))

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
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("description")}
        </p>
      </div>

      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">
              {t("errorLoadingPreferences")}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{tTheme("theme")}</CardTitle>
            <CardDescription>
              {t("themeDescription")}
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
            <CardTitle>{t("accentColor")}</CardTitle>
            <CardDescription>
              {t("accentColorDescription")}
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
                  title={`${color.label} - ${t("comingSoon")}`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {t("accentColorComingSoon")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("displayOptions")}</CardTitle>
            <CardDescription>
              {t("displayOptionsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="compact-mode">{t("compactMode")}</Label>
                <p className="text-xs text-muted-foreground">
                  {t("compactModeDescription")}
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
                <Label htmlFor="sidebar-collapsed">{t("collapsedSidebar")}</Label>
                <p className="text-xs text-muted-foreground">
                  {t("collapsedSidebarDescription")}
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
            <CardTitle>{t("preview")}</CardTitle>
            <CardDescription>{t("previewDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border p-6 space-y-4 bg-card">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center text-accent-foreground font-bold">
                  G
                </div>
                <div>
                  <h4 className="font-semibold">{t("previewBrandName")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("previewTagline")}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm">{t("previewPrimaryButton")}</Button>
                <Button size="sm" variant="outline">
                  {t("previewSecondaryButton")}
                </Button>
                <Button size="sm" variant="ghost">
                  {t("previewGhostButton")}
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{t("currentTheme")}:</span>
                <span className="font-medium capitalize">
                  {resolvedTheme || t("loading")}
                </span>
                {theme === "system" && (
                  <span className="text-xs text-muted-foreground">
                    ({t("followingSystem")})
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {isUpdating && (
          <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t("savingPreferences")}</span>
          </div>
        )}
      </div>
    </div>
  )
}
