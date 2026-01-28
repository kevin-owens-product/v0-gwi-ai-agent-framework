"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Settings,
  Link as LinkIcon,
  HelpCircle,
  MoveUp,
  MoveDown,
} from "lucide-react"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

interface QuestionOption {
  id: string
  label: string
  value?: string
  isOther?: boolean
}

interface ValidationRules {
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string
  required?: boolean
  minSelections?: number
  maxSelections?: number
}

interface TaxonomyLink {
  category?: string
  attribute?: string
}

interface QuestionFormData {
  code: string
  text: string
  type: string
  required: boolean
  helpText: string
  options: QuestionOption[]
  scaleConfig: {
    min: number
    max: number
    step: number
    leftLabel: string
    rightLabel: string
    showLabels: boolean
  }
  matrixConfig: {
    rows: QuestionOption[]
    columns: QuestionOption[]
  }
  validationRules: ValidationRules
  taxonomyLinks: TaxonomyLink | null
  randomizeOptions: boolean
  allowOther: boolean
  otherLabel: string
}

interface QuestionBuilderProps {
  surveyId: string
  question?: {
    id: string
    code: string
    text: string
    type: string
    required: boolean
    options: unknown
    validationRules: unknown
    taxonomyLinks: unknown
  } | null
  onSave: (data: {
    code: string
    text: string
    type: string
    required: boolean
    options: unknown
    validationRules: unknown
    taxonomyLinks: unknown | null
  }) => Promise<void>
  onCancel: () => void
}

