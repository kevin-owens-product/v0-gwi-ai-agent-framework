"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, X, Trash2, Calculator, Filter, TrendingUp } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export interface CalculatedField {
  id: string
  name: string
  formula: string
  type: "number" | "percentage" | "index" | "growth"
}

export interface TransformationRule {
  id: string
  type: "aggregate" | "clean" | "transform" | "filter"
  config: unknown
}

interface DataTransformationPipelineProps {
  onTransformationChange: (transformations: TransformationRule[], calculatedFields: CalculatedField[]) => void
  initialTransformations?: TransformationRule[]
  initialCalculatedFields?: CalculatedField[]
}

const AGGREGATION_TYPES = [
  { value: "sum", label: "Sum" },
  { value: "average", label: "Average" },
  { value: "median", label: "Median" },
  { value: "min", label: "Minimum" },
  { value: "max", label: "Maximum" },
  { value: "count", label: "Count" },
  { value: "percentile", label: "Percentile" },
]

const TRANSFORMATION_TYPES = [
  { value: "yoy", label: "Year-over-Year" },
  { value: "qoq", label: "Quarter-over-Quarter" },
  { value: "moving_average", label: "Moving Average" },
  { value: "cumulative", label: "Cumulative Sum" },
  { value: "normalize", label: "Normalize (0-1)" },
  { value: "zscore", label: "Z-Score" },
]

export function DataTransformationPipeline({
  onTransformationChange,
  initialTransformations = [],
  initialCalculatedFields = [],
}: DataTransformationPipelineProps) {
  const [transformations, setTransformations] = useState<TransformationRule[]>(initialTransformations)
  const [calculatedFields, setCalculatedFields] = useState<CalculatedField[]>(initialCalculatedFields)
  const [newFieldName, setNewFieldName] = useState("")
  const [newFieldFormula, setNewFieldFormula] = useState("")
  const [newFieldType, setNewFieldType] = useState<CalculatedField["type"]>("number")

  const addTransformation = (type: TransformationRule["type"]) => {
    const newTransformation: TransformationRule = {
      id: `transformation-${Date.now()}`,
      type,
      config: {},
    }
    const updated = [...transformations, newTransformation]
    setTransformations(updated)
    onTransformationChange(updated, calculatedFields)
  }

  const removeTransformation = (id: string) => {
    const updated = transformations.filter((t) => t.id !== id)
    setTransformations(updated)
    onTransformationChange(updated, calculatedFields)
  }

  const addCalculatedField = () => {
    if (!newFieldName.trim() || !newFieldFormula.trim()) return

    const newField: CalculatedField = {
      id: `field-${Date.now()}`,
      name: newFieldName.trim(),
      formula: newFieldFormula.trim(),
      type: newFieldType,
    }
    const updated = [...calculatedFields, newField]
    setCalculatedFields(updated)
    setNewFieldName("")
    setNewFieldFormula("")
    onTransformationChange(transformations, updated)
  }

  const removeCalculatedField = (id: string) => {
    const updated = calculatedFields.filter((f) => f.id !== id)
    setCalculatedFields(updated)
    onTransformationChange(transformations, updated)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Data Transformation Pipeline
        </CardTitle>
        <CardDescription>
          Transform, aggregate, and calculate fields from your data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="calculated" className="w-full">
          <TabsList>
            <TabsTrigger value="calculated">Calculated Fields</TabsTrigger>
            <TabsTrigger value="transformations">Transformations</TabsTrigger>
            <TabsTrigger value="aggregations">Aggregations</TabsTrigger>
          </TabsList>

          <TabsContent value="calculated" className="space-y-4">
            <div className="space-y-2">
              <Label>Add Calculated Field</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Field name"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="flex-1"
                />
                <Select value={newFieldType} onValueChange={(v) => setNewFieldType(v as CalculatedField["type"])}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="index">Index</SelectItem>
                    <SelectItem value="growth">Growth</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                placeholder="Formula (e.g., [Value1] + [Value2] * 0.5)"
                value={newFieldFormula}
                onChange={(e) => setNewFieldFormula(e.target.value)}
              />
              <Button onClick={addCalculatedField} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Calculated Fields</Label>
              {calculatedFields.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No calculated fields yet
                </p>
              ) : (
                <div className="space-y-2">
                  {calculatedFields.map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between p-2 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{field.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {field.type}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground font-mono mt-1">
                          {field.formula}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCalculatedField(field.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="transformations" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {TRANSFORMATION_TYPES.map((type) => (
                <Button
                  key={type.value}
                  variant="outline"
                  onClick={() => addTransformation("transform")}
                  className="justify-start"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {type.label}
                </Button>
              ))}
            </div>

            {transformations.filter((t) => t.type === "transform").length > 0 && (
              <div className="space-y-2">
                <Label>Active Transformations</Label>
                {transformations
                  .filter((t) => t.type === "transform")
                  .map((transformation) => (
                    <div
                      key={transformation.id}
                      className="flex items-center justify-between p-2 border rounded-lg"
                    >
                      <span className="text-sm">Transformation</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTransformation(transformation.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="aggregations" className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {AGGREGATION_TYPES.map((type) => (
                <Button
                  key={type.value}
                  variant="outline"
                  onClick={() => addTransformation("aggregate")}
                  className="justify-start"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  {type.label}
                </Button>
              ))}
            </div>

            {transformations.filter((t) => t.type === "aggregate").length > 0 && (
              <div className="space-y-2">
                <Label>Active Aggregations</Label>
                {transformations
                  .filter((t) => t.type === "aggregate")
                  .map((transformation) => (
                    <div
                      key={transformation.id}
                      className="flex items-center justify-between p-2 border rounded-lg"
                    >
                      <span className="text-sm">Aggregation</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTransformation(transformation.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
