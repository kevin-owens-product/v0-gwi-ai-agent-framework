/**
 * @prompt-id forge-v4.1:feature:email-template-management:001
 * @generated-at 2026-01-25T00:00:00Z
 * @model claude-opus-4-5
 */

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Copy, Check, Variable } from "lucide-react"

interface TemplateVariable {
  name: string
  description: string
  required: boolean
  defaultValue?: string
}

interface VariableInserterProps {
  variables: TemplateVariable[]
  onInsert: (variableName: string) => void
  previewData: Record<string, string>
  onPreviewDataChange: (data: Record<string, string>) => void
}

export function VariableInserter({
  variables,
  onInsert,
  previewData,
  onPreviewDataChange,
}: VariableInserterProps) {
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null)

  const copyToClipboard = async (variableName: string) => {
    const text = `{{${variableName}}}`
    await navigator.clipboard.writeText(text)
    setCopiedVariable(variableName)
    setTimeout(() => setCopiedVariable(null), 2000)
  }

  const requiredVars = variables.filter((v) => v.required)
  const optionalVars = variables.filter((v) => !v.required)

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Variable className="h-5 w-5" />
            <CardTitle className="text-base">Variables</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Click a variable to insert it at the cursor position, or copy to clipboard.
          </p>

          <Accordion type="multiple" defaultValue={["required", "optional", "preview"]}>
            {/* Required Variables */}
            {requiredVars.length > 0 && (
              <AccordionItem value="required">
                <AccordionTrigger className="text-sm py-2">
                  <div className="flex items-center gap-2">
                    Required Variables
                    <Badge variant="destructive" className="text-xs">
                      {requiredVars.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {requiredVars.map((variable) => (
                      <VariableItem
                        key={variable.name}
                        variable={variable}
                        onInsert={onInsert}
                        onCopy={copyToClipboard}
                        isCopied={copiedVariable === variable.name}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Optional Variables */}
            {optionalVars.length > 0 && (
              <AccordionItem value="optional">
                <AccordionTrigger className="text-sm py-2">
                  <div className="flex items-center gap-2">
                    Optional Variables
                    <Badge variant="secondary" className="text-xs">
                      {optionalVars.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {optionalVars.map((variable) => (
                      <VariableItem
                        key={variable.name}
                        variable={variable}
                        onInsert={onInsert}
                        onCopy={copyToClipboard}
                        isCopied={copiedVariable === variable.name}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Preview Data */}
            <AccordionItem value="preview">
              <AccordionTrigger className="text-sm py-2">
                Preview Values
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Set values for live preview while editing.
                  </p>
                  {variables.map((variable) => (
                    <div key={variable.name} className="space-y-1">
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
                        placeholder={variable.defaultValue || "Enter value..."}
                        className="text-sm h-8"
                      />
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Common Variables Helper */}
          <div className="pt-4 border-t">
            <h4 className="text-xs font-medium mb-2">Common Variables</h4>
            <div className="flex flex-wrap gap-1">
              {["platformName", "userName", "userEmail", "supportUrl", "dashboardUrl"].map(
                (name) => (
                  <Button
                    key={name}
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs px-2"
                    onClick={() => onInsert(name)}
                  >
                    {name}
                  </Button>
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

interface VariableItemProps {
  variable: TemplateVariable
  onInsert: (name: string) => void
  onCopy: (name: string) => void
  isCopied: boolean
}

function VariableItem({ variable, onInsert, onCopy, isCopied }: VariableItemProps) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <button
        className="flex-1 text-left"
        onClick={() => onInsert(variable.name)}
      >
        <div className="flex items-center gap-2">
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
            {`{{${variable.name}}}`}
          </code>
          {variable.required && (
            <Badge variant="destructive" className="text-[10px] h-4 px-1">
              Required
            </Badge>
          )}
        </div>
        {variable.description && (
          <p className="text-xs text-muted-foreground mt-1">{variable.description}</p>
        )}
        {variable.defaultValue && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Default: <code className="text-xs">{variable.defaultValue}</code>
          </p>
        )}
      </button>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation()
                onCopy(variable.name)
              }}
            >
              {isCopied ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy to clipboard</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
