"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun, Moon, Monitor, Loader2 } from "lucide-react"

const themes = [
  {
    id: "light",
    label: "Light",
    description: "Light background with dark text",
    icon: Sun,
  },
  {
    id: "dark",
    label: "Dark",
    description: "Dark background with light text",
    icon: Moon,
  },
  {
    id: "system",
    label: "System",
    description: "Automatically match your system settings",
    icon: Monitor,
  },
]

const accentColors = [
  { id: "blue", color: "#3b82f6", label: "Blue" },
  { id: "purple", color: "#8b5cf6", label: "Purple" },
  { id: "green", color: "#22c55e", label: "Green" },
  { id: "orange", color: "#f97316", label: "Orange" },
  { id: "pink", color: "#ec4899", label: "Pink" },
]

export default function AppearanceSettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [theme, setTheme] = useState("dark")
  const [accentColor, setAccentColor] = useState("blue")

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Appearance</h1>
        <p className="text-muted-foreground">Customize how GWI Agents looks on your device</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>Select your preferred color scheme</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={theme} onValueChange={setTheme} className="grid gap-4 md:grid-cols-3">
              {themes.map((themeOption) => (
                <Label key={themeOption.id} htmlFor={themeOption.id} className="cursor-pointer">
                  <Card
                    className={`transition-all ${
                      theme === themeOption.id
                        ? "border-primary ring-2 ring-primary/20"
                        : "hover:border-muted-foreground/50"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={themeOption.id} id={themeOption.id} />
                        <themeOption.icon className="h-5 w-5" />
                        <div>
                          <p className="font-medium">{themeOption.label}</p>
                          <p className="text-xs text-muted-foreground">{themeOption.description}</p>
                        </div>
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
            <CardDescription>Choose your preferred accent color for buttons and highlights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {accentColors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setAccentColor(color.id)}
                  className={`h-10 w-10 rounded-full transition-transform ${
                    accentColor === color.id
                      ? "ring-2 ring-offset-2 ring-offset-background scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{
                    backgroundColor: color.color,
                    ringColor: color.color,
                  }}
                  title={color.label}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>See how your settings will look</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  G
                </div>
                <div>
                  <h4 className="font-semibold">GWI Agents</h4>
                  <p className="text-sm text-muted-foreground">AI-powered consumer intelligence</p>
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
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
