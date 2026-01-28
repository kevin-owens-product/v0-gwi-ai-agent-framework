/**
 * @prompt-id forge-v4.1:feature:email-template-management:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { } from "@/components/ui/tabs"
import { Monitor, Smartphone, Tablet, Mail, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface TemplateVariable {
  name: string
  description: string
  required: boolean
  defaultValue?: string
}

interface TemplatePreviewProps {
  html: string
  subject: string
  previewData: Record<string, string>
  onPreviewDataChange: (data: Record<string, string>) => void
  variables: TemplateVariable[]
}

type DeviceType = "desktop" | "tablet" | "mobile"

const DEVICE_WIDTHS: Record<DeviceType, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
}

export function TemplatePreview({
  html,
  subject,
  previewData,
  onPreviewDataChange,
  variables,
}: TemplatePreviewProps) {
  const t = useTranslations("admin.emailTemplates")
  const [device, setDevice] = useState<DeviceType>("desktop")
  const [showDataPanel, setShowDataPanel] = useState(true)

  // Render subject with variables
  const renderedSubject = subject.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
    return previewData[variableName] ?? match
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Preview Panel */}
      <div className={cn("space-y-4", showDataPanel ? "lg:col-span-3" : "lg:col-span-4")}>
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>{t("preview.title")}</CardTitle>
              <div className="flex items-center gap-2">
                {/* Device Toggle */}
                <div className="flex items-center bg-muted rounded-lg p-1">
                  <Button
                    variant={device === "desktop" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 px-3"
                    onClick={() => setDevice("desktop")}
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={device === "tablet" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 px-3"
                    onClick={() => setDevice("tablet")}
                  >
                    <Tablet className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={device === "mobile" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 px-3"
                    onClick={() => setDevice("mobile")}
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDataPanel(!showDataPanel)}
                >
                  {showDataPanel ? t("preview.hideData") : t("preview.showData")}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Email Client Chrome */}
            <div className="border rounded-lg overflow-hidden bg-background">
              {/* Email Header */}
              <div className="border-b bg-muted/50 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground w-16">{t("preview.from")}:</span>
                  <span className="text-sm">GWI AI Platform &lt;noreply@gwi-platform.com&gt;</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground w-16">{t("preview.to")}:</span>
                  <span className="text-sm">recipient@example.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground w-16">{t("preview.subject")}:</span>
                  <span className="text-sm font-medium">{renderedSubject}</span>
                </div>
              </div>

              {/* Email Body */}
              <div
                className="bg-white transition-all duration-300 ease-in-out mx-auto"
                style={{
                  maxWidth: DEVICE_WIDTHS[device],
                  minHeight: "400px",
                }}
              >
                {html ? (
                  <iframe
                    srcDoc={html}
                    className="w-full border-0"
                    style={{ minHeight: "600px" }}
                    title="Email Preview"
                    sandbox="allow-same-origin"
                  />
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                    <div className="text-center">
                      <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{t("preview.noContent")}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Data Panel */}
      {showDataPanel && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{t("preview.previewData")}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const defaults: Record<string, string> = {}
                    variables.forEach((v) => {
                      if (v.defaultValue) {
                        defaults[v.name] = v.defaultValue
                      }
                    })
                    onPreviewDataChange(defaults)
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  {t("preview.reset")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">
                {t("preview.editValuesHint")}
              </p>
              {variables.map((variable) => (
                <div key={variable.name} className="space-y-1.5">
                  <Label className="text-xs font-mono">
                    {variable.name}
                    {variable.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <Input
                    value={previewData[variable.name] || ""}
                    onChange={(e) =>
                      onPreviewDataChange({
                        ...previewData,
                        [variable.name]: e.target.value,
                      })
                    }
                    placeholder={variable.defaultValue || variable.description}
                    className="text-sm"
                  />
                  {variable.description && (
                    <p className="text-xs text-muted-foreground">{variable.description}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
