"use client"

/**
 * Keyboard Shortcuts Settings Page
 *
 * Allows users to view, enable/disable, and customize keyboard shortcuts.
 *
 * @module app/dashboard/settings/shortcuts/page
 */

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2, RotateCcw, AlertTriangle, Keyboard, Edit2 } from "lucide-react"
import { PageTracker } from "@/components/tracking/PageTracker"
import { ShortcutKey } from "@/components/ui/shortcut-key"
import {
  DEFAULT_SHORTCUTS,
  getShortcutsByCategory,
  CATEGORY_LABELS,
  detectConflicts,
  type ShortcutCategory,
  type ShortcutDefinition,
  type CustomShortcuts,
} from "@/lib/keyboard-shortcuts"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { cn } from "@/lib/utils"

const DEFAULT_CUSTOM_SHORTCUTS: CustomShortcuts = {
  bindings: {},
  disabled: [],
}

export default function ShortcutsSettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [editingShortcut, setEditingShortcut] = useState<ShortcutDefinition | null>(null)
  const [recordingKey, setRecordingKey] = useState(false)
  const [recordedBinding, setRecordedBinding] = useState("")

  // Global shortcuts enabled state
  const [shortcutsEnabled, setShortcutsEnabled] = useLocalStorage(
    "keyboard-shortcuts-enabled",
    true
  )

  // Custom shortcut bindings
  const [customShortcuts, setCustomShortcuts] = useLocalStorage<CustomShortcuts>(
    "custom-shortcuts",
    DEFAULT_CUSTOM_SHORTCUTS
  )

  // Merge defaults with custom settings
  const shortcuts = DEFAULT_SHORTCUTS.map((shortcut) => ({
    ...shortcut,
    defaultBinding: customShortcuts.bindings[shortcut.id] || shortcut.defaultBinding,
    enabledByDefault: !customShortcuts.disabled.includes(shortcut.id),
  }))

  const groupedShortcuts = getShortcutsByCategory(shortcuts)
  const conflicts = detectConflicts(shortcuts)

  // Toggle individual shortcut
  const toggleShortcut = useCallback(
    (shortcutId: string, enabled: boolean) => {
      setCustomShortcuts((prev) => {
        const newDisabled = enabled
          ? prev.disabled.filter((id) => id !== shortcutId)
          : [...prev.disabled, shortcutId]
        return { ...prev, disabled: newDisabled }
      })
    },
    [setCustomShortcuts]
  )

  // Update shortcut binding
  const updateBinding = useCallback(
    (shortcutId: string, binding: string) => {
      setCustomShortcuts((prev) => ({
        ...prev,
        bindings: { ...prev.bindings, [shortcutId]: binding },
      }))
    },
    [setCustomShortcuts]
  )

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setCustomShortcuts(DEFAULT_CUSTOM_SHORTCUTS)
    setShowResetDialog(false)
  }, [setCustomShortcuts])

  // Handle key recording for custom bindings
  useEffect(() => {
    if (!recordingKey || !editingShortcut) return

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault()
      event.stopPropagation()

      const parts: string[] = []

      // Check for modifier keys
      if (event.metaKey || event.ctrlKey) parts.push("mod")
      if (event.shiftKey) parts.push("shift")
      if (event.altKey) parts.push("alt")

      // Get the main key
      let key = event.key.toLowerCase()

      // Ignore standalone modifier keys
      if (["control", "meta", "shift", "alt"].includes(key)) return

      // Special key mappings
      if (key === " ") key = "space"

      parts.push(key)

      const binding = parts.join("+")
      setRecordedBinding(binding)
      setRecordingKey(false)
    }

    window.addEventListener("keydown", handleKeyDown, true)
    return () => window.removeEventListener("keydown", handleKeyDown, true)
  }, [recordingKey, editingShortcut])

  // Save edited shortcut
  const saveEditedShortcut = useCallback(() => {
    if (!editingShortcut || !recordedBinding) return

    updateBinding(editingShortcut.id, recordedBinding)
    setEditingShortcut(null)
    setRecordedBinding("")
  }, [editingShortcut, recordedBinding, updateBinding])

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setEditingShortcut(null)
    setRecordedBinding("")
    setRecordingKey(false)
  }, [])

  // Mock save (in real app, this would sync to server)
  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsSaving(false)
  }

  return (
    <div className="p-6 max-w-3xl">
      <PageTracker pageName="Settings - Shortcuts" />

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Keyboard className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Keyboard Shortcuts</h1>
        </div>
        <p className="text-muted-foreground">
          Customize keyboard shortcuts to work the way you prefer
        </p>
      </div>

      {/* Global Enable/Disable */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="shortcuts-enabled" className="text-base font-medium">
                Enable Keyboard Shortcuts
              </Label>
              <p className="text-sm text-muted-foreground">
                Turn off to disable all keyboard shortcuts globally
              </p>
            </div>
            <Switch
              id="shortcuts-enabled"
              checked={shortcutsEnabled}
              onCheckedChange={setShortcutsEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Conflicts Warning */}
      {conflicts.length > 0 && (
        <Card className="mb-6 border-amber-500/50 bg-amber-500/10">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <p className="font-medium text-amber-600 dark:text-amber-400">
                  Shortcut Conflicts Detected
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  The following shortcuts have the same key binding:
                </p>
                <ul className="mt-2 space-y-1">
                  {conflicts.map((conflict, index) => (
                    <li key={index} className="text-sm">
                      <ShortcutKey binding={conflict.binding} size="sm" /> -{" "}
                      {conflict.shortcutIds
                        .map(
                          (id) =>
                            shortcuts.find((s) => s.id === id)?.name || id
                        )
                        .join(", ")}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shortcuts by Category */}
      <div className="space-y-6">
        {(Object.keys(groupedShortcuts) as ShortcutCategory[]).map((category) => {
          const categoryShortcuts = groupedShortcuts[category]
          if (categoryShortcuts.length === 0) return null

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{CATEGORY_LABELS[category]}</CardTitle>
                <CardDescription>
                  {category === "navigation" && "Navigate around the application"}
                  {category === "actions" && "Perform common actions quickly"}
                  {category === "ui" && "Control the user interface"}
                  {category === "editing" && "Edit content efficiently"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryShortcuts.map((shortcut) => (
                  <ShortcutRow
                    key={shortcut.id}
                    shortcut={shortcut}
                    enabled={shortcut.enabledByDefault}
                    onToggle={(enabled) => toggleShortcut(shortcut.id, enabled)}
                    onEdit={() => {
                      setEditingShortcut(shortcut)
                      setRecordedBinding(shortcut.defaultBinding)
                    }}
                    disabled={!shortcutsEnabled}
                  />
                ))}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => setShowResetDialog(true)}
          disabled={isSaving}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Keyboard Shortcuts</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore all keyboard shortcuts to their default settings.
              Any custom bindings you have set will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={resetToDefaults}>
              Reset to Defaults
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Shortcut Dialog */}
      <Dialog open={!!editingShortcut} onOpenChange={(open) => !open && cancelEditing()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Shortcut</DialogTitle>
            <DialogDescription>
              {editingShortcut?.customizable
                ? "Press the keys you want to use for this shortcut"
                : "This shortcut cannot be customized"}
            </DialogDescription>
          </DialogHeader>

          {editingShortcut && (
            <div className="py-4">
              <div className="mb-4">
                <Label className="text-sm font-medium">Action</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {editingShortcut.name} - {editingShortcut.description}
                </p>
              </div>

              <div className="mb-4">
                <Label className="text-sm font-medium">Current Binding</Label>
                <div className="mt-2">
                  <ShortcutKey
                    binding={
                      customShortcuts.bindings[editingShortcut.id] ||
                      editingShortcut.defaultBinding
                    }
                    size="lg"
                    variant="outline"
                  />
                </div>
              </div>

              {editingShortcut.customizable && (
                <div>
                  <Label className="text-sm font-medium">New Binding</Label>
                  <div className="mt-2 flex items-center gap-3">
                    <div
                      className={cn(
                        "flex-1 h-12 flex items-center justify-center rounded-md border-2 border-dashed transition-colors",
                        recordingKey
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-muted-foreground/30"
                      )}
                    >
                      {recordingKey ? (
                        <span className="text-sm text-muted-foreground animate-pulse">
                          Press keys...
                        </span>
                      ) : recordedBinding ? (
                        <ShortcutKey binding={recordedBinding} size="lg" />
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Click to record
                        </span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setRecordingKey(true)}
                      disabled={recordingKey}
                    >
                      {recordingKey ? "Recording..." : "Record"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={cancelEditing}>
              Cancel
            </Button>
            {editingShortcut?.customizable && (
              <Button
                onClick={saveEditedShortcut}
                disabled={!recordedBinding || recordingKey}
              >
                Save
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/**
 * Individual shortcut settings row
 */
function ShortcutRow({
  shortcut,
  enabled,
  onToggle,
  onEdit,
  disabled,
}: {
  shortcut: ShortcutDefinition
  enabled: boolean
  onToggle: (enabled: boolean) => void
  onEdit: () => void
  disabled?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-3 px-4 rounded-lg transition-colors",
        disabled ? "opacity-50" : "hover:bg-muted/50"
      )}
    >
      <div className="flex-1 min-w-0 mr-4">
        <div className="flex items-center gap-2">
          <p className="font-medium">{shortcut.name}</p>
          {shortcut.customizable && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onEdit}
              disabled={disabled}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{shortcut.description}</p>
      </div>

      <div className="flex items-center gap-4">
        <ShortcutKey
          binding={shortcut.defaultBinding}
          variant={enabled && !disabled ? "outline" : "ghost"}
          className={cn(!enabled && "opacity-50")}
        />
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
          disabled={disabled || !shortcut.customizable}
        />
      </div>
    </div>
  )
}