export function QuestionBuilder({ surveyId, question, onSave, onCancel }: QuestionBuilderProps) {
  const t = useTranslations("gwi.surveys.questions")
  const [activeTab, setActiveTab] = useState("basic")
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState<QuestionFormData>({
    code: "",
    text: "",
    type: "SINGLE_SELECT",
    required: true,
    helpText: "",
    options: [],
    scaleConfig: {
      min: 1,
      max: 10,
      step: 1,
      leftLabel: "",
      rightLabel: "",
      showLabels: false,
    },
    matrixConfig: {
      rows: [],
      columns: [],
    },
    validationRules: {},
    taxonomyLinks: null,
    randomizeOptions: false,
    allowOther: false,
    otherLabel: "Other (please specify)",
  })

  useEffect(() => {
    if (question) {
      // Parse existing question data
      let options: QuestionOption[] = []
      let scaleConfig = {
        min: 1,
        max: 10,
        step: 1,
        leftLabel: "",
        rightLabel: "",
        showLabels: false,
      }
      let matrixConfig = {
        rows: [] as QuestionOption[],
        columns: [] as QuestionOption[],
      }
      let validationRules: ValidationRules = {}
      let taxonomyLinks: TaxonomyLink | null = null

      if (question.options) {
        const opts = question.options as unknown
        if (question.type === "SINGLE_SELECT" || question.type === "MULTI_SELECT") {
          if (Array.isArray(opts)) {
            options = opts.map((opt: unknown, idx: number) => {
              if (typeof opt === "string") {
                return { id: `opt-${idx}`, label: opt, value: opt }
              }
              if (typeof opt === "object" && opt !== null) {
                const obj = opt as Record<string, unknown>
                return {
                  id: `opt-${idx}`,
                  label: String(obj.label || obj.value || ""),
                  value: String(obj.value || obj.label || ""),
                  isOther: Boolean(obj.isOther),
                }
              }
              return { id: `opt-${idx}`, label: String(opt) }
            })
          }
        } else if (question.type === "SCALE") {
          if (typeof opts === "object" && opts !== null) {
            const scale = opts as Record<string, unknown>
            scaleConfig = {
              min: typeof scale.min === "number" ? scale.min : 1,
              max: typeof scale.max === "number" ? scale.max : 10,
              step: typeof scale.step === "number" ? scale.step : 1,
              leftLabel: String(scale.leftLabel || ""),
              rightLabel: String(scale.rightLabel || ""),
              showLabels: Boolean(scale.showLabels),
            }
          }
        } else if (question.type === "MATRIX") {
          if (typeof opts === "object" && opts !== null) {
            const matrix = opts as Record<string, unknown>
            const rows = Array.isArray(matrix.rows) ? matrix.rows : []
            const cols = Array.isArray(matrix.columns) ? matrix.columns : []
            matrixConfig = {
              rows: rows.map((r: unknown, idx: number) => ({
                id: `row-${idx}`,
                label: String(r),
                value: String(r),
              })),
              columns: cols.map((c: unknown, idx: number) => ({
                id: `col-${idx}`,
                label: String(c),
                value: String(c),
              })),
            }
          }
        }
      }

      if (question.validationRules) {
        validationRules = question.validationRules as ValidationRules
      }

      if (question.taxonomyLinks) {
        taxonomyLinks = question.taxonomyLinks as TaxonomyLink
      }

      setFormData({
        code: question.code,
        text: question.text,
        type: question.type,
        required: question.required,
        helpText: "",
        options,
        scaleConfig,
        matrixConfig,
        validationRules,
        taxonomyLinks,
        randomizeOptions: false,
        allowOther: options.some((opt) => opt.isOther),
        otherLabel: "Other (please specify)",
      })
    }
  }, [question])

  const addOption = () => {
    const newOption: QuestionOption = {
      id: `opt-${Date.now()}`,
      label: "",
      value: "",
    }
    setFormData({
      ...formData,
      options: [...formData.options, newOption],
    })
  }

  const updateOption = (id: string, field: keyof QuestionOption, value: unknown) => {
    setFormData({
      ...formData,
      options: formData.options.map((opt) =>
        opt.id === id ? { ...opt, [field]: value } : opt
      ),
    })
  }

  const removeOption = (id: string) => {
    setFormData({
      ...formData,
      options: formData.options.filter((opt) => opt.id !== id),
    })
  }

  const moveOption = (id: string, direction: "up" | "down") => {
    const index = formData.options.findIndex((opt) => opt.id === id)
    if (index === -1) return

    const newOptions = [...formData.options]
    if (direction === "up" && index > 0) {
      [newOptions[index - 1], newOptions[index]] = [newOptions[index], newOptions[index - 1]]
    } else if (direction === "down" && index < newOptions.length - 1) {
      [newOptions[index], newOptions[index + 1]] = [newOptions[index + 1], newOptions[index]]
    }

    setFormData({ ...formData, options: newOptions })
  }

  const addMatrixRow = () => {
    const newRow: QuestionOption = {
      id: `row-${Date.now()}`,
      label: "",
      value: "",
    }
    setFormData({
      ...formData,
      matrixConfig: {
        ...formData.matrixConfig,
        rows: [...formData.matrixConfig.rows, newRow],
      },
    })
  }

  const addMatrixColumn = () => {
    const newCol: QuestionOption = {
      id: `col-${Date.now()}`,
      label: "",
      value: "",
    }
    setFormData({
      ...formData,
      matrixConfig: {
        ...formData.matrixConfig,
        columns: [...formData.matrixConfig.columns, newCol],
      },
    })
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.code.trim()) {
      toast.error("Question code is required")
      return
    }
    if (!formData.text.trim()) {
      toast.error("Question text is required")
      return
    }

    if ((formData.type === "SINGLE_SELECT" || formData.type === "MULTI_SELECT") && formData.options.length === 0) {
      toast.error("Please add at least one option")
      return
    }

    if (formData.type === "SCALE" && formData.scaleConfig.min >= formData.scaleConfig.max) {
      toast.error("Maximum value must be greater than minimum value")
      return
    }

    if (formData.type === "MATRIX" && (formData.matrixConfig.rows.length === 0 || formData.matrixConfig.columns.length === 0)) {
      toast.error("Please add at least one row and one column")
      return
    }

    // Build options object
    let options: unknown = null
    if (formData.type === "SINGLE_SELECT" || formData.type === "MULTI_SELECT") {
      const opts = formData.options
        .filter((opt) => opt.label.trim() !== "")
        .map((opt) => ({
          label: opt.label.trim(),
          value: opt.value?.trim() || opt.label.trim(),
          isOther: opt.isOther || false,
        }))
      
      if (formData.allowOther && formData.otherLabel.trim()) {
        opts.push({
          label: formData.otherLabel.trim(),
          value: "other",
          isOther: true,
        })
      }
      
      options = formData.randomizeOptions ? { options: opts, randomize: true } : opts
    } else if (formData.type === "SCALE") {
      options = {
        min: formData.scaleConfig.min,
        max: formData.scaleConfig.max,
        step: formData.scaleConfig.step,
        leftLabel: formData.scaleConfig.leftLabel || undefined,
        rightLabel: formData.scaleConfig.rightLabel || undefined,
        showLabels: formData.scaleConfig.showLabels,
      }
    } else if (formData.type === "MATRIX") {
      options = {
        rows: formData.matrixConfig.rows
          .filter((r) => r.label.trim() !== "")
          .map((r) => r.label.trim()),
        columns: formData.matrixConfig.columns
          .filter((c) => c.label.trim() !== "")
          .map((c) => c.label.trim()),
      }
    }

    // Build validation rules
    const validationRules: ValidationRules = {}
    if (formData.type === "OPEN_TEXT" || formData.type === "NUMERIC") {
      if (formData.validationRules.minLength) {
        validationRules.minLength = formData.validationRules.minLength
      }
      if (formData.validationRules.maxLength) {
        validationRules.maxLength = formData.validationRules.maxLength
      }
      if (formData.validationRules.pattern) {
        validationRules.pattern = formData.validationRules.pattern
      }
    }
    if (formData.type === "NUMERIC") {
      if (formData.validationRules.min !== undefined) {
        validationRules.min = formData.validationRules.min
      }
      if (formData.validationRules.max !== undefined) {
        validationRules.max = formData.validationRules.max
      }
    }
    if (formData.type === "MULTI_SELECT") {
      if (formData.validationRules.minSelections) {
        validationRules.minSelections = formData.validationRules.minSelections
      }
      if (formData.validationRules.maxSelections) {
        validationRules.maxSelections = formData.validationRules.maxSelections
      }
    }

    await onSave({
      code: formData.code.trim(),
      text: formData.text.trim(),
      type: formData.type,
      required: formData.required,
      options,
      validationRules: Object.keys(validationRules).length > 0 ? validationRules : null,
      taxonomyLinks: formData.taxonomyLinks,
    })
  }

  const renderPreview = () => {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-semibold">
              {formData.text || "Question text"}
              {formData.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {formData.helpText && (
              <p className="text-sm text-muted-foreground mt-1">{formData.helpText}</p>
            )}
          </div>

          {formData.type === "SINGLE_SELECT" && (
            <RadioGroup>
              {formData.options.map((opt) => (
                <div key={opt.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt.value || opt.label} id={opt.id} />
                  <Label htmlFor={opt.id}>{opt.label || "Option"}</Label>
                </div>
              ))}
              {formData.allowOther && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">{formData.otherLabel}</Label>
                </div>
              )}
            </RadioGroup>
          )}

          {formData.type === "MULTI_SELECT" && (
            <div className="space-y-2">
              {formData.options.map((opt) => (
                <div key={opt.id} className="flex items-center space-x-2">
                  <Checkbox id={opt.id} />
                  <Label htmlFor={opt.id}>{opt.label || "Option"}</Label>
                </div>
              ))}
              {formData.allowOther && (
                <div className="flex items-center space-x-2">
                  <Checkbox id="other" />
                  <Label htmlFor="other">{formData.otherLabel}</Label>
                </div>
              )}
            </div>
          )}

          {formData.type === "SCALE" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">{formData.scaleConfig.leftLabel || formData.scaleConfig.min}</span>
                <span className="text-sm">{formData.scaleConfig.rightLabel || formData.scaleConfig.max}</span>
              </div>
              <div className="flex gap-2">
                {Array.from(
                  { length: (formData.scaleConfig.max - formData.scaleConfig.min) / formData.scaleConfig.step + 1 },
                  (_, i) => formData.scaleConfig.min + i * formData.scaleConfig.step
                ).map((val) => (
                  <Button key={val} variant="outline" size="sm">
                    {val}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {formData.type === "OPEN_TEXT" && (
            <Textarea placeholder="Enter your answer..." rows={3} disabled />
          )}

          {formData.type === "NUMERIC" && (
            <Input type="number" placeholder="Enter a number" disabled />
          )}

          {formData.type === "DATE" && (
            <Input type="date" disabled />
          )}

          {formData.type === "MATRIX" && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 text-left"></th>
                    {formData.matrixConfig.columns.map((col) => (
                      <th key={col.id} className="border p-2 text-center">
                        {col.label || "Column"}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {formData.matrixConfig.rows.map((row) => (
                    <tr key={row.id}>
                      <td className="border p-2 font-medium">{row.label || "Row"}</td>
                      {formData.matrixConfig.columns.map((col) => (
                        <td key={col.id} className="border p-2 text-center">
                          <RadioGroupItem value={`${row.id}-${col.id}`} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {question ? "Edit Question" : "Create New Question"}
          </h2>
          <p className="text-muted-foreground">
            Build professional survey questions with advanced features
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
        </div>
      </div>

      {showPreview && renderPreview()}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">
            <Settings className="h-4 w-4 mr-2" />
            Basic
          </TabsTrigger>
          <TabsTrigger value="options">
            <GripVertical className="h-4 w-4 mr-2" />
            Options
          </TabsTrigger>
          <TabsTrigger value="validation">
            <HelpCircle className="h-4 w-4 mr-2" />
            Validation
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <LinkIcon className="h-4 w-4 mr-2" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Set up the core question details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">
                    Question Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "") })
                    }
                    placeholder="Q1"
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Unique identifier (letters, numbers, and underscores only)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">
                    Question Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => {
                      setFormData({
                        ...formData,
                        type: value,
                        options: [],
                        scaleConfig: {
                          min: 1,
                          max: 10,
                          step: 1,
                          leftLabel: "",
                          rightLabel: "",
                          showLabels: false,
                        },
                        matrixConfig: { rows: [], columns: [] },
                        validationRules: {},
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SINGLE_SELECT">Single Select</SelectItem>
                      <SelectItem value="MULTI_SELECT">Multi Select</SelectItem>
                      <SelectItem value="SCALE">Scale</SelectItem>
                      <SelectItem value="OPEN_TEXT">Open Text</SelectItem>
                      <SelectItem value="NUMERIC">Numeric</SelectItem>
                      <SelectItem value="DATE">Date</SelectItem>
                      <SelectItem value="MATRIX">Matrix</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="text">
                  Question Text <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="text"
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Enter your question here..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="helpText">Help Text / Instructions</Label>
                <Textarea
                  id="helpText"
                  value={formData.helpText}
                  onChange={(e) => setFormData({ ...formData, helpText: e.target.value })}
                  placeholder="Optional instructions to help respondents answer..."
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  This text appears below the question to provide guidance
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="required"
                  checked={formData.required}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, required: checked })
                  }
                />
                <Label htmlFor="required">Required Question</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="options" className="space-y-4">
          {(formData.type === "SINGLE_SELECT" || formData.type === "MULTI_SELECT") && (
            <Card>
              <CardHeader>
                <CardTitle>Answer Options</CardTitle>
                <CardDescription>
                  Add the choices respondents can select from
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div key={option.id} className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <Input
                        value={option.label}
                        onChange={(e) =>
                          updateOption(option.id, "label", e.target.value)
                        }
                        placeholder={`Option ${index + 1}`}
                        className="flex-1"
                      />
                      <Input
                        value={option.value || ""}
                        onChange={(e) =>
                          updateOption(option.id, "value", e.target.value)
                        }
                        placeholder="Value (optional)"
                        className="w-32 font-mono text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveOption(option.id, "up")}
                        disabled={index === 0}
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveOption(option.id, "down")}
                        disabled={index === formData.options.length - 1}
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(option.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" onClick={addOption} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>

                <div className="pt-4 border-t space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allowOther"
                      checked={formData.allowOther}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, allowOther: checked })
                      }
                    />
                    <Label htmlFor="allowOther">Allow "Other" option</Label>
                  </div>
                  {formData.allowOther && (
                    <div className="space-y-2">
                      <Label htmlFor="otherLabel">Other Option Label</Label>
                      <Input
                        id="otherLabel"
                        value={formData.otherLabel}
                        onChange={(e) =>
                          setFormData({ ...formData, otherLabel: e.target.value })
                        }
                        placeholder="Other (please specify)"
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="randomize"
                      checked={formData.randomizeOptions}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, randomizeOptions: checked })
                      }
                    />
                    <Label htmlFor="randomize">Randomize option order</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {formData.type === "SCALE" && (
            <Card>
              <CardHeader>
                <CardTitle>Scale Configuration</CardTitle>
                <CardDescription>Configure the numeric scale</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scaleMin">Minimum Value</Label>
                    <Input
                      id="scaleMin"
                      type="number"
                      value={formData.scaleConfig.min}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scaleConfig: {
                            ...formData.scaleConfig,
                            min: parseInt(e.target.value) || 1,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scaleMax">Maximum Value</Label>
                    <Input
                      id="scaleMax"
                      type="number"
                      value={formData.scaleConfig.max}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scaleConfig: {
                            ...formData.scaleConfig,
                            max: parseInt(e.target.value) || 10,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scaleStep">Step Size</Label>
                    <Input
                      id="scaleStep"
                      type="number"
                      value={formData.scaleConfig.step}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scaleConfig: {
                            ...formData.scaleConfig,
                            step: parseInt(e.target.value) || 1,
                          },
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="leftLabel">Left Label (Optional)</Label>
                    <Input
                      id="leftLabel"
                      value={formData.scaleConfig.leftLabel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scaleConfig: {
                            ...formData.scaleConfig,
                            leftLabel: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g., Not at all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rightLabel">Right Label (Optional)</Label>
                    <Input
                      id="rightLabel"
                      value={formData.scaleConfig.rightLabel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scaleConfig: {
                            ...formData.scaleConfig,
                            rightLabel: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g., Extremely"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showLabels"
                    checked={formData.scaleConfig.showLabels}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        scaleConfig: {
                          ...formData.scaleConfig,
                          showLabels: checked,
                        },
                      })
                    }
                  />
                  <Label htmlFor="showLabels">Show labels on scale</Label>
                </div>
              </CardContent>
            </Card>
          )}

          {formData.type === "MATRIX" && (
            <Card>
              <CardHeader>
                <CardTitle>Matrix Configuration</CardTitle>
                <CardDescription>Define rows and columns for the matrix</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Rows</Label>
                    <Button variant="outline" size="sm" onClick={addMatrixRow}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Row
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.matrixConfig.rows.map((row, index) => (
                      <div key={row.id} className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <Input
                          value={row.label}
                          onChange={(e) => {
                            const newRows = formData.matrixConfig.rows.map((r) =>
                              r.id === row.id ? { ...r, label: e.target.value } : r
                            )
                            setFormData({
                              ...formData,
                              matrixConfig: { ...formData.matrixConfig, rows: newRows },
                            })
                          }}
                          placeholder={`Row ${index + 1}`}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newRows = formData.matrixConfig.rows.filter((r) => r.id !== row.id)
                            setFormData({
                              ...formData,
                              matrixConfig: { ...formData.matrixConfig, rows: newRows },
                            })
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Columns</Label>
                    <Button variant="outline" size="sm" onClick={addMatrixColumn}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Column
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.matrixConfig.columns.map((col, index) => (
                      <div key={col.id} className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <Input
                          value={col.label}
                          onChange={(e) => {
                            const newCols = formData.matrixConfig.columns.map((c) =>
                              c.id === col.id ? { ...c, label: e.target.value } : c
                            )
                            setFormData({
                              ...formData,
                              matrixConfig: { ...formData.matrixConfig, columns: newCols },
                            })
                          }}
                          placeholder={`Column ${index + 1}`}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newCols = formData.matrixConfig.columns.filter((c) => c.id !== col.id)
                            setFormData({
                              ...formData,
                              matrixConfig: { ...formData.matrixConfig, columns: newCols },
                            })
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {(formData.type === "OPEN_TEXT" || formData.type === "NUMERIC" || formData.type === "DATE") && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  {formData.type === "OPEN_TEXT" && "Open text questions don't require additional options."}
                  {formData.type === "NUMERIC" && "Numeric questions accept any number. Configure validation rules in the Validation tab."}
                  {formData.type === "DATE" && "Date questions use a date picker. No additional options needed."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Validation Rules</CardTitle>
              <CardDescription>Set constraints and validation for responses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(formData.type === "OPEN_TEXT" || formData.type === "NUMERIC") && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minLength">Minimum Length</Label>
                      <Input
                        id="minLength"
                        type="number"
                        value={formData.validationRules.minLength || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            validationRules: {
                              ...formData.validationRules,
                              minLength: e.target.value ? parseInt(e.target.value) : undefined,
                            },
                          })
                        }
                        placeholder="No minimum"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxLength">Maximum Length</Label>
                      <Input
                        id="maxLength"
                        type="number"
                        value={formData.validationRules.maxLength || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            validationRules: {
                              ...formData.validationRules,
                              maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                            },
                          })
                        }
                        placeholder="No maximum"
                      />
                    </div>
                  </div>
                  {formData.type === "OPEN_TEXT" && (
                    <div className="space-y-2">
                      <Label htmlFor="pattern">Pattern (Regex)</Label>
                      <Input
                        id="pattern"
                        value={formData.validationRules.pattern || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            validationRules: {
                              ...formData.validationRules,
                              pattern: e.target.value || undefined,
                            },
                          })
                        }
                        placeholder="e.g., ^[A-Z]{2}$"
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        Optional regex pattern for validation
                      </p>
                    </div>
                  )}
                </>
              )}

              {formData.type === "NUMERIC" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minValue">Minimum Value</Label>
                    <Input
                      id="minValue"
                      type="number"
                      value={formData.validationRules.min || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          validationRules: {
                            ...formData.validationRules,
                            min: e.target.value ? parseFloat(e.target.value) : undefined,
                          },
                        })
                      }
                      placeholder="No minimum"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxValue">Maximum Value</Label>
                    <Input
                      id="maxValue"
                      type="number"
                      value={formData.validationRules.max || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          validationRules: {
                            ...formData.validationRules,
                            max: e.target.value ? parseFloat(e.target.value) : undefined,
                          },
                        })
                      }
                      placeholder="No maximum"
                    />
                  </div>
                </div>
              )}

              {formData.type === "MULTI_SELECT" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minSelections">Minimum Selections</Label>
                    <Input
                      id="minSelections"
                      type="number"
                      value={formData.validationRules.minSelections || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          validationRules: {
                            ...formData.validationRules,
                            minSelections: e.target.value ? parseInt(e.target.value) : undefined,
                          },
                        })
                      }
                      placeholder="No minimum"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxSelections">Maximum Selections</Label>
                    <Input
                      id="maxSelections"
                      type="number"
                      value={formData.validationRules.maxSelections || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          validationRules: {
                            ...formData.validationRules,
                            maxSelections: e.target.value ? parseInt(e.target.value) : undefined,
                          },
                        })
                      }
                      placeholder="No maximum"
                    />
                  </div>
                </div>
              )}

              {(formData.type === "SINGLE_SELECT" || formData.type === "SCALE" || formData.type === "DATE" || formData.type === "MATRIX") && (
                <p className="text-sm text-muted-foreground">
                  No additional validation rules available for this question type.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Taxonomy Mapping</CardTitle>
              <CardDescription>Link this question to taxonomy categories for data standardization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxonomyCategory">Taxonomy Category</Label>
                  <Input
                    id="taxonomyCategory"
                    value={formData.taxonomyLinks?.category || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        taxonomyLinks: {
                          ...formData.taxonomyLinks,
                          category: e.target.value || undefined,
                        } as TaxonomyLink,
                      })
                    }
                    placeholder="e.g., demographics"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxonomyAttribute">Taxonomy Attribute</Label>
                  <Input
                    id="taxonomyAttribute"
                    value={formData.taxonomyLinks?.attribute || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        taxonomyLinks: {
                          ...formData.taxonomyLinks,
                          attribute: e.target.value || undefined,
                        } as TaxonomyLink,
                      })
                    }
                    placeholder="e.g., age_group"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Taxonomy mapping enables automatic data standardization and classification
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          {question ? "Save Changes" : "Create Question"}
        </Button>
      </div>
    </div>
  )
}
