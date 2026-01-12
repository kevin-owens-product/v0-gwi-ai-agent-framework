"use client"

import { useState, useCallback, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import {
  Calculator,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Play,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Sigma,
  Percent,
  Hash,
  MoreHorizontal,
  Sparkles,
  Save,
  FunctionSquare,
} from "lucide-react"

// Types
export interface CalculatedField {
  id: string
  name: string
  description?: string
  formula: string
  type: "metric" | "dimension" | "filter"
  category?: string
  createdAt: Date
  updatedAt: Date
  isValid: boolean
  errorMessage?: string
  dependencies: string[]
  result?: number | null
}

export interface FieldVariable {
  id: string
  name: string
  label: string
  type: "metric" | "audience" | "constant"
  value?: number
}

export interface FormulaFunction {
  name: string
  description: string
  syntax: string
  example: string
  category: "math" | "statistical" | "logical" | "aggregation"
}

interface CalculatedFieldsManagerProps {
  fields: CalculatedField[]
  availableVariables: FieldVariable[]
  onFieldAdd: (field: CalculatedField) => void
  onFieldUpdate: (id: string, updates: Partial<CalculatedField>) => void
  onFieldDelete: (id: string) => void
  onFieldApply: (field: CalculatedField) => void
  className?: string
}

// Available functions
const FORMULA_FUNCTIONS: FormulaFunction[] = [
  // Math
  { name: "ABS", description: "Returns absolute value", syntax: "ABS(value)", example: "ABS(-5) = 5", category: "math" },
  { name: "ROUND", description: "Rounds to specified decimals", syntax: "ROUND(value, decimals)", example: "ROUND(3.456, 2) = 3.46", category: "math" },
  { name: "FLOOR", description: "Rounds down to integer", syntax: "FLOOR(value)", example: "FLOOR(3.7) = 3", category: "math" },
  { name: "CEIL", description: "Rounds up to integer", syntax: "CEIL(value)", example: "CEIL(3.2) = 4", category: "math" },
  { name: "SQRT", description: "Square root", syntax: "SQRT(value)", example: "SQRT(16) = 4", category: "math" },
  { name: "POWER", description: "Raises to power", syntax: "POWER(base, exp)", example: "POWER(2, 3) = 8", category: "math" },
  { name: "LOG", description: "Natural logarithm", syntax: "LOG(value)", example: "LOG(2.718) ≈ 1", category: "math" },
  { name: "EXP", description: "Exponential (e^x)", syntax: "EXP(value)", example: "EXP(1) ≈ 2.718", category: "math" },
  { name: "MOD", description: "Modulo (remainder)", syntax: "MOD(value, divisor)", example: "MOD(7, 3) = 1", category: "math" },

  // Statistical
  { name: "AVG", description: "Average of values", syntax: "AVG(values...)", example: "AVG(10, 20, 30) = 20", category: "statistical" },
  { name: "SUM", description: "Sum of values", syntax: "SUM(values...)", example: "SUM(1, 2, 3) = 6", category: "statistical" },
  { name: "MIN", description: "Minimum value", syntax: "MIN(values...)", example: "MIN(5, 2, 8) = 2", category: "statistical" },
  { name: "MAX", description: "Maximum value", syntax: "MAX(values...)", example: "MAX(5, 2, 8) = 8", category: "statistical" },
  { name: "COUNT", description: "Count of values", syntax: "COUNT(values...)", example: "COUNT(a, b, c) = 3", category: "statistical" },
  { name: "MEDIAN", description: "Median value", syntax: "MEDIAN(values...)", example: "MEDIAN(1, 3, 5) = 3", category: "statistical" },
  { name: "STDEV", description: "Standard deviation", syntax: "STDEV(values...)", example: "STDEV(2, 4, 4, 4, 5, 5, 7, 9)", category: "statistical" },
  { name: "VARIANCE", description: "Variance of values", syntax: "VARIANCE(values...)", example: "VARIANCE(2, 4, 6)", category: "statistical" },
  { name: "PERCENTILE", description: "Nth percentile", syntax: "PERCENTILE(values, n)", example: "PERCENTILE([1,2,3,4,5], 50) = 3", category: "statistical" },

  // Logical
  { name: "IF", description: "Conditional value", syntax: "IF(condition, true_val, false_val)", example: "IF(A > 50, 'High', 'Low')", category: "logical" },
  { name: "AND", description: "Logical AND", syntax: "AND(cond1, cond2, ...)", example: "AND(A > 0, B > 0)", category: "logical" },
  { name: "OR", description: "Logical OR", syntax: "OR(cond1, cond2, ...)", example: "OR(A > 50, B > 50)", category: "logical" },
  { name: "NOT", description: "Logical NOT", syntax: "NOT(condition)", example: "NOT(A = 0)", category: "logical" },
  { name: "COALESCE", description: "First non-null value", syntax: "COALESCE(val1, val2, ...)", example: "COALESCE(null, 5) = 5", category: "logical" },
  { name: "CASE", description: "Multiple conditions", syntax: "CASE(cond1, val1, cond2, val2, default)", example: "CASE(A>90,'A', A>80,'B', 'C')", category: "logical" },

  // Aggregation
  { name: "INDEX", description: "Index to base value", syntax: "INDEX(value, base)", example: "INDEX(75, 50) = 150", category: "aggregation" },
  { name: "GROWTH", description: "Growth rate", syntax: "GROWTH(current, previous)", example: "GROWTH(120, 100) = 20%", category: "aggregation" },
  { name: "DIFF", description: "Difference from base", syntax: "DIFF(value, base)", example: "DIFF(75, 50) = 25", category: "aggregation" },
  { name: "SHARE", description: "Share of total", syntax: "SHARE(value, total)", example: "SHARE(25, 100) = 25%", category: "aggregation" },
  { name: "RANK", description: "Rank in set", syntax: "RANK(value, values...)", example: "RANK(75, 50, 75, 100) = 2", category: "aggregation" },
  { name: "ZSCORE", description: "Z-score", syntax: "ZSCORE(value, mean, stdev)", example: "ZSCORE(85, 75, 10) = 1", category: "aggregation" },
]

// Pre-built formula templates
const FORMULA_TEMPLATES = [
  {
    name: "Index Calculation",
    description: "Calculate index against a base value",
    formula: "([Target_Metric] / [Base_Metric]) * 100",
    category: "Index",
  },
  {
    name: "Growth Rate",
    description: "Calculate percentage growth between periods",
    formula: "(([Current] - [Previous]) / [Previous]) * 100",
    category: "Growth",
  },
  {
    name: "Net Promoter Score (NPS)",
    description: "Calculate NPS from promoters and detractors",
    formula: "[Promoters] - [Detractors]",
    category: "Survey",
  },
  {
    name: "Weighted Average",
    description: "Calculate weighted average of values",
    formula: "SUM([Value1] * [Weight1], [Value2] * [Weight2]) / SUM([Weight1], [Weight2])",
    category: "Statistical",
  },
  {
    name: "Percentage Point Difference",
    description: "Difference between two percentages",
    formula: "[Metric_A] - [Metric_B]",
    category: "Comparison",
  },
  {
    name: "Share of Voice",
    description: "Calculate share relative to total",
    formula: "([Brand_Mentions] / [Total_Mentions]) * 100",
    category: "Share",
  },
  {
    name: "Conversion Rate",
    description: "Calculate conversion percentage",
    formula: "([Conversions] / [Visitors]) * 100",
    category: "Conversion",
  },
  {
    name: "Year-over-Year Change",
    description: "Compare current to same period last year",
    formula: "(([This_Year] - [Last_Year]) / [Last_Year]) * 100",
    category: "Growth",
  },
]

export function CalculatedFieldsManager({
  fields,
  availableVariables,
  onFieldAdd,
  onFieldUpdate,
  onFieldDelete,
  onFieldApply,
  className,
}: CalculatedFieldsManagerProps) {
  const [showEditor, setShowEditor] = useState(false)
  const [editingField, setEditingField] = useState<CalculatedField | null>(null)
  const [formula, setFormula] = useState("")
  const [fieldName, setFieldName] = useState("")
  const [fieldDescription, setFieldDescription] = useState("")
  const [fieldCategory, setFieldCategory] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)
  const [previewResult, setPreviewResult] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"variables" | "functions" | "templates">("variables")

  // Group fields by category
  const groupedFields = useMemo(() => {
    const groups: Record<string, CalculatedField[]> = {}
    for (const field of fields) {
      const category = field.category || "Uncategorized"
      if (!groups[category]) groups[category] = []
      groups[category].push(field)
    }
    return groups
  }, [fields])

  // Filter variables by search
  const filteredVariables = useMemo(() => {
    if (!searchQuery) return availableVariables
    const query = searchQuery.toLowerCase()
    return availableVariables.filter(v =>
      v.name.toLowerCase().includes(query) ||
      v.label.toLowerCase().includes(query)
    )
  }, [availableVariables, searchQuery])

  // Filter functions by search
  const filteredFunctions = useMemo(() => {
    if (!searchQuery) return FORMULA_FUNCTIONS
    const query = searchQuery.toLowerCase()
    return FORMULA_FUNCTIONS.filter(f =>
      f.name.toLowerCase().includes(query) ||
      f.description.toLowerCase().includes(query)
    )
  }, [searchQuery])

  // Validate formula
  const validateFormula = useCallback((formulaStr: string): { valid: boolean; error?: string } => {
    if (!formulaStr.trim()) {
      return { valid: false, error: "Formula cannot be empty" }
    }

    // Check for balanced brackets
    const brackets = formulaStr.match(/[\[\]\(\)]/g) || []
    let bracketCount = 0
    let parenCount = 0
    for (const b of brackets) {
      if (b === "[") bracketCount++
      if (b === "]") bracketCount--
      if (b === "(") parenCount++
      if (b === ")") parenCount--
      if (bracketCount < 0 || parenCount < 0) {
        return { valid: false, error: "Unbalanced brackets or parentheses" }
      }
    }
    if (bracketCount !== 0 || parenCount !== 0) {
      return { valid: false, error: "Unbalanced brackets or parentheses" }
    }

    // Check for variable references
    const variableRefs = formulaStr.match(/\[([^\]]+)\]/g) || []
    for (const ref of variableRefs) {
      const varName = ref.slice(1, -1)
      const exists = availableVariables.some(v => v.name === varName || v.label === varName)
      if (!exists) {
        return { valid: false, error: `Unknown variable: ${varName}` }
      }
    }

    // Check for function calls
    const functionCalls = formulaStr.match(/([A-Z_]+)\s*\(/g) || []
    for (const call of functionCalls) {
      const funcName = call.replace(/\s*\($/, "")
      const exists = FORMULA_FUNCTIONS.some(f => f.name === funcName)
      if (!exists) {
        return { valid: false, error: `Unknown function: ${funcName}` }
      }
    }

    return { valid: true }
  }, [availableVariables])

  // Calculate preview result
  const calculatePreview = useCallback((formulaStr: string): number | null => {
    try {
      // Replace variable references with sample values
      let expression = formulaStr
      const variableRefs = formulaStr.match(/\[([^\]]+)\]/g) || []
      for (const ref of variableRefs) {
        const varName = ref.slice(1, -1)
        const variable = availableVariables.find(v => v.name === varName || v.label === varName)
        const value = variable?.value ?? Math.random() * 100
        expression = expression.replace(ref, value.toString())
      }

      // Replace function calls with JavaScript equivalents
      expression = expression
        .replace(/AVG\(/gi, "avg(")
        .replace(/SUM\(/gi, "sum(")
        .replace(/MIN\(/gi, "Math.min(")
        .replace(/MAX\(/gi, "Math.max(")
        .replace(/ABS\(/gi, "Math.abs(")
        .replace(/ROUND\(/gi, "round(")
        .replace(/SQRT\(/gi, "Math.sqrt(")
        .replace(/POWER\(/gi, "Math.pow(")
        .replace(/INDEX\(/gi, "index(")

      // Define helper functions
      const avg = (...args: number[]) => args.reduce((a, b) => a + b, 0) / args.length
      const sum = (...args: number[]) => args.reduce((a, b) => a + b, 0)
      const round = (val: number, decimals: number = 0) => Math.round(val * Math.pow(10, decimals)) / Math.pow(10, decimals)
      const index = (val: number, base: number) => (val / base) * 100

      // Evaluate (this is simplified - in production, use a proper expression parser)
       
      const result = new Function("avg", "sum", "round", "index", `return ${expression}`)(avg, sum, round, index)
      return typeof result === "number" && !isNaN(result) ? result : null
    } catch {
      return null
    }
  }, [availableVariables])

  // Handle formula change
  const handleFormulaChange = useCallback((newFormula: string) => {
    setFormula(newFormula)
    const validation = validateFormula(newFormula)
    setValidationError(validation.error || null)
    if (validation.valid) {
      setPreviewResult(calculatePreview(newFormula))
    } else {
      setPreviewResult(null)
    }
  }, [validateFormula, calculatePreview])

  // Insert variable into formula
  const insertVariable = useCallback((variable: FieldVariable) => {
    const insertion = `[${variable.name}]`
    setFormula(prev => prev + insertion)
    handleFormulaChange(formula + insertion)
  }, [formula, handleFormulaChange])

  // Insert function into formula
  const insertFunction = useCallback((func: FormulaFunction) => {
    const insertion = `${func.name}()`
    setFormula(prev => prev + insertion)
    handleFormulaChange(formula + insertion)
  }, [formula, handleFormulaChange])

  // Apply template
  const applyTemplate = useCallback((template: typeof FORMULA_TEMPLATES[0]) => {
    setFormula(template.formula)
    setFieldName(template.name)
    setFieldDescription(template.description)
    setFieldCategory(template.category)
    handleFormulaChange(template.formula)
  }, [handleFormulaChange])

  // Save field
  const handleSave = useCallback(() => {
    const validation = validateFormula(formula)
    if (!validation.valid) {
      setValidationError(validation.error || "Invalid formula")
      return
    }

    // Extract dependencies from formula
    const deps = (formula.match(/\[([^\]]+)\]/g) || []).map(ref => ref.slice(1, -1))

    const field: CalculatedField = {
      id: editingField?.id || crypto.randomUUID(),
      name: fieldName || "Unnamed Field",
      description: fieldDescription,
      formula,
      type: "metric",
      category: fieldCategory || undefined,
      createdAt: editingField?.createdAt || new Date(),
      updatedAt: new Date(),
      isValid: true,
      dependencies: deps,
      result: previewResult,
    }

    if (editingField) {
      onFieldUpdate(editingField.id, field)
    } else {
      onFieldAdd(field)
    }

    // Reset form
    setShowEditor(false)
    setEditingField(null)
    setFormula("")
    setFieldName("")
    setFieldDescription("")
    setFieldCategory("")
    setValidationError(null)
    setPreviewResult(null)
  }, [formula, fieldName, fieldDescription, fieldCategory, previewResult, editingField, validateFormula, onFieldAdd, onFieldUpdate])

  // Edit existing field
  const handleEdit = useCallback((field: CalculatedField) => {
    setEditingField(field)
    setFormula(field.formula)
    setFieldName(field.name)
    setFieldDescription(field.description || "")
    setFieldCategory(field.category || "")
    handleFormulaChange(field.formula)
    setShowEditor(true)
  }, [handleFormulaChange])

  // Duplicate field
  const handleDuplicate = useCallback((field: CalculatedField) => {
    const newField: CalculatedField = {
      ...field,
      id: crypto.randomUUID(),
      name: `${field.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    onFieldAdd(newField)
  }, [onFieldAdd])

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Calculated Fields</h3>
          <p className="text-sm text-muted-foreground">Create custom metrics using formulas</p>
        </div>
        <Button onClick={() => {
          setEditingField(null)
          setFormula("")
          setFieldName("")
          setFieldDescription("")
          setFieldCategory("")
          setValidationError(null)
          setPreviewResult(null)
          setShowEditor(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          New Calculated Field
        </Button>
      </div>

      {/* Existing Fields */}
      {fields.length > 0 ? (
        <Accordion type="single" collapsible className="w-full">
          {Object.entries(groupedFields).map(([category, categoryFields]) => (
            <AccordionItem key={category} value={category}>
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  {category}
                  <Badge variant="secondary" className="text-xs">{categoryFields.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {categoryFields.map(field => (
                    <Card key={field.id} className={cn("p-3", !field.isValid && "border-destructive")}>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{field.name}</span>
                            {field.isValid ? (
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                            ) : (
                              <AlertCircle className="h-3 w-3 text-destructive" />
                            )}
                          </div>
                          {field.description && (
                            <p className="text-xs text-muted-foreground">{field.description}</p>
                          )}
                          <code className="text-xs bg-muted px-2 py-1 rounded block mt-1">
                            {field.formula}
                          </code>
                          {field.result !== null && field.result !== undefined && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Preview: <span className="font-mono">{field.result.toFixed(2)}</span>
                            </p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onFieldApply(field)}>
                              <Play className="h-4 w-4 mr-2" />
                              Apply to Grid
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(field)}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(field)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => onFieldDelete(field.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Card className="p-8 text-center">
          <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="font-medium mb-2">No calculated fields yet</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Create custom metrics using formulas to derive new insights from your data
          </p>
          <Button onClick={() => setShowEditor(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Field
          </Button>
        </Card>
      )}

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingField ? "Edit Calculated Field" : "Create Calculated Field"}
            </DialogTitle>
            <DialogDescription>
              Define a formula to create a new metric from existing data
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden grid grid-cols-2 gap-4">
            {/* Formula Editor (Left) */}
            <div className="space-y-4 overflow-auto pr-2">
              <div className="space-y-2">
                <Label>Field Name</Label>
                <Input
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  placeholder="e.g., Net Promoter Score"
                />
              </div>

              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  value={fieldDescription}
                  onChange={(e) => setFieldDescription(e.target.value)}
                  placeholder="Describe what this field calculates..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Category (optional)</Label>
                <Input
                  value={fieldCategory}
                  onChange={(e) => setFieldCategory(e.target.value)}
                  placeholder="e.g., Survey Metrics"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Formula</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Use [Variable] to reference metrics and audiences.</p>
                        <p className="mt-1">Use functions like AVG(), SUM(), INDEX() for calculations.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  value={formula}
                  onChange={(e) => handleFormulaChange(e.target.value)}
                  placeholder="e.g., ([Promoters] - [Detractors]) / [Total_Respondents] * 100"
                  className={cn(
                    "font-mono text-sm",
                    validationError && "border-destructive"
                  )}
                  rows={4}
                />
                {validationError && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {validationError}
                  </div>
                )}
                {previewResult !== null && !validationError && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Preview result: <span className="font-mono font-medium">{previewResult.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Quick operators */}
              <div className="flex flex-wrap gap-1">
                {["+", "-", "*", "/", "(", ")", "[", "]", ","].map(op => (
                  <Button
                    key={op}
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0 font-mono"
                    onClick={() => {
                      setFormula(prev => prev + op)
                      handleFormulaChange(formula + op)
                    }}
                  >
                    {op}
                  </Button>
                ))}
              </div>
            </div>

            {/* Variables & Functions (Right) */}
            <div className="overflow-hidden border rounded-lg">
              <div className="p-2 border-b">
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8"
                />
              </div>

              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="w-full grid grid-cols-3 rounded-none border-b">
                  <TabsTrigger value="variables">Variables</TabsTrigger>
                  <TabsTrigger value="functions">Functions</TabsTrigger>
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                </TabsList>

                <ScrollArea className="h-64">
                  <TabsContent value="variables" className="mt-0 p-2">
                    <div className="space-y-1">
                      {filteredVariables.map(variable => (
                        <button
                          key={variable.id}
                          className="w-full text-left px-3 py-2 rounded hover:bg-muted flex items-center justify-between group"
                          onClick={() => insertVariable(variable)}
                        >
                          <div className="flex items-center gap-2">
                            {variable.type === "metric" ? (
                              <Hash className="h-4 w-4 text-blue-500" />
                            ) : variable.type === "audience" ? (
                              <Percent className="h-4 w-4 text-green-500" />
                            ) : (
                              <Sigma className="h-4 w-4 text-purple-500" />
                            )}
                            <div>
                              <div className="text-sm font-medium">{variable.label}</div>
                              <div className="text-xs text-muted-foreground">{variable.name}</div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs opacity-0 group-hover:opacity-100">
                            Insert
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="functions" className="mt-0 p-2">
                    {["math", "statistical", "logical", "aggregation"].map(category => {
                      const funcs = filteredFunctions.filter(f => f.category === category)
                      if (funcs.length === 0) return null
                      return (
                        <div key={category} className="mb-4">
                          <h4 className="text-xs font-medium uppercase text-muted-foreground px-2 mb-1">
                            {category}
                          </h4>
                          <div className="space-y-1">
                            {funcs.map(func => (
                              <TooltipProvider key={func.name}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      className="w-full text-left px-3 py-2 rounded hover:bg-muted flex items-center justify-between group"
                                      onClick={() => insertFunction(func)}
                                    >
                                      <div className="flex items-center gap-2">
                                        <FunctionSquare className="h-4 w-4 text-orange-500" />
                                        <div>
                                          <div className="text-sm font-mono">{func.name}</div>
                                          <div className="text-xs text-muted-foreground truncate max-w-48">
                                            {func.description}
                                          </div>
                                        </div>
                                      </div>
                                      <Badge variant="outline" className="text-xs opacity-0 group-hover:opacity-100">
                                        Insert
                                      </Badge>
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="left" className="max-w-xs">
                                    <p className="font-mono text-xs">{func.syntax}</p>
                                    <p className="text-xs mt-1">Example: {func.example}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </TabsContent>

                  <TabsContent value="templates" className="mt-0 p-2">
                    <div className="space-y-2">
                      {FORMULA_TEMPLATES.map((template, index) => (
                        <button
                          key={index}
                          className="w-full text-left p-3 rounded border hover:border-primary hover:bg-muted/50 transition-colors"
                          onClick={() => applyTemplate(template)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium text-sm">{template.name}</span>
                            <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                          <code className="text-xs bg-muted px-2 py-1 rounded block">
                            {template.formula}
                          </code>
                        </button>
                      ))}
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setShowEditor(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!!validationError || !formula.trim()}>
              <Save className="h-4 w-4 mr-2" />
              {editingField ? "Update Field" : "Create Field"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
